import CovidProvider from "./CovidProvider";
import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns } from "../Breakdowns";
import { MetricQueryResponse, createMissingDataResponse } from "../MetricQuery";
import { Dataset, DatasetMetadata, Row } from "../DatasetTypes";
import { Fips } from "../../utils/madlib/Fips";

const DATASET_METADATA: DatasetMetadata = {
  id: "id",
  name: "name",
  description: "description",
  fields: [],
  data_source_name: "data_source_name",
  data_source_link: "data_source_link",
  geographic_level: "geographic_level",
  demographic_granularity: "demographic_granularity",
  update_frequency: "update_frequency",
  update_time: "update_time",
};

function covidAndAcsRows(
  fips: string,
  state_name: string,
  breakdownName: string,
  breakdownValue: string,
  Cases: number | null,
  Deaths: number | null,
  Hosp: number | null,
  population: number
) {
  return [
    {
      state_fips: fips,
      state_name: state_name,
      Cases: Cases,
      Deaths: Deaths,
      Hosp: Hosp,
      date: "2020-04-29",
      [breakdownName]: breakdownValue,
    },
    {
      state_fips: fips,
      state_name: state_name,
      [breakdownName]: breakdownValue,
      population: population,
    },
  ];
}

function finalRow(
  fips: string,
  state_name: string,
  breakdownName: string,
  breakdownValue: string,
  covid_cases: number,
  covid_cases_per_100k: number,
  covid_cases_pct_of_geo: number,
  covid_deaths: number,
  covid_deaths_per_100k: number,
  covid_deaths_pct_of_geo: number,
  covid_hosp: number,
  covid_hosp_per_100k: number,
  covid_hosp_pct_of_geo: number,
  population: number,
  population_pct: number
) {
  return {
    state_fips: fips,
    state_name: state_name,
    date: "2020-04-29",
    covid_cases: covid_cases,
    covid_deaths: covid_deaths,
    covid_hosp: covid_hosp,
    covid_cases_pct_of_geo: covid_cases_pct_of_geo,
    covid_deaths_pct_of_geo: covid_deaths_pct_of_geo,
    covid_hosp_pct_of_geo: covid_hosp_pct_of_geo,
    covid_cases_per_100k: covid_cases_per_100k,
    covid_deaths_per_100k: covid_deaths_per_100k,
    covid_hosp_per_100k: covid_hosp_per_100k,
    population: population,
    population_pct: population_pct,
    [breakdownName]: breakdownValue,
  };
}

describe("CovidProvider", () => {
  test("State and Race Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();
    const covidProvider = new CovidProvider(acsProvider);

    const [NC_TOTAL_ROW, NC_ACS_TOTAL_ROW] = covidAndAcsRows(
      "37",
      "NC",
      "race_and_ethnicity",
      "Total",
      /* Cases=*/ 200,
      /* Hosp=*/ 500,
      /* Death=*/ 1000,
      /*Population =*/ 100000
    );
    const NC_TOTAL_FINAL_ROW = finalRow(
      "37",
      "NC",
      "race_and_ethnicity",
      "Total",
      /*cases*/ 200,
      /*per100k*/ 200,
      /*percent*/ 100,
      /*cases*/ 500,
      /*per100k*/ 500,
      /*percent*/ 100,
      /*cases*/ 1000,
      /*per100k*/ 1000,
      /*percent*/ 100,
      /*population*/ 100000,
      /*population_pct*/ 100
    );

    const [NC_WHITE_ROW, NC_ACS_WHITE_ROW] = covidAndAcsRows(
      "37",
      "NC",
      "race_and_ethnicity",
      "White (Non-Hispanic)",
      /* Cases=*/ 10,
      /* Hosp=*/ 1,
      /* Death=*/ 5,
      /*Population =*/ 2000
    );
    const NC_WHITE_FINAL_ROW = finalRow(
      "37",
      "NC",
      "race_and_ethnicity",
      "White (Non-Hispanic)",
      /*cases*/ 10,
      /*per100k*/ 500,
      /*percent*/ 5,
      /*cases*/ 1,
      /*per100k*/ 50,
      /*percent*/ 0.2,
      /*cases*/ 5,
      /*per100k*/ 250,
      /*percent*/ 0.5,
      /*population*/ 2000,
      /*population_pct*/ 2
    );

    const rows = [NC_TOTAL_ROW, NC_WHITE_ROW];
    const expectedRows = [NC_TOTAL_FINAL_ROW, NC_WHITE_FINAL_ROW];

    const acsRows = [NC_ACS_WHITE_ROW, NC_ACS_TOTAL_ROW];

    const acsDataset = new Dataset(acsRows, DATASET_METADATA);
    const covidDataset = new Dataset(rows, DATASET_METADATA);
    const DATASET_MAP = {
      covid_by_state_and_race: covidDataset,
      "acs_population-by_race_state_std": acsDataset,
      "acs_population-by_age_state": new Dataset([], DATASET_METADATA),
    };
    const breakdown = Breakdowns.forFips(new Fips("37")).andRace(true);
    const actual = covidProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(new MetricQueryResponse(expectedRows));
  });
});
