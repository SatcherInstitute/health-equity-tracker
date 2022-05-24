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
import { CHATAM, NC, VI, USA, AL } from "./TestUtils";
import { WHITE_NH, RACE, ALL, FEMALE, MALE } from "../utils/Constants";
import { MetricId } from "../config/MetricConfig";
import { excludeAll } from "../query/BreakdownFilter";

const METRIC_IDS: MetricId[] = [
  "covid_cases",
  "covid_cases_per_100k",
  "covid_cases_share",
  "covid_cases_share_of_known",
  "covid_cases_reporting_population",
  "covid_cases_reporting_population_pct",
];

export async function ensureCorrectDatasetsDownloaded(
  cdcDatasetId: string,
  acsDatasetIds: string[],
  baseBreakdown: Breakdowns,
  breakdownVar: BreakdownVar,
  rawCovidData: any,
  finalCovidData: any
) {
  const acsProvider = new AcsPopulationProvider();
  const cdcCovidProvider = new CdcCovidProvider(acsProvider);

  var consumedDatasetIds = [];

  dataFetcher.setFakeDatasetLoaded(cdcDatasetId, [rawCovidData]);
  consumedDatasetIds.push(cdcDatasetId);

  for (var id of acsDatasetIds) {
    dataFetcher.setFakeDatasetLoaded(id, []);
    consumedDatasetIds.push(id);
  }

  const responseIncludingAll = await cdcCovidProvider.getData(
    new MetricQuery([], baseBreakdown.addBreakdown(breakdownVar))
  );

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1);

  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse([finalCovidData], consumedDatasetIds)
  );
}

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
    };
    const FINAL_ALL_ROW = {
      fips: USA.code,
      fips_name: USA.name,
      sex: ALL,
      covid_cases: 300,
      covid_cases_per_100k: 167,
      covid_cases_share: 100,
      covid_cases_share_of_known: 100,
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

  test("County and Race Breakdown", async () => {
    // Raw rows with cases, hospitalizations, death, population
    const CHATAM_WHITE_ROW = {
      county_fips: CHATAM.code,
      county_name: CHATAM.name,
      race_and_ethnicity: WHITE_NH,
    };

    const CHATAM_WHITE_FINAL_ROW = {
      fips: CHATAM.code,
      fips_name: CHATAM.name,
      race_and_ethnicity: WHITE_NH,
    };

    await ensureCorrectDatasetsDownloaded(
      "cdc_restricted_data-by_race_county_processed",
      ["acs_population-by_race_county_std"],
      Breakdowns.forFips(new Fips(CHATAM.code)),
      RACE,
      CHATAM_WHITE_ROW,
      CHATAM_WHITE_FINAL_ROW
    );
  });

  test("State and Age Breakdown", async () => {
    const NC_AGE_ROW = {
      state_fips: NC.code,
      state_name: NC.name,
      age: "40-49",
    };

    const NC_AGE_FINAL_ROW = {
      fips: NC.code,
      fips_name: NC.name,
      age: "40-49",
    };

    await ensureCorrectDatasetsDownloaded(
      "cdc_restricted_data-by_age_state_processed",
      ["acs_population-by_age_state"],
      Breakdowns.forFips(new Fips(NC.code)),
      "age",
      NC_AGE_ROW,
      NC_AGE_FINAL_ROW
    );
  });

  test("population source acs 2010", async () => {
    const VI_SEX_ROW = {
      state_fips: VI.code,
      state_name: VI.name,
      sex: MALE,
    };

    const VI_SEX_FINAL_ROW = {
      fips: VI.code,
      fips_name: VI.name,
      sex: MALE,
    };
    await ensureCorrectDatasetsDownloaded(
      "cdc_restricted_data-by_sex_state_processed",
      ["acs_2010_population-by_sex_territory"],
      Breakdowns.forFips(new Fips(VI.code)),
      "sex",
      VI_SEX_ROW,
      VI_SEX_FINAL_ROW
    );
  });
});
