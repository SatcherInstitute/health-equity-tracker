import type { DataSourceMetadata } from '../utils/DatasetTypes'
import type { DatasetId } from './DatasetMetadata'
import { datasourceMetadataCommunitySafetyCategory } from './DatasetMetadataCommunitySafetyCategory'
import { datasourceMetadataHivCategory } from './DatasetMetadataHivCategory'
import { datasourceMetadataMaternalHealthCategory } from './DatasetMetadataMaternalHealthCategory'

export const GEOGRAPHIES_DATASET_ID = 'geographies'

export type DataSourceId =
  | 'acs'
  | 'ahr'
  | 'bjs'
  | 'cawp'
  | 'cdc_atlas'
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
  cdc_wonder: {
    id: 'cdc_wonder',
    data_source_name: 'CDC WONDER Cancer Statistics',
    data_source_acronym: 'CDC',
    data_source_pretty_site_name: 'wonder.cdc.gov',
    data_source_link: 'https://wonder.cdc.gov/cancer-v2021.HTML',
    geographic_level: 'National, State',
    time_period_range: '1999 - 2021',
    demographic_breakdowns: ['race_and_ethnicity', 'age', 'sex'],
    update_frequency: 'Annual',
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
    ],
    downloadable: true,
  },
  cdc_wisqars: datasourceMetadataCommunitySafetyCategory,
  maternal_health: datasourceMetadataMaternalHealthCategory,
  cdc_restricted: {
    id: 'cdc_restricted',
    data_source_name: 'CDC Case Surveillance Restricted Access Detailed Data',
    data_source_acronym: 'CDC',
    data_source_pretty_site_name: 'data.cdc.gov',
    data_source_link:
      'https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Restricted-Access-Detai/mbd7-r32t',
    geographic_level: 'National, State, County',
    time_period_range: 'January 2020 - current',
    demographic_breakdowns: ['race_and_ethnicity', 'age', 'sex'],
    update_frequency: 'Monthly',
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
  },
  acs: {
    id: 'acs',
    data_source_name: 'American Community Survey (ACS) 5-year estimates',
    data_source_acronym: 'ACS',
    data_source_pretty_site_name: 'census.gov',
    data_source_link:
      'https://www.census.gov/data/developers/data-sets/acs-5year.html',
    geographic_level: 'National, State, County',
    demographic_breakdowns: ['race_and_ethnicity', 'age', 'sex'],
    update_frequency: 'Annual',
    description:
      'Yearly population percentages, health insurance rates, and poverty rates at the national, state and county levels.',
    dataset_ids: [
      'acs_population-race_county_current',
      'acs_population-race_state_current',
      'acs_population-race_national_current',
      'acs_population-age_county_current',
      'acs_population-age_state_current',
      'acs_population-age_national_current',
      'acs_population-sex_county_current',
      'acs_population-sex_state_current',
      'acs_population-sex_national_current',
      'acs_population-race_county_historical',
      'acs_population-race_state_historical',
      'acs_population-race_national_historical',
      'acs_population-age_county_historical',
      'acs_population-age_state_historical',
      'acs_population-age_national_historical',
      'acs_population-sex_county_historical',
      'acs_population-sex_state_historical',
      'acs_population-sex_national_historical',
      'acs_condition-race_and_ethnicity_county_historical',
      'acs_condition-race_and_ethnicity_county_current',
      'acs_condition-race_and_ethnicity_state_historical',
      'acs_condition-race_and_ethnicity_state_current',
      'acs_condition-race_and_ethnicity_national_historical',
      'acs_condition-race_and_ethnicity_national_current',
      'acs_condition-age_county_historical',
      'acs_condition-age_county_current',
      'acs_condition-age_state_historical',
      'acs_condition-age_state_current',
      'acs_condition-age_national_historical',
      'acs_condition-age_national_current',
      'acs_condition-sex_county_historical',
      'acs_condition-sex_county_current',
      'acs_condition-sex_state_historical',
      'acs_condition-sex_state_current',
      'acs_condition-sex_national_historical',
      'acs_condition-sex_national_current',
    ],
    downloadable: true,
    time_period_range:
      'Population: 2009 - current, Health Topics: 2012 - current',
  },
  decia_2010_territory_population: {
    id: 'decia_2010_territory_population',
    data_source_name: 'Census 2010 Decennial Island Areas (DECIA)',
    data_source_acronym: 'DECIA',
    data_source_pretty_site_name: 'census.gov',
    data_source_link:
      'https://www.census.gov/data/datasets/2010/dec/virgin-islands.html',
    geographic_level: 'Territory',
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
    geographic_level: 'Territory/County-Equivalent',
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
    geographic_level: 'State/County',
    demographic_breakdowns: ['race_and_ethnicity', 'age', 'sex'],
    update_frequency: 'None',
    description:
      'Population percentage estimates by race/ethnicity, age, and sex to the county level provided by the U.S Census Bureau. We use the single year estimates from 2019.',
    dataset_ids: ['census_pop_estimates-race_and_ethnicity'],
    downloadable: true,
    time_period_range: null,
  },
  cdc_vaccination_county: {
    id: 'cdc_vaccination_county',
    data_source_name: 'CDC COVID-19 Vaccinations in the United States, County',
    data_source_acronym: 'CDC',
    data_source_pretty_site_name: 'data.cdc.gov',
    data_source_link:
      'https://data.cdc.gov/Vaccinations/COVID-19-Vaccinations-in-the-United-States-County/8xkx-amqh',
    geographic_level: 'County',
    demographic_breakdowns: [],
    update_frequency: 'Daily',
    description:
      'Overall US COVID-19 Vaccine administration and vaccine equity data at county level Data represents all vaccine partners including jurisdictional partner clinics, retail pharmacies, long-term care facilities, dialysis centers, Federal Emergency Management Agency and Health Resources and Services Administration partner sites, and federal entity facilities.',
    dataset_ids: ['cdc_vaccination_county-alls_county_current'],
    downloadable: true,
    time_period_range: null,
  },
  cdc_vaccination_national: {
    id: 'cdc_vaccination_national',
    data_source_name:
      'CDC COVID-19 Vaccination Demographics in the United States, National',
    data_source_acronym: 'CDC',
    data_source_pretty_site_name: 'data.cdc.gov',
    data_source_link:
      'https://data.cdc.gov/Vaccinations/COVID-19-Vaccination-Demographics-in-the-United-St/km4m-vcsb',
    geographic_level: 'National',
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
    time_period_range: null,
  },
  cdc_atlas: datasourceMetadataHivCategory,
  kff_vaccination: {
    id: 'kff_vaccination',
    data_source_name: 'Kaiser Family Foundation (KFF) COVID-19 Indicators',
    data_source_acronym: 'KFF',
    data_source_pretty_site_name: 'kff.org',
    data_source_link: 'https://www.kff.org/state-category/covid-19/',
    geographic_level: 'State',
    demographic_breakdowns: ['race_and_ethnicity'],
    update_frequency: 'Biweekly',
    description:
      "State level vaccination information based off of Kaiser Family Foundation analysis of publicly available data from state websites. Per 100k metrics are found on 'COVID-19 Vaccinations by Race/Ethnicity', percent share metrics are found on 'Percent of Total Population that has Received a COVID-19 Vaccine by Race/Ethnicity' and the All metric is found on 'COVID-19 Vaccines Delivered and Administered'",
    dataset_ids: [
      'kff_vaccination-race_and_ethnicity_state_current',
      'kff_vaccination-alls_state_current',
    ],
    downloadable: true,
    time_period_range: null,
  },
  ahr: {
    id: 'ahr',
    data_source_name: "America's Health Rankings (AHR)",
    data_source_acronym: 'AHR',
    data_source_pretty_site_name: 'americashealthrankings.org',
    data_source_link:
      'https://www.americashealthrankings.org/explore/measures/CHC',
    geographic_level: 'National, State',
    demographic_breakdowns: ['race_and_ethnicity', 'age', 'sex'],
    update_frequency: 'Annual',
    description:
      'The prevalence of multiple conditions at the state level, including chronic diseases (COPD, diabetes, chronic kidney disease, cardiovascular diseases), behavioral health indicators (suicide, depression, frequent mental distress, excessive drinking, opioid and other substance misuse), and other social determinants of health (care avoidance due to cost, preventable hospitalizations).',
    dataset_ids: [
      'graphql_ahr_data-behavioral_health_age_national_current',
      'graphql_ahr_data-behavioral_health_race_and_ethnicity_national_current',
      'graphql_ahr_data-behavioral_health_sex_national_current',
      'graphql_ahr_data-behavioral_health_age_state_current',
      'graphql_ahr_data-behavioral_health_race_and_ethnicity_state_current',
      'graphql_ahr_data-behavioral_health_sex_state_current',
      'graphql_ahr_data-non-behavioral_health_age_national_current',
      'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_national_current',
      'graphql_ahr_data-non-behavioral_health_sex_national_current',
      'graphql_ahr_data-non-behavioral_health_age_state_current',
      'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_state_current',
      'graphql_ahr_data-non-behavioral_health_sex_state_current',
    ],
    downloadable: true,
    time_period_range: null,
  },
  bjs: {
    id: 'bjs',
    data_source_name: 'Bureau of Justice Statistics (BJS)',
    data_source_acronym: 'BJS',
    data_source_pretty_site_name: 'bjs.ojp.gov',
    data_source_link: 'https://bjs.ojp.gov',
    geographic_level: 'National, State',
    demographic_breakdowns: ['race_and_ethnicity', 'age', 'sex'],
    update_frequency: 'Annually',
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
    time_period_range: null,
  },
  vera: {
    id: 'vera',
    data_source_name: 'Vera Institute of Justice',
    data_source_acronym: 'Vera',
    data_source_pretty_site_name: 'vera.org',
    data_source_link: 'https://www.vera.org/projects/incarceration-trends',
    geographic_level: 'County',
    demographic_breakdowns: ['race_and_ethnicity', 'sex'],
    update_frequency: 'None',
    description:
      'Rates of individuals, including children, who are confined in local adult jail facilities, or under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county.',
    dataset_ids: [
      'vera_incarceration_county-sex_county_historical',
      'vera_incarceration_county-race_and_ethnicity_county_historical',
      'vera_incarceration_county-age_county_historical',
    ],
    downloadable: true,
    time_period_range: '1985 - 2016',
  },
  cawp: {
    id: 'cawp',
    data_source_name: 'Center for American Women in Politics (CAWP)',
    data_source_acronym: 'CAWP',
    data_source_pretty_site_name: 'cawpdata.rutgers.edu',
    data_source_link: 'https://cawpdata.rutgers.edu/',
    geographic_level: 'National, State',
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
  },

  chr: {
    id: 'chr',
    data_source_name: 'County Health Rankings (CHR)',
    data_source_acronym: 'CHR',
    data_source_pretty_site_name: 'countyhealthrankings.org',
    data_source_link:
      'https://www.countyhealthrankings.org/health-data/methodology-and-sources/data-documentation',
    geographic_level: 'County',
    demographic_breakdowns: ['race_and_ethnicity'],
    update_frequency: 'Annual',
    description:
      'The prevalence of multiple conditions at the county level, including chronic disease (diabetes), behavioral health indicators (suicide, frequent mental distress, excessive drinking), community safety (gun deaths), and other determinants of health (preventable hospitalizations).',
    dataset_ids: [
      'chr_data-race_and_ethnicity_county_current',
      'chr_data-race_and_ethnicity_county_historical',
    ],
    downloadable: true,
    time_period_range: null,
  },
  the_unitedstates_project: {
    id: 'the_unitedstates_project',
    data_source_name: 'The @unitedstates Project',
    data_source_acronym: '@unitedstates',
    data_source_pretty_site_name: 'https://unitedstates.github.io/',
    data_source_link: 'https://github.com/unitedstates/congress-legislators',
    geographic_level: 'National, State',
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
    geographic_level: 'County',
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
    geographic_level: 'National, State, County',
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
    geographic_level: 'National, State',
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
    geographic_level: 'State',
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
    data_source_pretty_site_name:
      'github.com/SatcherInstitute/health-equity-tracker',
    data_source_link: 'https://github.com/topojson/us-atlas#counties-10m.json',
    geographic_level: 'National, State, County',
    demographic_breakdowns: [],
    update_frequency: 'None',
    description:
      'This dataset contains the geographic boundaries for the United States, states, territories, counties, and county-equivalents.',
    dataset_ids: [],
    downloadable: false,
    time_period_range: null,
  },
}

function getDataSourceMetadataByDatasetId(
  id: DatasetId,
): DataSourceMetadata | undefined {
  return Object.values(dataSourceMetadataMap).find((metadata) => {
    return metadata.dataset_ids.includes(id)
  })
}
