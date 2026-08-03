import type {
  DataTypeConfig,
  MetricConfig,
} from '../data/config/MetricConfigTypes'
import { exclude } from '../data/query/BreakdownFilter'
import {
  Breakdowns,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import {
  MetricQuery,
  type MetricQueryResponse,
} from '../data/query/MetricQuery'
import {
  ALL,
  MULTI_OR_OTHER_STANDARD_NH,
  NON_HISPANIC,
  RACE,
  UNKNOWN,
  UNKNOWN_ETHNICITY,
  UNKNOWN_RACE,
  WHITE_NH,
} from '../data/utils/Constants'
import type { HetRow } from '../data/utils/DatasetTypes'
import {
  groupIsAll,
  splitIntoKnownsAndUnknowns,
} from '../data/utils/datasetutils'
import type { Fips } from '../data/utils/Fips'
import { ERROR_GENERATING_INSIGHT, fetchAIInsight } from './fetchAIInsight'
import {
  formatMetricValue,
  formatPeerComparison,
  getPeerValues,
  getPrimaryMetricConfig,
  getRegionAllRate,
  getTableColumnShape,
  resolveTableShareMetrics,
  summarizePeerComparison,
  type TableColumnShape,
} from './generateVisualizationInsight'
import { getDataManager } from './globals'
import { buildInsightCacheKey } from './insightCacheKey'
import {
  INSIGHT_DATA_BUDGETS,
  trimSectionToBudget,
} from './insightPromptBudget'

// The report-wide insight is a synthesis, not a walkthrough of the cards below
// it. Trend and data-completeness findings fold into these four sections rather
// than each getting a section of their own, which would turn the card into a
// table of contents for the report.
export type ReportInsightSections = {
  keyFindings: string
  locationComparison: string
  demographicInsights: string
  whatThisMeans: string
}

const SECTION_KEYS = [
  'keyFindings',
  'locationComparison',
  'demographicInsights',
  'whatThisMeans',
] as const satisfies readonly (keyof ReportInsightSections)[]

type ReportInsightResult = {
  sections: ReportInsightSections | null
  rateLimited: boolean
  unavailable?: boolean
  error?: string
  // The exact server cache key used — needed to flag this specific insight.
  cacheKey?: string
}

// How many places to name at each end of the geographic spread. Enough to show
// a pattern rather than a lone outlier, few enough that a state with hundreds of
// counties still produces a bounded prompt.
const SPREAD_SAMPLE_SIZE = 3

// Word budgets for the two sections that absorb optional clauses. The base
// covers the section's own finding; each clause folded in buys roughly one more
// sentence, so a section never has to say more in the same breath.
const SECTION_WORD_BUDGET = 35
const CLAUSE_WORD_BUDGET = 20

// Rates for every demographic group in the selected place, overall row first so
// the model has a baseline to measure each group against. Sorted rather than
// left in row order so the same data always renders the same text, which the
// prompt-hash cache key depends on.
export function formatDemographicRates(
  rows: HetRow[],
  demographicType: DemographicType,
  metricConfig: MetricConfig,
  // The same two share columns the data table shows. A rate alone says a group
  // is worse off; the shares say whether that group carries more of the burden
  // than its presence in the place would account for.
  shareConfig?: MetricConfig,
  populationConfig?: MetricConfig,
): string {
  return rows
    .filter(
      (row) =>
        row[demographicType] != null &&
        Number.isFinite(row[metricConfig.metricId]),
    )
    .map((row) => ({
      group: String(row[demographicType]),
      value: row[metricConfig.metricId] as number,
      row,
    }))
    .sort((a, b) => {
      if (groupIsAll(a.group) !== groupIsAll(b.group))
        return groupIsAll(a.group) ? -1 : 1
      return b.value - a.value
    })
    .map(({ group, value, row }) => {
      const parts = [formatMetricValue(value, metricConfig)]
      for (const config of [shareConfig, populationConfig]) {
        if (config && row[config.metricId] != null) {
          parts.push(formatMetricValue(row[config.metricId], config))
        }
      }
      return `- ${group}: ${parts.join(', ')}`
    })
    .join('\n')
}

// The spread of overall rates across the child places shown on the report's map,
// reduced to both extremes plus a median. Sending every county would dominate
// the prompt without telling the model more than its shape does.
export function formatGeographicSpread(
  rows: HetRow[],
  metricConfig: MetricConfig,
  placeNoun: string,
): string {
  const places = rows
    .filter(
      (row) =>
        row.fips_name != null && Number.isFinite(row[metricConfig.metricId]),
    )
    .map((row) => ({
      name: String(row.fips_name),
      value: row[metricConfig.metricId] as number,
    }))
    .sort((a, b) => b.value - a.value)

  // One place is not a geographic comparison, so say nothing rather than
  // present a lone value as if it were a spread.
  if (places.length < 2) return ''

  const unit = metricConfig.shortLabel
  const render = (place: { name: string; value: number }) =>
    `${place.name} ${place.value}`

  // Naming every place beats a top/bottom split that would repeat most of them.
  if (places.length <= SPREAD_SAMPLE_SIZE * 2) {
    return `- All ${places.length} ${placeNoun}: ${places.map(render).join(', ')} ${unit}`
  }

  const values = places.map((place) => place.value)
  const mid = Math.floor(values.length / 2)
  const median =
    values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid]

  return [
    `- Highest: ${places.slice(0, SPREAD_SAMPLE_SIZE).map(render).join(', ')} ${unit}`,
    `- Lowest reported: ${places.slice(-SPREAD_SAMPLE_SIZE).reverse().map(render).join(', ')} ${unit}`,
    `- Median across ${places.length} ${placeNoun}: ${Math.round(median * 10) / 10} ${unit}`,
  ].join('\n')
}

// Each group's first, highest, and latest reported rate, which is what the
// rates-over-time chart is for. Three points per group rather than the full
// series let the model say both whether overall rates moved and whether the gap
// between groups widened or narrowed, which is the same thing the
// inequities-over-time chart plots, at a fraction of the prompt size.
//
// The peak is not decoration. On a monthly series like COVID-19 the first and
// last months both sit at zero, so endpoints alone would describe a condition
// that never happened.
export function formatTemporalChange(
  rows: HetRow[],
  demographicType: DemographicType,
  metricConfig: MetricConfig,
): string {
  const byGroup = new Map<string, HetRow[]>()
  for (const row of rows) {
    const group = row[demographicType]
    if (group == null) continue
    if (!Number.isFinite(row[metricConfig.metricId])) continue
    if (row.time_period == null) continue
    const existing = byGroup.get(String(group))
    if (existing) existing.push(row)
    else byGroup.set(String(group), [row])
  }

  const spans = [...byGroup.entries()]
    .map(([group, groupRows]) => {
      const sorted = [...groupRows].sort((a, b) =>
        String(a.time_period).localeCompare(String(b.time_period)),
      )
      const peak = sorted.reduce((highest, row) =>
        (row[metricConfig.metricId] as number) >
        (highest[metricConfig.metricId] as number)
          ? row
          : highest,
      )
      return {
        group,
        first: sorted[0],
        peak,
        last: sorted[sorted.length - 1],
      }
    })
    // A single time point is a rate, not a change, so it belongs in the
    // demographic section rather than being restated here as a trend.
    .filter(({ first, last }) => first.time_period !== last.time_period)
    .sort((a, b) => {
      if (groupIsAll(a.group) !== groupIsAll(b.group))
        return groupIsAll(a.group) ? -1 : 1
      return (
        (b.last[metricConfig.metricId] as number) -
        (a.last[metricConfig.metricId] as number)
      )
    })

  return spans
    .map(({ group, first, peak, last }) => {
      const points = [
        `${first[metricConfig.metricId]} in ${first.time_period}`,
        // A peak at either endpoint is already named, so repeating it would
        // just invite the model to treat one number as two findings.
        peak.time_period !== first.time_period &&
          peak.time_period !== last.time_period &&
          `peaking at ${peak[metricConfig.metricId]} in ${peak.time_period}`,
        `${last[metricConfig.metricId]} in ${last.time_period}`,
      ].filter(Boolean)
      return `- ${group}: ${points.join(', ')} ${metricConfig.shortLabel}`
    })
    .join('\n')
}

// Each group's age-adjusted burden relative to the White (non-Hispanic) baseline.
// Only meaningful for conditions that skew heavily by age: without adjustment, a
// group with an older age profile looks worse on the raw rate for reasons that
// are demographic rather than inequitable, so this is the section that keeps the
// insight from over-reading the crude rates above.
export function formatAgeAdjustedRatios(
  rows: HetRow[],
  demographicType: DemographicType,
  metricConfig: MetricConfig,
): string {
  return rows
    .filter(
      (row) =>
        row[demographicType] != null &&
        Number.isFinite(row[metricConfig.metricId]),
    )
    .map((row) => ({
      group: String(row[demographicType]),
      value: row[metricConfig.metricId] as number,
    }))
    .sort((a, b) => b.value - a.value)
    .map(({ group, value }) => `- ${group}: ${value}x the White (NH) rate`)
    .join('\n')
}

// The share of cases whose demographic was never recorded, which the report's
// unknowns map shows. A high unknown share is itself an equity finding: it means
// the disparities in every other chart are measured on incomplete data, so the
// model needs the number to say so rather than treat the rates as the whole
// picture. When race and ethnicity are reported separately a place can have two
// unknown rows, so all of them are named.
export function formatUnknownShare(
  rows: HetRow[],
  demographicType: DemographicType,
  metricConfig: MetricConfig,
): string {
  const [, unknowns] = splitIntoKnownsAndUnknowns(rows, demographicType)
  return unknowns
    .filter((row) => Number.isFinite(row[metricConfig.metricId]))
    .map(
      (row) =>
        // shortLabel already carries the unit and the topic, e.g.
        // "% of COVID-19 deaths", so nothing is appended to it here.
        `- ${row[demographicType]}: ${row[metricConfig.metricId]}${metricConfig.shortLabel}`,
    )
    .join('\n')
}

export type ReportDataSections = {
  demographicSection: string
  geographicSection: string
  temporalSection: string
  ageAdjustedSection: string
  unknownSection: string
}

const EMPTY_SECTIONS: ReportDataSections = {
  demographicSection: '',
  geographicSection: '',
  temporalSection: '',
  ageAdjustedSection: '',
  unknownSection: '',
}

export function buildReportInsightPrompt(
  topic: string,
  location: string,
  demographicLabel: string,
  data: ReportDataSections,
  // Which share columns the demographic rows carry, so the block header and the
  // section spec describe the numbers actually sent and nothing more.
  demographicShape?: TableColumnShape,
): string {
  // Five sections share one prompt, so each is capped individually. Each is
  // already reduced to a summary upstream; this is the backstop for a place
  // whose group or period count outruns that reduction.
  const trim = (section: string) =>
    trimSectionToBudget(section, INSIGHT_DATA_BUDGETS.report)

  const demographicSection = trim(data.demographicSection)
  const geographicSection = trim(data.geographicSection)
  const temporalSection = trim(data.temporalSection)
  const ageAdjustedSection = trim(data.ageAdjustedSection)
  const unknownSection = trim(data.unknownSection)

  const extraColumns = [
    demographicShape?.hasCaseloadShare && 'its share of the total',
    demographicShape?.hasPopulationShare && 'its share of the population',
  ].filter((part): part is string => Boolean(part))

  const demographicHeader = extraColumns.length
    ? `Current rates by ${demographicLabel} in ${location}, each group followed by ${extraColumns.join(' and ')}`
    : `Current rates by ${demographicLabel} in ${location}`

  const dataBlocks = [
    demographicSection && `${demographicHeader}:\n${demographicSection}`,
    geographicSection && `Geographic spread:\n${geographicSection}`,
    temporalSection &&
      `Rates over time by ${demographicLabel} in ${location}, first, highest, and latest reported periods:\n${temporalSection}`,
    ageAdjustedSection &&
      `Age-adjusted burden relative to the White (NH) baseline in ${location}:\n${ageAdjustedSection}`,
    unknownSection &&
      `Cases missing ${demographicLabel} data in ${location}:\n${unknownSection}`,
  ].filter(Boolean)

  const dataBlock = dataBlocks.length ? `\n\n${dataBlocks.join('\n\n')}\n` : ''

  // Every spec below has a no-data variant. Without it the model is told to lead
  // with a number it was never given, which is exactly how a fabricated rate
  // gets into a summary.

  // This is the one line a reader who skips the charts will actually read, so it
  // has to be the most accessible thing on the page rather than a restatement of
  // the rate map. A per-100k rate means little without the denominator in your
  // head; "twice as likely" lands immediately. Comparisons stay grounded because
  // the age-adjusted block already supplies ratios, so the model is describing a
  // figure it was given rather than deriving one.
  // Inviting a comparison without supplying a ratio is how "ten times higher
  // than average" gets computed from two rates and presented as a finding, so
  // the headline may only cite a ratio when one was actually sent.
  const ratioClause = ageAdjustedSection
    ? ' You may cite one of the ratios shown above, but do not work out any other figure.'
    : ' State no figure at all; make the comparison in words only.'

  // Single quotes inside: this string is interpolated into the JSON skeleton
  // below, so a double quote here would show the model a malformed template.
  const keyFindingsSpec = demographicSection
    ? `1 sentence (max 25 words): the single most important takeaway, in plain words a reader who skipped every chart would understand. Name who carries the heaviest burden and how much heavier it is, expressed as a comparison in words such as 'nearly twice as likely'. Do not open with a rate per 100k.${ratioClause}`
    : '1 sentence (max 25 words): the most important equity question this report helps answer. Do not state any rate or number.'

  const locationSpec = geographicSection
    ? '1-2 sentences (max 35 words): what the geographic spread shows about where the burden is heaviest.'
    : '1-2 sentences (max 35 words): what to look for when comparing places on this map. Do not state any rate or number.'

  // Age adjustment and the trend both fold in here rather than getting sections
  // of their own: one corrects how the demographic gap should be read, the other
  // says whether it is closing. Both are qualifiers on the gap, not new findings.
  const ageAdjustedClause = ageAdjustedSection
    ? ' Then use the age-adjusted ratios to say whether the gap holds once differences in age between groups are accounted for.'
    : ''

  const temporalClause = temporalSection
    ? ' Then say whether the gap between groups has widened or narrowed across the reported periods, naming the highest point if one is given.'
    : ''

  // A rate gap says a group is worse off. Set against the group's share of the
  // population it says whether that group is carrying more of the burden than
  // its presence in the place would account for, which is the finding a reader
  // can act on. Only asked for when the shares were actually sent.
  const populationShareClause = demographicShape?.hasPopulationShare
    ? `${
        demographicShape.hasCaseloadShare
          ? " Then say whether that group's share of the total is larger or smaller than its share of the population, using the shares above."
          : ' Then say how large or small a share of the population that group makes up, using the population shares above.'
      }${
        demographicShape.generalPopulationLabel
          ? ` Those population shares count ${demographicShape.generalPopulationLabel}, a broader group than the rate itself measures, so call the comparison rough context rather than an exact figure.`
          : ''
      }`
    : ''

  const demographicWordBudget =
    SECTION_WORD_BUDGET +
    (ageAdjustedSection ? CLAUSE_WORD_BUDGET : 0) +
    (temporalSection ? CLAUSE_WORD_BUDGET : 0) +
    (demographicShape?.hasPopulationShare ? CLAUSE_WORD_BUDGET : 0)

  const demographicSpec = demographicSection
    ? `2-3 sentences (max ${demographicWordBudget} words): which group is most affected and how large the gap is compared to others, using the rates above.${populationShareClause}${ageAdjustedClause}${temporalClause}`
    : '1-2 sentences (max 35 words): what to look for when comparing groups. Do not state any rate or number.'

  // Missing demographic data is an equity finding, not a footnote: the groups
  // absent from the record are usually the ones already least well served, so it
  // belongs with what the report means rather than in a section of its own.
  const completenessClause = unknownSection
    ? ` Then note in one sentence what share of cases is missing ${demographicLabel} data, and that the rates above describe only the cases where it was recorded.`
    : ''

  const whatThisMeansWordBudget =
    SECTION_WORD_BUDGET + (unknownSection ? CLAUSE_WORD_BUDGET : 0)

  const whatThisMeansSpec = `${unknownSection ? '2-3' : '1-2'} sentences (max ${whatThisMeansWordBudget} words): what this means for real people in these communities, in plain everyday language.${completenessClause}`

  return `You are a public health analyst reviewing a report about "${topic}" in ${location}, broken down by ${demographicLabel}. Emphasize health equity aspects including demographic and geographic disparities, and ensure inclusive, person-first language. Remember these are extremely sensitive conditions that affect millions of real people.

The page contains multiple charts: a rate map, rates over time, a rate bar chart, an unknowns map, inequities over time, and a population vs distribution chart.
${dataBlock}
WRITING RULES, follow these strictly:
- Use only numbers that appear in the data above. Never estimate, infer, round differently, derive a new figure by combining two that are shown, or introduce a figure that is not shown. If a number is not in the data, describe the pattern in words instead.
- Do not add causal explanations or place-specific facts that are not in the data.
- A rate of 0 means the source reported no rate for that place or period. Never cite a 0 as a rate, and never describe it as a place or time with no cases, no deaths, or no burden.
- Call a figure a peak, a high point, or a low point only where the data above labels it as one. A first or latest reported value is neither.
- Write every demographic group name exactly as it appears in the data above. Never expand, abbreviate, or reword it; the names shown are the ones used throughout the rest of the report.
- Never label a group vulnerable, at-risk, high-risk, underserved, or a minority. Those words describe people by a deficit rather than by what they face. Name the group and name the burden instead.
- Use person-first wording: "people with diabetes", not "diabetics"; "people experiencing homelessness", not "the homeless".
- Write at an 8th-grade reading level. Use short words and simple sentences.
- Avoid jargon. If you must use a technical term, explain it immediately.
- Do not repeat the same number in more than one section.

Respond ONLY with a valid JSON object, no markdown, no backticks, no explanation outside the JSON. Include every key below and no others. Use this exact structure:

{
  "keyFindings": "${keyFindingsSpec}",
  "locationComparison": "${locationSpec}",
  "demographicInsights": "${demographicSpec}",
  "whatThisMeans": "${whatThisMeansSpec}"
}`
}

function parseSections(raw: string): ReportInsightSections | null {
  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    for (const key of SECTION_KEYS) {
      if (typeof parsed[key] !== 'string') return null
    }

    return Object.fromEntries(
      SECTION_KEYS.map((key) => [key, parsed[key]]),
    ) as ReportInsightSections
  } catch (error) {
    console.error('Failed to parse report insight JSON:', error)
    return null
  }
}

// A county has no child places, so Breakdowns.forChildrenFips would return the
// county itself. Rank it against its same-level peers instead, the same
// apples-to-apples comparison the map card's single-region insight makes.
function formatCountyPeerRanking(
  placeResponse: MetricQueryResponse,
  peerResponse: MetricQueryResponse,
  metricConfig: MetricConfig,
  demographicType: DemographicType,
  fips: Fips,
  parentFips: Fips,
): string {
  const regionRate = getRegionAllRate(
    placeResponse,
    metricConfig,
    demographicType,
    fips.getDisplayName(),
  )
  if (!regionRate) return ''

  const summary = summarizePeerComparison({
    regionLabel: regionRate.label,
    regionValue: regionRate.value,
    peerNoun: `${parentFips.getDisplayName()} ${parentFips.getPluralChildFipsTypeDisplayName()}`,
    peerValues: getPeerValues(
      peerResponse,
      metricConfig,
      demographicType,
      fips.code,
    ),
    shortLabel: metricConfig.shortLabel,
  })

  return summary ? formatPeerComparison(summary) : ''
}

// The rates the report's own cards already display, re-read through DataManager
// so the insight describes the same numbers the user sees. Every underlying
// dataset here is one a card on the page has already loaded, so these resolve
// against the dataset cache rather than the network.
async function loadReportData(
  dataTypeConfig: DataTypeConfig,
  demographicType: DemographicType,
  fips: Fips,
): Promise<ReportDataSections & { demographicShape?: TableColumnShape }> {
  const metricConfig = getPrimaryMetricConfig(
    'rate-map',
    dataTypeConfig.metrics,
  )
  if (!metricConfig) return EMPTY_SECTIONS

  const { shareConfig, populationConfig, generalPopulationLabel } =
    resolveTableShareMetrics(dataTypeConfig)

  const breakdownFilter =
    demographicType === RACE
      ? exclude(NON_HISPANIC, UNKNOWN, UNKNOWN_RACE, UNKNOWN_ETHNICITY)
      : exclude(UNKNOWN)

  const query = (breakdowns: Breakdowns) =>
    new MetricQuery(
      [metricConfig.metricId],
      breakdowns.addBreakdown(demographicType, breakdownFilter),
      dataTypeConfig.dataTypeId,
    )

  // The place query alone carries the share columns. The children query feeds
  // the geographic spread, which reads one rate per place and would be paying
  // for columns it never renders.
  const placeMetricIds = [
    metricConfig.metricId,
    shareConfig?.metricId,
    populationConfig?.metricId,
  ].filter((id) => id != null)

  // A county has no child places, so Breakdowns.forChildrenFips would return the
  // county itself. Rank it against its same-level peers instead, the same
  // apples-to-apples comparison the map card's single-region insight makes.
  const isCounty = fips.isCounty()
  const parentFips = fips.getParentFips()

  // Mirrors UnknownsMapCard: the unknown share lives on its own metric, and its
  // query must NOT exclude the unknown groups the way the rate queries do.
  const unknownConfig =
    dataTypeConfig.metrics?.pct_share_unknown ??
    dataTypeConfig.metrics?.pct_share

  // Age adjustment is published only against a White (NH) baseline, so the
  // ratios describe a race gap and nothing else. On a report broken down by age
  // or sex they would qualify a gap the reader is not looking at, so they are
  // left out entirely rather than sent alongside a mismatched breakdown.
  const ageAdjustedConfig =
    demographicType === RACE
      ? dataTypeConfig.metrics?.age_adjusted_ratio
      : undefined

  const [
    placeResponse,
    geoResponse,
    temporalResponse,
    ageAdjustedResponse,
    unknownResponse,
  ] = await Promise.all([
    getDataManager().loadMetrics(
      new MetricQuery(
        placeMetricIds,
        Breakdowns.forFips(fips).addBreakdown(demographicType, breakdownFilter),
        dataTypeConfig.dataTypeId,
      ),
    ),
    getDataManager().loadMetrics(
      query(Breakdowns.forChildrenFips(isCounty ? parentFips : fips)),
    ),
    getDataManager().loadMetrics(
      new MetricQuery(
        [metricConfig.metricId],
        Breakdowns.forFips(fips).addBreakdown(demographicType, breakdownFilter),
        dataTypeConfig.dataTypeId,
        'historical',
      ),
    ),
    ageAdjustedConfig
      ? getDataManager().loadMetrics(
          new MetricQuery(
            [ageAdjustedConfig.metricId],
            Breakdowns.forFips(fips).addBreakdown(
              RACE,
              exclude(ALL, NON_HISPANIC, WHITE_NH, MULTI_OR_OTHER_STANDARD_NH),
            ),
            dataTypeConfig.dataTypeId,
          ),
        )
      : undefined,
    unknownConfig
      ? getDataManager().loadMetrics(
          new MetricQuery(
            [unknownConfig.metricId],
            // No exclude filter here, unlike the rate queries above: the unknown
            // groups are the entire point of this one.
            Breakdowns.forFips(fips).addBreakdown(demographicType),
            dataTypeConfig.dataTypeId,
          ),
        )
      : undefined,
  ])

  const demographicRows = placeResponse.getValidRowsForField(
    metricConfig.metricId,
  )

  const demographicSection = formatDemographicRates(
    demographicRows,
    demographicType,
    metricConfig,
    shareConfig,
    populationConfig,
  )

  const demographicShape = getTableColumnShape(
    demographicRows,
    demographicType,
    metricConfig,
    { shareConfig, populationConfig, generalPopulationLabel },
  )

  const temporalSection = formatTemporalChange(
    temporalResponse.getValidRowsForField(metricConfig.metricId),
    demographicType,
    metricConfig,
  )

  const ageAdjustedSection =
    ageAdjustedConfig && ageAdjustedResponse
      ? formatAgeAdjustedRatios(
          ageAdjustedResponse.getValidRowsForField(ageAdjustedConfig.metricId),
          RACE,
          ageAdjustedConfig,
        )
      : ''

  const unknownSection =
    unknownConfig && unknownResponse
      ? formatUnknownShare(
          unknownResponse.getValidRowsForField(unknownConfig.metricId),
          demographicType,
          unknownConfig,
        )
      : ''

  return {
    demographicSection,
    demographicShape,
    geographicSection: isCounty
      ? formatCountyPeerRanking(
          placeResponse,
          geoResponse,
          metricConfig,
          demographicType,
          fips,
          parentFips,
        )
      : formatGeographicSpread(
          geoResponse
            .getValidRowsForField(metricConfig.metricId)
            .filter((row) => groupIsAll(String(row[demographicType]))),
          metricConfig,
          fips.getPluralChildFipsTypeDisplayName(),
        ),
    temporalSection,
    ageAdjustedSection,
    unknownSection,
  }
}

export async function generateReportInsight(
  dataTypeConfig: DataTypeConfig,
  demographicType: DemographicType,
  fips: Fips,
): Promise<ReportInsightResult> {
  try {
    const topic = dataTypeConfig.fullDisplayName
    const location = fips.getSentenceDisplayName()
    const data = await loadReportData(dataTypeConfig, demographicType, fips)
    const prompt = buildReportInsightPrompt(
      topic,
      location,
      DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType],
      data,
      data.demographicShape,
    )
    const cacheKey = buildInsightCacheKey('', prompt)
    const result = await fetchAIInsight(prompt, {
      cacheKey,
      topic: dataTypeConfig.dataTypeId,
    })

    if (result.rateLimited) {
      return { sections: null, rateLimited: true, cacheKey }
    }

    if (result.unavailable) {
      return { sections: null, rateLimited: false, unavailable: true, cacheKey }
    }

    if (result.error) {
      return {
        sections: null,
        rateLimited: false,
        error: ERROR_GENERATING_INSIGHT,
        cacheKey,
      }
    }

    const sections = parseSections(result.content)
    return { sections, rateLimited: false, cacheKey }
  } catch (error) {
    console.error(ERROR_GENERATING_INSIGHT, error)
    return {
      sections: null,
      rateLimited: false,
      error: ERROR_GENERATING_INSIGHT,
    }
  }
}
