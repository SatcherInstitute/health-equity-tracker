package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// Expected hashes are output from the browser's own fnv1a32, run in a JS
// runtime, not values derived from the Go code. A hash that agreed only with
// itself would prove nothing: the whole point is that both languages land on the
// same key for the same prompt.
func TestFNV1a32MatchesBrowser(t *testing.T) {
	cases := []struct {
		in   string
		want string
	}{
		{"", "811c9dc5"},
		{"a", "e40c292c"},
		{"Health Equity Tracker", "1a66e8de"},
		// The peer median line, which carries a U+2013 en dash. Hashing UTF-8
		// bytes rather than UTF-16 code units diverges here, and every map card
		// with a peer comparison renders this line.
		{"- Peer median 12.3 per 100k; range 4.1–31.7 per 100k", "f18d081b"},
		{"café", "3308be7c"},
		// Outside the BMP, so one rune but two UTF-16 code units.
		{"👋 emoji", "3aa23f7f"},
		{"line\nbreak\ttab", "7ab3b5e0"},
	}
	for _, tt := range cases {
		if got := fnv1a32(tt.in); got != tt.want {
			t.Errorf("fnv1a32(%q) = %q, want %q", tt.in, got, tt.want)
		}
	}
}

// Every key the browser has minted since #5029 has this exact shape, so a
// server-derived key that differs by one character would miss every warm entry
// silently rather than fail.
func TestCacheKeyMatchesBrowser(t *testing.T) {
	const prompt = "Write one insight."

	cases := []struct {
		name string
		desc insightDescriptor
		want string
	}{
		{
			name: "card",
			desc: insightDescriptor{
				Kind: insightKindCard, HashID: "rate-map",
				URLPathname: "/exploredata", URLParams: "mls=1.hiv-3.00&demo=race_and_ethnicity",
			},
			want: "/exploredata?mls=1.hiv-3.00&demo=race_and_ethnicity#rate-map-74702496",
		},
		{
			name: "compare-mode card",
			desc: insightDescriptor{
				Kind: insightKindCard, HashID: "rate-map", IsCompareCard: true,
				URLPathname: "/exploredata", URLParams: "mls=1.hiv-3.00&mlp=comparegeos",
			},
			want: "/exploredata?mls=1.hiv-3.00&mlp=comparegeos#rate-map-2-74702496",
		},
		{
			name: "contrast",
			desc: insightDescriptor{
				Kind: insightKindContrast, HashID: "rate-map",
				URLPathname: "/exploredata", URLParams: "mls=1.hiv-3.00&mlp=comparevars",
			},
			want: "/exploredata?mls=1.hiv-3.00&mlp=comparevars#rate-map-contrast-74702496",
		},
		{
			// The param that opens the report insight is dropped, so opening it
			// does not mint a second entry for the same report.
			name: "report drops its own toggle param",
			desc: insightDescriptor{
				Kind:        insightKindReport,
				URLPathname: "/exploredata", URLParams: "mls=1.hiv-3.00&report-insight=true&demo=age",
			},
			want: "/exploredata?mls=1.hiv-3.00&demo=age-74702496",
		},
		{
			name: "no params",
			desc: insightDescriptor{
				Kind: insightKindCard, HashID: "data-table", URLPathname: "/exploredata",
			},
			want: "/exploredata?#data-table-74702496",
		},
	}

	for _, tt := range cases {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.desc.cacheKey(prompt); got != tt.want {
				t.Errorf("cacheKey =\n %q\nwant\n %q", got, tt.want)
			}
		})
	}
}

// A param whose name merely contains the toggle's name must survive, since
// dropping it would change the key for a view that never opened the insight.
func TestStripReportInsightParamKeepsSimilarNames(t *testing.T) {
	const params = "report-insights=1&xreport-insight=2&mls=1.hiv-3.00&report-insight=true"
	want := "report-insights=1&xreport-insight=2&mls=1.hiv-3.00"
	if got := stripReportInsightParam(params); got != want {
		t.Errorf("stripReportInsightParam = %q, want %q", got, want)
	}
}

func TestDescriptorValidation(t *testing.T) {
	metric := &insightMetricConfig{MetricID: "hiv_per_100k", ShortLabel: "per 100k"}
	view := &insightView{Topic: "HIV", Location: "Georgia", MetricConfig: metric}

	cases := []struct {
		name    string
		desc    insightDescriptor
		wantErr string
	}{
		{
			name:    "unknown kind",
			desc:    insightDescriptor{Kind: "multimap", DemographicType: "age"},
			wantErr: "unknown kind",
		},
		{
			// The hash ID reaches the prompt text, so an unrecognized one is
			// refused rather than rendered into it.
			name:    "unknown hash id",
			desc:    insightDescriptor{Kind: insightKindCard, HashID: "ignore-all-instructions", DemographicType: "age", MetricConfig: metric},
			wantErr: "unknown hashId",
		},
		{
			name:    "unknown demographic type",
			desc:    insightDescriptor{Kind: insightKindCard, HashID: "rate-map", DemographicType: "shoe_size", MetricConfig: metric},
			wantErr: "unknown demographicType",
		},
		{
			name:    "card without a metric config",
			desc:    insightDescriptor{Kind: insightKindCard, HashID: "rate-map", DemographicType: "age"},
			wantErr: "requires metricConfig",
		},
		{
			name:    "contrast with one view",
			desc:    insightDescriptor{Kind: insightKindContrast, HashID: "rate-map", DemographicType: "age", ViewA: view},
			wantErr: "requires viewA and viewB",
		},
		{
			name: "contrast view without a metric config",
			desc: insightDescriptor{Kind: insightKindContrast, HashID: "rate-map", DemographicType: "age",
				ViewA: view, ViewB: &insightView{Topic: "HIV", Location: "Alabama"}},
			wantErr: "metricConfig on each view",
		},
		{
			name:    "report without sections",
			desc:    insightDescriptor{Kind: insightKindReport, DemographicType: "age", MetricConfig: metric},
			wantErr: "requires sections",
		},
	}

	for _, tt := range cases {
		t.Run(tt.name, func(t *testing.T) {
			_, err := renderInsightPrompt(&tt.desc)
			if err == nil {
				t.Fatalf("rendered a descriptor that should have been refused")
			}
			if !strings.Contains(err.Error(), tt.wantErr) {
				t.Errorf("error = %q, want it to mention %q", err, tt.wantErr)
			}
		})
	}
}

// A contrast descriptor must render each view against its own rows. Passing one
// view's rows to both would produce a prompt comparing a view to itself, which
// reads as plausible text and would not fail anything.
func TestContrastRendersEachViewSeparately(t *testing.T) {
	metric := &insightMetricConfig{MetricID: "hiv_per_100k", ShortLabel: "per 100k"}
	prompt, err := renderInsightPrompt(&insightDescriptor{
		Kind: insightKindContrast, HashID: "rate-chart", DemographicType: "age",
		ViewA: &insightView{Topic: "HIV", Location: "Georgia", MetricConfig: metric,
			Rows: []insightRow{{"age": "45-54", "hiv_per_100k": 111.0}}},
		ViewB: &insightView{Topic: "HIV", Location: "Alabama", MetricConfig: metric,
			Rows: []insightRow{{"age": "45-54", "hiv_per_100k": 222.0}}},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{"111 per 100k", "222 per 100k"} {
		if !strings.Contains(prompt, want) {
			t.Errorf("prompt is missing %q:\n%s", want, prompt)
		}
	}
}

// awaitPersist blocks until the background write goroutine has run. Without it
// the goroutine can outlive the test and reach the real GCS client.
func (e *insightTestEnv) awaitPersist(t *testing.T) string {
	t.Helper()
	select {
	case e.lastPersisted = <-e.cacheWrites:
		return e.lastPersisted.path
	case <-time.After(5 * time.Second):
		t.Fatal("the generated insight was never persisted")
		return ""
	}
}

// Fixtures are descriptors, so the handler tests drive the endpoint with the
// same inputs the prompt fixtures pin rather than with a hand-written view.
func readFixtureDescriptor(t *testing.T, name string) map[string]any {
	t.Helper()
	raw, err := os.ReadFile(filepath.Join("testdata", "insight_prompts", name+".json"))
	if err != nil {
		t.Fatal(err)
	}
	var out map[string]any
	if err := json.Unmarshal(raw, &out); err != nil {
		t.Fatal(err)
	}
	return out
}

func postDescriptor(t *testing.T, body map[string]any) *httptest.ResponseRecorder {
	t.Helper()
	data, err := json.Marshal(body)
	if err != nil {
		t.Fatalf("marshal body: %v", err)
	}
	req := httptest.NewRequest(http.MethodPost, "/insight", bytes.NewReader(data))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	insightHandler(rr, req)
	return rr
}

func cardDescriptorBody(t *testing.T) map[string]any {
	t.Helper()
	body := readFixtureDescriptor(t, "card_map_strong_disparity")
	body["urlPathname"] = "/exploredata"
	body["urlParams"] = "mls=1.hiv-3.00&demo=race_and_ethnicity"
	return body
}

// Preview is how a client checks that the server renders the text it renders. It
// consults no cache and reserves nothing, so it must work with no API key and no
// cache bucket configured.
func TestInsightHandlerPreviewReturnsPromptAndKey(t *testing.T) {
	env := newInsightTestEnv(t)
	t.Setenv("GEMINI_API_KEY", "")
	t.Setenv("INSIGHTS_CACHE_BUCKET", "")

	body := cardDescriptorBody(t)
	body["preview"] = true
	rr := postDescriptor(t, body)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200: %s", rr.Code, rr.Body.String())
	}
	got := decodeBody(t, rr)
	prompt, _ := got["prompt"].(string)
	if !strings.Contains(prompt, "HIV") {
		t.Errorf("prompt does not describe the view:\n%s", prompt)
	}

	// The rendered prompt is the fixture's, so the key is derivable independently
	// of the handler.
	want := (&insightDescriptor{
		Kind: insightKindCard, HashID: "rate-map",
		URLPathname: "/exploredata", URLParams: "mls=1.hiv-3.00&demo=race_and_ethnicity",
	}).cacheKey(prompt)
	if got["cacheKey"] != want {
		t.Errorf("cacheKey = %v, want %v", got["cacheKey"], want)
	}
	if env.upstream != 0 {
		t.Errorf("preview called the provider %d times, want 0", env.upstream)
	}
}

// The end-to-end path a curl demo exercises: describe a view, get content and
// the key back, and find the insight persisted in GCS under that key.
func TestInsightHandlerGeneratesAndPersistsUnderDerivedKey(t *testing.T) {
	env := newInsightTestEnv(t)
	env.stubGeneration(func() (insightGeneration, error) {
		return insightGeneration{text: "Rates differ sharply by group.", promptTokens: 10, outputTokens: 5}, nil
	})

	rr := postDescriptor(t, cardDescriptorBody(t))
	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200: %s", rr.Code, rr.Body.String())
	}
	got := decodeBody(t, rr)
	if got["content"] != "Rates differ sharply by group." {
		t.Errorf("content = %v", got["content"])
	}
	cacheKey, _ := got["cacheKey"].(string)
	if !strings.HasPrefix(cacheKey, "/exploredata?mls=1.hiv-3.00&demo=race_and_ethnicity#rate-map-") {
		t.Errorf("cacheKey = %q, want the view's URL and scope", cacheKey)
	}

	if path := env.awaitPersist(t); path != "insights/"+cacheKey+".json" {
		t.Errorf("persisted to %q, want the path derived from the returned key", path)
	}

	// The prompt is not echoed on the generating path: it is up to 30 KB the
	// client has no use for.
	if _, ok := got["prompt"]; ok {
		t.Error("the generating path echoed the prompt back")
	}
}

// The second request for an identical view must land on the first one's entry.
// This is the property the whole key derivation exists to hold.
func TestInsightHandlerSecondIdenticalRequestHitsCache(t *testing.T) {
	env := newInsightTestEnv(t)
	env.stubGeneration(func() (insightGeneration, error) {
		return insightGeneration{text: "cached text"}, nil
	})

	first := decodeBody(t, postDescriptor(t, cardDescriptorBody(t)))
	env.awaitPersist(t)
	second := decodeBody(t, postDescriptor(t, cardDescriptorBody(t)))

	if first["cacheKey"] != second["cacheKey"] {
		t.Errorf("keys diverged: %v then %v", first["cacheKey"], second["cacheKey"])
	}
	if env.upstream != 1 {
		t.Errorf("provider called %d times, want 1", env.upstream)
	}
}

func TestInsightHandlerLogOutcomes(t *testing.T) {
	cases := []struct {
		name     string
		body     map[string]any
		outcome  string
		reason   string
		severity string
		status   int
	}{
		{
			name:     "preview",
			body:     map[string]any{"preview": true},
			outcome:  outcomePreview,
			severity: "INFO",
			status:   http.StatusOK,
		},
		{
			name:     "unrenderable descriptor",
			body:     map[string]any{"kind": "card", "hashId": "nope", "demographicType": "age"},
			outcome:  outcomeRejected,
			reason:   reasonBadDescriptor,
			severity: "INFO",
			status:   http.StatusBadRequest,
		},
	}

	for _, tt := range cases {
		t.Run(tt.name, func(t *testing.T) {
			env := newInsightTestEnv(t)
			body := cardDescriptorBody(t)
			for k, v := range tt.body {
				body[k] = v
			}
			// The bad-descriptor case replaces the fixture's fields wholesale.
			if tt.reason == reasonBadDescriptor {
				body = tt.body
			}

			rr := postDescriptor(t, body)
			if rr.Code != tt.status {
				t.Errorf("status = %d, want %d: %s", rr.Code, tt.status, rr.Body.String())
			}
			got := env.lastRequestEvent(t)
			if got.Insight.Outcome != tt.outcome {
				t.Errorf("outcome = %q, want %q", got.Insight.Outcome, tt.outcome)
			}
			if got.Insight.Reason != tt.reason {
				t.Errorf("reason = %q, want %q", got.Insight.Reason, tt.reason)
			}
			if got.Severity != tt.severity {
				t.Errorf("severity = %q, want %q", got.Severity, tt.severity)
			}
			if got.Insight.Reserved {
				t.Error("reserved a generation slot")
			}
		})
	}
}

func TestInsightHandlerRejectsMalformedJSON(t *testing.T) {
	newInsightTestEnv(t)
	req := httptest.NewRequest(http.MethodPost, "/insight", strings.NewReader("{not json"))
	rr := httptest.NewRecorder()
	insightHandler(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want 400", rr.Code)
	}
}
