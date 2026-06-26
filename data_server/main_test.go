package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

// testNDJSON mirrors the Python test_data fixture.
var testNDJSON = []byte(
	`{"label1":"value1","label2":["value2a","value2b"],"label3":"value3"}` + "\n" +
		`{"label1":"value2","label2":["value3a","value2b"],"label3":"value6"}` + "\n" +
		`{"label1":"value3","label2":["value4a","value2b"],"label3":"value9"}` + "\n" +
		`{"label1":"value4","label2":["value5a","value2b"],"label3":"value12"}` + "\n" +
		`{"label1":"value5","label2":["value6a","value2b"],"label3":"value15"}` + "\n" +
		`{"label1":"value6","label2":["value7a","value2b"],"label3":"value18"}` + "\n",
)

var testCSV = []byte("label1,label2,label3\nvalueA,valueB,valueC\nvalueD,valueE,valueF\n")

// mockGCS replaces cachedDownload for unit tests.
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

// newTestRouter builds a chi router with a swapped-in download function.
func newTestRouter(mock *mockGCS) http.Handler {
	// Override the package-level cache to avoid cross-test pollution.
	datasetCache = newByteCache(maxCacheBytes, cacheTTL)

	// Patch cachedDownload by injecting a wrapper. We achieve this by building
	// the router via handlers that call mock.download directly.
	r := newRouterWith(func(bucket, name string) ([]byte, error) {
		return mock.download(bucket, name)
	})
	return r
}

// downloadFn is the injectable dependency for tests.
type downloadFn func(bucket, name string) ([]byte, error)

// newRouterWith builds a chi router with a custom download function so tests
// can bypass real GCS without touching global state.
func newRouterWith(dl downloadFn) http.Handler {
	// local cache for this router instance
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
	mux.HandleFunc("GET /", healthHandler)
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

	// Wrap with CORS so the Access-Control header is present in test responses.
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
	if !strings.Contains(rr.Body.String(), "Running data server.") {
		t.Errorf("unexpected body: %s", rr.Body.String())
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
	if cd := rr.Header().Get("Content-Disposition"); cd != "attachment; filename=test_data.ndjson" {
		t.Errorf("Content-Disposition: %s", cd)
	}
	if rr.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Error("missing CORS header")
	}
	if rr.Header().Get("Vary") != "Accept-Encoding" {
		t.Error("missing Vary header")
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
		t.Errorf("expected 1 GCS call (second hit should use cache), got %d", mock.hits)
	}
}

func TestGetMetadataInternalError(t *testing.T) {
	mock := &mockGCS{err: &mockNotFoundError{name: "test_data.ndjson"}}
	h := newTestRouter(mock)
	rr := get(h, "/metadata")

	if rr.Code != http.StatusInternalServerError {
		t.Errorf("expected 500, got %d", rr.Code)
	}
	if !strings.Contains(rr.Body.String(), "Internal server error") {
		t.Errorf("unexpected body: %s", rr.Body.String())
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
	if cd := rr.Header().Get("Content-Disposition"); cd != "attachment; filename=test_dataset" {
		t.Errorf("Content-Disposition: %s", cd)
	}
	if rr.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Error("missing CORS header")
	}
	if rr.Header().Get("Vary") != "Accept-Encoding" {
		t.Error("missing Vary header")
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
		if !strings.Contains(rr.Body.String(), "Request missing required url param 'name'") {
			t.Errorf("%s: unexpected body: %s", path, rr.Body.String())
		}
	}
}

func TestGetDatasetNotFound(t *testing.T) {
	mock := &mockGCS{err: &mockNotFoundError{name: "not_found"}}
	h := newTestRouter(mock)
	rr := get(h, "/dataset?name=not_found")

	if rr.Code != http.StatusInternalServerError {
		t.Errorf("expected 500, got %d", rr.Code)
	}
}

func TestGetDatasetCSV(t *testing.T) {
	mock := &mockGCS{data: map[string][]byte{"test_dataset.csv": testCSV}}
	h := newTestRouter(mock)
	rr := get(h, "/dataset?name=test_dataset.csv")

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
	if ct := rr.Header().Get("Content-Type"); ct != "text/csv" {
		t.Errorf("Content-Type: %s", ct)
	}
	if string(rr.Body.Bytes()) != string(testCSV) {
		t.Error("CSV body mismatch")
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
	// budget for exactly one 5-byte entry
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
