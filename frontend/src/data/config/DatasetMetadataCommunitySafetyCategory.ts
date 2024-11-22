import type { DatasetMetadata } from '../utils/DatasetTypes'

export type DatasetIdCommunitySafetyCategory =
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
  | 'cdc_wisqars_data-alls_national_current'
  | 'cdc_wisqars_data-alls_national_historical'
  | 'cdc_wisqars_data-alls_state_current'
  | 'cdc_wisqars_data-alls_state_historical'
  | 'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_national_current'
  | 'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_national_historical'
  | 'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_state_current'
  | 'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_state_historical'
  | 'cdc_wisqars_youth_data-youth_by_alls_national_current'
  | 'cdc_wisqars_youth_data-youth_by_alls_national_historical'
  | 'cdc_wisqars_youth_data-youth_by_alls_state_current'
  | 'cdc_wisqars_youth_data-youth_by_alls_state_historical'
  | 'cdc_wisqars_black_men_data-black_men_by_urbanicity_national_current'
  | 'cdc_wisqars_black_men_data-black_men_by_urbanicity_state_current'
  | 'cdc_wisqars_black_men_data-black_men_by_urbanicity_national_historical'
  | 'cdc_wisqars_black_men_data-black_men_by_urbanicity_state_historical'
  | 'cdc_wisqars_black_men_data-black_men_by_age_national_current'
  | 'cdc_wisqars_black_men_data-black_men_by_age_state_current'
  | 'cdc_wisqars_black_men_data-black_men_by_age_national_historical'
  | 'cdc_wisqars_black_men_data-black_men_by_age_state_historical'
  | 'cdc_wisqars_black_men_data-black_men_by_alls_national_current'
  | 'cdc_wisqars_black_men_data-black_men_by_alls_state_current'
  | 'cdc_wisqars_black_men_data-black_men_by_alls_national_historical'
  | 'cdc_wisqars_black_men_data-black_men_by_alls_state_historical'

export const DatasetMetadataMapCommunitySafetyCategory: Record<
  DatasetIdCommunitySafetyCategory,
  DatasetMetadata
> = {
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

  'cdc_wisqars_data-alls_state_historical': {
    name: 'Gun-related Deaths, by state',
    original_data_sourced: '2018-2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_data-alls_state_current': {
    name: 'Gun-related Deaths, by state',
    original_data_sourced: '2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_data-alls_national_historical': {
    name: 'Gun-related Deaths, nationally',
    original_data_sourced: '2018-2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_data-alls_national_current': {
    name: 'Gun-related Deaths, nationally',
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

  'cdc_wisqars_youth_data-youth_by_alls_state_historical': {
    name: 'Gun-related Deaths, by state',
    original_data_sourced: '2018-2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_youth_data-youth_by_alls_state_current': {
    name: 'Gun-related Deaths, by state',
    original_data_sourced: '2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_youth_data-youth_by_alls_national_historical': {
    name: 'Gun-related Deaths, nationally',
    original_data_sourced: '2018-2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_youth_data-youth_by_alls_national_current': {
    name: 'Gun-related Deaths, nationally',
    original_data_sourced: '2021',
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
  'cdc_wisqars_black_men_data-black_men_by_alls_state_historical': {
    name: 'Gun-related Deaths, by state',
    original_data_sourced: '2018-2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_black_men_data-black_men_by_alls_state_current': {
    name: 'Gun-related Deaths, by state',
    original_data_sourced: '2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_black_men_data-black_men_by_alls_national_historical': {
    name: 'Gun-related Deaths, nationally',
    original_data_sourced: '2018-2021',
    source_id: 'cdc_wisqars',
  },
  'cdc_wisqars_black_men_data-black_men_by_alls_national_current': {
    name: 'Gun-related Deaths, nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_wisqars',
  },
}
