import type {
  DataTypeConfig,
  MetricConfig,
} from '../data/config/MetricConfigTypes'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import type { MetricQueryResponse } from '../data/query/MetricQuery'
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
function getPrimaryMetricConfig(
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
function formatDataRows(
  rows: HetRow[],
  hashId: ScrollableHashId,
  demographicType: DemographicType,
  metricConfig: MetricConfig,
): string {
  const isMap = MAP_CHART_IDS.includes(hashId)
  const isTimeSeries = TIME_SERIES_CHART_IDS.includes(hashId)
  const groupKey = isMap ? 'fips_name' : demographicType

  if (isTimeSeries) {
    // Group by demographic subgroup, then show the first and most recent year per group
    // so the model can describe the full trend arc (e.g. "fell from X in 2008 to Y in 2021")
    const byGroup: Record<string, HetRow[]> = {}
    for (const row of rows) {
      const group = String(row[demographicType] ?? 'Unknown')
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
    .filter(
      (row) => row[groupKey] != null && row[metricConfig.metricId] != null,
    )
    .map((row) => {
      const val = `${row[metricConfig.metricId]} ${metricConfig.shortLabel}`
      if (popMetric && row[popMetric.metricId] != null) {
        return `- ${row[groupKey]}: outcome share ${val}, population share ${row[popMetric.metricId]} ${popMetric.shortLabel}`
      }
      return `- ${row[groupKey]}: ${val}`
    })
    .join('\n')
}

function buildPrompt(
  hashId: ScrollableHashId,
  topic: string,
  location: string,
  demographicLabel: string,
  dataSection: string,
): string {
  const dataBlock = dataSection ? `\n\nData:\n${dataSection}` : ''

  if (MAP_CHART_IDS.includes(hashId)) {
    return `This is a choropleth map showing ${topic} in ${location} across all ${demographicLabel} groups. The intended message is to highlight geographic health equity disparities.${dataBlock}\n\nWrite a single sentence at an 8th grade reading level that names the specific states or regions with the highest rates, contrasts them with those with the lowest, and captures why this geographic gap matters — focus on the "so what", not the chart mechanics.`
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

export async function generateCardInsight(
  hashId: ScrollableHashId,
  dataTypeConfig: DataTypeConfig,
  demographicType: DemographicType,
  fips?: Fips,
  queryResponses?: MetricQueryResponse[],
): Promise<InsightResult> {
  const topic = dataTypeConfig.fullDisplayName
  const location = fips?.getSentenceDisplayName() ?? 'the United States'
  const demographic = DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]

  // Build the data section from query responses when available
  let dataSection = ''
  if (queryResponses?.[0]) {
    const metricConfig = getPrimaryMetricConfig(hashId, dataTypeConfig.metrics)
    if (metricConfig) {
      const rows = queryResponses[0].getValidRowsForField(metricConfig.metricId)
      dataSection = formatDataRows(rows, hashId, demographicType, metricConfig)
    }
  }

  const prompt = buildPrompt(hashId, topic, location, demographic, dataSection)

  const params = new URLSearchParams(window.location.search)
  params.delete(REPORT_INSIGHT_PARAM_KEY)
  const cacheKey = `${window.location.pathname}?${params.toString()}#${hashId}`

  return fetchAIInsight(prompt, { cacheKey })
}
