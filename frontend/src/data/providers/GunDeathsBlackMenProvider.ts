import type { MetricId } from '../config/MetricConfigTypes'
import type { ProviderId } from '../loading/VariableProviderMap'
import type { DataSourceConfig } from './UniversalProvider'
import UniversalProvider from './UniversalProvider'

const GUN_DEATHS_BLACK_MEN_METRIC_IDS: MetricId[] = [
  'gun_homicides_black_men_estimated_total',
  'gun_homicides_black_men_pct_relative_inequity',
  'gun_homicides_black_men_pct_share',
  'gun_homicides_black_men_per_100k',
  'gun_homicides_black_men_per_100k_is_suppressed',
  'gun_homicides_black_men_population_estimated_total',
  'gun_homicides_black_men_population_pct',
]

const reason = 'unavailable for intersectional Black men topics'
export const BLACK_MEN_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Race/Ethnicity', reason],
  ['Sex', reason],
]

export const BLACK_MEN_RESTRICTED_DEMOGRAPHIC_DETAILS_URBANICITY = [
  ['City Size', 'unavailable for when comparing these topics'],
]

const GUN_DEATHS_BLACK_MEN_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({
    datasetName: 'cdc_wisqars_black_men_data',
    tablePrefix: 'black_men_by_',
  }),
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns) =>
    ['state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

const PROVIDER_ID: ProviderId = 'gun_violence_black_men_provider'

class GunViolenceBlackMenProvider extends UniversalProvider {
  constructor() {
    super(
      PROVIDER_ID,
      GUN_DEATHS_BLACK_MEN_METRIC_IDS,
      GUN_DEATHS_BLACK_MEN_CONFIG,
    )
  }
}

export default GunViolenceBlackMenProvider
