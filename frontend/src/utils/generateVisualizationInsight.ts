import type {
  DataTypeConfig,
  MetricConfig,
} from '../data/config/MetricConfigTypes'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import type { MetricQueryResponse } from '../data/query/MetricQuery'
import { ALL } from '../data/utils/Constants'
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
  isSingleRegionMap = false,
): string {
  // A county-level map shows just one area, so there is no geography to
  // contrast. Label rows by demographic group instead, and drop the aggregate
  // "All" row so the model compares real subgroups within that one place.
  if (isSingleRegionMap) {
    return rows
      .filter(
        (row) =>
          row[demographicType] != null &&
          row[demographicType] !== ALL &&
          row[metricConfig.metricId] != null,
      )
      .map(
        (row) =>
          `- ${row[demographicType]}: ${row[metricConfig.metricId]} ${metricConfig.shortLabel}`,
      )
      .join('\n')
  }

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
  isSingleRegionMap = false,
): string {
  const dataBlock = dataSection ? `\n\nData:\n${dataSection}` : ''

  if (MAP_CHART_IDS.includes(hashId)) {
    if (isSingleRegionMap) {
      return `This is a choropleth map showing ${topic} in ${location}. The map covers a single area, so instead of a geographic comparison the data below breaks that rate down by ${demographicLabel} group.${dataBlock}\n\nWrite a single sentence at an 8th grade reading level that names which ${demographicLabel} groups carry the highest and lowest rates and captures why this gap matters for the people who live there — focus on the "so what", not the chart mechanics.`
    }
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

interface InsightData {
  dataSection: string
  isSingleRegionMap: boolean
  // Number of comparison entries (groups or regions) the model would receive.
  entryCount: number
}

// Shapes the chart's query response into the exact text the model is given.
// Kept separate from generation so the UI can gate on entryCount up front,
// guaranteeing the visibility check and the generated text never disagree.
export function prepareInsightData(
  hashId: ScrollableHashId,
  dataTypeConfig: DataTypeConfig,
  demographicType: DemographicType,
  queryResponses?: MetricQueryResponse[],
): InsightData {
  let dataSection = ''
  let isSingleRegionMap = false
  if (queryResponses?.[0]) {
    const metricConfig = getPrimaryMetricConfig(hashId, dataTypeConfig.metrics)
    if (metricConfig) {
      const rows = queryResponses[0].getValidRowsForField(metricConfig.metricId)
      // A county-level map has only one geographic unit, so every row shares the
      // same place name and there is no geographic comparison to draw. Drop empty
      // names before counting so a stray undefined fips_name can't inflate the set
      // and misclassify a single-place map as a multi-region comparison.
      isSingleRegionMap =
        MAP_CHART_IDS.includes(hashId) &&
        new Set(rows.map((row) => row.fips_name).filter(Boolean)).size <= 1
      dataSection = formatDataRows(
        rows,
        hashId,
        demographicType,
        metricConfig,
        isSingleRegionMap,
      )
    }
  }
  const entryCount = dataSection
    ? dataSection.split('\n').filter(Boolean).length
    : 0
  return { dataSection, isSingleRegionMap, entryCount }
}

// An insight is only worth showing when there are at least two values to
// compare. With a single group or region (e.g. a county where every other
// race is suppressed), there is no disparity to describe, so the card hides
// the insight UI entirely rather than restating one number.
export function hasEnoughDataForInsight(
  hashId: ScrollableHashId,
  dataTypeConfig: DataTypeConfig,
  demographicType: DemographicType,
  queryResponses?: MetricQueryResponse[],
): boolean {
  return (
    prepareInsightData(hashId, dataTypeConfig, demographicType, queryResponses)
      .entryCount >= 2
  )
}

export async function generateCardInsight(
  hashId: ScrollableHashId,
  dataTypeConfig: DataTypeConfig,
  demographicType: DemographicType,
  fips?: Fips,
  queryResponses?: MetricQueryResponse[],
  isCompareCard?: boolean,
): Promise<InsightResult> {
  const topic = dataTypeConfig.fullDisplayName
  const location = fips?.getSentenceDisplayName() ?? 'the United States'
  const demographic = DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]

  const { dataSection, isSingleRegionMap } = prepareInsightData(
    hashId,
    dataTypeConfig,
    demographicType,
    queryResponses,
  )

  const prompt = buildPrompt(
    hashId,
    topic,
    location,
    demographic,
    dataSection,
    isSingleRegionMap,
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
