import CdcCovidProvider from "./CdcCovidProvider";
import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns, BreakdownVar } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { Fips } from "../utils/Fips";
import { DatasetMetadataMap } from "../config/DatasetMetadata";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import FakeDataFetcher from "../../testing/FakeDataFetcher";
import { NC, AL, DURHAM, CHATAM, VI, USA } from "./TestUtils";
import {
  WHITE_NH,
  ALL,
  FEMALE,
  MALE,
  UNKNOWN,
  AgeBucket,
  RACE,
} from "../utils/Constants";
import { MetricId } from "../config/MetricConfig";
import { excludeAll } from "../query/BreakdownFilter";

const FORTY_TO_FORTY_NINE: AgeBucket = "40-49";

const METRIC_IDS: MetricId[] = [
  "covid_cases",
  "covid_cases_per_100k",
  "covid_cases_share",
  "covid_cases_share_of_known",
  "covid_cases_reporting_population",
  "covid_cases_reporting_population_pct",
];

export async function evaluateWithAndWithoutAll(
  covidDatasetId: string,
  rawCovidData: any[],
  acsDatasetIds: string[],
  rawAcsData: any[],
  baseBreakdown: Breakdowns,
  breakdownVar: BreakdownVar,
  rowsExcludingAll: any[],
  rowsIncludingAll: any[]
) {
  const acsProvider = new AcsPopulationProvider();
  const cdcCovidProvider = new CdcCovidProvider(acsProvider);

  // Only used if breakdown is national
  for (var datasetId of acsDatasetIds) {
    dataFetcher.setFakeDatasetLoaded(datasetId, rawAcsData);
  }

  dataFetcher.setFakeDatasetLoaded(covidDatasetId, rawCovidData);

  // cdc dataset needs to be first
  let allDatasets = acsDatasetIds;
  acsDatasetIds.unshift(covidDatasetId);

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await cdcCovidProvider.getData(
    new MetricQuery(METRIC_IDS, baseBreakdown.addBreakdown(breakdownVar))
  );
  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse(rowsIncludingAll, allDatasets)
  );

  // Evaluate the response without requesting "All" field
  const responseExcludingAll = await cdcCovidProvider.getData(
    new MetricQuery(
      METRIC_IDS,
      baseBreakdown.addBreakdown(breakdownVar, excludeAll())
    )
  );
  expect(responseExcludingAll).toEqual(
    new MetricQueryResponse(rowsExcludingAll, allDatasets)
  );
}

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

describe("cdcCovidProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap);
  });

  test("County and Race Breakdown", async () => {
    // Raw rows with cases, hospitalizations, death, population
    const CHATAM_WHITE_ROW = {
      county_fips: CHATAM.code,
      county_name: CHATAM.name,
      cases: 10,
      hosp_y: 5,
      death_y: 1,
      race_and_ethnicity: WHITE_NH,
      population: 2000,
      population_pct: 2,
    };

    const CHATAM_ALL_ROW = {
      county_fips: CHATAM.code,
      county_name: CHATAM.name,
      cases: 200,
      hosp_y: 1000,
      death_y: 500,
      race_and_ethnicity: ALL,
      population: 100000,
      population_pct: 100,
    };

    const DURHAM_WHITE_ROW = {
      county_fips: DURHAM.code,
      county_name: DURHAM.name,
      cases: 10,
      hosp_y: 5,
      death_y: 1,
      race_and_ethnicity: WHITE_NH,
      population: 2000,
      population_pct: 100,
    };

    const DURHAM_ALL_ROW = {
      county_fips: DURHAM.code,
      county_name: DURHAM.name,
      cases: 10,
      hosp_y: 5,
      death_y: 1,
      race_and_ethnicity: ALL,
      population: 2000,
      population_pct: 100,
    };

    const rawCovidData = [
      CHATAM_WHITE_ROW,
      CHATAM_ALL_ROW,
      DURHAM_WHITE_ROW,
      DURHAM_ALL_ROW,
    ];

    const CHATAM_WHITE_FINAL_ROW = {
      fips: CHATAM.code,
      fips_name: CHATAM.name,
      race_and_ethnicity: WHITE_NH,
      covid_cases: 10,
      covid_cases_per_100k: 500,
      covid_cases_share: 5,
      covid_cases_share_of_known: 100,
      covid_cases_reporting_population: 2000,
      covid_cases_reporting_population_pct: 2,
    };
    const CHATAM_ALL_FINAL_ROW = {
      fips: CHATAM.code,
      fips_name: CHATAM.name,
      race_and_ethnicity: ALL,
      covid_cases: 200,
      covid_cases_per_100k: 200,
      covid_cases_share: 100,
      covid_cases_share_of_known: 100,
      covid_cases_reporting_population: 100000,
      covid_cases_reporting_population_pct: 100,
    };

    await evaluateWithAndWithoutAll(
      "cdc_restricted_data-by_race_county",
      rawCovidData,
      ["acs_population-by_race_county_std"],
      [],
      Breakdowns.forFips(new Fips(CHATAM.code)),
      RACE,
      [CHATAM_WHITE_FINAL_ROW],
      [CHATAM_ALL_FINAL_ROW, CHATAM_WHITE_FINAL_ROW]
    );
  });

  test("State and Age Breakdown", async () => {
    const AL_FORTY_ROW = {
      state_fips: AL.code,
      state_name: AL.name,
      cases: 10,
      hosp_y: 1,
      death_y: 5,
      age: FORTY_TO_FORTY_NINE,
      population: 2000,
      population_pct: 100,
    };

    const AL_ALL_ROW = {
      state_fips: AL.code,
      state_name: AL.name,
      cases: 10,
      hosp_y: 1,
      death_y: 5,
      age: ALL,
      population: 2000,
      population_pct: 100,
    };

    const NC_FORTY_ROW = {
      state_fips: NC.code,
      state_name: NC.name,
      cases: 10,
      hosp_y: 1,
      death_y: 5,
      age: FORTY_TO_FORTY_NINE,
      population: 2000,
      population_pct: 20,
    };

    const NC_ALL_ROW = {
      state_fips: NC.code,
      state_name: NC.name,
      cases: 200,
      hosp_y: 500,
      death_y: 1000,
      age: ALL,
      population: 10000,
      population_pct: 100,
    };

    const rawCovidData = [NC_FORTY_ROW, NC_ALL_ROW, AL_FORTY_ROW, AL_ALL_ROW];

    const NC_FORTY_FINAL_ROW = {
      fips: NC.code,
      fips_name: NC.name,
      age: FORTY_TO_FORTY_NINE,
      covid_cases: 10,
      covid_cases_per_100k: 500,
      covid_cases_share: 5,
      covid_cases_share_of_known: 100,
      covid_cases_reporting_population: 2000,
      covid_cases_reporting_population_pct: 20,
    };
    const NC_ALL_FINAL_ROW = {
      fips: NC.code,
      fips_name: NC.name,
      age: ALL,
      covid_cases: 200,
      covid_cases_per_100k: 2000,
      covid_cases_share: 100,
      covid_cases_share_of_known: 100,
      covid_cases_reporting_population: 10000,
      covid_cases_reporting_population_pct: 100,
    };

    await evaluateWithAndWithoutAll(
      "cdc_restricted_data-by_age_state",
      rawCovidData,
      ["acs_population-by_age_state"],
      [],
      Breakdowns.forFips(new Fips(NC.code)),
      "age",
      [NC_FORTY_FINAL_ROW],
      [NC_ALL_FINAL_ROW, NC_FORTY_FINAL_ROW]
    );
  });

  test("National and Sex Breakdown", async () => {
    const NC_FEMALE_ROW = {
      state_fips: NC.code,
      state_name: NC.name,
      cases: 240,
      hosp_y: 34,
      death_y: 80,
      sex: FEMALE,
      population: 50000,
      population_pct: 50,
    };

    const USA_ACS_FEMALE_ROW = {
      state_fips: USA.code,
      state_name: USA.name,
      sex: FEMALE,
      population: 50000,
      population_pct: 50,
    };

    const NC_ALL_ROW = {
      state_fips: NC.code,
      state_name: NC.name,
      cases: 200,
      hosp_y: 1000,
      death_y: 500,
      sex: ALL,
      population: 100000,
      population_pct: 100,
    };

    const USA_ACS_ALL_ROW = {
      state_fips: USA.code,
      state_name: USA.name,
      sex: ALL,
      population: 100000,
      population_pct: 100,
    };

    const AL_ALL_ROW = {
      state_fips: AL.code,
      state_name: AL.name,
      cases: 100,
      hosp_y: 1000,
      death_y: 200,
      sex: ALL,
      population: 80000,
    };

    const AL_FEMALE_ROW = {
      state_fips: AL.code,
      state_name: AL.name,
      cases: 730,
      hosp_y: 45,
      death_y: 250,
      sex: FEMALE,
      population: 60000,
    };

    const rawCovidData = [NC_FEMALE_ROW, NC_ALL_ROW, AL_FEMALE_ROW, AL_ALL_ROW];
    const rawAcsData = [USA_ACS_FEMALE_ROW, USA_ACS_ALL_ROW];

    const FINAL_FEMALE_ROW = {
      fips: USA.code,
      fips_name: USA.name,
      sex: FEMALE,
      covid_cases: 970,
      covid_cases_per_100k: 882,
      covid_cases_share: 323.3,
      covid_cases_share_of_known: 100,
      covid_cases_reporting_population: 110000,
      covid_cases_reporting_population_pct: 50,
    };
    const FINAL_ALL_ROW = {
      fips: USA.code,
      fips_name: USA.name,
      sex: ALL,
      covid_cases: 300,
      covid_cases_per_100k: 167,
      covid_cases_share: 100,
      covid_cases_share_of_known: 100,
      covid_cases_reporting_population: 180000,
      covid_cases_reporting_population_pct: 100,
    };

    await evaluateWithAndWithoutAll(
      "cdc_restricted_data-by_sex_state",
      rawCovidData,
      [
        "acs_population-by_sex_national",
        "acs_2010_population-by_sex_territory",
      ],
      rawAcsData,
      Breakdowns.national(),
      "sex",
      [FINAL_FEMALE_ROW],
      [FINAL_ALL_ROW, FINAL_FEMALE_ROW]
    );
  });

  test("population source acs 2010", async () => {
    const VI_ALL_ROW = {
      state_fips: VI.code,
      state_name: VI.name,
      cases: 400,
      hosp_y: 100,
      death_y: 200,
      sex: ALL,
      population: 1000,
      population_pct: 100,
    };
    const VI_FEMALE_ROW = {
      state_fips: VI.code,
      state_name: VI.name,
      cases: 200,
      hosp_y: 50,
      death_y: 100,
      sex: FEMALE,
      population: 500,
      population_pct: 50,
    };

    const rawCovidData = [VI_FEMALE_ROW, VI_ALL_ROW];

    const FINAL_FEMALE_ROW = {
      fips: VI.code,
      fips_name: VI.name,
      sex: FEMALE,
      covid_cases: 200,
      covid_cases_per_100k: 40000,
      covid_cases_share: 50,
      covid_cases_share_of_known: 100,
      covid_cases_reporting_population: 500,
      covid_cases_reporting_population_pct: 50,
    };
    const FINAL_ALL_ROW = {
      fips: VI.code,
      fips_name: VI.name,
      sex: ALL,
      covid_cases: 400,
      covid_cases_per_100k: 40000,
      covid_cases_share: 100,
      covid_cases_share_of_known: 100,
      covid_cases_reporting_population: 1000,
      covid_cases_reporting_population_pct: 100,
    };

    await evaluateWithAndWithoutAll(
      "cdc_restricted_data-by_sex_state",
      rawCovidData,
      ["acs_2010_population-by_sex_territory"],
      [],
      Breakdowns.byState(),
      "sex",
      [FINAL_FEMALE_ROW],
      [FINAL_FEMALE_ROW, FINAL_ALL_ROW]
    );
  });

  test("Calculates share of known with unknown present", async () => {
    const NC_UNKNOWN_ROW = {
      state_fips: NC.code,
      state_name: NC.name,
      cases: 100,
      hosp_y: 100,
      death_y: 100,
      sex: UNKNOWN,
      population: 1,
    };

    const NC_FEMALE_ROW = {
      state_fips: NC.code,
      state_name: NC.name,
      cases: 240,
      hosp_y: 34,
      death_y: 80,
      sex: FEMALE,
      population: 50000,
      population_pct: 50,
    };

    const USA_ACS_FEMALE_ROW = {
      state_fips: USA.code,
      state_name: USA.name,
      sex: FEMALE,
      population: 50000,
      population_pct: 50,
    };

    const USA_ACS_MALE_ROW = {
      state_fips: USA.code,
      state_name: USA.name,
      sex: MALE,
      population: 50000,
      population_pct: 50,
    };

    const NC_ALL_ROW = {
      state_fips: NC.code,
      state_name: NC.name,
      cases: 300,
      hosp_y: 1100,
      death_y: 600,
      sex: ALL,
      population: 100000,
      population_pct: 100,
    };

    const USA_ACS_ALL_ROW = {
      state_fips: USA.code,
      state_name: USA.name,
      sex: ALL,
      population: 100000,
      population_pct: 100,
    };

    const AL_MALE_ROW = {
      state_fips: AL.code,
      state_name: AL.name,
      cases: 730,
      hosp_y: 45,
      death_y: 250,
      sex: MALE,
      population: 60000,
      population_pct: 75,
    };

    const AL_ALL_ROW = {
      state_fips: AL.code,
      state_name: AL.name,
      cases: 100,
      hosp_y: 1000,
      death_y: 200,
      sex: ALL,
      population: 80000,
      population_pct: 100,
    };

    const rawCovidData = [
      NC_UNKNOWN_ROW,
      NC_FEMALE_ROW,
      NC_ALL_ROW,
      AL_MALE_ROW,
      AL_ALL_ROW,
    ];

    const rawAcsData = [USA_ACS_FEMALE_ROW, USA_ACS_MALE_ROW, USA_ACS_ALL_ROW];

    const FINAL_MALE_ROW = {
      fips: USA.code,
      fips_name: USA.name,
      sex: MALE,
      covid_cases: 730,
      covid_cases_per_100k: 1217,
      covid_cases_share: 182.5,
      covid_cases_share_of_known: 75.3,
      covid_cases_reporting_population: 60000,
      covid_cases_reporting_population_pct: 50,
    };
    const FINAL_FEMALE_ROW = {
      fips: USA.code,
      fips_name: USA.name,
      sex: FEMALE,
      covid_cases: 240,
      covid_cases_per_100k: 480,
      covid_cases_share: 60,
      covid_cases_share_of_known: 24.7,
      covid_cases_reporting_population: 50000,
      covid_cases_reporting_population_pct: 50,
    };
    const FINAL_ALL_ROW = {
      fips: USA.code,
      fips_name: USA.name,
      sex: ALL,
      covid_cases: 400,
      covid_cases_per_100k: 222,
      covid_cases_share: 100,
      covid_cases_share_of_known: 100,
      covid_cases_reporting_population: 180000,
      covid_cases_reporting_population_pct: 100,
    };
    // Note that covid_cases_share_of_known is not present.
    const FINAL_UNKNOWN_ROW = {
      fips: USA.code,
      fips_name: USA.name,
      sex: UNKNOWN,
      covid_cases: 100,
      covid_cases_per_100k: 10000000,
      covid_cases_share: 25,
      covid_cases_reporting_population: 1,
      covid_cases_reporting_population_pct: undefined,
    };

    await evaluateWithAndWithoutAll(
      "cdc_restricted_data-by_sex_state",
      rawCovidData,
      [
        "acs_population-by_sex_national",
        "acs_2010_population-by_sex_territory",
      ],
      rawAcsData,
      Breakdowns.national(),
      "sex",
      [FINAL_FEMALE_ROW, FINAL_MALE_ROW, FINAL_UNKNOWN_ROW],
      [FINAL_ALL_ROW, FINAL_FEMALE_ROW, FINAL_MALE_ROW, FINAL_UNKNOWN_ROW]
    );
  });
});
