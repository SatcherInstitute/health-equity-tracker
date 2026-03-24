import domtoimage from 'dom-to-image-more'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import { DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE, type DemographicType } from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'
import { fetchAIInsight, type InsightResult } from './fetchAIInsight'
import type { ScrollableHashId } from './hooks/useStepObserver'

const CHART_TYPE_LABELS: Record<ScrollableHashId, string> = {
  'rate-map': 'choropleth map',
  'rates-over-time': 'line chart over time',
  'rate-chart': 'bar chart',
  'unknown-demographic-map': 'map of unknown demographics',
  'inequities-over-time': 'line chart of inequities over time',
  'population-vs-distribution': 'bar chart comparing population share vs. distribution',
  'data-table': 'data table',
  'age-adjusted-ratios': 'bar chart of age-adjusted ratios',
  'multimap-modal': 'small multiples map',
  'definitions-missing-data': ''
}

async function captureCardAsBase64(
  cardId: ScrollableHashId,
): Promise<string | null> {
  const node = document.getElementById(cardId)
  if (!node) return null
  try {
    const dataUrl = await domtoimage.toPng(node, {
      scale: 1,
      filter: (node: HTMLElement) =>
        !node?.classList?.contains('hide-on-screenshot'),
    })
    return dataUrl.replace('data:image/png;base64,', '')
  } catch {
    return null
  }
}

function buildPrompt(
  chartType: string,
  topic: string,
  location: string,
  demographicType: string,
): string {
  if (chartType === 'choropleth map') {
    return `This is a choropleth map showing ${topic} in ${location} across all ${demographicType} groups. The intended message is to highlight geographic health equity disparities. Write a single sentence at an 8th grade reading level that names the specific states or regions with the highest rates, contrasts them with those with the lowest, and captures why this geographic gap matters — focus on the "so what", not the chart mechanics.`
  }
  return `This is a ${chartType} showing ${topic} in ${location} by ${demographicType}. The intended message is to highlight health equity disparities. Write a single sentence at an 8th grade reading level that captures the key inequity a viewer should walk away with — focus on the "so what", not the chart mechanics.`
}

export async function generateCardInsight(
  hashId: ScrollableHashId,
  dataTypeConfig: DataTypeConfig,
  demographicType: DemographicType,
  fips?: Fips,
): Promise<InsightResult> {
  const chartType = CHART_TYPE_LABELS[hashId]
  const topic = dataTypeConfig.fullDisplayName
  const location = fips?.getSentenceDisplayName() ?? 'the United States'
  const demographic = DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]
  const prompt = buildPrompt(chartType, topic, location, demographic)
  const imageBase64 = await captureCardAsBase64(hashId)
  return fetchAIInsight(prompt, imageBase64 ?? undefined)
}
