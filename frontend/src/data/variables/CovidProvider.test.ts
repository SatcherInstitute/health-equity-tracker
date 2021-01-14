import CovidProvider from "./CovidProvider";
import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns } from "../Breakdowns";
import { MetricQueryResponse } from "../MetricQuery";
import { Dataset } from "../DatasetTypes";
import { Fips } from "../../utils/madlib/Fips";
import FakeMetadataMap from "../FakeMetadataMap";

function covidAndAcsRows(
  state_fips: string,
  state_name: string,
  race: string,
  Cases: number | null,
  Deaths: number | null,
  Hosp: number | null,
  population: number
) {
  return [
    {
      state_fips: state_fips,
      state_name: state_name,
      Cases: Cases,
      Deaths: Deaths,
      Hosp: Hosp,
      date: "2020-04-29",
      race_and_ethnicity: race,
    },
    {
      state_fips: state_fips,
      state_name: state_name,
      race_and_ethnicity: race,
      population: population,
    },
  ];
}

function covidAndAcsRowsForNC(
  race: string,
  cases: number | null,
  deaths: number | null,
  hosp: number | null,
  population: number
) {
  return covidAndAcsRows(
    "37",
    "North Carolina",
    race,
    cases,
    deaths,
    hosp,
    population
  );
}

function covidAndAcsRowsForAL(
  race: string,
  cases: number | null,
  deaths: number | null,
  hosp: number | null,
  population: number
) {
  return covidAndAcsRows(
    "01",
    "Alabama",
    race,
    cases,
    deaths,
    hosp,
    population
  );
}

function finalRowForGeo(
  state_fips: string,
  state_name: string,
  race: string,
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
    state_fips: state_fips,
    state_name: state_name,
    race_and_ethnicity: race,
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
  };
}

function finalRowForNc(
  race: string,
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
  return finalRowForGeo(
    "37",
    "North Carolina",
    race,
    covid_cases,
    covid_cases_per_100k,
    covid_cases_pct_of_geo,
    covid_deaths,
    covid_deaths_per_100k,
    covid_deaths_pct_of_geo,
    covid_hosp,
    covid_hosp_per_100k,
    covid_hosp_pct_of_geo,
    population,
    population_pct
  );
}

describe("CovidProvider", () => {
  test("State and Race Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();
    const covidProvider = new CovidProvider(acsProvider);

    const [NC_WHITE_ROW, NC_ACS_WHITE_ROW] = covidAndAcsRowsForNC(
      "White (Non-Hispanic)",
      /* Cases=*/ 10,
      /* Hosp=*/ 1,
      /* Death=*/ 5,
      /*Population =*/ 2000
    );
    const NC_WHITE_FINAL_ROW = finalRowForNc(
      "White (Non-Hispanic)",
      /*cases*/ 10,
      /*cases per100k*/ 500,
      /*cases percent*/ 5,
      /*death*/ 1,
      /*death per100k*/ 50,
      /*death percent*/ 0.2,
      /*hosp*/ 5,
      /*hosp per100k*/ 250,
      /*hosp percent*/ 0.5,
      /*population*/ 2000,
      /*population_pct*/ 2
    );

    const [NC_TOTAL_ROW, NC_ACS_TOTAL_ROW] = covidAndAcsRowsForNC(
      "Total",
      /* Cases=*/ 200,
      /* Hosp=*/ 500,
      /* Death=*/ 1000,
      /*Population =*/ 100000
    );
    const NC_TOTAL_FINAL_ROW = finalRowForNc(
      "Total",
      /*cases*/ 200,
      /*cases per100k*/ 200,
      /*cases percent*/ 100,
      /*death*/ 500,
      /*death per100k*/ 500,
      /*death percent*/ 100,
      /*hosp*/ 1000,
      /*hosp per100k*/ 1000,
      /*hosp percent*/ 100,
      /*population*/ 100000,
      /*population_pct*/ 100
    );

    // Alabama rows should be filtered out
    const [AL_WHITE_ROW, AL_ACS_WHITE_ROW] = covidAndAcsRowsForAL(
      "White (Non-Hispanic)",
      /* Cases=*/ 10,
      /* Hosp=*/ 1,
      /* Death=*/ 5,
      /*Population =*/ 2000
    );
    const [AL_TOTAL_ROW, AL_ACS_TOTAL_ROW] = covidAndAcsRowsForAL(
      "Total",
      /* Cases=*/ 10,
      /* Hosp=*/ 1,
      /* Death=*/ 5,
      /*Population =*/ 2000
    );

    const covidDatasetRows = [
      NC_TOTAL_ROW,
      NC_WHITE_ROW,
      AL_TOTAL_ROW,
      AL_WHITE_ROW,
    ];
    const acsDatasetRows = [
      NC_ACS_WHITE_ROW,
      NC_ACS_TOTAL_ROW,
      AL_ACS_TOTAL_ROW,
      AL_ACS_WHITE_ROW,
    ];
    const DATASET_MAP = {
      covid_by_state_and_race: new Dataset(
        covidDatasetRows,
        FakeMetadataMap["covid_by_state_and_race"]
      ),
      "acs_population-by_race_state_std": new Dataset(
        acsDatasetRows,
        FakeMetadataMap["acs_population-by_race_state_std"]
      ),
      "acs_population-by_age_state": new Dataset(
        [],
        FakeMetadataMap["acs_population-by_age_state"]
      ),
    };
    const breakdown = Breakdowns.forFips(new Fips("37")).andRace(true);
    const actual = covidProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(
      new MetricQueryResponse([NC_TOTAL_FINAL_ROW, NC_WHITE_FINAL_ROW])
    );
  });

  test("National and Race Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();
    const covidProvider = new CovidProvider(acsProvider);

    // Race, Cases, Death, Hosp, Population
    const [NC_TOTAL_ROW, NC_ACS_TOTAL_ROW] = covidAndAcsRowsForNC(
      "Total",
      200,
      500,
      1000,
      100000
    );
    const [AL_TOTAL_ROW, AL_ACS_TOTAL_ROW] = covidAndAcsRowsForAL(
      "Total",
      100,
      200,
      1000,
      80000
    );
    const FINAL_TOTAL_ROW = finalRowForGeo(
      "00",
      "the United States",
      "Total",
      /*cases*/ 300,
      /*cases per100k*/ 167,
      /*cases percent*/ 100,
      /*death*/ 700,
      /*death per100k*/ 389,
      /*death percent*/ 100,
      /*hosp*/ 2000,
      /*hosp per100k*/ 1111,
      /*hosp percent*/ 100,
      /*population*/ 180000,
      /*population_pct*/ 100
    );

    const [NC_WHITE_ROW, NC_ACS_WHITE_ROW] = covidAndAcsRowsForNC(
      "White (Non-Hispanic)",
      240,
      80,
      34,
      50000
    );
    const [AL_WHITE_ROW, AL_ACS_WHITE_ROW] = covidAndAcsRowsForAL(
      "White (Non-Hispanic)",
      730,
      250,
      45,
      60000
    );
    const FINAL_WHITE_ROW = finalRowForGeo(
      "00",
      "the United States",
      "White (Non-Hispanic)",
      /*cases*/ 970,
      /*cases per100k*/ 882,
      /*cases percent*/ 323.3,
      /*death*/ 330,
      /*death per100k*/ 300,
      /*death percent*/ 47.1,
      /*hosp*/ 79,
      /*hosp per100k*/ 72,
      /*hosp percent*/ 4,
      /*population*/ 110000,
      /*population_pct*/ 61.1
    );

    const covidDatasetRows = [
      NC_TOTAL_ROW,
      NC_WHITE_ROW,
      AL_TOTAL_ROW,
      AL_WHITE_ROW,
    ];
    const acsDatasetRows = [
      NC_ACS_WHITE_ROW,
      NC_ACS_TOTAL_ROW,
      AL_ACS_TOTAL_ROW,
      AL_ACS_WHITE_ROW,
    ];
    const DATASET_MAP = {
      covid_by_state_and_race: new Dataset(
        covidDatasetRows,
        FakeMetadataMap["covid_by_state_and_race"]
      ),
      "acs_population-by_race_state_std": new Dataset(
        acsDatasetRows,
        FakeMetadataMap["acs_population-by_race_state_std"]
      ),
      "acs_population-by_age_state": new Dataset(
        [],
        FakeMetadataMap["acs_population-by_age_state"]
      ),
    };
    const breakdown = Breakdowns.national().andRace(true);
    const actual = covidProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(
      new MetricQueryResponse([FINAL_TOTAL_ROW, FINAL_WHITE_ROW])
    );
  });
});
