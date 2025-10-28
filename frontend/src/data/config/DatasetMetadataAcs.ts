import type { DataSourceMetadata, DatasetMetadata } from '../utils/DatasetTypes'

export type DatasetIdAcs =
  | 'acs_condition-race_and_ethnicity_county_historical'
  | 'acs_condition-race_and_ethnicity_county_current'
  | 'acs_condition-race_and_ethnicity_state_historical'
  | 'acs_condition-race_and_ethnicity_state_current'
  | 'acs_condition-race_and_ethnicity_national_historical'
  | 'acs_condition-race_and_ethnicity_national_current'
  | 'acs_condition-age_county_historical'
  | 'acs_condition-age_county_current'
  | 'acs_condition-age_state_historical'
  | 'acs_condition-age_state_current'
  | 'acs_condition-age_national_historical'
  | 'acs_condition-age_national_current'
  | 'acs_condition-sex_county_historical'
  | 'acs_condition-sex_county_current'
  | 'acs_condition-sex_state_historical'
  | 'acs_condition-sex_state_current'
  | 'acs_condition-sex_national_historical'
  | 'acs_condition-sex_national_current'
  | 'acs_population-age_county_current'
  | 'acs_population-age_national_current'
  | 'acs_population-age_state_current'
  | 'acs_population-race_county_current'
  | 'acs_population-race_national_current'
  | 'acs_population-race_state_current'
  | 'acs_population-sex_county_current'
  | 'acs_population-sex_national_current'
  | 'acs_population-sex_state_current'
  | 'acs_population-age_county_historical'
  | 'acs_population-age_national_historical'
  | 'acs_population-age_state_historical'
  | 'acs_population-race_county_historical'
  | 'acs_population-race_national_historical'
  | 'acs_population-race_state_historical'
  | 'acs_population-sex_county_historical'
  | 'acs_population-sex_national_historical'
  | 'acs_population-sex_state_historical'

export const DatasetMetadataMapAcs: Record<DatasetIdAcs, DatasetMetadata> = {
  'acs_population-race_county_current': {
    name: 'Population by race/ethnicity and county',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'acs_population-race_state_current': {
    name: 'Population by race/ethnicity and state',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'acs_population-race_national_current': {
    name: 'Population by race/ethnicity nationally',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'acs_population-age_county_current': {
    name: 'Population by age and county',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'acs_population-age_state_current': {
    name: 'Population by age and state',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'acs_population-age_national_current': {
    name: 'Population by age nationally',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'acs_population-sex_county_current': {
    name: 'Population by sex and county',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'acs_population-sex_state_current': {
    name: 'Population by sex and state',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'acs_population-sex_national_current': {
    name: 'Population by sex nationally',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
  'acs_population-race_county_historical': {
    name: 'Annual population by race/ethnicity and county',
    original_data_sourced: '2009-2022',
    source_id: 'acs',
  },
  'acs_population-race_state_historical': {
    name: 'Annual population by race/ethnicity and state',
    original_data_sourced: '2009-2022',
    source_id: 'acs',
  },
  'acs_population-race_national_historical': {
    name: 'Annual population by race/ethnicity nationally',
    original_data_sourced: '2009-2022',
    source_id: 'acs',
  },
  'acs_population-age_county_historical': {
    name: 'Annual population by age and county',
    original_data_sourced: '2009-2022',
    source_id: 'acs',
  },
  'acs_population-age_state_historical': {
    name: 'Annual population by age and state',
    original_data_sourced: '2009-2022',
    source_id: 'acs',
  },
  'acs_population-age_national_historical': {
    name: 'Annual population by age nationally',
    original_data_sourced: '2009-2022',
    source_id: 'acs',
  },
  'acs_population-sex_county_historical': {
    name: 'Annual population by sex and county',
    original_data_sourced: '2009-2022',
    source_id: 'acs',
  },
  'acs_population-sex_state_historical': {
    name: 'Annual population by sex and state',
    original_data_sourced: '2009-2022',
    source_id: 'acs',
  },
  'acs_population-sex_national_historical': {
    name: 'Annual population by sex nationally',
    original_data_sourced: '2009-2022',
    source_id: 'acs',
  },
  'acs_condition-age_county_historical': {
    name: 'Health insurance and poverty, yearly, by age and county',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-age_state_historical': {
    name: 'Health insurance and poverty, yearly, by age and state',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-age_national_historical': {
    name: 'Health insurance and poverty, yearly, by age at the national level',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-sex_county_historical': {
    name: 'Health insurance and poverty, yearly, by sex and county',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-sex_state_historical': {
    name: 'Health insurance and poverty, yearly, by sex and state',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-sex_national_historical': {
    name: 'Health insurance and poverty, yearly, by sex at the national level',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-race_and_ethnicity_county_historical': {
    name: 'Health insurance and poverty, yearly, by race and county',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-race_and_ethnicity_state_historical': {
    name: 'Health insurance and poverty, yearly, by race and state',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-race_and_ethnicity_national_historical': {
    name: 'Health insurance and poverty, yearly, by race at the national level',
    original_data_sourced: '2012-2022',
    source_id: 'acs',
  },
  'acs_condition-age_county_current': {
    name: 'Health insurance and poverty, yearly, by age and county',
    original_data_sourced: '2022',
    source_id: 'acs',
  },

  'acs_condition-age_state_current': {
    name: 'Health insurance and poverty, yearly, by age and state',
    original_data_sourced: '2022',
    source_id: 'acs',
  },

  'acs_condition-age_national_current': {
    name: 'Health insurance and poverty, yearly, by age at the national level',
    original_data_sourced: '2022',
    source_id: 'acs',
  },

  'acs_condition-sex_county_current': {
    name: 'Health insurance and poverty, yearly, by sex and county',
    original_data_sourced: '2022',
    source_id: 'acs',
  },

  'acs_condition-sex_state_current': {
    name: 'Health insurance and poverty, yearly, by sex and state',
    original_data_sourced: '2022',
    source_id: 'acs',
  },

  'acs_condition-sex_national_current': {
    name: 'Health insurance and poverty, yearly, by sex at the national level',
    original_data_sourced: '2022',
    source_id: 'acs',
  },

  'acs_condition-race_and_ethnicity_county_current': {
    name: 'Health insurance and poverty, yearly, by race and county',
    original_data_sourced: '2022',
    source_id: 'acs',
  },

  'acs_condition-race_and_ethnicity_state_current': {
    name: 'Health insurance and poverty, yearly, by race and state',
    original_data_sourced: '2022',
    source_id: 'acs',
  },

  'acs_condition-race_and_ethnicity_national_current': {
    name: 'Health insurance and poverty, yearly, by race at the national level',
    original_data_sourced: '2022',
    source_id: 'acs',
  },
}

interface DataSourceMetadataAcs
  extends Omit<DataSourceMetadata, 'dataset_ids'> {
  readonly dataset_ids: DatasetIdAcs[]
}

export const datasourceMetadataAcs: DataSourceMetadataAcs = {
  id: 'acs',
  data_source_name: 'American Community Survey (ACS) 5-year estimates',
  data_source_acronym: 'ACS',
  data_source_pretty_site_name: 'census.gov',
  data_source_link:
    'https://www.census.gov/data/developers/data-sets/acs-5year.html',
  geographic_breakdowns: ['national', 'state', 'county'],
  demographic_breakdowns: ['race_and_ethnicity', 'age', 'sex'],
  update_frequency: 'Yearly',
  description:
    'Yearly population percentages, health insurance rates, and poverty rates at the national, state and county levels.',
  dataset_ids: [
    'acs_population-race_county_current',
    'acs_population-race_state_current',
    'acs_population-race_national_current',
    'acs_population-age_county_current',
    'acs_population-age_state_current',
    'acs_population-age_national_current',
    'acs_population-sex_county_current',
    'acs_population-sex_state_current',
    'acs_population-sex_national_current',
    'acs_population-race_county_historical',
    'acs_population-race_state_historical',
    'acs_population-race_national_historical',
    'acs_population-age_county_historical',
    'acs_population-age_state_historical',
    'acs_population-age_national_historical',
    'acs_population-sex_county_historical',
    'acs_population-sex_state_historical',
    'acs_population-sex_national_historical',
    'acs_condition-race_and_ethnicity_county_historical',
    'acs_condition-race_and_ethnicity_county_current',
    'acs_condition-race_and_ethnicity_state_historical',
    'acs_condition-race_and_ethnicity_state_current',
    'acs_condition-race_and_ethnicity_national_historical',
    'acs_condition-race_and_ethnicity_national_current',
    'acs_condition-age_county_historical',
    'acs_condition-age_county_current',
    'acs_condition-age_state_historical',
    'acs_condition-age_state_current',
    'acs_condition-age_national_historical',
    'acs_condition-age_national_current',
    'acs_condition-sex_county_historical',
    'acs_condition-sex_county_current',
    'acs_condition-sex_state_historical',
    'acs_condition-sex_state_current',
    'acs_condition-sex_national_historical',
    'acs_condition-sex_national_current',
  ],
  downloadable: true,
  time_period_range:
    'Population: 2009 - current, Health Topics: 2012 - current',
}
