package main

import (
	"fmt"
	"math"
	"sort"
	"strings"
)

// The report-wide insight is a synthesis, not a walkthrough of the cards below
// it. Trend and data-completeness findings fold into the four sections rather
// than each getting a section of their own, which would turn the card into a
// table of contents for the report.

// How many places to name at each end of the geographic spread. Enough to show a
// pattern rather than a lone outlier, few enough that a state with hundreds of
// counties still produces a bounded prompt.
const spreadSampleSize = 3

// Word budgets for the two sections that absorb optional clauses. The base
// covers the section's own finding; each clause folded in buys roughly one more
// sentence, so a section never has to say more in the same breath.
const (
	sectionWordBudget = 35
	clauseWordBudget  = 20
)

// The browser's UNKNOWN / UNKNOWN_RACE / UNKNOWN_ETHNICITY / UNKNOWN_W set.
var unknownDemographicGroups = map[string]bool{
	"Unknown":                 true,
	"Unknown race":            true,
	"Unknown ethnicity":       true,
	"Women with unknown race": true,
}

// finiteNumber mirrors Number.isFinite: a non-numeric value is not a small
// number, it is no number at all, and rows carrying one are dropped rather than
// rendered as text.
func finiteNumber(v any) (float64, bool) {
	f, ok := v.(float64)
	if !ok || math.IsNaN(f) || math.IsInf(f, 0) {
		return 0, false
	}
	return f, true
}

func trimSectionToBudget(section string, budgetBytes int) string {
	if len(section) <= budgetBytes {
		return section
	}
	return trimLinesToBudget(strings.Split(section, "\n"), budgetBytes)
}

// allFirstThenDesc orders the overall row ahead of every group, then ranks the
// rest by value descending, so the same data always renders the same text. The
// prompt-hash cache key depends on that.
func allFirstThenDesc(groupA, groupB string, valueA, valueB float64) bool {
	if groupIsAll(groupA) != groupIsAll(groupB) {
		return groupIsAll(groupA)
	}
	return valueB < valueA
}

// Rates for every demographic group in the selected place, overall row first so
// the model has a baseline to measure each group against.
func formatDemographicRates(rows []insightRow, demographicType string, metricConfig, shareConfig, populationConfig *insightMetricConfig) string {
	type entry struct {
		group string
		value float64
		row   insightRow
	}
	entries := make([]entry, 0, len(rows))
	for _, row := range rows {
		value, ok := finiteNumber(row[metricConfig.MetricID])
		if row[demographicType] == nil || !ok {
			continue
		}
		entries = append(entries, entry{jsString(row[demographicType]), value, row})
	}
	sort.SliceStable(entries, func(i, j int) bool {
		return allFirstThenDesc(entries[i].group, entries[j].group, entries[i].value, entries[j].value)
	})

	lines := make([]string, 0, len(entries))
	for _, e := range entries {
		// A rate alone says a group is worse off; the shares say whether that
		// group carries more of the burden than its presence would account for.
		parts := []string{formatMetricValue(e.value, metricConfig)}
		for _, config := range []*insightMetricConfig{shareConfig, populationConfig} {
			if config != nil && e.row[config.MetricID] != nil {
				parts = append(parts, formatMetricValue(e.row[config.MetricID], config))
			}
		}
		lines = append(lines, fmt.Sprintf("- %s: %s", e.group, strings.Join(parts, ", ")))
	}
	return strings.Join(lines, "\n")
}

// The spread of overall rates across the child places shown on the report's map,
// reduced to both extremes plus a median. Sending every county would dominate
// the prompt without telling the model more than its shape does.
func formatGeographicSpread(rows []insightRow, metricConfig *insightMetricConfig, placeNoun string) string {
	type place struct {
		name  string
		value float64
	}
	places := make([]place, 0, len(rows))
	for _, row := range rows {
		value, ok := finiteNumber(row[metricConfig.MetricID])
		if row["fips_name"] == nil || !ok {
			continue
		}
		places = append(places, place{jsString(row["fips_name"]), value})
	}
	sort.SliceStable(places, func(i, j int) bool { return places[j].value < places[i].value })

	// One place is not a geographic comparison, so say nothing rather than
	// present a lone value as if it were a spread.
	if len(places) < 2 {
		return ""
	}

	unit := metricConfig.ShortLabel
	render := func(p place) string { return p.name + " " + jsNumber(p.value) }
	renderAll := func(ps []place) string {
		out := make([]string, len(ps))
		for i, p := range ps {
			out[i] = render(p)
		}
		return strings.Join(out, ", ")
	}

	// Naming every place beats a top/bottom split that would repeat most of them.
	if len(places) <= spreadSampleSize*2 {
		return fmt.Sprintf("- All %d %s: %s %s", len(places), placeNoun, renderAll(places), unit)
	}

	mid := len(places) / 2
	median := places[mid].value
	if len(places)%2 == 0 {
		median = (places[mid-1].value + places[mid].value) / 2
	}

	lowest := make([]place, spreadSampleSize)
	tail := places[len(places)-spreadSampleSize:]
	for i, p := range tail {
		lowest[len(tail)-1-i] = p
	}

	return strings.Join([]string{
		fmt.Sprintf("- Highest: %s %s", renderAll(places[:spreadSampleSize]), unit),
		fmt.Sprintf("- Lowest reported: %s %s", renderAll(lowest), unit),
		fmt.Sprintf("- Median across %d %s: %s %s", len(places), placeNoun, jsNumber(math.Round(median*10)/10), unit),
	}, "\n")
}

// Each group's first, highest, and latest reported rate. Three points per group
// rather than the full series let the model say both whether overall rates moved
// and whether the gap between groups widened or narrowed, at a fraction of the
// prompt size.
//
// The peak is not decoration. On a monthly series like COVID-19 the first and
// last months both sit at zero, so endpoints alone would describe a condition
// that never happened.
func formatTemporalChange(rows []insightRow, demographicType string, metricConfig *insightMetricConfig) string {
	// Insertion order, as the browser's Map gives.
	var order []string
	byGroup := map[string][]insightRow{}
	for _, row := range rows {
		if row[demographicType] == nil || row["time_period"] == nil {
			continue
		}
		if _, ok := finiteNumber(row[metricConfig.MetricID]); !ok {
			continue
		}
		group := jsString(row[demographicType])
		if _, seen := byGroup[group]; !seen {
			order = append(order, group)
		}
		byGroup[group] = append(byGroup[group], row)
	}

	type span struct {
		group             string
		first, peak, last insightRow
		lastValue         float64
	}
	spans := make([]span, 0, len(order))
	for _, group := range order {
		sorted := byGroup[group]
		sort.SliceStable(sorted, func(i, j int) bool {
			return jsString(sorted[i]["time_period"]) < jsString(sorted[j]["time_period"])
		})
		first, last := sorted[0], sorted[len(sorted)-1]
		// A single time point is a rate, not a change, so it belongs in the
		// demographic section rather than being restated here as a trend.
		if jsString(first["time_period"]) == jsString(last["time_period"]) {
			continue
		}
		peak := sorted[0]
		for _, row := range sorted[1:] {
			v, _ := finiteNumber(row[metricConfig.MetricID])
			best, _ := finiteNumber(peak[metricConfig.MetricID])
			if v > best {
				peak = row
			}
		}
		lastValue, _ := finiteNumber(last[metricConfig.MetricID])
		spans = append(spans, span{group, first, peak, last, lastValue})
	}
	sort.SliceStable(spans, func(i, j int) bool {
		return allFirstThenDesc(spans[i].group, spans[j].group, spans[i].lastValue, spans[j].lastValue)
	})

	lines := make([]string, 0, len(spans))
	for _, s := range spans {
		points := []string{fmt.Sprintf("%s in %s", jsString(s.first[metricConfig.MetricID]), jsString(s.first["time_period"]))}
		// A peak at either endpoint is already named, so repeating it would just
		// invite the model to treat one number as two findings.
		peakPeriod := jsString(s.peak["time_period"])
		if peakPeriod != jsString(s.first["time_period"]) && peakPeriod != jsString(s.last["time_period"]) {
			points = append(points, fmt.Sprintf("peaking at %s in %s", jsString(s.peak[metricConfig.MetricID]), peakPeriod))
		}
		points = append(points, fmt.Sprintf("%s in %s", jsString(s.last[metricConfig.MetricID]), jsString(s.last["time_period"])))
		lines = append(lines, fmt.Sprintf("- %s: %s %s", s.group, strings.Join(points, ", "), metricConfig.ShortLabel))
	}
	return strings.Join(lines, "\n")
}

// Each group's age-adjusted burden relative to the White (non-Hispanic)
// baseline. Without adjustment, a group with an older age profile looks worse on
// the raw rate for reasons that are demographic rather than inequitable, so this
// is the section that keeps the insight from over-reading the crude rates.
func formatAgeAdjustedRatios(rows []insightRow, demographicType string, metricConfig *insightMetricConfig) string {
	type entry struct {
		group string
		value float64
	}
	entries := make([]entry, 0, len(rows))
	for _, row := range rows {
		value, ok := finiteNumber(row[metricConfig.MetricID])
		if row[demographicType] == nil || !ok {
			continue
		}
		entries = append(entries, entry{jsString(row[demographicType]), value})
	}
	sort.SliceStable(entries, func(i, j int) bool { return entries[j].value < entries[i].value })

	lines := make([]string, 0, len(entries))
	for _, e := range entries {
		lines = append(lines, fmt.Sprintf("- %s: %sx the White (NH) rate", e.group, jsNumber(e.value)))
	}
	return strings.Join(lines, "\n")
}

// The share of cases whose demographic was never recorded. A high unknown share
// is itself an equity finding: it means the disparities in every other chart are
// measured on incomplete data, so the model needs the number to say so rather
// than treat the rates as the whole picture. When race and ethnicity are
// reported separately a place can have two unknown rows, so all of them are named.
func formatUnknownShare(rows []insightRow, demographicType string, metricConfig *insightMetricConfig) string {
	var lines []string
	for _, row := range rows {
		if !unknownDemographicGroups[jsString(row[demographicType])] {
			continue
		}
		if _, ok := finiteNumber(row[metricConfig.MetricID]); !ok {
			continue
		}
		// shortLabel already carries the unit and the topic, e.g. "% of COVID-19
		// deaths", so nothing is appended to it here.
		lines = append(lines, fmt.Sprintf("- %s: %s%s",
			jsString(row[demographicType]), jsString(row[metricConfig.MetricID]), metricConfig.ShortLabel))
	}
	return strings.Join(lines, "\n")
}

type reportDataSections struct {
	Demographic string
	Geographic  string
	Temporal    string
	AgeAdjusted string
	Unknown     string
}

func buildReportInsightPrompt(topic, location, demographicLabel string, data reportDataSections, demographicShape *tableColumnShape) string {
	// Five sections share one prompt, so each is capped individually. Each is
	// already reduced to a summary upstream; this is the backstop for a place
	// whose group or period count outruns that reduction.
	demographicSection := trimSectionToBudget(data.Demographic, insightBudgetReport)
	geographicSection := trimSectionToBudget(data.Geographic, insightBudgetReport)
	temporalSection := trimSectionToBudget(data.Temporal, insightBudgetReport)
	ageAdjustedSection := trimSectionToBudget(data.AgeAdjusted, insightBudgetReport)
	unknownSection := trimSectionToBudget(data.Unknown, insightBudgetReport)

	hasCaseloadShare := demographicShape != nil && demographicShape.HasCaseloadShare
	hasPopulationShare := demographicShape != nil && demographicShape.HasPopulationShare

	var extraColumns []string
	if hasCaseloadShare {
		extraColumns = append(extraColumns, "its share of the total")
	}
	if hasPopulationShare {
		extraColumns = append(extraColumns, "its share of the population")
	}

	demographicHeader := fmt.Sprintf("Current rates by %s in %s", demographicLabel, location)
	if len(extraColumns) > 0 {
		demographicHeader = fmt.Sprintf("Current rates by %s in %s, each group followed by %s",
			demographicLabel, location, strings.Join(extraColumns, " and "))
	}

	var dataBlocks []string
	if demographicSection != "" {
		dataBlocks = append(dataBlocks, demographicHeader+":\n"+demographicSection)
	}
	if geographicSection != "" {
		dataBlocks = append(dataBlocks, "Geographic spread:\n"+geographicSection)
	}
	if temporalSection != "" {
		dataBlocks = append(dataBlocks, fmt.Sprintf("Rates over time by %s in %s, first, highest, and latest reported periods:\n%s",
			demographicLabel, location, temporalSection))
	}
	if ageAdjustedSection != "" {
		dataBlocks = append(dataBlocks, fmt.Sprintf("Age-adjusted burden relative to the White (NH) baseline in %s:\n%s",
			location, ageAdjustedSection))
	}
	if unknownSection != "" {
		dataBlocks = append(dataBlocks, fmt.Sprintf("Cases missing %s data in %s:\n%s",
			demographicLabel, location, unknownSection))
	}
	dataBlock := ""
	if len(dataBlocks) > 0 {
		dataBlock = "\n\n" + strings.Join(dataBlocks, "\n\n") + "\n"
	}

	// Every spec below has a no-data variant. Without it the model is told to
	// lead with a number it was never given, which is exactly how a fabricated
	// rate gets into a summary.

	// A rounded multiple carries the finding in a way a rate never does, so the
	// headline is allowed to divide two rates it was actually sent. Rounding is
	// what makes that safe: "about 3 times higher" survives the arithmetic
	// slipping, where "3.4 times higher" would present the slip as a finding.
	ratioClause := " Express it as a rounded multiple of another rate shown above, such as 'about 3 times higher', never as a rate itself."
	if ageAdjustedSection != "" {
		ratioClause = " Prefer one of the ratios shown above; otherwise round a comparison between two rates shown, such as 'about 3 times higher'. Never state a rate itself."
	}

	// This is the one line a reader who skips the charts will actually read, so
	// it has to be the most accessible thing on the page. A per-100k rate means
	// little without the denominator in your head; "twice as likely" lands
	// immediately. Single quotes inside: this string is interpolated into the
	// JSON skeleton below, so a double quote would show the model a malformed
	// template.
	keyFindingsSpec := "1 sentence (max 25 words): the most important equity question this report helps answer. Do not state any rate or number."
	if demographicSection != "" {
		keyFindingsSpec = "1 sentence (max 25 words): the single most important takeaway, in plain words a reader who skipped every chart would understand. Name who carries the heaviest burden and how much heavier it is, expressed as a comparison in words such as 'nearly twice as likely'. Do not open with a rate per 100k." + ratioClause
	}

	locationSpec := "1-2 sentences (max 35 words): what to look for when comparing places on this map. Do not state any rate or number."
	if geographicSection != "" {
		locationSpec = "1-2 sentences (max 35 words): where the burden is heaviest, naming the place at the extreme and how far it sits from the rest."
	}

	// Age adjustment and the trend both fold in here rather than getting sections
	// of their own: one corrects how the demographic gap should be read, the
	// other says whether it is closing. Both are qualifiers on the gap.
	ageAdjustedClause := ""
	if ageAdjustedSection != "" {
		ageAdjustedClause = " Then use the age-adjusted ratios to say whether the gap holds once differences in age between groups are accounted for."
	}
	temporalClause := ""
	if temporalSection != "" {
		temporalClause = " Then say whether the gap between groups has widened or narrowed across the reported periods, naming the highest point if one is given."
	}

	// A rate gap says a group is worse off. Set against the group's share of the
	// population it says whether that group is carrying more of the burden than
	// its presence in the place would account for, which is the finding a reader
	// can act on. Only asked for when the shares were actually sent.
	populationShareClause := ""
	if hasPopulationShare {
		if hasCaseloadShare {
			populationShareClause = " Then say whether that group's share of the total is larger or smaller than its share of the population, using the shares above."
		} else {
			populationShareClause = " Then say how large or small a share of the population that group makes up, using the population shares above."
		}
		if demographicShape.GeneralPopulationLabel != "" {
			populationShareClause += fmt.Sprintf(" Those population shares count %s, a broader group than the rate itself measures, so call the comparison rough context rather than an exact figure.",
				demographicShape.GeneralPopulationLabel)
		}
	}

	demographicWordBudget := sectionWordBudget
	for _, present := range []bool{ageAdjustedSection != "", temporalSection != "", hasPopulationShare} {
		if present {
			demographicWordBudget += clauseWordBudget
		}
	}

	demographicSpec := "1-2 sentences (max 35 words): what to look for when comparing groups. Do not state any rate or number."
	if demographicSection != "" {
		demographicSpec = fmt.Sprintf("2-3 sentences (max %d words): which group is most affected and how large the gap is compared to others, using the rates above.%s%s%s",
			demographicWordBudget, populationShareClause, ageAdjustedClause, temporalClause)
	}

	// Missing demographic data is an equity finding, not a footnote: the groups
	// absent from the record are usually the ones already least well served, so
	// it belongs with what the report means rather than a section of its own.
	completenessClause := ""
	whatThisMeansWordBudget := sectionWordBudget
	sentenceRange := "1-2"
	if unknownSection != "" {
		completenessClause = fmt.Sprintf(" Then note in one sentence what share of cases is missing %s data, and that the rates above describe only the cases where it was recorded.", demographicLabel)
		whatThisMeansWordBudget += clauseWordBudget
		sentenceRange = "2-3"
	}
	whatThisMeansSpec := fmt.Sprintf("%s sentences (max %d words): what this means for real people in these communities, in plain everyday language.%s",
		sentenceRange, whatThisMeansWordBudget, completenessClause)

	return fmt.Sprintf(`You are a public health analyst reviewing a report about "%s" in %s, broken down by %s. Emphasize health equity aspects including demographic and geographic disparities, and ensure inclusive, person-first language. Remember these are extremely sensitive conditions that affect millions of real people.

The page contains multiple charts: a rate map, rates over time, a rate bar chart, an unknowns map, inequities over time, and a population vs distribution chart.
%s
WRITING RULES, follow these strictly:
%s
- Every number must trace back to the data above. Rounding one for readability and comparing two that are both shown are both fine; inventing, estimating, or guessing at a figure that is not there is not. If a number is not in the data, describe the pattern in words instead.
- Do not add causal explanations or place-specific facts that are not in the data.
- A rate of 0 means the source reported no rate for that place or period. Never cite a 0 as a rate, and never describe it as a place or time with no cases, no deaths, or no burden.
- Call a figure a peak, a high point, or a low point only where the data above labels it as one. A first or latest reported value is neither.
- Refer to a group by the shortest everyday form of the name shown in the data. Never swap in a different group, and never name a group the data does not list.
- Never label a group vulnerable, at-risk, high-risk, underserved, or a minority. Those words describe people by a deficit rather than by what they face. Name the group and name the burden instead.
- Use person-first wording: "people with diabetes", not "diabetics"; "people experiencing homelessness", not "the homeless".
- Write at an 8th-grade reading level. Use short words and simple sentences.
- Avoid jargon. If you must use a technical term, explain it immediately.
- Do not repeat the same number in more than one section.

Respond ONLY with a valid JSON object, no markdown, no backticks, no explanation outside the JSON. Include every key below and no others. Use this exact structure:

{
  "keyFindings": { "text": "%s", "highlight": "the key phrase from this section" },
  "locationComparison": { "text": "%s", "highlight": "the key phrase from this section" },
  "demographicInsights": { "text": "%s", "highlight": "the key phrase from this section" },
  "whatThisMeans": { "text": "%s", "highlight": "the key phrase from this section" }
}

Every section is an object carrying both keys. `+insightHighlightRule,
		topic, location, demographicLabel, dataBlock, plainLanguageRules, keyFindingsSpec, locationSpec, demographicSpec, whatThisMeansSpec)
}
