import type { DatasetId } from '../config/DatasetMetadata'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { ProviderId } from '../loading/VariableProviderMap'
import {
  AIAN_API_W,
  AIANNH_W,
  HISP_W,
  HISPANIC,
  MULTI,
  MULTI_W,
  OTHER_STANDARD,
  OTHER_W,
  type RaceAndEthnicityGroup,
  UNKNOWN_RACE,
  UNKNOWN_W,
  UNREPRESENTED,
} from '../utils/Constants'
import { addAcsIdToConsumed } from '../utils/datasetutils'
import type { DataSourceConfig } from './UniversalProvider'
import UniversalProvider from './UniversalProvider'

const CAWP_CONGRESS_COUNTS: MetricId[] = [
  'women_this_race_us_congress_count',
  'total_us_congress_count',
]

const CAWP_CONGRESS_METRICS: MetricId[] = [
  'cawp_population_pct',
  'congressional_districts',
  'pct_share_of_us_congress',
  'pct_share_of_women_us_congress',
  'women_us_congress_pct_relative_inequity',
  ...CAWP_CONGRESS_COUNTS,
]

const CAWP_STLEG_COUNTS: MetricId[] = [
  'women_this_race_state_leg_count',
  'total_state_leg_count',
]

export const CAWP_METRICS: MetricId[] = [
  'cawp_population_pct',
  'congressional_districts',
  'pct_share_of_state_leg',
  'pct_share_of_women_state_leg',
  'women_state_leg_pct_relative_inequity',
  'pct_share_of_us_congress',
  'pct_share_of_women_us_congress',
  'women_us_congress_pct_relative_inequity',
  ...CAWP_CONGRESS_COUNTS,
  ...CAWP_STLEG_COUNTS,
]

export const CAWP_DATA_TYPES: DataTypeId[] = [
  'women_in_state_legislature',
  'women_in_us_congress',
]

export function getWomenRaceLabel(
  raceLabel: RaceAndEthnicityGroup,
): RaceAndEthnicityGroup {
  switch (raceLabel) {
    case 'American Indian, Alaska Native, Asian & Pacific Islander':
      return AIAN_API_W
    case 'Native American, Alaska Native, & Native Hawaiian':
      return AIANNH_W
    case MULTI:
      return MULTI_W
    case OTHER_STANDARD:
      return OTHER_W
    case UNREPRESENTED:
      return OTHER_W
    case UNKNOWN_RACE:
      return UNKNOWN_W
    case HISPANIC:
      return HISP_W
  }
  return `${raceLabel} women`
}

const reason = 'unavailable for Women in elective office topics'
export const CAWP_RESTRICTED_DEMOGRAPHIC_DETAILS = [
  ['Age', reason],
  ['Sex', reason],
]

const CAWP_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'cawp_data' }),
  getConsumedDatasetIds: (mainId, metricQuery, breakdowns) => {
    const consumedDatasetIds: DatasetId[] = [mainId]
    const { timeView } = metricQuery

    // no population numbers used for rates, only comparison pop. and pct_rel_inequity
    if (
      metricQuery.metricIds.includes('cawp_population_pct') ||
      metricQuery.metricIds.includes(
        'women_us_congress_pct_relative_inequity',
      ) ||
      metricQuery.metricIds.includes('women_state_leg_pct_relative_inequity')
    ) {
      if (breakdowns.filterFips?.isIslandArea()) {
        consumedDatasetIds.push(
          'decia_2020_territory_population-race_and_ethnicity_state_current',
        )
        if (timeView === 'historical') {
          consumedDatasetIds.push(
            'decia_2010_territory_population-race_and_ethnicity_state_current',
          )
        }
      } else {
        addAcsIdToConsumed(metricQuery, consumedDatasetIds)
      }
    }

    if (metricQuery.metricIds.includes('pct_share_of_us_congress')) {
      consumedDatasetIds.push('the_unitedstates_project')
    }

    return consumedDatasetIds
  },
  allowsBreakdowns: (breakdowns, metricIds) => {
    const isValidCountyRequest =
      breakdowns.geography === 'county' &&
      (!metricIds ||
        metricIds.every((id) => CAWP_CONGRESS_METRICS.includes(id)))
    return (
      (isValidCountyRequest ||
        breakdowns.geography === 'state' ||
        breakdowns.geography === 'national') &&
      breakdowns.hasExactlyOneDemographic()
    )
  },
}

const PROVIDER_ID: ProviderId = 'cawp_provider'

class CawpProvider extends UniversalProvider {
  constructor() {
    super(PROVIDER_ID, CAWP_METRICS, CAWP_CONFIG)
  }
}

export default CawpProvider
