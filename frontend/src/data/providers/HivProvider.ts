import { getDataManager } from '../../utils/globals'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { Breakdowns } from '../query/Breakdowns'
import {
  type MetricQuery,
  MetricQueryResponse,
  resolveDatasetId,
} from '../query/MetricQuery'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import VariableProvider from './VariableProvider'

export const DATATYPES_NEEDING_13PLUS: DataTypeId[] = [
  'hiv_care',
  'hiv_deaths',
  'hiv_diagnoses',
  'hiv_prevalence',
]

const CARE_METRICS: MetricId[] = [
  'hiv_care_linkage',
  'hiv_care_pct_relative_inequity',
  'hiv_care_pct_share',
  'hiv_care_population_pct',
  'hiv_care_population',
  'hiv_care',
]

const DEATHS_METRICS: MetricId[] = [
  'hiv_deaths_pct_relative_inequity',
  'hiv_deaths_pct_share',
  'hiv_deaths_per_100k',
  'hiv_deaths_ratio_age_adjusted',
  'hiv_deaths',
]

const DIAGNOSES_METRICS: MetricId[] = [
  'hiv_diagnoses_pct_relative_inequity',
  'hiv_diagnoses_pct_share',
  'hiv_diagnoses_per_100k',
  'hiv_diagnoses',
]

const PREP_METRICS: MetricId[] = [
  'hiv_prep_coverage',
  'hiv_prep_pct_relative_inequity',
  'hiv_prep_pct_share',
  'hiv_prep_population_pct',
  'hiv_prep_population',
  'hiv_prep',
]

const PREVALENCE_METRICS: MetricId[] = [
  'hiv_prevalence_pct_relative_inequity',
  'hiv_prevalence_pct_share',
  'hiv_prevalence_per_100k',
  'hiv_prevalence',
]

export const GENDER_METRICS: MetricId[] = [
  'hiv_care_total_additional_gender',
  'hiv_care_total_trans_men',
  'hiv_care_total_trans_women',
  'hiv_deaths_total_additional_gender',
  'hiv_deaths_total_trans_men',
  'hiv_deaths_total_trans_women',
  'hiv_diagnoses_total_additional_gender',
  'hiv_diagnoses_total_trans_men',
  'hiv_diagnoses_total_trans_women',
  'hiv_prevalence_total_additional_gender',
  'hiv_prevalence_total_trans_men',
  'hiv_prevalence_total_trans_women',
]

const STIGMA_METRICS: MetricId[] = ['hiv_stigma_index', 'hiv_stigma_pct_share']

export const HIV_METRICS: MetricId[] = [
  ...CARE_METRICS,
  ...DEATHS_METRICS,
  ...DIAGNOSES_METRICS,
  ...PREP_METRICS,
  ...PREVALENCE_METRICS,
  ...GENDER_METRICS,
  ...STIGMA_METRICS,
  // population shares and counts of 13+
  'hiv_population_pct',
  'hiv_population',
]

class HivProvider extends VariableProvider {
  constructor() {
    super('hiv_provider', HIV_METRICS)
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    const { breakdowns, datasetId, isFallbackId } = resolveDatasetId(
      'cdc_hiv_data',
      '',
      metricQuery,
    )

    if (!datasetId) {
      return new MetricQueryResponse([], [])
    }
    const consumedDatasetIds = [datasetId]
    const specificDatasetId = isFallbackId
      ? datasetId
      : appendFipsIfNeeded(datasetId, breakdowns)
    const hiv = await getDataManager().loadDataset(specificDatasetId)
    let df = hiv.toDataFrame()
    df = this.filterByGeo(df, breakdowns)
    df = this.renameGeoColumns(df, breakdowns)

    if (isFallbackId) {
      df = this.castAllsAsRequestedDemographicBreakdown(df, breakdowns)
    } else {
      df = this.applyDemographicBreakdownFilters(df, breakdowns)
      df = this.removeUnrequestedColumns(df, metricQuery)
    }
    return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
  }

  allowsBreakdowns(breakdowns: Breakdowns, metricIds: MetricId[]): boolean {
    const validDemographicBreakdownRequest =
      breakdowns.hasExactlyOneDemographic()

    const hasNoCountyData = metricIds.some((metricId) =>
      DEATHS_METRICS.includes(metricId),
    )

    return hasNoCountyData
      ? (breakdowns.geography === 'state' ||
          breakdowns.geography === 'national') &&
          validDemographicBreakdownRequest
      : (breakdowns.geography === 'county' ||
          breakdowns.geography === 'state' ||
          breakdowns.geography === 'national') &&
          validDemographicBreakdownRequest
  }
}

export default HivProvider
