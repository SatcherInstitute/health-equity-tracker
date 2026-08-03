package main

import (
	"encoding/json"
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

type fixtureMetricConfig struct {
	MetricID   string `json:"metricId"`
	ShortLabel string `json:"shortLabel"`
}

type fixtureView struct {
	Topic        string               `json:"topic"`
	Location     string               `json:"location"`
	MetricConfig *fixtureMetricConfig `json:"metricConfig"`
	Rows         []insightRow         `json:"rows"`
}

type promptFixture struct {
	Kind            string `json:"kind"`
	Why             string `json:"why"`
	HashID          string `json:"hashId"`
	DemographicType string `json:"demographicType"`

	// card
	Topic                  string               `json:"topic"`
	Location               string               `json:"location"`
	MetricConfig           *fixtureMetricConfig `json:"metricConfig"`
	ShareConfig            *fixtureMetricConfig `json:"shareConfig"`
	PopulationConfig       *fixtureMetricConfig `json:"populationConfig"`
	GeneralPopulationLabel string               `json:"generalPopulationLabel"`
	Rows                   []insightRow         `json:"rows"`
	Context                *insightContext      `json:"context"`

	// contrast
	ViewA *fixtureView `json:"viewA"`
	ViewB *fixtureView `json:"viewB"`
}

func (f *promptFixture) metricConfig() *insightMetricConfig {
	return asInsightMetricConfig(f.MetricConfig)
}

func asInsightMetricConfig(c *fixtureMetricConfig) *insightMetricConfig {
	if c == nil {
		return nil
	}
	return &insightMetricConfig{MetricID: c.MetricID, ShortLabel: c.ShortLabel}
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
			ShareConfig:            asInsightMetricConfig(f.ShareConfig),
			PopulationConfig:       asInsightMetricConfig(f.PopulationConfig),
			GeneralPopulationLabel: f.GeneralPopulationLabel,
		}
		if f.Context != nil {
			opts.SelectedGroups = f.Context.SelectedGroups
			opts.ActiveDemographicGroup = f.Context.ActiveDemographicGroup
		}
		dataSection := formatDataRows(f.Rows, f.HashID, f.DemographicType, f.metricConfig(), opts)

		var shape *tableColumnShape
		if f.HashID == "data-table" {
			s := getTableColumnShape(f.Rows, f.DemographicType, f.metricConfig(), opts)
			shape = &s
		}
		return buildCardInsightPrompt(f.HashID, f.Topic, f.Location, demographic, dataSection, f.Context, shape)

	case "contrast":
		section := func(v *fixtureView) string {
			return formatDataRows(v.Rows, f.HashID, f.DemographicType, asInsightMetricConfig(v.MetricConfig),
				insightDataOptions{BudgetBytes: insightBudgetContrast})
		}
		return buildContrastPrompt(f.ViewA.Topic, f.ViewB.Topic, f.ViewA.Location, f.ViewB.Location,
			demographic, section(f.ViewA), section(f.ViewB))

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
			// The report templates land with the rest of #5045; until then this
			// test covers the card and contrast families.
			if fixture.Kind == "report" {
				t.Skip("report templates not ported yet (#5045)")
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
