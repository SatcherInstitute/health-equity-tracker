import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { ProviderId } from '../loading/VariableProviderMap'
import type { DataSourceConfig } from './UniversalProvider'
import UniversalProvider from './UniversalProvider'

// TODO: ideally we should fix on the backend to clarify: `youth` is the parent category, that combines both `children` (ages 0-17) and `young_adults` (ages 18-25)

export const GUN_VIOLENCE_YOUTH_DATATYPES: DataTypeId[] = [
  'gun_deaths_youth',
  'gun_deaths_young_adults',
]

const GUN_DEATHS_CHILDREN_METRIC_IDS: MetricId[] = [
  'gun_deaths_youth_estimated_total',
  'gun_deaths_youth_pct_relative_inequity',
  'gun_deaths_youth_pct_share',
  'gun_deaths_youth_per_100k',
  'gun_deaths_youth_per_100k_is_suppressed',
  'gun_deaths_youth_population',
  'gun_deaths_youth_population_pct',
]

const GUN_DEATHS_YOUNG_ADULTS_METRIC_IDS: MetricId[] = [
  'gun_deaths_young_adults_estimated_total',
  'gun_deaths_young_adults_pct_relative_inequity',
  'gun_deaths_young_adults_pct_share',
  'gun_deaths_young_adults_per_100k',
  'gun_deaths_young_adults_per_100k_is_suppressed',
  'gun_deaths_young_adults_population',
  'gun_deaths_young_adults_population_pct',
]

export const GUN_VIOLENCE_YOUTH_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Age', 'unavailable for Gun Deaths (Youth)'],
  ['Sex', 'unavailable for Gun Deaths (Youth)'],
]

const GUN_VIOLENCE_YOUTH_METRICS = [
  ...GUN_DEATHS_CHILDREN_METRIC_IDS,
  ...GUN_DEATHS_YOUNG_ADULTS_METRIC_IDS,
]

const GUN_VIOLENCE_YOUTH_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({
    datasetName: 'cdc_wisqars_youth_data',
    tablePrefix: 'youth_by_',
  }),
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns) =>
    ['state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

const PROVIDER_ID: ProviderId = 'gun_violence_youth_provider'

class GunViolenceYouthProvider extends UniversalProvider {
  constructor() {
    super(PROVIDER_ID, GUN_VIOLENCE_YOUTH_METRICS, GUN_VIOLENCE_YOUTH_CONFIG)
  }
}

export default GunViolenceYouthProvider
