import {
  AGE_ADJUST_COVID_DEATHS_US_SETTING,
  AGE_ADJUST_COVID_HOSP_US_SETTING,
} from '../../utils/internalRoutes'
import type { DatasetId } from '../config/DatasetMetadata'
import type { DataTypeId } from '../config/MetricConfigTypes'
import type { ProviderId } from '../loading/VariableProviderMap'
import { dropRecentPartialMonth } from '../utils/DatasetTimeUtils'
import type { HetRow } from '../utils/DatasetTypes'
import { addAcsIdToConsumed } from '../utils/datasetutils'
import type { DataSourceConfig } from './UniversalProvider'
import UniversalProvider from './UniversalProvider'

// when alternate data types are available, provide a link to the national level, by race report for that data type
export const dataTypeLinkMap: Partial<Record<DataTypeId, string>> = {
  covid_deaths: AGE_ADJUST_COVID_DEATHS_US_SETTING,
  covid_hospitalizations: AGE_ADJUST_COVID_HOSP_US_SETTING,
}

const CDC_COVID_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'cdc_restricted_data' }),
  getConsumedDatasetIds: (mainId, metricQuery, breakdowns) => {
    const consumedDatasetIds: DatasetId[] = [mainId]
    const isIslandArea = breakdowns.filterFips?.isIslandArea()

    // TODO: this should be a reusable function that can work for all Providers
    if (isIslandArea) {
      if (breakdowns.hasOnlyRace()) {
        if (breakdowns.geography === 'state') {
          consumedDatasetIds.push(
            'decia_2020_territory_population-race_and_ethnicity_state_current',
          )
        }
        if (breakdowns.geography === 'county') {
          consumedDatasetIds.push(
            'decia_2020_territory_population-race_and_ethnicity_county_current',
          )
        }
      }
      if (breakdowns.hasOnlySex()) {
        if (breakdowns.geography === 'state') {
          consumedDatasetIds.push(
            'decia_2020_territory_population-sex_state_current',
          )
        }
        if (breakdowns.geography === 'county') {
          consumedDatasetIds.push(
            'decia_2020_territory_population-sex_county_current',
          )
        }
      }
      if (breakdowns.hasOnlyAge()) {
        if (breakdowns.geography === 'state') {
          consumedDatasetIds.push(
            'decia_2020_territory_population-age_state_current',
          )
        }
        if (breakdowns.geography === 'county') {
          consumedDatasetIds.push(
            'decia_2020_territory_population-age_county_current',
          )
        }
      }
    } else {
      addAcsIdToConsumed(metricQuery, consumedDatasetIds)
    }

    return consumedDatasetIds
  },
  allowsBreakdowns: (breakdowns) => breakdowns.hasExactlyOneDemographic(),
  transformRows: (rows, metricQuery) =>
    metricQuery.timeView === 'historical'
      ? dropRecentPartialMonth(rows)
      : (rows as HetRow[]),
}

const PROVIDER_ID: ProviderId = 'cdc_covid_provider'

class CdcCovidProvider extends UniversalProvider {
  constructor() {
    super(
      PROVIDER_ID,
      [
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
      ], // TODO: remove unused items here; migrate to a COVID_METRICS or similar like other providers
      CDC_COVID_CONFIG,
    )
  }
}

export default CdcCovidProvider
