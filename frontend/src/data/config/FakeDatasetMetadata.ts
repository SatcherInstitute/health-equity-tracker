import { DatasetMetadata } from "../utils/DatasetTypes";
import { DataSourceMetadataMap, GEOGRAPHIES_DATASET_ID } from "./MetadataMap";

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
    name: "Population by Sex and State",
    update_time: "2019",
  },
  {
    id: "acs_population-by_sex_county",
    name: "Population by Sex and County",
    update_time: "2019",
  },
  {
    id: "acs_2010_population-by_race_and_ethnicity_territory",
    name: "Population by Race and Territory",
    update_time: "2010",
  },
  {
    id: "acs_2010_population-by_sex_territory",
    name: "Population by Sex and Territory",
    update_time: "2010",
  },
  {
    id: "acs_2010_population-by_age_territory",
    name: "Population by Sex and Territory",
    update_time: "2010",
  },
  {
    id: "covid_tracking_project-cases_by_race_state",
    name: "COVID-19 Cases by Race and State",
    update_time: "April 2021",
  },
  {
    id: "covid_tracking_project-deaths_by_race_state",
    name: "COVID-19 Deaths by Race and State",
    update_time: "April 2021",
  },
  {
    id: "covid_tracking_project-hospitalizations_by_race_state",
    name: "COVID-19 Hospitalizations by Race and State",
    update_time: "April 2021",
  },
  {
    id: "covid_tracking_project-tests_by_race_state",
    name: "COVID-19 Tests by Race and State",
    update_time: "April 2021",
  },
  {
    id: "acs_health_insurance-health_insurance_by_sex_age_county",
    name: "Health Insurance by Sex, Age and County",
    update_time: "2019",
  },
  {
    id: "acs_health_insurance-health_insurance_by_sex_age_state",
    name: "Health Insurance by Sex, Age and State",
    update_time: "2019",
  },
  {
    id: "acs_health_insurance-health_insurance_by_race_age_state",
    name: "Health Insurance by Race, Age and State",
    update_time: "2019",
  },
  {
    id: "acs_health_insurance-health_insurance_by_race_age_county",
    name: "Health Insurance by Race, Age and County",
    update_time: "2019",
  },
  {
    id: "acs_poverty_dataset-poverty_by_race_age_sex_state",
    name: "Poverty by Race, Age, Sex, and State",
    update_time: "2019",
  },
  {
    id: "acs_poverty_dataset-poverty_by_race_age_sex_county",
    name: "Poverty by Race, Age, Sex, and County",
    update_time: "2019",
  },
  {
    id: "cdc_restricted_data-by_race_county",
    name: "COVID-19 Deaths, Cases, and Hospitalizations by Race and County",
    update_time: "October 2021",
  },
  {
    id: "cdc_restricted_data-by_race_state",
    name: "COVID-19 Deaths, Cases, and Hospitalizations by Race and State",
    update_time: "October 2021",
  },
  {
    id: "cdc_restricted_data-by_age_county",
    name: "COVID-19 Deaths, Cases, and Hospitalizations by Age and County",
    update_time: "October 2021",
  },
  {
    id: "cdc_restricted_data-by_age_state",
    name: "COVID-19 Deaths, Cases, and Hospitalizations by Age and State",
    update_time: "October 2021",
  },
  {
    id: "cdc_restricted_data-by_sex_county",
    name: "COVID-19 Deaths, Cases, and Hospitalizations by Sex and County",
    update_time: "October 2021",
  },
  {
    id: "cdc_restricted_data-by_sex_state",
    name: "COVID-19 Deaths, Cases, and Hospitalizations by Sex and State",
    update_time: "October 2021",
  },
  {
    id: "cdc_vaccination_county-race_and_ethnicity",
    name: "COVID-19 Vaccinations by County",
    update_time: "October 2021",
  },
  {
    id: "cdc_vaccination_national-age",
    name: "COVID-19 Vaccination Demographics by Age",
    update_time: "October 2021",
  },
  {
    id: "cdc_vaccination_national-sex",
    name: "COVID-19 Vaccination Demographics by Sex",
    update_time: "October 2021",
  },
  {
    id: "cdc_vaccination_national-race_and_ethnicity",
    name: "COVID-19 Vaccination Demographics by Race",
    update_time: "October 2021",
  },
  {
    id: "kff_vaccination-race_and_ethnicity",
    name: "COVID-19 Indicators",
    update_time: "October 2021",
  },
  {
    id: "uhc_data-age",
    name: "COPD and Diabetes Prevalence by Age and State",
    update_time: "2019",
  },
  {
    id: "uhc_data-race_and_ethnicity",
    name: "COPD and Diabetes Prevalence by Race and State",
    update_time: "2019",
  },
  {
    id: "uhc_data-sex",
    name: "COPD and Diabetes Prevalence by Sex and State",
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
