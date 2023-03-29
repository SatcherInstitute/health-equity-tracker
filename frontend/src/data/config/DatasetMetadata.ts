import { DatasetMetadata } from "../utils/DatasetTypes";
import { DataSourceMetadataMap, GEOGRAPHIES_DATASET_ID } from "./MetadataMap";

export const datasetMetadataList: DatasetMetadata[] = [
  {
    id: "acs_population-by_race_county",
    name: "Population by race/ethnicity and county",
    update_time: "2019",
  },
  {
    id: "acs_population-by_race_state",
    name: "Population by race/ethnicity and state",
    update_time: "2019",
  },
  {
    id: "acs_population-by_race_national",
    name: "Population by race/ethnicity nationally",
    update_time: "2019",
  },
  {
    id: "acs_population-by_age_county",
    name: "Population by age and county",
    update_time: "2019",
  },
  {
    id: "acs_population-by_age_state",
    name: "Population by age and state",
    update_time: "2019",
  },
  {
    id: "acs_population-by_age_national",
    name: "Population by age nationally",
    update_time: "2019",
  },
  {
    id: "acs_population-by_sex_county",
    name: "Population by sex and county",
    update_time: "2019",
  },
  {
    id: "acs_population-by_sex_state",
    name: "Population by sex and state",
    update_time: "2019",
  },
  {
    id: "acs_population-by_sex_national",
    name: "Population by sex nationally",
    update_time: "2019",
  },
  {
    id: "cdc_hiv_data-race_and_ethnicity_county_time_series",
    name: "HIV diagnoses, deaths, and PrEP coverage by race/ethnicity and county",
    update_time: "2019",
    contains_nh: true,
  },
  {
    id: "cdc_hiv_data-race_and_ethnicity_state_time_series",
    name: "HIV diagnoses, deaths, and PrEP coverage by race/ethnicity and state",
    update_time: "2019",
    contains_nh: true,
    contains_other_nh: true,
  },
  {
    id: "cdc_hiv_data-race_and_ethnicity_national_time_series",
    name: "HIV diagnoses, deaths, and PrEP coverage by race/ethnicity nationally",
    update_time: "2019",
    contains_nh: true,
    contains_other_nh: true,
  },
  {
    id: "cdc_hiv_data-age_county_time_series",
    name: "HIV diagnoses, deaths, and PrEP coverage by age and county",
    update_time: "2019",
    contains_nh: true,
  },
  {
    id: "cdc_hiv_data-age_state_time_series",
    name: "HIV diagnoses, deaths, and PrEP coverage by age and state",
    update_time: "2019",
    contains_nh: true,
  },
  {
    id: "cdc_hiv_data-age_national_time_series",
    name: "HIV diagnoses, deaths, and PrEP coverage by age nationally",
    update_time: "2019",
    contains_nh: true,
  },
  {
    id: "cdc_hiv_data-sex_county_time_series",
    name: "HIV diagnoses, deaths, and PrEP coverage by sex and county",
    update_time: "2019",
    contains_nh: true,
  },
  {
    id: "cdc_hiv_data-sex_state_time_series",
    name: "HIV diagnoses, deaths, and PrEP coverage by sex and state",
    update_time: "2019",
    contains_nh: true,
  },
  {
    id: "cdc_hiv_data-sex_national_time_series",
    name: "HIV diagnoses, deaths, and PrEP coverage by sex nationally",
    update_time: "2019",
    contains_nh: true,
  },
  {
    id: "decia_2010_territory_population-by_race_and_ethnicity_territory_state_level",
    name: "Population by race/ethnicity and Census Island Area territory",
    update_time: "2010",
  },
  {
    id: "decia_2010_territory_population-by_sex_territory_state_level",
    name: "Population by sex and Census Island Area territory",
    update_time: "2010",
  },
  {
    id: "decia_2010_territory_population-by_age_territory_state_level",
    name: "Population by age and Census Island Area territory",
    update_time: "2010",
  },
  {
    id: "decia_2020_territory_population-by_race_and_ethnicity_territory_state_level",
    name: "Population by race/ethnicity and Census Island Area territory",
    update_time: "2020",
  },
  {
    id: "decia_2020_territory_population-by_sex_territory_state_level",
    name: "Population by sex and Census Island Area territory",
    update_time: "2020",
  },
  {
    id: "decia_2020_territory_population-by_age_territory_state_level",
    name: "Population by age and Census Island Area territory",
    update_time: "2020",
  },
  {
    id: "decia_2020_territory_population-by_race_and_ethnicity_territory_county_level",
    name: "Population by race/ethnicity and Census Island Area territory county-equivalent",
    update_time: "2020",
  },
  {
    id: "decia_2020_territory_population-by_sex_territory_county_level",
    name: "Population by sex and Census Island Area territory county-equivalent",
    update_time: "2020",
  },
  {
    id: "decia_2020_territory_population-by_age_territory_county_level",
    name: "Population by age and Census Island Area territory county-equivalent",
    update_time: "2020",
  },
  {
    id: "covid_tracking_project-cases_by_race_state",
    name: "COVID-19 cases by race/ethnicity and state",
    update_time: "April 2021",
  },
  {
    id: "covid_tracking_project-deaths_by_race_state",
    name: "COVID-19 deaths by race/ethnicity and state",
    update_time: "April 2021",
  },
  {
    id: "covid_tracking_project-hospitalizations_by_race_state",
    name: "COVID-19 hospitalizations by race/ethnicity and state",
    update_time: "April 2021",
  },
  {
    id: "covid_tracking_project-tests_by_race_state",
    name: "COVID-19 tests by race/ethnicity and state",
    update_time: "April 2021",
  },
  {
    id: "acs_condition-by_age_county_processed",
    name: "Health insurance and poverty by age and county",
    update_time: "2019",
  },
  {
    id: "acs_condition-by_age_state_processed",
    name: "Health insurance and poverty by age and state",
    update_time: "2019",
  },
  {
    id: "acs_condition-by_age_national_processed",
    name: "Health insurance and poverty by age at the national level",
    update_time: "2019",
  },
  {
    id: "acs_condition-by_sex_county_processed",
    name: "Health insurance and poverty by sex and county",
    update_time: "2019",
  },
  {
    id: "acs_condition-by_sex_state_processed",
    name: "Health insurance and poverty by sex and state",
    update_time: "2019",
  },
  {
    id: "acs_condition-by_sex_national_processed",
    name: "Health insurance and poverty by sex at the national level",
    update_time: "2019",
  },
  {
    id: "acs_condition-by_race_county_processed",
    name: "Health insurance and poverty by race and county",
    update_time: "2019",
  },
  {
    id: "acs_condition-by_race_state_processed",
    name: "Health insurance and poverty by race and state",
    update_time: "2019",
  },
  {
    id: "acs_condition-by_race_national_processed",
    name: "Health insurance and poverty by race at the national level",
    update_time: "2019",
  },
  {
    id: "cdc_restricted_data-by_race_county_processed_time_series",
    name: "Monthly COVID-19 deaths, cases, and hospitalizations by race/ethnicity and county",
    update_time: "March 2023",
    contains_nh: true,
  },
  {
    id: "cdc_restricted_data-by_race_state_processed_time_series",
    name: "Monthly COVID-19 deaths, cases, and hospitalizations by race/ethnicity and state",
    update_time: "March 2023",
    contains_nh: true,
  },
  {
    id: "cdc_restricted_data-by_race_national_processed_time_series",
    name: "Monthly COVID-19 deaths, cases, and hospitalizations by race/ethnicity, nationally",
    update_time: "March 2023",
    contains_nh: true,
  },
  {
    id: "cdc_restricted_data-by_age_county_processed_time_series",
    name: "Monthly COVID-19 deaths, cases, and hospitalizations by age and county",
    update_time: "March 2023",
  },
  {
    id: "cdc_restricted_data-by_age_state_processed_time_series",
    name: "Monthly COVID-19 deaths, cases, and hospitalizations by age and state",
    update_time: "March 2023",
  },
  {
    id: "cdc_restricted_data-by_age_national_processed_time_series",
    name: "Monthly COVID-19 deaths, cases, and hospitalizations by age, nationally",
    update_time: "March 2023",
  },
  {
    id: "cdc_restricted_data-by_sex_county_processed_time_series",
    name: "Monthly COVID-19 deaths, cases, and hospitalizations by sex and county",
    update_time: "March 2023",
  },
  {
    id: "cdc_restricted_data-by_sex_state_processed_time_series",
    name: "Monthly COVID-19 deaths, cases, and hospitalizations by sex and state",
    update_time: "March 2023",
  },
  {
    id: "cdc_restricted_data-by_sex_national_processed_time_series",
    name: "Monthly COVID-19 deaths, cases, and hospitalizations by sex, nationally",
    update_time: "March 2023",
  },
  {
    id: "cdc_restricted_data-by_race_county_processed",
    name: "COVID-19 deaths, cases, and hospitalizations since January 2020 by race/ethnicity and county",
    update_time: "March 2023",
    contains_nh: true,
  },
  {
    id: "cdc_restricted_data-by_race_state_processed-with_age_adjust",
    name: "COVID-19 deaths, cases, and hospitalizations with age-adjusted risk ratios since January 2020 by race/ethnicity and state",
    update_time: "March 2023",
    contains_nh: true,
  },
  {
    id: "cdc_restricted_data-by_race_national_processed-with_age_adjust",
    name: "COVID-19 deaths, cases, and hospitalizations with age-adjusted risk ratios since January 2020 by race/ethnicity, nationally",
    update_time: "March 2023",
    contains_nh: true,
  },
  {
    id: "cdc_restricted_data-by_age_county_processed",
    name: "COVID-19 deaths, cases, and hospitalizations since January 2020 by age and county",
    update_time: "March 2023",
  },
  {
    id: "cdc_restricted_data-by_age_state_processed",
    name: "COVID-19 deaths, cases, and hospitalizations since January 2020 by age and state",
    update_time: "March 2023",
  },
  {
    id: "cdc_restricted_data-by_age_national_processed",
    name: "COVID-19 deaths, cases, and hospitalizations since January 2020 by age, nationally",
    update_time: "March 2023",
  },
  {
    id: "cdc_restricted_data-by_sex_county_processed",
    name: "COVID-19 deaths, cases, and hospitalizations since January 2020 by sex and county",
    update_time: "March 2023",
  },
  {
    id: "cdc_restricted_data-by_sex_state_processed",
    name: "COVID-19 deaths, cases, and hospitalizations since January 2020 by sex and state",
    update_time: "March 2023",
  },
  {
    id: "cdc_restricted_data-by_sex_national_processed",
    name: "COVID-19 deaths, cases, and hospitalizations since January 2020 by sex, nationally",
    update_time: "March 2023",
  },
  {
    id: "cdc_svi_county-age",
    name: "National SVI (Social Vulnerability Index) by county",
    update_time: "2020",
  },
  {
    id: "cdc_vaccination_county-race_and_ethnicity_processed",
    name: "COVID-19 vaccinations by county",
    contains_nh: true,
    update_time: "March 2023",
  },
  {
    id: "cdc_vaccination_national-age_processed",
    name: "COVID-19 vaccinations by age, nationally",
    update_time: "March 2023",
  },
  {
    id: "cdc_vaccination_national-sex_processed",
    name: "COVID-19 vaccinations by sex, nationally",
    update_time: "March 2023",
  },
  {
    id: "cdc_vaccination_national-race_processed",
    name: "COVID-19 vaccinations by race and ethnicity, nationally",
    update_time: "March 2023",
    contains_nh: true,
  },
  {
    id: "kff_vaccination-race_and_ethnicity_processed",
    name: "COVID-19 vaccinations by race and ethnicity by state/territory",
    update_time: "July 2022",
    contains_nh: true,
  },
  {
    id: "uhc_data-age_national",
    name: "Prevalence of multiple chronic disease, behavioral health, and social determinants of health by age, nationally",
    update_time: "2021",
  },
  {
    id: "uhc_data-race_and_ethnicity_national",
    name: "Prevalence of multiple chronic disease, behavioral health, and social determinants of health by race/ethnicity, nationally",
    update_time: "2021",
    contains_nh: true,
  },
  {
    id: "uhc_data-sex_national",
    name: "Prevalence of multiple chronic disease, behavioral health, and social determinants of health by sex, nationally",
    update_time: "2021",
  },
  {
    id: "uhc_data-age_state",
    name: "Prevalence of multiple chronic disease, behavioral health, and social determinants of health by age and state",
    update_time: "2021",
  },
  {
    id: "uhc_data-race_and_ethnicity_state",
    name: "Prevalence of multiple chronic disease, behavioral health, and social determinants of health by race/ethnicity and state",
    update_time: "2021",
    contains_nh: true,
  },
  {
    id: "uhc_data-sex_state",
    name: "Prevalence of multiple chronic disease, behavioral health, and social determinants of health by sex and state",
    update_time: "2021",
  },
  {
    id: "bjs_incarceration_data-age_national",
    name: "National rates of sentenced individuals under the jurisdiction of federal or state adult prison facilities, or confined in local adult jail facilities, by age",
    update_time: "2019 for jail, 2020 for prison",
  },
  {
    id: "bjs_incarceration_data-age_state",
    name: "Rates of individuals under the jurisdiction of state or territory prison facilities, by state/territory (totals only), or confined in local adult jail facilities by age, by state/territory",
    update_time: "2019 for jail, 2020 for prison",
  },
  {
    id: "bjs_incarceration_data-race_and_ethnicity_national",
    name: "National rates of individuals under the jurisdiction of federal or state adult prison facilities or confined in local adult jail facilities, by race/ethnicity",
    update_time: "2019 for jail, 2020 for prison",
    contains_nh: true,
  },
  {
    id: "bjs_incarceration_data-race_and_ethnicity_state",
    name: "Rates of individuals under the jurisdiction of state or territory prison facilities or confined in local adult jail facilities, by race/ethnicity and state/territory",
    update_time: "2019 for jail, 2020 for prison",
    contains_nh: true,
  },
  {
    id: "bjs_incarceration_data-sex_national",
    name: "National rates of individuals under the jurisdiction of federal or state adult prison facilities or confined in local adult jail facilities, by sex",
    update_time: "2019 for jail, 2020 for prison",
  },
  {
    id: "bjs_incarceration_data-sex_state",
    name: "Rates of individuals under the jurisdiction of state or territory prison facilities or confined in local adult jail facilities, by sex and state/territory",
    update_time: "2019 for jail, 2020 for prison",
  },
  {
    id: "vera_incarceration_county-by_race_and_ethnicity_county_time_series",
    name: "Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county. or confined in local adult jail facilities, by race/ethnicity",
    update_time: "2016 for prison, 2018 for jail",
    contains_nh: true,
  },
  {
    id: "vera_incarceration_county-by_age_county_time_series",
    name: "Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county. or confined in local adult jail facilities, by age",
    update_time: "2016 for prison, 2018 for jail",
    contains_nh: true,
  },
  {
    id: "vera_incarceration_county-by_sex_county_time_series",
    name: "Rates of individuals under the jurisdiction of a state prison system on charges arising from a criminal case in a specific county. or confined in local adult jail facilities, by sex",
    update_time: "2016 for prison, 2018 for jail",
    contains_nh: true,
  },
  {
    id: "cawp_time_data-race_and_ethnicity_national_time_series",
    name: "National representation of women by race/ethnicity in the U.S. Congress and state/territory legislatures, over time",
    update_time: "September 2022",
  },
  {
    id: "cawp_time_data-race_and_ethnicity_state_time_series",
    name: "Representation of women by race/ethnicity from each state and territory to the U.S. Congress and to their respective state/territory legislature over time",
    update_time: "September 2022",
  },
  {
    id: "cawp_time_data-race_and_ethnicity_state_time_series_names",
    name: "By-state and by-territory lists of legislator names, yearly back to 1915 including: all members of U.S Congress, regardless of race or gender; all women members of U.S. Congress, by race/ethnicity; and all women members of state and territory legislatures, by race/ethnicity",
    update_time: "September 2022",
  },
  {
    id: "the_unitedstates_project",
    name: "@unitedstates is a shared commons of data and tools for the United States. Made by the public, used by the public. Featuring work from people with the Sunlight Foundation, GovTrack.us, the New York Times, the Electronic Frontier Foundation, and the internet.",
    update_time: "December 2022",
  },
  {
    id: GEOGRAPHIES_DATASET_ID,
    name: "U.S. Geographic Data",
    update_time: "2020",
  },
  {
    id: "census_pop_estimates-race_and_ethnicity",
    name: "Census County Population by Characteristics: 2010-2019",
    update_time: "2019",
    contains_nh: true,
  },
];

export const DatasetMetadataMap: Record<string, DatasetMetadata> =
  Object.fromEntries(
    datasetMetadataList.map((m) => {
      let metadataWithSource = m;
      const dataSource = Object.values(DataSourceMetadataMap).find((metadata) =>
        metadata.dataset_ids.includes(m.id)
      );
      metadataWithSource.source_id = dataSource ? dataSource.id : "error";
      return [m.id, metadataWithSource];
    })
  );
