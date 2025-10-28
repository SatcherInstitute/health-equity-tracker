import type { DataSourceMetadata, DatasetMetadata } from '../utils/DatasetTypes'

export type DatasetIdCdcWonder =
  | 'cdc_wonder_data-age_national_current'
  | 'cdc_wonder_data-age_national_historical'
  | 'cdc_wonder_data-age_state_current'
  | 'cdc_wonder_data-age_state_historical'
  | 'cdc_wonder_data-race_and_ethnicity_national_current'
  | 'cdc_wonder_data-race_and_ethnicity_national_historical'
  | 'cdc_wonder_data-race_and_ethnicity_state_current'
  | 'cdc_wonder_data-race_and_ethnicity_state_historical'
  | 'cdc_wonder_data-sex_national_current'
  | 'cdc_wonder_data-sex_national_historical'
  | 'cdc_wonder_data-sex_state_current'
  | 'cdc_wonder_data-sex_state_historical'
  | 'cdc_wonder_data-alls_national_current'
  | 'cdc_wonder_data-alls_national_historical'
  | 'cdc_wonder_data-alls_state_current'
  | 'cdc_wonder_data-alls_state_historical'

export const DatasetMetadataMapCdcWonder: Record<
  DatasetIdCdcWonder,
  DatasetMetadata
> = {
  'cdc_wonder_data-age_national_current': {
    name: 'Cancer incidence by age, nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-age_national_historical': {
    name: 'Cancer incidence by age, nationally',
    original_data_sourced: '1999-2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-age_state_current': {
    name: 'Cancer incidence by age and state',
    original_data_sourced: '2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-age_state_historical': {
    name: 'Cancer incidence by age and state',
    original_data_sourced: '1999-2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-race_and_ethnicity_national_current': {
    name: 'Cancer incidence by race and ethnicity, nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-race_and_ethnicity_national_historical': {
    name: 'Cancer incidence by race and ethnicity, nationally',
    original_data_sourced: '1999-2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-race_and_ethnicity_state_current': {
    name: 'Cancer incidence by race and ethnicity and state',
    original_data_sourced: '2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-race_and_ethnicity_state_historical': {
    name: 'Cancer incidence by race and ethnicity and state',
    original_data_sourced: '1999-2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-sex_national_current': {
    name: 'Cancer incidence by sex, nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-sex_national_historical': {
    name: 'Cancer incidence by sex, nationally',
    original_data_sourced: '1999-2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-sex_state_current': {
    name: 'Cancer incidence by sex and state',
    original_data_sourced: '2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-sex_state_historical': {
    name: 'Cancer incidence by sex and state',
    original_data_sourced: '1999-2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-alls_national_current': {
    name: 'Cancer incidence, nationally',
    original_data_sourced: '2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-alls_national_historical': {
    name: 'Cancer incidence, nationally',
    original_data_sourced: '1999-2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-alls_state_current': {
    name: 'Cancer incidence by state',
    original_data_sourced: '2021',
    source_id: 'cdc_wonder',
  },
  'cdc_wonder_data-alls_state_historical': {
    name: 'Cancer incidence by state',
    original_data_sourced: '1999-2021',
    source_id: 'cdc_wonder',
  },
}

interface DataSourceMetadataCdcWonder
  extends Omit<DataSourceMetadata, 'dataset_ids'> {
  readonly dataset_ids: DatasetIdCdcWonder[]
}

export const datasourceMetadataCdcWonder: DataSourceMetadataCdcWonder = {
  id: 'cdc_wonder',
  data_source_name: 'CDC WONDER Cancer Statistics',
  data_source_acronym: 'CDC',
  data_source_pretty_site_name: 'wonder.cdc.gov',
  data_source_link: 'https://wonder.cdc.gov/cancer-v2021.HTML',
  geographic_breakdowns: ['national', 'state'],
  time_period_range: '1999 - 2021',
  demographic_breakdowns: ['race_and_ethnicity', 'age', 'sex'],
  update_frequency: 'Yearly',
  description:
    'Cancer incidence statistics from the CDC WONDER database, providing detailed information about new cancer cases across the United States. The data includes incidence rates, counts, and population data stratified by various demographic characteristics. The statistics are derived from cancer registries reporting to the National Program of Cancer Registries (NPCR) and/or the Surveillance, Epidemiology, and End Results (SEER) Program. Rates are calculated using bridged-race population estimates from the U.S. Census Bureau. Age-adjusted rates are calculated based on the 2000 U.S. standard population. Users can access data on different types of cancer, with breakdowns by demographic factors and geographic areas.',
  dataset_ids: [
    'cdc_wonder_data-age_national_current',
    'cdc_wonder_data-age_national_historical',
    'cdc_wonder_data-age_state_current',
    'cdc_wonder_data-age_state_historical',
    'cdc_wonder_data-race_and_ethnicity_national_current',
    'cdc_wonder_data-race_and_ethnicity_national_historical',
    'cdc_wonder_data-race_and_ethnicity_state_current',
    'cdc_wonder_data-race_and_ethnicity_state_historical',
    'cdc_wonder_data-sex_national_current',
    'cdc_wonder_data-sex_national_historical',
    'cdc_wonder_data-sex_state_current',
    'cdc_wonder_data-sex_state_historical',
    'cdc_wonder_data-alls_national_current',
    'cdc_wonder_data-alls_national_historical',
    'cdc_wonder_data-alls_state_current',
    'cdc_wonder_data-alls_state_historical',
  ],
  downloadable: true,
}
