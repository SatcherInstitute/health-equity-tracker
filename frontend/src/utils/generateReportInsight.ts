import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType
} from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'
import { ERROR_GENERATING_INSIGHT, fetchAIInsight } from './fetchAIInsight'

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

function buildReportInsightPrompt(
  topic: string,
  location: string,
  demographicLabel: string,
): string {
  return `You are a public health analyst reviewing a report about "${topic}" in ${location}, broken down by ${demographicLabel}.

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
    const prompt = buildReportInsightPrompt(
      topic,
      location,
      DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType],
    )
    const cacheKey = `report-${dataTypeConfig.dataTypeId}-${fips.code}-${demographicType}`
    const result = await fetchAIInsight(prompt, undefined, { cacheKey })

    if (result.rateLimited) {
      return { sections: null, rateLimited: true }
    }

    if (result.error) {
      return {
        sections: null,
        rateLimited: false,
        error: ERROR_GENERATING_INSIGHT,
      }
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
