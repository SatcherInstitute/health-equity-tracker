package main

import (
	"context"
	"encoding/json"
	"errors"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"cloud.google.com/go/storage"
	"golang.org/x/time/rate"
	"google.golang.org/api/googleapi"
)

const (
	// Clients trim every data section to a per-context budget before assembling
	// a prompt (frontend/src/utils/insightPromptBudget.ts), sized so the worst
	// case in each context lands under this. Raising a client budget without
	// re-checking it against this value is what would push a prompt over.
	insightPromptMaxBytes = 30 * 1024
	killSwitchObject      = "insights-generation-disabled"
	killSwitchTTL         = 60 * time.Second
	ledgerCASAttempts     = 5

	defaultMaxGenerationsPerDay   = 400
	defaultMaxGenerationsPerMonth = 8000

	// Warn at this share of a ceiling. Late enough not to cry wolf, early enough
	// that a fifth of the period's budget is still available to act with.
	defaultCeilingWarnPercent = 80

	insightRatePerMinute = 5
	insightRateBurst     = 10
	maxTrackedClients    = 10000
	clientLimiterTTL     = 10 * time.Minute
)

var errLedgerContention = errors.New("usage ledger contended")

// usageLedger is the durable record of generation volume for one period.
type usageLedger struct {
	Generations  int    `json:"generations"`
	PromptTokens int    `json:"promptTokens"`
	OutputTokens int    `json:"outputTokens"`
	Updated      string `json:"updated"`
}

func envInt(name string, fallback int) int {
	if v, err := strconv.Atoi(os.Getenv(name)); err == nil && v >= 0 {
		return v
	}
	return fallback
}

func ledgerObject(period string) string { return "budget/" + period + ".json" }

func isPreconditionFailed(err error) bool {
	var gerr *googleapi.Error
	return errors.As(err, &gerr) && gerr.Code == http.StatusPreconditionFailed
}

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
func ceilingWarnAt(limit int) int {
	return limit * envInt("INSIGHT_CEILING_WARN_PERCENT", defaultCeilingWarnPercent) / 100
}

// reserveOne reports the post-increment count alongside the verdict, which is
// what lets the caller tell "45 of 400 used" from "at the cap" without a second
// read of the ledger.
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
	dayCount, dayLimit     int
	monthCount, monthLimit int
}

// reserveGeneration claims one generation against both the daily and monthly
// ceilings. It returns false when either is exhausted.
func reserveGeneration(ctx context.Context, bucket string) (bool, usageSnapshot, error) {
	now := time.Now().UTC()
	var snap usageSnapshot

	snap.dayLimit = envInt("INSIGHT_MAX_GENERATIONS_PER_DAY", defaultMaxGenerationsPerDay)
	dayCount, ok, err := reserveOne(ctx, bucket, ledgerObject(now.Format("2006-01-02")), snap.dayLimit)
	snap.dayCount = dayCount
	if err != nil || !ok {
		return false, snap, err
	}
	logCeilingApproach("daily", snap.dayCount, snap.dayLimit)

	// A monthly rejection after the daily increment leaves the daily count one
	// high for the rest of the day. That errs toward generating less, which is
	// the safe direction to be wrong in.
	snap.monthLimit = envInt("INSIGHT_MAX_GENERATIONS_PER_MONTH", defaultMaxGenerationsPerMonth)
	monthCount, ok, err := reserveOne(ctx, bucket, ledgerObject(now.Format("2006-01")), snap.monthLimit)
	snap.monthCount = monthCount
	if err != nil || !ok {
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
	now := time.Now().UTC()
	add := func(l *usageLedger) bool {
		l.PromptTokens += promptTokens
		l.OutputTokens += outputTokens
		return true
	}
	for _, period := range []string{now.Format("2006-01-02"), now.Format("2006-01")} {
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

type clientLimiter struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

var (
	limiterMu sync.Mutex
	limiters  = map[string]*clientLimiter{}
)

func newClientRateLimiter() *rate.Limiter {
	return rate.NewLimiter(rate.Limit(insightRatePerMinute)/60, insightRateBurst)
}

func allowClient(ip string) bool {
	limiterMu.Lock()
	defer limiterMu.Unlock()

	if len(limiters) > maxTrackedClients {
		cutoff := time.Now().Add(-clientLimiterTTL)
		for k, v := range limiters {
			if v.lastSeen.Before(cutoff) {
				delete(limiters, k)
			}
		}
		// Still oversized after sweeping means sustained spread-out traffic. Reset
		// rather than let the table grow without bound.
		if len(limiters) > maxTrackedClients {
			limiters = map[string]*clientLimiter{}
		}
	}

	cl, ok := limiters[ip]
	if !ok {
		cl = &clientLimiter{limiter: newClientRateLimiter()}
		limiters[ip] = cl
	}
	cl.lastSeen = time.Now()
	return cl.limiter.Allow()
}

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

func insightRateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !allowClient(clientIP(r)) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			writeJSON(w, map[string]string{"error": "Rate limit reached"})
			return
		}
		next.ServeHTTP(w, r)
	})
}
