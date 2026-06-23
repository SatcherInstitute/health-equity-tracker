import type {
  DataTypeConfig,
  MetricConfig,
} from '../data/config/MetricConfigTypes'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import type { MetricQueryResponse } from '../data/query/MetricQuery'
import { ALL, type DemographicGroup } from '../data/utils/Constants'
import type { HetRow } from '../data/utils/DatasetTypes'
import type { Fips } from '../data/utils/Fips'
import { fetchAIInsight, type InsightResult } from './fetchAIInsight'
import type { ScrollableHashId } from './hooks/useStepObserver'
import { REPORT_INSIGHT_PARAM_KEY } from './urlutils'

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

function buildPrompt(
  hashId: ScrollableHashId,
  topic: string,
  location: string,
  demographicLabel: string,
  dataSection: string,
  activeDemographicGroup?: DemographicGroup,
): string {
  const dataBlock = dataSection ? `\n\nData:\n${dataSection}` : ''

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

// Optional context about which groups the user has focused the chart on.
export interface InsightContext {
  // The demographic group currently highlighted on a map (e.g. the active
  // choropleth group). Used only to steer the prompt, not to filter rows.
  activeDemographicGroup?: DemographicGroup
  // The subset of groups the user has selected (e.g. via the trend legend).
  // Filters the rows the model sees so the insight matches what is on screen.
  selectedGroups?: DemographicGroup[]
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

// An insight is only worth showing when there are at least two values to
// compare. With a single group or region (e.g. a county where every other
// race is suppressed, leaving only the "All" row), there is no disparity to
// describe, so the card hides the insight UI entirely rather than restating
// one number.
export function hasEnoughDataForInsight(
  hashId: ScrollableHashId,
  dataTypeConfig: DataTypeConfig,
  demographicType: DemographicType,
  queryResponses?: MetricQueryResponse[],
  selectedGroups?: DemographicGroup[],
): boolean {
  return (
    prepareInsightData(
      hashId,
      dataTypeConfig,
      demographicType,
      queryResponses,
      selectedGroups,
    ).entryCount >= 2
  )
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

  const prompt = buildPrompt(
    hashId,
    topic,
    location,
    demographic,
    dataSection,
    context?.activeDemographicGroup,
  )

  const params = new URLSearchParams(window.location.search)
  params.delete(REPORT_INSIGHT_PARAM_KEY)
  const cardSuffix = isCompareCard ? '-2' : ''
  const cacheKey = `${window.location.pathname}?${params.toString()}#${hashId}${cardSuffix}`

  const result = await fetchAIInsight(prompt, {
    cacheKey,
    topic: dataTypeConfig.dataTypeId,
  })
  return { ...result, cacheKey }
}
