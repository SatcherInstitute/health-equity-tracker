import { buildReportInsightPrompt } from '../../../frontend_server/reportInsightPrompt.js'
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
