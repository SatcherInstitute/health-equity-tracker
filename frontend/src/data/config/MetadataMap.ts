import { DatasetMetadata, DataSourceMetadata } from "../utils/DatasetTypes";

const datasetMetadataList: DatasetMetadata[] = [
  {
    id: "acs_population-by_race_county_std",
    name: "Population by Race and County",
    update_time: "January",
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
    id: "acs_population-by_race_state_std",
    name: "Population by Race and State",
    update_time: "February",
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
    name: "Population by Age and State",
    update_time: "March",
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
    id: "acs_population-by_age_county",
    name: "Population by Age and County",
    update_time: "April",
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
    id: "acs_population-by_sex_state",
    name: "Population by Sex and State",
    update_time: "May",
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
    id: "acs_population-by_sex_county",
    name: "Population by Sex and County",
    update_time: "June",
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
    update_time: "July",
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
    name: "COVID-19 deaths, cases, and hospitalizations by state",
    update_time: "August",
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
  {
    id: "covid_by_county_and_race",
    name: "COVID-19 deaths, cases, and hospitalizations by county",
    update_time: "September",
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

export const FakeDatasetMetadataMap: Record<
  string,
  DatasetMetadata
> = Object.fromEntries(
  datasetMetadataList.map((m) => {
    let metadataWithSource = m;
    let test = Object.values(DataSourceMetadataMap).find((metadata) =>
      metadata.dataset_ids.includes(m.id)
    );
    metadataWithSource.source_id = test ? test.id : "error";
    return [m.id, metadataWithSource];
  })
);
