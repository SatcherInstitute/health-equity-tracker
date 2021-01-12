import { DatasetMetadata, MetadataMap } from "./DatasetTypes";

const fakeMetadata: DatasetMetadata[] = [
  {
    id: "acs_population-by_race_state_std",
    name: "Population demographics",
    data_source_name: "American Community Survey 5-year estimates (2015-2019)",
    data_source_link:
      "https://www.census.gov/data/developers/data-sets/acs-5year.html",
    geographic_level: "State",
    demographic_granularity: "Race/ethnicity",
    update_frequency: "Annual",
    update_time: "unknown",
    description:
      "Description placeholder for Share of population. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed id lectus urna. Vestibulum lobortis ac quam vel tincidunt. Quisque ex erat, efficitur nec sagittis vitae, dictum semper arcu. Vivamus metus felis, fringilla sit amet metus nec, feugiat suscipit nisl. Morbi posuere mi sit amet elit posuere, id gravida ligula facilisis. Aenean gravida a eros fringilla venenatis.",
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
    id: "brfss",
    name: "COPD and Diabetes Prevalence",
    data_source_name: "CDC's BRFSS",
    data_source_link: "https://www.cdc.gov/brfss/index.html",
    geographic_level: "State",
    demographic_granularity: "Race/ethnicity",
    update_frequency: "Annual",
    update_time: "unknown",
    description:
      "Description placeholder for Diabetes Prevalence. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed id lectus urna. Vestibulum lobortis ac quam vel tincidunt. Quisque ex erat, efficitur nec sagittis vitae, dictum semper arcu. Vivamus metus felis, fringilla sit amet metus nec, feugiat suscipit nisl. Morbi posuere mi sit amet elit posuere, id gravida ligula facilisis. Aenean gravida a eros fringilla venenatis.",
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
      "Description placeholder for covid. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed id lectus urna. Vestibulum lobortis ac quam vel tincidunt. Quisque ex erat, efficitur nec sagittis vitae, dictum semper arcu. Vivamus metus felis, fringilla sit amet metus nec, feugiat suscipit nisl. Morbi posuere mi sit amet elit posuere, id gravida ligula facilisis. Aenean gravida a eros fringilla venenatis.",
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
