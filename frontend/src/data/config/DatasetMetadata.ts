import type { DatasetMetadata } from '../utils/DatasetTypes'
import type { StateFipsCode } from '../utils/FipsData'
import { type DatasetIdAcs, DatasetMetadataMapAcs } from './DatasetMetadataAcs'
import { type DatasetIdAhr, DatasetMetadataMapAhr } from './DatasetMetadataAhr'
import { type DatasetIdChr, DatasetMetadataMapChr } from './DatasetMetadataChr'
import {
  type DatasetIdCommunitySafetyCategory,
  DatasetMetadataMapCommunitySafetyCategory,
} from './DatasetMetadataCommunitySafetyCategory'
import {
  type DatasetIdCovidCategory,
  DatasetMetadataMapCovidCategory,
} from './DatasetMetadataCovidCategory'
import {
  type DatasetIdHivCategory,
  DatasetMetadataMapHivCategory,
} from './DatasetMetadataHivCategory'
import {
  type DatasetIdMaternalHealthCategory,
  DatasetMetadataMapMaternalHealthCategory,
} from './DatasetMetadataMaternalHealthCategory'
import { GEOGRAPHIES_DATASET_ID } from './MetadataMap'

export type DatasetId =
  | DatasetIdAcs
  | DatasetIdHivCategory
  | DatasetIdMaternalHealthCategory
  | DatasetIdCommunitySafetyCategory
  | DatasetIdCovidCategory
  | DatasetIdAhr
  | DatasetIdChr
  | 'bjs_incarceration_data-age_national_current'
  | 'bjs_incarceration_data-age_state_current'
  | 'bjs_incarceration_data-race_and_ethnicity_national_current'
  | 'bjs_incarceration_data-race_and_ethnicity_state_current'
  | 'bjs_incarceration_data-sex_national_current'
  | 'bjs_incarceration_data-sex_state_current'
  | 'bjs_incarceration_data-alls_national_current'
  | 'bjs_incarceration_data-alls_state_current'
  | 'cawp_data-race_and_ethnicity_national_current'
  | 'cawp_data-race_and_ethnicity_state_current'
  | 'cawp_data-race_and_ethnicity_national_historical'
  | 'cawp_data-race_and_ethnicity_state_historical'
  | 'cawp_data-race_and_ethnicity_state_historical_names'
  | 'cdc_wonder_data-age_national_current'
  | 'cdc_wonder_data-age_national_historical'
  | 'cdc_wonder_data-age_state_current'
  | 'cdc_wonder_data-age_state_historical'
  | 'cdc_wonder_data-race_and_ethnicity_national_current'
  | 'cdc_wonder_data-race_and_ethnicity_national_historical'
  | 'cdc_wonder_data-race_and_ethnicity_state_current'
  | 'cdc_wonder_data-race_and_ethnicity_state_historical'
  | 'cdc_wonder_data-sex_national_current'
  | 'cdc_wonder_data-sex_national_historical'
  | 'cdc_wonder_data-sex_state_current'
  | 'cdc_wonder_data-sex_state_historical'
  | 'cdc_wonder_data-alls_national_current'
  | 'cdc_wonder_data-alls_national_historical'
  | 'cdc_wonder_data-alls_state_current'
  | 'cdc_wonder_data-alls_state_historical'
  | 'census_pop_estimates-race_and_ethnicity'
  | 'covid_tracking_project-cases_by_race_state'
  | 'covid_tracking_project-deaths_by_race_state'
  | 'covid_tracking_project-hospitalizations_by_race_state'
  | 'covid_tracking_project-tests_by_race_state'
  | 'decia_2010_territory_population-age_state_current'
  | 'decia_2010_territory_population-race_and_ethnicity_state_current'
  | 'decia_2010_territory_population-sex_state_current'
  | 'decia_2020_territory_population-age_county_current'
  | 'decia_2020_territory_population-age_state_current'
  | 'decia_2020_territory_population-race_and_ethnicity_county_current'
  | 'decia_2020_territory_population-race_and_ethnicity_state_current'
  | 'decia_2020_territory_population-sex_county_current'
  | 'decia_2020_territory_population-sex_state_current'
  | 'geographies'
  | 'geo_context-alls_national_current'
  | 'geo_context-alls_state_current'
  | 'geo_context-alls_county_current'
  | 'phrma_data-age_county_current'
  | 'phrma_data-age_national_current'
  | 'phrma_data-age_state_current'
  | 'phrma_data-eligibility_county_current'
  | 'phrma_data-eligibility_national_current'
  | 'phrma_data-eligibility_state_current'
  | 'phrma_data-lis_county_current'
  | 'phrma_data-lis_national_current'
  | 'phrma_data-lis_state_current'
  | 'phrma_data-race_and_ethnicity_county_current'
  | 'phrma_data-race_and_ethnicity_national_current'
  | 'phrma_data-race_and_ethnicity_state_current'
  | 'phrma_data-sex_county_current'
  | 'phrma_data-sex_national_current'
  | 'phrma_data-sex_state_current'
  | 'phrma_brfss_data-race_and_ethnicity_national_current-with_age_adjust'
  | 'phrma_brfss_data-age_national_current'
  | 'phrma_brfss_data-sex_national_current'
  | 'phrma_brfss_data-insurance_status_national_current'
  | 'phrma_brfss_data-income_national_current'
  | 'phrma_brfss_data-education_national_current'
  | 'phrma_brfss_data-race_and_ethnicity_state_current-with_age_adjust'
  | 'phrma_brfss_data-age_state_current'
  | 'phrma_brfss_data-sex_state_current'
  | 'phrma_brfss_data-insurance_status_state_current'
  | 'phrma_brfss_data-income_state_current'
  | 'phrma_brfss_data-education_state_current'
  | 'the_unitedstates_project'
  | 'vera_incarceration_county-age_county_current'
  | 'vera_incarceration_county-age_county_historical'
  | 'vera_incarceration_county-race_and_ethnicity_county_current'
  | 'vera_incarceration_county-race_and_ethnicity_county_historical'
  | 'vera_incarceration_county-sex_county_current'
  | 'vera_incarceration_county-sex_county_historical'
  | 'vera_incarceration_county-alls_county_current'
  | 'vera_incarceration_county-alls_county_historical'

export type DatasetIdWithStateFIPSCode = `${DatasetId}-${StateFipsCode}`

export const DatasetMetadataMap: Record<DatasetId, DatasetMetadata> = {
  ...DatasetMetadataMapAcs,
  ...DatasetMetadataMapHivCategory,
  ...DatasetMetadataMapMaternalHealthCategory,
  ...DatasetMetadataMapCommunitySafetyCategory,
  ...DatasetMetadataMapCovidCategory,
  ...DatasetMetadataMapAhr,
  ...DatasetMetadataMapChr,
  'cdc_wonder_data-age_national_current': {
    name: 'Cancer incidence by age, nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-age_national_historical': {
    name: 'Cancer incidence by age, nationally',
    original_data_sourced: '1999-2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-age_state_current': {
    name: 'Cancer incidence by age and state',
    original_data_sourced: '2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-age_state_historical': {
    name: 'Cancer incidence by age and state',
    original_data_sourced: '1999-2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-race_and_ethnicity_national_current': {
    name: 'Cancer incidence by race and ethnicity, nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-race_and_ethnicity_national_historical': {
    name: 'Cancer incidence by race and ethnicity, nationally',
    original_data_sourced: '1999-2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-race_and_ethnicity_state_current': {
    name: 'Cancer incidence by race and ethnicity and state',
    original_data_sourced: '2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-race_and_ethnicity_state_historical': {
    name: 'Cancer incidence by race and ethnicity and state',
    original_data_sourced: '1999-2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-sex_national_current': {
    name: 'Cancer incidence by sex, nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-sex_national_historical': {
    name: 'Cancer incidence by sex, nationally',
    original_data_sourced: '1999-2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-sex_state_current': {
    name: 'Cancer incidence by sex and state',
    original_data_sourced: '2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-sex_state_historical': {
    name: 'Cancer incidence by sex and state',
    original_data_sourced: '1999-2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-alls_national_current': {
    name: 'Cancer incidence, nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-alls_national_historical': {
    name: 'Cancer incidence, nationally',
    original_data_sourced: '1999-2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-alls_state_current': {
    name: 'Cancer incidence by state',
    original_data_sourced: '2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-alls_state_historical': {
    name: 'Cancer incidence by state',
    original_data_sourced: '1999-2021',
    source_id: 'cdc_wonder',
  },

  'decia_2010_territory_population-race_and_ethnicity_state_current': {
    name: 'Population by race/ethnicity and Census Island Area territory',
    original_data_sourced: '2010',
    source_id: 'decia_2010_territory_population',
  },
  'decia_2010_territory_population-sex_state_current': {
    name: 'Population by sex and Census Island Area territory',
    original_data_sourced: '2010',
    source_id: 'decia_2010_territory_population',
  },
  'decia_2010_territory_population-age_state_current': {
    name: 'Population by age and Census Island Area territory',
    original_data_sourced: '2010',
    source_id: 'decia_2010_territory_population',
  },
  'decia_2020_territory_population-race_and_ethnicity_state_current': {
    name: 'Population by race/ethnicity and Census Island Area territory',
    original_data_sourced: '2020',
    source_id: 'decia_2020_territory_population',
  },
  'decia_2020_territory_population-sex_state_current': {
    name: 'Population by sex and Census Island Area territory',
    original_data_sourced: '2020',
    source_id: 'decia_2020_territory_population',
  },
  'decia_2020_territory_population-age_state_current': {
    name: 'Population by age and Census Island Area territory',
    original_data_sourced: '2020',
    source_id: 'decia_2020_territory_population',
  },
  'decia_2020_territory_population-race_and_ethnicity_county_current': {
    name: 'Population by race/ethnicity and Census Island Area territory county-equivalent',
    original_data_sourced: '2020',
    source_id: 'decia_2020_territory_population',
  },
  'decia_2020_territory_population-sex_county_current': {
    name: 'Population by sex and Census Island Area territory county-equivalent',
    original_data_sourced: '2020',
    source_id: 'decia_2020_territory_population',
  },
  'decia_2020_territory_population-age_county_current': {
    name: 'Population by age and Census Island Area territory county-equivalent',
    original_data_sourced: '2020',
    source_id: 'decia_2020_territory_population',
  },
  'covid_tracking_project-cases_by_race_state': {
    name: 'COVID-19 cases by race/ethnicity and state',
    original_data_sourced: 'April 2021',
    source_id: 'covid_tracking_project',
  },
  'covid_tracking_project-deaths_by_race_state': {
    name: 'COVID-19 deaths by race/ethnicity and state',
    original_data_sourced: 'April 2021',
    source_id: 'covid_tracking_project',
  },
  'covid_tracking_project-hospitalizations_by_race_state': {
    name: 'COVID-19 hospitalizations by race/ethnicity and state',
    original_data_sourced: 'April 2021',
    source_id: 'covid_tracking_project',
  },
  'covid_tracking_project-tests_by_race_state': {
    name: 'COVID-19 tests by race/ethnicity and state',
    original_data_sourced: 'April 2021',
    source_id: 'covid_tracking_project',
  },

  'bjs_incarceration_data-age_national_current': {
    name: 'National rates of sentenced individuals under the jurisdiction of federal or state adult prison facilities, or confined in local adult jail facilities, by age',
    original_data_sourced: '2019 for jail, 2020 for prison',
    source_id: 'bjs',
  },
  'bjs_incarceration_data-age_state_current': {
    name: 'Rates of individuals under the jurisdiction of state or territory prison facilities, by state/territory (totals only), or confined in local adult jail facilities by age, by state/territory',
    original_data_sourced: '2019 for jail, 2020 for prison',
    source_id: 'bjs',
  },
  'bjs_incarceration_data-race_and_ethnicity_national_current': {
    name: 'National rates of individuals under the jurisdiction of federal or state adult prison facilities or confined in local adult jail facilities, by race/ethnicity',
    original_data_sourced: '2019 for jail, 2020 for prison',
    contains_nh: true,
    source_id: 'bjs',
  },
  'bjs_incarceration_data-race_and_ethnicity_state_current': {
    name: 'Rates of individuals under the jurisdiction of state or territory prison facilities or confined in local adult jail facilities, by race/ethnicity and state/territory',
    original_data_sourced: '2019 for jail, 2020 for prison',
    contains_nh: true,
    source_id: 'bjs',
  },
  'bjs_incarceration_data-sex_national_current': {
    name: 'National rates of individuals under the jurisdiction of federal or state adult prison facilities or confined in local adult jail facilities, by sex',
    original_data_sourced: '2019 for jail, 2020 for prison',
    source_id: 'bjs',
  },
  'bjs_incarceration_data-sex_state_current': {
    name: 'Rates of individuals under the jurisdiction of state or territory prison facilities or confined in local adult jail facilities, by sex and state/territory',
    original_data_sourced: '2019 for jail, 2020 for prison',
    source_id: 'bjs',
  },
  'bjs_incarceration_data-alls_national_current': {
    name: 'National rates of individuals under the jurisdiction of federal or state adult prison facilities or confined in local adult jail facilities',
    original_data_sourced: '2019 for jail, 2020 for prison',
    source_id: 'bjs',
  },
  'bjs_incarceration_data-alls_state_current': {
    name: 'Rates of individuals under the jurisdiction of state or territory prison facilities or confined in local adult jail facilities,  by state/territory',
    original_data_sourced: '2019 for jail, 2020 for prison',
    source_id: 'bjs',
  },
  'vera_incarceration_county-race_and_ethnicity_county_historical': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county. or confined in local adult jail facilities, by race/ethnicity',
    original_data_sourced: '1983-2016 for prison, 1970-2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'vera_incarceration_county-race_and_ethnicity_county_current': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county. or confined in local adult jail facilities, by race/ethnicity',
    original_data_sourced: '2016 for prison, 2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'vera_incarceration_county-age_county_historical': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county. or confined in local adult jail facilities, by age',
    original_data_sourced: '1983-2016 for prison, 1970-2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'vera_incarceration_county-age_county_current': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county. or confined in local adult jail facilities, by age',
    original_data_sourced: '2016 for prison, 2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'vera_incarceration_county-sex_county_historical': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county. or confined in local adult jail facilities, by sex',
    original_data_sourced: '1983-2016 for prison, 1970-2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'vera_incarceration_county-sex_county_current': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county. or confined in local adult jail facilities, by sex',
    original_data_sourced: '2016 for prison, 2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'vera_incarceration_county-alls_county_historical': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county. or confined in local adult jail facilities',
    original_data_sourced: '1983-2016 for prison, 1970-2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'vera_incarceration_county-alls_county_current': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county. or confined in local adult jail facilities',
    original_data_sourced: '2016 for prison, 2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'cawp_data-race_and_ethnicity_national_current': {
    name: 'Current, national representation of women by race/ethnicity in the U.S. Congress and state/territory legislatures',
    original_data_sourced: 'February 2025',
    source_id: 'cawp',
  },
  'cawp_data-race_and_ethnicity_state_current': {
    name: 'Current representation of women by race/ethnicity from each state and territory to the U.S. Congress and to their respective state/territory legislature',
    original_data_sourced: 'February 2025',
    source_id: 'cawp',
  },
  'cawp_data-race_and_ethnicity_national_historical': {
    name: 'National representation of women by race/ethnicity in the U.S. Congress and state/territory legislatures, over time',
    original_data_sourced:
      '1915-2025 for Congress, 1983-2025 for state/territory legislatures',
    source_id: 'cawp',
  },
  'cawp_data-race_and_ethnicity_state_historical': {
    name: 'Representation of women by race/ethnicity from each state and territory to the U.S. Congress and to their respective state/territory legislature over time',
    original_data_sourced:
      '1915-2025 for Congress, 1983-2025 for state/territory legislatures',
    source_id: 'cawp',
  },
  'cawp_data-race_and_ethnicity_state_historical_names': {
    name: 'By-state and by-territory lists of legislator names, yearly back to 1915 including: all members of U.S Congress, regardless of race or gender; all women members of U.S. Congress, by race/ethnicity; and all women members of state and territory legislatures, by race/ethnicity',
    original_data_sourced:
      '1915-2025 for Congress, 1983-2025 for state/territory legislatures',
    source_id: 'cawp',
  },

  the_unitedstates_project: {
    name: '@unitedstates is a shared commons of data and tools for the United States. Made by the public, used by the public. Featuring work from people with the Sunlight Foundation, GovTrack.us, the New York Times, the Electronic Frontier Foundation, and the internet.',
    original_data_sourced: '1915-2025',
    source_id: 'the_unitedstates_project',
  },
  'geo_context-alls_national_current': {
    name: 'Population from ACS nationally',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'geo_context-alls_state_current': {
    name: 'Population from ACS by state',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'geo_context-alls_county_current': {
    name: 'SVI from CDC, Population from ACS by county',
    original_data_sourced: '2022',
    source_id: 'geo_context',
  },
  [GEOGRAPHIES_DATASET_ID]: {
    name: 'U.S. Geographic Data',
    original_data_sourced: '2023',
    source_id: 'geographies_source',
  },
  'census_pop_estimates-race_and_ethnicity': {
    name: 'Census County Population by Characteristics: 2010-2019',
    original_data_sourced: '2019',
    contains_nh: true,
    source_id: 'census_pop_estimates',
  },
  'phrma_data-race_and_ethnicity_national_current': {
    name: 'medicare adherence by race/ethnicity, nationally',
    original_data_sourced: '2020',
    contains_nh: true,
    source_id: 'phrma',
  },
  'phrma_data-race_and_ethnicity_state_current': {
    name: 'medicare adherence by race/ethnicity, by state',
    original_data_sourced: '2020',
    contains_nh: true,
    source_id: 'phrma',
  },
  'phrma_data-race_and_ethnicity_county_current': {
    name: 'medicare adherence by race/ethnicity, by county',
    original_data_sourced: '2020',
    contains_nh: true,
    source_id: 'phrma',
  },
  'phrma_data-age_national_current': {
    name: 'medicare adherence by age, nationally',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-age_state_current': {
    name: 'medicare adherence by age, by state',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-age_county_current': {
    name: 'medicare adherence by age, by county',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-sex_national_current': {
    name: 'medicare adherence by sex, nationally',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-sex_state_current': {
    name: 'medicare adherence by sex, by state',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-sex_county_current': {
    name: 'medicare adherence by sex, by county',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-lis_national_current': {
    name: 'medicare adherence by low income subsidy status (LIS), nationally',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-lis_state_current': {
    name: 'medicare adherence by low income subsidy (LIS), by state',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-lis_county_current': {
    name: 'medicare adherence by low income subsidy (LIS), by county',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-eligibility_national_current': {
    name: 'medicare adherence by Medicare eligibility reason, nationally',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-eligibility_state_current': {
    name: 'medicare adherence by Medicare eligibility reason, by state',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-eligibility_county_current': {
    name: 'medicare adherence by Medicare eligibility reason, by county',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_brfss_data-race_and_ethnicity_national_current-with_age_adjust': {
    name: 'Screening adherence breast, prostate, lung, colorectal, and cervical cancers, by race/ethnicity, nationally',
    original_data_sourced: '2022',
    contains_nh: true,
    source_id: 'phrma_brfss',
  },
  'phrma_brfss_data-age_national_current': {
    name: 'Screening adherence breast, prostate, lung, colorectal, and cervical cancers, by age, nationally',
    original_data_sourced: '2022',
    contains_nh: true,
    source_id: 'phrma_brfss',
  },
  'phrma_brfss_data-sex_national_current': {
    name: 'Screening adherence for colorectal and lung cancers, by sex, nationally',
    original_data_sourced: '2022',
    contains_nh: true,
    source_id: 'phrma_brfss',
  },
  'phrma_brfss_data-insurance_status_national_current': {
    name: 'Screening adherence breast, prostate, lung, colorectal, and cervical cancers, by insurance status, nationally',
    original_data_sourced: '2022',
    contains_nh: true,
    source_id: 'phrma_brfss',
  },
  'phrma_brfss_data-income_national_current': {
    name: 'Screening adherence breast, prostate, lung, colorectal, and cervical cancers, by income, nationally',
    original_data_sourced: '2022',
    contains_nh: true,
    source_id: 'phrma_brfss',
  },
  'phrma_brfss_data-education_national_current': {
    name: 'Screening adherence breast, prostate, lung, colorectal, and cervical cancers, by education, nationally',
    original_data_sourced: '2022',
    contains_nh: true,
    source_id: 'phrma_brfss',
  },
  'phrma_brfss_data-race_and_ethnicity_state_current-with_age_adjust': {
    name: 'Screening adherence breast, prostate, lung, colorectal, and cervical cancers, by race/ethnicity, by state',
    original_data_sourced: '2022',
    contains_nh: true,
    source_id: 'phrma_brfss',
  },
  'phrma_brfss_data-age_state_current': {
    name: 'Screening adherence breast, prostate, lung, colorectal, and cervical cancers, by age, by state',
    original_data_sourced: '2022',
    contains_nh: true,
    source_id: 'phrma_brfss',
  },
  'phrma_brfss_data-sex_state_current': {
    name: 'Screening adherence for colorectal and lung cancers, by sex, by state',
    original_data_sourced: '2022',
    contains_nh: true,
    source_id: 'phrma_brfss',
  },
  'phrma_brfss_data-insurance_status_state_current': {
    name: 'Screening adherence breast, prostate, lung, colorectal, and cervical cancers, by insurance status, by state',
    original_data_sourced: '2022',
    contains_nh: true,
    source_id: 'phrma_brfss',
  },
  'phrma_brfss_data-income_state_current': {
    name: 'Screening adherence breast, prostate, lung, colorectal, and cervical cancers, by income, by state',
    original_data_sourced: '2022',
    contains_nh: true,
    source_id: 'phrma_brfss',
  },
  'phrma_brfss_data-education_state_current': {
    name: 'Screening adherence breast, prostate, lung, colorectal, and cervical cancers, by education, by state',
    original_data_sourced: '2022',
    contains_nh: true,
    source_id: 'phrma_brfss',
  },
}

export function isValidDatasetId(id: string): id is DatasetId {
  return id in DatasetMetadataMap
}
