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
import { WHITE_NH, RACE, SEX, MALE } from "../utils/Constants";

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

  const consumedDatasetIds = [];

  dataFetcher.setFakeDatasetLoaded(cdcDatasetId, [rawCovidData]);
  consumedDatasetIds.push(cdcDatasetId);

  for (const id of acsDatasetIds) {
    dataFetcher.setFakeDatasetLoaded(id, []);
    consumedDatasetIds.push(id);
  }

  const responseIncludingAll = await cdcCovidProvider.getData(
    new MetricQuery([], baseBreakdown.addBreakdown(breakdownVar))
  );

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1);

  expect(responseIncludingAll.consumedDatasetIds).toEqual(consumedDatasetIds);
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
    const US_MALE_ROW = {
      county_fips: USA.code,
      county_name: USA.name,
      sex: MALE,
    };

    const US_MALE_FINAL_ROW = {
      fips: USA.code,
      fips_name: USA.name,
      sex: MALE,
    };

    await ensureCorrectDatasetsDownloaded(
      "cdc_restricted_data-by_sex_national_processed",
      ["acs_population-by_sex_national"],
      Breakdowns.forFips(new Fips(USA.code)),
      SEX,
      US_MALE_ROW,
      US_MALE_FINAL_ROW
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
