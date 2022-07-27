import BrfssProvider from "./BrfssProvider";
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
  brfssDatasetId: string,
  acsDatasetId: string,
  baseBreakdown: Breakdowns,
  breakdownVar: BreakdownVar
) {
  const brfssProvider = new BrfssProvider();

  dataFetcher.setFakeDatasetLoaded(brfssDatasetId, []);
  dataFetcher.setFakeDatasetLoaded(acsDatasetId, []);

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await brfssProvider.getData(
    new MetricQuery([], baseBreakdown.addBreakdown(breakdownVar), "current")
  );

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1);

  const consumedDatasetIds = [brfssDatasetId, acsDatasetId];
  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse([], consumedDatasetIds)
  );
}

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

describe("BrfssProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap);
  });

  test("State and Race Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "uhc_data-race_and_ethnicity_state",
      "acs_population-by_race_state_std",
      Breakdowns.forFips(new Fips("37")),
      RACE
    );
  });

  test("National and Race Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "uhc_data-race_and_ethnicity_national",
      "acs_population-by_race_national",
      Breakdowns.forFips(new Fips("00")),
      RACE
    );
  });

  test("State and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "uhc_data-age_state",
      "acs_population-by_age_state",
      Breakdowns.forFips(new Fips("37")),
      AGE
    );
  });

  test("National and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "uhc_data-age_national",
      "acs_population-by_age_national",
      Breakdowns.forFips(new Fips("00")),
      AGE
    );
  });

  test("State and Sex Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "uhc_data-sex_state",
      "acs_population-by_sex_state",
      Breakdowns.forFips(new Fips("37")),
      SEX
    );
  });

  test("National and Sex Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "uhc_data-sex_national",
      "acs_population-by_sex_national",
      Breakdowns.forFips(new Fips("00")),
      SEX
    );
  });
});
