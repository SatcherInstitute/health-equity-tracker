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

export const BLACK_WOMEN_DATATYPES: DataTypeId[] = [
  'hiv_deaths_black_women',
  'hiv_diagnoses_black_women',
  'hiv_prevalence_black_women',
]

export const DATATYPES_NEEDING_13PLUS: DataTypeId[] = [
  'hiv_care',
  'hiv_deaths',
  'hiv_diagnoses',
  'hiv_prevalence',
  ...BLACK_WOMEN_DATATYPES,
]

const BLACK_WOMEN_METRICS: MetricId[] = [
  'hiv_deaths_black_women',
  'hiv_deaths_black_women_pct_relative_inequity',
  'hiv_deaths_black_women_pct_share',
  'hiv_deaths_black_women_per_100k',
  'hiv_diagnoses_black_women',
  'hiv_diagnoses_black_women_pct_relative_inequity',
  'hiv_diagnoses_black_women_pct_share',
  'hiv_diagnoses_black_women_per_100k',
  'hiv_prevalence_black_women',
  'hiv_prevalence_black_women_pct_relative_inequity',
  'hiv_prevalence_black_women_pct_share',
  'hiv_prevalence_black_women_per_100k',
  'black_women_population_count',
  'black_women_population_pct',
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
  ...BLACK_WOMEN_METRICS,
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

const reason = 'unavailable for intersectional Black women topics'
export const BLACK_WOMEN_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Race/Ethnicity', reason],
  ['Sex', reason],
]

class HivProvider extends VariableProvider {
  constructor() {
    super('hiv_provider', HIV_METRICS)
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    const isBlackWomenData =
      metricQuery.dataTypeId &&
      BLACK_WOMEN_DATATYPES.includes(metricQuery.dataTypeId)

    const tablePrefix = isBlackWomenData ? 'black_women_by_' : ''

    const { breakdowns, datasetId, isFallbackId } = resolveDatasetId(
      'cdc_hiv_data',
      tablePrefix,
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

    const noCountyData = [...BLACK_WOMEN_METRICS, ...DEATHS_METRICS]
    const hasNoCountyData = metricIds.some((metricId) =>
      noCountyData.includes(metricId),
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
