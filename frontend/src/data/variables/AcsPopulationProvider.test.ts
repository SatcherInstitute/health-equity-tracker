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
import { RACE, AGE, SEX } from "../utils/Constants";

export async function ensureCorrectDatasetsDownloaded(
  acsDatasetId: string,
  baseBreakdown: Breakdowns,
  breakdownVar: BreakdownVar
) {
  const acsPopulationProvider = new AcsPopulationProvider();

  dataFetcher.setFakeDatasetLoaded(acsDatasetId, []);

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await acsPopulationProvider.getData(
    new MetricQuery([], baseBreakdown.addBreakdown(breakdownVar))
  );

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1);

  const consumedDatasetIds = [acsDatasetId];
  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse([], consumedDatasetIds)
  );
}

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

describe("AcsPopulationProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap);
  });

  test("County and Race Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "acs_population-by_race_county-01",
      Breakdowns.forFips(new Fips("01001")),
      RACE
    );
  });

  test("State and Race Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "acs_population-by_race_state",
      Breakdowns.forFips(new Fips("37")),
      RACE
    );
  });

  test("National and Race Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "acs_population-by_race_national",
      Breakdowns.forFips(new Fips("00")),
      RACE
    );
  });

  test("County and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "acs_population-by_age_county-02",
      Breakdowns.forFips(new Fips("02013")),
      AGE
    );
  });

  test("State and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "acs_population-by_age_state",
      Breakdowns.forFips(new Fips("37")),
      AGE
    );
  });

  test("National and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "acs_population-by_age_national",
      Breakdowns.forFips(new Fips("00")),
      AGE
    );
  });

  test("County and Sex Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "acs_population-by_sex_county-37",
      Breakdowns.forFips(new Fips("37001")),
      SEX
    );
  });

  test("State and Sex Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "acs_population-by_sex_state",
      Breakdowns.forFips(new Fips("37")),
      SEX
    );
  });

  test("National and Sex Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "acs_population-by_sex_national",
      Breakdowns.forFips(new Fips("00")),
      SEX
    );
  });
});
