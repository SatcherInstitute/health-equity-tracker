import { getDataManager } from '../../utils/globals'
import type { DropdownVarId } from '../config/DropDownIds'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { Breakdowns } from '../query/Breakdowns'
import {
  type MetricQuery,
  MetricQueryResponse,
  resolveDatasetId,
} from '../query/MetricQuery'
import VariableProvider from './VariableProvider'

export const CDC_CANCER_CONDITIONS: DropdownVarId[] = ['cancer_incidence']

export const CDC_CANCER_SEX_SPECIFIC_DATATYPES: DataTypeId[] = [
  'breast_cancer_incidence',
  'cervical_cancer_incidence',
  'prostate_cancer_incidence',
]

export const CDC_CANCER_ALL_SEXES_DATATYPES: DataTypeId[] = [
  'colorectal_cancer_incidence',
  'lung_cancer_incidence',
]

export const CDC_CANCER_DATATYPES: DataTypeId[] = [
  ...CDC_CANCER_SEX_SPECIFIC_DATATYPES,
  ...CDC_CANCER_ALL_SEXES_DATATYPES,
]

export const CDC_CANCER_METRICS: MetricId[] = [
  'breast_per_100k',
  'breast_count_estimated_total',
  'breast_population_pct',
  'breast_population_estimated_total',
  'breast_pct_share',
  'breast_pct_relative_inequity',
  'cervical_per_100k',
  'cervical_count_estimated_total',
  'cervical_population_pct',
  'cervical_population_estimated_total',
  'cervical_pct_share',
  'cervical_pct_relative_inequity',
  'prostate_per_100k',
  'prostate_count_estimated_total',
  'prostate_population_pct',
  'prostate_population_estimated_total',
  'prostate_pct_share',
  'prostate_pct_relative_inequity',
  'colorectal_per_100k',
  'colorectal_count_estimated_total',
  'colorectal_population_pct',
  'colorectal_population_estimated_total',
  'colorectal_pct_share',
  'colorectal_pct_relative_inequity',
  'lung_per_100k',
  'lung_count_estimated_total',
  'lung_population_pct',
  'lung_population_estimated_total',
  'lung_pct_share',
  'lung_pct_relative_inequity',
]

export const CDC_CANCER_RESTRICTED_DEMOGRAPHIC_WITH_SEX_DETAILS = [
  [
    'Sex',
    "only available when comparing cancer incidence topics that aren't sex-specific",
  ],
]

class CdcCancerProvider extends VariableProvider {
  constructor() {
    super('cdc_cancer_provider', CDC_CANCER_METRICS)
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
