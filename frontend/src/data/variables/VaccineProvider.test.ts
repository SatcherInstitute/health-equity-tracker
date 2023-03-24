import VaccineProvider from "./VaccineProvider";
import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns, BreakdownVar } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { Fips } from "../utils/Fips";
import { DatasetMetadataMap } from "../config/DatasetMetadata";
import { excludeAll } from "../query/BreakdownFilter";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import FakeDataFetcher from "../../testing/FakeDataFetcher";
import { FipsSpec, NC, USA, MARIN } from "./TestUtils";
import { RACE, SEX, AGE } from "../utils/Constants";
import { MetricId } from "../config/MetricConfig";

const METRIC_IDS: MetricId[] = [
  "vaccinated_pct_share",
  "vaccinated_share_of_known",
  "vaccinated_per_100k",
  "vaccinated_pop_pct",
];

export async function ensureCorrectDatasetsDownloaded(
  vaccinationDatasetId: string,
  baseBreakdown: Breakdowns,
  breakdownVar: BreakdownVar
) {
  const acsProvider = new AcsPopulationProvider();
  const vaccineProvider = new VaccineProvider(acsProvider);

  dataFetcher.setFakeDatasetLoaded(vaccinationDatasetId, []);

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await vaccineProvider.getData(
    new MetricQuery([], baseBreakdown.addBreakdown(breakdownVar))
  );

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1);
  expect(responseIncludingAll.consumedDatasetIds).toContain(
    vaccinationDatasetId
  );
}

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

describe("VaccineProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap);
  });

  test("State and Race Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "kff_vaccination-race_and_ethnicity_processed",
      Breakdowns.forFips(new Fips(NC.code)),
      RACE
    );
  });

  test("National and Race Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_vaccination_national-race_processed",
      Breakdowns.forFips(new Fips(USA.code)),
      RACE
    );
  });

  test("National and Sex Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_vaccination_national-sex_processed",
      Breakdowns.forFips(new Fips(USA.code)),
      SEX
    );
  });

  test("National and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_vaccination_national-age_processed",
      Breakdowns.forFips(new Fips(USA.code)),
      AGE
    );
  });

  test("County and Race Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_vaccination_county-race_and_ethnicity_processed-06",
      Breakdowns.forFips(new Fips(MARIN.code)),
      RACE
    );
  });
});
