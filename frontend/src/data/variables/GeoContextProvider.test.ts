import GeoContextProvider from "./GeoContextProvider";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { Fips } from "../utils/Fips";
import { DatasetMetadataMap } from "../config/DatasetMetadata";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import FakeDataFetcher from "../../testing/FakeDataFetcher";
import { MetricId } from "../config/MetricConfig";

/* Given the geocontext id */
export async function ensureCorrectDatasetsDownloaded(
  fips: Fips,
  expectedGeoContextId: string,
  expectedDatasetIds: string[]
) {
  const breakdown = Breakdowns.forFips(fips);
  const metricIds: MetricId[] = ["svi", "population"];
  const provider = new GeoContextProvider();

  dataFetcher.setFakeDatasetLoaded(expectedGeoContextId, []);

  // Evaluate the response
  const responseIncludingAll = await provider.getData(
    new MetricQuery(metricIds, breakdown)
  );

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1);

  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse([], expectedDatasetIds)
  );
}

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

describe("GeoContextProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap);
  });

  test("County", async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips("06037"),
      "geo_context-county-06",
      ["acs_population-by_age_county", "cdc_svi_county-age"]
    );
  });

  test("County Equivalent ACS", async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips("72123"),
      "geo_context-county-72",
      ["acs_population-by_age_county", "cdc_svi_county-age"]
    );
  });

  test("County Equivalent ACS2010", async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips("78010"),
      "geo_context-county-78",
      ["acs_2010_population-by_age_territory", "cdc_svi_county-age"]
    );
  });

  test("State", async () => {
    await ensureCorrectDatasetsDownloaded(new Fips("06"), "geo_context-state", [
      "acs_population-by_age_state",
    ]);
  });

  test("Territory ACS", async () => {
    await ensureCorrectDatasetsDownloaded(new Fips("72"), "geo_context-state", [
      "acs_population-by_age_state",
    ]);
  });

  test("Territory ACS2010", async () => {
    await ensureCorrectDatasetsDownloaded(new Fips("78"), "geo_context-state", [
      "acs_2010_population-by_age_territory",
    ]);
  });

  test("National", async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips("00"),
      "geo_context-national",
      ["acs_population-by_age_national"]
    );
  });
});
