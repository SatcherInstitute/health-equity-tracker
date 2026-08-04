package main

import (
	"encoding/json"
	"math"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// The fixtures in testdata/insight_prompts are the contract between the
// browser's prompt builders and this port: the same inputs must render the same
// text, byte for byte, because the insight cache key is a hash of that text.
// Accept a change only by regenerating the fixtures on the frontend side
// (UPDATE_INSIGHT_PROMPTS=1) and reviewing the resulting diff.

// Fixture metric configs decode straight into the production type: its JSON tags
// already match the fixture field names, so a mirrored test struct would only be
// one more place to forget to update.
type fixtureView struct {
	Topic        string               `json:"topic"`
	Location     string               `json:"location"`
	MetricConfig *insightMetricConfig `json:"metricConfig"`
	Rows         []insightRow         `json:"rows"`
}

type fixtureSection struct {
	Rows                   []insightRow         `json:"rows"`
	MetricConfig           *insightMetricConfig `json:"metricConfig"`
	ShareConfig            *insightMetricConfig `json:"shareConfig"`
	PopulationConfig       *insightMetricConfig `json:"populationConfig"`
	GeneralPopulationLabel string               `json:"generalPopulationLabel"`
}

type fixtureSections struct {
	Demographic fixtureSection `json:"demographic"`
	Geographic  fixtureSection `json:"geographic"`
	Temporal    fixtureSection `json:"temporal"`
	AgeAdjusted fixtureSection `json:"ageAdjusted"`
	Unknown     fixtureSection `json:"unknown"`
}

type promptFixture struct {
	Kind            string `json:"kind"`
	Why             string `json:"why"`
	HashID          string `json:"hashId"`
	DemographicType string `json:"demographicType"`

	// card
	Topic                  string               `json:"topic"`
	Location               string               `json:"location"`
	MetricConfig           *insightMetricConfig `json:"metricConfig"`
	ShareConfig            *insightMetricConfig `json:"shareConfig"`
	PopulationConfig       *insightMetricConfig `json:"populationConfig"`
	GeneralPopulationLabel string               `json:"generalPopulationLabel"`
	Rows                   []insightRow         `json:"rows"`
	Context                *insightContext      `json:"context"`

	// contrast
	ViewA *fixtureView `json:"viewA"`
	ViewB *fixtureView `json:"viewB"`

	// report
	PlaceNoun string           `json:"placeNoun"`
	Sections  *fixtureSections `json:"sections"`
}

func renderFixture(t *testing.T, f *promptFixture) string {
	t.Helper()
	demographic, ok := demographicDisplayLower[f.DemographicType]
	if !ok {
		t.Fatalf("fixture uses demographic type %q with no display label", f.DemographicType)
	}

	switch f.Kind {
	case "card":
		opts := insightDataOptions{
			ShareConfig:            f.ShareConfig,
			PopulationConfig:       f.PopulationConfig,
			GeneralPopulationLabel: f.GeneralPopulationLabel,
		}
		if f.Context != nil {
			opts.SelectedGroups = f.Context.SelectedGroups
			opts.ActiveDemographicGroup = f.Context.ActiveDemographicGroup
		}
		dataSection := formatDataRows(f.Rows, f.HashID, f.DemographicType, f.MetricConfig, opts)

		var shape *tableColumnShape
		if f.HashID == "data-table" {
			s := getTableColumnShape(f.Rows, f.DemographicType, f.MetricConfig, opts)
			shape = &s
		}
		return buildCardInsightPrompt(f.HashID, f.Topic, f.Location, demographic, dataSection, f.Context, shape)

	case "contrast":
		section := func(v *fixtureView) string {
			return formatDataRows(v.Rows, f.HashID, f.DemographicType, v.MetricConfig,
				insightDataOptions{BudgetBytes: insightBudgetContrast})
		}
		return buildContrastPrompt(f.ViewA.Topic, f.ViewB.Topic, f.ViewA.Location, f.ViewB.Location,
			demographic, section(f.ViewA), section(f.ViewB))

	case "report":
		s := f.Sections
		metricFor := func(sec fixtureSection) *insightMetricConfig {
			if sec.MetricConfig != nil {
				return sec.MetricConfig
			}
			return f.MetricConfig
		}
		demoMetric := metricFor(s.Demographic)
		demoShares := insightDataOptions{
			ShareConfig:            s.Demographic.ShareConfig,
			PopulationConfig:       s.Demographic.PopulationConfig,
			GeneralPopulationLabel: s.Demographic.GeneralPopulationLabel,
		}
		shape := getTableColumnShape(s.Demographic.Rows, f.DemographicType, demoMetric, demoShares)
		return buildReportInsightPrompt(f.Topic, f.Location, demographic, reportDataSections{
			Demographic: formatDemographicRates(s.Demographic.Rows, f.DemographicType, demoMetric,
				demoShares.ShareConfig, demoShares.PopulationConfig),
			Geographic:  formatGeographicSpread(s.Geographic.Rows, metricFor(s.Geographic), f.PlaceNoun),
			Temporal:    formatTemporalChange(s.Temporal.Rows, f.DemographicType, metricFor(s.Temporal)),
			AgeAdjusted: formatAgeAdjustedRatios(s.AgeAdjusted.Rows, f.DemographicType, metricFor(s.AgeAdjusted)),
			Unknown:     formatUnknownShare(s.Unknown.Rows, f.DemographicType, metricFor(s.Unknown)),
		}, &shape)

	default:
		t.Fatalf("unhandled fixture kind %q", f.Kind)
		return ""
	}
}

func TestInsightPromptFixtures(t *testing.T) {
	inputs, err := filepath.Glob(filepath.Join("testdata", "insight_prompts", "*.json"))
	if err != nil {
		t.Fatal(err)
	}
	if len(inputs) == 0 {
		t.Fatal("no prompt fixtures found")
	}

	for _, input := range inputs {
		name := strings.TrimSuffix(filepath.Base(input), ".json")
		t.Run(name, func(t *testing.T) {
			raw, err := os.ReadFile(input)
			if err != nil {
				t.Fatal(err)
			}
			var fixture promptFixture
			if err := json.Unmarshal(raw, &fixture); err != nil {
				t.Fatal(err)
			}
			wantPath := strings.TrimSuffix(input, ".json") + ".prompt.txt"
			want, err := os.ReadFile(wantPath)
			if err != nil {
				t.Fatal(err)
			}

			got := renderFixture(t, &fixture)
			if got != string(want) {
				t.Errorf("prompt does not match %s\n--- got ---\n%s\n--- want ---\n%s",
					filepath.Base(wantPath), got, string(want))
			}
		})
	}
}

// jsNumber and peerRankLabel carry sharp contracts that the fixtures only
// exercise incidentally, so pin them directly. Expected jsNumber values are
// String(n) output copied from a JS runtime, not derived from the Go code.
func TestJSNumberMatchesJavaScript(t *testing.T) {
	cases := []struct {
		in   float64
		want string
	}{
		{0, "0"},
		{math.Copysign(0, -1), "0"},
		{4, "4"},
		{-4, "-4"},
		{0.5, "0.5"},
		{-0.5, "-0.5"},
		{100, "100"},
		{43.8, "43.8"},
		// Written out rather than 0.1+0.2, which Go folds exactly at compile time.
		{0.30000000000000004, "0.30000000000000004"},
		// Exponential range. Unreachable for a rate or a share today, but a
		// silent divergence here would displace cache entries rather than fail.
		{1e-6, "0.000001"},
		{1.5e-7, "1.5e-7"},
		{-1.5e-7, "-1.5e-7"},
		{5e-324, "5e-324"},
		{1e21, "1e+21"},
		{-1e21, "-1e+21"},
		{1.2345e21, "1.2345e+21"},
		{1e22, "1e+22"},
		{math.NaN(), "NaN"},
		{math.Inf(1), "Infinity"},
		{math.Inf(-1), "-Infinity"},
	}
	for _, c := range cases {
		if got := jsNumber(c.in); got != c.want {
			t.Errorf("jsNumber(%v) = %q, want %q", c.in, got, c.want)
		}
	}
}

func TestPeerRankLabelBands(t *testing.T) {
	// Each band's lower bound and the value just under it, as thousandths of the
	// reporting count so the boundaries land exactly.
	cases := []struct {
		higherThan int
		want       string
	}{
		{1000, "among the highest"},
		{900, "among the highest"},
		{899, "higher than most"},
		{750, "higher than most"},
		{749, "above the typical"},
		{600, "above the typical"},
		{599, "near the typical"},
		{400, "near the typical"},
		{399, "below the typical"},
		{250, "below the typical"},
		{249, "lower than most"},
		{100, "lower than most"},
		{99, "among the lowest"},
		{0, "among the lowest"},
	}
	for _, c := range cases {
		if got := peerRankLabel(c.higherThan, 1000); got != c.want {
			t.Errorf("peerRankLabel(%d, 1000) = %q, want %q", c.higherThan, got, c.want)
		}
	}
}
