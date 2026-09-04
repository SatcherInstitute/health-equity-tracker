# Server

Combined Go HTTP server. A single binary and a single Docker image (~15 MB) serves:

- React static files with correct Cache-Control headers and SPA fallback
- GCS dataset and metadata endpoints
- AI insight generation (direct Gemini API call, no proxy hop) with usage budgets,
  driven by a server-rendered view descriptor
- Insight cache and flagging (direct GCS reads/writes — no inter-service HTTP)
- Webflow news feed with TTL cache
- Admin insight management (requires `Authorization: Bearer $ADMIN_TOKEN`)

## Commands

```bash
# Run locally (from server/ directory)
go run .

# Build and run
go build -o server . && ./server

# Run tests
go test ./...
```

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GCS_BUCKET` | Yes | - | GCS bucket for dataset files |
| `METADATA_FILENAME` | Yes | - | Filename of the metadata NDJSON in GCS |
| `INSIGHTS_CACHE_BUCKET` | No | - | GCS bucket for persisted AI insight cache |
| `FLAGGED_INSIGHTS_BUCKET` | No | - | GCS bucket for flagged insight records |
| `ADMIN_TOKEN` | No | - | Bearer token for admin routes (`/flagged-insights`) |
| `GEMINI_API_KEY` | No | - | Required for AI insight generation. Unset disables generation; cached insights still serve |
| `GEMINI_MODEL` | No | `gemini-3.1-flash-lite` | Gemini model used for insight generation |
| `INSIGHT_MAX_GENERATIONS_PER_DAY` | No | `300` | Daily generation ceiling, tracked in the usage ledger. See [Ceiling sizing](#ceiling-sizing) before changing |
| `INSIGHT_MAX_GENERATIONS_PER_MONTH` | No | `6000` | Monthly generation ceiling, tracked in the usage ledger. See [Ceiling sizing](#ceiling-sizing) before changing |
| `INSIGHT_CEILING_WARN_PERCENT` | No | `80` | Share of a ceiling at which a `ceiling_approaching` warning is logged. Must be `1`-`100`; anything else falls back to the default |
| `INSIGHT_ALLOWED_ORIGINS` | No | prod, www, dev, `localhost:3000`, `*.netlify.app` | Comma-separated origins permitted to request generation |
| `WEBFLOW_API_TOKEN` | No | - | Required for `/het-news` |
| `INSIGHT_NEGATIVE_EXAMPLES_ENABLED` | No | `false` | Feed prior flagged outputs back into prompts |
| `STATIC_DIR` | No | `/static` | Directory containing the React build |
| `PORT` | No | `8080` | HTTP listen port |

## How it works

The server handles all traffic on a single port:

- **Data requests** (`/dataset`, `/metadata`): served from GCS via a 150 MB byte-aware LRU
  cache with a 2-hour TTL. NDJSON files are converted to JSON arrays on the fly.
- **AI insights** (`/insight`): the caller posts what the view is showing (kind, hash ID,
  topic, location, metric configs, rendered rows, URL pathname and params). The server renders
  the prompt from those templates, derives the cache key from the rendered text, then checks a
  `sync.Map` in-process cache, then the GCS persistent cache, then calls the Gemini API
  directly and writes back to GCS. Wording and key derivation live in one place: a template
  edit takes effect without a client deploy, and a client cannot mint a key that disagrees with
  the prompt it is for. Generation is metered before the call against daily and monthly ledgers
  under `budget/` in the insights cache bucket, updated by compare-and-swap. Two runtime kill
  switches live in the same bucket as GCS objects; their existence, not their content, is what
  the server reads, memoized for up to 60 seconds per instance:

  | Object | Checked | Effect | Failure mode |
  |---|---|---|---|
  | `insights-generation-disabled` | after cache lookups | Stops new generation; cached insights keep serving | Fails **closed** — a read error keeps generation off |
  | `insights-serving-disabled` | before suppression and both caches | Stops all serving (cached and fresh) | Fails **open** — a read error does not hide a working feature |

  Use `scripts/review_flagged_insights.sh --disable-serving` for a content emergency,
  `--disable-generation` for quota pressure. Both switches are exercised by `--switch-status`.
  When a ceiling is reached, the ledger cannot be written, or either kill switch is set,
  the endpoint returns `{"unavailable": true}` and the frontend renders no insight section. The route is scoped to the origins in `INSIGHT_ALLOWED_ORIGINS` and rate limited per
  client. `{"preview": true}` stops after rendering and returns `{"cacheKey","prompt"}` without
  consulting the cache, reserving a slot, or calling the provider, which is how a client checks
  the server renders the text it expects. The generating path returns `{"content","cacheKey"}`;
  the key rides along because flagging needs it, and the prompt does not because it is up to
  30 KB the client has no use for. `content` is the JSON envelope described below, not a
  bare sentence.
- **Flagging** (`/flag-insight`): writes a flag record to GCS, deletes the cached insight, and
  clears the in-process `sync.Map` entry — all in the same process with no HTTP hops.
- **News** (`/het-news`): fetches from the Webflow CDN API with a 5-minute TTL cache (tags
  cached for 1 hour). Serves stale data on upstream errors.
- **Static files**: served from `STATIC_DIR` with proper `Cache-Control` headers:
  - `/assets/*` — `immutable` (Vite fingerprints filenames with content hashes)
  - `index.html` — `no-store` (shell must always be fresh)
  - Everything else — `public, max-age=7200`
  - Unknown paths → `index.html` (SPA client-side routing fallback)

## Insight request logs

Every `/insight` request emits exactly one JSON line to stdout, which Cloud Run ships to
Cloud Logging as a structured payload under `jsonPayload.insight`. That
line is the only reporting surface for this feature. **The usage ledger is not a
reporting surface**: `reserveGeneration` writes it before the provider call so it can
refuse a generation, and it stays write-only. Cache hits in particular must never be
routed through it, since `mutateLedger` is a compare-and-swap against a single GCS
object and hits are the hot path.

```json
{"severity":"INFO","message":"insight generated","insight":{
  "outcome":"generated","cacheKey":"a1b2c3","topic":"hiv","reserved":true,
  "model":"gemini-3.1-flash-lite","promptTokens":1840,"outputTokens":96,
  "dailyGenerations":42,"dailyLimit":300,
  "monthlyGenerations":903,"monthlyLimit":6000,"durationMs":812}}
```

`outcome` is one of:

| Outcome | Meaning |
|---|---|
| `memory_hit` | Served from the in-process `sync.Map` |
| `gcs_hit` | Served from the GCS persistent cache |
| `generated` | Called the provider. Carries `model` and token counts |
| `unavailable` | No insight shown. `reason` says which gate closed |
| `suppressed` | A reviewer suppressed this exact insight |
| `rejected` | Malformed request (missing, invalid, or oversize prompt or descriptor) |
| `preview` | A descriptor rendered to a prompt and key with nothing generated. Consults no cache and reserves nothing, so it counts toward neither hit rate nor volume |
| `error` | Provider or suppression-check failure |
| `unknown` | The handler returned without classifying the request. Always a bug |
| `ceiling_approaching` | Not a request. See the alert below |

`reason` narrows the non-serving outcomes: `serving_disabled`, `ceiling_reached`,
`generation_disabled`, `no_api_key`, `no_cache_bucket`, `ledger_error`, `no_content`,
`malformed_response`, `provider_quota`, `provider_error`, `suppression_check`,
`prompt_too_large`, `invalid_descriptor`.

`reserved` is true when the request claimed a slot against the ceilings. **This is not
the same as `outcome="generated"`**, and the difference is what makes the volume query
below correct. `reserveGeneration` claims the slot *before* the provider call, so a
call that then fails still spent one: a provider error or an empty response logs
`error` or `unavailable` while having consumed ceiling budget. Counting only
`generated` would undercount the ceilings by exactly the failure rate.

`model` marks a request that reached the provider, not one that succeeded, so it is
present on `provider_error` and `no_content` lines too. Group by it, but never use its
presence as a stand-in for a successful generation: `outcome` and `reserved` are the
fields that answer that.

**These strings are an interface.** The queries below and the alert filter match on
them literally, so renaming one silently returns fewer rows rather than failing.
`TestInsightRequestLogRecordsEveryOutcome` pins the `/insight` outcomes and reasons
along with each one's severity and `reserved` value; `TestInsightHandlerLogOutcomes`
pins `preview` and `invalid_descriptor`.

### Queries

The Cloud Run service is named `frontend-service`, not `het-server` (see the domain
mapping note in `config/run.tf`). All three queries share this prefix:

```bash
PROJECT=$(gcloud projects list --filter='name~het-infra-prod' --format='value(projectId)')
FILTER='resource.type="cloud_run_revision"
resource.labels.service_name="frontend-service"'
```

**Generation volume and tokens this month.** Filter on `reserved`, not on
`outcome="generated"`, so failed provider calls that still consumed ceiling budget are
counted. Reservations are the reliable number: `reserveGeneration` claims a slot before
the call and cannot lose one. Tokens are approximate, because `recordTokenUsage` is
deliberately best-effort and swallows errors, so treat them as refining the
per-generation average rather than as a total.

```bash
# reserveGeneration keys the monthly ledger on the provider's quota calendar, so
# the window has to be on it too. A rolling --freshness=30d would straddle two of
# them and could not be compared against the monthly counter or the ceiling; a
# UTC month would be off by the Pacific offset at both ends. python3 is used
# rather than date because the offset changes with daylight saving, and it emits
# the colon form gcloud expects.
MONTH_START=$(python3 -c "
from datetime import datetime
from zoneinfo import ZoneInfo
now = datetime.now(ZoneInfo('America/Los_Angeles'))
print(now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat())
")

gcloud logging read "$FILTER jsonPayload.insight.reserved=true timestamp>=\"$MONTH_START\"" \
  --project "$PROJECT" \
  --format='value(jsonPayload.insight.outcome,jsonPayload.insight.promptTokens,jsonPayload.insight.outputTokens)' \
| awk -F'\t' '{n++; if ($1=="generated") s++; i+=$2; o+=$3}
       END {print n" reservations ("s" produced an insight), "i" input tokens, "o" output tokens"}'
```

Two details that are easy to get wrong here:

- `--freshness` is dropped on purpose, not forgotten. It applies only to filters with
  no timestamp restriction, so leaving it alongside one is misleading rather than
  additive.
- `-F'\t'` is load-bearing: `value()` emits tab-separated fields, and a zero token
  count is omitted from the JSON entirely, so under awk's default whitespace splitting
  the empty field would collapse and shift every column after it.

The gap between the two counts is reservations that produced no insight, and it is
ceiling budget spent on nothing. Group the gap by `reason` before reading anything into
it: `provider_error`, `provider_quota`, and `no_content` are provider failures, while
`unknown` is a bug in the handler and means an outcome went unset. A widening gap is
worth chasing on its own.

Cross-check against the ledger without reading GCS: the newest line's
`dailyGenerations` and `monthlyGenerations` are the ledger's own counters at that
moment, and now cover the same window as the query, so `monthlyGenerations` and the
reservation count should agree. A persistent gap means log entries aged out of the
default 30-day retention, which a 31-day month will always clip slightly, so trust the
counter over the query when they disagree.

One other source of drift, visible only near the monthly cap: `reserveGeneration`
claims the daily slot before the monthly one, so a request the monthly ceiling refuses
logs `reserved=false` after already consuming a daily slot. The daily counter can
therefore sit slightly above what the reservation query returns.

Spend is $0 while the project is on the provider's free tier, so the tokens are read
as quota headroom rather than dollars. They are recorded per line with the model that
produced them so that a move to a paid tier, or a `GEMINI_MODEL` change, needs no code
change to price: group by `jsonPayload.insight.model` and apply that model's published
input and output rates. Never apply a single blended rate, since input and output
price differently and the model is configurable.

**Cache hit rate.** This is the dominant factor in what the feature costs, and the
reason steady-state cost approaches zero.

```bash
gcloud logging read \
  "$FILTER jsonPayload.insight.outcome=(\"memory_hit\" OR \"gcs_hit\" OR \"generated\")" \
  --project "$PROJECT" --freshness=7d \
  --format='value(jsonPayload.insight.outcome)' | sort | uniq -c
```

Hit rate is `(memory_hit + gcs_hit) / (memory_hit + gcs_hit + generated)`. Those three
outcomes are the whole denominator on purpose: `suppressed` and `rejected` requests
never consulted the cache, so counting them would understate the rate.

**Ceiling events.** Every request refused for hitting a cap, plus the threshold crossing:

```bash
gcloud logging read \
  "$FILTER (jsonPayload.insight.reason=\"ceiling_reached\" OR jsonPayload.insight.outcome=\"ceiling_approaching\")" \
  --project "$PROJECT" --freshness=30d --format='value(timestamp,jsonPayload.message)'
```

### Ceiling sizing

The ceilings are a quota and abuse guard, not a cost control. Generation runs on the
provider's free tier, so marginal spend is zero and there is no dollar figure to work
back from. What constrains them is the provider's own quota and the share of traffic the
cache does not absorb.

**Provider quota.** Free-tier limits are granted per project per model, not per API key,
and are readable from the Service Usage API rather than from the public docs, which no
longer publish a table:

```bash
# Quota is granted per project, so this must be the project that issues
# gemini-api-key, not a HET service project. List the candidates with
# `gcloud projects list --filter='projectId~^gen-lang-client'` and confirm which
# one the secret's key belongs to before trusting the numbers.
GEN_LANG_PROJECT=<project that issues gemini-api-key>

TOKEN=$(gcloud auth print-access-token)
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://serviceusage.googleapis.com/v1beta1/projects/$GEN_LANG_PROJECT/services/generativelanguage.googleapis.com/consumerQuotaMetrics?pageSize=500" \
| jq -r '(.metrics//[])[] | .displayName as $d | (.consumerQuotaLimits//[])[] | .unit as $u
         | (.quotaBuckets//[])[] | select(.dimensions.model == "gemini-3.1-flash-lite")
         | "\($d) | \($u) | \(.effectiveLimit)"'
```

For `gemini-3.1-flash-lite` on the free tier that returns 15 requests per minute, 500 per
day, and 250,000 input tokens per minute. Re-read it after any `GEMINI_MODEL` change: the
limits are per model and differ sharply between them, and a project that gains a billing
account moves to paid-tier limits roughly two orders of magnitude higher, at which point
these ceilings are sized against the wrong numbers.

**Requests bind before tokens.** Measured prompts average about 3,200 input tokens and
peak near 9,400. Even at the full 15 requests a minute, the worst case is roughly 141,000
input tokens a minute against a 250,000 allowance, so the token limit is not reachable
through this path. Size against request counts and treat tokens as headroom.

**Traffic.** Thirty days of dev traffic recorded 481 memory hits, 391 GCS hits and 76
generations: a 92% hit rate, against a busiest day of 59 generations. Generation volume
tracks distinct views opened multiplied by data changed since they were last opened, not
pageviews, so the hit rate is what keeps steady-state volume near zero and is the number
to re-measure before revisiting any of this.

Read that 92% as an upper bound rather than a forecast. Dev traffic is mostly the team
reopening a small set of views, which is the pattern that flatters a cache most. Real
users spread across many more topic, geography and demographic combinations, so the
production hit rate should be expected lower and the generations per pageview higher.
Re-measure it from production logs once generation is enabled there, and treat the
ceilings below as provisional until that number exists.

**The numbers.** A daily ceiling of 300 sits below the provider's 500 so that the limit
reached first is this one. That ordering is the whole point. A reservation is claimed
before the provider call and is not released when the call fails, so once the provider is
the limit reached first, its rejections consume ledger slots and return nothing and the
daily count stops resembling insights produced. Our ceiling binding first is what keeps
exhaustion a graceful cached-only path.

The comparison only holds because both sides count the same day. `ledgerPeriods` keys
each period on the provider's quota calendar, `America/Los_Angeles`, which is where the
provider resets requests-per-day. Keying in UTC put a UTC day at 17:00 PT to 17:00 PT, so
one provider day straddled two ledger days and could draw a full allowance from each,
putting up to twice the ceiling inside a single quota day. `TestLedgerPeriodsUseProviderQuotaCalendar`
pins instants on both sides of that boundary, in daylight and standard
time, so the alignment cannot regress quietly.

Three hundred rather than any other value below 500 is a judgment, not a derivation. It
leaves room for a second environment drawing on the same project's allowance, for
retries, and for the unguarded per-minute axis described below. Raise it once production
has its own Generative Language project (#5201) and the per-minute guard has landed
(#5168); until then the distance from the provider's limit is doing real work. At the
measured 92% hit rate, 300 generations supports roughly 3,700 insight requests in a day,
and covers the busiest observed dev day five times over.

A monthly ceiling of 6,000 is the backstop behind the daily one, and the two cross at an
average of 194 a day. Below that the daily ceiling is what any single day meets; above it
the monthly binds first, after twenty full-cap days, and the rest of the month serves
cached insights only. That crossover is the number to watch, not the ceiling itself.

Nothing measured here speaks to the monthly figure, because the provider publishes no
monthly quota and spend is zero, so the only thing it guards is a sustained pattern that
stays under the daily ceiling for a whole month. The `ceiling_approaching` alert is what
surfaces that; blocking on it adds nothing the alert did not already say, and the block is
the more expensive of the two, because exhausting a month goes dark for weeks where
exhausting a day goes dark at the next quota reset. If production ever settles above 194 a
day, raise the monthly rather than let it become the routine limit — it is meant to catch
an anomaly, not to meter normal traffic.

**Two things these numbers do not cover.**

A cold cache. Both figures assume a warm cache, and production's starts empty, so the
early hit rate is far below 92% and the daily ceiling is reachable on launch day. The
provider's 500 a day is a hard wall on how fast a cold cache can be filled, whatever this
ceiling says.

A burst. Neither ceiling constrains the per-minute axis, and the service has no
service-wide per-minute guard, so the provider's 15 a minute can be reached while the day
is barely spent. That gap is tracked separately in #5168.

**Lead time on the warning.** At `INSIGHT_CEILING_WARN_PERCENT` of 80, the daily alert
fires with 60 generations left. Against ordinary traffic that is hours of warning and
behaves as intended. Against a burst it is about four minutes, but no threshold fixes
that: at 15 requests a minute even a 50% threshold buys ten. The percent is the right
lever for drift and the wrong one for bursts, which is why 80 stays.

### Ceiling alert

`ceiling_approaching` fires once per period, on the single request whose count lands on
`INSIGHT_CEILING_WARN_PERCENT` of the ceiling. The ledger's compare-and-swap hands out
each count exactly once, so it cannot double-fire across Cloud Run instances and cannot
degrade into a line per request for the rest of the period.

Because the signal is a single exact count, a percent outside `1`-`100` would put the
threshold where no count can reach it and turn the alert off with no error, so an
out-of-range value is ignored in favor of the default. The threshold is also not wired
through Terraform on purpose: `terraform apply` rolls a new revision anyway, so an env
var would not buy a deploy-free way to change it.

A daily ceiling needs a real-time signal. The weekly `cronReviewFlaggedInsights.yml` is
too coarse for it: a Tuesday overrun would not surface until the following Monday, long
after uncached views had stopped showing insights.

Create the log-based alert once per project, against this filter:

```plaintext
resource.type="cloud_run_revision"
resource.labels.service_name="frontend-service"
jsonPayload.insight.outcome="ceiling_approaching"
```

```bash
# Pick the channel to notify, then create the policy. The heredoc is unquoted so
# CHANNEL and PROJECT expand; a quoted <<'YAML' would post the literal names and
# the policy would be created with no working notification target.
CHANNEL=$(gcloud alpha monitoring channels list --project "$PROJECT" \
  --format='value(name)' --limit=1)

gcloud alpha monitoring policies create --project "$PROJECT" --policy-from-file=- <<YAML
displayName: Insight generation ceiling approaching
combiner: OR
conditions:
  - displayName: Insight generation ceiling warn threshold reached
    conditionMatchedLog:
      filter: >-
        resource.type="cloud_run_revision"
        resource.labels.service_name="frontend-service"
        jsonPayload.insight.outcome="ceiling_approaching"
alertStrategy:
  notificationRateLimit:
    period: 3600s
notificationChannels:
  - $CHANNEL
YAML
```

`gcloud alpha monitoring channels list` returns the full
`projects/<project>/notificationChannels/<id>` resource name, which is the form the
policy wants. Confirm it is the channel the team actually watches before creating the
policy; `--limit=1` just takes the first one.

Alerting on `ceiling_approaching` rather than on `ceiling_reached` is the point: by the
time reservations are being refused, uncached views are already rendering no insight
section. Raising `INSIGHT_MAX_GENERATIONS_PER_DAY` is the immediate lever.

## Insight response envelope

Every surface returns the same shape: a JSON object of section key to
`{text, highlight}`. A card or contrast carries one section under `insight`; a report
carries `keyFindings`, `locationComparison`, `demographicInsights`, and `whatThisMeans`.
`highlight` is the one phrase to draw the reader's eye, and the client underlines that
exact run of characters inside `text`.

`normalizeInsightResponse` in `insight_response.go` repairs whatever the model returned
into that shape once, before the response is served or cached, so a shape the model only
occasionally gets wrong cannot persist for the full TTL. It strips code fences, coerces a
bare string section to `{text}`, and **drops a highlight that is not a verbatim substring
of its own `text`**, is whitespace-only, or covers the whole sentence — a wrong underline
is worse than none.

Failure is asymmetric on purpose. A card or contrast always resolves: a response that fails to parse
falls back to `{"insight":{"text":<raw>}}`, losing the highlight and nothing
else. A report cannot, since there is no way to split one string into four sections, so
it logs `unavailable` / `malformed_response` and **is not cached**, the same reasoning
that keeps an empty response out of the cache.

Cached entries are served as stored, never re-normalized. The cache key is a hash of the
rendered prompt and the envelope shipped as a prompt edit, so no pre-envelope entry is
reachable.

## Insight cache keys

A key is the URL pathname, `?`, the query params, the view scope (`#<hashId>` for a
card, `#<hashId>-2` for its compare twin, `#<hashId>-contrast`, empty for a report),
`-`, and an FNV-1a-32 hash of the rendered prompt. The server is the only place that
builds it. The browser posts a descriptor and gets the key back on the response, where
it is used solely for flagging; `buildInsightCacheKey` once mirrored this logic
client-side and no longer exists.

Two details are still load-bearing, but for the cache rather than for client parity.
Every already-cached insight was keyed with them, so changing either silently displaces
the whole cache instead of failing.

- **The hash runs over UTF-16 code units, not UTF-8 bytes**, inherited from the
  browser's `charCodeAt(i)` iteration. The peer-median line carries a U+2013 en dash,
  so byte iteration would change the key for every map card with a peer comparison. Go
  gets there via `utf16.Encode([]rune(text))`. `TestFNV1a32MatchesBrowser` pins the
  hashes, including an en dash and an astral-plane surrogate pair.
- **The params string is opaque text and must never be parsed and re-encoded.**
  `URLSearchParams.toString()` preserves insertion order; Go's `url.Values.Encode()`
  sorts. So `stripReportInsightParam` edits the string directly.

**Invalidation is automatic, which is why there is no flush tool.** The rendered prompt
carries both the template wording and the data rows, so a template edit or a data
refresh mints new keys on its own: the orphaned entries become unreachable and the
bucket's 210-day TTL sweeps them. A single bad insight is handled by flagging and
suppression, which deletes that one key directly.

The gap to watch is a change that alters output *without* altering rendered prompt text,
such as a `GEMINI_MODEL` swap or new `normalizeInsightResponse` rules, since cached
entries are served as stored and never re-normalized. Bundle a prompt edit with such a
change to force new keys, the way the response-envelope change did.

## Insight prompt fixtures

`testdata/insight_prompts/` pins the exact text sent to the model for a set of
representative views. Each case is a `.json` input plus a committed
`.prompt.txt` of the rendered prompt.

A `.json` input **is** an `insightDescriptor`, the same body `/insight` accepts, and
the Go harness renders it through the same `renderInsightPrompt` the endpoint runs.
So the committed set is a direct readout of which input shapes the endpoint is known
to handle, and a new surface (multimap, say) is covered by adding a fixture rather
than by asserting coverage in prose.

```bash
cd server
go test -run TestInsightPromptFixtures ./...                # check
go test -run TestInsightPromptFixtures ./... -args -update  # accept a change
```

These templates are the only ones that exist. The browser posts a descriptor and
renders nothing itself, so a wording change ships with the server and needs no
client deploy.

`plainLanguageRules` in `insight_prompt.go` is the single copy of the writing rules
that cards, contrasts, and the report all carry, so editing it moves every fixture at
once. A per-template instruction must never contradict it: a card asking for "the
specific numbers shown" outweighs the shared rule asking for a rounded comparison, and
the output drifts back to restating the chart in words. The rules ask the model to
reason from the exact figures and then round them for the reader, so an instruction
that pins the output to the raw values defeats the whole block.

It is deterministic and offline: no API key, no network, no clock. A template
edit shows up as a diff in the `.prompt.txt` files, and **that diff is the thing
to review.** Since #5029/#5053 the cache key is a hash of the rendered prompt and
template text appears in every prompt, so the fixtures a change moves are a
direct readout of how much of the cache it displaces.

Every already-cached insight was keyed off text the browser rendered, so two
JavaScript behaviors are frozen into these templates and any change still has to
preserve them:

- **Number formatting must match exactly.** JavaScript renders `4.0` as `4`,
  `-0` as `0`, and exponents unpadded (`1.5e-7`, not `1.5e-07`); the committed
  prompts record that, and `jsNumber` reproduces it. `TestJSNumberMatchesJavaScript`
  pins the cases.
- **The reading-level instruction is spelled two ways.** Card and contrast
  templates say "8th grade reading level"; the report template says
  "8th-grade reading level". Both are load-bearing cached text, so normalizing
  them would displace every cached insight for no user-visible gain.

Reading level is asserted as *instruction presence*, not measured. The prompt is
instructions, so its own reading level is meaningless; measuring the reading
level of generated output belongs to the opt-in generate mode in #5064.

## Dockerfile

Three-stage build (build context is the repo root, like all other services):

1. `node:24-slim` — builds the React frontend
2. `golang:1.26.3-alpine` — builds the Go binary
3. `gcr.io/distroless/static-debian12:nonroot` — runtime (~15 MB, no shell)

Build with `DEPLOY_CONTEXT` arg set to `dev`, `prod`, or `deploy_preview`:

```bash
# From repo root
docker build -f server/Dockerfile --build-arg DEPLOY_CONTEXT=dev -t het-server .
docker run -p 8080:8080 \
  -e GCS_BUCKET=het-bucket \
  -e METADATA_FILENAME=all_metadata.ndjson \
  -e GEMINI_API_KEY=... \
  -e WEBFLOW_API_TOKEN=... \
  het-server
```
