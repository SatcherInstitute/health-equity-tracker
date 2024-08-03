import type { DatasetMetadata } from '../utils/DatasetTypes'
import type { StateFipsCode } from '../utils/FipsData'
import { GEOGRAPHIES_DATASET_ID } from './MetadataMap'

export type DatasetId =
  | 'acs_condition-by_race_county_historical'
  | 'acs_condition-by_race_county_current'
  | 'acs_condition-by_race_state_historical'
  | 'acs_condition-by_race_state_current'
  | 'acs_condition-by_race_national_historical'
  | 'acs_condition-by_race_national_current'
  | 'acs_condition-by_age_county_historical'
  | 'acs_condition-by_age_county_current'
  | 'acs_condition-by_age_state_historical'
  | 'acs_condition-by_age_state_current'
  | 'acs_condition-by_age_national_historical'
  | 'acs_condition-by_age_national_current'
  | 'acs_condition-by_sex_county_historical'
  | 'acs_condition-by_sex_county_current'
  | 'acs_condition-by_sex_state_historical'
  | 'acs_condition-by_sex_state_current'
  | 'acs_condition-by_sex_national_historical'
  | 'acs_condition-by_sex_national_current'
  | 'acs_population-by_age_county'
  | 'acs_population-by_age_national'
  | 'acs_population-by_age_state'
  | 'acs_population-by_race_county'
  | 'acs_population-by_race_national'
  | 'acs_population-by_race_state'
  | 'acs_population-by_sex_county'
  | 'acs_population-by_sex_national'
  | 'acs_population-by_sex_state'
  | 'graphql_ahr_data-behavioral_health_age_national_current'
  | 'graphql_ahr_data-behavioral_health_age_state_current'
  | 'graphql_ahr_data-behavioral_health_race_and_ethnicity_national_current'
  | 'graphql_ahr_data-behavioral_health_race_and_ethnicity_state_current'
  | 'graphql_ahr_data-behavioral_health_sex_national_current'
  | 'graphql_ahr_data-behavioral_health_sex_state_current'
  | 'graphql_ahr_data-non-behavioral_health_age_national_current'
  | 'graphql_ahr_data-non-behavioral_health_age_state_current'
  | 'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_national_current'
  | 'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_state_current'
  | 'graphql_ahr_data-non-behavioral_health_sex_national_current'
  | 'graphql_ahr_data-non-behavioral_health_sex_state_current'
  | 'bjs_incarceration_data-age_national'
  | 'bjs_incarceration_data-age_state'
  | 'bjs_incarceration_data-race_and_ethnicity_national'
  | 'bjs_incarceration_data-race_and_ethnicity_state'
  | 'bjs_incarceration_data-sex_national'
  | 'bjs_incarceration_data-sex_state'
  | 'cawp_time_data-race_and_ethnicity_national_current'
  | 'cawp_time_data-race_and_ethnicity_state_current'
  | 'cawp_time_data-race_and_ethnicity_national_historical'
  | 'cawp_time_data-race_and_ethnicity_state_historical'
  | 'cawp_time_data-race_and_ethnicity_state_historical_names'
  | 'cdc_hiv_data-age_county_current'
  | 'cdc_hiv_data-age_national_current'
  | 'cdc_hiv_data-age_state_current'
  | 'cdc_hiv_data-black_women_national_current'
  | 'cdc_hiv_data-black_women_state_current'
  | 'cdc_hiv_data-race_and_ethnicity_county_current'
  | 'cdc_hiv_data-race_and_ethnicity_national_current-with_age_adjust'
  | 'cdc_hiv_data-race_and_ethnicity_national_current'
  | 'cdc_hiv_data-race_and_ethnicity_state_current-with_age_adjust'
  | 'cdc_hiv_data-race_and_ethnicity_state_current'
  | 'cdc_hiv_data-sex_county_current'
  | 'cdc_hiv_data-sex_national_current'
  | 'cdc_hiv_data-sex_state_current'
  | 'cdc_hiv_data-age_county_historical'
  | 'cdc_hiv_data-age_national_historical'
  | 'cdc_hiv_data-age_state_historical'
  | 'cdc_hiv_data-black_women_national_historical'
  | 'cdc_hiv_data-black_women_state_historical'
  | 'cdc_hiv_data-race_and_ethnicity_county_historical'
  | 'cdc_hiv_data-race_and_ethnicity_national_historical'
  | 'cdc_hiv_data-race_and_ethnicity_state_historical'
  | 'cdc_hiv_data-sex_county_historical'
  | 'cdc_hiv_data-sex_national_historical'
  | 'cdc_hiv_data-sex_state_historical'
  | 'cdc_restricted_data-by_age_county_processed_time_series'
  | 'cdc_restricted_data-by_age_county_processed'
  | 'cdc_restricted_data-by_age_national_processed_time_series'
  | 'cdc_restricted_data-by_age_national_processed'
  | 'cdc_restricted_data-by_age_state_processed_time_series'
  | 'cdc_restricted_data-by_age_state_processed'
  | 'cdc_restricted_data-by_race_county_processed_time_series'
  | 'cdc_restricted_data-by_race_county_processed'
  | 'cdc_restricted_data-by_race_national_processed_time_series'
  | 'cdc_restricted_data-by_race_national_processed-with_age_adjust'
  | 'cdc_restricted_data-by_race_state_processed_time_series'
  | 'cdc_restricted_data-by_race_state_processed-with_age_adjust'
  | 'cdc_restricted_data-by_sex_county_processed_time_series'
  | 'cdc_restricted_data-by_sex_county_processed'
  | 'cdc_restricted_data-by_sex_national_processed_time_series'
  | 'cdc_restricted_data-by_sex_national_processed'
  | 'cdc_restricted_data-by_sex_state_processed_time_series'
  | 'cdc_restricted_data-by_sex_state_processed'
  | 'cdc_vaccination_county-alls_county'
  | 'cdc_vaccination_national-age_processed' // TODO: rm "processed" on the backend and use the actual geography "national"
  | 'cdc_vaccination_national-race_processed' // TODO: rm "processed" on the backend and use the actual geography "national"
  | 'cdc_vaccination_national-sex_processed' // TODO: rm "processed" on the backend and use the actual geography "national"
  | 'cdc_wisqars_data-age_national_current'
  | 'cdc_wisqars_data-age_national_historical'
  | 'cdc_wisqars_data-age_state_current'
  | 'cdc_wisqars_data-age_state_historical'
  | 'cdc_wisqars_data-race_and_ethnicity_national_current'
  | 'cdc_wisqars_data-race_and_ethnicity_national_historical'
  | 'cdc_wisqars_data-race_and_ethnicity_state_current'
  | 'cdc_wisqars_data-race_and_ethnicity_state_historical'
  | 'cdc_wisqars_data-sex_national_current'
  | 'cdc_wisqars_data-sex_national_historical'
  | 'cdc_wisqars_data-sex_state_current'
  | 'cdc_wisqars_data-sex_state_historical'
  | 'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_national_current'
  | 'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_national_historical'
  | 'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_state_current'
  | 'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_state_historical'
  | 'cdc_wisqars_black_men_data-black_men_by_urbanicity_national_current'
  | 'cdc_wisqars_black_men_data-black_men_by_urbanicity_state_current'
  | 'cdc_wisqars_black_men_data-black_men_by_urbanicity_national_historical'
  | 'cdc_wisqars_black_men_data-black_men_by_urbanicity_state_historical'
  | 'cdc_wisqars_black_men_data-black_men_by_age_national_current'
  | 'cdc_wisqars_black_men_data-black_men_by_age_state_current'
  | 'cdc_wisqars_black_men_data-black_men_by_age_national_historical'
  | 'cdc_wisqars_black_men_data-black_men_by_age_state_historical'
  | 'census_pop_estimates-race_and_ethnicity'
  | 'chr_data-race_and_ethnicity_county_current'
  | 'covid_tracking_project-cases_by_race_state'
  | 'covid_tracking_project-deaths_by_race_state'
  | 'covid_tracking_project-hospitalizations_by_race_state'
  | 'covid_tracking_project-tests_by_race_state'
  | 'decia_2010_territory_population-by_age_territory_state_level'
  | 'decia_2010_territory_population-by_race_and_ethnicity_territory_state_level'
  | 'decia_2010_territory_population-by_sex_territory_state_level'
  | 'decia_2020_territory_population-by_age_territory_county_level'
  | 'decia_2020_territory_population-by_age_territory_state_level'
  | 'decia_2020_territory_population-by_race_and_ethnicity_territory_county_level'
  | 'decia_2020_territory_population-by_race_and_ethnicity_territory_state_level'
  | 'decia_2020_territory_population-by_sex_territory_county_level'
  | 'decia_2020_territory_population-by_sex_territory_state_level'
  | 'geographies'
  | 'geo_context-national'
  | 'geo_context-state'
  | 'geo_context-county'
  | 'kff_vaccination-alls_state'
  | 'kff_vaccination-race_and_ethnicity_state'
  | 'maternal_mortality_data-by_race_national_current'
  | 'maternal_mortality_data-by_race_national_historical'
  | 'maternal_mortality_data-by_race_state_current'
  | 'maternal_mortality_data-by_race_state_historical'
  | 'phrma_data-age_county'
  | 'phrma_data-age_national'
  | 'phrma_data-age_state'
  | 'phrma_data-eligibility_county'
  | 'phrma_data-eligibility_national'
  | 'phrma_data-eligibility_state'
  | 'phrma_data-lis_county'
  | 'phrma_data-lis_national'
  | 'phrma_data-lis_state'
  | 'phrma_data-race_and_ethnicity_county'
  | 'phrma_data-race_and_ethnicity_national'
  | 'phrma_data-race_and_ethnicity_state'
  | 'phrma_data-sex_county'
  | 'phrma_data-sex_national'
  | 'phrma_data-sex_state'
  | 'the_unitedstates_project'
  | 'vera_incarceration_county-by_age_county_time_series'
  | 'vera_incarceration_county-by_race_and_ethnicity_county_time_series'
  | 'vera_incarceration_county-by_sex_county_time_series'

export type DatasetIdWithStateFIPSCode = `${DatasetId}-${StateFipsCode}`

export const DatasetMetadataMap: Record<DatasetId, DatasetMetadata> = {
  'acs_population-by_race_county': {
    name: 'Population by race/ethnicity and county',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'acs_population-by_race_state': {
    name: 'Population by race/ethnicity and state',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'acs_population-by_race_national': {
    name: 'Population by race/ethnicity nationally',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'acs_population-by_age_county': {
    name: 'Population by age and county',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'acs_population-by_age_state': {
    name: 'Population by age and state',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'acs_population-by_age_national': {
    name: 'Population by age nationally',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'acs_population-by_sex_county': {
    name: 'Population by sex and county',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'acs_population-by_sex_state': {
    name: 'Population by sex and state',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'acs_population-by_sex_national': {
    name: 'Population by sex nationally',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'cdc_hiv_data-race_and_ethnicity_county_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by race/ethnicity and county',
    original_data_sourced: '2008-2021',
    contains_nh: true,
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-race_and_ethnicity_state_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by race/ethnicity and state',
    original_data_sourced: '2008-2021',
    contains_nh: true,
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-race_and_ethnicity_national_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by race/ethnicity nationally',
    original_data_sourced: '2008-2021',
    contains_nh: true,
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-age_county_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by age and county',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-age_state_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by age and state',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-age_national_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by age nationally',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-sex_county_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by sex and county',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-sex_state_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by sex and state',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-sex_national_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by sex nationally',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-black_women_state_historical': {
    name: 'Yearly HIV diagnoses, deaths, and prevalence for Black women, by age, by state',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-black_women_national_historical': {
    name: 'Yearly HIV diagnoses, deaths, and prevalence for Black women, by age, nationally',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-race_and_ethnicity_county_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by race/ethnicity and county',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-race_and_ethnicity_state_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by race/ethnicity and state',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-race_and_ethnicity_national_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by race/ethnicity nationally',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-race_and_ethnicity_state_current-with_age_adjust': {
    name: 'Age-adjusted HIV deaths and crude rates for HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by race/ethnicity and state',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-race_and_ethnicity_national_current-with_age_adjust': {
    name: 'Age-adjusted HIV deaths and crude rates for HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by race/ethnicity nationally',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-age_county_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by age and county',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-age_state_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by age and state',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-age_national_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by age nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-sex_county_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by sex and county',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-sex_state_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by sex and state',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-sex_national_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by sex nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-black_women_state_current': {
    name: 'HIV diagnoses, deaths, and prevalence for Black women, by age, by state',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-black_women_national_current': {
    name: 'HIV diagnoses, deaths, and prevalence for Black women, by age, nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'decia_2010_territory_population-by_race_and_ethnicity_territory_state_level':
    {
      name: 'Population by race/ethnicity and Census Island Area territory',
      original_data_sourced: '2010',
      source_id: 'decia_2010_territory_population',
    },
  'decia_2010_territory_population-by_sex_territory_state_level': {
    name: 'Population by sex and Census Island Area territory',
    original_data_sourced: '2010',
    source_id: 'decia_2010_territory_population',
  },
  'decia_2010_territory_population-by_age_territory_state_level': {
    name: 'Population by age and Census Island Area territory',
    original_data_sourced: '2010',
    source_id: 'decia_2010_territory_population',
  },
  'decia_2020_territory_population-by_race_and_ethnicity_territory_state_level':
    {
      name: 'Population by race/ethnicity and Census Island Area territory',
      original_data_sourced: '2020',
      source_id: 'decia_2020_territory_population',
    },
  'decia_2020_territory_population-by_sex_territory_state_level': {
    name: 'Population by sex and Census Island Area territory',
    original_data_sourced: '2020',
    source_id: 'decia_2020_territory_population',
  },
  'decia_2020_territory_population-by_age_territory_state_level': {
    name: 'Population by age and Census Island Area territory',
    original_data_sourced: '2020',
    source_id: 'decia_2020_territory_population',
  },
  'decia_2020_territory_population-by_race_and_ethnicity_territory_county_level':
    {
      name: 'Population by race/ethnicity and Census Island Area territory county-equivalent',
      original_data_sourced: '2020',
      source_id: 'decia_2020_territory_population',
    },
  'decia_2020_territory_population-by_sex_territory_county_level': {
    name: 'Population by sex and Census Island Area territory county-equivalent',
    original_data_sourced: '2020',
    source_id: 'decia_2020_territory_population',
  },
  'decia_2020_territory_population-by_age_territory_county_level': {
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
  'acs_condition-by_age_county_historical': {
    name: 'Health insurance and poverty, yearly, by age and county',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-by_age_state_historical': {
    name: 'Health insurance and poverty, yearly, by age and state',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-by_age_national_historical': {
    name: 'Health insurance and poverty, yearly, by age at the national level',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-by_sex_county_historical': {
    name: 'Health insurance and poverty, yearly, by sex and county',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-by_sex_state_historical': {
    name: 'Health insurance and poverty, yearly, by sex and state',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-by_sex_national_historical': {
    name: 'Health insurance and poverty, yearly, by sex at the national level',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-by_race_county_historical': {
    name: 'Health insurance and poverty, yearly, by race and county',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-by_race_state_historical': {
    name: 'Health insurance and poverty, yearly, by race and state',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-by_race_national_historical': {
    name: 'Health insurance and poverty, yearly, by race at the national level',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-by_age_county_current': {
    name: 'Health insurance and poverty, yearly, by age and county',
    original_data_sourced: '2022',
    source_id: 'acs',
  },

  'acs_condition-by_age_state_current': {
    name: 'Health insurance and poverty, yearly, by age and state',
    original_data_sourced: '2022',
    source_id: 'acs',
  },

  'acs_condition-by_age_national_current': {
    name: 'Health insurance and poverty, yearly, by age at the national level',
    original_data_sourced: '2022',
    source_id: 'acs',
  },

  'acs_condition-by_sex_county_current': {
    name: 'Health insurance and poverty, yearly, by sex and county',
    original_data_sourced: '2022',
    source_id: 'acs',
  },

  'acs_condition-by_sex_state_current': {
    name: 'Health insurance and poverty, yearly, by sex and state',
    original_data_sourced: '2022',
    source_id: 'acs',
  },

  'acs_condition-by_sex_national_current': {
    name: 'Health insurance and poverty, yearly, by sex at the national level',
    original_data_sourced: '2022',
    source_id: 'acs',
  },

  'acs_condition-by_race_county_current': {
    name: 'Health insurance and poverty, yearly, by race and county',
    original_data_sourced: '2022',
    source_id: 'acs',
  },

  'acs_condition-by_race_state_current': {
    name: 'Health insurance and poverty, yearly, by race and state',
    original_data_sourced: '2022',
    source_id: 'acs',
  },

  'acs_condition-by_race_national_current': {
    name: 'Health insurance and poverty, yearly, by race at the national level',
    original_data_sourced: '2022',
    source_id: 'acs',
  },

  'cdc_restricted_data-by_race_county_processed_time_series': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by race/ethnicity and county',
    original_data_sourced: 'January 2020 - May 2024',
    contains_nh: true,
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-by_race_state_processed_time_series': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by race/ethnicity and state',
    original_data_sourced: 'January 2020 - May 2024',
    contains_nh: true,
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-by_race_national_processed_time_series': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by race/ethnicity, nationally',
    original_data_sourced: 'January 2020 - May 2024',
    contains_nh: true,
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-by_age_county_processed_time_series': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by age and county',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-by_age_state_processed_time_series': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by age and state',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-by_age_national_processed_time_series': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by age, nationally',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-by_sex_county_processed_time_series': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by sex and county',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-by_sex_state_processed_time_series': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by sex and state',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-by_sex_national_processed_time_series': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by sex, nationally',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-by_race_county_processed': {
    name: 'COVID-19 deaths, cases, and hospitalizations since January 2020 by race/ethnicity and county',
    original_data_sourced: 'January 2020 - May 2024',
    contains_nh: true,
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-by_race_state_processed-with_age_adjust': {
    name: 'COVID-19 deaths, cases, and hospitalizations with age-adjusted ratios since January 2020 by race/ethnicity and state',
    original_data_sourced: 'January 2020 - May 2024',
    contains_nh: true,
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-by_race_national_processed-with_age_adjust': {
    name: 'COVID-19 deaths, cases, and hospitalizations with age-adjusted ratios since January 2020 by race/ethnicity, nationally',
    original_data_sourced: 'January 2020 - May 2024',
    contains_nh: true,
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-by_age_county_processed': {
    name: 'COVID-19 deaths, cases, and hospitalizations since January 2020 by age and county',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-by_age_state_processed': {
    name: 'COVID-19 deaths, cases, and hospitalizations since January 2020 by age and state',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-by_age_national_processed': {
    name: 'COVID-19 deaths, cases, and hospitalizations since January 2020 by age, nationally',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-by_sex_county_processed': {
    name: 'COVID-19 deaths, cases, and hospitalizations since January 2020 by sex and county',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-by_sex_state_processed': {
    name: 'COVID-19 deaths, cases, and hospitalizations since January 2020 by sex and state',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-by_sex_national_processed': {
    name: 'COVID-19 deaths, cases, and hospitalizations since January 2020 by sex, nationally',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_vaccination_county-alls_county': {
    name: 'COVID-19 vaccinations by county',
    contains_nh: true,
    original_data_sourced: 'March 2023',
    source_id: 'cdc_vaccination_county',
  },
  'cdc_vaccination_national-age_processed': {
    name: 'COVID-19 vaccinations by age, nationally',
    original_data_sourced: 'March 2023',
    source_id: 'cdc_vaccination_national',
  },
  'cdc_vaccination_national-sex_processed': {
    name: 'COVID-19 vaccinations by sex, nationally',
    original_data_sourced: 'March 2023',
    source_id: 'cdc_vaccination_national',
  },
  'cdc_vaccination_national-race_processed': {
    name: 'COVID-19 vaccinations by race and ethnicity, nationally',
    original_data_sourced: 'March 2023',
    contains_nh: true,
    source_id: 'cdc_vaccination_national',
  },
  'kff_vaccination-race_and_ethnicity_state': {
    name: 'COVID-19 vaccinations by race and ethnicity by state/territory',
    original_data_sourced: 'July 2022',
    contains_nh: true,
    source_id: 'kff_vaccination',
  },
  'kff_vaccination-alls_state': {
    name: 'COVID-19 vaccinations by state/territory',
    original_data_sourced: 'July 2022',
    contains_nh: true,
    source_id: 'kff_vaccination',
  },
  'graphql_ahr_data-behavioral_health_age_national_current': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by age, nationally',
    original_data_sourced: '2021',
    source_id: 'ahr',
  },
  'graphql_ahr_data-behavioral_health_race_and_ethnicity_national_current': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by race/ethnicity, nationally',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'ahr',
  },
  'graphql_ahr_data-behavioral_health_sex_national_current': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by sex, nationally',
    original_data_sourced: '2021',
    source_id: 'ahr',
  },
  'graphql_ahr_data-behavioral_health_age_state_current': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by age and state',
    original_data_sourced: '2021',
    source_id: 'ahr',
  },
  'graphql_ahr_data-behavioral_health_race_and_ethnicity_state_current': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by race/ethnicity and state',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'ahr',
  },
  'graphql_ahr_data-behavioral_health_sex_state_current': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by sex and state',
    original_data_sourced: '2021',
    source_id: 'ahr',
  },
  'graphql_ahr_data-non-behavioral_health_age_national_current': {
    name: 'Prevalence of multiple behavioral and mental health conditions by age, nationally',
    original_data_sourced: '2021',
    source_id: 'ahr',
  },
  'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_national_current':
    {
      name: 'Prevalence of multiple behavioral and mental health conditions by race/ethnicity, nationally',
      original_data_sourced: '2021',
      contains_nh: true,
      source_id: 'ahr',
    },
  'graphql_ahr_data-non-behavioral_health_sex_national_current': {
    name: 'Prevalence of multiple behavioral and mental health conditions by sex, nationally',
    original_data_sourced: '2021',
    source_id: 'ahr',
  },
  'graphql_ahr_data-non-behavioral_health_age_state_current': {
    name: 'Prevalence of multiple behavioral and mental health conditions by age and state',
    original_data_sourced: '2021',
    source_id: 'ahr',
  },
  'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_state_current': {
    name: 'Prevalence of multiple behavioral and mental health conditions by race/ethnicity and state',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'ahr',
  },
  'graphql_ahr_data-non-behavioral_health_sex_state_current': {
    name: 'Prevalence of multiple behavioral and mental health conditions by sex and state',
    original_data_sourced: '2021',
    source_id: 'ahr',
  },
  'bjs_incarceration_data-age_national': {
    name: 'National rates of sentenced individuals under the jurisdiction of federal or state adult prison facilities, or confined in local adult jail facilities, by age',
    original_data_sourced: '2019 for jail, 2020 for prison',
    source_id: 'bjs',
  },
  'bjs_incarceration_data-age_state': {
    name: 'Rates of individuals under the jurisdiction of state or territory prison facilities, by state/territory (totals only), or confined in local adult jail facilities by age, by state/territory',
    original_data_sourced: '2019 for jail, 2020 for prison',
    source_id: 'bjs',
  },
  'bjs_incarceration_data-race_and_ethnicity_national': {
    name: 'National rates of individuals under the jurisdiction of federal or state adult prison facilities or confined in local adult jail facilities, by race/ethnicity',
    original_data_sourced: '2019 for jail, 2020 for prison',
    contains_nh: true,
    source_id: 'bjs',
  },
  'bjs_incarceration_data-race_and_ethnicity_state': {
    name: 'Rates of individuals under the jurisdiction of state or territory prison facilities or confined in local adult jail facilities, by race/ethnicity and state/territory',
    original_data_sourced: '2019 for jail, 2020 for prison',
    contains_nh: true,
    source_id: 'bjs',
  },
  'bjs_incarceration_data-sex_national': {
    name: 'National rates of individuals under the jurisdiction of federal or state adult prison facilities or confined in local adult jail facilities, by sex',
    original_data_sourced: '2019 for jail, 2020 for prison',
    source_id: 'bjs',
  },
  'bjs_incarceration_data-sex_state': {
    name: 'Rates of individuals under the jurisdiction of state or territory prison facilities or confined in local adult jail facilities, by sex and state/territory',
    original_data_sourced: '2019 for jail, 2020 for prison',
    source_id: 'bjs',
  },
  'vera_incarceration_county-by_race_and_ethnicity_county_time_series': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county. or confined in local adult jail facilities, by race/ethnicity',
    original_data_sourced: '1983-2016 for prison, 1970-2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'vera_incarceration_county-by_age_county_time_series': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county. or confined in local adult jail facilities, by age',
    original_data_sourced: '1983-2016 for prison, 1970-2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'vera_incarceration_county-by_sex_county_time_series': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county. or confined in local adult jail facilities, by sex',
    original_data_sourced: '1983-2016 for prison, 1970-2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'cawp_time_data-race_and_ethnicity_national_current': {
    name: 'Current, national representation of women by race/ethnicity in the U.S. Congress and state/territory legislatures',
    original_data_sourced: 'February 2024',
    source_id: 'cawp',
  },
  'cawp_time_data-race_and_ethnicity_state_current': {
    name: 'Current representation of women by race/ethnicity from each state and territory to the U.S. Congress and to their respective state/territory legislature',
    original_data_sourced: 'February 2024',
    source_id: 'cawp',
  },
  'cawp_time_data-race_and_ethnicity_national_historical': {
    name: 'National representation of women by race/ethnicity in the U.S. Congress and state/territory legislatures, over time',
    original_data_sourced:
      '1915-2023 for Congress, 1983-2023 for state/territory legislatures',
    source_id: 'cawp',
  },
  'cawp_time_data-race_and_ethnicity_state_historical': {
    name: 'Representation of women by race/ethnicity from each state and territory to the U.S. Congress and to their respective state/territory legislature over time',
    original_data_sourced:
      '1915-2023 for Congress, 1983-2023 for state/territory legislatures',
    source_id: 'cawp',
  },
  'cawp_time_data-race_and_ethnicity_state_historical_names': {
    name: 'By-state and by-territory lists of legislator names, yearly back to 1915 including: all members of U.S Congress, regardless of race or gender; all women members of U.S. Congress, by race/ethnicity; and all women members of state and territory legislatures, by race/ethnicity',
    original_data_sourced:
      '1915-2023 for Congress, 1983-2023 for state/territory legislatures',
    source_id: 'cawp',
  },
  'chr_data-race_and_ethnicity_county_current': {
    name: 'Prevalence of multiple chronic disease, behavioral health, and social determinants of health by county, with race/ethnicity breakdowns for some topics.',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'chr',
  },
  the_unitedstates_project: {
    name: '@unitedstates is a shared commons of data and tools for the United States. Made by the public, used by the public. Featuring work from people with the Sunlight Foundation, GovTrack.us, the New York Times, the Electronic Frontier Foundation, and the internet.',
    original_data_sourced: '1915-2023',
    source_id: 'the_unitedstates_project',
  },
  'geo_context-national': {
    name: 'Population from ACS nationally',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'geo_context-state': {
    name: 'Population from ACS by state',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'geo_context-county': {
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
  'phrma_data-race_and_ethnicity_national': {
    name: 'medicare adherence by race/ethnicity, nationally',
    original_data_sourced: '2020',
    contains_nh: true,
    source_id: 'phrma',
  },
  'phrma_data-race_and_ethnicity_state': {
    name: 'medicare adherence by race/ethnicity, by state',
    original_data_sourced: '2020',
    contains_nh: true,
    source_id: 'phrma',
  },
  'phrma_data-race_and_ethnicity_county': {
    name: 'medicare adherence by race/ethnicity, by county',
    original_data_sourced: '2020',
    contains_nh: true,
    source_id: 'phrma',
  },
  'phrma_data-age_national': {
    name: 'medicare adherence by age, nationally',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-age_state': {
    name: 'medicare adherence by age, by state',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-age_county': {
    name: 'medicare adherence by age, by county',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-sex_national': {
    name: 'medicare adherence by sex, nationally',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-sex_state': {
    name: 'medicare adherence by sex, by state',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-sex_county': {
    name: 'medicare adherence by sex, by county',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-lis_national': {
    name: 'medicare adherence by low income subsidy status (LIS), nationally',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-lis_state': {
    name: 'medicare adherence by low income subsidy (LIS), by state',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-lis_county': {
    name: 'medicare adherence by low income subsidy (LIS), by county',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-eligibility_national': {
    name: 'medicare adherence by Medicare eligibility reason, nationally',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-eligibility_state': {
    name: 'medicare adherence by Medicare eligibility reason, by state',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'phrma_data-eligibility_county': {
    name: 'medicare adherence by Medicare eligibility reason, by county',
    original_data_sourced: '2020',
    source_id: 'phrma',
  },
  'cdc_wisqars_data-age_state_historical': {
    name: 'Gun-related Deaths, by age and state',
    original_data_sourced: '2018-2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_data-race_and_ethnicity_state_historical': {
    name: 'Gun-related Deaths, by race/ethnicity and state',
    original_data_sourced: '2018-2021',
    contains_nh: true,
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_data-sex_state_historical': {
    name: 'Gun-related Deaths, by sex and state',
    original_data_sourced: '2018-2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_data-age_state_current': {
    name: 'Gun-related Deaths, by age and state',
    original_data_sourced: '2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_data-race_and_ethnicity_state_current': {
    name: 'Gun-related Deaths, by race/ethnicity and state',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_data-sex_state_current': {
    name: 'Gun-related Deaths, by sex and and state',
    original_data_sourced: '2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_data-age_national_historical': {
    name: 'Gun-related Deaths, by age, nationally',
    original_data_sourced: '2018-2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_data-race_and_ethnicity_national_historical': {
    name: 'Gun-related Deaths, by race/ethnicity, nationally',
    original_data_sourced: '2018-2021',
    contains_nh: true,
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_data-sex_national_historical': {
    name: 'Gun-related Deaths, by sex, nationally',
    original_data_sourced: '2018-2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_data-age_national_current': {
    name: 'Gun-related Deaths, by age, nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_data-race_and_ethnicity_national_current': {
    name: 'Gun-related Deaths, by race/ethnicity, nationally',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_data-sex_national_current': {
    name: 'Gun-related Deaths, by sex, nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_national_current': {
    name: 'Gun-related Youth and Young Adult Deaths, by race and ethnicity, nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_national_historical': {
    name: 'Gun-related Youth and Young Adult Deaths, by race and ethnicity, nationally',
    original_data_sourced: '2018-2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_state_current': {
    name: 'Gun-related Youth and Young Adult Deaths, by race and ethnicity and state',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_state_historical': {
    name: 'Gun-related Youth and Young Adult Deaths, by race and ethnicity and state',
    original_data_sourced: '2018-2021',
    contains_nh: true,
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_black_men_data-black_men_by_urbanicity_national_current': {
    name: 'Gun homicides for Black men, by urbanicity (e.g. Metro or Non-Metro), nationally',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_black_men_data-black_men_by_urbanicity_national_historical': {
    name: 'Gun homicides for Black men, by urbanicity (e.g. Metro or Non-Metro), nationally',
    original_data_sourced: '2018-2021',
    contains_nh: true,
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_black_men_data-black_men_by_urbanicity_state_current': {
    name: 'Gun homicides for Black men, by urbanicity (e.g. Metro or Non-Metro) and state',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_black_men_data-black_men_by_urbanicity_state_historical': {
    name: 'Gun homicides for Black men, by urbanicity (e.g. Metro or Non-Metro) and state',
    original_data_sourced: '2018-2021',
    contains_nh: true,
    source_id: 'cdc_wisqars',
  },

  'cdc_wisqars_black_men_data-black_men_by_age_national_current': {
    name: 'Gun homicides for Black men, by age, nationally',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_black_men_data-black_men_by_age_national_historical': {
    name: 'Gun homicides for Black men, by age, nationally',
    original_data_sourced: '2018-2021',
    contains_nh: true,
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_black_men_data-black_men_by_age_state_current': {
    name: 'Gun homicides for Black men, by age and state',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_black_men_data-black_men_by_age_state_historical': {
    name: 'Gun homicides for Black men, by age and state',
    original_data_sourced: '2018-2021',
    contains_nh: true,
    source_id: 'cdc_wisqars',
  },
  'maternal_mortality_data-by_race_national_current': {
    name: 'Maternal Mortality, by race, nationally',
    original_data_sourced: '2019',
    source_id: 'maternal_health',
  },
  'maternal_mortality_data-by_race_national_historical': {
    name: 'Maternal Mortality, by race, nationally',
    original_data_sourced: '1999 - 2019',
    source_id: 'maternal_health',
  },
  'maternal_mortality_data-by_race_state_current': {
    name: 'Maternal Mortality, by race and state',
    original_data_sourced: '2019',
    source_id: 'maternal_health',
  },
  'maternal_mortality_data-by_race_state_historical': {
    name: 'Maternal Mortality, by race and state',
    original_data_sourced: '1999 - 2019',
    source_id: 'maternal_health',
  },
}
