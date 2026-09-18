import type { MetricId } from '../config/MetricConfigTypes'
import type { ProviderId } from '../loading/VariableProviderMap'
import type { DataSourceConfig } from './UniversalProvider'
import UniversalProvider from './UniversalProvider'

const ACS_CONDITION_METRICS: MetricId[] = [
  'uninsured_population_pct',
  'uninsured_pct_rate',
  'uninsured_pct_share',
  'uninsured_pct_relative_inequity',
  'poverty_population_pct',
  'poverty_pct_rate',
  'poverty_pct_share',
  'poverty_pct_relative_inequity',
  'uninsured_estimated_total',
  'uninsured_pop_estimated_total',
  'poverty_estimated_total',
  'poverty_pop_estimated_total',
]

const ACS_CONDITION_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'acs_condition' }),
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns) =>
    ['county', 'state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

const PROVIDER_ID: ProviderId = 'acs_condition_provider'

class AcsConditionProvider extends UniversalProvider {
  constructor() {
    super(PROVIDER_ID, ACS_CONDITION_METRICS, ACS_CONDITION_CONFIG)
  }
}

export default AcsConditionProvider
