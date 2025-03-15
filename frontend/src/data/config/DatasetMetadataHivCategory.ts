import type { DataSourceMetadata, DatasetMetadata } from '../utils/DatasetTypes'

export type DatasetIdHivCategory =
  | 'cdc_hiv_data-age_county_current'
  | 'cdc_hiv_data-age_county_historical'
  | 'cdc_hiv_data-age_national_current'
  | 'cdc_hiv_data-age_national_historical'
  | 'cdc_hiv_data-age_state_current'
  | 'cdc_hiv_data-age_state_historical'
  | 'cdc_hiv_data-alls_county_current'
  | 'cdc_hiv_data-alls_county_historical'
  | 'cdc_hiv_data-alls_national_current'
  | 'cdc_hiv_data-alls_national_historical'
  | 'cdc_hiv_data-alls_state_current'
  | 'cdc_hiv_data-alls_state_historical'
  | 'cdc_hiv_data-black_women_by_age_national_current'
  | 'cdc_hiv_data-black_women_by_age_national_historical'
  | 'cdc_hiv_data-black_women_by_age_state_current'
  | 'cdc_hiv_data-black_women_by_age_state_historical'
  | 'cdc_hiv_data-black_women_by_alls_national_current'
  | 'cdc_hiv_data-black_women_by_alls_national_historical'
  | 'cdc_hiv_data-black_women_by_alls_state_current'
  | 'cdc_hiv_data-black_women_by_alls_state_historical'
  | 'cdc_hiv_data-race_and_ethnicity_county_current'
  | 'cdc_hiv_data-race_and_ethnicity_county_historical'
  | 'cdc_hiv_data-race_and_ethnicity_national_current-with_age_adjust'
  | 'cdc_hiv_data-race_and_ethnicity_national_current'
  | 'cdc_hiv_data-race_and_ethnicity_national_historical'
  | 'cdc_hiv_data-race_and_ethnicity_state_current-with_age_adjust'
  | 'cdc_hiv_data-race_and_ethnicity_state_current'
  | 'cdc_hiv_data-race_and_ethnicity_state_historical'
  | 'cdc_hiv_data-sex_county_current'
  | 'cdc_hiv_data-sex_county_historical'
  | 'cdc_hiv_data-sex_national_current'
  | 'cdc_hiv_data-sex_national_historical'
  | 'cdc_hiv_data-sex_state_current'
  | 'cdc_hiv_data-sex_state_historical'

export const DatasetMetadataMapHivCategory: Record<
  DatasetIdHivCategory,
  DatasetMetadata
> = {
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
  'cdc_hiv_data-sex_national_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by sex nationally',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-alls_county_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by sex and county',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-alls_state_historical': {
    name: 'Yearly HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by sex and state',
    original_data_sourced: '2008-2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-alls_county_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by sex and county',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-alls_state_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, and PrEP coverage by sex and state',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-alls_national_current': {
    name: 'HIV diagnoses, deaths, prevalence, linkage to HIV care, stigma, and PrEP coverage by sex nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_atlas',
  },
  'cdc_hiv_data-alls_national_historical': {
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

interface DataSourceMetadataHivCategory
  extends Omit<DataSourceMetadata, 'dataset_ids'> {
  readonly dataset_ids: DatasetIdHivCategory[]
}

export const datasourceMetadataHivCategory: DataSourceMetadataHivCategory = {
  id: 'cdc_atlas',
  data_source_name: 'CDC NCHHSTP AtlasPlus',
  data_source_acronym: 'CDC',
  data_source_pretty_site_name: 'cdc.gov',
  data_source_link: 'https://www.cdc.gov/nchhstp/atlas/index.htm',
  geographic_level: 'National, State, County',
  demographic_granularity: 'Race/ethnicity, age, sex',
  update_frequency: 'Yearly',
  description:
    'The Centers for Disease Control and Prevention (CDC) is a primary source of HIV data in the United States, gathering and sharing essential information on HIV diagnoses, deaths, prevalence, linkage to HIV care, HIV stigma, and PrEP coverage. Their annual surveillance report comprehensively summarizes diagnosed HIV cases nationwide and its dependent areas. This crucial data enables public health partners, government agencies, nonprofits, academia, and the public to effectively target prevention strategies, allocate resources, develop policies, and track HIV trends, ensuring a well-informed and coordinated response to the epidemic.',
  dataset_ids: Object.keys(
    DatasetMetadataMapHivCategory,
  ) as DatasetIdHivCategory[],
  downloadable: true,
  time_period_range: '2008 - current',
}
