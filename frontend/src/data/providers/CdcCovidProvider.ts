import type { IDataFrame } from 'data-forge'
import { getDataManager } from '../../utils/globals'
import {
  AGE_ADJUST_COVID_DEATHS_US_SETTING,
  AGE_ADJUST_COVID_HOSP_US_SETTING,
} from '../../utils/internalRoutes'
import type { DatasetId } from '../config/DatasetMetadata'
import type { DataTypeId } from '../config/MetricConfigTypes'
import type { Breakdowns, TimeView } from '../query/Breakdowns'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import { GetAcsDatasetId } from './AcsPopulationProvider'
import VariableProvider from './VariableProvider'

// when alternate data types are available, provide a link to the national level, by race report for that data type
export const dataTypeLinkMap: Partial<Record<DataTypeId, string>> = {
  covid_deaths: AGE_ADJUST_COVID_DEATHS_US_SETTING,
  covid_hospitalizations: AGE_ADJUST_COVID_HOSP_US_SETTING,
}
class CdcCovidProvider extends VariableProvider {
  constructor() {
    super('cdc_covid_provider', [
      'covid_cases',
      'covid_deaths',
      'covid_hosp',
      'covid_cases_share',
      'covid_deaths_share',
      'covid_hosp_share',
      'covid_cases_share_of_known',
      'covid_deaths_share_of_known',
      'covid_hosp_share_of_known',
      'covid_deaths_per_100k',
      'covid_cases_per_100k',
      'covid_hosp_per_100k',
      'death_ratio_age_adjusted',
      'hosp_ratio_age_adjusted',
      'cases_ratio_age_adjusted',
      'covid_population_pct',
      'covid_cases_pct_relative_inequity',
      'covid_deaths_pct_relative_inequity',
      'covid_hosp_pct_relative_inequity',
    ])
  }

  // ALERT! KEEP IN SYNC! Make sure you update data/config/DatasetMetadata AND data/config/MetadataMap.ts if you update dataset IDs
  getDatasetId(
    breakdowns: Breakdowns,
    dataTypeId?: DataTypeId,
    timeView?: TimeView,
  ): DatasetId | undefined {
    if (timeView === 'current') {
      if (breakdowns.hasOnlyRace()) {
        if (breakdowns.geography === 'county')
          return 'cdc_restricted_data-by_race_county_processed'
        if (breakdowns.geography === 'state')
          return 'cdc_restricted_data-by_race_state_processed-with_age_adjust'
        if (breakdowns.geography === 'national')
          return 'cdc_restricted_data-by_race_national_processed-with_age_adjust'
      }
      if (breakdowns.hasOnlyAge()) {
        if (breakdowns.geography === 'county')
          return 'cdc_restricted_data-by_age_county_processed'
        if (breakdowns.geography === 'state')
          return 'cdc_restricted_data-by_age_state_processed'
        if (breakdowns.geography === 'national')
          return 'cdc_restricted_data-by_age_national_processed'
      }
      if (breakdowns.hasOnlySex()) {
        if (breakdowns.geography === 'county')
          return 'cdc_restricted_data-by_sex_county_processed'
        if (breakdowns.geography === 'state')
          return 'cdc_restricted_data-by_sex_state_processed'
        if (breakdowns.geography === 'national')
          return 'cdc_restricted_data-by_sex_national_processed'
      }
    }
    if (timeView === 'historical') {
      if (breakdowns.hasOnlyRace()) {
        if (breakdowns.geography === 'county')
          return 'cdc_restricted_data-by_race_county_processed_time_series'
        if (breakdowns.geography === 'state')
          return 'cdc_restricted_data-by_race_state_processed_time_series'
        if (breakdowns.geography === 'national')
          return 'cdc_restricted_data-by_race_national_processed_time_series'
      }
      if (breakdowns.hasOnlyAge()) {
        if (breakdowns.geography === 'county')
          return 'cdc_restricted_data-by_age_county_processed_time_series'
        if (breakdowns.geography === 'state')
          return 'cdc_restricted_data-by_age_state_processed_time_series'
        if (breakdowns.geography === 'national')
          return 'cdc_restricted_data-by_age_national_processed_time_series'
      }
      if (breakdowns.hasOnlySex()) {
        if (breakdowns.geography === 'county')
          return 'cdc_restricted_data-by_sex_county_processed_time_series'
        if (breakdowns.geography === 'state')
          return 'cdc_restricted_data-by_sex_state_processed_time_series'
        if (breakdowns.geography === 'national')
          return 'cdc_restricted_data-by_sex_national_processed_time_series'
      }
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
    const covidDataset = await getDataManager().loadDataset(specificDatasetId)
    const consumedDatasetIds = [datasetId]
    let df = covidDataset.toDataFrame()

    // If requested, filter geography by state or county level. We apply the
    // geo filter right away to reduce subsequent calculation times.
    df = this.filterByGeo(df, breakdowns)

    if (df.toArray().length === 0) {
      return new MetricQueryResponse([], consumedDatasetIds)
    }
    df = this.renameGeoColumns(df, breakdowns)

    if (timeView === 'historical') {
      df = dropRecentPartialMonth(df)
    }

    /* We use DECIA_2020 populations OR ACS on the backend; add the correct id so footer is correct */
    const isIslandArea = breakdowns.filterFips?.isIslandArea()

    // TODO: this should be a reusable function that can work for all Providers, just like GetAcsDatasetId() does
    if (isIslandArea) {
      if (breakdowns.hasOnlyRace()) {
        if (breakdowns.geography === 'state') {
          consumedDatasetIds.push(
            'decia_2020_territory_population-by_race_and_ethnicity_territory_state_level',
          )
        }
        if (breakdowns.geography === 'county') {
          consumedDatasetIds.push(
            'decia_2020_territory_population-by_race_and_ethnicity_territory_county_level',
          )
        }
      }

      if (breakdowns.hasOnlySex()) {
        if (breakdowns.geography === 'state') {
          consumedDatasetIds.push(
            'decia_2020_territory_population-by_sex_territory_state_level',
          )
        }
        if (breakdowns.geography === 'county') {
          consumedDatasetIds.push(
            'decia_2020_territory_population-by_sex_territory_county_level',
          )
        }
      }

      if (breakdowns.hasOnlyAge()) {
        if (breakdowns.geography === 'state') {
          consumedDatasetIds.push(
            'decia_2020_territory_population-by_age_territory_state_level',
          )
        }
        if (breakdowns.geography === 'county') {
          consumedDatasetIds.push(
            'decia_2020_territory_population-by_age_territory_county_level',
          )
        }
      }
    } else {
      const acsId = GetAcsDatasetId(breakdowns)
      acsId && consumedDatasetIds.push(acsId)
    }

    df = this.applyDemographicBreakdownFilters(df, breakdowns)
    df = this.removeUnrequestedColumns(df, metricQuery)

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return breakdowns.hasExactlyOneDemographic()
  }
}
export default CdcCovidProvider

export function dropRecentPartialMonth(df: IDataFrame): IDataFrame {
  const partialMonth = getMostRecentMonth(df)
  return df.where((row) => row.time_period !== partialMonth)
}

function getMostRecentMonth(df: IDataFrame): string {
  // Convert YYYY-MM strings to Date objects
  const dates = df
    .getSeries('time_period')
    .toArray()
    .map((period) => new Date(`${period}-01`).getTime()) // Get timestamp

  // Find the maximum date
  const maxTimestamp = Math.max(...dates)
  const maxDate = new Date(maxTimestamp)

  // Convert the maximum date back to YYYY-MM format
  const year = maxDate.getUTCFullYear()
  const month = String(maxDate.getUTCMonth() + 1).padStart(2, '0') // getUTCMonth is zero-indexed
  return `${year}-${month}`
}
