import { DatasetMetadata } from "../utils/DatasetTypes";
import { DataSourceMetadataMap, GEOGRAPHIES_DATASET_ID } from "./MetadataMap";

const datasetMetadataList: DatasetMetadata[] = [
  {
    id: "acs_population-by_race_county_std",
    name: "Population by race and county",
    update_time: "2019",
  },
  {
    id: "acs_population-by_race_state_std",
    name: "Population by race and state",
    update_time: "2019",
  },
  {
    id: "acs_population-by_age_state",
    name: "Population by age and state",
    update_time: "2019",
  },
  {
    id: "acs_population-by_age_county",
    name: "Population by age and county",
    update_time: "2019",
  },
  {
    id: "acs_population-by_sex_state",
    name: "Population by sex and state",
    update_time: "2019",
  },
  {
    id: "acs_population-by_sex_county",
    name: "Population by sex and county",
    update_time: "2019",
  },
  {
    id: "acs_2010_population-by_race_and_ethnicity_territory",
    name: "Population by race and territory",
    update_time: "2010",
  },
  {
    id: "acs_2010_population-by_sex_territory",
    name: "Population by sex and territory",
    update_time: "2010",
  },
  {
    id: "acs_2010_population-by_age_territory",
    name: "Population by sex and territory",
    update_time: "2010",
  },
  {
    id: "covid_tracking_project-cases_by_race_state",
    name: "COVID-19 cases by race and state",
    update_time: "April 2021",
  },
  {
    id: "covid_tracking_project-deaths_by_race_state",
    name: "COVID-19 deaths by race and state",
    update_time: "April 2021",
  },
  {
    id: "covid_tracking_project-hospitalizations_by_race_state",
    name: "COVID-19 hospitalizations by race and state",
    update_time: "April 2021",
  },
  {
    id: "covid_tracking_project-tests_by_race_state",
    name: "COVID-19 tests by race and state",
    update_time: "April 2021",
  },
  {
    id: "acs_health_insurance-health_insurance_by_sex_age_county",
    name: "Health insurance by sex, age and county",
    update_time: "2019",
  },
  {
    id: "acs_health_insurance-health_insurance_by_sex_age_state",
    name: "Health insurance by sex, age and state",
    update_time: "2019",
  },
  {
    id: "acs_health_insurance-health_insurance_by_race_age_state",
    name: "Health insurance by race, age and state",
    update_time: "2019",
  },
  {
    id: "acs_health_insurance-health_insurance_by_race_age_county",
    name: "Health insurance by race, age and county",
    update_time: "2019",
  },
  {
    id: "acs_poverty_dataset-poverty_by_race_age_sex_state",
    name: "Poverty by race, age, sex, and state",
    update_time: "2019",
  },
  {
    id: "acs_poverty_dataset-poverty_by_race_age_sex_county",
    name: "Poverty by race, age, sex, and county",
    update_time: "2019",
  },
  {
    id: "cdc_restricted_data-by_race_county",
    name: "COVID-19 deaths, cases, and hospitalizations by race and county",
    update_time: "October 2021",
  },
  {
    id: "cdc_restricted_data-by_race_state",
    name: "COVID-19 deaths, cases, and hospitalizations by race and state",
    update_time: "October 2021",
  },
  {
    id: "cdc_restricted_data-by_age_county",
    name: "COVID-19 deaths, cases, and hospitalizations by age and county",
    update_time: "October 2021",
  },
  {
    id: "cdc_restricted_data-by_age_state",
    name: "COVID-19 deaths, cases, and hospitalizations by age and state",
    update_time: "October 2021",
  },
  {
    id: "cdc_restricted_data-by_sex_county",
    name: "COVID-19 deaths, cases, and hospitalizations by sex and county",
    update_time: "October 2021",
  },
  {
    id: "cdc_restricted_data-by_sex_state",
    name: "COVID-19 deaths, cases, and hospitalizations by sex and state",
    update_time: "October 2021",
  },
  {
    id: "cdc_vaccination_county-race_and_ethnicity",
    name: "COVID-19 vaccinations by county",
    update_time: "October 2021",
  },
  {
    id: "cdc_vaccination_national-age",
    name: "COVID-19 vaccination demographics by age",
    update_time: "October 2021",
  },
  {
    id: "cdc_vaccination_national-sex",
    name: "COVID-19 vaccination demographics by sex",
    update_time: "October 2021",
  },
  {
    id: "cdc_vaccination_national-race_and_ethnicity",
    name: "COVID-19 vaccination demographics by race",
    update_time: "October 2021",
  },
  {
    id: "kff_vaccination-race_and_ethnicity",
    name: "COVID-19 indicators",
    update_time: "October 2021",
  },
  {
    id: "uhc_data-age",
    name: "COPD and diabetes prevalence by age and state",
    update_time: "2019",
  },
  {
    id: "uhc_data-race_and_ethnicity",
    name: "COPD and diabetes prevalence by race and state",
    update_time: "2019",
  },
  {
    id: "uhc_data-sex",
    name: "COPD and diabetes prevalence by sex and state",
    update_time: "2019",
  },
  {
    id: GEOGRAPHIES_DATASET_ID,
    name: "U.S. Geographic Data",
    update_time: "2020",
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
