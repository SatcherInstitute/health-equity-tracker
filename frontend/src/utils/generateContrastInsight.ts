import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type { MetricQueryResponse } from '../data/query/MetricQuery'
import { ALL, type DemographicGroup } from '../data/utils/Constants'
import type { HetRow } from '../data/utils/DatasetTypes'
import type { Fips } from '../data/utils/Fips'
import { getPrimaryMetricConfig } from './generateVisualizationInsight'
import type { ScrollableHashId } from './hooks/useStepObserver'
import {
  fetchInsight,
  fetchInsightPreview,
  type InsightMetric,
  type InsightResult,
  toInsightMetric,
} from './insightDescriptor'

interface ContrastView {
  topic: string
  location: string
  metricConfig: InsightMetric
  rows: HetRow[]
  // The group this side's map shows. Each side of a compare is filtered to its
  // own group plus its All rows, since the two maps can highlight different groups.
  activeDemographicGroup?: DemographicGroup
}

// The group each side of the compare is showing; unset or All means overall.
export interface ContrastGroups {
  viewA?: DemographicGroup
  viewB?: DemographicGroup
}

// One side of a compare-mode contrast: the same chart rendered for a second
// topic or a second place.
function contrastView(
  hashId: ScrollableHashId,
  dataTypeConfig: DataTypeConfig,
  fips: Fips,
  queryResponses: MetricQueryResponse[],
  activeDemographicGroup?: DemographicGroup,
): ContrastView | null {
  const metricConfig = getPrimaryMetricConfig(hashId, dataTypeConfig.metrics)
  if (!metricConfig) return null
  return {
    ...(activeDemographicGroup && activeDemographicGroup !== ALL
      ? { activeDemographicGroup }
      : {}),
    topic: dataTypeConfig.fullDisplayName,
    location: fips.getSentenceDisplayName(),
    metricConfig: toInsightMetric(metricConfig),
    rows: queryResponses[0]
      ? queryResponses[0].getValidRowsForField(metricConfig.metricId)
      : [],
  }
}

function buildContrastDescriptor(
  hashId: ScrollableHashId,
  dataTypeConfig1: DataTypeConfig,
  dataTypeConfig2: DataTypeConfig,
  fips1: Fips,
  fips2: Fips,
  demographicType: DemographicType,
  queryResponses1: MetricQueryResponse[],
  queryResponses2: MetricQueryResponse[],
  groups: ContrastGroups,
) {
  const viewA = contrastView(
    hashId,
    dataTypeConfig1,
    fips1,
    queryResponses1,
    groups.viewA,
  )
  const viewB = contrastView(
    hashId,
    dataTypeConfig2,
    fips2,
    queryResponses2,
    groups.viewB,
  )
  if (!viewA || !viewB) return null
  // Only a group both sides share steers the prompt's wording; differing groups
  // are carried on each view and show up in the row labels.
  const activeDemographicGroup =
    groups.viewA && groups.viewA === groups.viewB && groups.viewA !== ALL
      ? groups.viewA
      : undefined
  return {
    kind: 'contrast' as const,
    hashId,
    demographicType,
    viewA,
    viewB,
    ...(activeDemographicGroup ? { context: { activeDemographicGroup } } : {}),
  }
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
  groups: ContrastGroups,
): Promise<InsightResult> {
  const descriptor = buildContrastDescriptor(
    hashId,
    dataTypeConfig1,
    dataTypeConfig2,
    fips1,
    fips2,
    demographicType,
    queryResponses1,
    queryResponses2,
    groups,
  )
  if (!descriptor) return { content: '', rateLimited: false, error: true }
  return fetchInsight(descriptor)
}

export async function previewContrastInsight(
  hashId: ScrollableHashId,
  dataTypeConfig1: DataTypeConfig,
  dataTypeConfig2: DataTypeConfig,
  fips1: Fips,
  fips2: Fips,
  demographicType: DemographicType,
  queryResponses1: MetricQueryResponse[],
  queryResponses2: MetricQueryResponse[],
  groups: ContrastGroups,
): Promise<string | null> {
  const descriptor = buildContrastDescriptor(
    hashId,
    dataTypeConfig1,
    dataTypeConfig2,
    fips1,
    fips2,
    demographicType,
    queryResponses1,
    queryResponses2,
    groups,
  )
  if (!descriptor) return null
  return fetchInsightPreview(descriptor)
}
