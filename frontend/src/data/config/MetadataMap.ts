import type { DataSourceMetadata } from '../utils/DatasetTypes'
import { datasourceMetadataAcs } from './DatasetMetadataAcs'
import { datasourceMetadataAhr } from './DatasetMetadataAhr'
import { datasourceMetadataBjs } from './DatasetMetadataBjs'
import { datasourceMetadataCawp } from './DatasetMetadataCawp'
import { datasourceMetadataCdcWonder } from './DatasetMetadataCdcWonder'
import { datasourceMetadataChr } from './DatasetMetadataChr'
import { datasourceMetadataCommunitySafetyCategory } from './DatasetMetadataCommunitySafetyCategory'
import {
  datasourceMetadataCdcRestricted,
  datasourceMetadataCdcVaccinationCounty,
  datasourceMetadataCdcVaccinationNational,
  datasourceMetadataKffVaccinationState,
} from './DatasetMetadataCovidCategory'
import { datasourceMetadataHivCategory } from './DatasetMetadataHivCategory'
import { datasourceMetadataMaternalHealthCategory } from './DatasetMetadataMaternalHealthCategory'
import { datasourceMetadataVera } from './DatasetMetadataVera'

export const GEOGRAPHIES_DATASET_ID = 'geographies'

export type DataSourceId =
  | 'acs'
  | 'ahr'
  | 'bjs'
  | 'cawp'
  | 'cdc_atlas'
  | 'cdc_miovd'
  | 'cdc_restricted'
  | 'cdc_vaccination_county'
  | 'cdc_vaccination_national'
  | 'cdc_wisqars'
  | 'cdc_wonder'
  | 'census_pop_estimates'
  | 'chr'
  | 'covid_tracking_project'
  | 'decia_2010_territory_population'
  | 'decia_2020_territory_population'
  | 'geographies_source'
  | 'geo_context'
  | 'kff_vaccination'
  | 'maternal_health'
  | 'phrma'
  | 'phrma_brfss'
  | 'the_unitedstates_project'
  | 'vera'

export const dataSourceMetadataMap: Record<DataSourceId, DataSourceMetadata> = {
  acs: datasourceMetadataAcs,
  cdc_wisqars: datasourceMetadataCommunitySafetyCategory,
  maternal_health: datasourceMetadataMaternalHealthCategory,
  cdc_restricted: datasourceMetadataCdcRestricted,
  cdc_atlas: datasourceMetadataHivCategory,
  cdc_vaccination_county: datasourceMetadataCdcVaccinationCounty,
  cdc_vaccination_national: datasourceMetadataCdcVaccinationNational,
  kff_vaccination: datasourceMetadataKffVaccinationState,
  ahr: datasourceMetadataAhr,
  chr: datasourceMetadataChr,
  bjs: datasourceMetadataBjs,
  vera: datasourceMetadataVera,
  cawp: datasourceMetadataCawp,

  cdc_wonder: datasourceMetadataCdcWonder,

  decia_2010_territory_population: {
    id: 'decia_2010_territory_population',
    data_source_name: 'Census 2010 Decennial Island Areas (DECIA)',
    data_source_acronym: 'DECIA',
    data_source_pretty_site_name: 'census.gov',
    data_source_link:
      'https://www.census.gov/data/datasets/2010/dec/virgin-islands.html',
    geographic_breakdowns: ['territory'],
    demographic_breakdowns: ['race_and_ethnicity', 'age', 'sex'],
    update_frequency: 'None',
    description:
      'Population totals and percent shares for 2010 at the territory level for U.S. Virgin Islands, Guam, American Samoa, and the Northern Mariana Islands, which are not available in the Census 5 year American Community Survey (ACS) estimates.',
    dataset_ids: [
      'decia_2010_territory_population-race_and_ethnicity_state_current',
      'decia_2010_territory_population-sex_state_current',
      'decia_2010_territory_population-age_state_current',
    ],
    downloadable: true,
    time_period_range: null,
  },
  decia_2020_territory_population: {
    id: 'decia_2020_territory_population',
    data_source_name: 'Census 2020 Decennial Island Areas (DECIA)',
    data_source_acronym: 'DECIA',
    data_source_pretty_site_name: 'census.gov',
    data_source_link:
      'https://www.census.gov/data/tables/2020/dec/2020-us-virgin-islands.html',
    geographic_breakdowns: ['territory'],
    demographic_breakdowns: ['race_and_ethnicity', 'age', 'sex'],
    update_frequency: 'None',
    description:
      'Population totals and percent shares for 2020 at the territory and county-equivalent level for U.S. Virgin Islands, Guam, American Samoa, and the Northern Mariana Islands, which are not available in the 5 year American Community Survey (ACS) estimates.',
    dataset_ids: [
      'decia_2020_territory_population-race_and_ethnicity_state_current',
      'decia_2020_territory_population-sex_state_current',
      'decia_2020_territory_population-age_state_current',
      'decia_2020_territory_population-race_and_ethnicity_county_current',
      'decia_2020_territory_population-sex_county_current',
      'decia_2020_territory_population-age_county_current',
    ],
    downloadable: true,
    time_period_range: null,
  },
  census_pop_estimates: {
    id: 'census_pop_estimates',
    data_source_name: 'County Population by Characteristics: 2010-2019',
    data_source_acronym: 'Census',
    data_source_pretty_site_name: 'census.gov',
    data_source_link:
      'https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-detail.html',
    geographic_breakdowns: ['state', 'county'],
    demographic_breakdowns: ['race_and_ethnicity', 'age', 'sex'],
    update_frequency: 'None',
    description:
      'Population percentage estimates by race/ethnicity, age, and sex to the county level provided by the U.S Census Bureau. We use the single year estimates from 2019.',
    dataset_ids: ['census_pop_estimates-race_and_ethnicity'],
    downloadable: true,
    time_period_range: null,
  },

  the_unitedstates_project: {
    id: 'the_unitedstates_project',
    data_source_name: 'The @unitedstates Project',
    data_source_acronym: '@unitedstates',
    data_source_pretty_site_name: 'https://unitedstates.github.io/',
    data_source_link: 'https://github.com/unitedstates/congress-legislators',
    geographic_breakdowns: ['national', 'state'],
    demographic_breakdowns: [],
    update_frequency: 'At least monthly',
    description:
      'Total members of the United States Congress (Senate and House of Representatives including Delegates) both nationally and by state/territory. This dataset is viewable and downloadable in the CAWP datasets.',
    dataset_ids: ['the_unitedstates_project'],
    downloadable: false,
    time_period_range: null,
  },
  geo_context: {
    id: 'geo_context',
    data_source_name: 'CDC SVI Rankings',
    data_source_acronym: 'CDC',
    data_source_pretty_site_name: 'atsdr.cdc.gov',
    data_source_link:
      'https://www.atsdr.cdc.gov/placeandhealth/svi/data_documentation_download.html',
    geographic_breakdowns: ['county'],
    demographic_breakdowns: [],
    update_frequency: 'Every 2 Years',
    description:
      'This is a composite dataset we create for faster loading; it includes population data from ACS and SVI data at the county level from the CDC. SVI: Every community must prepare for and respond to hazardous events, whether a natural disaster like a tornado or a disease outbreak, or an anthropogenic event such as a harmful chemical spill. The degree to which a community exhibits certain social conditions, including high poverty, low percentage of vehicle access, or crowded households, may affect that community’s ability to prevent human suffering and financial loss in the event of disaster. These factors describe a community’s social vulnerability.',
    dataset_ids: [
      'geo_context-alls_county_current',
      'geo_context-alls_state_current',
      'geo_context-alls_national_current',
    ],
    downloadable: true,
    time_period_range: null,
  },
  phrma: {
    id: 'phrma',
    data_source_name: 'Medicare Administrative Data',
    data_source_acronym: 'CMS',
    data_source_pretty_site_name: 'cms.gov',
    data_source_link:
      'https://www.cms.gov/research-statistics-data-and-systems/cms-information-technology/accesstodataapplication',
    geographic_breakdowns: ['national', 'state', 'county'],
    demographic_breakdowns: [
      'race_and_ethnicity',
      'sex',
      'age',
      'lis',
      'eligibility',
    ],
    update_frequency: 'None',
    description:
      'Data Source: Medicare Administrative Data (January 1, 2020 - December 31st, 2020). Source Population: Medicare beneficiaries who were enrolled in Medicare FFS and Part D in 2020. Disease rates and medication adherence amongst 18 years and older.',
    dataset_ids: [
      'phrma_data-race_and_ethnicity_national_current',
      'phrma_data-race_and_ethnicity_state_current',
      'phrma_data-race_and_ethnicity_county_current',
      'phrma_data-age_national_current',
      'phrma_data-age_state_current',
      'phrma_data-age_county_current',
      'phrma_data-sex_national_current',
      'phrma_data-sex_state_current',
      'phrma_data-sex_county_current',
      'phrma_data-lis_national_current',
      'phrma_data-lis_state_current',
      'phrma_data-lis_county_current',
      'phrma_data-eligibility_national_current',
      'phrma_data-eligibility_state_current',
      'phrma_data-eligibility_county_current',
    ],
    downloadable: true,
    downloadable_blurb:
      'Disease rates and medication adherence percentages for multiple HIV, mental health, and cardiovascular conditions within the Medicare beneficiary population.',
    downloadable_data_dictionary: true,
    time_period_range: null,
  },
  phrma_brfss: {
    id: 'phrma_brfss',
    data_source_name: 'CDC Behavioral Risk Factor Surveillance System',
    data_source_acronym: 'CDC BRFSS',
    data_source_pretty_site_name: 'cdc.gov/brfss',
    data_source_link: 'https://www.cdc.gov/brfss/annual_data/annual_2022.html',
    geographic_breakdowns: ['national', 'state'],
    demographic_breakdowns: [
      'race_and_ethnicity',
      'age',
      'sex',
      'insurance_status',
      'income',
      'education',
    ],
    update_frequency: 'None',
    description:
      'The 2022 Behavioral Risk Factor Surveillance System (BRFSS) database from the Centers for Disease Control and Prevention (CDC) was analyzed for five different cancer screening rates. Breast, colorectal, cervical, and lung cancer use data from the 50 states and Washington DC. Prostate cancer screening data is not part of the core BRFSS database so are available only for Arkansas, Delaware, Massachusetts, Mississippi, New Jersey, and South Carolina.',
    downloadable: true,
    time_period_range: null,
    dataset_ids: [
      'phrma_brfss_data-race_and_ethnicity_national_current-with_age_adjust',
      'phrma_brfss_data-age_national_current',
      'phrma_brfss_data-sex_national_current',
      'phrma_brfss_data-insurance_status_national_current',
      'phrma_brfss_data-income_national_current',
      'phrma_brfss_data-education_national_current',
      'phrma_brfss_data-race_and_ethnicity_state_current-with_age_adjust',
      'phrma_brfss_data-age_state_current',
      'phrma_brfss_data-sex_state_current',
      'phrma_brfss_data-insurance_status_state_current',
      'phrma_brfss_data-income_state_current',
      'phrma_brfss_data-education_state_current',
    ],
  },
  covid_tracking_project: {
    id: 'covid_tracking_project',
    data_source_name: 'Covid Tracking Project’s (CTP) Racial Data Tracker',
    data_source_acronym: 'CTP',
    data_source_pretty_site_name: 'covidtracking.com',
    data_source_link: 'https://covidtracking.com/race',
    geographic_breakdowns: ['state'],
    demographic_breakdowns: ['race_and_ethnicity'],
    update_frequency: 'Final update was March 7 2021',
    description:
      'The numbers of confirmed COVID-19 deaths, cases, hospitalizations, and tests at the state level. Please note that Covid Tracking Project data is not used for any visualizations on the tracker, it is only available for download.',
    dataset_ids: [
      'covid_tracking_project-cases_by_race_state',
      'covid_tracking_project-deaths_by_race_state',
      'covid_tracking_project-hospitalizations_by_race_state',
      'covid_tracking_project-tests_by_race_state',
    ],
    downloadable: true,
    time_period_range: null,
  },
  geographies_source: {
    id: 'geographies_source',
    data_source_name: 'Map Data',
    data_source_acronym: 'TopoJSON',
    data_source_pretty_site_name: 'github.com/topojson/us-atlas',
    data_source_link: 'https://github.com/topojson/us-atlas#counties-10m.json',
    geographic_breakdowns: ['national', 'state', 'county'],
    demographic_breakdowns: [],
    update_frequency: 'None',
    description:
      'This dataset contains the geographic boundaries for the United States, states, territories, counties, and county-equivalents.',
    dataset_ids: [],
    downloadable: false,
    time_period_range: null,
  },
  cdc_miovd: {
    id: 'cdc_miovd',
    description:
      'The CDC Mapping Injury, Overdose, and Violence Dashboard displays data on deaths from drug overdose, suicide, and homicide using provisional and final death data received from states. This data source provides enhanced geographic detail down to the county level for violence-related deaths.',
    dataset_ids: [
      'cdc_miovd_data-alls_county_current',
      'cdc_miovd_data-alls_county_historical',
    ],
    data_source_name: 'CDC MIOVD',
    data_source_acronym: 'CDC',
    data_source_pretty_site_name:
      'cdc.gov/injury-violence-data/data-vis/index.html',
    data_source_link:
      'https://www.cdc.gov/injury-violence-data/data-vis/index.html',
    geographic_breakdowns: ['county'],
    demographic_breakdowns: [],
    update_frequency: 'Yearly',
    downloadable: false,
    time_period_range: '2019 - current',
  },
}
