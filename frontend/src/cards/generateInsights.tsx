import type { MetricId } from '../data/config/MetricConfigTypes'
import { SHOW_INSIGHT_GENERATION } from '../featureFlags'
import type { ChartData } from '../reports/Report'
import {
  extractRelevantData,
  getHighestDisparity,
} from './generateInsightsUtils'

// Constants
const API_ENDPOINT = '/fetch-ai-insight'
const ERROR_GENERATING_INSIGHT = 'Error generating insight'

export type Dataset = Record<string, any>

export interface Disparity {
  disparity: number
  location: string
  measure: string
  outcomeShare: number
  populationShare: number
  ratio: number
  subgroup: string
}

export interface ResultData {
  fips_name: string
  race_and_ethnicity?: string
  age?: string | number
  sex?: string
  [key: string]: any
}

export async function fetchAIInsight(prompt: string): Promise<string> {
  if (!SHOW_INSIGHT_GENERATION) {
    return ''
  }

  try {
    const baseApiUrl = import.meta.env.VITE_BASE_API_URL
    const dataServerUrl = `${baseApiUrl}${API_ENDPOINT}`

    const dataResponse = await fetch(dataServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    })

    if (!dataResponse.ok) {
      throw new Error(`Failed to fetch AI insight: ${dataResponse.statusText}`)
    }

    const insight = await dataResponse.json()

    if (!insight || typeof insight.content !== 'string') {
      throw new Error('Invalid response structure from the server')
    }

    return insight.content.trim()
  } catch (error) {
    console.error('Error generating insight:', error)
    return ERROR_GENERATING_INSIGHT
  }
}

function generateInsightPrompt(disparities: Disparity): string {
  const { subgroup, location, measure, populationShare, outcomeShare, ratio } =
    disparities

  return `
    Given the following disparity data:
    Subgroup: ${subgroup}
    Location: ${location}
    Measure: ${measure}
    Population share: ${populationShare}%
    Health outcome share: ${outcomeShare}%
    Ratio: ${ratio}

    Example:
    "In the US, [Subgroup] individuals make up [Population Share]% of the population but account for [Outcome Share]% of [Measure], making them [Ratio] times more likely to [Impact]."

    Guidelines:
    - Uses contrasting words like "but" or "while" to emphasize differences.
    - Avoids assumptions and reflects the data as presented.
    - Uses clear and simple language to make the disparity easily understood.
    - Adapt the measure to fit grammatically (e.g., "uninsured cases", "HIV deaths, Black women").
    - Is suitable for use in reports or presentations.
    - If measure PrEP, population share is the PrEP eligible population and the measure if PrEP prescriptions.
  `
}

function mapRelevantData(
  dataArray: Dataset[],
  metricIds: MetricId[],
): ResultData[] {
  return dataArray.map((dataset) => extractRelevantData(dataset, metricIds))
}

export async function generateInsight(
  chartMetrics: ChartData,
): Promise<string> {
  if (!SHOW_INSIGHT_GENERATION) {
    return ''
  }

  try {
    const { knownData, metricIds } = chartMetrics
    const processedData = mapRelevantData(knownData, metricIds)
    const highestDisparity = getHighestDisparity(processedData)
    const insightPrompt = generateInsightPrompt(highestDisparity)
    return await fetchAIInsight(insightPrompt)
  } catch (error) {
    console.error(ERROR_GENERATING_INSIGHT, error)
    return ERROR_GENERATING_INSIGHT
  }
}
