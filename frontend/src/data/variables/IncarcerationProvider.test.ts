import IncarcerationProvider from "./IncarcerationProvider";
import { Breakdowns, BreakdownVar, TimeView } from "../query/Breakdowns";
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
import { MetricId, VariableId } from "../config/MetricConfig";

export async function ensureCorrectDatasetsDownloaded(
  IncarcerationDatasetId: string,
  baseBreakdown: Breakdowns,
  breakdownVar: BreakdownVar,
  variableId: VariableId,
  timeView: TimeView,
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
    new MetricQuery(
      metricIds,
      baseBreakdown.addBreakdown(breakdownVar),
      variableId,
      timeView
    )
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

  test("State and Race Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "bjs_incarceration_data-race_and_ethnicity_state",
      Breakdowns.forFips(new Fips("37")),
      RACE,
      "jail",
      "cross_sectional",
      ["acs_population-by_race_state"]
    );
  });

  test("National and Race Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "bjs_incarceration_data-race_and_ethnicity_national",
      Breakdowns.forFips(new Fips("00")),
      RACE,
      "jail",
      "cross_sectional",
      ["acs_population-by_race_national"]
    );
  });

  test("State and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "bjs_incarceration_data-age_state",
      Breakdowns.forFips(new Fips("37")),
      AGE,
      "prison",
      "cross_sectional",

      ["acs_population-by_age_state"]
    );
  });

  test("National and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "bjs_incarceration_data-age_national",
      Breakdowns.forFips(new Fips("00")),
      AGE,
      "prison",
      "cross_sectional",

      ["acs_population-by_age_national"]
    );
  });

  test("State and Sex Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "bjs_incarceration_data-sex_state",
      Breakdowns.forFips(new Fips("37")),
      SEX,
      "jail",
      "cross_sectional",

      ["acs_population-by_sex_state"]
    );
  });

  test("National and Sex Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "bjs_incarceration_data-sex_national",
      Breakdowns.forFips(new Fips("00")),
      SEX,
      "jail",
      "cross_sectional",

      ["acs_population-by_sex_national"]
    );
  });

  /* County level tests were timing out using the test function at the top of the file
  For now at least have these simple tests in place */

  test("County and Race Breakdown", async () => {
    const countyBreakdowns = Breakdowns.forFips(new Fips("06037")).addBreakdown(
      RACE
    );
    const provider = new IncarcerationProvider();
    expect(provider.getDatasetId(countyBreakdowns)).toEqual(
      "vera_incarceration_county-by_race_and_ethnicity_county_time_series"
    );
  });

  test("County and Age Breakdown", async () => {
    const countyBreakdowns = Breakdowns.forFips(new Fips("06037")).addBreakdown(
      AGE
    );
    const provider = new IncarcerationProvider();
    expect(provider.getDatasetId(countyBreakdowns)).toEqual(
      "vera_incarceration_county-by_age_county_time_series"
    );
  });

  test("County and Sex Breakdown", async () => {
    const countyBreakdowns = Breakdowns.forFips(new Fips("06037")).addBreakdown(
      SEX
    );
    const provider = new IncarcerationProvider();
    expect(provider.getDatasetId(countyBreakdowns)).toEqual(
      "vera_incarceration_county-by_sex_county_time_series"
    );
  });
});
