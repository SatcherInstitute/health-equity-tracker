import CdcCovidProvider from "./CdcCovidProvider";
import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns, BreakdownVar } from "../query/Breakdowns";
import { MetricQuery } from "../query/MetricQuery";
import { Fips } from "../utils/Fips";
import { DatasetMetadataMap } from "../config/DatasetMetadata";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import FakeDataFetcher from "../../testing/FakeDataFetcher";
import { CHATAM, NC, VI, USA } from "./TestUtils";
import { RACE, SEX, AGE } from "../utils/Constants";

export async function ensureCorrectDatasetsDownloaded(
  cdcDatasetId: string,
  baseBreakdown: Breakdowns,
  breakdownVar: BreakdownVar
) {
  const acsProvider = new AcsPopulationProvider();
  const cdcCovidProvider = new CdcCovidProvider(acsProvider);

  dataFetcher.setFakeDatasetLoaded(cdcDatasetId, []);

  const responseIncludingAll = await cdcCovidProvider.getData(
    new MetricQuery([], baseBreakdown.addBreakdown(breakdownVar))
  );

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1);
  expect(responseIncludingAll.consumedDatasetIds).toContain(cdcDatasetId);
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
    await ensureCorrectDatasetsDownloaded(
      "cdc_restricted_data-by_sex_national_processed",
      Breakdowns.forFips(new Fips(USA.code)),
      SEX
    );
  });

  test("National and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_restricted_data-by_age_national_processed",
      Breakdowns.forFips(new Fips(USA.code)),
      AGE
    );
  });

  test("National and Race Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_restricted_data-by_race_national_processed-with_age_adjust",
      Breakdowns.forFips(new Fips(USA.code)),
      RACE
    );
  });

  test("State and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_restricted_data-by_age_state_processed",
      Breakdowns.forFips(new Fips(NC.code)),
      AGE
    );
  });

  test("State and Sex Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_restricted_data-by_sex_state_processed",
      Breakdowns.forFips(new Fips(NC.code)),
      SEX
    );
  });

  test("State and Race Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_restricted_data-by_race_state_processed-with_age_adjust",
      Breakdowns.forFips(new Fips(NC.code)),
      RACE
    );
  });

  test("County and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_restricted_data-by_age_county_processed-37",
      Breakdowns.forFips(new Fips(CHATAM.code)),
      AGE
    );
  });

  test("County and Sex Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_restricted_data-by_sex_county_processed-37",
      Breakdowns.forFips(new Fips(CHATAM.code)),
      SEX
    );
  });

  test("County and Race Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_restricted_data-by_race_county_processed-37",
      Breakdowns.forFips(new Fips(CHATAM.code)),
      RACE
    );
  });

  test("population source acs 2010", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_restricted_data-by_sex_state_processed",
      Breakdowns.forFips(new Fips(VI.code)),
      "sex"
    );
  });
});
