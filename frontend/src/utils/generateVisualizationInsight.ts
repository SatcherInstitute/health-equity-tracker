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
import { groupIsAll } from '../data/utils/datasetutils'
import type { Fips } from '../data/utils/Fips'
import { fetchAIInsight, type InsightResult } from './fetchAIInsight'
import type { ScrollableHashId } from './hooks/useStepObserver'
import { buildInsightCacheKey } from './insightCacheKey'

const MAP_CHART_IDS: ScrollableHashId[] = [
  'rate-map',
  'unknown-demographic-map',
  'multimap-modal',
]

const TIME_SERIES_CHART_IDS: ScrollableHashId[] = [
  'rates-over-time',
  'inequities-over-time',
]

// Per-side data-section budget for time series. Compare mode sends two of
// these in one prompt, so this is set well under half the server's prompt
// cap (server/insight_budget.go) to leave room for scaffold text on both sides.
const TIME_SERIES_TARGET_BYTES = 12 * 1024

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
  // The demographic group currently highlighted on a map. When the map is
  // showing multiple places (a real geographic comparison), default to only
  // this group's rows across places, since that's what's on screen and it
  // keeps the prompt small. When only one place is in view, there's no
  // geographic comparison to make, so send every group for that one place
  // instead (the ALL-groups-within-place fallback).
  activeDemographicGroup?: DemographicGroup,
): string {
  const isMap = MAP_CHART_IDS.includes(hashId)
  const isTimeSeries = TIME_SERIES_CHART_IDS.includes(hashId)
  const groupFilter =
    selectedGroups && selectedGroups.length > 0
      ? new Set<string>(selectedGroups.map(String))
      : null

  if (isTimeSeries) {
    // Group by demographic subgroup and sort each group's points chronologically.
    const byGroup: Record<string, HetRow[]> = {}
    for (const row of rows) {
      const group = String(row[demographicType] ?? 'Unknown')
      if (groupFilter && !groupFilter.has(group)) continue
      if (row[metricConfig.metricId] == null) continue
      if (!byGroup[group]) byGroup[group] = []
      byGroup[group].push(row)
    }
    const sortedByGroup = Object.entries(byGroup).map(
      ([group, groupRows]) =>
        [
          group,
          [...groupRows].sort((a, b) =>
            String(a.time_period ?? '').localeCompare(
              String(b.time_period ?? ''),
            ),
          ),
        ] as const,
    )

    const formatPoint = (group: string, row: HetRow) =>
      `- ${group} (${row.time_period}): ${row[metricConfig.metricId]} ${metricConfig.shortLabel}`

    // Keep the group's earliest point as a historical anchor, then as much of
    // the recent tail as the budget allows. Recent years describe where a
    // disparity stands now, which is what an insight is about; the anchor is
    // what makes "up or down since then" answerable at all.
    const takeRecent = (sorted: HetRow[], recentCount: number) => {
      if (sorted.length <= recentCount + 1) return sorted
      return [sorted[0], ...sorted.slice(-recentCount)]
    }

    const encoder = new TextEncoder()
    const byteLength = (text: string) => encoder.encode(text).length

    const render = (recentCount: number) =>
      sortedByGroup
        .flatMap(([group, sorted]) =>
          takeRecent(sorted, recentCount).map((row) => formatPoint(group, row)),
        )
        .join('\n')

    // Send the full per-year (or per-month) series when it's small enough for
    // the model to work with the whole trend, since that's a materially
    // better answer than a truncated one.
    const longest = Math.max(
      ...sortedByGroup.map(([, sorted]) => sorted.length),
    )
    const full = render(longest)
    if (byteLength(full) <= TIME_SERIES_TARGET_BYTES) return full

    // Largest recent window that still fits. Binary search rather than stepping
    // down one point at a time, since a monthly series over decades can be
    // hundreds of points per group.
    let low = 1
    let high = longest
    let best = ''
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const candidate = render(mid)
      if (byteLength(candidate) <= TIME_SERIES_TARGET_BYTES) {
        best = candidate
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
    if (best) return best

    // Enough groups that even one recent point each overflows the budget. Keep
    // whole lines from the start until the budget is spent, so the result is
    // always a well-formed, in-budget list rather than a truncated final line.
    const lines = render(1).split('\n')
    const kept: string[] = []
    let used = 0
    for (const line of lines) {
      const cost = byteLength(line) + (kept.length ? 1 : 0)
      if (used + cost > TIME_SERIES_TARGET_BYTES) break
      kept.push(line)
      used += cost
    }
    return kept.join('\n')
  }

  // For population-vs-distribution, include both the outcome share and
  // the population share side-by-side so the model can compute the disparity
  const popMetric =
    hashId === 'population-vs-distribution'
      ? metricConfig.populationComparisonMetric
      : null

  const filteredRows = rows.filter((row) => {
    // Maps always have a place name; other charts key off the demographic group.
    const hasLabel = isMap
      ? row.fips_name != null
      : row[demographicType] != null
    if (!hasLabel || row[metricConfig.metricId] == null) return false
    if (groupFilter && !groupFilter.has(String(row[demographicType])))
      return false
    return true
  })

  // A map showing 2+ places is a real geographic comparison, so default to
  // the group on screen. A map showing fewer than 2 places (a single county
  // or state, with no children to compare) has nothing geographic to gain
  // from filtering, so fall back to every group within that one place.
  const distinctPlaces = isMap
    ? new Set(filteredRows.map((row) => row.fips_name)).size
    : 0
  const activeRows =
    isMap &&
    activeDemographicGroup &&
    !groupIsAll(activeDemographicGroup) &&
    distinctPlaces >= 2
      ? filteredRows.filter(
          (row) =>
            String(row[demographicType]) === activeDemographicGroup ||
            groupIsAll(String(row[demographicType])),
        )
      : filteredRows

  return activeRows
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
    min: Math.round(sorted[0] * 10) / 10,
    max: Math.round(sorted[sorted.length - 1] * 10) / 10,
    shortLabel: peer.shortLabel,
  }
}

// Maps a rank ratio to a plain-English standing label so the model never sees
// raw fractions like "higher than 23 of 28" and restates them verbatim.
function peerRankLabel(
  higherThanCount: number,
  reportingCount: number,
): string {
  const ratio = higherThanCount / reportingCount
  if (ratio >= 0.9) return 'among the highest'
  if (ratio >= 0.75) return 'higher than most'
  if (ratio >= 0.6) return 'above the typical'
  if (ratio >= 0.4) return 'near the typical'
  if (ratio >= 0.25) return 'below the typical'
  if (ratio >= 0.1) return 'lower than most'
  return 'among the lowest'
}

// Renders a peer rank summary as prompt bullet lines. Leads with the region's
// own rate, then its qualitative standing and the peer distribution.
export function formatPeerComparison(summary: PeerRankSummary): string {
  const rankLabel = peerRankLabel(
    summary.higherThanCount,
    summary.reportingCount,
  )
  return [
    `- ${summary.regionLabel}: ${summary.regionValue} ${summary.shortLabel}`,
    `- Among ${summary.reportingCount} ${summary.peerNoun}: ${rankLabel}`,
    `- Peer median ${summary.median} ${summary.shortLabel}; range ${summary.min}–${summary.max} ${summary.shortLabel}`,
  ].join('\n')
}

// The selected region's own overall ("All") rate, labeled for display.
export interface RegionAllRate {
  label: string
  value: number
  shortLabel: string
}

// Reads the selected region's overall ("All") rate from its region-self query
// response. Returns undefined when the region has no numeric overall value (e.g.
// only a subgroup survived suppression). Pure so the peer-ranking gate can be
// unit-tested independent of MapCard's query wiring.
export function getRegionAllRate(
  regionResponse: MetricQueryResponse | undefined,
  metricConfig: MetricConfig,
  demographicType: DemographicType,
  regionLabel: string,
): RegionAllRate | undefined {
  const allRow = regionResponse
    ?.getValidRowsForField(metricConfig.metricId)
    .find((row) => row[demographicType] === ALL)
  const value = allRow?.[metricConfig.metricId]
  // Number.isFinite (not typeof === 'number') so NaN/Infinity, which would
  // poison the ranking, are treated as missing.
  return Number.isFinite(value)
    ? {
        label: regionLabel,
        value: value as number,
        shortLabel: metricConfig.shortLabel,
      }
    : undefined
}

// Extracts the overall ("All") rates of the peer places from the peer query
// response, excluding the selected region itself and any non-numeric values.
export function getPeerValues(
  peerResponse: MetricQueryResponse | undefined,
  metricConfig: MetricConfig,
  demographicType: DemographicType,
  selfFipsCode: string,
): number[] {
  return (peerResponse?.getValidRowsForField(metricConfig.metricId) ?? [])
    .filter(
      (row) =>
        row[demographicType] === ALL &&
        row.fips !== selfFipsCode &&
        Number.isFinite(row[metricConfig.metricId]),
    )
    .map((row) => row[metricConfig.metricId] as number)
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
  ) => RegionAllRate | undefined
  // Overall ("All") rates of the peer places, with the selected region excluded.
  getPeerValues: (peerResponses: MetricQueryResponse[]) => number[]
}

// Optional context about which groups the user has focused the chart on.
export interface InsightContext {
  // The demographic group currently highlighted on a map (e.g. the active
  // choropleth group). Steers the prompt wording, and on a multi-place map
  // also filters the data to that group (see formatDataRows).
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
// React state, not URL params, so without this the client-side memo key would
// not change and a re-focused chart would show the insight from the prior focus.
// Only that in-session memo key needs this; the server key hashes the prompt,
// which already reflects the focused rows.
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
  activeDemographicGroup?: DemographicGroup,
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
        activeDemographicGroup,
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
  activeDemographicGroup?: DemographicGroup,
): InsightDataStatus {
  const { entryCount } = prepareInsightData(
    hashId,
    dataTypeConfig,
    demographicType,
    queryResponses,
    selectedGroups,
    activeDemographicGroup,
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
    context?.activeDemographicGroup,
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

  const cardSuffix = isCompareCard ? '-2' : ''
  // Focus (highlighted map group / selected trend lines) needs no suffix here:
  // it changes which rows formatDataRows emits, so the prompt hash already
  // separates one focus from another.
  const cacheKey = buildInsightCacheKey(`#${hashId}${cardSuffix}`, prompt)

  const result = await fetchAIInsight(prompt, {
    cacheKey,
    topic: dataTypeConfig.dataTypeId,
  })
  return { ...result, cacheKey }
}
