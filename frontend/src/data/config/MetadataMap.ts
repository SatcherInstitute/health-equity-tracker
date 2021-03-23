import { DataSourceMetadata } from "../utils/DatasetTypes";

const dataSourceMetadataList: DataSourceMetadata[] = [
  {
    id: "acs",
    data_source_name: "American Community Survey 5-year estimates (2015-2019)",
    data_source_link:
      "https://www.census.gov/data/developers/data-sets/acs-5year.html",
    geographic_level: "State",
    demographic_granularity: "Race/ethnicity, age, sex",
    update_frequency: "Annual",
    description:
      "Population percentages broken down by self-reported race/ethnicity, age, and sex at the U.S. and state levels.",
    dataset_ids: [
      "acs_population-by_race_county_std",
      "acs_population-by_race_state_std",
      "acs_population-by_age_state",
      "acs_population-by_age_county",
      "acs_population-by_sex_state",
      "acs_population-by_sex_county",
      "acs_health_insurance-health_insurance_by_race_state",
      "acs_health_insurance-health_insurance_by_race_county",
      "acs_health_insurance-health_insurance_by_sex_state",
      "acs_health_insurance-health_insurance_by_sex_county",
    ],
  },
  {
    id: "brfss",
    data_source_name: "Disease Prevalence: Diabetes and COPD",
    data_source_link: "https://www.cdc.gov/brfss/index.html",
    geographic_level: "State",
    demographic_granularity: "Race/ethnicity",
    update_frequency: "Annual",
    description:
      "The prevalence (percentage) for diseases broken down by self-reported race/ethnicity and sex at the U.S. and state levels.",
    dataset_ids: ["brfss"],
  },
  {
    id: "covid_tracking_project",
    data_source_name: "Covid Tracking Project’s Racial Data Tracker",
    data_source_link: "https://covidtracking.com/race",
    geographic_level: "State",
    demographic_granularity: "Race/ethnicity",
    update_frequency: "Annual",
    description:
      "The numbers of confirmed deaths, cases, and hospitalizations broken down by race/ethnicity at the U.S. and state levels.",
    dataset_ids: ["covid_by_state_and_race", "covid_by_county_and_race"],
  },
];

export const DataSourceMetadataMap: Record<
  string,
  DataSourceMetadata
> = Object.fromEntries(dataSourceMetadataList.map((m) => [m.id, m]));
