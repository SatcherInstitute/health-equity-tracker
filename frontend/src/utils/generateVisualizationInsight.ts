import type {
  DataTypeConfig,
  MetricConfig,
} from '../data/config/MetricConfigTypes'
import { metricConfigFromDtConfig } from '../data/config/MetricConfigUtils'
import type { DemographicType } from '../data/query/Breakdowns'
import type {
  MetricQuery,
  MetricQueryResponse,
} from '../data/query/MetricQuery'
import { ALL, type DemographicGroup } from '../data/utils/Constants'
import type { HetRow } from '../data/utils/DatasetTypes'
import { groupIsAll } from '../data/utils/datasetutils'
import type { Fips } from '../data/utils/Fips'
import type { ScrollableHashId } from './hooks/useStepObserver'
import {
  fetchInsight,
  type InsightResult,
  toInsightMetric,
} from './insightDescriptor'

const MAP_CHART_IDS: ScrollableHashId[] = [
  'rate-map',
  'unknown-demographic-map',
  'multimap-modal',
]

const TIME_SERIES_CHART_IDS: ScrollableHashId[] = [
  'rates-over-time',
  'inequities-over-time',
] // Charts that display temporal trends

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

// The share columns the data table renders alongside its rate. Resolved the same
// way TableCard resolves them, since the insight describes the table the reader
// is looking at rather than the topic config in the abstract. Notably that means
// metricConfigFromDtConfig('share'), which also picks up the pct_share_unknown
// column the Medicare adherence topics use in place of a true pct_share.
export function resolveTableShareMetrics(dataTypeConfig: DataTypeConfig): {
  shareConfig?: MetricConfig
  populationConfig?: MetricConfig
  generalPopulationLabel?: string
} {
  const rateConfig = metricConfigFromDtConfig('rate', dataTypeConfig)
  const shareConfig = metricConfigFromDtConfig('share', dataTypeConfig)
  const populationConfig =
    shareConfig?.populationComparisonMetric ??
    rateConfig?.populationComparisonMetric
  return {
    shareConfig,
    populationConfig,
    // Keyed off the flag, not off which config the population column came from,
    // so the caveat can never fire on a topic whose population column already
    // matches its rate's denominator.
    generalPopulationLabel: rateConfig?.isGeneralPopulationComparison
      ? populationConfig?.generalPopulationLabel
      : undefined,
  }
}

// Which rows an insight covers. Grouped into one object so a caller that needs
// only one filter isn't forced to pass placeholders for the rest.
export interface InsightDataOptions {
  // When the user has focused a chart (e.g. the trend legend) on a subset of
  // groups, restrict the rows to those groups so the insight describes only
  // what is on screen. Empty/undefined means "all groups".
  selectedGroups?: DemographicGroup[]
  // The demographic group currently highlighted on a map. When the map is
  // showing multiple places (a real geographic comparison), only this group's
  // rows across places count, since that is what is on screen. When only one
  // place is in view there is no geographic comparison to make, so every group
  // for that one place counts instead.
  activeDemographicGroup?: DemographicGroup
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

// How many comparison entries (groups, places, or time points) the server will
// have to work with. Mirrors the row filtering in the server's formatDataRows so
// the visibility gate and the generated text can never disagree about whether
// there is anything to compare. Budget trimming is deliberately not mirrored:
// the gate only asks whether there are at least two.
export function countInsightRows(
  rows: HetRow[],
  hashId: ScrollableHashId,
  demographicType: DemographicType,
  metricConfig: MetricConfig,
  options: InsightDataOptions = {},
): number {
  const { selectedGroups, activeDemographicGroup } = options
  const groupFilter =
    selectedGroups && selectedGroups.length > 0
      ? new Set<string>(selectedGroups.map(String))
      : null
  const isMap = MAP_CHART_IDS.includes(hashId)

  if (TIME_SERIES_CHART_IDS.includes(hashId)) {
    return rows.filter(
      (row) =>
        row[metricConfig.metricId] != null &&
        (!groupFilter ||
          groupFilter.has(String(row[demographicType] ?? 'Unknown'))),
    ).length
  }

  const filteredRows = rows.filter((row) => {
    // Maps always have a place name; other charts key off the demographic group.
    const hasLabel = isMap
      ? row.fips_name != null
      : row[demographicType] != null
    if (!hasLabel || row[metricConfig.metricId] == null) return false
    return !groupFilter || groupFilter.has(String(row[demographicType]))
  })

  const distinctPlaces = isMap
    ? new Set(filteredRows.map((row) => row.fips_name)).size
    : 0
  if (
    isMap &&
    activeDemographicGroup &&
    !groupIsAll(activeDemographicGroup) &&
    distinctPlaces >= 2
  ) {
    return filteredRows.filter(
      (row) =>
        String(row[demographicType]) === activeDemographicGroup ||
        groupIsAll(String(row[demographicType])),
    ).length
  }
  return filteredRows.length
}

// The rows a chart's query response contributes to an insight, and the metric
// they are read through. Both the gate and the descriptor start here, so the
// two can never be built from different rows.
function insightRows(
  hashId: ScrollableHashId,
  dataTypeConfig: DataTypeConfig,
  queryResponses?: MetricQueryResponse[],
): { metricConfig: MetricConfig; rows: HetRow[] } | null {
  const metricConfig = getPrimaryMetricConfig(hashId, dataTypeConfig.metrics)
  if (!metricConfig) return null
  return {
    metricConfig,
    rows: queryResponses?.[0]
      ? queryResponses[0].getValidRowsForField(metricConfig.metricId)
      : [],
  }
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
  options: InsightDataOptions & {
    // Whether the selected region has its own overall "All" rate (from the
    // region-self query). Gates the peer fallback so a lone subgroup row, with
    // no overall rate, stays hidden rather than being ranked as the region's
    // overall.
    regionHasAllRate?: boolean
  } = {},
): InsightDataStatus {
  const resolved = insightRows(hashId, dataTypeConfig, queryResponses)
  const entryCount = resolved
    ? countInsightRows(
        resolved.rows,
        hashId,
        demographicType,
        resolved.metricConfig,
        options,
      )
    : 0
  if (entryCount >= 2) return 'multi'
  if (MAP_CHART_IDS.includes(hashId) && options.regionHasAllRate)
    return 'single-region'
  return 'empty'
}

// Describes the card to the server, which renders the prompt, derives the cache
// key, and generates. Focus (highlighted map group, selected trend lines) needs
// no separate scope: it changes which rows the descriptor carries, so the prompt
// hash already separates one focus from another.
export async function generateCardInsight(
  hashId: ScrollableHashId,
  dataTypeConfig: DataTypeConfig,
  demographicType: DemographicType,
  fips?: Fips,
  queryResponses?: MetricQueryResponse[],
  isCompareCard?: boolean,
  context?: InsightContext,
): Promise<InsightResult> {
  const resolved = insightRows(hashId, dataTypeConfig, queryResponses)
  if (!resolved) {
    return { content: '', rateLimited: false, error: true }
  }
  // The table's share columns are already in this response: TableCard requests
  // them, and getMetricIdToConfigMap pulls in each config's
  // populationComparisonMetric. Nothing extra is fetched here.
  const shareColumns =
    hashId === 'data-table'
      ? resolveTableShareMetrics(dataTypeConfig)
      : undefined

  return fetchInsight({
    kind: 'card',
    hashId,
    demographicType,
    topic: dataTypeConfig.fullDisplayName,
    location: fips?.getSentenceDisplayName() ?? 'the United States',
    metricConfig: toInsightMetric(resolved.metricConfig),
    rows: resolved.rows,
    context,
    isCompareCard,
    shareConfig: toInsightMetric(shareColumns?.shareConfig),
    populationConfig: toInsightMetric(shareColumns?.populationConfig),
    generalPopulationLabel: shareColumns?.generalPopulationLabel,
  })
}
