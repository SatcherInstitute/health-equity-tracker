import type { DataSourceMetadata, DatasetMetadata } from '../utils/DatasetTypes'

export type DatasetIdCovidCategory =
  | 'cdc_restricted_data-age_county_historical'
  | 'cdc_restricted_data-age_county_cumulative'
  | 'cdc_restricted_data-age_national_historical'
  | 'cdc_restricted_data-age_national_cumulative'
  | 'cdc_restricted_data-age_state_historical'
  | 'cdc_restricted_data-age_state_cumulative'
  | 'cdc_restricted_data-race_and_ethnicity_county_historical'
  | 'cdc_restricted_data-race_and_ethnicity_county_cumulative'
  | 'cdc_restricted_data-race_and_ethnicity_national_historical'
  | 'cdc_restricted_data-race_and_ethnicity_national_cumulative-with_age_adjust'
  | 'cdc_restricted_data-race_and_ethnicity_state_historical'
  | 'cdc_restricted_data-race_and_ethnicity_state_cumulative-with_age_adjust'
  | 'cdc_restricted_data-sex_county_historical'
  | 'cdc_restricted_data-sex_county_cumulative'
  | 'cdc_restricted_data-sex_national_historical'
  | 'cdc_restricted_data-sex_national_cumulative'
  | 'cdc_restricted_data-sex_state_historical'
  | 'cdc_restricted_data-sex_state_cumulative'
  | 'cdc_restricted_data-alls_county_historical'
  | 'cdc_restricted_data-alls_county_cumulative'
  | 'cdc_restricted_data-alls_national_historical'
  | 'cdc_restricted_data-alls_national_cumulative'
  | 'cdc_restricted_data-alls_state_historical'
  | 'cdc_restricted_data-alls_state_cumulative'
  | 'cdc_vaccination_county-alls_county_current'
  | 'cdc_vaccination_national-age_national_current'
  | 'cdc_vaccination_national-race_and_ethnicity_national_current'
  | 'cdc_vaccination_national-sex_national_current'
  | 'kff_vaccination-alls_state_current'
  | 'kff_vaccination-race_and_ethnicity_state_current'

export const DatasetMetadataMapCovidCategory: Record<
  DatasetIdCovidCategory,
  DatasetMetadata
> = {
  'cdc_restricted_data-race_and_ethnicity_county_historical': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by race/ethnicity and county',
    original_data_sourced: 'January 2020 - May 2024',
    contains_nh: true,
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-race_and_ethnicity_state_historical': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by race/ethnicity and state',
    original_data_sourced: 'January 2020 - May 2024',
    contains_nh: true,
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-race_and_ethnicity_national_historical': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by race/ethnicity, nationally',
    original_data_sourced: 'January 2020 - May 2024',
    contains_nh: true,
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-age_county_historical': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by age and county',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-age_state_historical': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by age and state',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-age_national_historical': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by age, nationally',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-sex_county_historical': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by sex and county',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-sex_state_historical': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by sex and state',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-sex_national_historical': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by sex, nationally',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-race_and_ethnicity_county_cumulative': {
    name: 'COVID-19 deaths, cases, and hospitalizations since January 2020 by race/ethnicity and county',
    original_data_sourced: 'January 2020 - May 2024',
    contains_nh: true,
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-race_and_ethnicity_state_cumulative-with_age_adjust': {
    name: 'COVID-19 deaths, cases, and hospitalizations with age-adjusted ratios since January 2020 by race/ethnicity and state',
    original_data_sourced: 'January 2020 - May 2024',
    contains_nh: true,
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-race_and_ethnicity_national_cumulative-with_age_adjust':
    {
      name: 'COVID-19 deaths, cases, and hospitalizations with age-adjusted ratios since January 2020 by race/ethnicity, nationally',
      original_data_sourced: 'January 2020 - May 2024',
      contains_nh: true,
      source_id: 'cdc_restricted',
    },
  'cdc_restricted_data-age_county_cumulative': {
    name: 'COVID-19 deaths, cases, and hospitalizations since January 2020 by age and county',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-age_state_cumulative': {
    name: 'COVID-19 deaths, cases, and hospitalizations since January 2020 by age and state',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-age_national_cumulative': {
    name: 'COVID-19 deaths, cases, and hospitalizations since January 2020 by age, nationally',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-sex_county_cumulative': {
    name: 'COVID-19 deaths, cases, and hospitalizations since January 2020 by sex and county',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-sex_state_cumulative': {
    name: 'COVID-19 deaths, cases, and hospitalizations since January 2020 by sex and state',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-sex_national_cumulative': {
    name: 'COVID-19 deaths, cases, and hospitalizations since January 2020 by sex, nationally',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-alls_county_historical': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by county',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-alls_state_historical': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations by state',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-alls_national_historical': {
    name: 'Monthly COVID-19 deaths, cases, and hospitalizations, nationally',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-alls_county_cumulative': {
    name: 'COVID-19 deaths, cases, and hospitalizations since January 2020 by county',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-alls_state_cumulative': {
    name: 'COVID-19 deaths, cases, and hospitalizations since January 2020 by state',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_restricted_data-alls_national_cumulative': {
    name: 'COVID-19 deaths, cases, and hospitalizations since January 2020, nationally',
    original_data_sourced: 'January 2020 - May 2024',
    source_id: 'cdc_restricted',
  },
  'cdc_vaccination_county-alls_county_current': {
    name: 'COVID-19 vaccinations by county',
    contains_nh: true,
    original_data_sourced: 'March 2023',
    source_id: 'cdc_vaccination_county',
  },
  'cdc_vaccination_national-age_national_current': {
    name: 'COVID-19 vaccinations by age, nationally',
    original_data_sourced: 'March 2023',
    source_id: 'cdc_vaccination_national',
  },
  'cdc_vaccination_national-sex_national_current': {
    name: 'COVID-19 vaccinations by sex, nationally',
    original_data_sourced: 'March 2023',
    source_id: 'cdc_vaccination_national',
  },
  'cdc_vaccination_national-race_and_ethnicity_national_current': {
    name: 'COVID-19 vaccinations by race and ethnicity, nationally',
    original_data_sourced: 'March 2023',
    contains_nh: true,
    source_id: 'cdc_vaccination_national',
  },
  'kff_vaccination-race_and_ethnicity_state_current': {
    name: 'COVID-19 vaccinations by race and ethnicity by state/territory',
    original_data_sourced: 'July 2022',
    contains_nh: true,
    source_id: 'kff_vaccination',
  },
  'kff_vaccination-alls_state_current': {
    name: 'COVID-19 vaccinations by state/territory',
    original_data_sourced: 'July 2022',
    contains_nh: true,
    source_id: 'kff_vaccination',
  },
}

interface DataSourceMetadataCovidCategory
  extends Omit<DataSourceMetadata, 'dataset_ids'> {
  readonly dataset_ids: DatasetIdCovidCategory[]
}

export const datasourceMetadataCdcRestricted: DataSourceMetadataCovidCategory =
  {
    id: 'cdc_restricted',
    data_source_name: 'CDC Case Surveillance Restricted Access Detailed Data',
    data_source_acronym: 'CDC',
    data_source_pretty_site_name: 'data.cdc.gov',
    data_source_link:
      'https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Restricted-Access-Detai/mbd7-r32t',
    geographic_breakdowns: ['national', 'state', 'county'],
    data_source_release_years: 'January 2020 - current',
    demographic_breakdowns: ['race_and_ethnicity', 'age', 'sex'],
    update_frequency: 'Final update was June 2024',
    description:
      'The numbers of confirmed COVID-19 deaths, cases, and hospitalizations nationally and at the state and county levels. The data source is Centers for Disease Control and Prevention, COVID-19 Response. COVID-19 Case Surveillance Data Access, Summary, and Limitations. The last case data included is two (2) weeks before they most recent release from the CDC. The CDC does not take responsibility for the scientific validity or accuracy of methodology, results, statistical analyses, or conclusions presented. We only present the data as rates that are calculated with the American Community Survey (ACS) 2019 5-year estimates, to view the raw data you must apply for access on the CDC website linked above.',
    dataset_ids: [
      'cdc_restricted_data-race_and_ethnicity_national_cumulative-with_age_adjust',
      'cdc_restricted_data-race_and_ethnicity_county_cumulative',
      'cdc_restricted_data-race_and_ethnicity_state_cumulative-with_age_adjust',
      'cdc_restricted_data-age_national_cumulative',
      'cdc_restricted_data-age_county_cumulative',
      'cdc_restricted_data-age_state_cumulative',
      'cdc_restricted_data-sex_national_cumulative',
      'cdc_restricted_data-sex_county_cumulative',
      'cdc_restricted_data-sex_state_cumulative',
      'cdc_restricted_data-race_and_ethnicity_national_historical',
      'cdc_restricted_data-race_and_ethnicity_county_historical',
      'cdc_restricted_data-race_and_ethnicity_state_historical',
      'cdc_restricted_data-age_national_historical',
      'cdc_restricted_data-age_county_historical',
      'cdc_restricted_data-age_state_historical',
      'cdc_restricted_data-sex_national_historical',
      'cdc_restricted_data-sex_county_historical',
      'cdc_restricted_data-sex_state_historical',
      'cdc_restricted_data-alls_national_cumulative',
      'cdc_restricted_data-alls_county_cumulative',
      'cdc_restricted_data-alls_state_cumulative',
      'cdc_restricted_data-alls_national_historical',
      'cdc_restricted_data-alls_county_historical',
      'cdc_restricted_data-alls_state_historical',
    ],
    downloadable: true,
  }

export const datasourceMetadataCdcVaccinationCounty: DataSourceMetadataCovidCategory =
  {
    id: 'cdc_vaccination_county',
    data_source_name: 'CDC COVID-19 Vaccinations in the United States, County',
    data_source_acronym: 'CDC',
    data_source_pretty_site_name: 'data.cdc.gov',
    data_source_link:
      'https://data.cdc.gov/Vaccinations/COVID-19-Vaccinations-in-the-United-States-County/8xkx-amqh',
    geographic_breakdowns: ['county'],
    demographic_breakdowns: [],
    update_frequency: 'Daily',
    description:
      'Overall US COVID-19 Vaccine administration and vaccine equity data at county level Data represents all vaccine partners including jurisdictional partner clinics, retail pharmacies, long-term care facilities, dialysis centers, Federal Emergency Management Agency and Health Resources and Services Administration partner sites, and federal entity facilities.',
    dataset_ids: ['cdc_vaccination_county-alls_county_current'],
    downloadable: true,
    data_source_release_years: null,
  }
export const datasourceMetadataCdcVaccinationNational: DataSourceMetadataCovidCategory =
  {
    id: 'cdc_vaccination_national',
    data_source_name:
      'CDC COVID-19 Vaccination Demographics in the United States, National',
    data_source_acronym: 'CDC',
    data_source_pretty_site_name: 'data.cdc.gov',
    data_source_link:
      'https://data.cdc.gov/Vaccinations/COVID-19-Vaccination-Demographics-in-the-United-St/km4m-vcsb',
    geographic_breakdowns: ['national'],
    demographic_breakdowns: ['race_and_ethnicity', 'age', 'sex'],
    update_frequency: 'Daily',
    description:
      'Overall Demographic Characteristics of People Receiving COVID-19 Vaccinations in the United States at national level. Data represents all vaccine partners including jurisdictional partner clinics, retail pharmacies, long-term care facilities, dialysis centers, Federal Emergency Management Agency and Health Resources and Services Administration partner sites, and federal entity facilities. (CDC 2021)',
    dataset_ids: [
      'cdc_vaccination_national-age_national_current',
      'cdc_vaccination_national-race_and_ethnicity_national_current',
      'cdc_vaccination_national-sex_national_current',
    ],
    downloadable: true,
    data_source_release_years: null,
  }
export const datasourceMetadataKffVaccinationState: DataSourceMetadataCovidCategory =
  {
    id: 'kff_vaccination',
    data_source_name: 'Kaiser Family Foundation (KFF) COVID-19 Indicators',
    data_source_acronym: 'KFF',
    data_source_pretty_site_name: 'kff.org',
    data_source_link: 'https://www.kff.org/state-category/covid-19/',
    geographic_breakdowns: ['state'],
    demographic_breakdowns: ['race_and_ethnicity'],
    update_frequency: 'Biweekly',
    description:
      "State level vaccination information based off of Kaiser Family Foundation analysis of publicly available data from state websites. Per 100k metrics are found on 'COVID-19 Vaccinations by Race/Ethnicity', percent share metrics are found on 'Percent of Total Population that has Received a COVID-19 Vaccine by Race/Ethnicity' and the All metric is found on 'COVID-19 Vaccines Delivered and Administered'",
    dataset_ids: [
      'kff_vaccination-race_and_ethnicity_state_current',
      'kff_vaccination-alls_state_current',
    ],
    downloadable: true,
    data_source_release_years: null,
  }
