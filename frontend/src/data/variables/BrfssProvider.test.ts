import BrfssProvider from "./BrfssProvider";
import { Breakdowns } from "../Breakdowns";
import { MetricQueryResponse } from "../MetricQuery";
import { Dataset } from "../DatasetTypes";
import { Fips } from "../../utils/madlib/Fips";
import FakeMetadataMap from "../FakeMetadataMap";

describe("BrfssProvider", () => {
  test("State and Race Breakdown", async () => {
    const brfssProvider = new BrfssProvider();

    const AL_ASIAN_ROW = {
      race_and_ethnicity: "Asian (Non-Hispanic)",
      state_fips: "01",
      state_name: "AL",
      copd_count: 100,
      copd_no: 900,
      diabetes_count: 30,
      diabetes_no: 270,
    };
    const NC_ASIAN_ROW = {
      race_and_ethnicity: "Asian (Non-Hispanic)",
      state_fips: "37",
      state_name: "NC",
      copd_count: 100,
      copd_no: 900,
      diabetes_count: 30,
      diabetes_no: 270,
    };
    const NC_WHITE_ROW = {
      race_and_ethnicity: "White (Non-Hispanic)",
      state_fips: "37",
      state_name: "NC",
      copd_count: 200,
      copd_no: 200,
      diabetes_count: 1,
      diabetes_no: 99999,
    };
    const datasetRows = [AL_ASIAN_ROW, NC_ASIAN_ROW, NC_WHITE_ROW];

    const NC_ASIAN_FINAL_ROW = Object.assign(NC_ASIAN_ROW, {
      copd_per_100k: 10000,
      diabetes_per_100k: 10000,
    });
    const NC_WHITE_FINAL_ROW = Object.assign(NC_WHITE_ROW, {
      copd_per_100k: 50000,
      diabetes_per_100k: 1,
    });
    const expectedRows = [NC_ASIAN_FINAL_ROW, NC_WHITE_FINAL_ROW];

    const dataset = new Dataset(datasetRows, FakeMetadataMap["brfss"]);
    const DATASET_MAP = {
      brfss: dataset,
    };
    const breakdown = Breakdowns.forFips(new Fips("37")).andRace();
    const actual = brfssProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(new MetricQueryResponse(expectedRows));
  });

  test("National and Race Breakdown", async () => {
    const brfssProvider = new BrfssProvider();

    const NC_ASIAN_ROW = {
      race_and_ethnicity: "Asian (Non-Hispanic)",
      state_fips: "37",
      state_name: "NC",
      copd_count: 100,
      copd_no: 900,
      diabetes_count: 30,
      diabetes_no: 270,
    };
    const NC_WHITE_ROW = {
      race_and_ethnicity: "White (Non-Hispanic)",
      state_fips: "37",
      state_name: "NC",
      copd_count: 200,
      copd_no: 200,
      diabetes_count: 1,
      diabetes_no: 99999,
    };
    const AL_WHITE_ROW = {
      race_and_ethnicity: "Asian (Non-Hispanic)",
      state_fips: "37",
      state_name: "NC",
      copd_count: 200,
      copd_no: 200,
      diabetes_count: 30,
      diabetes_no: 270,
    };

    const datasetRows = [NC_ASIAN_ROW, NC_WHITE_ROW, AL_WHITE_ROW];

    const ASIAN_FINAL_ROW = {
      copd_count: 300,
      copd_no: 1100,
      copd_per_100k: 21429,
      diabetes_count: 60,
      diabetes_no: 540,
      diabetes_per_100k: 10000,
      race_and_ethnicity: "Asian (Non-Hispanic)",
      state_fips: "00",
      state_name: "the United States",
    };
    const WHITE_FINAL_ROW = {
      copd_count: 200,
      copd_no: 200,
      copd_per_100k: 50000,
      diabetes_count: 1,
      diabetes_no: 99999,
      diabetes_per_100k: 1,
      race_and_ethnicity: "White (Non-Hispanic)",
      state_fips: "00",
      state_name: "the United States",
    };
    const expectedRows = [ASIAN_FINAL_ROW, WHITE_FINAL_ROW];

    const dataset = new Dataset(datasetRows, FakeMetadataMap["brfss"]);
    const DATASET_MAP = {
      brfss: dataset,
    };
    const breakdown = Breakdowns.national().andRace();
    const actual = brfssProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(new MetricQueryResponse(expectedRows));
  });
});
