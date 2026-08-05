package main

import (
	"fmt"
	"strings"
	"unicode/utf16"
)

// A descriptor is the whole request for an insight: which surface is asking,
// which rows it is showing, and where it lives. The server renders the prompt
// from it and derives the cache key from that prompt, so the caller never
// assembles either.
//
// The shape deliberately matches testdata/insight_prompts/*.json, so the
// committed fixtures are descriptors and the render path they check is the same
// one the endpoint runs. A new insight surface is added by extending this type
// and committing a fixture for it.
const (
	insightKindCard     = "card"
	insightKindContrast = "contrast"
	insightKindReport   = "report"
)

// The browser's ScrollableHashId union. The hash ID reaches the prompt text
// (the template names the chart the reader is looking at), so it is matched
// against this set rather than echoed through.
var insightHashIDs = map[string]bool{
	"rate-map":                   true,
	"rates-over-time":            true,
	"rate-chart":                 true,
	"unknown-demographic-map":    true,
	"inequities-over-time":       true,
	"population-vs-distribution": true,
	"data-table":                 true,
	"age-adjusted-ratios":        true,
	"definitions-missing-data":   true,
	"multimap-modal":             true,
}

// One side of a compare-mode contrast: the same chart rendered for a second
// topic or a second place.
type insightView struct {
	Topic        string               `json:"topic"`
	Location     string               `json:"location"`
	MetricConfig *insightMetricConfig `json:"metricConfig"`
	Rows         []insightRow         `json:"rows"`
}

// One of the report insight's five data sections. Each carries its own rows and
// may override the report's metric config, since the age-adjusted and unknown
// sections read different metrics than the rate the rest of the report uses.
type insightReportSection struct {
	Rows                   []insightRow         `json:"rows"`
	MetricConfig           *insightMetricConfig `json:"metricConfig"`
	ShareConfig            *insightMetricConfig `json:"shareConfig"`
	PopulationConfig       *insightMetricConfig `json:"populationConfig"`
	GeneralPopulationLabel string               `json:"generalPopulationLabel"`
	// Only the geographic section reads this. A county has no child places to
	// spread across, so a county report ranks the place against its sibling
	// counties instead.
	PeerComparison *peerComparison `json:"peerComparison"`
}

type insightReportSections struct {
	Demographic insightReportSection `json:"demographic"`
	Geographic  insightReportSection `json:"geographic"`
	Temporal    insightReportSection `json:"temporal"`
	AgeAdjusted insightReportSection `json:"ageAdjusted"`
	Unknown     insightReportSection `json:"unknown"`
}

type insightDescriptor struct {
	Kind            string `json:"kind"`
	HashID          string `json:"hashId"`
	DemographicType string `json:"demographicType"`

	// Where the view lives, carried rather than derived. The browser has been
	// minting keys from its own location since #5029, and reproducing that string
	// exactly is what keeps every already-cached insight reachable. URLParams is
	// URLSearchParams.toString() output and is treated as opaque text: Go's own
	// encoder sorts keys where the browser preserves insertion order, so
	// re-encoding here would mint a different key for the same view.
	URLPathname string `json:"urlPathname"`
	URLParams   string `json:"urlParams"`
	// Compare mode renders the same chart twice under one URL, so the second
	// copy needs its own scope or the two would share a cache entry.
	IsCompareCard bool `json:"isCompareCard"`

	// card and report
	Topic                  string               `json:"topic"`
	Location               string               `json:"location"`
	MetricConfig           *insightMetricConfig `json:"metricConfig"`
	ShareConfig            *insightMetricConfig `json:"shareConfig"`
	PopulationConfig       *insightMetricConfig `json:"populationConfig"`
	GeneralPopulationLabel string               `json:"generalPopulationLabel"`
	Rows                   []insightRow         `json:"rows"`
	Context                *insightContext      `json:"context"`

	// contrast
	ViewA *insightView `json:"viewA"`
	ViewB *insightView `json:"viewB"`

	// report
	PlaceNoun string                 `json:"placeNoun"`
	Sections  *insightReportSections `json:"sections"`
}

func (d *insightDescriptor) validate() error {
	if _, ok := demographicDisplayLower[d.DemographicType]; !ok {
		return fmt.Errorf("unknown demographicType %q", d.DemographicType)
	}

	switch d.Kind {
	case insightKindCard:
		if !insightHashIDs[d.HashID] {
			return fmt.Errorf("unknown hashId %q", d.HashID)
		}
		if d.MetricConfig == nil {
			return fmt.Errorf("card descriptor requires metricConfig")
		}
	case insightKindContrast:
		if !insightHashIDs[d.HashID] {
			return fmt.Errorf("unknown hashId %q", d.HashID)
		}
		if d.ViewA == nil || d.ViewB == nil {
			return fmt.Errorf("contrast descriptor requires viewA and viewB")
		}
		if d.ViewA.MetricConfig == nil || d.ViewB.MetricConfig == nil {
			return fmt.Errorf("contrast descriptor requires a metricConfig on each view")
		}
	case insightKindReport:
		if d.Sections == nil {
			return fmt.Errorf("report descriptor requires sections")
		}
		if d.MetricConfig == nil {
			return fmt.Errorf("report descriptor requires metricConfig")
		}
	default:
		return fmt.Errorf("unknown kind %q", d.Kind)
	}
	return nil
}

// Renders the exact text sent to the model. Every branch here mirrors a call
// site in the browser's generate*Insight modules; the committed fixtures are
// what hold the two together.
func renderInsightPrompt(d *insightDescriptor) (string, error) {
	if err := d.validate(); err != nil {
		return "", err
	}
	demographic := demographicDisplayLower[d.DemographicType]

	switch d.Kind {
	case insightKindCard:
		opts := insightDataOptions{
			ShareConfig:            d.ShareConfig,
			PopulationConfig:       d.PopulationConfig,
			GeneralPopulationLabel: d.GeneralPopulationLabel,
		}
		if d.Context != nil {
			opts.SelectedGroups = d.Context.SelectedGroups
			opts.ActiveDemographicGroup = d.Context.ActiveDemographicGroup
		}
		dataSection := formatDataRows(d.Rows, d.HashID, d.DemographicType, d.MetricConfig, opts)

		var shape *tableColumnShape
		if d.HashID == "data-table" {
			s := getTableColumnShape(d.Rows, d.DemographicType, d.MetricConfig, opts)
			shape = &s
		}
		return buildCardInsightPrompt(d.HashID, d.Topic, d.Location, demographic, dataSection, d.Context, shape), nil

	case insightKindContrast:
		section := func(v *insightView) string {
			return formatDataRows(v.Rows, d.HashID, d.DemographicType, v.MetricConfig,
				insightDataOptions{BudgetBytes: insightBudgetContrast})
		}
		return buildContrastPrompt(d.ViewA.Topic, d.ViewB.Topic, d.ViewA.Location, d.ViewB.Location,
			demographic, section(d.ViewA), section(d.ViewB)), nil

	case insightKindReport:
		s := d.Sections
		metricFor := func(sec insightReportSection) *insightMetricConfig {
			if sec.MetricConfig != nil {
				return sec.MetricConfig
			}
			return d.MetricConfig
		}
		demoMetric := metricFor(s.Demographic)
		demoShares := insightDataOptions{
			ShareConfig:            s.Demographic.ShareConfig,
			PopulationConfig:       s.Demographic.PopulationConfig,
			GeneralPopulationLabel: s.Demographic.GeneralPopulationLabel,
		}
		shape := getTableColumnShape(s.Demographic.Rows, d.DemographicType, demoMetric, demoShares)
		return buildReportInsightPrompt(d.Topic, d.Location, demographic, reportDataSections{
			Demographic: formatDemographicRates(s.Demographic.Rows, d.DemographicType, demoMetric,
				demoShares.ShareConfig, demoShares.PopulationConfig),
			Geographic:  formatReportGeographic(s.Geographic, metricFor(s.Geographic), d.PlaceNoun),
			Temporal:    formatTemporalChange(s.Temporal.Rows, d.DemographicType, metricFor(s.Temporal)),
			AgeAdjusted: formatAgeAdjustedRatios(s.AgeAdjusted.Rows, d.DemographicType, metricFor(s.AgeAdjusted)),
			Unknown:     formatUnknownShare(s.Unknown.Rows, d.DemographicType, metricFor(s.Unknown)),
		}, &shape), nil
	}
	return "", fmt.Errorf("unknown kind %q", d.Kind)
}

// A county report ranks its place against sibling counties; every other report
// describes the spread across the place's own children.
func formatReportGeographic(section insightReportSection, metricConfig *insightMetricConfig, placeNoun string) string {
	if section.PeerComparison != nil {
		summary := summarizePeerComparison(section.PeerComparison)
		if summary == nil {
			return ""
		}
		return formatPeerComparison(summary)
	}
	return formatGeographicSpread(section.Rows, metricConfig, placeNoun)
}

// Distinguishes insights that share a URL and must not share a cache entry.
// Matches the scopes the browser passes to buildInsightCacheKey.
func (d *insightDescriptor) viewScope() string {
	switch d.Kind {
	case insightKindCard:
		if d.IsCompareCard {
			return "#" + d.HashID + "-2"
		}
		return "#" + d.HashID
	case insightKindContrast:
		return "#" + d.HashID + "-contrast"
	}
	return ""
}

// FNV-1a, 32 bits, as 8 hex chars, over UTF-16 code units rather than bytes.
// The browser hashes charCodeAt output, which is code units, and the peer
// comparison line carries an en dash, so hashing Go's UTF-8 bytes would mint a
// different key for the same prompt and miss every warm entry.
func fnv1a32(text string) string {
	var hash uint32 = 0x811c9dc5
	for _, unit := range utf16.Encode([]rune(text)) {
		hash ^= uint32(unit)
		hash *= 0x01000193
	}
	return fmt.Sprintf("%08x", hash)
}

const reportInsightParamKey = "report-insight"

// Removes the param that toggles the report insight open, which the browser
// drops so an insight is not cached twice under one view. Edited as text rather
// than parsed and re-encoded, because Go's encoder sorts keys where
// URLSearchParams preserves insertion order.
func stripReportInsightParam(params string) string {
	if !strings.Contains(params, reportInsightParamKey) {
		return params
	}
	pairs := strings.Split(params, "&")
	kept := make([]string, 0, len(pairs))
	for _, pair := range pairs {
		if pair == reportInsightParamKey || strings.HasPrefix(pair, reportInsightParamKey+"=") {
			continue
		}
		kept = append(kept, pair)
	}
	return strings.Join(kept, "&")
}

// The URL keeps the key readable for whoever triages a flagged insight; the
// prompt hash is what actually invalidates it, since the rendered prompt carries
// both the template wording and the data rows.
func (d *insightDescriptor) cacheKey(prompt string) string {
	return d.URLPathname + "?" + stripReportInsightParam(d.URLParams) + d.viewScope() + "-" + fnv1a32(prompt)
}
