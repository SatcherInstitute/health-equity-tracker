import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { ProviderId } from '../loading/VariableProviderMap'
import type { DataSourceConfig } from './UniversalProvider'
import UniversalProvider from './UniversalProvider'

export const BLACK_WOMEN_DATATYPES: DataTypeId[] = [
  'hiv_deaths_black_women',
  'hiv_diagnoses_black_women',
  'hiv_prevalence_black_women',
]

export const BLACK_WOMEN_METRICS: MetricId[] = [
  'hiv_deaths_black_women',
  'hiv_deaths_black_women_pct_relative_inequity',
  'hiv_deaths_black_women_pct_share',
  'hiv_deaths_black_women_per_100k',
  'hiv_deaths_black_women_per_100k_is_suppressed',
  'hiv_diagnoses_black_women',
  'hiv_diagnoses_black_women_pct_relative_inequity',
  'hiv_diagnoses_black_women_pct_share',
  'hiv_diagnoses_black_women_per_100k',
  'hiv_diagnoses_black_women_per_100k_is_suppressed',
  'hiv_prevalence_black_women',
  'hiv_prevalence_black_women_pct_relative_inequity',
  'hiv_prevalence_black_women_pct_share',
  'hiv_prevalence_black_women_per_100k',
  'hiv_prevalence_black_women_per_100k_is_suppressed',
  'black_women_population_count',
  'black_women_population_pct',
]

const reason = 'unavailable for intersectional Black women topics'
export const BLACK_WOMEN_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Race/Ethnicity', reason],
  ['Sex', reason],
]

const HIV_BLACK_WOMEN_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({
    datasetName: 'cdc_hiv_data',
    tablePrefix: 'black_women_by_',
  }),
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns) =>
    ['state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

const PROVIDER_ID: ProviderId = 'hiv_black_women_provider'

class HivBlackWomenProvider extends UniversalProvider {
  constructor() {
    super(PROVIDER_ID, BLACK_WOMEN_METRICS, HIV_BLACK_WOMEN_CONFIG)
  }
}

export default HivBlackWomenProvider
