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
  metricIds: MetricId[],
  expectedGeoContextId: string,
  expectedDatasetIds: string[]
) {
  const breakdown = Breakdowns.forFips(fips);
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

  test("County Pop+SVI", async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips("06037"),
      ["svi", "population"],
      "geo_context-county-06",
      ["cdc_svi_county-age", "acs_population-by_age_county"]
    );
  });

  test("County SVI only", async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips("06037"),
      ["svi"],
      "geo_context-county-06",
      ["cdc_svi_county-age"]
    );
  });

  test("County Equivalent ACS Pop+SVI", async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips("72123"),
      ["svi", "population"],
      "geo_context-county-72",
      ["cdc_svi_county-age", "acs_population-by_age_county"]
    );
  });

  test("County Equivalent ACS2010 Pop+SVI", async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips("78010"),
      ["svi", "population"],
      "geo_context-county-78",
      // TODO: currently county-equivalent population data is not being loaded from the ACS2010
      // TODO: so the footer won't show on the population card. See #1954
      ["cdc_svi_county-age", "acs_2010_population-by_age_territory"]
    );
  });

  test("State Pop", async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips("06"),
      ["population"],
      "geo_context-state",
      ["acs_population-by_age_state"]
    );
  });

  test("Territory ACS Pop", async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips("72"),
      ["population"],
      "geo_context-state",
      ["acs_population-by_age_state"]
    );
  });

  test("Territory ACS2010 Pop", async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips("78"),
      ["population"],
      "geo_context-state",
      ["acs_2010_population-by_age_territory"]
    );
  });

  test("National Pop", async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips("00"),
      ["population"],
      "geo_context-national",
      ["acs_population-by_age_national"]
    );
  });
});
