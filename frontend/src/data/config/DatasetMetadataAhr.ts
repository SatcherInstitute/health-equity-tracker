import type { DataSourceMetadata, DatasetMetadata } from '../utils/DatasetTypes'

export type DatasetIdAhr =
  | 'graphql_ahr_data-behavioral_health_age_national_current'
  | 'graphql_ahr_data-behavioral_health_age_state_current'
  | 'graphql_ahr_data-behavioral_health_race_and_ethnicity_national_current'
  | 'graphql_ahr_data-behavioral_health_race_and_ethnicity_state_current'
  | 'graphql_ahr_data-behavioral_health_sex_national_current'
  | 'graphql_ahr_data-behavioral_health_sex_state_current'
  | 'graphql_ahr_data-behavioral_health_age_national_historical'
  | 'graphql_ahr_data-behavioral_health_age_state_historical'
  | 'graphql_ahr_data-behavioral_health_race_and_ethnicity_national_historical'
  | 'graphql_ahr_data-behavioral_health_race_and_ethnicity_state_historical'
  | 'graphql_ahr_data-behavioral_health_sex_national_historical'
  | 'graphql_ahr_data-behavioral_health_sex_state_historical'
  | 'graphql_ahr_data-non-behavioral_health_age_national_current'
  | 'graphql_ahr_data-non-behavioral_health_age_state_current'
  | 'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_national_current'
  | 'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_state_current'
  | 'graphql_ahr_data-non-behavioral_health_sex_national_current'
  | 'graphql_ahr_data-non-behavioral_health_sex_state_current'
  | 'graphql_ahr_data-non-behavioral_health_age_national_historical'
  | 'graphql_ahr_data-non-behavioral_health_age_state_historical'
  | 'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_national_historical'
  | 'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_state_historical'
  | 'graphql_ahr_data-non-behavioral_health_sex_national_historical'
  | 'graphql_ahr_data-non-behavioral_health_sex_state_historical'

export const DatasetMetadataMapAhr: Record<DatasetIdAhr, DatasetMetadata> = {
  'graphql_ahr_data-behavioral_health_age_national_current': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by age, nationally',
    original_data_sourced: '2022',
    source_id: 'ahr',
  },
  'graphql_ahr_data-behavioral_health_race_and_ethnicity_national_current': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by race/ethnicity, nationally',
    original_data_sourced: '2022',
    contains_nh: true,
    source_id: 'ahr',
  },
  'graphql_ahr_data-behavioral_health_sex_national_current': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by sex, nationally',
    original_data_sourced: '2022',
    source_id: 'ahr',
  },
  'graphql_ahr_data-behavioral_health_age_state_current': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by age and state',
    original_data_sourced: '2022',
    source_id: 'ahr',
  },
  'graphql_ahr_data-behavioral_health_race_and_ethnicity_state_current': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by race/ethnicity and state',
    original_data_sourced: '2022',
    contains_nh: true,
    source_id: 'ahr',
  },
  'graphql_ahr_data-behavioral_health_sex_state_current': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by sex and state',
    original_data_sourced: '2022',
    source_id: 'ahr',
  },

  'graphql_ahr_data-behavioral_health_age_national_historical': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by year, by age, nationally',
    original_data_sourced: '1995-2022',
    source_id: 'ahr',
  },
  'graphql_ahr_data-behavioral_health_race_and_ethnicity_national_historical': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by year, by race/ethnicity, nationally',
    original_data_sourced: '1995-2022',
    contains_nh: true,
    source_id: 'ahr',
  },
  'graphql_ahr_data-behavioral_health_sex_national_historical': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by year, by sex, nationally',
    original_data_sourced: '1995-2022',
    source_id: 'ahr',
  },
  'graphql_ahr_data-behavioral_health_age_state_historical': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by year, by age and state',
    original_data_sourced: '1995-2022',
    source_id: 'ahr',
  },
  'graphql_ahr_data-behavioral_health_race_and_ethnicity_state_historical': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by year, by race/ethnicity and state',
    original_data_sourced: '1995-2022',
    contains_nh: true,
    source_id: 'ahr',
  },
  'graphql_ahr_data-behavioral_health_sex_state_historical': {
    name: 'Prevalence of multiple chronic diseases and social determinants of health by year, by sex and state',
    original_data_sourced: '1995-2022',
    source_id: 'ahr',
  },
  'graphql_ahr_data-non-behavioral_health_age_national_current': {
    name: 'Prevalence of multiple behavioral and mental health conditions by age, nationally',
    original_data_sourced: '2022',
    source_id: 'ahr',
  },
  'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_national_current':
    {
      name: 'Prevalence of multiple behavioral and mental health conditions by race/ethnicity, nationally',
      original_data_sourced: '2022',
      contains_nh: true,
      source_id: 'ahr',
    },
  'graphql_ahr_data-non-behavioral_health_sex_national_current': {
    name: 'Prevalence of multiple behavioral and mental health conditions by sex, nationally',
    original_data_sourced: '2022',
    source_id: 'ahr',
  },
  'graphql_ahr_data-non-behavioral_health_age_state_current': {
    name: 'Prevalence of multiple behavioral and mental health conditions by age and state',
    original_data_sourced: '2022',
    source_id: 'ahr',
  },
  'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_state_current': {
    name: 'Prevalence of multiple behavioral and mental health conditions by race/ethnicity and state',
    original_data_sourced: '2022',
    contains_nh: true,
    source_id: 'ahr',
  },
  'graphql_ahr_data-non-behavioral_health_sex_state_current': {
    name: 'Prevalence of multiple behavioral and mental health conditions by sex and state',
    original_data_sourced: '2022',
    source_id: 'ahr',
  },
  'graphql_ahr_data-non-behavioral_health_age_national_historical': {
    name: 'Prevalence of multiple behavioral and mental health conditions by year, by age, nationally',
    original_data_sourced: '1995-2022',
    source_id: 'ahr',
  },
  'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_national_historical':
    {
      name: 'Prevalence of multiple behavioral and mental health conditions by year, by race/ethnicity, nationally',
      original_data_sourced: '1995-2022',
      contains_nh: true,
      source_id: 'ahr',
    },
  'graphql_ahr_data-non-behavioral_health_sex_national_historical': {
    name: 'Prevalence of multiple behavioral and mental health conditions by year, by sex, nationally',
    original_data_sourced: '1995-2022',
    source_id: 'ahr',
  },
  'graphql_ahr_data-non-behavioral_health_age_state_historical': {
    name: 'Prevalence of multiple behavioral and mental health conditions by year, by age and state',
    original_data_sourced: '1995-2022',
    source_id: 'ahr',
  },
  'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_state_historical':
    {
      name: 'Prevalence of multiple behavioral and mental health conditions by year, by race/ethnicity and state',
      original_data_sourced: '1995-2022',
      contains_nh: true,
      source_id: 'ahr',
    },
  'graphql_ahr_data-non-behavioral_health_sex_state_historical': {
    name: 'Prevalence of multiple behavioral and mental health conditions by year, by sex and state',
    original_data_sourced: '1995-2022',
    source_id: 'ahr',
  },
}

interface DataSourceMetadataAhr
  extends Omit<DataSourceMetadata, 'dataset_ids'> {
  readonly dataset_ids: DatasetIdAhr[]
}

export const datasourceMetadataAhr: DataSourceMetadataAhr = {
  id: 'ahr',
  data_source_name: "America's Health Rankings (AHR)",
  data_source_acronym: 'AHR',
  data_source_pretty_site_name: 'americashealthrankings.org',
  data_source_link:
    'https://www.americashealthrankings.org/explore/measures/CHC',
  geographic_breakdowns: ['national', 'state'],
  demographic_breakdowns: ['race_and_ethnicity', 'age', 'sex'],
  update_frequency: 'Yearly',
  description:
    'The prevalence of multiple conditions at the state level, including chronic diseases (COPD, diabetes, chronic kidney disease, cardiovascular diseases), behavioral health indicators (suicide, depression, frequent mental distress, excessive drinking, opioid and other substance misuse), and other social determinants of health (care avoidance due to cost, preventable hospitalizations).',
  dataset_ids: [
    'graphql_ahr_data-behavioral_health_age_national_current',
    'graphql_ahr_data-behavioral_health_race_and_ethnicity_national_current',
    'graphql_ahr_data-behavioral_health_sex_national_current',
    'graphql_ahr_data-behavioral_health_age_state_current',
    'graphql_ahr_data-behavioral_health_race_and_ethnicity_state_current',
    'graphql_ahr_data-behavioral_health_sex_state_current',
    'graphql_ahr_data-non-behavioral_health_age_national_current',
    'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_national_current',
    'graphql_ahr_data-non-behavioral_health_sex_national_current',
    'graphql_ahr_data-non-behavioral_health_age_state_current',
    'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_state_current',
    'graphql_ahr_data-non-behavioral_health_sex_state_current',
    'graphql_ahr_data-behavioral_health_age_national_historical',
    'graphql_ahr_data-behavioral_health_race_and_ethnicity_national_historical',
    'graphql_ahr_data-behavioral_health_sex_national_historical',
    'graphql_ahr_data-behavioral_health_age_state_historical',
    'graphql_ahr_data-behavioral_health_race_and_ethnicity_state_historical',
    'graphql_ahr_data-behavioral_health_sex_state_historical',
    'graphql_ahr_data-non-behavioral_health_age_national_historical',
    'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_national_historical',
    'graphql_ahr_data-non-behavioral_health_sex_national_historical',
    'graphql_ahr_data-non-behavioral_health_age_state_historical',
    'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_state_historical',
    'graphql_ahr_data-non-behavioral_health_sex_state_historical',
  ],
  downloadable: true,
  data_source_release_years: null,
}
