import type {
  DataTypeConfig,
  MetricConfig,
} from '../data/config/MetricConfigTypes'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import type {
  MetricQuery,
  MetricQueryResponse,
} from '../data/query/MetricQuery'
import { ALL, type DemographicGroup } from '../data/utils/Constants'
import type { HetRow } from '../data/utils/DatasetTypes'
import type { Fips } from '../data/utils/Fips'
import { fetchAIInsight, type InsightResult } from './fetchAIInsight'
import type { ScrollableHashId } from './hooks/useStepObserver'
import { REPORT_INSIGHT_PARAM_KEY } from './urlutils'

// Bump when the prompt wording changes materially, so already-cached insights
// (keyed by view, not by prompt text) are invalidated instead of served stale.
// v2: parent/national reference rates → same-level peer ranking + no-preamble rule.
export const INSIGHT_CACHE_VERSION = 'v2'

const MAP_CHART_IDS: ScrollableHashId[] = [
  'rate-map',
  'unknown-demographic-map',
  'multimap-modal',
]
const TIME_SERIES_CHART_IDS: ScrollableHashId[] = [
  'rates-over-time',
  'inequities-over-time',
]

// Select the most relevant metric config for the given chart type
export function getPrimaryMetricConfig(
  hashId: ScrollableHashId,
  metrics: DataTypeConfig['metrics'],
): MetricConfig | null {
  if (hashId === 'inequities-over-time')
    return metrics.pct_relative_inequity ?? null
  if (hashId === 'population-vs-distribution') return metrics.pct_share ?? null
  if (hashId === 'age-adjusted-ratios')
    return metrics.age_adjusted_ratio ?? null
  return metrics.per100k ?? metrics.pct_rate ?? metrics.index ?? null
}

// Format HetRows as a text list to embed in the prompt
export function formatDataRows(
  rows: HetRow[],
  hashId: ScrollableHashId,
  demographicType: DemographicType,
  metricConfig: MetricConfig,
  // When the user has focused a chart (e.g. the trend legend) on a subset of
  // groups, restrict the rows to those groups so the insight describes only
  // what is on screen. Empty/undefined means "all groups".
  selectedGroups?: DemographicGroup[],
): string {
  const isMap = MAP_CHART_IDS.includes(hashId)
  const isTimeSeries = TIME_SERIES_CHART_IDS.includes(hashId)
  const groupFilter =
    selectedGroups && selectedGroups.length > 0
      ? new Set<string>(selectedGroups.map(String))
      : null

  if (isTimeSeries) {
    // Group by demographic subgroup, then show the first and most recent year per group
    // so the model can describe the full trend arc (e.g. "fell from X in 2008 to Y in 2021")
    const byGroup: Record<string, HetRow[]> = {}
    for (const row of rows) {
      const group = String(row[demographicType] ?? 'Unknown')
      if (groupFilter && !groupFilter.has(group)) continue
      if (!byGroup[group]) byGroup[group] = []
      byGroup[group].push(row)
    }
    return Object.entries(byGroup)
      .flatMap(([group, groupRows]) => {
        const sorted = [...groupRows]
          .sort((a, b) =>
            String(a.time_period ?? '').localeCompare(
              String(b.time_period ?? ''),
            ),
          )
          .filter((row) => row[metricConfig.metricId] != null)
        if (sorted.length === 0) return []
        const points =
          sorted.length === 1
            ? [sorted[0]]
            : [sorted[0], sorted[sorted.length - 1]]
        return points.map(
          (row) =>
            `- ${group} (${row.time_period}): ${row[metricConfig.metricId]} ${metricConfig.shortLabel}`,
        )
      })
      .join('\n')
  }

  // For population-vs-distribution, include both the outcome share and
  // the population share side-by-side so the model can compute the disparity
  const popMetric =
    hashId === 'population-vs-distribution'
      ? metricConfig.populationComparisonMetric
      : null

  return rows
    .filter((row) => {
      // Maps always have a place name; other charts key off the demographic group.
      const hasLabel = isMap
        ? row.fips_name != null
        : row[demographicType] != null
      if (!hasLabel || row[metricConfig.metricId] == null) return false
      if (groupFilter && !groupFilter.has(String(row[demographicType])))
        return false
      return true
    })
    .map((row) => {
      // On a map, label each row with BOTH its place and demographic group so
      // the model can read either a geographic gap (across places) or a
      // within-place gap (across groups, with "All" as the baseline). Other
      // charts already vary only by demographic group, so the group alone suffices.
      const label = isMap
        ? `${row.fips_name} (${row[demographicType]})`
        : `${row[demographicType]}`
      const val = `${row[metricConfig.metricId]} ${metricConfig.shortLabel}`
      if (popMetric && row[popMetric.metricId] != null) {
        return `- ${label}: outcome share ${val}, population share ${row[popMetric.metricId]} ${popMetric.shortLabel}`
      }
      return `- ${label}: ${val}`
    })
    .join('\n')
}

export function buildPrompt(
  hashId: ScrollableHashId,
  topic: string,
  location: string,
  demographicLabel: string,
  dataSection: string,
  activeDemographicGroup?: DemographicGroup,
  // When true, dataSection ranks the region against its same-level peers, so
  // reframe from "describe the disparity" to "place this region among its peers".
  hasPeerComparison = false,
): string {
  const dataBlock = dataSection ? `\n\nData:\n${dataSection}` : ''

  if (MAP_CHART_IDS.includes(hashId) && hasPeerComparison) {
    return `This is a choropleth map of ${topic} in ${location}. Because only its overall rate is available locally, ${location} is ranked against its peer places at the same geographic level — which draw on the same data source and methodology, so the comparison is fair.${dataBlock}\n\nWrite a single sentence at an 8th grade reading level that says where ${location} falls among its peers (for example, higher than most, near the middle, or among the lowest), using the specific numbers, and what that means for the people who live there. Focus on the "so what", not the chart mechanics.`
  }

  if (MAP_CHART_IDS.includes(hashId)) {
    // Each data row is labeled `Place (Group)`, and an "All" row gives the
    // overall rate for that place. A map can be multi-region (compare places)
    // or single-region (compare groups within one place). Tell the model which
    // group the user is currently highlighting so it can lead with that story.
    const focus =
      activeDemographicGroup && activeDemographicGroup !== ALL
        ? ` The map currently highlights the ${activeDemographicGroup} group, so lead with that group and use the "All" baseline for comparison.`
        : ''
    return `This is a choropleth map showing ${topic} in ${location} by ${demographicLabel}. Each data row is labeled with its place and ${demographicLabel} group; an "All" row gives the overall rate for that place.${focus}${dataBlock}\n\nWrite a single sentence at an 8th grade reading level that highlights the most important health equity disparity — either a geographic gap between places or a gap between ${demographicLabel} groups within a place — and captures why it matters for real people. Focus on the "so what", not the chart mechanics.`
  }

  if (hashId === 'rates-over-time') {
    return `This is a line chart showing how ${topic} rates have changed over time in ${location} across ${demographicLabel} groups.${dataBlock}\n\nWrite a single sentence at an 8th grade reading level that names the specific years covered, describes whether the gap between groups is improving or worsening, and includes specific numbers — focus on what this trend means for real people.`
  }

  if (hashId === 'inequities-over-time') {
    return `This is a chart showing how the relative inequity in ${topic} has changed over time in ${location} across ${demographicLabel} groups. Positive values mean a group bears a greater share of ${topic} than their share of the population; negative means less.${dataBlock}\n\nWrite a single sentence at an 8th grade reading level that names the specific years covered, states whether inequity is improving or worsening for the most affected group, and includes specific numbers — focus on what this trend means for real people.`
  }

  if (hashId === 'data-table') {
    return `This is a data table summarizing ${topic} in ${location} by ${demographicLabel}, showing rates, population shares, and outcome shares for each group.${dataBlock}\n\nWrite a single sentence at an 8th grade reading level that goes beyond the single biggest disparity — consider the pattern across multiple groups, or compare how different groups' burdens relate to their population shares. Focus on the "so what" for the community.`
  }

  return `This is a ${hashId.replace(/-/g, ' ')} showing ${topic} in ${location} by ${demographicLabel}. The intended message is to highlight health equity disparities.${dataBlock}\n\nWrite a single sentence at an 8th grade reading level that captures the key inequity a viewer should walk away with — focus on the "so what", not the chart mechanics.`
}

interface InsightData {
  dataSection: string
  // Number of comparison entries (groups or regions) the model would receive.
  entryCount: number
}

// The selected region's own overall ("All") rate plus the overall rates of its
// same-level peers — e.g. a county against the other counties in its state, or
// a state against the other states. Peers share the region's data source, file,
// and methodology, so the comparison is apples-to-apples in a way that
// county-vs-state-vs-national (different files, time windows, aggregations) is
// not. Assembled by MapCard from a lazily-fetched peer query.
export interface PeerComparison {
  regionLabel: string // e.g. "Bartow County"
  regionValue: number
  peerNoun: string // plural, e.g. "Georgia counties" or "states"
  // Overall rates of reporting peers, with the selected region excluded.
  peerValues: number[]
  shortLabel: string
}

// Ranking of the region among its reporting peers, ready to render for the model.
export interface PeerRankSummary {
  regionLabel: string
  regionValue: number
  peerNoun: string
  reportingCount: number
  // Peers whose rate is strictly below the region's (i.e. the region exceeds them).
  higherThanCount: number
  median: number
  min: number
  max: number
  shortLabel: string
}

// Below this many reporting peers a rank isn't meaningful, so the fallback hides
// rather than rank against a near-empty field.
export const MIN_REPORTING_PEERS = 3

// Reduce raw peer rates to a rank summary, or null when too few peers report.
// Ordinal (rank + median + range) by design: it never places the region's rate
// beside a differently-computed reference figure, only beside same-level peers.
export function summarizePeerComparison(
  peer: PeerComparison,
): PeerRankSummary | null {
  const values = peer.peerValues.filter((v) => typeof v === 'number')
  if (values.length < MIN_REPORTING_PEERS) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const median =
    sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  return {
    regionLabel: peer.regionLabel,
    regionValue: peer.regionValue,
    peerNoun: peer.peerNoun,
    reportingCount: values.length,
    higherThanCount: values.filter((v) => v < peer.regionValue).length,
    median: Math.round(median * 10) / 10,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    shortLabel: peer.shortLabel,
  }
}

// Renders a peer rank summary as prompt bullet lines. Leads with the region's
// own rate, then its standing among peers and the peer distribution.
export function formatPeerComparison(summary: PeerRankSummary): string {
  return [
    `- ${summary.regionLabel}: ${summary.regionValue} ${summary.shortLabel}`,
    `- Ranked against ${summary.reportingCount} ${summary.peerNoun} that report this measure: higher than ${summary.higherThanCount} of them`,
    `- Peer median ${summary.median} ${summary.shortLabel}; range ${summary.min}–${summary.max} ${summary.shortLabel}`,
  ].join('\n')
}

// Supplied by MapCard so a single-region insight can lazily fetch and rank the
// region's same-level peers. Co-located here so MapCard and CardWrapper share it.
export interface InsightPeerConfig {
  // Same-level peer query (all counties in the state, or all states). Fetched
  // lazily by the insight card only when opened on a single-region view, so
  // multi-region maps never pay for it.
  peerQuery: MetricQuery
  // Plural noun for the peer set, e.g. "Georgia counties" or "states".
  peerNoun: string
  // The selected region's own overall ("All") rate, read from the region-self
  // query response. Undefined when the region has no overall rate.
  getRegionAllRate: (
    queryResponses: MetricQueryResponse[],
  ) => { label: string; value: number; shortLabel: string } | undefined
  // Overall ("All") rates of the peer places, with the selected region excluded.
  getPeerValues: (peerResponses: MetricQueryResponse[]) => number[]
}

// Optional context about which groups the user has focused the chart on.
export interface InsightContext {
  // The demographic group currently highlighted on a map (e.g. the active
  // choropleth group). Used only to steer the prompt, not to filter rows.
  activeDemographicGroup?: DemographicGroup
  // The subset of groups the user has selected (e.g. via the trend legend).
  // Filters the rows the model sees so the insight matches what is on screen.
  selectedGroups?: DemographicGroup[]
  // Same-level peer rates supplied when a map shows a single region with only an
  // overall rate. Lets the insight rank the region among its peers instead of
  // hiding. See getInsightDataStatus / summarizePeerComparison.
  peerComparison?: PeerComparison
}

// A stable suffix that changes when the user focuses the chart on a different
// group (highlighted map group / selected trend-legend lines). Those are local
// React state, not URL params, so without this the cache key would not change
// and a re-focused chart would serve the stale insight from the prior focus.
// Both the client-side insight cache and the server cache key derive from this
// single source so they can never disagree about what "the same view" means.
export function buildInsightFocusSuffix(context?: InsightContext): string {
  return [
    context?.activeDemographicGroup && context.activeDemographicGroup !== ALL
      ? context.activeDemographicGroup
      : '',
    context?.selectedGroups?.length
      ? [...context.selectedGroups].sort().join(',')
      : '',
  ]
    .filter(Boolean)
    .join('|')
}

// Shapes the chart's query response into the exact text the model is given.
// Kept separate from generation so the UI can gate on entryCount up front,
// guaranteeing the visibility check and the generated text never disagree.
export function prepareInsightData(
  hashId: ScrollableHashId,
  dataTypeConfig: DataTypeConfig,
  demographicType: DemographicType,
  queryResponses?: MetricQueryResponse[],
  selectedGroups?: DemographicGroup[],
): InsightData {
  let dataSection = ''
  if (queryResponses?.[0]) {
    const metricConfig = getPrimaryMetricConfig(hashId, dataTypeConfig.metrics)
    if (metricConfig) {
      const rows = queryResponses[0].getValidRowsForField(metricConfig.metricId)
      dataSection = formatDataRows(
        rows,
        hashId,
        demographicType,
        metricConfig,
        selectedGroups,
      )
    }
  }
  const entryCount = dataSection
    ? dataSection.split('\n').filter(Boolean).length
    : 0
  return { dataSection, entryCount }
}

// How much comparison an insight has to work with:
// - 'multi'         — two or more values on screen; describe the disparity directly.
// - 'single-region' — a map with fewer than two on-screen values but a usable
//                     overall ("All") rate for the selected region (a county
//                     where every subgroup is suppressed, or a state with no
//                     county-level data). Nothing local to compare, but the
//                     region can be ranked against its same-level peers.
// - 'empty'         — nothing usable (suppressed/missing); hide the insight.
export type InsightDataStatus = 'multi' | 'single-region' | 'empty'

export function getInsightDataStatus(
  hashId: ScrollableHashId,
  dataTypeConfig: DataTypeConfig,
  demographicType: DemographicType,
  queryResponses?: MetricQueryResponse[],
  selectedGroups?: DemographicGroup[],
  // Whether the selected region has its own overall "All" rate (from the
  // region-self query). Gates the peer fallback so a lone subgroup row — with no
  // overall rate — stays hidden rather than being ranked as the region's overall.
  regionHasAllRate = false,
): InsightDataStatus {
  const { entryCount } = prepareInsightData(
    hashId,
    dataTypeConfig,
    demographicType,
    queryResponses,
    selectedGroups,
  )
  if (entryCount >= 2) return 'multi'
  if (MAP_CHART_IDS.includes(hashId) && regionHasAllRate) return 'single-region'
  return 'empty'
}

export async function generateCardInsight(
  hashId: ScrollableHashId,
  dataTypeConfig: DataTypeConfig,
  demographicType: DemographicType,
  fips?: Fips,
  queryResponses?: MetricQueryResponse[],
  isCompareCard?: boolean,
  context?: InsightContext,
): Promise<InsightResult> {
  const topic = dataTypeConfig.fullDisplayName
  const location = fips?.getSentenceDisplayName() ?? 'the United States'
  const demographic = DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]

  const { dataSection } = prepareInsightData(
    hashId,
    dataTypeConfig,
    demographicType,
    queryResponses,
    context?.selectedGroups,
  )

  // Single-region map: rank the region against its same-level peers instead of
  // describing an on-screen disparity. summarizePeerComparison returns null when
  // too few peers report, in which case we fall through to the standard framing.
  const peerSummary =
    MAP_CHART_IDS.includes(hashId) && context?.peerComparison
      ? summarizePeerComparison(context.peerComparison)
      : null

  // The peer summary already leads with the region's own rate, so it replaces
  // the lone local row rather than appending to it.
  const finalDataSection = peerSummary
    ? formatPeerComparison(peerSummary)
    : dataSection

  // Keep the model from narrating the prompt (e.g. "Since only the overall rate
  // is available, here's a sentence...") — the card wants the bare insight.
  const outputRule =
    ' Respond with ONLY the single sentence itself — no preamble, no lead-in, no labels, and do not restate these instructions or note which data is or is not available.'
  const prompt =
    buildPrompt(
      hashId,
      topic,
      location,
      demographic,
      finalDataSection,
      context?.activeDemographicGroup,
      Boolean(peerSummary),
    ) + outputRule

  const params = new URLSearchParams(window.location.search)
  params.delete(REPORT_INSIGHT_PARAM_KEY)
  const cardSuffix = isCompareCard ? '-2' : ''
  // Focus (highlighted map group / selected trend lines) lives in React state,
  // not the URL, so it must be folded into the key or the server returns the
  // insight cached for the previous focus even though the prompt has changed.
  const focusSuffix = buildInsightFocusSuffix(context)
  const cacheKey = `${window.location.pathname}?${params.toString()}#${hashId}${cardSuffix}${focusSuffix ? `-${focusSuffix}` : ''}-${INSIGHT_CACHE_VERSION}`

  const result = await fetchAIInsight(prompt, {
    cacheKey,
    topic: dataTypeConfig.dataTypeId,
  })
  return { ...result, cacheKey }
}
