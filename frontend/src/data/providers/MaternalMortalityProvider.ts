import type { MetricId } from '../config/MetricConfigTypes'
import type { ProviderId } from '../loading/VariableProviderMap'
import type { DataSourceConfig } from './UniversalProvider'
import UniversalProvider from './UniversalProvider'

const MATERNAL_MORTALITY_METRIC_IDS: MetricId[] = [
  'maternal_mortality_per_100k',
  'maternal_mortality_pct_share',
  'maternal_mortality_population_pct',
  'maternal_deaths_estimated_total',
  'live_births_estimated_total',
]

export const MATERNAL_MORTALITY_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Age', 'unavailable for Maternal Mortality'],
  ['Sex', 'unavailable for Maternal Mortality'],
]

const MATERNAL_MORTALITY_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'maternal_mortality_data' }),
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns) =>
    ['state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

const PROVIDER_ID: ProviderId = 'maternal_mortality_provider'

class MaternalMortalityProvider extends UniversalProvider {
  constructor() {
    super(PROVIDER_ID, MATERNAL_MORTALITY_METRIC_IDS, MATERNAL_MORTALITY_CONFIG)
  }
}

export default MaternalMortalityProvider
