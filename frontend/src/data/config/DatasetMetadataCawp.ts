import type { DataSourceMetadata, DatasetMetadata } from '../utils/DatasetTypes'

export type DatasetIdCawp =
  | 'cawp_data-race_and_ethnicity_national_current'
  | 'cawp_data-race_and_ethnicity_state_current'
  | 'cawp_data-race_and_ethnicity_county_current'
  | 'cawp_data-race_and_ethnicity_national_historical'
  | 'cawp_data-race_and_ethnicity_state_historical'
  | 'cawp_data-race_and_ethnicity_county_historical'
  | 'cawp_data-race_and_ethnicity_state_historical_names'
  | 'cawp_data-alls_national_current'
  | 'cawp_data-alls_state_current'
  | 'cawp_data-alls_county_current'
  | 'cawp_data-alls_national_historical'
  | 'cawp_data-alls_state_historical'
  | 'cawp_data-alls_county_historical'

export const DatasetMetadataMapCawp: Record<DatasetIdCawp, DatasetMetadata> = {
  'cawp_data-race_and_ethnicity_national_current': {
    name: 'Current, national representation of women by race/ethnicity in the U.S. Congress, state/territory legislatures, state/territory governorships, and state lieutenant governorships',
    original_data_sourced: 'July 2026',
    source_id: 'cawp',
  },
  'cawp_data-race_and_ethnicity_state_current': {
    name: 'Current representation of women by race/ethnicity from each state and territory to the U.S. Congress, to their respective state/territory legislature, their governorship, and their lieutenant governorship',
    original_data_sourced: 'July 2026',
    source_id: 'cawp',
  },
  'cawp_data-race_and_ethnicity_county_current': {
    name: 'Current county-level representation of women by race/ethnicity in U.S. Congress (House and Senate members whose districts overlap the county)',
    original_data_sourced: 'July 2026',
    source_id: 'cawp',
  },
  'cawp_data-race_and_ethnicity_national_historical': {
    name: 'National representation of women by race/ethnicity in the U.S. Congress, state/territory legislatures, state/territory governorships, and state lieutenant governorships, over time',
    original_data_sourced:
      '1915-2026 for Congress, governors, and lieutenant governors, 1983-2026 for state/territory legislatures',
    source_id: 'cawp',
  },
  'cawp_data-race_and_ethnicity_state_historical': {
    name: 'Representation of women by race/ethnicity from each state and territory to the U.S. Congress, to their respective state/territory legislature, their governorship, and their lieutenant governorship over time',
    original_data_sourced:
      '1915-2026 for Congress, governors, and lieutenant governors, 1983-2026 for state/territory legislatures',
    source_id: 'cawp',
  },
  'cawp_data-race_and_ethnicity_county_historical': {
    name: 'County-level representation of women by race/ethnicity in U.S. Congress over time (House and Senate members whose districts overlap the county)',
    original_data_sourced: '1915-2026',
    source_id: 'cawp',
  },
  'cawp_data-race_and_ethnicity_state_historical_names': {
    name: 'By-state and by-territory lists of officeholder names, yearly back to 1915 including: all members of U.S Congress, regardless of race or gender; all women members of U.S. Congress, by race/ethnicity; and all women members of state and territory legislatures, by race/ethnicity; all women governors, by race/ethnicity; and all women lieutenant governors, by race/ethnicity',
    original_data_sourced:
      '1915-2026 for Congress, governors, and lieutenant governors, 1983-2026 for state/territory legislatures',
    source_id: 'cawp',
  },
  'cawp_data-alls_national_current': {
    name: 'Current, national representation of all women combined in the U.S. Congress, state/territory legislatures, state/territory governorships, and state lieutenant governorships',
    original_data_sourced: 'July 2026',
    source_id: 'cawp',
  },
  'cawp_data-alls_state_current': {
    name: 'Current representation of all women combined from each state and territory to the U.S. Congress, to their respective state/territory legislature, their governorship, and their lieutenant governorship',
    original_data_sourced: 'July 2026',
    source_id: 'cawp',
  },
  'cawp_data-alls_county_current': {
    name: 'Current county-level representation of all women combined in U.S. Congress (House and Senate members whose districts overlap the county)',
    original_data_sourced: 'July 2026',
    source_id: 'cawp',
  },
  'cawp_data-alls_national_historical': {
    name: 'National representation of all women combined in the U.S. Congress, state/territory legislatures, state/territory governorships, and state lieutenant governorships, over time',
    original_data_sourced:
      '1915-2026 for Congress, governors, and lieutenant governors, 1983-2026 for state/territory legislatures',
    source_id: 'cawp',
  },
  'cawp_data-alls_state_historical': {
    name: 'Representation of all women combined from each state and territory to the U.S. Congress, to their respective state/territory legislature, their governorship, and their lieutenant governorship over time',
    original_data_sourced:
      '1915-2026 for Congress, governors, and lieutenant governors, 1983-2026 for state/territory legislatures',
    source_id: 'cawp',
  },
  'cawp_data-alls_county_historical': {
    name: 'County-level representation of all women combined in U.S. Congress over time (House and Senate members whose districts overlap the county)',
    original_data_sourced: '1915-2026',
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
  geographic_breakdowns: ['national', 'state', 'county'],
  data_source_release_years:
    'U.S. Congress, governors, and lieutenant governors: 1915 - current, State Legislatures: 1983 - current',
  demographic_breakdowns: ['race_and_ethnicity'],
  update_frequency: 'Monthly',
  description:
    'Detailed information on women in elected office, by race/ethnicity, in the US Congress, state legislatures, governorships, and lieutenant governorships, and historical counts of total state legislators of any gender by year by state. A separate table is also available containing officeholder names and positions.',
  dataset_ids: [
    'cawp_data-race_and_ethnicity_national_current',
    'cawp_data-race_and_ethnicity_state_current',
    'cawp_data-race_and_ethnicity_county_current',
    'cawp_data-race_and_ethnicity_national_historical',
    'cawp_data-race_and_ethnicity_state_historical',
    'cawp_data-race_and_ethnicity_county_historical',
    'cawp_data-race_and_ethnicity_state_historical_names',
    'cawp_data-alls_national_current',
    'cawp_data-alls_state_current',
    'cawp_data-alls_county_current',
    'cawp_data-alls_national_historical',
    'cawp_data-alls_state_historical',
    'cawp_data-alls_county_historical',
  ],
  downloadable: true,
  topic_categories: ['pdoh'],
}
