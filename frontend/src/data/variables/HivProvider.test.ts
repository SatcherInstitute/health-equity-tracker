import HivProvider from "./HivProvider";
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
import { MetricId, VariableId } from "../config/MetricConfig";

export async function ensureCorrectDatasetsDownloaded(
  hivDatasetId: string,
  baseBreakdown: Breakdowns,
  breakdownVar: BreakdownVar,
  variableId: VariableId,
  metricIds?: MetricId[]
) {
  // if these aren't sent as args, default to []
  metricIds = metricIds || [];

  const hivProvider = new HivProvider();

  dataFetcher.setFakeDatasetLoaded(hivDatasetId, []);

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await hivProvider.getData(
    new MetricQuery(
      metricIds,
      baseBreakdown.addBreakdown(breakdownVar),
      variableId
    )
  );

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1);

  const consumedDatasetIds = [hivDatasetId];

  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse([], consumedDatasetIds)
  );
}

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

describe("HivProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap);
  });

  test("County and Race Breakdown for Diagnoses", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_hiv_data-race_and_ethnicity_county_time_series-06",
      Breakdowns.forFips(new Fips("06037")),
      RACE,
      "hiv_diagnoses",
      /* metricIds */ ["hiv_diagnoses_per_100k"]
    );
  });

  test("County and Age Breakdown for Deaths", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_hiv_data-race_and_ethnicity_county_time_series-06",
      Breakdowns.forFips(new Fips("06037")),
      AGE,
      "hiv_deaths",
      /* metricIds */ ["hiv_deaths_per_100k"]
    );
  });

  test("County and Sex Breakdown for PrEP", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_hiv_data-race_and_ethnicity_county_time_series-06",
      Breakdowns.forFips(new Fips("06037")),
      SEX,
      "hiv_prep",
      /* metricIds */ ["hiv_prep_coverage"]
    );
  });

  test("State and Race Breakdown Diagnoses", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_hiv_data-race_and_ethnicity_state_time_series",
      Breakdowns.forFips(new Fips("37")),
      RACE,
      "hiv_diagnoses",
      /* metricIds */ ["hiv_diagnoses_pct_share"]
    );
  });

  test("National and Race Breakdown Diagnoses", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_hiv_data-race_and_ethnicity_national_time_series",
      Breakdowns.forFips(new Fips("00")),
      RACE,
      "hiv_diagnoses",
      /* metricIds */ ["hiv_diagnoses_per_100k"]
    );
  });

  test("County and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_hiv_data-age_county_time_series-06",
      Breakdowns.forFips(new Fips("06037")),
      AGE,
      "hiv_diagnoses",
      /* metricIds */ ["hiv_diagnoses_per_100k"]
    );
  });

  test("State and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_hiv_data-age_state_time_series",
      Breakdowns.forFips(new Fips("37")),
      AGE,
      "hiv_diagnoses",
      /* metricIds */ ["hiv_diagnoses_per_100k"]
    );
  });

  test("National and Age Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_hiv_data-age_national_time_series",
      Breakdowns.forFips(new Fips("00")),
      AGE,
      "hiv_diagnoses",
      /* metricIds */ [
        "hiv_diagnoses_per_100k",
        "hiv_diagnoses_pct_relative_inequity",
      ]
    );
  });

  test("County and Sex Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_hiv_data-sex_county_time_series-06",
      Breakdowns.forFips(new Fips("06037")),
      SEX,
      "hiv_diagnoses",
      /* metricIds */ ["hiv_diagnoses_per_100k"]
    );
  });

  test("State and Sex Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_hiv_data-sex_state_time_series",
      Breakdowns.forFips(new Fips("37")),
      SEX,
      "hiv_diagnoses",
      /* metricIds */ ["hiv_diagnoses_per_100k"]
    );
  });

  test("National and Sex Breakdown", async () => {
    await ensureCorrectDatasetsDownloaded(
      "cdc_hiv_data-sex_national_time_series",
      Breakdowns.forFips(new Fips("00")),
      SEX,
      "hiv_diagnoses",
      /* metricIds */ ["hiv_diagnoses_per_100k"]
    );
  });
});
