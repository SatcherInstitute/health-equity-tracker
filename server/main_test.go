package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// --- shared test fixtures ---

var testNDJSON = []byte(
	`{"label1":"value1","label2":["value2a","value2b"],"label3":"value3"}` + "\n" +
		`{"label1":"value2","label2":["value3a","value2b"],"label3":"value6"}` + "\n" +
		`{"label1":"value3","label2":["value4a","value2b"],"label3":"value9"}` + "\n" +
		`{"label1":"value4","label2":["value5a","value2b"],"label3":"value12"}` + "\n" +
		`{"label1":"value5","label2":["value6a","value2b"],"label3":"value15"}` + "\n" +
		`{"label1":"value6","label2":["value7a","value2b"],"label3":"value18"}` + "\n",
)

var testCSV = []byte("label1,label2,label3\nvalueA,valueB,valueC\nvalueD,valueE,valueF\n")

type mockGCS struct {
	data map[string][]byte
	err  error
	hits int
}

func (m *mockGCS) download(_, name string) ([]byte, error) {
	m.hits++
	if m.err != nil {
		return nil, m.err
	}
	if d, ok := m.data[name]; ok {
		return d, nil
	}
	return nil, &mockNotFoundError{name: name}
}

type mockNotFoundError struct{ name string }

func (e *mockNotFoundError) Error() string { return "not found: " + e.name }

// newTestRouter wires the real metadataHandler and datasetHandler against a
// mock GCS backend. Tests exercise the actual handler code rather than a
// reimplementation, so routing bugs and middleware changes are caught.
func newTestRouter(t *testing.T, mock *mockGCS) http.Handler {
	t.Helper()
	t.Setenv("GCS_BUCKET", "test-bucket")
	t.Setenv("METADATA_FILENAME", "test_data.ndjson")
	datasetCache = newByteCache(maxCacheBytes, cacheTTL)
	gcsDownload = func(_ context.Context, bucket, name string) ([]byte, error) {
		return mock.download(bucket, name)
	}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /metadata", metadataHandler)
	mux.HandleFunc("GET /dataset", datasetHandler)
	return corsMiddleware(mux)
}

func get(handler http.Handler, path string) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, httptest.NewRequest(http.MethodGet, path, nil))
	return rr
}

// --- health ---

func TestHealthHandler(t *testing.T) {
	rr := httptest.NewRecorder()
	healthHandler(rr, httptest.NewRequest(http.MethodGet, "/health", nil))
	if rr.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rr.Code)
	}
	if ct := rr.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("expected application/json, got %s", ct)
	}
}

// --- metadata ---

func TestGetMetadata(t *testing.T) {
	mock := &mockGCS{data: map[string][]byte{"test_data.ndjson": testNDJSON}}
	h := newTestRouter(t, mock)
	rr := get(h, "/metadata")

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
	if mock.hits != 1 {
		t.Errorf("expected 1 GCS call, got %d", mock.hits)
	}
	if rr.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Error("missing CORS header")
	}
	var arr []map[string]any
	if err := json.Unmarshal(rr.Body.Bytes(), &arr); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if len(arr) != 6 {
		t.Errorf("expected 6 rows, got %d", len(arr))
	}
}

func TestGetMetadataFromCache(t *testing.T) {
	mock := &mockGCS{data: map[string][]byte{"test_data.ndjson": testNDJSON}}
	h := newTestRouter(t, mock)
	get(h, "/metadata")
	get(h, "/metadata")
	if mock.hits != 1 {
		t.Errorf("expected 1 GCS call (second should use cache), got %d", mock.hits)
	}
}

func TestGetMetadataInternalError(t *testing.T) {
	mock := &mockGCS{err: &mockNotFoundError{name: "test_data.ndjson"}}
	h := newTestRouter(t, mock)
	rr := get(h, "/metadata")
	if rr.Code != http.StatusInternalServerError {
		t.Errorf("expected 500, got %d", rr.Code)
	}
}

// --- dataset ---

func TestGetDatasetJSON(t *testing.T) {
	mock := &mockGCS{data: map[string][]byte{"test_dataset": testNDJSON}}
	h := newTestRouter(t, mock)
	rr := get(h, "/dataset?name=test_dataset")

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
	if rr.Header().Get("Cache-Control") != cacheControlHeader {
		t.Errorf("Cache-Control: %s", rr.Header().Get("Cache-Control"))
	}
	var arr []any
	if err := json.Unmarshal(rr.Body.Bytes(), &arr); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
}

func TestGetDatasetMissingParam(t *testing.T) {
	mock := &mockGCS{}
	h := newTestRouter(t, mock)
	for _, path := range []string{"/dataset", "/dataset?random_param=stuff"} {
		rr := get(h, path)
		if rr.Code != http.StatusBadRequest {
			t.Errorf("%s: expected 400, got %d", path, rr.Code)
		}
	}
}

func TestGetDatasetCSV(t *testing.T) {
	mock := &mockGCS{data: map[string][]byte{"test.csv": testCSV}}
	h := newTestRouter(t, mock)
	rr := get(h, "/dataset?name=test.csv")

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
	if ct := rr.Header().Get("Content-Type"); ct != "text/csv" {
		t.Errorf("Content-Type: %s", ct)
	}
}

// --- ndjsonToArray ---

func TestNdjsonToArray(t *testing.T) {
	cases := []struct {
		input  string
		expect string
	}{
		{"", "[]"},
		{"\n", "[]"},
		{`{"a":1}` + "\n", `[{"a":1}]`},
		{`{"a":1}` + "\n" + `{"b":2}` + "\n", `[{"a":1},{"b":2}]`},
	}
	for _, tc := range cases {
		got := string(ndjsonToArray([]byte(tc.input)))
		if got != tc.expect {
			t.Errorf("ndjsonToArray(%q) = %q, want %q", tc.input, got, tc.expect)
		}
	}
}

// --- byteCache ---

func TestByteCacheTTLExpiry(t *testing.T) {
	c := newByteCache(1024, 10*time.Millisecond)
	c.set("key", []byte("value"))
	if _, ok := c.get("key"); !ok {
		t.Fatal("expected cache hit before TTL")
	}
	time.Sleep(20 * time.Millisecond)
	if _, ok := c.get("key"); ok {
		t.Fatal("expected cache miss after TTL")
	}
}

func TestByteCacheEviction(t *testing.T) {
	c := newByteCache(5, time.Hour)
	c.set("a", []byte("12345"))
	c.set("b", []byte("67890")) // should evict "a"
	if _, ok := c.get("a"); ok {
		t.Error("expected 'a' to be evicted")
	}
	if _, ok := c.get("b"); !ok {
		t.Error("expected 'b' to be present")
	}
}

// --- validateInsightKey ---

func TestValidateInsightKey(t *testing.T) {
	if validateInsightKey("") {
		t.Error("empty key should be invalid")
	}
	if validateInsightKey(strings.Repeat("x", insightKeyMaxLen+1)) {
		t.Error("over-length key should be invalid")
	}
	if validateInsightKey("foo/../bar") {
		t.Error("key with .. should be invalid")
	}
	if !validateInsightKey("valid/key/123") {
		t.Error("valid key should pass")
	}
}

// --- sanitizeInsightKey ---

func TestSanitizeInsightKey(t *testing.T) {
	cases := []struct {
		input  string
		expect string
	}{
		{"hello world", "hello world"},
		{"café", "caf_"}, // non-ASCII replaced with _
		{strings.Repeat("a", 600), strings.Repeat("a", 500)},
		{"", ""},
	}
	for _, tc := range cases {
		got := sanitizeInsightKey(tc.input)
		if got != tc.expect {
			t.Errorf("sanitizeInsightKey(%q) = %q, want %q", tc.input, got, tc.expect)
		}
	}
}

// --- rateLimitStatus ---

func TestRateLimitStatusHandler(t *testing.T) {
	rr := httptest.NewRecorder()
	rateLimitStatusHandler(rr, httptest.NewRequest(http.MethodGet, "/rate-limit-status", nil))
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
	var result map[string]bool
	if err := json.Unmarshal(rr.Body.Bytes(), &result); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if result["rateLimitReached"] {
		t.Error("rateLimitReached should be false")
	}
}

// --- setCacheControl ---

func TestSetCacheControl(t *testing.T) {
	cases := []struct {
		path   string
		expect string
	}{
		{"/assets/main.abc123.js", "public, max-age=31536000, immutable"},
		{"/index.html", "no-cache, no-store, must-revalidate"},
		{"/favicon.ico", "public, max-age=7200"},
		{"/manifest.json", "public, max-age=7200"},
	}
	for _, tc := range cases {
		w := httptest.NewRecorder()
		setCacheControl(w, tc.path)
		got := w.Header().Get("Cache-Control")
		if got != tc.expect {
			t.Errorf("setCacheControl(%q) = %q, want %q", tc.path, got, tc.expect)
		}
	}
}

// --- staticHandler ---

func TestStaticHandlerServesFile(t *testing.T) {
	dir := t.TempDir()
	assetsDir := filepath.Join(dir, "assets")
	os.Mkdir(assetsDir, 0755)
	os.WriteFile(filepath.Join(assetsDir, "app.abc.js"), []byte("console.log('hi')"), 0644)
	os.WriteFile(filepath.Join(dir, "index.html"), []byte("<html></html>"), 0644)

	h := staticHandler(dir)

	// Known file gets served with correct Cache-Control
	rr := httptest.NewRecorder()
	h.ServeHTTP(rr, httptest.NewRequest(http.MethodGet, "/assets/app.abc.js", nil))
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
	if cc := rr.Header().Get("Cache-Control"); cc != "public, max-age=31536000, immutable" {
		t.Errorf("Cache-Control: %s", cc)
	}
}

func TestStaticHandlerSPAFallback(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "index.html"), []byte("<html>SPA</html>"), 0644)

	h := staticHandler(dir)

	// Unknown path falls back to index.html
	rr := httptest.NewRecorder()
	h.ServeHTTP(rr, httptest.NewRequest(http.MethodGet, "/explore-data", nil))
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
	if !strings.Contains(rr.Body.String(), "SPA") {
		t.Error("expected index.html body in SPA fallback")
	}
	if cc := rr.Header().Get("Cache-Control"); !strings.Contains(cc, "no-store") {
		t.Errorf("SPA fallback Cache-Control should be no-store, got: %s", cc)
	}
}

// --- endpoint guards as wired (#5168) ---

// These assert the middleware a route actually carries, not that the middleware
// works in isolation. Flagging is a write that also deletes: it evicts the
// cached insight, and every eviction is a future generation against the daily
// ceiling, so an unguarded route is a way to spend the day's budget for free.
func TestInsightWriteRoutesAreGuarded(t *testing.T) {
	t.Setenv("ADMIN_TOKEN", "secret")
	r := newRouter(t.TempDir())

	body := `{"cacheKey":"abc","reason":"inaccurate"}`

	tests := []struct {
		name    string
		method  string
		path    string
		origin  string
		auth    string
		notWant int
		desc    string
	}{
		{
			name:    "flag-insight refuses a request with no Origin",
			method:  http.MethodPost,
			path:    "/flag-insight",
			notWant: http.StatusBadRequest,
			desc:    "reaching body validation means the origin gate did not run",
		},
		{
			name:    "flag-insight refuses a foreign Origin",
			method:  http.MethodPost,
			path:    "/flag-insight",
			origin:  "https://evil.example.com",
			notWant: http.StatusBadRequest,
			desc:    "a foreign origin must not reach the handler",
		},
		{
			name:    "flagged-examples refuses an unauthenticated caller",
			method:  http.MethodGet,
			path:    "/flagged-examples",
			notWant: http.StatusOK,
			desc:    "it returns flagged insight text and the reasons they were flagged",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			generationLimiters.reset()
			flagLimiters.reset()

			req := httptest.NewRequest(tt.method, tt.path, strings.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			if tt.origin != "" {
				req.Header.Set("Origin", tt.origin)
			}
			if tt.auth != "" {
				req.Header.Set("Authorization", tt.auth)
			}
			rr := httptest.NewRecorder()
			r.ServeHTTP(rr, req)

			if rr.Code == tt.notWant {
				t.Errorf("status = %d, which it must not be: %s", rr.Code, tt.desc)
			}
			if rr.Code != http.StatusForbidden && rr.Code != http.StatusUnauthorized {
				t.Errorf("status = %d, want 401 or 403", rr.Code)
			}
		})
	}
}

// An allowed origin has to still get through, or the gate would be protecting
// the endpoint from its only legitimate caller.
func TestFlagInsightAcceptsAnAllowedOrigin(t *testing.T) {
	r := newRouter(t.TempDir())
	generationLimiters.reset()
	flagLimiters.reset()

	req := httptest.NewRequest(http.MethodPost, "/flag-insight", strings.NewReader(`{"bad":"body"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Origin", "https://healthequitytracker.org")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	// 400 is the handler rejecting the body, which means the request cleared
	// both the origin gate and the rate limiter.
	if rr.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want 400 from the handler's own validation", rr.Code)
	}
}

// Flagging gets a tighter allowance than generation because the behavior needs
// far less, and because each flag evicts a cache entry.
func TestFlagRateLimitIsTighterThanGeneration(t *testing.T) {
	if flagRatePerMinute >= insightRatePerMinute || flagRateBurst >= insightRateBurst {
		t.Fatalf("flag allowance (%d/min burst %d) is not tighter than generation's (%d/min burst %d)",
			flagRatePerMinute, flagRateBurst, insightRatePerMinute, insightRateBurst)
	}

	r := newRouter(t.TempDir())
	flagLimiters.reset()

	var last int
	for range flagRateBurst + 1 {
		req := httptest.NewRequest(http.MethodPost, "/flag-insight", strings.NewReader(`{"bad":"body"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Origin", "https://healthequitytracker.org")
		req.Header.Set("X-Forwarded-For", "203.0.113.44")
		rr := httptest.NewRecorder()
		r.ServeHTTP(rr, req)
		last = rr.Code
	}
	if last != http.StatusTooManyRequests {
		t.Errorf("status past the flag burst allowance = %d, want 429", last)
	}
}
