import type { DataSourceMetadata, DatasetMetadata } from '../utils/DatasetTypes'

export type DatasetIdBjs =
  | 'bjs_incarceration_data-age_national_current'
  | 'bjs_incarceration_data-age_state_current'
  | 'bjs_incarceration_data-race_and_ethnicity_national_current'
  | 'bjs_incarceration_data-race_and_ethnicity_state_current'
  | 'bjs_incarceration_data-sex_national_current'
  | 'bjs_incarceration_data-sex_state_current'
  | 'bjs_incarceration_data-alls_national_current'
  | 'bjs_incarceration_data-alls_state_current'

export const DatasetMetadataMapBjs: Record<DatasetIdBjs, DatasetMetadata> = {
  'bjs_incarceration_data-age_national_current': {
    name: 'National rates of sentenced individuals under the jurisdiction of federal or state adult prison facilities, or confined in local adult jail facilities, by age',
    original_data_sourced: '2019 for jail, 2020 for prison',
    source_id: 'bjs',
  },
  'bjs_incarceration_data-age_state_current': {
    name: 'Rates of individuals under the jurisdiction of state or territory prison facilities, by state/territory (totals only), or confined in local adult jail facilities by age, by state/territory',
    original_data_sourced: '2019 for jail, 2020 for prison',
    source_id: 'bjs',
  },
  'bjs_incarceration_data-race_and_ethnicity_national_current': {
    name: 'National rates of individuals under the jurisdiction of federal or state adult prison facilities or confined in local adult jail facilities, by race/ethnicity',
    original_data_sourced: '2019 for jail, 2020 for prison',
    contains_nh: true,
    source_id: 'bjs',
  },
  'bjs_incarceration_data-race_and_ethnicity_state_current': {
    name: 'Rates of individuals under the jurisdiction of state or territory prison facilities or confined in local adult jail facilities, by race/ethnicity and state/territory',
    original_data_sourced: '2019 for jail, 2020 for prison',
    contains_nh: true,
    source_id: 'bjs',
  },
  'bjs_incarceration_data-sex_national_current': {
    name: 'National rates of individuals under the jurisdiction of federal or state adult prison facilities or confined in local adult jail facilities, by sex',
    original_data_sourced: '2019 for jail, 2020 for prison',
    source_id: 'bjs',
  },
  'bjs_incarceration_data-sex_state_current': {
    name: 'Rates of individuals under the jurisdiction of state or territory prison facilities or confined in local adult jail facilities, by sex and state/territory',
    original_data_sourced: '2019 for jail, 2020 for prison',
    source_id: 'bjs',
  },
  'bjs_incarceration_data-alls_national_current': {
    name: 'National rates of individuals under the jurisdiction of federal or state adult prison facilities or confined in local adult jail facilities',
    original_data_sourced: '2019 for jail, 2020 for prison',
    source_id: 'bjs',
  },
  'bjs_incarceration_data-alls_state_current': {
    name: 'Rates of individuals under the jurisdiction of state or territory prison facilities or confined in local adult jail facilities, by state/territory',
    original_data_sourced: '2019 for jail, 2020 for prison',
    source_id: 'bjs',
  },
}

interface DataSourceMetadataBjs
  extends Omit<DataSourceMetadata, 'dataset_ids'> {
  readonly dataset_ids: DatasetIdBjs[]
}

export const datasourceMetadataBjs: DataSourceMetadataBjs = {
  id: 'bjs',
  data_source_name: 'Bureau of Justice Statistics (BJS)',
  data_source_acronym: 'BJS',
  data_source_pretty_site_name: 'bjs.ojp.gov',
  data_source_link: 'https://bjs.ojp.gov',
  geographic_breakdowns: ['national', 'state'],
  demographic_breakdowns: ['race_and_ethnicity', 'age', 'sex'],
  update_frequency: 'Yearly',
  description:
    'Rates of individuals, including children, who are confined in a local adult jail facility, or under the jurisdiction of a federal, state, or territory adult prison facility.',
  dataset_ids: [
    'bjs_incarceration_data-race_and_ethnicity_national_current',
    'bjs_incarceration_data-race_and_ethnicity_state_current',
    'bjs_incarceration_data-age_national_current',
    'bjs_incarceration_data-age_state_current',
    'bjs_incarceration_data-sex_national_current',
    'bjs_incarceration_data-sex_state_current',
    'bjs_incarceration_data-alls_national_current',
    'bjs_incarceration_data-alls_state_current',
  ],
  downloadable: true,
  data_source_release_years: null,
}
