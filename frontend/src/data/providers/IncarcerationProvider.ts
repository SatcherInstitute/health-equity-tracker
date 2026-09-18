import type { DatasetId } from '../config/DatasetMetadata'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { ProviderId } from '../loading/VariableProviderMap'
import { addAcsIdToConsumed } from '../utils/datasetutils'
import type { DataSourceConfig } from './UniversalProvider'
import UniversalProvider from './UniversalProvider'

// states with combined prison and jail systems
export const COMBINED_INCARCERATION_STATES_LIST = [
  'Alaska',
  'Connecticut',
  'Delaware',
  'Hawaii',
  'Rhode Island',
  'Vermont',
]

export const COMBINED_QUALIFIER = '(combined prison and jail)'
export const PRIVATE_JAILS_QUALIFIER = '(private jail system only)'

export const INCARCERATION_IDS: DataTypeId[] = ['prison', 'jail']

const JAIL_METRIC_IDS: MetricId[] = [
  'jail_pct_share',
  'jail_estimated_total',
  'jail_per_100k',
  'jail_pct_relative_inequity',
]

const PRISON_METRIC_IDS: MetricId[] = [
  'prison_pct_share',
  'prison_estimated_total',
  'prison_per_100k',
  'prison_pct_relative_inequity',
]

const INCARCERATION_METRIC_IDS: MetricId[] = [
  ...JAIL_METRIC_IDS,
  ...PRISON_METRIC_IDS,
  'confined_children_estimated_total',
  'incarceration_population_pct',
  'incarceration_population_estimated_total',
]

const INCARCERATION_CONFIG: DataSourceConfig = {
  getDatasetDetails: ({ breakdowns }) => ({
    datasetName:
      breakdowns.geography === 'county'
        ? 'vera_incarceration_county'
        : 'bjs_incarceration_data',
  }),
  getConsumedDatasetIds: (mainId, metricQuery, breakdowns) => {
    const consumedDatasetIds: DatasetId[] = [mainId]

    // everything uses ACS except county-level reports and territory-reports
    if (
      breakdowns.geography !== 'county' &&
      !breakdowns.filterFips?.isIslandArea()
    ) {
      addAcsIdToConsumed(metricQuery, consumedDatasetIds)
    }

    // National Level - Map of all states + territory bubbles
    if (breakdowns.geography === 'state' && !breakdowns.filterFips) {
      consumedDatasetIds.push(
        'decia_2020_territory_population-sex_state_current',
      )
    }

    // Territory Level (Island Areas) - All cards
    if (breakdowns.filterFips?.isIslandArea()) {
      consumedDatasetIds.push(
        'decia_2020_territory_population-sex_state_current',
      )
      // only time-series cards use decia 2010
      if (metricQuery.timeView === 'historical') {
        consumedDatasetIds.push(
          'decia_2010_territory_population-sex_state_current',
        )
      }
    }

    return consumedDatasetIds
  },
  allowsBreakdowns: (breakdowns) =>
    ['national', 'state', 'county'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

const PROVIDER_ID: ProviderId = 'incarceration_provider'

class IncarcerationProvider extends UniversalProvider {
  constructor() {
    super(PROVIDER_ID, INCARCERATION_METRIC_IDS, INCARCERATION_CONFIG)
  }
}

export default IncarcerationProvider
