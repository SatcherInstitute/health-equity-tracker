import IncarcerationProvider from "./IncarcerationProvider";
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
import { MetricId } from "../config/MetricConfig";

export async function ensureCorrectDatasetsDownloaded(
  IncarcerationDatasetId: string,
  baseBreakdown: Breakdowns,
  breakdownVar: BreakdownVar,
  acsDatasetIds?: string[],
  metricIds?: MetricId[]
) {
  // if these aren't sent as args, default to []
  metricIds = metricIds || [];
  acsDatasetIds = acsDatasetIds || [];

  const incarcerationProvider = new IncarcerationProvider();

  dataFetcher.setFakeDatasetLoaded(IncarcerationDatasetId, []);

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await incarcerationProvider.getData(
    new MetricQuery(metricIds, baseBreakdown.addBreakdown(breakdownVar))
  );

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1);

  const consumedDatasetIds = [IncarcerationDatasetId];
  consumedDatasetIds.push(...acsDatasetIds);

  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse([], consumedDatasetIds)
  );
}

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

describe("IncarcerationProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap);
  });

  test("County and Race Breakdown for Prison", async () => {
    await ensureCorrectDatasetsDownloaded(
      "vera_incarceration_county-prison_race_and_ethnicity_county-06",
      Breakdowns.forFips(new Fips("06037")),
      RACE,
      [],
      ["prison_per_100k"]
    );
  });

  test("State and Race Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "bjs_incarceration_data-race_and_ethnicity_state",
      Breakdowns.forFips(new Fips("37")),
      RACE,
      ["acs_population-by_race_state_std"]
    );
  });

  test("National and Race Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "bjs_incarceration_data-race_and_ethnicity_national",
      Breakdowns.forFips(new Fips("00")),
      RACE,
      [
        "acs_population-by_race_national",
        "acs_2010_population-by_race_and_ethnicity_territory",
      ]
    );
  });

  test("County and Age Breakdown for Jail", async () => {
    await ensureCorrectDatasetsDownloaded(
      "vera_incarceration_county-jail_age_county-06",
      Breakdowns.forFips(new Fips("06037")),
      AGE,
      [],
      ["jail_per_100k"]
    );
  });

  test("State and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "bjs_incarceration_data-age_state",
      Breakdowns.forFips(new Fips("37")),
      AGE,
      ["acs_population-by_age_state"]
    );
  });

  test("National and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "bjs_incarceration_data-age_national",
      Breakdowns.forFips(new Fips("00")),
      AGE,
      [
        "acs_population-by_age_national",
        "acs_2010_population-by_race_and_ethnicity_territory",
      ]
    );
  });

  test("County and Sex Breakdown for Jail", async () => {
    await ensureCorrectDatasetsDownloaded(
      "vera_incarceration_county-jail_sex_county-06",
      Breakdowns.forFips(new Fips("06037")),
      SEX,
      [],
      ["jail_per_100k"]
    );
  });

  test("State and Sex Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "bjs_incarceration_data-sex_state",
      Breakdowns.forFips(new Fips("37")),
      SEX,
      ["acs_population-by_sex_state"]
    );
  });

  test("National and Sex Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "bjs_incarceration_data-sex_national",
      Breakdowns.forFips(new Fips("00")),
      SEX,
      [
        "acs_population-by_sex_national",
        "acs_2010_population-by_race_and_ethnicity_territory",
      ]
    );
  });
});
