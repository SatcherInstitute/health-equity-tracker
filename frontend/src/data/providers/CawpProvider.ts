import { getDataManager } from '../../utils/globals'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'

import type { DatasetId } from '../config/DatasetMetadata'
import type { Breakdowns, TimeView } from '../query/Breakdowns'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import {
  AIANNH_W,
  AIAN_API_W,
  HISPANIC,
  HISP_W,
  MULTI,
  MULTI_W,
  OTHER_STANDARD,
  OTHER_W,
  type RaceAndEthnicityGroup,
  UNKNOWN_RACE,
  UNKNOWN_W,
  UNREPRESENTED,
} from '../utils/Constants'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import { GetAcsDatasetId } from './AcsPopulationProvider'
import VariableProvider from './VariableProvider'

const CAWP_CONGRESS_COUNTS: MetricId[] = [
  'women_this_race_us_congress_count',
  'total_us_congress_count',
]

const CAWP_STLEG_COUNTS: MetricId[] = [
  'women_this_race_state_leg_count',
  'total_state_leg_count',
]

export const CAWP_METRICS: MetricId[] = [
  'cawp_population_pct',
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

class CawpProvider extends VariableProvider {
  constructor() {
    super('cawp_provider', CAWP_METRICS)
  }

  getDatasetId(
    breakdowns: Breakdowns,
    dataTypeId?: DataTypeId,
    timeView?: TimeView,
  ): DatasetId | undefined {
    if (timeView === 'current') {
      if (breakdowns.geography === 'national' && breakdowns.hasOnlyRace())
        return 'cawp_data-race_and_ethnicity_national_current'
      if (breakdowns.geography === 'state' && breakdowns.hasOnlyRace())
        return 'cawp_data-race_and_ethnicity_state_current'
    }
    if (timeView === 'historical') {
      if (breakdowns.geography === 'national' && breakdowns.hasOnlyRace())
        return 'cawp_data-race_and_ethnicity_national_historical'
      if (breakdowns.geography === 'state' && breakdowns.hasOnlyRace())
        return 'cawp_data-race_and_ethnicity_state_historical'
    }
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns
    const timeView = metricQuery.timeView
    const datasetId = this.getDatasetId(breakdowns, undefined, timeView)
    if (!datasetId) {
      return new MetricQueryResponse([], [])
    }
    const specificDatasetId = appendFipsIfNeeded(datasetId, breakdowns)
    const cawp = await getDataManager().loadDataset(specificDatasetId)
    let df = cawp.toDataFrame()

    df = this.filterByGeo(df, breakdowns)
    df = this.renameGeoColumns(df, breakdowns)

    const consumedDatasetIds = [datasetId]

    // no population numbers used for rates, only comparison pop. and pct_rel_inequity
    if (
      metricQuery.metricIds.includes('cawp_population_pct') ||
      metricQuery.metricIds.includes(
        'women_us_congress_pct_relative_inequity',
      ) ||
      metricQuery.metricIds.includes('women_state_leg_pct_relative_inequity')
    ) {
      if (metricQuery.breakdowns.filterFips?.isIslandArea()) {
        // all CAWP island areas use DECIA_2020
        consumedDatasetIds.push(
          'decia_2020_territory_population-by_race_and_ethnicity_territory_state_level',
        )

        // CAWP time-series also use DECIA_2010
        if (timeView === 'historical') {
          consumedDatasetIds.push(
            'decia_2010_territory_population-by_race_and_ethnicity_territory_state_level',
          )
        }
      } else {
        // Non-Island Areas use ACS
        const acsId = GetAcsDatasetId(breakdowns)
        acsId && consumedDatasetIds.push(acsId)
      }
    }
    if (metricQuery.metricIds.includes('pct_share_of_us_congress')) {
      consumedDatasetIds.push('the_unitedstates_project')
    }

    df = this.applyDemographicBreakdownFilters(df, breakdowns)
    df = this.removeUnrequestedColumns(df, metricQuery)

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest = breakdowns.hasOnlyRace()

    return (
      (breakdowns.geography === 'state' ||
        breakdowns.geography === 'national') &&
      validDemographicBreakdownRequest
    )
  }
}

export default CawpProvider
