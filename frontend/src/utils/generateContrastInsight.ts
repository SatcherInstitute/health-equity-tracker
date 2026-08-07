import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type { MetricQueryResponse } from '../data/query/MetricQuery'
import type { HetRow } from '../data/utils/DatasetTypes'
import type { Fips } from '../data/utils/Fips'
import { getPrimaryMetricConfig } from './generateVisualizationInsight'
import type { ScrollableHashId } from './hooks/useStepObserver'
import {
  fetchInsight,
  type InsightMetric,
  type InsightResult,
  toInsightMetric,
} from './insightDescriptor'

interface ContrastView {
  topic: string
  location: string
  metricConfig: InsightMetric
  rows: HetRow[]
}

// One side of a compare-mode contrast: the same chart rendered for a second
// topic or a second place.
function contrastView(
  hashId: ScrollableHashId,
  dataTypeConfig: DataTypeConfig,
  fips: Fips,
  queryResponses: MetricQueryResponse[],
): ContrastView | null {
  const metricConfig = getPrimaryMetricConfig(hashId, dataTypeConfig.metrics)
  if (!metricConfig) return null
  return {
    topic: dataTypeConfig.fullDisplayName,
    location: fips.getSentenceDisplayName(),
    metricConfig: toInsightMetric(metricConfig),
    rows: queryResponses[0]
      ? queryResponses[0].getValidRowsForField(metricConfig.metricId)
      : [],
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
): Promise<InsightResult> {
  const viewA = contrastView(hashId, dataTypeConfig1, fips1, queryResponses1)
  const viewB = contrastView(hashId, dataTypeConfig2, fips2, queryResponses2)
  if (!viewA || !viewB) {
    return { content: '', rateLimited: false, error: true }
  }

  return fetchInsight({
    kind: 'contrast',
    hashId,
    demographicType,
    viewA,
    viewB,
  })
}
