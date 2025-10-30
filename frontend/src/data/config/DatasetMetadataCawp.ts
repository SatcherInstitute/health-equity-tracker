import type { DataSourceMetadata, DatasetMetadata } from '../utils/DatasetTypes'

export type DatasetIdCawp =
  | 'cawp_data-race_and_ethnicity_national_current'
  | 'cawp_data-race_and_ethnicity_state_current'
  | 'cawp_data-race_and_ethnicity_national_historical'
  | 'cawp_data-race_and_ethnicity_state_historical'
  | 'cawp_data-race_and_ethnicity_state_historical_names'

export const DatasetMetadataMapCawp: Record<DatasetIdCawp, DatasetMetadata> = {
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
}

interface DataSourceMetadataCawp
  extends Omit<DataSourceMetadata, 'dataset_ids'> {
  readonly dataset_ids: DatasetIdCawp[]
}

export const datasourceMetadataCawp: DataSourceMetadataCawp = {
  id: 'cawp',
  data_source_name: 'Center for American Women in Politics (CAWP)',
  data_source_acronym: 'CAWP',
  data_source_pretty_site_name: 'cawpdata.rutgers.edu',
  data_source_link: 'https://cawpdata.rutgers.edu/',
  geographic_breakdowns: ['national', 'state'],
  time_period_range:
    'U.S. Congress: 1915 - current, State Legislatures: 1983 - current',
  demographic_breakdowns: ['race_and_ethnicity'],
  update_frequency: 'Monthly',
  description:
    'Detailed information on women legislators, by race/ethnicity, in the US Congress and state legislatures, and historical counts of total state legislators of any gender by year by state. A separate table is also available containing legislator names and positions.',
  dataset_ids: [
    'cawp_data-race_and_ethnicity_national_current',
    'cawp_data-race_and_ethnicity_state_current',
    'cawp_data-race_and_ethnicity_national_historical',
    'cawp_data-race_and_ethnicity_state_historical',
    'cawp_data-race_and_ethnicity_state_historical_names',
  ],
  downloadable: true,
}
