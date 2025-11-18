import type { DataSourceMetadata, DatasetMetadata } from '../utils/DatasetTypes'

export type DatasetIdMaternalHealthCategory =
  | 'maternal_mortality_data-race_and_ethnicity_national_current'
  | 'maternal_mortality_data-race_and_ethnicity_national_historical'
  | 'maternal_mortality_data-race_and_ethnicity_state_current'
  | 'maternal_mortality_data-race_and_ethnicity_state_historical'
  | 'maternal_mortality_data-alls_national_current'
  | 'maternal_mortality_data-alls_national_historical'
  | 'maternal_mortality_data-alls_state_current'
  | 'maternal_mortality_data-alls_state_historical'

export const DatasetMetadataMapMaternalHealthCategory: Record<
  DatasetIdMaternalHealthCategory,
  DatasetMetadata
> = {
  'maternal_mortality_data-race_and_ethnicity_national_current': {
    name: 'Maternal Mortality, by race, nationally',
    original_data_sourced: '2019',
    source_id: 'maternal_health',
  },
  'maternal_mortality_data-race_and_ethnicity_national_historical': {
    name: 'Maternal Mortality, by race, nationally',
    original_data_sourced: '1999 - 2019',
    source_id: 'maternal_health',
  },
  'maternal_mortality_data-race_and_ethnicity_state_current': {
    name: 'Maternal Mortality, by race and state',
    original_data_sourced: '2019',
    source_id: 'maternal_health',
  },
  'maternal_mortality_data-race_and_ethnicity_state_historical': {
    name: 'Maternal Mortality, by race and state',
    original_data_sourced: '1999 - 2019',
    source_id: 'maternal_health',
  },
  'maternal_mortality_data-alls_national_current': {
    name: 'Maternal Mortality, nationally',
    original_data_sourced: '2019',
    source_id: 'maternal_health',
  },
  'maternal_mortality_data-alls_national_historical': {
    name: 'Maternal Mortality, nationally',
    original_data_sourced: '1999 - 2019',
    source_id: 'maternal_health',
  },
  'maternal_mortality_data-alls_state_current': {
    name: 'Maternal Mortality and state',
    original_data_sourced: '2019',
    source_id: 'maternal_health',
  },
  'maternal_mortality_data-alls_state_historical': {
    name: 'Maternal Mortality and state',
    original_data_sourced: '1999 - 2019',
    source_id: 'maternal_health',
  },
}

interface DataSourceMetadataMaternalHealthCategory
  extends Omit<DataSourceMetadata, 'dataset_ids'> {
  readonly dataset_ids: DatasetIdMaternalHealthCategory[]
}

export const datasourceMetadataMaternalHealthCategory: DataSourceMetadataMaternalHealthCategory =
  {
    id: 'maternal_health',
    data_source_name: `Trends in State-Level Maternal Mortality by Racial and Ethnic Group in the United States`,
    data_source_acronym: 'JAMA',
    data_source_pretty_site_name: 'JAMA Network',
    data_source_link:
      'https://jamanetwork.com/journals/jama/fullarticle/2806661',
    geographic_breakdowns: ['national', 'state'],
    demographic_breakdowns: ['race_and_ethnicity'],
    update_frequency: 'N/A',
    description: ``,
    dataset_ids: Object.keys(
      DatasetMetadataMapMaternalHealthCategory,
    ) as DatasetIdMaternalHealthCategory[],
    downloadable: true,
    data_source_release_years: '1999 - 2019',
  }
