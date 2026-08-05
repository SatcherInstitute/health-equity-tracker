import type {
  DataTypeConfig,
  MetricConfig,
} from '../data/config/MetricConfigTypes'
import { exclude } from '../data/query/BreakdownFilter'
import { Breakdowns, type DemographicType } from '../data/query/Breakdowns'
import {
  MetricQuery,
  type MetricQueryResponse,
} from '../data/query/MetricQuery'
import {
  ALL,
  MULTI_OR_OTHER_STANDARD_NH,
  NON_HISPANIC,
  RACE,
  UNKNOWN,
  UNKNOWN_ETHNICITY,
  UNKNOWN_RACE,
  WHITE_NH,
} from '../data/utils/Constants'
import { groupIsAll } from '../data/utils/datasetutils'
import type { Fips } from '../data/utils/Fips'
import {
  getPeerValues,
  getPrimaryMetricConfig,
  getRegionAllRate,
  type PeerComparison,
  resolveTableShareMetrics,
} from './generateVisualizationInsight'
import { getDataManager } from './globals'
import {
  fetchInsight,
  type InsightMetric,
  type ReportSectionDescriptor,
  toInsightMetric,
} from './insightDescriptor'

const ERROR_GENERATING_INSIGHT = 'Error generating insight'

// The report-wide insight is a synthesis, not a walkthrough of the cards below
// it. Trend and data-completeness findings fold into these four sections rather
// than each getting a section of their own, which would turn the card into a
// table of contents for the report.
export type ReportInsightSections = {
  keyFindings: string
  locationComparison: string
  demographicInsights: string
  whatThisMeans: string
}

// Must match the JSON schema the report prompt asks the model to return, in
// buildReportInsightPrompt (server/insight_prompt_report.go). A renamed section
// there makes parseSections return null here and the card renders nothing, so
// the fixture diff that a template edit produces is the cue to update this too.
const SECTION_KEYS = [
  'keyFindings',
  'locationComparison',
  'demographicInsights',
  'whatThisMeans',
] as const satisfies readonly (keyof ReportInsightSections)[]

type ReportInsightResult = {
  sections: ReportInsightSections | null
  rateLimited: boolean
  unavailable?: boolean
  error?: string
  // The exact server cache key used — needed to flag this specific insight.
  cacheKey?: string
}

export function parseSections(raw: string): ReportInsightSections | null {
  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    for (const key of SECTION_KEYS) {
      if (typeof parsed[key] !== 'string') return null
    }

    return Object.fromEntries(
      SECTION_KEYS.map((key) => [key, parsed[key]]),
    ) as ReportInsightSections
  } catch (error) {
    console.error('Failed to parse report insight JSON:', error)
    return null
  }
}

// A county has no child places, so Breakdowns.forChildrenFips would return the
// county itself. Rank it against its same-level peers instead, the same
// apples-to-apples comparison the map card's single-region insight makes.
function countyPeerComparison(
  placeResponse: MetricQueryResponse,
  peerResponse: MetricQueryResponse,
  metricConfig: MetricConfig,
  demographicType: DemographicType,
  fips: Fips,
  parentFips: Fips,
): PeerComparison | undefined {
  const regionRate = getRegionAllRate(
    placeResponse,
    metricConfig,
    demographicType,
    fips.getDisplayName(),
  )
  if (!regionRate) return undefined

  return {
    regionLabel: regionRate.label,
    regionValue: regionRate.value,
    peerNoun: `${parentFips.getDisplayName()} ${parentFips.getPluralChildFipsTypeDisplayName()}`,
    peerValues: getPeerValues(
      peerResponse,
      metricConfig,
      demographicType,
      fips.code,
    ),
    shortLabel: metricConfig.shortLabel,
  }
}

interface ReportSections {
  demographic: ReportSectionDescriptor
  geographic: ReportSectionDescriptor
  temporal: ReportSectionDescriptor
  ageAdjusted: ReportSectionDescriptor
  unknown: ReportSectionDescriptor
}

// The rates the report's own cards already display, re-read through DataManager
// so the insight describes the same numbers the user sees. Every underlying
// dataset here is one a card on the page has already loaded, so these resolve
// against the dataset cache rather than the network.
async function loadReportData(
  dataTypeConfig: DataTypeConfig,
  demographicType: DemographicType,
  fips: Fips,
): Promise<{ metricConfig: InsightMetric; sections: ReportSections } | null> {
  const metricConfig = getPrimaryMetricConfig(
    'rate-map',
    dataTypeConfig.metrics,
  )
  if (!metricConfig) return null

  const { shareConfig, populationConfig, generalPopulationLabel } =
    resolveTableShareMetrics(dataTypeConfig)

  const breakdownFilter =
    demographicType === RACE
      ? exclude(NON_HISPANIC, UNKNOWN, UNKNOWN_RACE, UNKNOWN_ETHNICITY)
      : exclude(UNKNOWN)

  const query = (breakdowns: Breakdowns) =>
    new MetricQuery(
      [metricConfig.metricId],
      breakdowns.addBreakdown(demographicType, breakdownFilter),
      dataTypeConfig.dataTypeId,
    )

  // The place query alone carries the share columns. The children query feeds
  // the geographic spread, which reads one rate per place and would be paying
  // for columns it never renders.
  const placeMetricIds = [
    metricConfig.metricId,
    shareConfig?.metricId,
    populationConfig?.metricId,
  ].filter((id) => id != null)

  const isCounty = fips.isCounty()
  const parentFips = fips.getParentFips()

  // Mirrors UnknownsMapCard: the unknown share lives on its own metric, and its
  // query must NOT exclude the unknown groups the way the rate queries do.
  const unknownConfig =
    dataTypeConfig.metrics?.pct_share_unknown ??
    dataTypeConfig.metrics?.pct_share

  // Age adjustment is published only against a White (NH) baseline, so the
  // ratios describe a race gap and nothing else. On a report broken down by age
  // or sex they would qualify a gap the reader is not looking at, so they are
  // left out entirely rather than sent alongside a mismatched breakdown.
  const ageAdjustedConfig =
    demographicType === RACE
      ? dataTypeConfig.metrics?.age_adjusted_ratio
      : undefined

  const [
    placeResponse,
    geoResponse,
    temporalResponse,
    ageAdjustedResponse,
    unknownResponse,
  ] = await Promise.all([
    getDataManager().loadMetrics(
      new MetricQuery(
        placeMetricIds,
        Breakdowns.forFips(fips).addBreakdown(demographicType, breakdownFilter),
        dataTypeConfig.dataTypeId,
      ),
    ),
    getDataManager().loadMetrics(
      query(Breakdowns.forChildrenFips(isCounty ? parentFips : fips)),
    ),
    getDataManager().loadMetrics(
      new MetricQuery(
        [metricConfig.metricId],
        Breakdowns.forFips(fips).addBreakdown(demographicType, breakdownFilter),
        dataTypeConfig.dataTypeId,
        'historical',
      ),
    ),
    ageAdjustedConfig
      ? getDataManager().loadMetrics(
          new MetricQuery(
            [ageAdjustedConfig.metricId],
            Breakdowns.forFips(fips).addBreakdown(
              RACE,
              exclude(ALL, NON_HISPANIC, WHITE_NH, MULTI_OR_OTHER_STANDARD_NH),
            ),
            dataTypeConfig.dataTypeId,
          ),
        )
      : undefined,
    unknownConfig
      ? getDataManager().loadMetrics(
          new MetricQuery(
            [unknownConfig.metricId],
            // No exclude filter here, unlike the rate queries above: the unknown
            // groups are the entire point of this one.
            Breakdowns.forFips(fips).addBreakdown(demographicType),
            dataTypeConfig.dataTypeId,
          ),
        )
      : undefined,
  ])

  const peerComparison = isCounty
    ? countyPeerComparison(
        placeResponse,
        geoResponse,
        metricConfig,
        demographicType,
        fips,
        parentFips,
      )
    : undefined

  return {
    metricConfig: toInsightMetric(metricConfig),
    sections: {
      demographic: {
        rows: placeResponse.getValidRowsForField(metricConfig.metricId),
        shareConfig: toInsightMetric(shareConfig),
        populationConfig: toInsightMetric(populationConfig),
        generalPopulationLabel,
      },
      geographic: {
        // formatGeographicSpread (server/insight_prompt_report.go) reads one
        // rate per place and does not filter by demographic group, so a
        // subgroup row would enter the spread as if it were another place.
        // Narrowing to the overall row happens here rather than there because
        // the spread is the one section whose query is broken down by group for
        // reasons that have nothing to do with what it renders.
        rows: isCounty
          ? []
          : geoResponse
              .getValidRowsForField(metricConfig.metricId)
              .filter((row) => groupIsAll(String(row[demographicType]))),
        peerComparison,
      },
      temporal: {
        rows: temporalResponse.getValidRowsForField(metricConfig.metricId),
      },
      ageAdjusted:
        ageAdjustedConfig && ageAdjustedResponse
          ? {
              rows: ageAdjustedResponse.getValidRowsForField(
                ageAdjustedConfig.metricId,
              ),
              metricConfig: toInsightMetric(ageAdjustedConfig),
            }
          : { rows: [] },
      unknown:
        unknownConfig && unknownResponse
          ? {
              rows: unknownResponse.getValidRowsForField(
                unknownConfig.metricId,
              ),
              metricConfig: toInsightMetric(unknownConfig),
            }
          : { rows: [] },
    },
  }
}

export async function generateReportInsight(
  dataTypeConfig: DataTypeConfig,
  demographicType: DemographicType,
  fips: Fips,
): Promise<ReportInsightResult> {
  try {
    const described = await loadReportData(
      dataTypeConfig,
      demographicType,
      fips,
    )
    if (!described) {
      return {
        sections: null,
        rateLimited: false,
        error: ERROR_GENERATING_INSIGHT,
      }
    }

    const result = await fetchInsight({
      kind: 'report',
      demographicType,
      topic: dataTypeConfig.fullDisplayName,
      location: fips.getSentenceDisplayName(),
      placeNoun: fips.getPluralChildFipsTypeDisplayName(),
      metricConfig: described.metricConfig,
      sections: described.sections,
    })
    const cacheKey = result.cacheKey

    if (result.rateLimited) {
      return { sections: null, rateLimited: true, cacheKey }
    }

    if (result.unavailable) {
      return { sections: null, rateLimited: false, unavailable: true, cacheKey }
    }

    if (result.error) {
      return {
        sections: null,
        rateLimited: false,
        error: ERROR_GENERATING_INSIGHT,
        cacheKey,
      }
    }

    const sections = parseSections(result.content)
    return { sections, rateLimited: false, cacheKey }
  } catch (error) {
    console.error(ERROR_GENERATING_INSIGHT, error)
    return {
      sections: null,
      rateLimited: false,
      error: ERROR_GENERATING_INSIGHT,
    }
  }
}
