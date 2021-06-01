import { DataSourceMetadata } from "../utils/DatasetTypes";

export const GEOGRAPHIES_DATASET_ID = "geographies";

// ALERT!!! Keep this file in sync with FakeDatasetMetadata while it is present
// All dataset IDs should be in the FakeDatasetMetadata

const dataSourceMetadataList: DataSourceMetadata[] = [
  {
    id: "acs",
    data_source_name: "American Community Survey 5-year estimates",
    data_source_link:
      "https://www.census.gov/data/developers/data-sets/acs-5year.html",
    geographic_level: "State",
    demographic_granularity: "Race/ethnicity, age, sex",
    update_frequency: "Annual",
    description:
      "Population percentages, health insurance rates, and poverty rates at the state and county levels.",
    dataset_ids: [
      "acs_population-by_race_county_std",
      "acs_population-by_race_state_std",
      "acs_population-by_age_state",
      "acs_population-by_age_county",
      "acs_population-by_sex_state",
      "acs_population-by_sex_county",
      "acs_health_insurance-health_insurance_by_sex_age_county",
      "acs_health_insurance-health_insurance_by_sex_age_state",
      "acs_health_insurance-health_insurance_by_race_age_state",
      "acs_health_insurance-health_insurance_by_race_age_county",
      "acs_poverty_dataset-poverty_by_race_age_sex_state",
      "acs_poverty_dataset-poverty_by_race_age_sex_county",
    ],
    downloadable: true,
  },
  {
    id: "cdc_restricted",
    data_source_name: "CDC Case Surveillance Restricted Access Detailed Data",
    data_source_link:
      "https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Restricted-Access-Detai/mbd7-r32t",
    geographic_level: "State",
    demographic_granularity: "Race/ethnicity, age, sex",
    update_frequency: "Biweekly",
    description:
      "The numbers of confirmed COVID-19 deaths, cases, and hospitalizations at the state and county levels. " +
      "The data source is Centers for Disease Control and Prevention, COVID-19 Response. COVID-19 Case " +
      "Surveillance Data Access, Summary, and Limitations (5/11/2021). The last case data included is 2 " +
      "weeks before 5/11/2021. The CDC does not take responsibility for the scientific validity " +
      "or accuracy of methodology, results, statistical analyses, or conclusions presented. This " +
      "dataset is not available for download, please press the button below to apply for access.",
    dataset_ids: [
      "cdc_restricted_data-by_race_county",
      "cdc_restricted_data-by_race_state",
      "cdc_restricted_data-by_age_county",
      "cdc_restricted_data-by_age_state",
      "cdc_restricted_data-by_sex_county",
      "cdc_restricted_data-by_sex_state",
    ],
    downloadable: false,
  },
  {
    id: "uhc",
    data_source_name: "America's Health Rankings",
    data_source_link:
      "https://www.americashealthrankings.org/explore/annual/measure/Overall_a/state/ALL",
    geographic_level: "State",
    demographic_granularity: "Race/ethnicity, age, sex",
    update_frequency: "Annual",
    description: "The prevalence of diabetes and COPD at the state level.",
    dataset_ids: ["uhc_age", "uhc_race_and_ethnicity", "uhc_sex"],
    downloadable: true,
  },
  {
    id: "covid_tracking_project",
    data_source_name: "Covid Tracking Project’s Racial Data Tracker",
    data_source_link: "https://covidtracking.com/race",
    geographic_level: "State",
    demographic_granularity: "Race/ethnicity",
    update_frequency: "Final update was March 7 2021",
    description:
      "The numbers of confirmed COVID-19 deaths, cases, hospitalizations, and tests at the state level. " +
      "Please note that Covid Tracking Project data is not used for any visualizations on the tracker, " +
      "it is only available for download.",
    dataset_ids: [
      "covid_tracking_project-cases_by_race_state",
      "covid_tracking_project-deaths_by_race_state",
      "covid_tracking_project-hospitalizations_by_race_state",
      "covid_tracking_project-tests_by_race_state",
    ],
    downloadable: true,
  },
];

export const DataSourceMetadataMap: Record<
  string,
  DataSourceMetadata
> = Object.fromEntries(dataSourceMetadataList.map((m) => [m.id, m]));
