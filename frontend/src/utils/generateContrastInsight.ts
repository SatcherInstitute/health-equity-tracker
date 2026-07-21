import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import type { MetricQueryResponse } from '../data/query/MetricQuery'
import type { Fips } from '../data/utils/Fips'
import { fetchAIInsight, type InsightResult } from './fetchAIInsight'
import {
  formatDataRows,
  getPrimaryMetricConfig,
} from './generateVisualizationInsight'
import type { ScrollableHashId } from './hooks/useStepObserver'
import { REPORT_INSIGHT_PARAM_KEY } from './urlutils'

function buildContrastPrompt(
  topic1: string,
  topic2: string,
  location1: string,
  location2: string,
  demographic: string,
  data1: string,
  data2: string,
): string {
  const isSameTopic = topic1 === topic2
  const isSameLocation = location1 === location2

  let setup: string
  let viewALabel: string
  let viewBLabel: string
  let guidance: string

  if (isSameTopic) {
    // compare-geo: same topic, different places
    setup = `Two side-by-side charts show the same health metric — ${topic1} — across ${demographic} groups, in two different places.`
    viewALabel = `View A (${location1})`
    viewBLabel = `View B (${location2})`
    guidance = `Focus on what comparing these two places reveals that either view alone does not — for example, whether disparities within one place exceed disparities between places, or whether the same patterns recur at different geographic scales.`
  } else if (isSameLocation) {
    // compare-vars: same place, different topics
    setup = `Two side-by-side charts show ${location1}, one for ${topic1} and one for ${topic2}, across ${demographic} groups.`
    viewALabel = `View A (${topic1})`
    viewBLabel = `View B (${topic2})`
    guidance = `Focus on whether the same groups bear the heaviest burden across both topics, or where the patterns diverge — and what that suggests about the underlying drivers of inequity.`
  } else {
    setup = `Two side-by-side charts compare ${topic1} in ${location1} with ${topic2} in ${location2}, across ${demographic} groups.`
    viewALabel = `View A (${topic1} in ${location1})`
    viewBLabel = `View B (${topic2} in ${location2})`
    guidance = `Focus on what the contrast reveals about how place and topic interact in driving health inequities.`
  }

  const dataBlock1 = data1 ? `\n\n${viewALabel} data:\n${data1}` : ''
  const dataBlock2 = data2 ? `\n\n${viewBLabel} data:\n${data2}` : ''

  return `${setup}${dataBlock1}${dataBlock2}

Write one sentence at an 8th grade reading level that contrasts these two views. ${guidance} Be specific — name the places, groups, or numbers from the data above. Use only facts present in the data; do not introduce additional statistics, causal explanations, or place-specific facts that are not shown.`
}

export async function generateContrastInsight(
  hashId: ScrollableHashId,
  dataTypeConfig1: DataTypeConfig,
  dataTypeConfig2: DataTypeConfig,
  fips1: Fips,
  fips2: Fips,
  demographicType: DemographicType,
  queryResponses1: MetricQueryResponse[],
  queryResponses2: MetricQueryResponse[],
): Promise<InsightResult> {
  const topic1 = dataTypeConfig1.fullDisplayName
  const topic2 = dataTypeConfig2.fullDisplayName
  const location1 = fips1.getSentenceDisplayName()
  const location2 = fips2.getSentenceDisplayName()
  const demographic = DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]

  const buildDataSection = (
    config: DataTypeConfig,
    responses: MetricQueryResponse[],
  ): string => {
    if (!responses[0]) return ''
    const metricConfig = getPrimaryMetricConfig(hashId, config.metrics)
    if (!metricConfig) return ''
    const rows = responses[0].getValidRowsForField(metricConfig.metricId)
    return formatDataRows(rows, hashId, demographicType, metricConfig)
  }

  const data1 = buildDataSection(dataTypeConfig1, queryResponses1)
  const data2 = buildDataSection(dataTypeConfig2, queryResponses2)

  const prompt = buildContrastPrompt(
    topic1,
    topic2,
    location1,
    location2,
    demographic,
    data1,
    data2,
  )

  const params = new URLSearchParams(window.location.search)
  params.delete(REPORT_INSIGHT_PARAM_KEY)
  const cacheKey = `${window.location.pathname}?${params.toString()}#${hashId}-contrast`

  const result = await fetchAIInsight(prompt, {
    cacheKey,
    topic: dataTypeConfig1.dataTypeId,
  })
  return { ...result, cacheKey }
}
