import { DatasetMetadata, MetadataMap } from "./DatasetTypes";

const fakeMetadata: DatasetMetadata[] = [
  {
    id: "acs_population-by_race_state_std - race",
    name: "Population demographics",
    data_source_name: "American Community Survey 5-year estimates (2015-2019)",
    data_source_link:
      "https://www.census.gov/data/developers/data-sets/acs-5year.html",
    geographic_level: "State",
    demographic_granularity: "Race/ethnicity, age, sex",
    update_frequency: "Annual",
    update_time: "unknown",
    description:
      "Population percentages broken down by self-reported race/ethnicity, age, and sex at the U.S. and state levels.",
    fields: [
      {
        data_type: "string",
        name: "state_name",
        description: "description",
        origin_dataset: "acs_state_population_by_race",
      },
      {
        data_type: "string",
        name: "state_fips",
        description: "description",
        origin_dataset: "acs_state_population_by_race",
      },
      {
        data_type: "string",
        name: "race_and_ethnicity",
        description: "description",
        origin_dataset: "acs_state_population_by_race",
      },
      {
        data_type: "integer",
        name: "population",
        description: "description",
        origin_dataset: "acs_state_population_by_race",
      },
    ],
  },
  {
    id: "acs_population-by_age_state",
    name: "Population demographics - age",
    data_source_name: "American Community Survey 5-year estimates (2015-2019)",
    data_source_link:
      "https://www.census.gov/data/developers/data-sets/acs-5year.html",
    geographic_level: "State",
    demographic_granularity: "Race/ethnicity, age, sex",
    update_frequency: "Annual",
    update_time: "unknown",
    description:
      "Population percentages broken down by self-reported race/ethnicity, age, and sex at the U.S. and state levels.",
    fields: [
      {
        data_type: "string",
        name: "state_name",
        description: "description",
        origin_dataset: "acs",
      },
      {
        data_type: "string",
        name: "state_fips",
        description: "description",
        origin_dataset: "acs",
      },
      {
        data_type: "string",
        name: "age",
        description: "description",
        origin_dataset: "acs",
      },
      {
        data_type: "integer",
        name: "population",
        description: "description",
        origin_dataset: "acs",
      },
    ],
  },
  {
    id: "brfss",
    name: "Disease Prevalence: Diabetes and COPD",
    data_source_name: "CDC's BRFSS",
    data_source_link: "https://www.cdc.gov/brfss/index.html",
    geographic_level: "State",
    demographic_granularity: "Race/ethnicity",
    update_frequency: "Annual",
    update_time: "unknown",
    description:
      "The prevalence (percentage) for diseases broken down by self-reported race/ethnicity and sex at the U.S. and state levels.",
    fields: [
      {
        data_type: "string",
        name: "state_name",
        description: "description",
        origin_dataset: "brfss",
      },
      {
        data_type: "string",
        name: "race_and_ethnicity",
        description: "description",
        origin_dataset: "brfss",
      },
      {
        data_type: "integer",
        name: "diabetes_count",
        description: "description",
        origin_dataset: "brfss",
      },
      {
        data_type: "integer",
        name: "copd_count",
        description: "description",
        origin_dataset: "brfss",
      },
    ],
  },
  {
    id: "covid_by_state_and_race",
    name: "COVID-19 deaths, cases, and hospitalizations",
    data_source_name: "Covid Tracking Project’s Racial Data Tracker",
    data_source_link: "https://covidtracking.com/race",
    geographic_level: "State",
    demographic_granularity: "Race/ethnicity",
    update_frequency: "Annual",
    update_time: "unknown",
    description:
      "The numbers of confirmed deaths, cases, and hospitalizations broken down by race/ethnicity at the U.S. and state levels.",
    fields: [
      {
        data_type: "string",
        name: "date",
        description: "description",
        origin_dataset: "covid_by_state_and_race",
      },
      {
        data_type: "string",
        name: "state_name",
        description: "description",
        origin_dataset: "covid_by_state_and_race",
      },
      {
        data_type: "string",
        name: "race_and_ethnicity",
        description: "description",
        origin_dataset: "covid_by_state_and_race",
      },
      {
        data_type: "integer",
        name: "Cases",
        description: "description",
        origin_dataset: "covid_by_state_and_race",
      },
      {
        data_type: "integer",
        name: "Deaths",
        description: "description",
        origin_dataset: "covid_by_state_and_race",
      },
      {
        data_type: "integer",
        name: "Hosp",
        description: "description",
        origin_dataset: "covid_by_state_and_race",
      },
    ],
  },
];

const FakeMetadataMap: MetadataMap = Object.fromEntries(
  fakeMetadata.map((m) => [m.id, m])
);

export default FakeMetadataMap;
