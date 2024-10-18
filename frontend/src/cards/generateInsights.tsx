import axios from 'axios'
import type { MetricId } from '../data/config/MetricConfigTypes'
import type { ChartData } from '../reports/Report'
import {
  extractRelevantData,
  getHighestDisparity,
} from './generateInsightsUtils'

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

const API_KEY_URL =
  'https://us-central1-het-infra-test-05.cloudfunctions.net/function-1'
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const ERROR_GENERATING_INSIGHT = 'Error generating insight'

async function fetchApiKey(): Promise<string> {
  try {
    const response = await fetch(API_KEY_URL)
    if (!response.ok)
      throw new Error(`Network response was not ok: ${response.statusText}`)
    const { apiKey } = await response.json()
    return apiKey
  } catch (error) {
    console.error('Failed to fetch API key:', error)
    throw error
  }
}

export async function fetchAIInsight(prompt: string): Promise<string> {
  const apiKey = await fetchApiKey()

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: '' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    )

    const content = response.data.choices?.[0]?.message?.content
    if (!content) throw new Error('No valid response from OpenAI API')
    return content.trim().replace(/^"|"$/g, '')
  } catch (error) {
    console.error('Error generating insight:', error)
    throw error
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

    Generate a single, concise sentence that highlights the disparity. The sentence should convey the following key points:
    1. The subgroup's representation in the population
    2. Their share of the health outcome
    3. How much more likely they are to be affected compared to their population share

    Guidelines:
    - Use natural language and vary the sentence structure. Don't stick to a rigid template.
    - Round percentages to the nearest whole number and use approximation terms like "about" or "approximately".
    - Round the ratio to one decimal place for clarity.
    - Adapt the measure to fit grammatically in the sentence (e.g., "uninsured cases", "asthma diagnoses", etc.)
    - Ensure the sentence is grammatically correct and flows naturally.
    - Limit your response to this one sentence only.

    Example :
    "While Hispanic individuals make up roughly 18% of the US population, they account for about 29% of uninsured cases, indicating they're approximately 1.6 times more likely to lack health insurance."
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
  const { knownData, metricIds } = chartMetrics
  try {
    const processedData = mapRelevantData(knownData, metricIds)
    const highestDisparity = getHighestDisparity(processedData)
    const insightPrompt = generateInsightPrompt(highestDisparity)
    return await fetchAIInsight(insightPrompt)
  } catch (error) {
    console.error(ERROR_GENERATING_INSIGHT, error)
    return ERROR_GENERATING_INSIGHT
  }
}
