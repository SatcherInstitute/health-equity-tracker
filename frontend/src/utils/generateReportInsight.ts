import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import { DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE, type DemographicType } from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'
import { SHOW_INSIGHT_GENERATION } from '../featureFlags'

const API_ENDPOINT = '/fetch-ai-insight'
const ERROR_GENERATING_INSIGHT = 'Error generating report insight'

export type InsightResult = {
    content: string
    rateLimited: boolean
  }

export type ReportInsightSections = {
  keyFindings: string
  locationComparison: string
  demographicInsights: string
  whatThisMeans: string
}

export type ReportInsightResult = {
  sections: ReportInsightSections | null
  rateLimited: boolean
  error?: string
}

const EMPTY_RESULT: ReportInsightResult = {
  sections: null,
  rateLimited: false,
}

async function fetchAIInsight(prompt: string): Promise<InsightResult> {
  const baseApiUrl = import.meta.env.VITE_BASE_API_URL
  const dataServerUrl = baseApiUrl
    ? `${baseApiUrl}${API_ENDPOINT}`
    : API_ENDPOINT

  if (!SHOW_INSIGHT_GENERATION) {
    return { content: '', rateLimited: false }
  }

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
    return { content: ERROR_GENERATING_INSIGHT, rateLimited: false }
  }
}

function generateReportInsightPrompt(
  topic: string,
  location: string,
  demographicTypeString: string,
): string {
  return `You are a public health analyst reviewing a full report page about "${topic}" in ${location}, broken down by ${demographicTypeString}.

The page contains multiple charts: a rate map, rates over time, a rate bar chart, an unknowns map, inequities over time, and a population vs distribution chart.

Respond ONLY with a valid JSON object — no markdown, no backticks, no explanation outside the JSON. Use this exact structure:

{
  "keyFindings": "2-3 sentences identifying the most significant disparity across all charts, leading with the most striking number or pattern.",
  "locationComparison": "2-3 sentences describing how disparities vary geographically — which states or regions show the most extreme gaps and what that suggests about structural vs localized factors.",
  "demographicInsights": "2-3 sentences naming the most disproportionately affected group, quantifying the gap between highest and lowest rates, and describing the population share vs case share imbalance.",
  "whatThisMeans": "2-3 sentences translating the data into real-world human impact — what does this mean for people living in these communities, in plain language."
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
  if (!SHOW_INSIGHT_GENERATION) {
    return EMPTY_RESULT
  }

  try {
    const topic = dataTypeConfig.fullDisplayName
    const location = fips.getSentenceDisplayName()
    const demographicTypeString =
      DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType] ?? 'demographic'

    const prompt = generateReportInsightPrompt(topic, location, demographicTypeString)
    const result = await fetchAIInsight(prompt)

    if (result.rateLimited) {
      return { sections: null, rateLimited: true }
    }

    if (result.content === ERROR_GENERATING_INSIGHT) {
      return { sections: null, rateLimited: false, error: ERROR_GENERATING_INSIGHT }
    }

    const sections = parseSections(result.content)
    return { sections, rateLimited: false }
  } catch (error) {
    console.error(ERROR_GENERATING_INSIGHT, error)
    return { sections: null, rateLimited: false, error: ERROR_GENERATING_INSIGHT }
  }
}