import CovidProvider from "./CovidProvider";
import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns, BreakdownVar } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { Fips } from "../utils/Fips";
import { FakeDatasetMetadataMap } from "../config/FakeDatasetMetadata";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import FakeDataFetcher from "../../testing/FakeDataFetcher";
import { FipsSpec, NC, AL, DURHAM, CHATAM, USA } from "./TestUtils";
import { WHITE_NH, ALL } from "../utils/Constants";
import { MetricId } from "../config/MetricConfig";
import { excludeAll } from "../query/BreakdownFilter";

function covidAndAcsRows(
  fips: FipsSpec,
  race: string,
  cases: number | null,
  deaths: number | null,
  hosp: number | null,
  population: number
) {
  return [
    {
      state_fips: fips.code,
      state_name: fips.name,
      Cases: cases,
      Deaths: deaths,
      Hosp: hosp,
      date: "2020-04-29",
      race_and_ethnicity: race,
    },
    {
      state_fips: fips.code,
      state_name: fips.name,
      race_and_ethnicity: race,
      population: population,
    },
  ];
}

function covidAndCountyAcsRows(
  fips: FipsSpec,
  race: string,
  cases: number | null,
  deaths: number | null,
  hosp: number | null,
  population: number
) {
  return [
    {
      county_fips: fips.code,
      county_name: fips.name,
      Cases: cases,
      Deaths: deaths,
      Hosp: hosp,
      date: "2020-04-29",
      race_and_ethnicity: race,
    },
    {
      county_fips: fips.code,
      county_name: fips.name,
      race_and_ethnicity: race,
      population: population,
    },
  ];
}

const METRIC_IDS: MetricId[] = [
  "covid_cases",
  "covid_cases_per_100k",
  "covid_cases_share",
  "covid_cases_reporting_population",
  "covid_cases_reporting_population_pct",
];

export async function evaluateWithAndWithoutAll(
  covidDatasetId: string,
  rawCovidData: any[],
  acsDatasetId: string,
  rawAcsData: any[],
  baseBreakdown: Breakdowns,
  breakdownVar: BreakdownVar,
  rowsExcludingAll: any[],
  rowsIncludingAll: any[]
) {
  const acsProvider = new AcsPopulationProvider();
  const covidProvider = new CovidProvider(acsProvider);

  dataFetcher.setFakeDatasetLoaded(covidDatasetId, rawCovidData);
  dataFetcher.setFakeDatasetLoaded(acsDatasetId, rawAcsData);

  // Evaluate the response with requesting all field
  const responseWithAll = await covidProvider.getData(
    new MetricQuery(METRIC_IDS, baseBreakdown.addBreakdown(breakdownVar))
  );
  expect(responseWithAll).toEqual(
    new MetricQueryResponse(rowsIncludingAll, [covidDatasetId, acsDatasetId])
  );

  // Evaluate the response without requesting all field
  const responseWithoutAll = await covidProvider.getData(
    new MetricQuery(
      METRIC_IDS,
      baseBreakdown.addBreakdown(breakdownVar, excludeAll())
    )
  );
  expect(responseWithoutAll).toEqual(
    new MetricQueryResponse(rowsExcludingAll, [covidDatasetId, acsDatasetId])
  );
}

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

describe("CovidProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(FakeDatasetMetadataMap);
  });

  test("County and Race Breakdown", async () => {
    // Raw rows with cases, hospitalizations, death, population
    const [CHATAM_WHITE_ROW, CHATAM_ACS_WHITE_ROW] = covidAndCountyAcsRows(
      CHATAM,
      WHITE_NH,
      10,
      1,
      5,
      2000
    );
    const [CHATAM_all_ROW, CHATAM_ACS_all_ROW] = covidAndCountyAcsRows(
      CHATAM,
      ALL,
      200,
      500,
      1000,
      100000
    );
    const [DURHAM_WHITE_ROW, DURHAM_ACS_WHITE_ROW] = covidAndCountyAcsRows(
      DURHAM,
      WHITE_NH,
      10,
      1,
      5,
      2000
    );
    const [DURHAM_all_ROW, DURHAM_ACS_all_ROW] = covidAndCountyAcsRows(
      DURHAM,
      ALL,
      10,
      1,
      5,
      2000
    );

    const rawCovidData = [
      CHATAM_all_ROW,
      CHATAM_WHITE_ROW,
      DURHAM_all_ROW,
      DURHAM_WHITE_ROW,
    ];
    const rawAcsData = [
      CHATAM_ACS_WHITE_ROW,
      CHATAM_ACS_all_ROW,
      DURHAM_ACS_all_ROW,
      DURHAM_ACS_WHITE_ROW,
    ];

    const CHATAM_WHITE_FINAL_ROW = {
      fips: CHATAM.code,
      fips_name: CHATAM.name,
      race_and_ethnicity: WHITE_NH,
      covid_cases: 10,
      covid_cases_per_100k: 500,
      covid_cases_share: 5,
      covid_cases_reporting_population: 2000,
      covid_cases_reporting_population_pct: 2,
    };

    const CHATAM_all_FINAL_ROW = {
      fips: CHATAM.code,
      fips_name: CHATAM.name,
      race_and_ethnicity: ALL,
      covid_cases: 200,
      covid_cases_per_100k: 200,
      covid_cases_share: 100,
      covid_cases_reporting_population: 100000,
      covid_cases_reporting_population_pct: 100,
    };

    await evaluateWithAndWithoutAll(
      "covid_by_county_and_race",
      rawCovidData,
      "acs_population-by_race_county_std",
      rawAcsData,
      Breakdowns.forFips(new Fips(CHATAM.code)),
      "race_and_ethnicity",
      [CHATAM_WHITE_FINAL_ROW],
      [CHATAM_all_FINAL_ROW, CHATAM_WHITE_FINAL_ROW]
    );
  });

  test("State and Race Breakdown", async () => {
    const [AL_WHITE_ROW, AL_ACS_WHITE_ROW] = covidAndAcsRows(
      AL,
      WHITE_NH,
      /*cases=*/ 10,
      /*hosp=*/ 1,
      /*death=*/ 5,
      /*population=*/ 2000
    );
    const [AL_all_ROW, AL_ACS_all_ROW] = covidAndAcsRows(
      AL,
      ALL,
      /*cases=*/ 10,
      /*hosp=*/ 1,
      /*death=*/ 5,
      /*population=*/ 2000
    );
    const [NC_WHITE_ROW, NC_ACS_WHITE_ROW] = covidAndAcsRows(
      NC,
      WHITE_NH,
      /*cases=*/ 10,
      /*hosp=*/ 1,
      /*death=*/ 5,
      /*population=*/ 2000
    );
    const [NC_all_ROW, NC_ACS_all_ROW] = covidAndAcsRows(
      NC,
      ALL,
      /*cases=*/ 200,
      /*hosp=*/ 500,
      /*death=*/ 1000,
      /*population=*/ 100000
    );

    const rawCovidData = [NC_all_ROW, NC_WHITE_ROW, AL_all_ROW, AL_WHITE_ROW];
    const rawAcsData = [
      NC_ACS_WHITE_ROW,
      NC_ACS_all_ROW,
      AL_ACS_all_ROW,
      AL_ACS_WHITE_ROW,
    ];

    const NC_all_FINAL_ROW = {
      fips: NC.code,
      fips_name: NC.name,
      race_and_ethnicity: ALL,
      covid_cases: 200,
      covid_cases_per_100k: 200,
      covid_cases_share: 100,
      covid_cases_reporting_population: 100000,
      covid_cases_reporting_population_pct: 100,
    };
    const NC_WHITE_FINAL_ROW = {
      fips: NC.code,
      fips_name: NC.name,
      race_and_ethnicity: WHITE_NH,
      covid_cases: 10,
      covid_cases_per_100k: 500,
      covid_cases_share: 5,
      covid_cases_reporting_population: 2000,
      covid_cases_reporting_population_pct: 2,
    };

    await evaluateWithAndWithoutAll(
      "covid_by_state_and_race",
      rawCovidData,
      "acs_population-by_race_state_std",
      rawAcsData,
      Breakdowns.forFips(new Fips(NC.code)),
      "race_and_ethnicity",
      [NC_WHITE_FINAL_ROW],
      [NC_all_FINAL_ROW, NC_WHITE_FINAL_ROW]
    );
  });

  test("National and Race Breakdown", async () => {
    const [NC_all_ROW, NC_ACS_all_ROW] = covidAndAcsRows(
      NC,
      ALL,
      /*cases=*/ 200,
      /*death=*/ 500,
      /*hosp=*/ 1000,
      /*population=*/ 100000
    );
    const [AL_all_ROW, AL_ACS_all_ROW] = covidAndAcsRows(
      AL,
      ALL,
      /*cases=*/ 100,
      /*death=*/ 200,
      /*hosp=*/ 1000,
      /*population=*/ 80000
    );
    const [NC_WHITE_ROW, NC_ACS_WHITE_ROW] = covidAndAcsRows(
      NC,
      WHITE_NH,
      /*cases=*/ 240,
      /*death=*/ 80,
      /*hosp=*/ 34,
      /*population=*/ 50000
    );
    const [AL_WHITE_ROW, AL_ACS_WHITE_ROW] = covidAndAcsRows(
      AL,
      WHITE_NH,
      /*cases=*/ 730,
      /*death=*/ 250,
      /*hosp=*/ 45,
      /*population=*/ 60000
    );

    const rawCovidData = [NC_all_ROW, NC_WHITE_ROW, AL_all_ROW, AL_WHITE_ROW];
    const rawAcsData = [
      NC_ACS_WHITE_ROW,
      NC_ACS_all_ROW,
      AL_ACS_all_ROW,
      AL_ACS_WHITE_ROW,
    ];

    const FINAL_WHITE_ROW = {
      fips: USA.code,
      fips_name: USA.name,
      race_and_ethnicity: WHITE_NH,
      covid_cases: 970,
      covid_cases_per_100k: 882,
      covid_cases_share: 323.3,
      covid_cases_reporting_population: 110000,
      covid_cases_reporting_population_pct: 61.1,
    };
    const FINAL_all_ROW = {
      fips: USA.code,
      fips_name: USA.name,
      race_and_ethnicity: ALL,
      covid_cases: 300,
      covid_cases_per_100k: 167,
      covid_cases_share: 100,
      covid_cases_reporting_population: 180000,
      covid_cases_reporting_population_pct: 100,
    };

    await evaluateWithAndWithoutAll(
      "covid_by_state_and_race",
      rawCovidData,
      "acs_population-by_race_state_std",
      rawAcsData,
      Breakdowns.national(),
      "race_and_ethnicity",
      [FINAL_WHITE_ROW],
      [FINAL_all_ROW, FINAL_WHITE_ROW]
    );
  });
});
