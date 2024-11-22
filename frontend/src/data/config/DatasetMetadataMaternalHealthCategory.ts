import type { DatasetMetadata } from '../utils/DatasetTypes'

export type DatasetIdMaternalHealthCategory =
  | 'maternal_mortality_data-by_race_national_current'
  | 'maternal_mortality_data-by_race_national_historical'
  | 'maternal_mortality_data-by_race_state_current'
  | 'maternal_mortality_data-by_race_state_historical'
  | 'maternal_mortality_data-by_alls_national_current'
  | 'maternal_mortality_data-by_alls_national_historical'
  | 'maternal_mortality_data-by_alls_state_current'
  | 'maternal_mortality_data-by_alls_state_historical'

export const DatasetMetadataMapMaternalHealthCategory: Record<
  DatasetIdMaternalHealthCategory,
  DatasetMetadata
> = {
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
  'maternal_mortality_data-by_alls_national_current': {
    name: 'Maternal Mortality, nationally',
    original_data_sourced: '2019',
    source_id: 'maternal_health',
  },
  'maternal_mortality_data-by_alls_national_historical': {
    name: 'Maternal Mortality, nationally',
    original_data_sourced: '1999 - 2019',
    source_id: 'maternal_health',
  },
  'maternal_mortality_data-by_alls_state_current': {
    name: 'Maternal Mortality and state',
    original_data_sourced: '2019',
    source_id: 'maternal_health',
  },
  'maternal_mortality_data-by_alls_state_historical': {
    name: 'Maternal Mortality and state',
    original_data_sourced: '1999 - 2019',
    source_id: 'maternal_health',
  },
}
