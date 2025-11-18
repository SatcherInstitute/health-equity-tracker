import type { DataSourceMetadata, DatasetMetadata } from '../utils/DatasetTypes'

export type DatasetIdChr =
  | 'chr_data-race_and_ethnicity_county_current'
  | 'chr_data-race_and_ethnicity_county_historical'
  | 'chr_data-alls_county_current'
  | 'chr_data-alls_county_historical'

export const DatasetMetadataMapChr: Record<DatasetIdChr, DatasetMetadata> = {
  'chr_data-race_and_ethnicity_county_current': {
    name: 'Prevalence of multiple chronic disease, behavioral health, and social determinants of health by county, with race/ethnicity breakdowns for some topics.',
    original_data_sourced: '2022',
    contains_nh: true,
    source_id: 'chr',
  },
  'chr_data-race_and_ethnicity_county_historical': {
    name: 'Prevalence of multiple chronic disease, behavioral health, and social determinants of health by county, with race/ethnicity breakdowns for some topics.',
    original_data_sourced: '2011-2022',
    contains_nh: true,
    source_id: 'chr',
  },
  'chr_data-alls_county_current': {
    name: 'Prevalence of multiple chronic disease, behavioral health, and social determinants of health by county.',
    original_data_sourced: '2022',
    contains_nh: true,
    source_id: 'chr',
  },
  'chr_data-alls_county_historical': {
    name: 'Prevalence of multiple chronic disease, behavioral health, and social determinants of health by county.',
    original_data_sourced: '2011-2022',
    contains_nh: true,
    source_id: 'chr',
  },
}

interface DataSourceMetadataChr
  extends Omit<DataSourceMetadata, 'dataset_ids'> {
  readonly dataset_ids: DatasetIdChr[]
}

export const datasourceMetadataChr: DataSourceMetadataChr = {
  id: 'chr',
  data_source_name: 'County Health Rankings (CHR)',
  data_source_acronym: 'CHR',
  data_source_pretty_site_name: 'countyhealthrankings.org',
  data_source_link:
    'https://www.countyhealthrankings.org/health-data/methodology-and-sources/data-documentation',
  geographic_breakdowns: ['county'],
  demographic_breakdowns: ['race_and_ethnicity'],
  update_frequency: 'Yearly',
  description:
    'The prevalence of multiple conditions at the county level, including chronic disease (diabetes), behavioral health indicators (suicide, frequent mental distress, excessive drinking), community safety (gun deaths), and other determinants of health (preventable hospitalizations).',
  dataset_ids: [
    'chr_data-race_and_ethnicity_county_current',
    'chr_data-race_and_ethnicity_county_historical',
    'chr_data-alls_county_current',
    'chr_data-alls_county_historical',
  ],
  downloadable: true,
  data_source_release_years: '2011 - 2025',
  primary_data_time_period_range: '2008-2022 (varies by topic)',
}
