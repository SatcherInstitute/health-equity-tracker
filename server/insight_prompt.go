package main

import (
	"fmt"
	"math"
	"sort"
	"strconv"
	"strings"
)

// Go port of the browser's insight prompt templates. The text here is an
// interface with the insight cache: the cache key is a hash of the rendered
// prompt, so any wording change here displaces every entry that wording reaches.
// testdata/insight_prompts pins the exact output for a set of representative
// views, and TestInsightPromptFixtures renders those same inputs through this
// code. A diff in those files is the thing to review.

// Bytes of data rows a prompt may carry, tiered by how many data sections that
// prompt holds. A prompt with one section can afford to send far more of it than
// a prompt that always carries two.
const (
	insightBudgetCard     = 24 * 1024
	insightBudgetReport   = 4 * 1024
	insightBudgetContrast = 12 * 1024
)

var mapChartIDs = map[string]bool{
	"rate-map":                true,
	"unknown-demographic-map": true,
	"multimap-modal":          true,
}

var timeSeriesChartIDs = map[string]bool{
	"rates-over-time":      true,
	"inequities-over-time": true,
}

// Mirrors the browser's ALL / ALL_W pair.
const (
	insightGroupAll      = "All"
	insightGroupAllWomen = "All women"
)

func groupIsAll(group string) bool {
	return group == insightGroupAll || group == insightGroupAllWomen
}

// Only these fields of a MetricConfig reach the prompt text.
type insightMetricConfig struct {
	MetricID   string `json:"metricId"`
	ShortLabel string `json:"shortLabel"`
	// The population-vs-distribution chart is the one card whose population
	// share hangs off the rate config itself rather than being resolved as a
	// separate table column, so it arrives nested here.
	PopulationComparisonMetric *insightMetricConfig `json:"populationComparisonMetric,omitempty"`
}

type insightRow map[string]any

// Which of the data table's share columns the rendered rows actually carry.
// Derived from the values rather than from the config, because a template that
// names a column the payload lacks is exactly what invites the model to invent
// the number.
type tableColumnShape struct {
	HasCaseloadShare   bool
	HasPopulationShare bool
	// Set only when the population column counts a broader group than the rate's
	// own denominator, so the prompt can say so instead of implying the two
	// shares are measured on the same basis.
	GeneralPopulationLabel string
}

// Which rows a data section covers and how many bytes it may occupy.
type insightDataOptions struct {
	// When the user has focused a chart on a subset of groups, restrict the rows
	// to those groups so the insight describes only what is on screen.
	SelectedGroups []string
	// The demographic group currently highlighted on a map.
	ActiveDemographicGroup string
	// Bytes this data section may occupy. Zero means the single-card tier; a
	// prompt that carries more than one section passes a tighter budget.
	BudgetBytes int
	// The data table's two share columns. Passed in rather than read off the
	// metric config because the table is handed its rate config, which carries
	// neither share.
	ShareConfig            *insightMetricConfig
	PopulationConfig       *insightMetricConfig
	GeneralPopulationLabel string
}

// jsNumber renders a float the way JavaScript's String(number) does, because the
// committed fixtures record JS output and the cache key hashes it. Go's default
// formatting would print 4.0 where JS prints 4, which would silently displace
// every cached insight carrying a whole-numbered rate.
func jsNumber(f float64) string {
	if math.IsNaN(f) {
		return "NaN"
	}
	if math.IsInf(f, 1) {
		return "Infinity"
	}
	if math.IsInf(f, -1) {
		return "-Infinity"
	}
	// JS prints negative zero as "0"; Go prints "-0".
	if f == 0 {
		return "0"
	}
	// JS switches to exponential notation outside this range. Rates and
	// percentages never reach it, but diverging silently is worse than the
	// branch costs.
	if abs := math.Abs(f); abs >= 1e21 || abs < 1e-6 {
		// Both languages agree on the mantissa and the exponent sign, but Go pads
		// the exponent to two digits (1.5e-07) where JS never does (1.5e-7).
		s := strconv.FormatFloat(f, 'g', -1, 64)
		if i := strings.IndexByte(s, 'e'); i >= 0 {
			digits := strings.TrimLeft(s[i+2:], "0")
			if digits == "" {
				digits = "0"
			}
			return s[:i+2] + digits
		}
		return s
	}
	return strconv.FormatFloat(f, 'f', -1, 64)
}

// jsString renders a value the way JS template interpolation would.
func jsString(v any) string {
	switch t := v.(type) {
	case nil:
		return ""
	case string:
		return t
	case float64:
		return jsNumber(t)
	case bool:
		return strconv.FormatBool(t)
	default:
		return fmt.Sprintf("%v", t)
	}
}

// A percent short label already leads with the sign ("% of population"), so it
// attaches straight to the number; anything else is a unit that reads as its own
// word ("6.8 cases per 100k"). Applied only where a share column sits beside a
// rate, since a mixed row is where "100 % of population" reads as a typo.
func formatMetricValue(value any, config *insightMetricConfig) string {
	if strings.HasPrefix(config.ShortLabel, "%") {
		return jsString(value) + config.ShortLabel
	}
	return jsString(value) + " " + config.ShortLabel
}

// Keeps whole lines from the start until the budget is spent, so an over-budget
// section degrades to a shorter well-formed list rather than a list whose last
// entry is cut mid-number. Order is preserved rather than re-ranked, since the
// prompt hash that keys the insight cache depends on the same rows rendering the
// same way every time.
func trimLinesToBudget(lines []string, budgetBytes int) string {
	kept := make([]string, 0, len(lines))
	used := 0
	for _, line := range lines {
		cost := len(line)
		if len(kept) > 0 {
			cost++
		}
		if used+cost > budgetBytes {
			break
		}
		kept = append(kept, line)
		used += cost
	}
	return strings.Join(kept, "\n")
}

func getTableColumnShape(rows []insightRow, demographicType string, metricConfig *insightMetricConfig, opts insightDataOptions) tableColumnShape {
	// Same rows formatDataRows will emit, so a column present only on rows that
	// get dropped is not announced.
	emitted := make([]insightRow, 0, len(rows))
	for _, row := range rows {
		if row[demographicType] != nil && row[metricConfig.MetricID] != nil {
			emitted = append(emitted, row)
		}
	}
	hasColumn := func(config *insightMetricConfig) bool {
		if config == nil {
			return false
		}
		for _, row := range emitted {
			if row[config.MetricID] != nil {
				return true
			}
		}
		return false
	}
	shape := tableColumnShape{
		HasCaseloadShare:   hasColumn(opts.ShareConfig),
		HasPopulationShare: hasColumn(opts.PopulationConfig),
	}
	if shape.HasPopulationShare {
		shape.GeneralPopulationLabel = opts.GeneralPopulationLabel
	}
	return shape
}

// formatDataRows renders the rows as the text list embedded in the prompt.
func formatDataRows(rows []insightRow, hashID, demographicType string, metricConfig *insightMetricConfig, opts insightDataOptions) string {
	budgetBytes := opts.BudgetBytes
	if budgetBytes == 0 {
		budgetBytes = insightBudgetCard
	}

	var groupFilter map[string]bool
	if len(opts.SelectedGroups) > 0 {
		groupFilter = make(map[string]bool, len(opts.SelectedGroups))
		for _, g := range opts.SelectedGroups {
			groupFilter[g] = true
		}
	}

	if timeSeriesChartIDs[hashID] {
		return formatTimeSeriesRows(rows, demographicType, metricConfig, groupFilter, budgetBytes)
	}

	isMap := mapChartIDs[hashID]
	isTable := hashID == "data-table"

	// For population-vs-distribution, include both the outcome share and the
	// population share side by side so the model can compute the disparity.
	var popMetric *insightMetricConfig
	switch {
	case hashID == "population-vs-distribution":
		popMetric = metricConfig.PopulationComparisonMetric
	case isTable:
		popMetric = opts.PopulationConfig
	}
	var shareMetric *insightMetricConfig
	if isTable {
		shareMetric = opts.ShareConfig
	}

	filtered := make([]insightRow, 0, len(rows))
	for _, row := range rows {
		// Maps always have a place name; other charts key off the demographic group.
		var hasLabel bool
		if isMap {
			hasLabel = row["fips_name"] != nil
		} else {
			hasLabel = row[demographicType] != nil
		}
		if !hasLabel || row[metricConfig.MetricID] == nil {
			continue
		}
		if groupFilter != nil && !groupFilter[jsString(row[demographicType])] {
			continue
		}
		filtered = append(filtered, row)
	}

	// A map showing 2+ places is a real geographic comparison, so default to the
	// group on screen. A map showing fewer than 2 places has nothing geographic
	// to gain from filtering, so fall back to every group within that one place.
	activeRows := filtered
	if isMap && opts.ActiveDemographicGroup != "" && !groupIsAll(opts.ActiveDemographicGroup) {
		places := map[string]bool{}
		for _, row := range filtered {
			places[jsString(row["fips_name"])] = true
		}
		if len(places) >= 2 {
			activeRows = make([]insightRow, 0, len(filtered))
			for _, row := range filtered {
				group := jsString(row[demographicType])
				if group == opts.ActiveDemographicGroup || groupIsAll(group) {
					activeRows = append(activeRows, row)
				}
			}
		}
	}

	lines := make([]string, 0, len(activeRows))
	for _, row := range activeRows {
		// On a map, label each row with BOTH its place and demographic group so
		// the model can read either a geographic gap (across places) or a
		// within-place gap (across groups, with "All" as the baseline). Other
		// charts already vary only by demographic group.
		var label string
		if isMap {
			label = fmt.Sprintf("%s (%s)", jsString(row["fips_name"]), jsString(row[demographicType]))
		} else {
			label = jsString(row[demographicType])
		}
		if isTable {
			// The table's own three columns, in the order the table shows them.
			// Each is dropped for the rows the source suppressed, so a group can
			// appear with a rate and no shares.
			parts := []string{formatMetricValue(row[metricConfig.MetricID], metricConfig)}
			for _, config := range []*insightMetricConfig{shareMetric, popMetric} {
				if config != nil && row[config.MetricID] != nil {
					parts = append(parts, formatMetricValue(row[config.MetricID], config))
				}
			}
			lines = append(lines, fmt.Sprintf("- %s: %s", label, strings.Join(parts, ", ")))
			continue
		}
		val := jsString(row[metricConfig.MetricID]) + " " + metricConfig.ShortLabel
		if popMetric != nil && row[popMetric.MetricID] != nil {
			lines = append(lines, fmt.Sprintf("- %s: outcome share %s, population share %s %s",
				label, val, jsString(row[popMetric.MetricID]), popMetric.ShortLabel))
			continue
		}
		lines = append(lines, fmt.Sprintf("- %s: %s", label, val))
	}

	// Group filtering bounds a map section in the common case, but a wide
	// breakdown over hundreds of places can still outgrow the budget, and the
	// data table has no geographic filter at all.
	return trimLinesToBudget(lines, budgetBytes)
}

func formatTimeSeriesRows(rows []insightRow, demographicType string, metricConfig *insightMetricConfig, groupFilter map[string]bool, budgetBytes int) string {
	// Insertion order, not map order: the browser iterates the grouping object's
	// keys in insertion order and the rendered line order is part of the hashed
	// prompt.
	var order []string
	byGroup := map[string][]insightRow{}
	for _, row := range rows {
		group := "Unknown"
		if v := row[demographicType]; v != nil {
			group = jsString(v)
		}
		if groupFilter != nil && !groupFilter[group] {
			continue
		}
		if row[metricConfig.MetricID] == nil {
			continue
		}
		if _, seen := byGroup[group]; !seen {
			order = append(order, group)
		}
		byGroup[group] = append(byGroup[group], row)
	}
	if len(order) == 0 {
		return ""
	}

	longest := 0
	for _, group := range order {
		sorted := byGroup[group]
		sort.SliceStable(sorted, func(i, j int) bool {
			return jsString(sorted[i]["time_period"]) < jsString(sorted[j]["time_period"])
		})
		byGroup[group] = sorted
		if len(sorted) > longest {
			longest = len(sorted)
		}
	}

	// Keep the group's earliest point as a historical anchor, then as much of the
	// recent tail as the budget allows. Recent years describe where a disparity
	// stands now, which is what an insight is about; the anchor is what makes "up
	// or down since then" answerable at all.
	render := func(recentCount int) string {
		var lines []string
		for _, group := range order {
			sorted := byGroup[group]
			kept := sorted
			if len(sorted) > recentCount+1 {
				kept = append([]insightRow{sorted[0]}, sorted[len(sorted)-recentCount:]...)
			}
			for _, row := range kept {
				lines = append(lines, fmt.Sprintf("- %s (%s): %s %s",
					group, jsString(row["time_period"]),
					jsString(row[metricConfig.MetricID]), metricConfig.ShortLabel))
			}
		}
		return strings.Join(lines, "\n")
	}

	// Send the full series when it is small enough for the model to work with the
	// whole trend, since that is a materially better answer than a truncated one.
	if full := render(longest); len(full) <= budgetBytes {
		return full
	}

	// Largest recent window that still fits. Binary search rather than stepping
	// down one point at a time, since a monthly series over decades can be
	// hundreds of points per group.
	low, high, best := 1, longest, ""
	for low <= high {
		mid := (low + high) / 2
		if candidate := render(mid); len(candidate) <= budgetBytes {
			best = candidate
			low = mid + 1
		} else {
			high = mid - 1
		}
	}
	if best != "" {
		return best
	}

	// Enough groups that even one recent point each overflows the budget.
	return trimLinesToBudget(strings.Split(render(1), "\n"), budgetBytes)
}

func joinWithAnd(parts []string) string {
	switch len(parts) {
	case 0:
		return ""
	case 1:
		return parts[0]
	case 2:
		return strings.Join(parts, " and ")
	default:
		return strings.Join(parts[:len(parts)-1], ", ") + ", and " + parts[len(parts)-1]
	}
}

// The selected region's own overall ("All") rate plus the overall rates of its
// same-level peers. Peers share the region's data source, file, and methodology,
// so the comparison is apples-to-apples in a way that
// county-vs-state-vs-national is not.
type peerComparison struct {
	RegionLabel string    `json:"regionLabel"`
	RegionValue float64   `json:"regionValue"`
	PeerNoun    string    `json:"peerNoun"`
	PeerValues  []float64 `json:"peerValues"`
	ShortLabel  string    `json:"shortLabel"`
}

type peerRankSummary struct {
	RegionLabel string
	RegionValue float64
	PeerNoun    string
	// Peers whose rate is strictly below the region's.
	HigherThanCount int
	ReportingCount  int
	Median          float64
	Min             float64
	Max             float64
	ShortLabel      string
}

// Below this many reporting peers a rank isn't meaningful, so the fallback hides
// rather than rank against a near-empty field.
const minReportingPeers = 3

// Reduce raw peer rates to a rank summary, or nil when too few peers report.
// Ordinal by design: it never places the region's rate beside a
// differently-computed reference figure, only beside same-level peers.
func summarizePeerComparison(peer *peerComparison) *peerRankSummary {
	values := make([]float64, 0, len(peer.PeerValues))
	for _, v := range peer.PeerValues {
		if !math.IsNaN(v) && !math.IsInf(v, 0) {
			values = append(values, v)
		}
	}
	if len(values) < minReportingPeers {
		return nil
	}
	sorted := append([]float64(nil), values...)
	sort.Float64s(sorted)

	mid := len(sorted) / 2
	median := sorted[mid]
	if len(sorted)%2 == 0 {
		median = (sorted[mid-1] + sorted[mid]) / 2
	}

	higher := 0
	for _, v := range values {
		if v < peer.RegionValue {
			higher++
		}
	}
	// Rates are non-negative, so math.Round's half-away-from-zero and JS
	// Math.round's half-up agree here.
	round1 := func(f float64) float64 { return math.Round(f*10) / 10 }
	return &peerRankSummary{
		RegionLabel:     peer.RegionLabel,
		RegionValue:     peer.RegionValue,
		PeerNoun:        peer.PeerNoun,
		HigherThanCount: higher,
		ReportingCount:  len(values),
		Median:          round1(median),
		Min:             round1(sorted[0]),
		Max:             round1(sorted[len(sorted)-1]),
		ShortLabel:      peer.ShortLabel,
	}
}

// Maps a rank ratio to a plain-English standing label so the model never sees
// raw fractions like "higher than 23 of 28" and restates them verbatim.
func peerRankLabel(higherThanCount, reportingCount int) string {
	ratio := float64(higherThanCount) / float64(reportingCount)
	switch {
	case ratio >= 0.9:
		return "among the highest"
	case ratio >= 0.75:
		return "higher than most"
	case ratio >= 0.6:
		return "above the typical"
	case ratio >= 0.4:
		return "near the typical"
	case ratio >= 0.25:
		return "below the typical"
	case ratio >= 0.1:
		return "lower than most"
	default:
		return "among the lowest"
	}
}

// Renders a peer rank summary as prompt bullet lines. Leads with the region's
// own rate, then its qualitative standing and the peer distribution.
func formatPeerComparison(s *peerRankSummary) string {
	return strings.Join([]string{
		fmt.Sprintf("- %s: %s %s", s.RegionLabel, jsNumber(s.RegionValue), s.ShortLabel),
		fmt.Sprintf("- Among %d %s: %s", s.ReportingCount, s.PeerNoun, peerRankLabel(s.HigherThanCount, s.ReportingCount)),
		fmt.Sprintf("- Peer median %s %s; range %s–%s %s",
			jsNumber(s.Median), s.ShortLabel, jsNumber(s.Min), jsNumber(s.Max), s.ShortLabel),
	}, "\n")
}

// Optional context about which groups the user has focused the chart on.
type insightContext struct {
	ActiveDemographicGroup string          `json:"activeDemographicGroup"`
	SelectedGroups         []string        `json:"selectedGroups"`
	PeerComparison         *peerComparison `json:"peerComparison"`
}

func buildPrompt(hashID, topic, location, demographicLabel, dataSection, activeDemographicGroup string, hasPeerComparison bool, tableShape *tableColumnShape) string {
	dataBlock := ""
	if dataSection != "" {
		dataBlock = "\n\nData:\n" + dataSection
	}

	if mapChartIDs[hashID] && hasPeerComparison {
		return fmt.Sprintf("This is a choropleth map of %s in %s. Because only its overall rate is available locally, %s is ranked against its peer places at the same geographic level — which draw on the same data source and methodology, so the comparison is fair.%s\n\nWrite a single sentence at an 8th grade reading level that says where %s falls among its peers (for example, higher than most, near the middle, or among the lowest) and what that means for the people who live there. Focus on the \"so what\", not the chart mechanics.",
			topic, location, location, dataBlock, location)
	}

	if mapChartIDs[hashID] {
		// Each data row is labeled `Place (Group)`, and an "All" row gives the
		// overall rate for that place. Tell the model which group the user is
		// currently highlighting so it can lead with that story.
		focus := ""
		if activeDemographicGroup != "" && activeDemographicGroup != insightGroupAll {
			focus = fmt.Sprintf(" The map currently highlights the %s group, so lead with that group and use the \"All\" baseline for comparison.", activeDemographicGroup)
		}
		return fmt.Sprintf("This is a choropleth map showing %s in %s by %s. Each data row is labeled with its place and %s group; an \"All\" row gives the overall rate for that place.%s%s\n\nWrite a single sentence at an 8th grade reading level that highlights the most important health equity disparity — either a geographic gap between places or a gap between %s groups within a place — and captures why it matters for real people. Focus on the \"so what\", not the chart mechanics.",
			topic, location, demographicLabel, demographicLabel, focus, dataBlock, demographicLabel)
	}

	if hashID == "rates-over-time" {
		// The gap clause is conditional because suppression is common here: a
		// sparse topic can leave only one group with values across the years, and
		// a gap trend asked for unconditionally is one the model has to invent.
		return fmt.Sprintf("This is a line chart showing how %s rates have changed over time in %s across %s groups.%s\n\nWrite a single sentence at an 8th grade reading level that says how long the pattern has held, and describes whether the gap between groups is improving or worsening when more than one group has data across those years and otherwise how the group that does has changed — focus on what this trend means for real people.",
			topic, location, demographicLabel, dataBlock)
	}

	if hashID == "inequities-over-time" {
		return fmt.Sprintf("This is a chart showing how the relative inequity in %s has changed over time in %s across %s groups. Positive values mean a group bears a greater share of %s than their share of the population; negative means less.%s\n\nWrite a single sentence at an 8th grade reading level that says how long the pattern has held and states whether inequity is improving or worsening for the most affected group — focus on what this trend means for real people.",
			topic, location, demographicLabel, topic, dataBlock)
	}

	if hashID == "data-table" {
		// The columns are named from what the rows actually carry, so the prompt
		// can never describe a number it did not send.
		columnParts := []string{"its rate"}
		if tableShape != nil && tableShape.HasCaseloadShare {
			columnParts = append(columnParts, "its share of the total")
		}
		if tableShape != nil && tableShape.HasPopulationShare {
			columnParts = append(columnParts, "its share of the population")
		}
		columns := joinWithAnd(columnParts)

		// The population share is what makes this card different from every other
		// one on the page: it is the only place a reader can weigh who carries the
		// burden against who is actually there. Eight topics publish no caseload
		// share at all, so the comparison there is the group's rate against its
		// share of the population.
		burden := "whose rate is"
		if tableShape != nil && tableShape.HasCaseloadShare {
			burden = fmt.Sprintf("whose share of %s is", topic)
		}
		task := "describes the pattern across several groups rather than only the single biggest gap"
		if tableShape != nil && tableShape.HasPopulationShare {
			task = fmt.Sprintf("weighs who carries the burden against who actually lives in %s, naming a group %s out of step with its share of the population", location, burden)
		}
		caveat := ""
		if tableShape != nil && tableShape.GeneralPopulationLabel != "" {
			caveat = fmt.Sprintf(" The population shares count %s, a broader group than the rate itself measures, so treat that comparison as rough context rather than an exact figure.", tableShape.GeneralPopulationLabel)
		}

		return fmt.Sprintf("This is a data table summarizing %s in %s by %s. Each row gives one group and %s.%s%s\n\nWrite a single sentence at an 8th grade reading level that %s. Focus on the \"so what\" for the community.",
			topic, location, demographicLabel, columns, caveat, dataBlock, task)
	}

	return fmt.Sprintf("This is a %s showing %s in %s by %s. The intended message is to highlight health equity disparities.%s\n\nWrite a single sentence at an 8th grade reading level that captures the key inequity a viewer should walk away with — focus on the \"so what\", not the chart mechanics.",
		strings.ReplaceAll(hashID, "-", " "), topic, location, demographicLabel, dataBlock)
}

// The client underlines this exact run of characters inside the sentence, so a
// phrase the model paraphrased rather than quoted cannot be located and is
// dropped. Asking for a verbatim copy is cheaper than repairing one after.
const insightHighlightRule = `"highlight" is the one phrase in "text" a reader should notice first: the comparison or figure that carries the finding. Copy it character for character from "text", keep it to roughly 3 to 8 words, and never make it the whole sentence.`

// Shared by cards, contrasts, and the report. Each line answers a specific way
// the output read like the chart restated rather than explained: decimals off
// the axis, raw rates with no reference point, "varies widely" standing in for
// the actual extreme, and the clinical column names interpolated from the
// frontend metric configs.
const plainLanguageRules = `- Reason from the exact numbers in the data, then round hard for the reader: "nearly 40%", "about 1 in 3", "over 3 times higher". Drop the decimal places from any rate or percentage.
- Use at most two numbers, and prefer a comparison over a raw rate. Compare a group against the overall "All" rate whenever the data shows one; only if it does not, compare against the largest group shown. Compare a place against the typical place.
- Write about the people in the data in the third person. Never "we", "us", "our communities", or "those in our communities". A reader may belong to any group on the page.
- Name the extreme, not the spread. Say which group or place is highest or lowest, or that some have none at all. Never say values "vary widely".
- Say how long a pattern has held in human terms, "for over a decade", rather than listing years.
- Use the words people actually use: "Black" for "Black or African American (NH)", "people living with HIV" for "HIV prevalence", "heart attacks" for "acute myocardial infarction".`

// The single-section envelope a card or contrast returns. Also keeps the model
// from narrating the prompt (e.g. "Since only the overall rate is available,
// here's a sentence...") — the card wants the bare insight.
const singleInsightOutputRule = "\n\nWRITING RULES, follow these strictly:\n" + plainLanguageRules +
	"\n\nRespond ONLY with a valid JSON object, no markdown, no backticks, and no text outside the JSON. Include this key and no others:\n\n" +
	"{\n  \"insight\": {\n    \"text\": \"the sentence\",\n    \"highlight\": \"the key phrase from that sentence\"\n  }\n}\n\n" +
	insightHighlightRule +
	" Inside \"text\", write only the sentence itself: no preamble, no lead-in, no labels, and do not restate these instructions or note which data is or is not available."

// The exact text a card sends to the model.
func buildCardInsightPrompt(hashID, topic, location, demographicLabel, dataSection string, context *insightContext, tableShape *tableColumnShape) string {
	// Single-region map: rank the region against its same-level peers instead of
	// describing an on-screen disparity. summarizePeerComparison returns nil when
	// too few peers report, in which case we fall through to the standard framing.
	var peerSummary *peerRankSummary
	if mapChartIDs[hashID] && context != nil && context.PeerComparison != nil {
		peerSummary = summarizePeerComparison(context.PeerComparison)
	}

	// The peer summary already leads with the region's own rate, so it replaces
	// the lone local row rather than appending to it.
	finalDataSection := dataSection
	if peerSummary != nil {
		finalDataSection = formatPeerComparison(peerSummary)
	}

	activeGroup := ""
	if context != nil {
		activeGroup = context.ActiveDemographicGroup
	}

	return buildPrompt(hashID, topic, location, demographicLabel, finalDataSection,
		activeGroup, peerSummary != nil, tableShape) + singleInsightOutputRule
}

func buildContrastPrompt(topic1, topic2, location1, location2, demographic, data1, data2 string) string {
	var setup, viewALabel, viewBLabel, guidance string

	switch {
	case topic1 == topic2:
		// compare-geo: same topic, different places
		setup = fmt.Sprintf("Two side-by-side charts show the same health metric — %s — across %s groups, in two different places.", topic1, demographic)
		viewALabel = fmt.Sprintf("View A (%s)", location1)
		viewBLabel = fmt.Sprintf("View B (%s)", location2)
		guidance = "Focus on what comparing these two places reveals that either view alone does not — for example, whether disparities within one place exceed disparities between places, or whether the same patterns recur at different geographic scales."
	case location1 == location2:
		// compare-vars: same place, different topics
		setup = fmt.Sprintf("Two side-by-side charts show %s, one for %s and one for %s, across %s groups.", location1, topic1, topic2, demographic)
		viewALabel = fmt.Sprintf("View A (%s)", topic1)
		viewBLabel = fmt.Sprintf("View B (%s)", topic2)
		guidance = "Focus on whether the same groups bear the heaviest burden across both topics, or where the patterns diverge — and what that suggests about the underlying drivers of inequity."
	default:
		setup = fmt.Sprintf("Two side-by-side charts compare %s in %s with %s in %s, across %s groups.", topic1, location1, topic2, location2, demographic)
		viewALabel = fmt.Sprintf("View A (%s in %s)", topic1, location1)
		viewBLabel = fmt.Sprintf("View B (%s in %s)", topic2, location2)
		guidance = "Focus on what the contrast reveals about how place and topic interact in driving health inequities."
	}

	dataBlock1 := ""
	if data1 != "" {
		dataBlock1 = fmt.Sprintf("\n\n%s data:\n%s", viewALabel, data1)
	}
	dataBlock2 := ""
	if data2 != "" {
		dataBlock2 = fmt.Sprintf("\n\n%s data:\n%s", viewBLabel, data2)
	}

	return fmt.Sprintf("%s%s%s\n\nWrite one sentence at an 8th grade reading level that contrasts these two views. %s Name the places or groups involved. Use only facts present in the data; do not introduce additional statistics, causal explanations, or place-specific facts that are not shown.",
		setup, dataBlock1, dataBlock2, guidance) + singleInsightOutputRule
}

// The browser's DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE. Part of the prompt text,
// so it is pinned here rather than derived.
var demographicDisplayLower = map[string]string{
	"race_and_ethnicity": "race/ethnicity",
	"age":                "age",
	"sex":                "sex",
	"fips":               "FIPS codes",
	"lis":                "low income subsidy",
	"eligibility":        "eligibility",
	"urbanicity":         "city size",
	"income":             "income",
	"education":          "education",
	"insurance_status":   "insurance",
}
