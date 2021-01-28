import BrfssProvider from "./BrfssProvider";
import { Breakdowns } from "../Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../MetricQuery";
import { Fips, USA_FIPS, USA_DISPLAY_NAME } from "../../utils/madlib/Fips";
import FakeMetadataMap from "../FakeMetadataMap";
import { per100k } from "../datasetutils";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import FakeDataFetcher from "../../testing/FakeDataFetcher";

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

describe("BrfssProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(FakeMetadataMap);
  });

  test("State and Race Breakdown", async () => {
    const brfssProvider = new BrfssProvider();

    const AL_ASIAN_ROW = {
      race_and_ethnicity: "Asian (Non-Hispanic)",
      state_fips: "01",
      state_name: "AL",
      copd_count: 100,
      copd_no: 900,
      diabetes_count: 200,
      diabetes_no: 800,
    };
    const NC_ASIAN_ROW = {
      race_and_ethnicity: "Asian (Non-Hispanic)",
      state_fips: "37",
      state_name: "NC",
      copd_count: 100,
      copd_no: 900,
      diabetes_count: 400,
      diabetes_no: 600,
    };
    const NC_ASIAN_FINAL_ROW = {
      race_and_ethnicity: "Asian (Non-Hispanic)",
      fips: "37",
      fips_name: "NC",
      copd_count: 100,
      copd_no: 900,
      copd_per_100k: 10000,
      diabetes_count: 400,
      diabetes_no: 600,
      diabetes_per_100k: 40000,
    };
    const NC_WHITE_ROW = {
      race_and_ethnicity: "White (Non-Hispanic)",
      state_fips: "37",
      state_name: "NC",
      copd_count: 500,
      copd_no: 500,
      diabetes_count: 600,
      diabetes_no: 400,
    };
    const NC_WHITE_FINAL_ROW = {
      race_and_ethnicity: "White (Non-Hispanic)",
      fips: "37",
      fips_name: "NC",
      copd_count: 500,
      copd_no: 500,
      copd_per_100k: 50000,
      diabetes_count: 600,
      diabetes_no: 400,
      diabetes_per_100k: 60000,
    };

    const NC_TOTAL_FINAL_ROW = {
      race_and_ethnicity: "Total",
      fips: "37",
      fips_name: "NC",
      copd_count: 600,
      copd_no: 1400,
      copd_per_100k: 30000,
      diabetes_count: 1000,
      diabetes_no: 1000,
      diabetes_per_100k: 50000,
    };

    dataFetcher.setFakeDatasetLoaded("brfss", [
      AL_ASIAN_ROW,
      NC_ASIAN_ROW,
      NC_WHITE_ROW,
    ]);

    // Evaluate the response without requesting total field
    const responseWithoutTotal = await brfssProvider.getData(
      new MetricQuery(
        "diabetes_count",
        Breakdowns.forFips(new Fips("37")).andRace()
      )
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(
        [NC_ASIAN_FINAL_ROW, NC_WHITE_FINAL_ROW],
        ["brfss"]
      )
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = await brfssProvider.getData(
      new MetricQuery(
        "diabetes_count",
        Breakdowns.forFips(new Fips("37")).andRace(/*includeTotal=*/ true)
      )
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [NC_ASIAN_FINAL_ROW, NC_WHITE_FINAL_ROW, NC_TOTAL_FINAL_ROW],
        ["brfss"]
      )
    );
  });

  test("National and Race Breakdown", async () => {
    const brfssProvider = new BrfssProvider();

    const AL_ASIAN_ROW = {
      race_and_ethnicity: "Asian (Non-Hispanic)",
      state_fips: "01",
      state_name: "AL",
      copd_count: 100,
      copd_no: 900,
      diabetes_count: 200,
      diabetes_no: 800,
    };
    const NC_ASIAN_ROW = {
      race_and_ethnicity: "Asian (Non-Hispanic)",
      state_fips: "37",
      state_name: "NC",
      copd_count: 100,
      copd_no: 900,
      diabetes_count: 400,
      diabetes_no: 600,
    };
    const NC_WHITE_ROW = {
      race_and_ethnicity: "White (Non-Hispanic)",
      state_fips: "37",
      state_name: "NC",
      copd_count: 500,
      copd_no: 500,
      diabetes_count: 600,
      diabetes_no: 400,
    };

    const ASIAN_FINAL_ROW = {
      copd_count: 200,
      copd_no: 1800,
      copd_per_100k: per100k(200, 200 + 1800),
      diabetes_count: 600,
      diabetes_no: 1400,
      diabetes_per_100k: per100k(600, 600 + 1400),
      race_and_ethnicity: "Asian (Non-Hispanic)",
      fips: USA_FIPS,
      fips_name: USA_DISPLAY_NAME,
    };
    const WHITE_FINAL_ROW = {
      copd_count: 500,
      copd_no: 500,
      copd_per_100k: per100k(500, 500 + 500),
      diabetes_count: 600,
      diabetes_no: 400,
      diabetes_per_100k: per100k(600, 600 + 400),
      race_and_ethnicity: "White (Non-Hispanic)",
      fips: USA_FIPS,
      fips_name: USA_DISPLAY_NAME,
    };
    const TOTAL_FINAL_ROW = {
      copd_count: 700,
      copd_no: 2300,
      copd_per_100k: per100k(700, 700 + 2300),
      diabetes_count: 1200,
      diabetes_no: 1800,
      diabetes_per_100k: per100k(1200, 1200 + 1800),
      race_and_ethnicity: "Total",
      fips: USA_FIPS,
      fips_name: USA_DISPLAY_NAME,
    };

    dataFetcher.setFakeDatasetLoaded("brfss", [
      NC_ASIAN_ROW,
      NC_WHITE_ROW,
      AL_ASIAN_ROW,
    ]);

    // Evaluate the response without requesting total field
    const responseWithoutTotal = await brfssProvider.getData(
      new MetricQuery("diabetes_count", Breakdowns.national().andRace())
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse([ASIAN_FINAL_ROW, WHITE_FINAL_ROW], ["brfss"])
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = await brfssProvider.getData(
      new MetricQuery(
        "diabetes_count",
        Breakdowns.national().andRace(/*includeTotal=*/ true)
      )
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [ASIAN_FINAL_ROW, WHITE_FINAL_ROW, TOTAL_FINAL_ROW],
        ["brfss"]
      )
    );
  });
});
