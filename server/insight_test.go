package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"google.golang.org/api/googleapi"
)

// --- Gemini response parsing ---

func TestParseGeminiResponseJoinsParts(t *testing.T) {
	raw := []byte(`{
		"candidates":[{"content":{"parts":[{"text":"Black residents "},{"text":"face higher rates."}]},"finishReason":"STOP"}],
		"usageMetadata":{"promptTokenCount":120,"candidatesTokenCount":45}
	}`)

	got, err := parseGeminiResponse(raw)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.text != "Black residents face higher rates." {
		t.Errorf("text = %q", got.text)
	}
	if got.promptTokens != 120 || got.outputTokens != 45 {
		t.Errorf("tokens = %d/%d, want 120/45", got.promptTokens, got.outputTokens)
	}
}

func TestParseGeminiResponseNoContent(t *testing.T) {
	tests := []struct {
		name string
		raw  string
	}{
		{"safety finish with no parts", `{"candidates":[{"content":{},"finishReason":"SAFETY"}],"usageMetadata":{"promptTokenCount":9}}`},
		{"max tokens with no parts", `{"candidates":[{"content":{"parts":[]},"finishReason":"MAX_TOKENS"},{"content":{"parts":[{"text":"ignored"}]}}],"usageMetadata":{"promptTokenCount":9}}`},
		{"no candidates at all", `{"candidates":[],"usageMetadata":{"promptTokenCount":9}}`},
		{"prompt blocked upstream", `{"promptFeedback":{"blockReason":"SAFETY"},"usageMetadata":{"promptTokenCount":9}}`},
		{"whitespace only text", `{"candidates":[{"content":{"parts":[{"text":"   \n"}]}}],"usageMetadata":{"promptTokenCount":9}}`},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := parseGeminiResponse([]byte(tt.raw))
			if !errors.Is(err, errInsightNoContent) {
				t.Fatalf("err = %v, want errInsightNoContent", err)
			}
			if got.text != "" {
				t.Errorf("text = %q, want empty", got.text)
			}
			// Tokens are still billed for a blocked call, so they must survive.
			if got.promptTokens != 9 {
				t.Errorf("promptTokens = %d, want 9", got.promptTokens)
			}
		})
	}
}

func TestParseGeminiResponseMalformed(t *testing.T) {
	if _, err := parseGeminiResponse([]byte("not json")); err == nil {
		t.Fatal("expected an error for malformed JSON")
	}
}

// --- ledger fake ---

// fakeLedgerStore models the compare-and-swap semantics of a GCS object: every
// successful write bumps the generation, and a write conditioned on a stale
// generation fails the precondition.
type fakeLedgerStore struct {
	mu      sync.Mutex
	objects map[string][]byte
	gens    map[string]int64
	loadErr error
	// failWrites rejects the next n writes with a precondition failure, to force
	// the retry path deterministically.
	failWrites int
	saves      int
}

func newFakeLedgerStore() *fakeLedgerStore {
	return &fakeLedgerStore{objects: map[string][]byte{}, gens: map[string]int64{}}
}

func (f *fakeLedgerStore) load(_ context.Context, _, path string) ([]byte, int64, bool, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.loadErr != nil {
		return nil, 0, false, f.loadErr
	}
	data, ok := f.objects[path]
	if !ok {
		return nil, 0, false, nil
	}
	return data, f.gens[path], true, nil
}

func (f *fakeLedgerStore) save(_ context.Context, _, path string, data []byte, generation int64, exists bool) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.saves++
	if f.failWrites > 0 {
		f.failWrites--
		return &googleapi.Error{Code: http.StatusPreconditionFailed}
	}
	_, present := f.objects[path]
	if present != exists || (present && f.gens[path] != generation) {
		return &googleapi.Error{Code: http.StatusPreconditionFailed}
	}
	f.objects[path] = bytes.Clone(data)
	f.gens[path]++
	return nil
}

func (f *fakeLedgerStore) ledger(t *testing.T, path string) usageLedger {
	t.Helper()
	f.mu.Lock()
	defer f.mu.Unlock()
	var led usageLedger
	if err := json.Unmarshal(f.objects[path], &led); err != nil {
		t.Fatalf("ledger %s: %v", path, err)
	}
	return led
}

func useFakeLedger(t *testing.T, store *fakeLedgerStore) {
	t.Helper()
	origLoad, origSave := ledgerLoad, ledgerSave
	t.Cleanup(func() { ledgerLoad, ledgerSave = origLoad, origSave })
	ledgerLoad, ledgerSave = store.load, store.save
}

// --- ledger accounting ---

func TestReserveOneConcurrentIncrementsDoNotCollide(t *testing.T) {
	store := newFakeLedgerStore()
	useFakeLedger(t, store)

	const workers = 4
	var wg sync.WaitGroup
	errs := make(chan error, workers)
	for range workers {
		wg.Add(1)
		go func() {
			defer wg.Done()
			ok, err := reserveOne(context.Background(), "b", "budget/day.json", 100)
			if err != nil {
				errs <- err
			} else if !ok {
				errs <- errors.New("reservation declined below the limit")
			}
		}()
	}
	wg.Wait()
	close(errs)
	for err := range errs {
		t.Fatalf("reserveOne: %v", err)
	}

	if got := store.ledger(t, "budget/day.json").Generations; got != workers {
		t.Errorf("generations = %d, want %d", got, workers)
	}
}

func TestMutateLedgerRetriesPreconditionFailure(t *testing.T) {
	store := newFakeLedgerStore()
	store.failWrites = 2
	useFakeLedger(t, store)

	ok, err := reserveOne(context.Background(), "b", "budget/day.json", 10)
	if err != nil || !ok {
		t.Fatalf("reserveOne = %v, %v; want true, nil", ok, err)
	}
	if store.saves != 3 {
		t.Errorf("saves = %d, want 3 (two rejections then a success)", store.saves)
	}
	if got := store.ledger(t, "budget/day.json").Generations; got != 1 {
		t.Errorf("generations = %d, want 1", got)
	}
}

func TestMutateLedgerGivesUpAfterSustainedContention(t *testing.T) {
	store := newFakeLedgerStore()
	store.failWrites = ledgerCASAttempts
	useFakeLedger(t, store)

	ok, err := reserveOne(context.Background(), "b", "budget/day.json", 10)
	if ok || !errors.Is(err, errLedgerContention) {
		t.Fatalf("reserveOne = %v, %v; want false, errLedgerContention", ok, err)
	}
}

func TestReserveOneStopsAtLimit(t *testing.T) {
	store := newFakeLedgerStore()
	useFakeLedger(t, store)

	for i := range 3 {
		ok, err := reserveOne(context.Background(), "b", "budget/day.json", 3)
		if err != nil {
			t.Fatalf("reservation %d: %v", i, err)
		}
		if !ok {
			t.Fatalf("reservation %d declined below the limit", i)
		}
	}
	ok, err := reserveOne(context.Background(), "b", "budget/day.json", 3)
	if err != nil {
		t.Fatalf("unexpected error at the limit: %v", err)
	}
	if ok {
		t.Error("reservation granted at the limit")
	}
}

func TestReserveGenerationFailsClosedOnLoadError(t *testing.T) {
	store := newFakeLedgerStore()
	store.loadErr = errors.New("bucket unreachable")
	useFakeLedger(t, store)

	ok, err := reserveGeneration(context.Background(), "b")
	if ok {
		t.Error("reservation granted while the ledger was unreadable")
	}
	if err == nil {
		t.Error("expected the ledger error to surface")
	}
}

func TestRecordTokenUsageAttributesBothPeriods(t *testing.T) {
	store := newFakeLedgerStore()
	useFakeLedger(t, store)

	now := time.Now().UTC()
	recordTokenUsage(context.Background(), "b", 300, 80)

	for _, period := range []string{now.Format("2006-01-02"), now.Format("2006-01")} {
		led := store.ledger(t, ledgerObject(period))
		if led.PromptTokens != 300 || led.OutputTokens != 80 {
			t.Errorf("%s tokens = %d/%d, want 300/80", period, led.PromptTokens, led.OutputTokens)
		}
	}
}

func TestEnvIntFallsBackOnUnusableValues(t *testing.T) {
	tests := []struct {
		value string
		want  int
	}{
		{"", 42}, {"abc", 42}, {"-1", 42}, {"0", 0}, {"7", 7},
	}
	for _, tt := range tests {
		t.Setenv("INSIGHT_TEST_LIMIT", tt.value)
		if got := envInt("INSIGHT_TEST_LIMIT", 42); got != tt.want {
			t.Errorf("envInt(%q) = %d, want %d", tt.value, got, tt.want)
		}
	}
}

// --- origin allowlist ---

func TestOriginAllowed(t *testing.T) {
	allowed := allowedInsightOrigins()
	tests := []struct {
		origin string
		want   bool
	}{
		{"https://healthequitytracker.org", true},
		{"https://www.healthequitytracker.org", true},
		{"https://dev.healthequitytracker.org", true},
		{"http://localhost:3000", true},
		{"https://deploy-preview-42--het.netlify.app", true},
		{"", false},
		{"https://healthequitytracker.org.evil.test", false},
		{"http://healthequitytracker.org", false},
		{"https://netlify.app", false},
		{"https://example.test", false},
	}
	for _, tt := range tests {
		if got := originAllowed(tt.origin, allowed); got != tt.want {
			t.Errorf("originAllowed(%q) = %v, want %v", tt.origin, got, tt.want)
		}
	}
}

func TestAllowedInsightOriginsFromEnv(t *testing.T) {
	t.Setenv("INSIGHT_ALLOWED_ORIGINS", " https://a.test , ,https://b.test ")
	got := allowedInsightOrigins()
	if len(got) != 2 || got[0] != "https://a.test" || got[1] != "https://b.test" {
		t.Fatalf("origins = %v", got)
	}
}

func TestInsightOriginOnlyMiddleware(t *testing.T) {
	reached := false
	handler := insightOriginOnly(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		reached = true
		w.WriteHeader(http.StatusOK)
	}))

	for _, tc := range []struct {
		origin     string
		wantStatus int
	}{
		{"https://healthequitytracker.org", http.StatusOK},
		{"https://example.test", http.StatusForbidden},
		{"", http.StatusForbidden},
	} {
		reached = false
		req := httptest.NewRequest(http.MethodPost, "/fetch-ai-insight", nil)
		if tc.origin != "" {
			req.Header.Set("Origin", tc.origin)
		}
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)
		if rr.Code != tc.wantStatus {
			t.Errorf("origin %q: status = %d, want %d", tc.origin, rr.Code, tc.wantStatus)
		}
		if reached != (tc.wantStatus == http.StatusOK) {
			t.Errorf("origin %q: handler reached = %v", tc.origin, reached)
		}
	}
}

// --- per-client rate limiting ---

func TestAllowClientDropsBurst(t *testing.T) {
	limiterMu.Lock()
	limiters = map[string]*clientLimiter{}
	limiterMu.Unlock()

	for i := range insightRateBurst {
		if !allowClient("203.0.113.7") {
			t.Fatalf("request %d denied inside the burst allowance", i+1)
		}
	}
	if allowClient("203.0.113.7") {
		t.Error("request past the burst allowance was permitted")
	}
	// A different client keeps its own allowance.
	if !allowClient("203.0.113.8") {
		t.Error("unrelated client was denied")
	}
}

func TestAllowClientSweepsStaleEntries(t *testing.T) {
	limiterMu.Lock()
	limiters = map[string]*clientLimiter{}
	stale := time.Now().Add(-2 * clientLimiterTTL)
	for i := range maxTrackedClients + 1 {
		limiters[fmt.Sprintf("10.0.0.%d", i)] = &clientLimiter{
			limiter:  newClientRateLimiter(),
			lastSeen: stale,
		}
	}
	limiterMu.Unlock()

	allowClient("203.0.113.9")

	limiterMu.Lock()
	size := len(limiters)
	limiterMu.Unlock()
	if size > maxTrackedClients {
		t.Errorf("tracked clients = %d, want the table swept below %d", size, maxTrackedClients)
	}
}

func TestClientIP(t *testing.T) {
	tests := []struct {
		name       string
		forwarded  string
		remoteAddr string
		want       string
	}{
		{"forwarded chain uses the trusted last hop, not the caller-supplied first hop", "198.51.100.4, 10.0.0.1", "10.0.0.9:1234", "10.0.0.1"},
		{"single forwarded", "198.51.100.5", "10.0.0.9:1234", "198.51.100.5"},
		{"no forwarded header", "", "10.0.0.9:1234", "10.0.0.9"},
		{"unparseable remote addr", "", "10.0.0.9", "10.0.0.9"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/fetch-ai-insight", nil)
			req.RemoteAddr = tt.remoteAddr
			if tt.forwarded != "" {
				req.Header.Set("X-Forwarded-For", tt.forwarded)
			}
			if got := clientIP(req); got != tt.want {
				t.Errorf("clientIP = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestInsightRateLimitMiddlewareReturns429(t *testing.T) {
	limiterMu.Lock()
	limiters = map[string]*clientLimiter{}
	limiterMu.Unlock()

	handler := insightRateLimit(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	var last int
	for range insightRateBurst + 1 {
		req := httptest.NewRequest(http.MethodPost, "/fetch-ai-insight", nil)
		req.Header.Set("X-Forwarded-For", "203.0.113.10")
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)
		last = rr.Code
	}
	if last != http.StatusTooManyRequests {
		t.Errorf("status past the burst allowance = %d, want 429", last)
	}
}

// --- handler behavior ---

type insightTestEnv struct {
	store         *fakeLedgerStore
	cacheWrites   chan []byte
	lastPersisted []byte
	upstream      int
}

// newInsightTestEnv isolates the handler from GCS and from the provider: the
// ledger, the persistent cache, and the generation call are all substituted, and
// the kill-switch memo is primed so it is never consulted over the network.
func newInsightTestEnv(t *testing.T) *insightTestEnv {
	t.Helper()
	t.Setenv("INSIGHTS_CACHE_BUCKET", "test-cache")
	t.Setenv("FLAGGED_INSIGHTS_BUCKET", "")
	t.Setenv("GEMINI_API_KEY", "test-key")
	t.Setenv("INSIGHT_NEGATIVE_EXAMPLES_ENABLED", "")
	t.Setenv("INSIGHT_MAX_GENERATIONS_PER_DAY", "50")
	t.Setenv("INSIGHT_MAX_GENERATIONS_PER_MONTH", "50")

	env := &insightTestEnv{store: newFakeLedgerStore(), cacheWrites: make(chan []byte, 4)}
	useFakeLedger(t, env.store)

	origRead, origWrite, origGen := insightCacheRead, insightCacheWrite, generateInsight
	killSwitchMu.Lock()
	origChecked, origOn := killSwitchChecked, killSwitchOn
	killSwitchChecked, killSwitchOn = time.Now(), false
	killSwitchMu.Unlock()

	t.Cleanup(func() {
		insightCacheRead, insightCacheWrite, generateInsight = origRead, origWrite, origGen
		killSwitchMu.Lock()
		killSwitchChecked, killSwitchOn = origChecked, origOn
		killSwitchMu.Unlock()
		insightMemCache.Clear()
	})

	insightMemCache.Clear()
	insightCacheRead = func(context.Context, string, string) string { return "" }
	insightCacheWrite = func(_ context.Context, _, _ string, data []byte, _ string) error {
		env.cacheWrites <- bytes.Clone(data)
		return nil
	}
	env.stubGeneration(func() (insightGeneration, error) {
		return insightGeneration{text: "generated", promptTokens: 10, outputTokens: 5}, nil
	})
	return env
}

func (e *insightTestEnv) stubGeneration(fn func() (insightGeneration, error)) {
	generateInsight = func(context.Context, string, string, string) (insightGeneration, error) {
		e.upstream++
		return fn()
	}
}

// post drives the handler and, when a generation succeeded, waits for the
// background persist before returning. Without that wait the goroutine can
// outlive the test and reach the real GCS client.
func (e *insightTestEnv) post(t *testing.T, body map[string]any) *httptest.ResponseRecorder {
	t.Helper()
	data, err := json.Marshal(body)
	if err != nil {
		t.Fatalf("marshal body: %v", err)
	}
	req := httptest.NewRequest(http.MethodPost, "/fetch-ai-insight", bytes.NewReader(data))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	before := e.upstream
	fetchAIInsightHandler(rr, req)

	generated := e.upstream > before && rr.Code == http.StatusOK && decodeBody(t, rr)["content"] != nil
	if generated {
		select {
		case e.lastPersisted = <-e.cacheWrites:
		case <-time.After(5 * time.Second):
			t.Fatal("the generated insight was never persisted")
		}
	}
	return rr
}

func decodeBody(t *testing.T, rr *httptest.ResponseRecorder) map[string]any {
	t.Helper()
	var out map[string]any
	if err := json.Unmarshal(rr.Body.Bytes(), &out); err != nil {
		t.Fatalf("decode response %q: %v", rr.Body.String(), err)
	}
	return out
}

func assertUnavailable(t *testing.T, rr *httptest.ResponseRecorder) {
	t.Helper()
	if rr.Code != http.StatusOK {
		t.Errorf("status = %d, want 200", rr.Code)
	}
	if got := decodeBody(t, rr)["unavailable"]; got != true {
		t.Errorf("body = %s, want unavailable", rr.Body.String())
	}
}

func TestInsightHandlerRejectsMissingPrompt(t *testing.T) {
	env := newInsightTestEnv(t)
	rr := env.post(t, map[string]any{"cacheKey": "k"})
	if rr.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want 400", rr.Code)
	}
}

func TestInsightHandlerRejectsOversizePrompt(t *testing.T) {
	env := newInsightTestEnv(t)
	rr := env.post(t, map[string]any{
		"prompt":   strings.Repeat("x", insightPromptMaxBytes+1),
		"cacheKey": "oversize",
	})
	if rr.Code != http.StatusRequestEntityTooLarge {
		t.Errorf("status = %d, want 413", rr.Code)
	}
	if env.upstream != 0 {
		t.Error("an oversize prompt reached the provider")
	}
}

func TestInsightHandlerGeneratesPersistsAndMeters(t *testing.T) {
	env := newInsightTestEnv(t)

	rr := env.post(t, map[string]any{"prompt": "describe this chart", "cacheKey": "chart-1"})
	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rr.Code)
	}
	if got := decodeBody(t, rr)["content"]; got != "generated" {
		t.Errorf("content = %v, want %q", got, "generated")
	}

	var payload map[string]any
	if err := json.Unmarshal(env.lastPersisted, &payload); err != nil {
		t.Fatalf("persisted payload is not valid JSON: %v", err)
	}
	if payload["content"] != "generated" {
		t.Errorf("persisted content = %v", payload["content"])
	}
	if _, ok := payload["timestamp"].(float64); !ok {
		t.Errorf("persisted payload has no usable timestamp: %v", payload["timestamp"])
	}

	led := env.store.ledger(t, ledgerObject(time.Now().UTC().Format("2006-01-02")))
	if led.Generations != 1 || led.PromptTokens != 10 || led.OutputTokens != 5 {
		t.Errorf("daily ledger = %+v, want 1 generation and 10/5 tokens", led)
	}
}

func TestInsightHandlerServesMemoryCacheWithoutGenerating(t *testing.T) {
	env := newInsightTestEnv(t)
	insightMemCache.Store("warm", insightMemEntry{content: "from memory", ts: time.Now()})

	rr := env.post(t, map[string]any{"prompt": "anything", "cacheKey": "warm"})
	if got := decodeBody(t, rr)["content"]; got != "from memory" {
		t.Errorf("content = %v, want the cached entry", got)
	}
	if env.upstream != 0 {
		t.Error("a warm cache entry still triggered generation")
	}
}

func TestInsightHandlerDiscardsExpiredMemoryEntry(t *testing.T) {
	env := newInsightTestEnv(t)
	insightMemCache.Store("cold", insightMemEntry{content: "stale", ts: time.Now().Add(-insightMemTTL - time.Hour)})

	rr := env.post(t, map[string]any{"prompt": "anything", "cacheKey": "cold"})
	if got := decodeBody(t, rr)["content"]; got != "generated" {
		t.Errorf("content = %v, want a freshly generated insight", got)
	}
	if env.upstream != 1 {
		t.Errorf("upstream calls = %d, want 1", env.upstream)
	}
}

func TestInsightHandlerServesPersistentCacheWithoutGenerating(t *testing.T) {
	env := newInsightTestEnv(t)
	insightCacheRead = func(context.Context, string, string) string { return "from gcs" }

	rr := env.post(t, map[string]any{"prompt": "anything", "cacheKey": "persisted"})
	if got := decodeBody(t, rr)["content"]; got != "from gcs" {
		t.Errorf("content = %v, want the persisted entry", got)
	}
	if env.upstream != 0 {
		t.Error("a persisted entry still triggered generation")
	}
	if _, ok := insightMemCache.Load("persisted"); !ok {
		t.Error("the persisted entry was not promoted into the memory cache")
	}
}

func TestInsightHandlerUnavailableWithoutLedgerBucket(t *testing.T) {
	env := newInsightTestEnv(t)
	t.Setenv("INSIGHTS_CACHE_BUCKET", "")

	assertUnavailable(t, env.post(t, map[string]any{"prompt": "p", "cacheKey": "k"}))
	if env.upstream != 0 {
		t.Error("generation ran with no bucket to meter it")
	}
}

func TestInsightHandlerUnavailableWhenGenerationDisabled(t *testing.T) {
	env := newInsightTestEnv(t)
	killSwitchMu.Lock()
	killSwitchOn = true
	killSwitchMu.Unlock()

	assertUnavailable(t, env.post(t, map[string]any{"prompt": "p", "cacheKey": "k"}))
	if env.upstream != 0 {
		t.Error("generation ran while the off switch was engaged")
	}
}

func TestInsightHandlerUnavailableWithoutAPIKey(t *testing.T) {
	env := newInsightTestEnv(t)
	t.Setenv("GEMINI_API_KEY", "")

	assertUnavailable(t, env.post(t, map[string]any{"prompt": "p", "cacheKey": "k"}))
	if env.upstream != 0 {
		t.Error("generation ran with no API key configured")
	}
}

func TestInsightHandlerStopsAtCeilings(t *testing.T) {
	tests := []struct {
		name  string
		day   string
		month string
	}{
		{"daily ceiling", "0", "50"},
		{"monthly ceiling", "50", "0"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			env := newInsightTestEnv(t)
			t.Setenv("INSIGHT_MAX_GENERATIONS_PER_DAY", tt.day)
			t.Setenv("INSIGHT_MAX_GENERATIONS_PER_MONTH", tt.month)

			assertUnavailable(t, env.post(t, map[string]any{"prompt": "p", "cacheKey": "k"}))
			if env.upstream != 0 {
				t.Error("generation ran past the ceiling")
			}
		})
	}
}

func TestInsightHandlerFailsClosedWhenLedgerUnreadable(t *testing.T) {
	env := newInsightTestEnv(t)
	env.store.loadErr = errors.New("bucket unreachable")

	assertUnavailable(t, env.post(t, map[string]any{"prompt": "p", "cacheKey": "k"}))
	if env.upstream != 0 {
		t.Error("generation ran without a usable ledger")
	}
}

func TestInsightHandlerMapsProviderQuotaTo429(t *testing.T) {
	env := newInsightTestEnv(t)
	env.stubGeneration(func() (insightGeneration, error) {
		return insightGeneration{promptTokens: 12}, errInsightQuota
	})

	rr := env.post(t, map[string]any{"prompt": "p", "cacheKey": "quota"})
	if rr.Code != http.StatusTooManyRequests {
		t.Errorf("status = %d, want 429", rr.Code)
	}
	if _, cached := insightMemCache.Load("quota"); cached {
		t.Error("a quota failure was cached")
	}
}

func TestInsightHandlerNeverCachesAnEmptyResult(t *testing.T) {
	env := newInsightTestEnv(t)
	env.stubGeneration(func() (insightGeneration, error) {
		return insightGeneration{promptTokens: 12, outputTokens: 0}, errInsightNoContent
	})

	assertUnavailable(t, env.post(t, map[string]any{"prompt": "p", "cacheKey": "blocked"}))

	if _, cached := insightMemCache.Load("blocked"); cached {
		t.Error("a blank insight was stored in the memory cache")
	}
	select {
	case data := <-env.cacheWrites:
		t.Errorf("a blank insight was persisted: %s", data)
	case <-time.After(100 * time.Millisecond):
	}
	// The call still cost tokens, so it must still be accounted for.
	led := env.store.ledger(t, ledgerObject(time.Now().UTC().Format("2006-01-02")))
	if led.Generations != 1 || led.PromptTokens != 12 {
		t.Errorf("daily ledger = %+v, want the failed call metered", led)
	}
}

func TestInsightHandlerReturns500OnProviderError(t *testing.T) {
	env := newInsightTestEnv(t)
	env.stubGeneration(func() (insightGeneration, error) {
		return insightGeneration{}, errors.New("upstream exploded")
	})

	rr := env.post(t, map[string]any{"prompt": "p", "cacheKey": "boom"})
	if rr.Code != http.StatusInternalServerError {
		t.Errorf("status = %d, want 500", rr.Code)
	}
}

func TestInsightHandlerFallsBackToPromptAsCacheKey(t *testing.T) {
	env := newInsightTestEnv(t)
	var seen string
	insightCacheRead = func(_ context.Context, _, key string) string {
		seen = key
		return ""
	}

	env.post(t, map[string]any{"prompt": "no key supplied"})
	if seen != "no key supplied" {
		t.Errorf("cache key = %q, want the prompt itself", seen)
	}
	if env.upstream != 1 {
		t.Errorf("upstream calls = %d, want 1", env.upstream)
	}
}
