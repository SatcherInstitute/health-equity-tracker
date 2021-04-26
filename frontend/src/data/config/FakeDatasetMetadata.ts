import { DatasetMetadata } from "../utils/DatasetTypes";
import { DataSourceMetadataMap } from "./MetadataMap";

const datasetMetadataList: DatasetMetadata[] = [
  {
    id: "acs_population-by_race_county_std",
    name: "Population by Race and County",
    update_time: "2019",
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
    update_time: "2019",
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
    update_time: "2019",
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
    update_time: "2019",
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
    name: "Population by Gender and State",
    update_time: "2019",
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
    name: "Population by Gender and County",
    update_time: "2019",
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
    update_time: "2019",
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
    update_time: "March 2021",
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
    update_time: "March 2021",
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
    id: "acs_health_insurance-health_insurance_by_sex_age_county",
    name: "Health Insurance By Sex, Age and County",
    update_time: "2019",
    fields: [],
  },
  {
    id: "acs_health_insurance-health_insurance_by_sex_age_state",
    name: "Health Insurance By Sex, Age and State",
    update_time: "2019",
    fields: [],
  },
  {
    id: "acs_health_insurance-health_insurance_by_race_age_state",
    name: "Health Insurance By Race, Age and State",
    update_time: "2019",
    fields: [],
  },
  {
    id: "acs_health_insurance-health_insurance_by_race_age_county",
    name: "Health Insurance By Race, Age and County",
    update_time: "2019",
    fields: [],
  },
  {
    id: "acs_poverty_dataset-poverty_by_race_age_sex_state",
    name: "Poverty By Race, Age, Sex, and State",
    update_time: "2019",
    fields: [],
  },
  {
    id: "acs_poverty_dataset-poverty_by_race_age_sex_county",
    name: "Poverty By Race, Age, Sex, and County",
    update_time: "2019",
    fields: [],
  },
  {
    id: "cdc_restricted_data-by_race_county",
    name: "COVID-19 deaths, cases, and hospitalizations by race and county",
    update_time: "March 2021",
    fields: [],
  },
  {
    id: "cdc_restricted_data-by_race_state",
    name: "COVID-19 deaths, cases, and hospitalizations by race and state",
    update_time: "March 2021",
    fields: [],
  },
  {
    id: "cdc_restricted_data-by_age_county",
    name: "COVID-19 deaths, cases, and hospitalizations by age and county",
    update_time: "March 2021",
    fields: [],
  },
  {
    id: "cdc_restricted_data-by_age_state",
    name: "COVID-19 deaths, cases, and hospitalizations by age and state",
    update_time: "March 2021",
    fields: [],
  },
  {
    id: "cdc_restricted_data-by_sex_county",
    name: "COVID-19 deaths, cases, and hospitalizations by gender and county",
    update_time: "March 2021",
    fields: [],
  },
  {
    id: "cdc_restricted_data-by_sex_state",
    name: "COVID-19 deaths, cases, and hospitalizations by gender and state",
    update_time: "March 2021",
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
