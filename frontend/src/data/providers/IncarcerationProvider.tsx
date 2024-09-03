import { getDataManager } from '../../utils/globals'
import type { Breakdowns } from '../query/Breakdowns'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import type { MetricId, DataTypeId } from '../config/MetricConfig'
import VariableProvider from './VariableProvider'
import { GetAcsDatasetId } from './AcsPopulationProvider'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import { getMostRecentYearAsString } from '../utils/DatasetTimeUtils'
import type { DatasetId } from '../config/DatasetMetadata'

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

export const JAIL_METRIC_IDS: MetricId[] = [
  'jail_pct_share',
  'jail_estimated_total',
  'jail_per_100k',
  'jail_pct_relative_inequity',
]

export const PRISON_METRIC_IDS: MetricId[] = [
  'prison_pct_share',
  'prison_estimated_total',
  'prison_per_100k',
  'prison_pct_relative_inequity',
]

const INCARCERATION_METRIC_IDS: MetricId[] = [
  ...JAIL_METRIC_IDS,
  ...PRISON_METRIC_IDS,
  'total_confined_children',
  'incarceration_population_pct',
  'incarceration_population_estimated_total',
]

class IncarcerationProvider extends VariableProvider {
  constructor() {
    super('incarceration_provider', INCARCERATION_METRIC_IDS)
  }

  getDatasetId(breakdowns: Breakdowns): DatasetId | undefined {
    if (breakdowns.geography === 'national') {
      if (breakdowns.hasOnlyRace())
        return 'bjs_incarceration_data-race_and_ethnicity_national'
      if (breakdowns.hasOnlyAge()) return 'bjs_incarceration_data-age_national'
      if (breakdowns.hasOnlySex()) return 'bjs_incarceration_data-sex_national'
    }
    if (breakdowns.geography === 'state') {
      if (breakdowns.hasOnlyRace())
        return 'bjs_incarceration_data-race_and_ethnicity_state'
      if (breakdowns.hasOnlyAge()) return 'bjs_incarceration_data-age_state'
      if (breakdowns.hasOnlySex()) return 'bjs_incarceration_data-sex_state'
    }

    if (breakdowns.geography === 'county') {
      if (breakdowns.hasOnlyRace())
        return 'vera_incarceration_county-by_race_and_ethnicity_county_time_series'
      if (breakdowns.hasOnlyAge())
        return 'vera_incarceration_county-by_age_county_time_series'
      if (breakdowns.hasOnlySex())
        return 'vera_incarceration_county-by_sex_county_time_series'
    }
  }

  async getDataInternal(
    metricQuery: MetricQuery,
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns
    const timeView = metricQuery.timeView
    const datasetId = this.getDatasetId(breakdowns)
    if (!datasetId) throw Error('DatasetId undefined')
    const specificDatasetId = appendFipsIfNeeded(datasetId, breakdowns)
    const dataSource = await getDataManager().loadDataset(specificDatasetId)
    let df = dataSource.toDataFrame()

    df = this.filterByGeo(df, breakdowns)

    const mostRecentYear = getMostRecentYearAsString(
      df,
      metricQuery.metricIds[0],
    )

    df = this.filterByTimeView(df, timeView, mostRecentYear)
    df = this.renameGeoColumns(df, breakdowns)

    const consumedDatasetIds = [datasetId]

    // everything uses ACS except county-level reports and territory-reports
    if (
      breakdowns.geography !== 'county' &&
      !breakdowns.filterFips?.isIslandArea()
    ) {
      const acsId = GetAcsDatasetId(breakdowns)
      acsId && consumedDatasetIds.push(acsId)
    }

    // National Level - Map of all states + territory bubbles
    if (breakdowns.geography === 'state' && !breakdowns.filterFips) {
      consumedDatasetIds.push(
        'decia_2020_territory_population-by_sex_territory_state_level',
      )
    }

    // Territory Level (Island Areas) - All cards
    if (breakdowns.filterFips?.isIslandArea()) {
      consumedDatasetIds.push(
        'decia_2020_territory_population-by_sex_territory_state_level',
      )
      // only time-series cards use decia 2010
      if (timeView === 'historical') {
        consumedDatasetIds.push(
          'decia_2010_territory_population-by_sex_territory_state_level',
        )
      }
    }

    df = this.applyDemographicBreakdownFilters(df, breakdowns)
    df = this.removeUnrequestedColumns(df, metricQuery)

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest =
      breakdowns.hasExactlyOneDemographic()

    return (
      (breakdowns.geography === 'national' ||
        breakdowns.geography === 'state' ||
        breakdowns.geography === 'county') &&
      validDemographicBreakdownRequest
    )
  }
}

export default IncarcerationProvider
