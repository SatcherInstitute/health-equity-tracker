import { DatasetMetadata, MetadataMap } from "./DatasetTypes";

const fakeMetadata: DatasetMetadata[] = [
  {
    id: "acs_population-by_race_state_std",
    name: "Share of population by state and race",
    data_source_name: "American Community Survey 5-year estimates (2014-2018)",
    data_source_link:
      "https://www.census.gov/data/developers/data-sets/acs-5year.html",
    geographic_level: "State",
    demographic_granularity: "Race/ethnicity",
    update_frequency: "??",
    update_time: "March 2, 2020",
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
    id: "covid_deaths",
    name: "COVID-19 Deaths",
    data_source_name: "CDC Provisional Death Counts for COVID-19",
    data_source_link:
      "https://www.cdc.gov/nchs/covid19/covid-19-mortality-data-files.htm",
    geographic_level: "County",
    demographic_granularity: "Race/ethnicity",
    update_frequency: "Daily",
    update_time: "March 2, 2020",
    description:
      "Description placeholder for COVID-19 Deaths. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed id lectus urna. Vestibulum lobortis ac quam vel tincidunt. Quisque ex erat, efficitur nec sagittis vitae, dictum semper arcu. Vivamus metus felis, fringilla sit amet metus nec, feugiat suscipit nisl. Morbi posuere mi sit amet elit posuere, id gravida ligula facilisis. Aenean gravida a eros fringilla venenatis.",
    fields: [
      {
        data_type: "string",
        name: "fakefield1",
        description: "description",
        origin_dataset: "origin_dataset",
      },
    ],
  },
  {
    id: "social_vulernability",
    name: "Social Vulnerability Index",
    data_source_name: "CDC's Social Vulernability Index",
    data_source_link:
      "https://www.atsdr.cdc.gov/placeandhealth/svi/data_documentation_download.html",
    geographic_level: "State, County",
    demographic_granularity: "No demographic breakdown",
    update_frequency: "Every 2 years",
    update_time: "March 2, 2020",
    description:
      "Description placeholder for Social Vulnerability Index. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed id lectus urna. Vestibulum lobortis ac quam vel tincidunt. Quisque ex erat, efficitur nec sagittis vitae, dictum semper arcu. Vivamus metus felis, fringilla sit amet metus nec, feugiat suscipit nisl. Morbi posuere mi sit amet elit posuere, id gravida ligula facilisis. Aenean gravida a eros fringilla venenatis.",
    fields: [
      {
        data_type: "string",
        name: "fakefield1",
        description: "description",
        origin_dataset: "origin_dataset",
      },
    ],
  },
  {
    id: "brfss",
    name: "Diabetes Prevalence by state and race",
    data_source_name: "CDC's BrFSS",
    data_source_link: "https://gis.cdc.gov/grasp/diabetes/DiabetesAtlas.html#",
    geographic_level: "State",
    demographic_granularity: "Race/ethnicity",
    update_frequency: "?",
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
    name: "Covid deaths, cases, and hospitalizations by state and race",
    data_source_name: "Covid tracking project",
    data_source_link: "https://covidtracking.com/race",
    geographic_level: "State",
    demographic_granularity: "Race/ethnicity",
    update_frequency: "?",
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
