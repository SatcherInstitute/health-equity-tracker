import { DatasetMetadata } from "../utils/DatasetTypes";
import { DataSourceMetadataMap } from "./MetadataMap";

const datasetMetadataList: DatasetMetadata[] = [
  {
    id: "acs_population-by_race_county_std",
    name: "Population by Race and County",
    update_time: "2019",
  },
  {
    id: "acs_population-by_race_state_std",
    name: "Population by Race and State",
    update_time: "2019",
  },
  {
    id: "acs_population-by_age_state",
    name: "Population by Age and State",
    update_time: "2019",
  },
  {
    id: "acs_population-by_age_county",
    name: "Population by Age and County",
    update_time: "2019",
  },
  {
    id: "acs_population-by_sex_state",
    name: "Population by Gender and State",
    update_time: "2019",
  },
  {
    id: "acs_population-by_sex_county",
    name: "Population by Gender and County",
    update_time: "2019",
  },
  {
    id: "covid_by_state_and_race",
    name: "COVID-19 deaths, cases, and hospitalizations by state",
    update_time: "April 2021",
  },
  {
    id: "covid_by_county_and_race",
    name: "COVID-19 deaths, cases, and hospitalizations by county",
    update_time: "April 2021",
  },
  {
    id: "acs_health_insurance-health_insurance_by_sex_age_county",
    name: "Health Insurance By Sex, Age and County",
    update_time: "2019",
  },
  {
    id: "acs_health_insurance-health_insurance_by_sex_age_state",
    name: "Health Insurance By Sex, Age and State",
    update_time: "2019",
  },
  {
    id: "acs_health_insurance-health_insurance_by_race_age_state",
    name: "Health Insurance By Race, Age and State",
    update_time: "2019",
  },
  {
    id: "acs_health_insurance-health_insurance_by_race_age_county",
    name: "Health Insurance By Race, Age and County",
    update_time: "2019",
  },
  {
    id: "acs_poverty_dataset-poverty_by_race_age_sex_state",
    name: "Poverty By Race, Age, Sex, and State",
    update_time: "2019",
  },
  {
    id: "acs_poverty_dataset-poverty_by_race_age_sex_county",
    name: "Poverty By Race, Age, Sex, and County",
    update_time: "2019",
  },
  {
    id: "cdc_restricted_data-by_race_county",
    name: "COVID-19 deaths, cases, and hospitalizations by race and county",
    update_time: "April 2021",
  },
  {
    id: "cdc_restricted_data-by_race_state",
    name: "COVID-19 deaths, cases, and hospitalizations by race and state",
    update_time: "April 2021",
  },
  {
    id: "cdc_restricted_data-by_age_county",
    name: "COVID-19 deaths, cases, and hospitalizations by age and county",
    update_time: "April 2021",
  },
  {
    id: "cdc_restricted_data-by_age_state",
    name: "COVID-19 deaths, cases, and hospitalizations by age and state",
    update_time: "April 2021",
  },
  {
    id: "cdc_restricted_data-by_sex_county",
    name: "COVID-19 deaths, cases, and hospitalizations by gender and county",
    update_time: "April 2021",
  },
  {
    id: "cdc_restricted_data-by_sex_state",
    name: "COVID-19 deaths, cases, and hospitalizations by gender and state",
    update_time: "April 2021",
  },
  {
    id: "uhc_age",
    name: "COPD and Diabetes prevalence by age and state",
    update_time: "2019",
  },
  {
    id: "uhc_race_and_ethnicity",
    name: "COPD and Diabetes prevalence by race and state",
    update_time: "2019",
  },
  {
    id: "uhc_sex",
    name: "COPD and Diabetes prevalence by sex and state",
    update_time: "2019",
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
