import { getDataManager } from '../../utils/globals'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { Breakdowns } from '../query/Breakdowns'
import {
  type MetricQuery,
  MetricQueryResponse,
  resolveDatasetId,
} from '../query/MetricQuery'
import VariableProvider from './VariableProvider'

export const CANCER_DATATYPES: DataTypeId[] = [
  'breast_cancer',
  'cervical_cancer',
  'prostate_cancer',
  'colorectal_cancer',
  'lung_cancer',
]

export const BREAST_CANCER_METRIC_IDS: MetricId[] = [
  'breast_per_100k',
  'breast_count_estimated_total',
  'breast_population_pct',
  'breast_population_estimated_total',
  'breast_pct_share',
  'breast_pct_relative_inequity',
]

export const CERVICAL_CANCER_METRIC_IDS: MetricId[] = [
  'cervical_per_100k',
  'cervical_count_estimated_total',
  'cervical_population_pct',
  'cervical_population_estimated_total',
  'cervical_pct_share',
  'cervical_pct_relative_inequity',
]

export const PROSTATE_CANCER_METRIC_IDS: MetricId[] = [
  'prostate_per_100k',
  'prostate_count_estimated_total',
  'prostate_population_pct',
  'prostate_population_estimated_total',
  'prostate_pct_share',
  'prostate_pct_relative_inequity',
]

export const COLORECTAL_CANCER_METRIC_IDS: MetricId[] = [
  'colorectal_per_100k',
  'colorectal_count_estimated_total',
  'colorectal_population_pct',
  'colorectal_population_estimated_total',
  'colorectal_pct_share',
  'colorectal_pct_relative_inequity',
]

export const LUNG_CANCER_METRIC_IDS: MetricId[] = [
  'lung_per_100k',
  'lung_count_estimated_total',
  'lung_population_pct',
  'lung_population_estimated_total',
  'lung_pct_share',
  'lung_pct_relative_inequity',
]

export const CANCER_METRICS = [
  ...BREAST_CANCER_METRIC_IDS,
  ...CERVICAL_CANCER_METRIC_IDS,
  ...PROSTATE_CANCER_METRIC_IDS,
  ...COLORECTAL_CANCER_METRIC_IDS,
  ...LUNG_CANCER_METRIC_IDS,
]

class CdcCancerProvider extends VariableProvider {
  constructor() {
    super('cdc_cancer_provider', CANCER_METRICS)
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    try {
      const { breakdowns, datasetId, isFallbackId } = resolveDatasetId(
        'cdc_wonder_data',
        '',
        metricQuery,
      )

      if (!datasetId) {
        return new MetricQueryResponse([], [])
      }

      const cancerData = await getDataManager().loadDataset(datasetId)
      let df = cancerData.toDataFrame()

      df = this.filterByGeo(df, breakdowns)
      df = this.renameGeoColumns(df, breakdowns)
      if (isFallbackId) {
        df = this.castAllsAsRequestedDemographicBreakdown(df, breakdowns)
      } else {
        df = this.applyDemographicBreakdownFilters(df, breakdowns)
        df = this.removeUnrequestedColumns(df, metricQuery)
      }

      const consumedDatasetIds = [datasetId]
      return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
    } catch (error) {
      console.error('Error fetching cancer data:', error)
      throw error
    }
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest =
      breakdowns.hasExactlyOneDemographic()

    return (
      (breakdowns.geography === 'state' ||
        breakdowns.geography === 'national') &&
      validDemographicBreakdownRequest
    )
  }
}

export default CdcCancerProvider
