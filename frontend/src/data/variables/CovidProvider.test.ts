import CovidProvider from "./CovidProvider";
import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns } from "../Breakdowns";
import { MetricQueryResponse } from "../MetricQuery";
import { Dataset } from "../DatasetTypes";
import { Fips } from "../../utils/madlib/Fips";
import FakeMetadataMap from "../FakeMetadataMap";

function fakeDataServerResponse(
  covidRows: any[],
  acsRaceRows: any[],
  acsAgeRows: any[]
) {
  return {
    covid_by_state_and_race: new Dataset(
      covidRows,
      FakeMetadataMap["covid_by_state_and_race"]
    ),
    "acs_population-by_race_state_std": new Dataset(
      acsRaceRows,
      FakeMetadataMap["acs_population-by_race_state_std"]
    ),
    "acs_population-by_age_state": new Dataset(
      acsAgeRows,
      FakeMetadataMap["acs_population-by_age_state"]
    ),
    "acs_population-by_race_county_std": new Dataset(
      [],
      FakeMetadataMap["acs_population-by_race_county_std"]
    ),
  };
}

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

describe("CovidProvider", () => {
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
      state_fips: "37",
      state_name: "North Carolina",
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
      state_fips: "37",
      state_name: "North Carolina",
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

    const dataServerResponse = fakeDataServerResponse(
      covidDatasetRows,
      acsRaceRows,
      /*aceAgeRows=*/ []
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = covidProvider.getData(
      dataServerResponse,
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
    const responseWithoutTotal = covidProvider.getData(
      dataServerResponse,
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
      state_fips: "00",
      state_name: "the United States",
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
      state_fips: "00",
      state_name: "the United States",
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
    const dataServerResponse = fakeDataServerResponse(
      covidDatasetRows,
      acsRaceRows,
      /*aceAgeRows=*/ []
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = covidProvider.getData(
      dataServerResponse,
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
    const responseWithoutTotal = covidProvider.getData(
      dataServerResponse,
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
