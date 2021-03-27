import CdcCovidProvider from "./CdcCovidProvider";
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
import {
  WHITE_NH,
  TOTAL,
  FORTY_TO_FORTY_NINE,
  FEMALE,
} from "../utils/Constants";
import { MetricId } from "../config/MetricConfig";
import { excludeTotal } from "../query/BreakdownFilter";

function covidAndAcsRows(
  fips: FipsSpec,
  breakdownColumnName: string,
  breakdownValue: string,
  cases: number | null,
  deaths: number | null,
  hosp: number | null,
  population: number
) {
  return [
    {
      state_fips: fips.code,
      state_name: fips.name,
      cases: cases,
      death_y: deaths,
      hosp_y: hosp,
      [breakdownColumnName]: breakdownValue,
      population: population,
    },
    {
      state_fips: fips.code,
      state_name: fips.name,
      [breakdownColumnName]: breakdownValue,
      population: population,
    },
  ];
}

function covidAndCountyAcsRows(
  fips: FipsSpec,
  breakdownColumnName: string,
  breakdownValue: string,
  cases: number | null,
  deaths: number | null,
  hosp: number | null,
  population: number
) {
  return [
    {
      county_fips: fips.code,
      county_name: fips.name,
      cases: cases,
      death_y: deaths,
      hosp_y: hosp,
      [breakdownColumnName]: breakdownValue,
      population: population,
    },
    {
      county_fips: fips.code,
      county_name: fips.name,
      [breakdownColumnName]: breakdownValue,
      population: population,
    },
  ];
}

const METRIC_IDS: MetricId[] = [
  "covid_cases",
  "covid_cases_per_100k",
  "covid_cases_pct_of_geo",
  "covid_cases_reporting_population",
  "covid_cases_reporting_population_pct",
];

export async function evaluateWithAndWithoutTotal(
  covidDatasetId: string,
  rawCovidData: any[],
  acsDatasetId: string,
  rawAcsData: any[],
  baseBreakdown: Breakdowns,
  breakdownVar: BreakdownVar,
  nonTotalRows: any[],
  totalRows: any[]
) {
  const acsProvider = new AcsPopulationProvider();
  const cdcCovidProvider = new CdcCovidProvider(acsProvider);

  dataFetcher.setFakeDatasetLoaded(covidDatasetId, rawCovidData);
  dataFetcher.setFakeDatasetLoaded(acsDatasetId, rawAcsData);

  // Evaluate the response with requesting total field
  const responseWithTotal = await cdcCovidProvider.getData(
    new MetricQuery(METRIC_IDS, baseBreakdown.addBreakdown(breakdownVar))
  );
  expect(responseWithTotal).toEqual(
    new MetricQueryResponse(totalRows, [covidDatasetId, acsDatasetId])
  );

  // Evaluate the response without requesting total field
  const responseWithoutTotal = await cdcCovidProvider.getData(
    new MetricQuery(
      METRIC_IDS,
      baseBreakdown.addBreakdown(breakdownVar, excludeTotal())
    )
  );
  expect(responseWithoutTotal).toEqual(
    new MetricQueryResponse(nonTotalRows, [covidDatasetId, acsDatasetId])
  );
}

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

describe("cdcCovidProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(FakeDatasetMetadataMap);
  });

  test("County and Race Breakdown", async () => {
    // Raw rows with cases, hospitalizations, death, population
    const [CHATAM_WHITE_ROW, CHATAM_ACS_WHITE_ROW] = covidAndCountyAcsRows(
      /*fips=*/ CHATAM,
      /*breakdownColumnName=*/ "race_and_ethnicity",
      /*breakdownValue=*/ WHITE_NH,
      /*cases=*/ 10,
      /*deaths=*/ 1,
      /*hosp=*/ 5,
      /*population=*/ 2000
    );
    const [, CHATAM_ACS_TOTAL_ROW] = covidAndCountyAcsRows(
      /*fips=*/ CHATAM,
      /*breakdownColumnName=*/ "race_and_ethnicity",
      /*breakdownValue=*/ TOTAL,
      /*cases=*/ 200,
      /*deaths=*/ 500,
      /*hosp=*/ 1000,
      /*population=*/ 100000
    );
    const [DURHAM_WHITE_ROW, DURHAM_ACS_WHITE_ROW] = covidAndCountyAcsRows(
      /*fips=*/ DURHAM,
      /*breakdownColumnName=*/ "race_and_ethnicity",
      /*breakdownValue=*/ WHITE_NH,
      /*cases=*/ 10,
      /*deaths=*/ 1,
      /*hosp=*/ 5,
      /*population=*/ 2000
    );
    const [, DURHAM_ACS_TOTAL_ROW] = covidAndCountyAcsRows(
      /*fips=*/ DURHAM,
      /*breakdownColumnName=*/ "race_and_ethnicity",
      /*breakdownValue=*/ TOTAL,
      /*cases=*/ 10,
      /*deaths=*/ 1,
      /*hosp=*/ 5,
      /*population=*/ 2000
    );

    const rawCovidData = [CHATAM_WHITE_ROW, DURHAM_WHITE_ROW];
    const rawAcsData = [
      CHATAM_ACS_WHITE_ROW,
      CHATAM_ACS_TOTAL_ROW,
      DURHAM_ACS_TOTAL_ROW,
      DURHAM_ACS_WHITE_ROW,
    ];

    const CHATAM_WHITE_FINAL_ROW = {
      fips: CHATAM.code,
      fips_name: CHATAM.name,
      race_and_ethnicity: WHITE_NH,
      covid_cases: 10,
      covid_cases_per_100k: 500,
      covid_cases_pct_of_geo: 100,
      covid_cases_reporting_population: 2000,
      covid_cases_reporting_population_pct: 2,
    };

    const CHATAM_TOTAL_FINAL_ROW = {
      fips: CHATAM.code,
      fips_name: CHATAM.name,
      race_and_ethnicity: TOTAL,
      covid_cases: 10,
      covid_cases_per_100k: 500,
      covid_cases_pct_of_geo: 100,
      covid_cases_reporting_population: 2000,
      covid_cases_reporting_population_pct: 100,
    };

    await evaluateWithAndWithoutTotal(
      "cdc_restricted_data-by_race_county",
      rawCovidData,
      "acs_population-by_race_county_std",
      rawAcsData,
      Breakdowns.forFips(new Fips(CHATAM.code)),
      "race_and_ethnicity",
      [CHATAM_WHITE_FINAL_ROW],
      [CHATAM_WHITE_FINAL_ROW, CHATAM_TOTAL_FINAL_ROW]
    );
  });

  test("State and Age Breakdown", async () => {
    const [AL_FORTY_ROW, AL_ACS_FORTY_ROW] = covidAndAcsRows(
      /*fips=*/ AL,
      /*breakdownColumnName=*/ "age",
      /*breakdownValue=*/ FORTY_TO_FORTY_NINE,
      /*cases=*/ 10,
      /*hosp=*/ 1,
      /*death=*/ 5,
      /*population=*/ 2000
    );
    const [, AL_ACS_TOTAL_ROW] = covidAndAcsRows(
      /*fips=*/ AL,
      /*breakdownColumnName=*/ "age",
      /*breakdownValue=*/ TOTAL,
      /*cases=*/ 10,
      /*hosp=*/ 1,
      /*death=*/ 5,
      /*population=*/ 2000
    );
    const [NC_FORTY_ROW, NC_ACS_FORTY_ROW] = covidAndAcsRows(
      /*fips=*/ NC,
      /*breakdownColumnName=*/ "age",
      /*breakdownValue=*/ FORTY_TO_FORTY_NINE,
      /*cases=*/ 10,
      /*hosp=*/ 1,
      /*death=*/ 5,
      /*population=*/ 2000
    );
    const [, NC_ACS_TOTAL_ROW] = covidAndAcsRows(
      /*fips=*/ NC,
      /*breakdownColumnName=*/ "age",
      /*breakdownValue=*/ TOTAL,
      /*cases=*/ 200,
      /*hosp=*/ 500,
      /*death=*/ 1000,
      /*population=*/ 100000
    );

    const rawCovidData = [NC_FORTY_ROW, AL_FORTY_ROW];
    const rawAcsData = [
      NC_ACS_FORTY_ROW,
      NC_ACS_TOTAL_ROW,
      AL_ACS_TOTAL_ROW,
      AL_ACS_FORTY_ROW,
    ];

    const NC_TOTAL_FINAL_ROW = {
      fips: NC.code,
      fips_name: NC.name,
      age: TOTAL,
      covid_cases: 10,
      covid_cases_per_100k: 500,
      covid_cases_pct_of_geo: 100,
      covid_cases_reporting_population: 2000,
      covid_cases_reporting_population_pct: 100,
    };
    const NC_FORTY_FINAL_ROW = {
      fips: NC.code,
      fips_name: NC.name,
      age: FORTY_TO_FORTY_NINE,
      covid_cases: 10,
      covid_cases_per_100k: 500,
      covid_cases_pct_of_geo: 100,
      covid_cases_reporting_population: 2000,
      covid_cases_reporting_population_pct: 2,
    };

    await evaluateWithAndWithoutTotal(
      "cdc_restricted_data-by_age_state",
      rawCovidData,
      "acs_population-by_age_state",
      rawAcsData,
      Breakdowns.forFips(new Fips(NC.code)),
      "age",
      [NC_FORTY_FINAL_ROW],
      [NC_FORTY_FINAL_ROW, NC_TOTAL_FINAL_ROW]
    );
  });

  test("National and Sex Breakdown", async () => {
    const [, NC_ACS_TOTAL_ROW] = covidAndAcsRows(
      /*fips=*/ NC,
      /*breakdownColumnName=*/ "sex",
      /*breakdownValue=*/ TOTAL,
      /*cases=*/ 200,
      /*death=*/ 500,
      /*hosp=*/ 1000,
      /*population=*/ 100000
    );
    const [, AL_ACS_TOTAL_ROW] = covidAndAcsRows(
      /*fips=*/ AL,
      /*breakdownColumnName=*/ "sex",
      /*breakdownValue=*/ TOTAL,
      /*cases=*/ 100,
      /*death=*/ 200,
      /*hosp=*/ 1000,
      /*population=*/ 80000
    );
    const [NC_FEMALE_ROW, NC_ACS_FEMALE_ROW] = covidAndAcsRows(
      /*fips=*/ NC,
      /*breakdownColumnName=*/ "sex",
      /*breakdownValue=*/ FEMALE,
      /*cases=*/ 240,
      /*death=*/ 80,
      /*hosp=*/ 34,
      /*population=*/ 50000
    );
    const [AL_FEMALE_ROW, AL_ACS_FEMALE_ROW] = covidAndAcsRows(
      /*fips=*/ AL,
      /*breakdownColumnName=*/ "sex",
      /*breakdownValue=*/ FEMALE,
      /*cases=*/ 730,
      /*death=*/ 250,
      /*hosp=*/ 45,
      /*population=*/ 60000
    );

    const rawCovidData = [NC_FEMALE_ROW, AL_FEMALE_ROW];
    const rawAcsData = [
      NC_ACS_FEMALE_ROW,
      NC_ACS_TOTAL_ROW,
      AL_ACS_TOTAL_ROW,
      AL_ACS_FEMALE_ROW,
    ];

    const FINAL_FEMALE_ROW = {
      fips: USA.code,
      fips_name: USA.name,
      sex: FEMALE,
      covid_cases: 970,
      covid_cases_per_100k: 882,
      covid_cases_pct_of_geo: 100,
      covid_cases_reporting_population: 110000,
      covid_cases_reporting_population_pct: 61.1,
    };
    const FINAL_TOTAL_ROW = {
      fips: USA.code,
      fips_name: USA.name,
      sex: TOTAL,
      covid_cases: 970,
      covid_cases_per_100k: 882,
      covid_cases_pct_of_geo: 100,
      covid_cases_reporting_population: 110000,
      covid_cases_reporting_population_pct: 100,
    };

    await evaluateWithAndWithoutTotal(
      "cdc_restricted_data-by_sex_state",
      rawCovidData,
      "acs_population-by_sex_state",
      rawAcsData,
      Breakdowns.national(),
      "sex",
      [FINAL_FEMALE_ROW],
      [FINAL_FEMALE_ROW, FINAL_TOTAL_ROW]
    );
  });
});
