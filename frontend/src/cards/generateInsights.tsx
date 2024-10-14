import axios from 'axios'
import type { MetricId } from '../data/config/MetricConfigTypes'
import type { ChartData } from '../reports/Report'

type Dataset = Record<string, any>

interface ResultData {
  fips: string
  fips_name: string
  race_and_ethnicity?: string
  age?: string | number
  sex?: string
  [key: string]: any
}

function extractRelevantData(
  dataset: Dataset,
  metricIds: MetricId[],
): ResultData {
  const result: ResultData = {
    fips: dataset.fips,
    fips_name: dataset.fips_name,
  }

  if ('race_and_ethnicity' in dataset) {
    result.race_and_ethnicity = dataset.race_and_ethnicity
  } else if ('age' in dataset) {
    result.age = dataset.age
  } else if ('sex' in dataset) {
    result.sex = dataset.sex
  }

  metricIds.forEach((metricId) => {
    result[metricId] = dataset[metricId]
  })

  return result
}

export function mapRelevantData(
  dataArray: Dataset[],
  metricIds: MetricId[],
): ResultData[] {
  return dataArray.map((dataset) => extractRelevantData(dataset, metricIds))
}

export async function fetchInsight(data: ResultData[]): Promise<string> {
  const apiKey = import.meta.env.OPENAI_API_KEY
  const prompt = `
    Analyze this data: ${JSON.stringify(data)}
    1. Identify the most significant disparity between a subgroup's representation in the population and their share of the health outcome.
    2. Express this disparity as a ratio (e.g., "2x more likely").
    3. Round all numbers up to the nearest whole number (e.g., "4 times" for 3.3, "13%" for 12.4%). Use phrases like "approximately" or "about" to indicate this rounding.
    4. Provide a single, concise sentence in this format:
       "[Subgroup] in [Location] make up about [X%] of the population, but account for approximately [Y%] of [health outcome cases], making them about [Z times] more likely to be affected."
    Limit your response to this one sentence only.
    `

  if (!apiKey) {
    throw new Error('OpenAI API key is not set')
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
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

    if (response.data.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content.trim()
    } else {
      throw new Error('No valid response from OpenAI API')
    }
  } catch (error) {
    console.error('Error generating insight:', error)
    throw error
  }
}

export async function generateInsight(chartData: ChartData): Promise<string> {
  try {
    const processedData = mapRelevantData(
      chartData.knownData,
      chartData.metricIds,
    )
    const fetchedInsight = await fetchInsight(processedData)
    return fetchedInsight.replace(/^"|"$/g, '')
  } catch (error) {
    console.error('Error generating insight:', error)
    return 'Error generating insight'
  }
}
