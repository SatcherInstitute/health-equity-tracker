package main

import (
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

type downloadFn func(bucket, name string) ([]byte, error)

func newTestRouter(mock *mockGCS) http.Handler {
	datasetCache = newByteCache(maxCacheBytes, cacheTTL)
	return newRouterWith(func(bucket, name string) ([]byte, error) {
		return mock.download(bucket, name)
	})
}

func newRouterWith(dl downloadFn) http.Handler {
	c := newByteCache(maxCacheBytes, cacheTTL)
	cachedDl := func(bucket, name string) ([]byte, error) {
		if data, ok := c.get(name); ok {
			return data, nil
		}
		data, err := dl(bucket, name)
		if err != nil {
			return nil, err
		}
		c.set(name, data)
		return data, nil
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /metadata", func(w http.ResponseWriter, r *http.Request) {
		data, err := cachedDl("test-bucket", "test_data.ndjson")
		if err != nil {
			http.Error(w, "Internal server error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Disposition", "attachment; filename=test_data.ndjson")
		w.Header().Set("Vary", "Accept-Encoding")
		w.Header().Set("Content-Type", "application/json")
		w.Write(ndjsonToArray(data))
	})
	mux.HandleFunc("GET /dataset", func(w http.ResponseWriter, r *http.Request) {
		name := r.URL.Query().Get("name")
		if name == "" {
			http.Error(w, "Request missing required url param 'name'", http.StatusBadRequest)
			return
		}
		data, err := cachedDl("test-bucket", name)
		if err != nil {
			http.Error(w, "Internal server error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Disposition", "attachment; filename="+name)
		w.Header().Set("Vary", "Accept-Encoding")
		w.Header().Set("Cache-Control", cacheControlHeader)
		if strings.HasSuffix(name, ".csv") {
			w.Header().Set("Content-Type", "text/csv")
			w.Write(data)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(ndjsonToArray(data))
	})
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
	healthHandler(rr, httptest.NewRequest(http.MethodGet, "/", nil))
	if rr.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rr.Code)
	}
}

// --- metadata ---

func TestGetMetadata(t *testing.T) {
	mock := &mockGCS{data: map[string][]byte{"test_data.ndjson": testNDJSON}}
	h := newTestRouter(mock)
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
	h := newTestRouter(mock)
	get(h, "/metadata")
	get(h, "/metadata")
	if mock.hits != 1 {
		t.Errorf("expected 1 GCS call (second should use cache), got %d", mock.hits)
	}
}

func TestGetMetadataInternalError(t *testing.T) {
	mock := &mockGCS{err: &mockNotFoundError{name: "test_data.ndjson"}}
	h := newTestRouter(mock)
	rr := get(h, "/metadata")
	if rr.Code != http.StatusInternalServerError {
		t.Errorf("expected 500, got %d", rr.Code)
	}
}

// --- dataset ---

func TestGetDatasetJSON(t *testing.T) {
	mock := &mockGCS{data: map[string][]byte{"test_dataset": testNDJSON}}
	h := newTestRouter(mock)
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
	h := newTestRouter(mock)
	for _, path := range []string{"/dataset", "/dataset?random_param=stuff"} {
		rr := get(h, path)
		if rr.Code != http.StatusBadRequest {
			t.Errorf("%s: expected 400, got %d", path, rr.Code)
		}
	}
}

func TestGetDatasetCSV(t *testing.T) {
	mock := &mockGCS{data: map[string][]byte{"test.csv": testCSV}}
	h := newTestRouter(mock)
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
		{"café", "caf_"},  // non-ASCII replaced with _
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
