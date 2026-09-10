package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
	// The runtime image is gcr.io/distroless/static-debian12, which carries no
	// zoneinfo, so LoadLocation below would fail on the deployed binary without
	// this. It embeds the IANA database at a cost of roughly 450 KB.
	_ "time/tzdata"

	"cloud.google.com/go/storage"
	"golang.org/x/time/rate"
	"google.golang.org/api/googleapi"
)

const (
	// Clients trim every data section to a per-context budget before assembling
	// a prompt (frontend/src/utils/insightPromptBudget.ts), sized so the worst
	// case in each context lands under this. Raising a client budget without
	// re-checking it against this value is what would push a prompt over.
	insightPromptMaxBytes   = 30 * 1024
	killSwitchObject        = "insights-generation-disabled"
	servingKillSwitchObject = "insights-serving-disabled"
	killSwitchTTL           = 60 * time.Second
	ledgerCASAttempts       = 5

	// Sized against the provider's free-tier quota for the configured model,
	// which is granted per project per model rather than per key. Both ceilings
	// sit under the provider's own daily allowance so the limit reached first is
	// this one, whose failure path serves cached insights, rather than the
	// provider's, whose rejections consume a reserved slot and return nothing.
	//
	// Both periods are keyed on the provider's own quota calendar, so a ledger
	// day sits inside exactly one provider day and the ceiling is what reaches
	// the provider. server/CLAUDE.md carries the current limits, the traffic
	// they were measured against, and the query that re-reads them. Read it
	// before moving either number.
	defaultMaxGenerationsPerDay   = 300
	defaultMaxGenerationsPerMonth = 6000

	// The provider's free tier allows 15 requests a minute for the configured
	// model. This sits under that so the limit reached first is ours, whose
	// failure path serves cached insights, rather than the provider's, whose
	// rejections cost a call and produce nothing. The remaining headroom
	// absorbs the retry a shed request may become.
	//
	// It cannot be a per-process limiter: Cloud Run scales this service to 50
	// instances (config/run.tf), so a per-instance share of 15 a minute rounds
	// to less than one request. The window lives in the daily ledger object
	// instead, which every reservation already writes under compare-and-swap.
	defaultMaxGenerationsPerMinute = 10

	// Warn at this share of a ceiling. Late enough not to cry wolf, early enough
	// that a fifth of the period's budget is still available to act with.
	defaultCeilingWarnPercent = 80

	insightRatePerMinute = 5
	insightRateBurst     = 10
	maxTrackedClients    = 10000
	clientLimiterTTL     = 10 * time.Minute

	// Flagging is a rare, deliberate act: a visitor reporting one bad insight.
	// The allowance is far tighter than generation's because the behavior needs
	// so much less, and because flagging deletes the cached insight, so a caller
	// left unbounded could drive the hit rate down and spend the day's ceiling
	// regenerating what it evicted.
	flagRatePerMinute = 3
	flagRateBurst     = 3
)

var errLedgerContention = errors.New("usage ledger contended")

// usageLedger is the durable record of generation volume for one period.
type usageLedger struct {
	Generations  int    `json:"generations"`
	PromptTokens int    `json:"promptTokens"`
	OutputTokens int    `json:"outputTokens"`
	Updated      string `json:"updated"`

	// The per-minute window, carried in the daily ledger so the guard is shared
	// across instances without a second object or a second round trip. Minute is
	// the window it counts; a different value means the window has rolled and
	// the count starts over. Only meaningful on a daily ledger.
	Minute      string `json:"minute,omitempty"`
	MinuteCount int    `json:"minuteCount,omitempty"`
}

func envInt(name string, fallback int) int {
	if v, err := strconv.Atoi(os.Getenv(name)); err == nil && v >= 0 {
		return v
	}
	return fallback
}

func ledgerObject(period string) string { return "budget/" + period + ".json" }

// providerQuotaLocation is the calendar the provider resets its request quotas
// on. Both ledger periods are keyed in it rather than in UTC, so that a period
// this service meters sits inside exactly one provider quota day. Keying in UTC
// put a provider day across two ledger days, each with a full allowance, which
// let twice the daily ceiling reach the provider inside one of its days.
//
// Falling back to UTC keeps the ceilings working if the zone is somehow
// unavailable; it reintroduces the straddle, so it is logged rather than
// passed over. With tzdata embedded above this should not be reachable.
var providerQuotaLocation = func() *time.Location {
	loc, err := time.LoadLocation("America/Los_Angeles")
	if err != nil {
		log.Printf("[insight] provider quota zone unavailable, keying ledger in UTC: %v", err)
		return time.UTC
	}
	return loc
}()

// ledgerPeriods returns the daily and monthly ledger keys for an instant. Both
// callers go through it so the two periods cannot drift onto different
// calendars, and so the mapping is testable against a fixed instant rather than
// only against whatever the wall clock happens to read.
func ledgerPeriods(t time.Time) (day, month, minute string) {
	t = t.In(providerQuotaLocation)
	return t.Format("2006-01-02"), t.Format("2006-01"), t.Format("2006-01-02T15:04")
}

func isPreconditionFailed(err error) bool {
	var gerr *googleapi.Error
	return errors.As(err, &gerr) && gerr.Code == http.StatusPreconditionFailed
}

// nowFunc is a package-level var for the same reason ledgerLoad and ledgerSave
// are: every ledger key is derived from wall-clock time, so a test spanning a
// minute boundary would otherwise assert against a window that rolled underneath
// it.
var nowFunc = time.Now

// ledgerLoad and ledgerSave are package-level vars so tests can substitute an
// in-memory store, matching the gcsDownload pattern in handlers.go.
var (
	ledgerLoad = gcsLedgerLoad
	ledgerSave = gcsLedgerSave
)

// gcsLedgerLoad reads the ledger along with the object generation the read saw,
// which is what the subsequent write is conditioned on. A missing object reports
// exists=false rather than an error, since the first write of a period is normal.
func gcsLedgerLoad(ctx context.Context, bucket, path string) (data []byte, generation int64, exists bool, err error) {
	attrs, err := getGCSClient().Bucket(bucket).Object(path).Attrs(ctx)
	if errors.Is(err, storage.ErrObjectNotExist) {
		return nil, 0, false, nil
	}
	if err != nil {
		return nil, 0, false, err
	}
	data, err = downloadBlob(ctx, bucket, path)
	if err != nil {
		return nil, 0, false, err
	}
	return data, attrs.Generation, true, nil
}

func gcsLedgerSave(ctx context.Context, bucket, path string, data []byte, generation int64, exists bool) error {
	cond := storage.Conditions{DoesNotExist: true}
	if exists {
		cond = storage.Conditions{GenerationMatch: generation}
	}
	w := getGCSClient().Bucket(bucket).Object(path).If(cond).NewWriter(ctx)
	w.ContentType = "application/json"
	if _, err := w.Write(data); err != nil {
		w.Close()
		return err
	}
	return w.Close()
}

// mutateLedger applies apply to the period ledger under a compare-and-swap, so
// concurrent instances cannot lose each other's increments. apply returning false
// means the caller declined the change (a ceiling was already reached) and is not
// an error.
func mutateLedger(ctx context.Context, bucket, path string, apply func(*usageLedger) bool) (bool, error) {
	for range ledgerCASAttempts {
		raw, generation, exists, err := ledgerLoad(ctx, bucket, path)
		if err != nil {
			return false, err
		}

		var led usageLedger
		if exists {
			if err := json.Unmarshal(raw, &led); err != nil {
				return false, err
			}
		}

		if !apply(&led) {
			return false, nil
		}
		led.Updated = time.Now().UTC().Format(time.RFC3339)

		data, err := json.Marshal(led)
		if err != nil {
			return false, err
		}
		err = ledgerSave(ctx, bucket, path, data, generation, exists)
		if err == nil {
			return true, nil
		}
		if !isPreconditionFailed(err) {
			return false, err
		}
	}
	return false, errLedgerContention
}

// ceilingWarnAt is the generation count at which a period's usage is considered
// close enough to its ceiling to be worth an alert.
//
// A percent outside 1..100 lands the threshold at zero or past the ceiling, and
// either one silently disables the alert rather than moving it, so an
// out-of-range value falls back to the default instead of being honored.
func ceilingWarnAt(limit int) int {
	percent := envInt("INSIGHT_CEILING_WARN_PERCENT", defaultCeilingWarnPercent)
	if percent < 1 || percent > 100 {
		percent = defaultCeilingWarnPercent
	}
	return limit * percent / 100
}

// reserveOne reports the post-increment count alongside the verdict, which is
// what lets the caller say how much of the period's budget is spent rather than
// only whether the reservation succeeded, without a second read of the ledger.
func reserveOne(ctx context.Context, bucket, path string, limit int) (count int, ok bool, err error) {
	ok, err = mutateLedger(ctx, bucket, path, func(l *usageLedger) bool {
		if l.Generations >= limit {
			count = l.Generations
			return false
		}
		l.Generations++
		count = l.Generations
		return true
	})
	return count, ok, err
}

// usageSnapshot is what a reservation attempt observed, so the request log can
// carry period usage without re-reading the ledger. A period the attempt never
// reached stays zero, rather than reporting a limit against a count that was
// never read.
type usageSnapshot struct {
	dayCount, dayLimit       int
	monthCount, monthLimit   int
	minuteCount, minuteLimit int

	// Which ceiling refused the reservation: "", "minute", "day" or "month".
	// The caller logs a different reason for each, so a burst shed at the
	// per-minute guard stays distinguishable from a spent daily budget.
	refusedBy string

	// The period keys this reservation counted against, kept so a release
	// returns the slot to the same window it was taken from. Recomputing them
	// at release time would credit whatever window the clock had moved on to,
	// since a provider call can outlast the minute it started in.
	day, month, minute string
}

// reserveDayAndMinute claims one generation against the daily ceiling and the
// per-minute window under a single compare-and-swap, so the two cannot disagree
// and the minute guard costs no extra round trip.
//
// A window whose key does not match has rolled, and starts over. A daily ledger
// written before this field existed, or freshly created for a new day, arrives
// with an empty key, which reads as a window that has not started yet.
func reserveDayAndMinute(
	ctx context.Context, bucket, path, minute string, dayLimit, minuteLimit int,
) (dayCount, minuteCount int, refusedBy string, err error) {
	_, err = mutateLedger(ctx, bucket, path, func(l *usageLedger) bool {
		if l.Minute != minute {
			l.Minute, l.MinuteCount = minute, 0
		}
		// Checked before the daily ceiling so a burst is reported as a burst.
		// Neither branch writes, so a refusal leaves the ledger untouched.
		if l.MinuteCount >= minuteLimit {
			dayCount, minuteCount, refusedBy = l.Generations, l.MinuteCount, "minute"
			return false
		}
		if l.Generations >= dayLimit {
			dayCount, minuteCount, refusedBy = l.Generations, l.MinuteCount, "day"
			return false
		}
		l.Generations++
		l.MinuteCount++
		dayCount, minuteCount = l.Generations, l.MinuteCount
		return true
	})
	return dayCount, minuteCount, refusedBy, err
}

// releaseDayAndMinute gives back the claims reserveDayAndMinute persisted. Used
// on its own when the monthly ceiling refuses, since that path never reached the
// monthly counter. Counts floor at zero rather than going negative, so a release
// somehow applied twice cannot drive a ledger below empty.
func releaseDayAndMinute(ctx context.Context, bucket string, snap usageSnapshot) error {
	_, err := mutateLedger(ctx, bucket, ledgerObject(snap.day), func(l *usageLedger) bool {
		if l.Generations > 0 {
			l.Generations--
		}
		// Only credit the window the slot was taken from. A provider call can
		// outlast the minute it started in, and the window may have rolled.
		if l.Minute == snap.minute && l.MinuteCount > 0 {
			l.MinuteCount--
		}
		return true
	})
	return err
}

// releaseGeneration returns all three claims, for a provider rate-limit
// rejection: the one provider failure that certainly produced nothing.
// Reservation stays before the provider call so a crash cannot lose a slot, and
// this is the compensating step for it.
//
// The error is reported rather than only logged: a caller that marks a request
// unreserved while the ledger still holds the reservation would put the request
// log and the ledger's own counters into exactly the disagreement releasing
// exists to avoid.
func releaseGeneration(ctx context.Context, bucket string, snap usageSnapshot) error {
	dayErr := releaseDayAndMinute(ctx, bucket, snap)
	if dayErr != nil {
		log.Printf("[insight] could not release daily reservation: %v", dayErr)
	}
	_, monthErr := mutateLedger(ctx, bucket, ledgerObject(snap.month), func(l *usageLedger) bool {
		if l.Generations > 0 {
			l.Generations--
		}
		return true
	})
	if monthErr != nil {
		log.Printf("[insight] could not release monthly reservation: %v", monthErr)
	}
	return errors.Join(dayErr, monthErr)
}

// reserveGeneration claims one generation against the per-minute, daily and
// monthly ceilings. It returns false when any is exhausted.
func reserveGeneration(ctx context.Context, bucket string) (bool, usageSnapshot, error) {
	day, month, minute := ledgerPeriods(nowFunc())
	snap := usageSnapshot{day: day, month: month, minute: minute}

	snap.dayLimit = envInt("INSIGHT_MAX_GENERATIONS_PER_DAY", defaultMaxGenerationsPerDay)
	snap.minuteLimit = envInt("INSIGHT_MAX_GENERATIONS_PER_MINUTE", defaultMaxGenerationsPerMinute)
	dayCount, minuteCount, refusedBy, err := reserveDayAndMinute(
		ctx, bucket, ledgerObject(day), minute, snap.dayLimit, snap.minuteLimit,
	)
	snap.dayCount, snap.minuteCount, snap.refusedBy = dayCount, minuteCount, refusedBy
	if err != nil || refusedBy != "" {
		return false, snap, err
	}
	logCeilingApproach("daily", snap.dayCount, snap.dayLimit)

	// A monthly refusal lands after the daily and per-minute counts are already
	// claimed, so they are given back below. Left in place they would not stay
	// one high: once the month is spent, every refused request after it would
	// add another, inflating the daily count and filling the minute window with
	// generations that never happened.
	snap.monthLimit = envInt("INSIGHT_MAX_GENERATIONS_PER_MONTH", defaultMaxGenerationsPerMonth)
	monthCount, ok, err := reserveOne(ctx, bucket, ledgerObject(month), snap.monthLimit)
	snap.monthCount = monthCount
	if err != nil || !ok {
		if !ok {
			snap.refusedBy = "month"
		}
		// The monthly counter was not written on either path, so the day and
		// minute hold claims against a generation that will not happen.
		if relErr := releaseDayAndMinute(ctx, bucket, snap); relErr != nil {
			log.Printf("[insight] could not release after a monthly refusal: %v", relErr)
		}
		return false, snap, err
	}
	logCeilingApproach("monthly", snap.monthCount, snap.monthLimit)
	return true, snap, nil
}

// recordTokenUsage attributes token counts to both period ledgers. Best effort:
// the generation has already happened, so a bookkeeping failure must not fail the
// request.
func recordTokenUsage(ctx context.Context, bucket string, promptTokens, outputTokens int) {
	if promptTokens == 0 && outputTokens == 0 {
		return
	}
	day, month, _ := ledgerPeriods(nowFunc())
	add := func(l *usageLedger) bool {
		l.PromptTokens += promptTokens
		l.OutputTokens += outputTokens
		return true
	}
	for _, period := range []string{day, month} {
		mutateLedger(ctx, bucket, ledgerObject(period), add)
	}
}

var (
	killSwitchMu      sync.Mutex
	killSwitchChecked time.Time
	// Fail closed: assume disabled until a check actually succeeds, so a
	// persistent read error before the first successful check can't default to
	// generation being allowed.
	killSwitchOn = true
)

// generationDisabled reports the operator off switch, memoized so the common
// path costs at most one object check per minute per instance.
func generationDisabled(ctx context.Context, bucket string) bool {
	killSwitchMu.Lock()
	defer killSwitchMu.Unlock()

	if !killSwitchChecked.IsZero() && time.Since(killSwitchChecked) < killSwitchTTL {
		return killSwitchOn
	}

	_, err := getGCSClient().Bucket(bucket).Object(killSwitchObject).Attrs(ctx)
	if err != nil && !errors.Is(err, storage.ErrObjectNotExist) {
		// Keep the previous verdict on a transient read failure rather than
		// treating an unreadable switch as permission to generate.
		return killSwitchOn
	}
	killSwitchOn = err == nil
	killSwitchChecked = time.Now()
	return killSwitchOn
}

var (
	servingKillSwitchMu      sync.Mutex
	servingKillSwitchChecked time.Time
	// Fail open: a transient read error must not black out a working feature.
	// Contrast with generationDisabled, which fails closed because unmetered
	// generation is the worse outcome there.
	servingKillSwitchOn = false
)

// servingDisabled reports the serving kill switch, memoized so the common
// path costs at most one object check per minute per instance. The Attrs call
// is made outside the lock to avoid blocking concurrent requests on slow GCS reads.
// The lock is dropped around the GCS call where generationDisabled holds it
// through, and the difference is deliberate rather than drift.
//
// This runs on every insight request, cache hits included, so holding the lock
// would put one GCS round trip per TTL on the hot path for every concurrent
// caller. A cold-cache herd of Attrs calls is the cheaper trade. It also fails
// open, so a caller that races past the memo reads "serving enabled", which is
// the answer it would almost certainly have got by waiting.
//
// generationDisabled runs only once the cache has missed and a provider call is
// already committed, where serializing costs little against the generation
// itself. It also fails closed, so a caller that did not wait would read
// "disabled" and refuse a generation that should have proceeded. Holding the
// lock there is correctness, not just tolerance.
func servingDisabled(ctx context.Context, bucket string) bool {
	servingKillSwitchMu.Lock()
	if !servingKillSwitchChecked.IsZero() && time.Since(servingKillSwitchChecked) < killSwitchTTL {
		defer servingKillSwitchMu.Unlock()
		return servingKillSwitchOn
	}
	servingKillSwitchMu.Unlock()

	// Call Attrs outside the lock to avoid blocking concurrent requests.
	_, err := getGCSClient().Bucket(bucket).Object(servingKillSwitchObject).Attrs(ctx)

	servingKillSwitchMu.Lock()
	defer servingKillSwitchMu.Unlock()
	// Re-check TTL after the call in case another goroutine refreshed while we waited.
	if !servingKillSwitchChecked.IsZero() && time.Since(servingKillSwitchChecked) < killSwitchTTL {
		return servingKillSwitchOn
	}

	if err != nil && !errors.Is(err, storage.ErrObjectNotExist) {
		// Fail open: on error, treat switch as off (serving enabled). Refresh the TTL
		// so the next request won't immediately retry a failing operation.
		servingKillSwitchOn = false
		servingKillSwitchChecked = time.Now()
		return false
	}
	servingKillSwitchOn = err == nil
	servingKillSwitchChecked = time.Now()
	return servingKillSwitchOn
}

type clientLimiter struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// rateLimiters is a per-client token-bucket table. Each guarded endpoint keeps
// its own, so a caller's flagging allowance is independent of its generation
// allowance and neither can exhaust the other.
//
// Per process, like anything else held in memory here: Cloud Run runs this
// service up to 50 instances, so the service-wide allowance is this times the
// instance count. That makes it a guard against one noisy caller, not a bound
// on total volume. The bound is the ledger in reserveGeneration, which is
// shared because it lives in GCS.
type rateLimiters struct {
	mu        sync.Mutex
	perMinute int
	burst     int
	clients   map[string]*clientLimiter
}

func newRateLimiters(perMinute, burst int) *rateLimiters {
	return &rateLimiters{
		perMinute: perMinute,
		burst:     burst,
		clients:   map[string]*clientLimiter{},
	}
}

var (
	generationLimiters = newRateLimiters(insightRatePerMinute, insightRateBurst)
	flagLimiters       = newRateLimiters(flagRatePerMinute, flagRateBurst)
)

func (t *rateLimiters) newLimiter() *rate.Limiter {
	return rate.NewLimiter(rate.Limit(t.perMinute)/60, t.burst)
}

// reset empties the table. Only tests need it; the sweep in allow keeps the
// table bounded in service.
func (t *rateLimiters) reset() {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.clients = map[string]*clientLimiter{}
}

func (t *rateLimiters) size() int {
	t.mu.Lock()
	defer t.mu.Unlock()
	return len(t.clients)
}

func (t *rateLimiters) allow(ip string) bool {
	t.mu.Lock()
	defer t.mu.Unlock()

	if len(t.clients) > maxTrackedClients {
		cutoff := time.Now().Add(-clientLimiterTTL)
		for k, v := range t.clients {
			if v.lastSeen.Before(cutoff) {
				delete(t.clients, k)
			}
		}
		// Still oversized after sweeping means sustained spread-out traffic. Reset
		// rather than let the table grow without bound.
		if len(t.clients) > maxTrackedClients {
			t.clients = map[string]*clientLimiter{}
		}
	}

	cl, ok := t.clients[ip]
	if !ok {
		cl = &clientLimiter{limiter: t.newLimiter()}
		t.clients[ip] = cl
	}
	cl.lastSeen = time.Now()
	return cl.limiter.Allow()
}

func allowClient(ip string) bool { return generationLimiters.allow(ip) }

func clientIP(r *http.Request) string {
	// This service is reached directly by Cloud Run via a domain mapping, with
	// no external load balancer in front, so Google's frontend appends the true
	// client IP as the final X-Forwarded-For entry. Every earlier entry is
	// caller-supplied, so the rightmost is the only one safe to key a rate
	// limiter on. If an external HTTPS load balancer is ever placed in front,
	// it appends its own IP last and the trusted entry becomes the
	// second-to-last; this must change with it.
	if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
		if i := strings.LastIndexByte(fwd, ','); i >= 0 {
			return strings.TrimSpace(fwd[i+1:])
		}
		return strings.TrimSpace(fwd)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

// Defaults are the real deployment origins, so an unset env var still resolves to
// a closed list instead of accepting everything.
var defaultInsightOrigins = []string{
	"https://healthequitytracker.org",
	"https://www.healthequitytracker.org",
	"https://dev.healthequitytracker.org",
	"http://localhost:3000",
	"https://*.netlify.app",
}

func allowedInsightOrigins() []string {
	var out []string
	for _, o := range strings.Split(os.Getenv("INSIGHT_ALLOWED_ORIGINS"), ",") {
		if o = strings.TrimSpace(o); o != "" {
			out = append(out, o)
		}
	}
	if len(out) == 0 {
		return defaultInsightOrigins
	}
	return out
}

func originAllowed(origin string, allowed []string) bool {
	if origin == "" {
		return false
	}
	for _, a := range allowed {
		// A "https://*.example.com" entry matches subdomains only, never the bare
		// apex, so registering the apex elsewhere stays a deliberate act.
		if suffix, isWildcard := strings.CutPrefix(a, "https://*."); isWildcard {
			host, ok := strings.CutPrefix(origin, "https://")
			if ok && strings.HasSuffix(host, "."+suffix) {
				return true
			}
			continue
		}
		if origin == a {
			return true
		}
	}
	return false
}

func insightOriginOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !originAllowed(r.Header.Get("Origin"), allowedInsightOrigins()) {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func rateLimited(t *rateLimiters, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !t.allow(clientIP(r)) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			writeJSON(w, map[string]string{"error": "Rate limit reached"})
			return
		}
		next.ServeHTTP(w, r)
	})
}

func insightRateLimit(next http.Handler) http.Handler {
	return rateLimited(generationLimiters, next)
}

// flagRateLimit guards flagging on its own budget. Flagging both writes to a
// bucket with no TTL and evicts a cached insight, so it needs a bound of its
// own rather than a share of generation's.
func flagRateLimit(next http.Handler) http.Handler {
	return rateLimited(flagLimiters, next)
}
