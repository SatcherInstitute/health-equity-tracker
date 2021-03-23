import { DatasetMetadata } from "../utils/DatasetTypes";
import { DataSourceMetadataMap } from "./MetadataMap";

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
  {
    id: "acs_health_insurance-health_insurance_by_race_state",
    name: "Health Insurance By Race and County",
    update_time: "February",
    fields: [],
  },
  {
    id: "acs_health_insurance-health_insurance_by_race_county",
    name: "Health Insurance By Race and State",
    update_time: "February",
    fields: [],
  },
  {
    id: "acs_health_insurance-health_insurance_by_sex_state",
    name: "Health Insurance By Sex and County",
    update_time: "February",
    fields: [],
  },
  {
    id: "acs_health_insurance-health_insurance_by_sex_county",
    name: "Health Insurance By Sex and State",
    update_time: "February",
    fields: [],
  },
];

export const FakeDatasetMetadataMap: Record<
  string,
  DatasetMetadata
> = Object.fromEntries(
  datasetMetadataList.map((m) => {
    let metadataWithSource = m;
    const dataSource = Object.values(DataSourceMetadataMap).find((metadata) =>
      metadata.dataset_ids.includes(m.id)
    );
    metadataWithSource.source_id = dataSource ? dataSource.id : "error";
    return [m.id, metadataWithSource];
  })
);
