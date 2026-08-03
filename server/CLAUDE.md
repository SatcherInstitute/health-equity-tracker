# Server

Combined Go HTTP server. A single binary and a single Docker image (~15 MB) serves:

- React static files with correct Cache-Control headers and SPA fallback
- GCS dataset and metadata endpoints
- AI insight generation (direct Gemini API call, no proxy hop) with usage budgets
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
| `GEMINI_API_KEY` | No | - | Required for `/fetch-ai-insight`. Unset disables generation; cached insights still serve |
| `GEMINI_MODEL` | No | `gemini-3.1-flash-lite` | Gemini model used for insight generation |
| `INSIGHT_MAX_GENERATIONS_PER_DAY` | No | `400` | Daily generation ceiling, tracked in the usage ledger |
| `INSIGHT_MAX_GENERATIONS_PER_MONTH` | No | `8000` | Monthly generation ceiling, tracked in the usage ledger |
| `INSIGHT_CEILING_WARN_PERCENT` | No | `80` | Share of a ceiling at which a `ceiling_approaching` warning is logged |
| `INSIGHT_ALLOWED_ORIGINS` | No | prod, www, dev, `localhost:3000`, `*.netlify.app` | Comma-separated origins permitted to request generation |
| `WEBFLOW_API_TOKEN` | No | - | Required for `/het-news` |
| `INSIGHT_NEGATIVE_EXAMPLES_ENABLED` | No | `false` | Feed prior flagged outputs back into prompts |
| `STATIC_DIR` | No | `/static` | Directory containing the React build |
| `PORT` | No | `8080` | HTTP listen port |

## How it works

The server handles all traffic on a single port:

- **Data requests** (`/dataset`, `/metadata`): served from GCS via a 150 MB byte-aware LRU
  cache with a 2-hour TTL. NDJSON files are converted to JSON arrays on the fly.
- **AI insights** (`/fetch-ai-insight`): checks a `sync.Map` in-process cache, then the GCS
  persistent cache, then calls the Gemini API directly and writes back to GCS. Generation is
  metered before the call against daily and monthly ledgers under `budget/` in the insights cache
  bucket, updated by compare-and-swap. When a ceiling is reached, the ledger cannot be written,
  or an `insights-generation-disabled` object exists in that bucket, the endpoint returns
  `{"unavailable": true}` and the frontend renders no insight section. The route is additionally
  scoped to the origins in `INSIGHT_ALLOWED_ORIGINS` and rate limited per client.
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

Every `/fetch-ai-insight` request emits exactly one JSON line to stdout, which Cloud
Run ships to Cloud Logging as a structured payload under `jsonPayload.insight`. That
line is the only reporting surface for this feature. **The usage ledger is not a
reporting surface**: `reserveGeneration` writes it before the provider call so it can
refuse a generation, and it stays write-only. Cache hits in particular must never be
routed through it, since `mutateLedger` is a compare-and-swap against a single GCS
object and hits are the hot path.

```json
{"severity":"INFO","message":"insight generated","insight":{
  "outcome":"generated","cacheKey":"a1b2c3","topic":"hiv","reserved":true,
  "model":"gemini-3.1-flash-lite","promptTokens":1840,"outputTokens":96,
  "dailyGenerations":42,"dailyLimit":400,
  "monthlyGenerations":903,"monthlyLimit":8000,"durationMs":812}}
```

`outcome` is one of:

| Outcome | Meaning |
|---|---|
| `memory_hit` | Served from the in-process `sync.Map` |
| `gcs_hit` | Served from the GCS persistent cache |
| `generated` | Called the provider. Carries `model` and token counts |
| `unavailable` | No insight shown. `reason` says which gate closed |
| `suppressed` | A reviewer suppressed this exact insight |
| `rejected` | Malformed request (missing or oversize prompt) |
| `error` | Provider or suppression-check failure |
| `ceiling_approaching` | Not a request. See the alert below |

`reason` narrows the non-serving outcomes: `ceiling_reached`, `generation_disabled`,
`no_api_key`, `no_cache_bucket`, `ledger_error`, `no_content`, `provider_quota`,
`provider_error`, `suppression_check`, `missing_prompt`, `prompt_too_large`.

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
`TestInsightRequestLogRecordsEveryOutcome` pins every outcome and every reason above,
along with its severity and its `reserved` value.

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
gcloud logging read "$FILTER jsonPayload.insight.reserved=true" \
  --project "$PROJECT" --freshness=30d \
  --format='value(jsonPayload.insight.outcome,jsonPayload.insight.promptTokens,jsonPayload.insight.outputTokens)' \
| awk -F'\t' '{n++; if ($1=="generated") s++; i+=$2; o+=$3}
       END {print n" reservations ("s" produced an insight), "i" input tokens, "o" output tokens"}'
```

`-F'\t'` is load-bearing: `value()` emits tab-separated fields, and a zero token count
is omitted from the JSON entirely, so under awk's default whitespace splitting the
empty field would collapse and shift every column after it.

The gap between the two counts is the provider failure rate, and it is ceiling budget
spent on nothing. A widening gap is worth chasing on its own.

Cross-check against the ledger without reading GCS: the newest line's
`dailyGenerations` and `monthlyGenerations` are the ledger's own counters at that
moment, so they should track the reservation count above.

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

### Ceiling alert

`ceiling_approaching` fires once per period, on the single request whose count lands on
`INSIGHT_CEILING_WARN_PERCENT` of the ceiling. The ledger's compare-and-swap hands out
each count exactly once, so it cannot double-fire across Cloud Run instances and cannot
degrade into a line per request for the rest of the period.

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

## Insight prompt fixtures

`testdata/insight_prompts/` pins the exact text sent to the model for a set of
representative views. Each case is a `.json` input plus a committed
`.prompt.txt` of the rendered prompt.

Prompts are still assembled in the frontend, so the harness that renders them
lives there too:

```bash
cd frontend
npx vitest run src/utils/insightPromptFixtures.test.ts    # check
UPDATE_INSIGHT_PROMPTS=1 npx vitest run src/utils/insightPromptFixtures.test.ts  # accept a change
```

It is deterministic and offline: no API key, no network, no clock. A template
edit shows up as a diff in the `.prompt.txt` files, and **that diff is the thing
to review.** Since #5029/#5053 the cache key is a hash of the rendered prompt and
template text appears in every prompt, so the fixtures a change moves are a
direct readout of how much of the cache it displaces.

The fixtures deliberately contain no TypeScript-only types. When #5045 ports the
templates to Go, the Go implementation renders these same inputs and must
reproduce these same outputs, which is what makes the port checkable rather than
trusted. Two things that will bite that port:

- **Number formatting must match exactly.** JavaScript renders `4.0` as `4`, and
  the committed prompts record that. Go's default float formatting has to be
  made to agree.
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
