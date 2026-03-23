import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType
} from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'

const API_ENDPOINT = '/fetch-ai-insight'
const ERROR_GENERATING_INSIGHT = 'Error generating report insight'

type InsightResult = {
  content: string
  rateLimited: boolean
  error?: boolean
}

export type ReportInsightSections = {
  keyFindings: string
  locationComparison: string
  demographicInsights: string
  whatThisMeans: string
}

type ReportInsightResult = {
  sections: ReportInsightSections | null
  rateLimited: boolean
  error?: string
}

async function fetchAIInsight(prompt: string): Promise<InsightResult> {
  const baseApiUrl = import.meta.env.VITE_BASE_API_URL
  const dataServerUrl = baseApiUrl
    ? `${baseApiUrl}${API_ENDPOINT}`
    : API_ENDPOINT

  try {
    const dataResponse = await fetch(dataServerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })

    if (dataResponse.status === 429) {
      return { content: '', rateLimited: true }
    }

    if (!dataResponse.ok) {
      throw new Error(`Failed to fetch AI insight: ${dataResponse.statusText}`)
    }

    const insight = await dataResponse.json()
    if (!insight.content) {
      throw new Error('No content returned from AI service')
    }

    return { content: insight.content.trim(), rateLimited: false }
  } catch (error) {
    console.error('Error generating report insight:', error)
    return { content: '', rateLimited: false, error: true }
  }
}

function generateReportInsightPrompt(
  topic: string,
  location: string,
  demographicTypeString: string,
): string {
  return `You are a public health analyst reviewing a report about "${topic}" in ${location}, broken down by ${demographicTypeString}.

The page contains multiple charts: a rate map, rates over time, a rate bar chart, an unknowns map, inequities over time, and a population vs distribution chart.

WRITING RULES — follow these strictly:
- Write at an 8th-grade reading level. Use short words and simple sentences.
- Avoid jargon. If you must use a technical term, explain it immediately.
- Each section: 1-2 sentences maximum, 35 words or fewer.
- keyFindings: 1 sentence, 25 words or fewer. Lead with the single most striking fact.

Respond ONLY with a valid JSON object — no markdown, no backticks, no explanation outside the JSON. Use this exact structure:

{
  "keyFindings": "1 sentence (max 25 words): the single most striking disparity, leading with a specific number or rate.",
  "locationComparison": "1-2 sentences (max 35 words): which places have the biggest gaps and why that might be.",
  "demographicInsights": "1-2 sentences (max 35 words): which group is most affected and how large the gap is compared to others.",
  "whatThisMeans": "1-2 sentences (max 35 words): what this means for real people in these communities, in plain everyday language."
}`
}

function parseSections(raw: string): ReportInsightSections | null {
  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    const required: (keyof ReportInsightSections)[] = [
      'keyFindings',
      'locationComparison',
      'demographicInsights',
      'whatThisMeans',
    ]

    for (const key of required) {
      if (typeof parsed[key] !== 'string') return null
    }

    return parsed as ReportInsightSections
  } catch {
    console.error('Failed to parse report insight JSON')
    return null
  }
}

export async function generateReportInsight(
  dataTypeConfig: DataTypeConfig,
  demographicType: DemographicType,
  fips: Fips,
): Promise<ReportInsightResult> {
  try {
    const topic = dataTypeConfig.fullDisplayName
    const location = fips.getSentenceDisplayName()
    const prompt = generateReportInsightPrompt(
      topic,
      location,
      DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType],
    )
    const result = await fetchAIInsight(prompt)

    if (result.rateLimited) {
      return { sections: null, rateLimited: true }
    }

    if (result.error) {
      return { sections: null, rateLimited: false, error: ERROR_GENERATING_INSIGHT }
    }

    const sections = parseSections(result.content)
    return { sections, rateLimited: false }
  } catch (error) {
    console.error(ERROR_GENERATING_INSIGHT, error)
    return {
      sections: null,
      rateLimited: false,
      error: ERROR_GENERATING_INSIGHT,
    }
  }
}
