import type { DatasetMetadata } from '../utils/DatasetTypes'

export type DatasetIdHivCategory =
  | 'cdc_hiv_data-by_age_county_current'
  | 'cdc_hiv_data-by_age_county_historical'
  | 'cdc_hiv_data-by_age_national_current'
  | 'cdc_hiv_data-by_age_national_historical'
  | 'cdc_hiv_data-by_age_state_current'
  | 'cdc_hiv_data-by_age_state_historical'
  | 'cdc_hiv_data-by_alls_county_current'
  | 'cdc_hiv_data-by_alls_county_historical'
  | 'cdc_hiv_data-by_alls_national_current'
  | 'cdc_hiv_data-by_alls_national_historical'
  | 'cdc_hiv_data-by_alls_state_current'
  | 'cdc_hiv_data-by_alls_state_historical'
  | 'cdc_hiv_data-black_women_by_age_national_current'
  | 'cdc_hiv_data-black_women_by_age_national_historical'
  | 'cdc_hiv_data-black_women_by_age_state_current'
  | 'cdc_hiv_data-black_women_by_age_state_historical'
  | 'cdc_hiv_data-black_women_by_alls_national_current'
  | 'cdc_hiv_data-black_women_by_alls_national_historical'
  | 'cdc_hiv_data-black_women_by_alls_state_current'
  | 'cdc_hiv_data-black_women_by_alls_state_historical'
  | 'cdc_hiv_data-by_race_and_ethnicity_county_current'
  | 'cdc_hiv_data-by_race_and_ethnicity_county_historical'
  | 'cdc_hiv_data-by_race_and_ethnicity_national_current-with_age_adjust'
  | 'cdc_hiv_data-by_race_and_ethnicity_national_current'
  | 'cdc_hiv_data-by_race_and_ethnicity_national_historical'
  | 'cdc_hiv_data-by_race_and_ethnicity_state_current-with_age_adjust'
  | 'cdc_hiv_data-by_race_and_ethnicity_state_current'
  | 'cdc_hiv_data-by_race_and_ethnicity_state_historical'
  | 'cdc_hiv_data-by_sex_county_current'
  | 'cdc_hiv_data-by_sex_county_historical'
  | 'cdc_hiv_data-by_sex_national_current'
  | 'cdc_hiv_data-by_sex_national_historical'
  | 'cdc_hiv_data-by_sex_state_current'
  | 'cdc_hiv_data-by_sex_state_historical'

export const DatasetMetadataMapHivCategory: Record<
  DatasetIdHivCategory,
  DatasetMetadata
> = {
  'cdc_hiv_data-by_race_and_ethnicity_county_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by race/ethnicity and county',
    original_data_sourced: '2008-2021',
    contains_nh: true,
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_race_and_ethnicity_state_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by race/ethnicity and state',
    original_data_sourced: '2008-2021',
    contains_nh: true,
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_race_and_ethnicity_national_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by race/ethnicity nationally',
    original_data_sourced: '2008-2021',
    contains_nh: true,
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_race_and_ethnicity_county_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by race/ethnicity and county',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_race_and_ethnicity_state_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by race/ethnicity and state',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_race_and_ethnicity_national_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by race/ethnicity nationally',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_race_and_ethnicity_state_current-with_age_adjust': {
    name: 'Age-adjusted HIV deaths and crude rates for HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by race/ethnicity and state',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_race_and_ethnicity_national_current-with_age_adjust': {
    name: 'Age-adjusted HIV deaths and crude rates for HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by race/ethnicity nationally',
    original_data_sourced: '2021',
    contains_nh: true,
    source_id: 'cdc_atlas',
  },

  'cdc_hiv_data-by_age_county_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by age and county',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_age_state_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by age and state',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_age_national_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by age nationally',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_age_county_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by age and county',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_age_state_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by age and state',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_age_national_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by age nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },

  'cdc_hiv_data-by_sex_county_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by sex and county',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_sex_state_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by sex and state',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_sex_county_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by sex and county',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_sex_state_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by sex and state',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_sex_national_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by sex nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_sex_national_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by sex nationally',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_alls_county_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by sex and county',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_alls_state_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by sex and state',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_alls_county_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by sex and county',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_alls_state_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by sex and state',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_alls_national_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by sex nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-by_alls_national_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by sex nationally',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },

  'cdc_hiv_data-black_women_by_age_national_historical': {
    name: 'Yearly HIV diagnoses, deaths, and prevalence for Black women, by age, nationally',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-black_women_by_age_state_historical': {
    name: 'Yearly HIV diagnoses, deaths, and prevalence for Black women, by age, by state',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-black_women_by_age_state_current': {
    name: 'HIV diagnoses, deaths, and prevalence for Black women, by age, by state',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-black_women_by_age_national_current': {
    name: 'HIV diagnoses, deaths, and prevalence for Black women, by age, nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-black_women_by_alls_national_historical': {
    name: 'Yearly HIV diagnoses, deaths, and prevalence for Black women, nationally',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-black_women_by_alls_state_historical': {
    name: 'Yearly HIV diagnoses, deaths, and prevalence for Black women, by state',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-black_women_by_alls_state_current': {
    name: 'HIV diagnoses, deaths, and prevalence for Black women, by state',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-black_women_by_alls_national_current': {
    name: 'HIV diagnoses, deaths, and prevalence for Black women, nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
}
