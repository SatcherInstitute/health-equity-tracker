import CovidProvider from "./CovidProvider";
import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns } from "../Breakdowns";
import { MetricQueryResponse } from "../MetricQuery";
import { Fips } from "../../utils/madlib/Fips";
import FakeMetadataMap from "../FakeMetadataMap";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import FakeDataFetcher from "../../testing/FakeDataFetcher";

function covidAndAcsRows(
  state_fips: string,
  state_name: string,
  race: string,
  cases: number | null,
  deaths: number | null,
  hosp: number | null,
  population: number
) {
  return [
    {
      state_fips: state_fips,
      state_name: state_name,
      Cases: cases,
      Deaths: deaths,
      Hosp: hosp,
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

function covidAndCountyAcsRows(
  county_fips: string,
  county_name: string,
  race: string,
  cases: number | null,
  deaths: number | null,
  hosp: number | null,
  population: number
) {
  return [
    {
      county_fips: county_fips,
      county_name: county_name,
      Cases: cases,
      Deaths: deaths,
      Hosp: hosp,
      date: "2020-04-29",
      race_and_ethnicity: race,
    },
    {
      county_fips: county_fips,
      county_name: county_name,
      race_and_ethnicity: race,
      population: population,
    },
  ];
}

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

describe("CovidProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(FakeMetadataMap);
  });

  test("County and Race Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();
    const covidProvider = new CovidProvider(acsProvider);

    const [CHATAM_WHITE_ROW, CHATAM_ACS_WHITE_ROW] = covidAndCountyAcsRows(
      "37037",
      "Chatam",
      "White (Non-Hispanic)",
      /*cases=*/ 10,
      /*hosp=*/ 1,
      /*death=*/ 5,
      /*population=*/ 2000
    );
    const CHATAM_WHITE_FINAL_ROW = {
      fips: "37037",
      fips_name: "Chatam",
      race_and_ethnicity: "White (Non-Hispanic)",
      date: "2020-04-29",
      covid_cases: 10,
      covid_cases_per_100k: 500,
      covid_cases_pct_of_geo: 5,
      covid_deaths: 1,
      covid_deaths_per_100k: 50,
      covid_deaths_pct_of_geo: 0.2,
      covid_hosp: 5,
      covid_hosp_per_100k: 250,
      covid_hosp_pct_of_geo: 0.5,
      population: 2000,
      population_pct: 2,
    };

    const [CHATAM_TOTAL_ROW, CHATAM_ACS_TOTAL_ROW] = covidAndCountyAcsRows(
      "37037",
      "Chatam",
      "Total",
      /*cases=*/ 200,
      /*hosp=*/ 500,
      /*death=*/ 1000,
      /*population=*/ 100000
    );
    const CHATAM_TOTAL_FINAL_ROW = {
      fips: "37037",
      fips_name: "Chatam",
      race_and_ethnicity: "Total",
      date: "2020-04-29",
      covid_cases: 200,
      covid_cases_per_100k: 200,
      covid_cases_pct_of_geo: 100,
      covid_deaths: 500,
      covid_deaths_per_100k: 500,
      covid_deaths_pct_of_geo: 100,
      covid_hosp: 1000,
      covid_hosp_per_100k: 1000,
      covid_hosp_pct_of_geo: 100,
      population: 100000,
      population_pct: 100,
    };

    // Durham rows should be filtered out
    const [DURHAM_WHITE_ROW, DURHAM_ACS_WHITE_ROW] = covidAndCountyAcsRows(
      "37063",
      "Durham",
      "White (Non-Hispanic)",
      /*cases=*/ 10,
      /*hosp=*/ 1,
      /*death=*/ 5,
      /*population=*/ 2000
    );
    const [DURHAM_TOTAL_ROW, DURHAM_ACS_TOTAL_ROW] = covidAndCountyAcsRows(
      "37063",
      "Durham",
      "Total",
      /*cases=*/ 10,
      /*hosp=*/ 1,
      /*death=*/ 5,
      /*population=*/ 2000
    );

    const covidDatasetRows = [
      CHATAM_TOTAL_ROW,
      CHATAM_WHITE_ROW,
      DURHAM_TOTAL_ROW,
      DURHAM_WHITE_ROW,
    ];
    const acsRaceRows = [
      CHATAM_ACS_WHITE_ROW,
      CHATAM_ACS_TOTAL_ROW,
      DURHAM_ACS_TOTAL_ROW,
      DURHAM_ACS_WHITE_ROW,
    ];

    dataFetcher.setFakeDatasetLoaded(
      "covid_by_county_and_race",
      covidDatasetRows
    );
    dataFetcher.setFakeDatasetLoaded(
      "acs_population-by_race_county_std",
      acsRaceRows
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = await covidProvider.getData(
      Breakdowns.forFips(new Fips("37037")).andRace(
        /*includeTotal=*/ true,
        /*nonstandard=*/ true
      )
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [CHATAM_TOTAL_FINAL_ROW, CHATAM_WHITE_FINAL_ROW],
        ["covid_by_county_and_race", "acs_population-by_race_county_std"]
      )
    );

    // Evaluate the response without requesting total field
    const responseWithoutTotal = await covidProvider.getData(
      Breakdowns.forFips(new Fips("37037")).andRace(
        /*includeTotal=*/ false,
        /*nonstandard=*/ true
      )
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(
        [CHATAM_WHITE_FINAL_ROW],
        ["covid_by_county_and_race", "acs_population-by_race_county_std"]
      )
    );
  });

  test("State and Race Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();
    const covidProvider = new CovidProvider(acsProvider);

    const [NC_WHITE_ROW, NC_ACS_WHITE_ROW] = covidAndAcsRows(
      "37",
      "North Carolina",
      "White (Non-Hispanic)",
      /*cases=*/ 10,
      /*hosp=*/ 1,
      /*death=*/ 5,
      /*population=*/ 2000
    );
    const NC_WHITE_FINAL_ROW = {
      fips: "37",
      fips_name: "North Carolina",
      race_and_ethnicity: "White (Non-Hispanic)",
      date: "2020-04-29",
      covid_cases: 10,
      covid_cases_per_100k: 500,
      covid_cases_pct_of_geo: 5,
      covid_deaths: 1,
      covid_deaths_per_100k: 50,
      covid_deaths_pct_of_geo: 0.2,
      covid_hosp: 5,
      covid_hosp_per_100k: 250,
      covid_hosp_pct_of_geo: 0.5,
      population: 2000,
      population_pct: 2,
    };

    const [NC_TOTAL_ROW, NC_ACS_TOTAL_ROW] = covidAndAcsRows(
      "37",
      "North Carolina",
      "Total",
      /*cases=*/ 200,
      /*hosp=*/ 500,
      /*death=*/ 1000,
      /*population=*/ 100000
    );
    const NC_TOTAL_FINAL_ROW = {
      fips: "37",
      fips_name: "North Carolina",
      race_and_ethnicity: "Total",
      date: "2020-04-29",
      covid_cases: 200,
      covid_cases_per_100k: 200,
      covid_cases_pct_of_geo: 100,
      covid_deaths: 500,
      covid_deaths_per_100k: 500,
      covid_deaths_pct_of_geo: 100,
      covid_hosp: 1000,
      covid_hosp_per_100k: 1000,
      covid_hosp_pct_of_geo: 100,
      population: 100000,
      population_pct: 100,
    };

    // Alabama rows should be filtered out
    const [AL_WHITE_ROW, AL_ACS_WHITE_ROW] = covidAndAcsRows(
      "01",
      "Alabama",
      "White (Non-Hispanic)",
      /*cases=*/ 10,
      /*hosp=*/ 1,
      /*death=*/ 5,
      /*population=*/ 2000
    );
    const [AL_TOTAL_ROW, AL_ACS_TOTAL_ROW] = covidAndAcsRows(
      "01",
      "Alabama",
      "Total",
      /*cases=*/ 10,
      /*hosp=*/ 1,
      /*death=*/ 5,
      /*population=*/ 2000
    );

    const covidDatasetRows = [
      NC_TOTAL_ROW,
      NC_WHITE_ROW,
      AL_TOTAL_ROW,
      AL_WHITE_ROW,
    ];
    const acsRaceRows = [
      NC_ACS_WHITE_ROW,
      NC_ACS_TOTAL_ROW,
      AL_ACS_TOTAL_ROW,
      AL_ACS_WHITE_ROW,
    ];

    dataFetcher.setFakeDatasetLoaded(
      "covid_by_state_and_race",
      covidDatasetRows
    );
    dataFetcher.setFakeDatasetLoaded(
      "acs_population-by_race_state_std",
      acsRaceRows
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = await covidProvider.getData(
      Breakdowns.forFips(new Fips("37")).andRace(
        /*includeTotal=*/ true,
        /*nonstandard=*/ true
      )
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [NC_TOTAL_FINAL_ROW, NC_WHITE_FINAL_ROW],
        ["covid_by_state_and_race", "acs_population-by_race_state_std"]
      )
    );

    // Evaluate the response without requesting total field
    const responseWithoutTotal = await covidProvider.getData(
      Breakdowns.forFips(new Fips("37")).andRace(
        /*includeTotal=*/ false,
        /*nonstandard=*/ true
      )
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(
        [NC_WHITE_FINAL_ROW],
        ["covid_by_state_and_race", "acs_population-by_race_state_std"]
      )
    );
  });

  test("National and Race Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();
    const covidProvider = new CovidProvider(acsProvider);

    const [NC_TOTAL_ROW, NC_ACS_TOTAL_ROW] = covidAndAcsRows(
      "37",
      "North Carolina",
      "Total",
      /*cases=*/ 200,
      /*death=*/ 500,
      /*hosp=*/ 1000,
      /*population=*/ 100000
    );
    const [AL_TOTAL_ROW, AL_ACS_TOTAL_ROW] = covidAndAcsRows(
      "01",
      "Alabama",
      "Total",
      /*cases=*/ 100,
      /*death=*/ 200,
      /*hosp=*/ 1000,
      /*population=*/ 80000
    );
    const FINAL_TOTAL_ROW = {
      fips: "00",
      fips_name: "the United States",
      race_and_ethnicity: "Total",
      date: "2020-04-29",
      covid_cases: 300,
      covid_cases_per_100k: 167,
      covid_cases_pct_of_geo: 100,
      covid_deaths: 700,
      covid_deaths_per_100k: 389,
      covid_deaths_pct_of_geo: 100,
      covid_hosp: 2000,
      covid_hosp_per_100k: 1111,
      covid_hosp_pct_of_geo: 100,
      population: 180000,
      population_pct: 100,
    };

    const [NC_WHITE_ROW, NC_ACS_WHITE_ROW] = covidAndAcsRows(
      "37",
      "North Carolina",
      "White (Non-Hispanic)",
      /*cases=*/ 240,
      /*death=*/ 80,
      /*hosp=*/ 34,
      /*population=*/ 50000
    );
    const [AL_WHITE_ROW, AL_ACS_WHITE_ROW] = covidAndAcsRows(
      "01",
      "Alabama",
      "White (Non-Hispanic)",
      /*cases=*/ 730,
      /*death=*/ 250,
      /*hosp=*/ 45,
      /*population=*/ 60000
    );
    const FINAL_WHITE_ROW = {
      fips: "00",
      fips_name: "the United States",
      race_and_ethnicity: "White (Non-Hispanic)",
      date: "2020-04-29",
      covid_cases: 970,
      covid_cases_per_100k: 882,
      covid_cases_pct_of_geo: 323.3,
      covid_deaths: 330,
      covid_deaths_per_100k: 300,
      covid_deaths_pct_of_geo: 47.1,
      covid_hosp: 79,
      covid_hosp_per_100k: 72,
      covid_hosp_pct_of_geo: 4,
      population: 110000,
      population_pct: 61.1,
    };

    const covidDatasetRows = [
      NC_TOTAL_ROW,
      NC_WHITE_ROW,
      AL_TOTAL_ROW,
      AL_WHITE_ROW,
    ];
    const acsRaceRows = [
      NC_ACS_WHITE_ROW,
      NC_ACS_TOTAL_ROW,
      AL_ACS_TOTAL_ROW,
      AL_ACS_WHITE_ROW,
    ];

    dataFetcher.setFakeDatasetLoaded(
      "covid_by_state_and_race",
      covidDatasetRows
    );
    dataFetcher.setFakeDatasetLoaded(
      "acs_population-by_race_state_std",
      acsRaceRows
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = await covidProvider.getData(
      Breakdowns.national().andRace(
        /*includeTotal=*/ true,
        /*nonstandard=*/ true
      )
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [FINAL_TOTAL_ROW, FINAL_WHITE_ROW],
        ["covid_by_state_and_race", "acs_population-by_race_state_std"]
      )
    );

    // Evaluate the response without requesting total field
    const responseWithoutTotal = await covidProvider.getData(
      Breakdowns.national().andRace(
        /*includeTotal=*/ false,
        /*nonstandard=*/ true
      )
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(
        [FINAL_WHITE_ROW],
        ["covid_by_state_and_race", "acs_population-by_race_state_std"]
      )
    );
  });
});
