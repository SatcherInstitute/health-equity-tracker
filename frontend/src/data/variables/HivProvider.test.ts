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

const testCases = [
  {
    name: "County and Race Breakdown for Diagnoses",
    datasetId: "cdc_hiv_data-race_and_ethnicity_county_time_series-06",
    breakdowns: Breakdowns.forFips(new Fips("06037")),
    breakdownVar: RACE,
    metricName: "hiv_diagnoses",
    metricIds: ["hiv_diagnoses_per_100k"],
  },
  {
    name: "County and Age Breakdown for Deaths",
    datasetId: "cdc_hiv_data-age_county_time_series-06",
    breakdowns: Breakdowns.forFips(new Fips("06037")),
    breakdownVar: AGE,
    metricName: "hiv_deaths",
    metricIds: ["hiv_deaths_per_100k"],
  },
  {
    name: "County and Sex Breakdown for Prep",
    datasetId: "cdc_hiv_data-sex_county_time_series-06",
    breakdowns: Breakdowns.forFips(new Fips("06037")),
    breakdownVar: SEX,
    metricName: "hiv_prep",
    metricIds: ["hiv_prep_coverage"],
  },
  {
    name: "State and Race Breakdown Deaths",
    datasetId: "cdc_hiv_data-race_and_ethnicity_state_time_series",
    breakdowns: Breakdowns.forFips(new Fips("37")),
    breakdownVar: RACE,
    metricName: "hiv_deaths",
    metricIds: ["hiv_deaths_pct_share"],
  },
  {
    name: "State and Age Breakdown PrEP",
    datasetId: "cdc_hiv_data-age_state_time_series",
    breakdowns: Breakdowns.forFips(new Fips("37")),
    breakdownVar: AGE,
    metricName: "hiv_prep",
    metricIds: ["hiv_prep_pct_share"],
  },
  {
    name: "State and Sex Breakdown Diagnoses",
    datasetId: "cdc_hiv_data-sex_state_time_series",
    breakdowns: Breakdowns.forFips(new Fips("37")),
    breakdownVar: SEX,
    metricName: "hiv_diagnoses",
    metricIds: ["hiv_diagnoses_pct_share"],
  },
  {
    name: "National and Race Breakdown PrEP",
    datasetId: "cdc_hiv_data-race_and_ethnicity_national_time_series",
    breakdowns: Breakdowns.forFips(new Fips("00")),
    breakdownVar: RACE,
    metricName: "hiv_prep",
    metricIds: ["hiv_prep_pct_relative_inequity"],
  },
  {
    name: "National and Age Breakdown Diagnoses",
    datasetId: "cdc_hiv_data-race_and_ethnicity_national_time_series",
    breakdowns: Breakdowns.forFips(new Fips("00")),
    breakdownVar: RACE,
    metricName: "hiv_diagnoses",
    metricIds: ["hiv_diagnoses_pct_relative_inequity"],
  },
  {
    name: "National and Race Breakdown Deaths",
    datasetId: "cdc_hiv_data-race_and_ethnicity_national_time_series",
    breakdowns: Breakdowns.forFips(new Fips("00")),
    breakdownVar: RACE,
    metricName: "hiv_deaths",
    metricIds: ["hiv_deaths_pct_relative_inequity"],
  },
];

describe("HivProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap);
  });

  testCases.forEach((testCase) => {
    test(testCase.name, async () => {
      await ensureCorrectDatasetsDownloaded(
        testCase.datasetId,
        testCase.breakdowns,
        testCase.breakdownVar as BreakdownVar,
        testCase.metricName as VariableId,
        testCase.metricIds as MetricId[]
      );
    });
  });
});
