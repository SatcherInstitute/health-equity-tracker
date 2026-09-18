import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { ProviderId } from '../loading/VariableProviderMap'
import type { DataSourceConfig } from './UniversalProvider'
import UniversalProvider from './UniversalProvider'

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
  'hiv_deaths_per_100k_is_suppressed',
  'hiv_deaths_ratio_age_adjusted',
  'hiv_deaths',
]

const DIAGNOSES_METRICS: MetricId[] = [
  'hiv_diagnoses_pct_relative_inequity',
  'hiv_diagnoses_pct_share',
  'hiv_diagnoses_per_100k',
  'hiv_diagnoses_per_100k_is_suppressed',
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
  'hiv_prevalence_per_100k_is_suppressed',
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
  'hiv_population_pct',
  'hiv_population',
]

const HIV_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'cdc_hiv_data' }),
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns, metricIds = []) => {
    const hasNoCountyData = metricIds.some((id) => DEATHS_METRICS.includes(id))
    return hasNoCountyData
      ? ['state', 'national'].includes(breakdowns.geography) &&
          breakdowns.hasExactlyOneDemographic()
      : ['county', 'state', 'national'].includes(breakdowns.geography) &&
          breakdowns.hasExactlyOneDemographic()
  },
}

const PROVIDER_ID: ProviderId = 'hiv_provider'

class HivProvider extends UniversalProvider {
  constructor() {
    super(PROVIDER_ID, HIV_METRICS, HIV_CONFIG)
  }
}

export default HivProvider
