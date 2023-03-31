import AhrProvider from "./AhrProvider";
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
  ahrDatasetId: string,
  baseBreakdown: Breakdowns,
  breakdownVar: BreakdownVar
) {
  const ahrProvider = new AhrProvider();

  dataFetcher.setFakeDatasetLoaded(ahrDatasetId, []);

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await ahrProvider.getData(
    new MetricQuery([], baseBreakdown.addBreakdown(breakdownVar))
  );

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1);

  const consumedDatasetIds = [ahrDatasetId];
  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse([], consumedDatasetIds)
  );
}

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

describe("AhrProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap);
  });

  test("State and Race Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "ahr_data-race_and_ethnicity_state",
      Breakdowns.forFips(new Fips("37")),
      RACE
    );
  });

  test("National and Race Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "ahr_data-race_and_ethnicity_national",
      Breakdowns.forFips(new Fips("00")),
      RACE
    );
  });

  test("State and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "ahr_data-age_state",
      Breakdowns.forFips(new Fips("37")),
      AGE
    );
  });

  test("National and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "ahr_data-age_national",
      Breakdowns.forFips(new Fips("00")),
      AGE
    );
  });

  test("State and Sex Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "ahr_data-sex_state",
      Breakdowns.forFips(new Fips("37")),
      SEX
    );
  });

  test("National and Sex Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "ahr_data-sex_national",
      Breakdowns.forFips(new Fips("00")),
      SEX
    );
  });
});
