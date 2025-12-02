import type { DataSourceMetadata, DatasetMetadata } from '../utils/DatasetTypes'

export type DatasetIdVera =
  | 'vera_incarceration_county-age_county_current'
  | 'vera_incarceration_county-age_county_historical'
  | 'vera_incarceration_county-race_and_ethnicity_county_current'
  | 'vera_incarceration_county-race_and_ethnicity_county_historical'
  | 'vera_incarceration_county-sex_county_current'
  | 'vera_incarceration_county-sex_county_historical'
  | 'vera_incarceration_county-alls_county_current'
  | 'vera_incarceration_county-alls_county_historical'

export const DatasetMetadataMapVera: Record<DatasetIdVera, DatasetMetadata> = {
  'vera_incarceration_county-race_and_ethnicity_county_historical': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county, or confined in local adult jail facilities, by race/ethnicity',
    original_data_sourced: '1983-2016 for prison, 1970-2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'vera_incarceration_county-race_and_ethnicity_county_current': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county, or confined in local adult jail facilities, by race/ethnicity',
    original_data_sourced: '2016 for prison, 2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'vera_incarceration_county-age_county_historical': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county, or confined in local adult jail facilities, by age',
    original_data_sourced: '1983-2016 for prison, 1970-2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'vera_incarceration_county-age_county_current': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county, or confined in local adult jail facilities, by age',
    original_data_sourced: '2016 for prison, 2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'vera_incarceration_county-sex_county_historical': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county, or confined in local adult jail facilities, by sex',
    original_data_sourced: '1983-2016 for prison, 1970-2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'vera_incarceration_county-sex_county_current': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county, or confined in local adult jail facilities, by sex',
    original_data_sourced: '2016 for prison, 2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'vera_incarceration_county-alls_county_historical': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county, or confined in local adult jail facilities',
    original_data_sourced: '1983-2016 for prison, 1970-2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
  'vera_incarceration_county-alls_county_current': {
    name: 'Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county, or confined in local adult jail facilities',
    original_data_sourced: '2016 for prison, 2018 for jail',
    contains_nh: true,
    source_id: 'vera',
  },
}

interface DataSourceMetadataVera
  extends Omit<DataSourceMetadata, 'dataset_ids'> {
  readonly dataset_ids: DatasetIdVera[]
}

export const datasourceMetadataVera: DataSourceMetadataVera = {
  id: 'vera',
  data_source_name: 'Vera Institute of Justice',
  data_source_acronym: 'Vera',
  data_source_pretty_site_name: 'vera.org',
  data_source_link: 'https://www.vera.org/projects/incarceration-trends',
  geographic_breakdowns: ['county'],
  demographic_breakdowns: ['race_and_ethnicity', 'sex'],
  update_frequency: 'None',
  description:
    'Rates of individuals, including children, who are confined in local adult jail facilities, or under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county.',
  dataset_ids: [
    'vera_incarceration_county-sex_county_historical',
    'vera_incarceration_county-race_and_ethnicity_county_historical',
    'vera_incarceration_county-age_county_historical',
    'vera_incarceration_county-sex_county_current',
    'vera_incarceration_county-race_and_ethnicity_county_current',
    'vera_incarceration_county-age_county_current',
    'vera_incarceration_county-alls_county_historical',
    'vera_incarceration_county-alls_county_current',
  ],
  downloadable: true,
  data_source_release_years: '1985 - 2016',
}
