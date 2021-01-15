import BrfssProvider from "./BrfssProvider";
import { Breakdowns } from "../Breakdowns";
import { MetricQueryResponse } from "../MetricQuery";
import { Dataset } from "../DatasetTypes";
import { Fips, USA_FIPS, USA_DISPLAY_NAME } from "../../utils/madlib/Fips";
import FakeMetadataMap from "../FakeMetadataMap";
import { per100k } from "../datasetutils";

function sumField(rows: any, fieldName: string) {
  return rows
    .map((row: any) => row[fieldName])
    .reduce((a: number, b: number) => a + b);
}

function addCopdAndDiabetesPer100k(
  row: {},
  copd_per_100k: number,
  diabetes_per_100k: number
) {
  return Object.assign(row, {
    copd_per_100k: copd_per_100k,
    diabetes_per_100k: diabetes_per_100k,
  });
}

describe("BrfssProvider", () => {
  test("State and Race Breakdown - don't include total", async () => {
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

    const NC_ASIAN_FINAL_ROW = addCopdAndDiabetesPer100k(
      NC_ASIAN_ROW,
      10000,
      10000
    );
    const NC_WHITE_FINAL_ROW = addCopdAndDiabetesPer100k(
      NC_WHITE_ROW,
      50000,
      1
    );

    const dataset = new Dataset(datasetRows, FakeMetadataMap["brfss"]);
    const DATASET_MAP = {
      brfss: dataset,
    };
    const breakdown = Breakdowns.forFips(new Fips("37")).andRace();
    const actual = brfssProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(
      new MetricQueryResponse([NC_ASIAN_FINAL_ROW, NC_WHITE_FINAL_ROW])
    );
  });

  test("State and Race Breakdown - include total", async () => {
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
    const NC_ASIAN_FINAL_ROW = addCopdAndDiabetesPer100k(
      NC_ASIAN_ROW,
      10000,
      40000
    );
    const NC_WHITE_ROW = {
      race_and_ethnicity: "White (Non-Hispanic)",
      state_fips: "37",
      state_name: "NC",
      copd_count: 500,
      copd_no: 500,
      diabetes_count: 600,
      diabetes_no: 400,
    };
    const NC_WHITE_FINAL_ROW = addCopdAndDiabetesPer100k(
      NC_WHITE_ROW,
      50000,
      60000
    );

    const NC_TOTAL_FINAL_ROW = {
      race_and_ethnicity: "Total",
      state_fips: "37",
      state_name: "NC",
      copd_count: 600,
      copd_no: 1400,
      copd_per_100k: 30000,
      diabetes_count: 1000,
      diabetes_no: 1000,
      diabetes_per_100k: 50000,
    };

    const dataset = new Dataset(
      [AL_ASIAN_ROW, NC_ASIAN_ROW, NC_WHITE_ROW],
      FakeMetadataMap["brfss"]
    );
    const DATASET_MAP = {
      brfss: dataset,
    };
    const breakdown = Breakdowns.forFips(new Fips("37"))
      .andRace()
      .andIncludeTotal();
    const actual = brfssProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(
      new MetricQueryResponse([
        NC_ASIAN_FINAL_ROW,
        NC_WHITE_FINAL_ROW,
        NC_TOTAL_FINAL_ROW,
      ])
    );
  });

  test("National and Race Breakdown - don't include total", async () => {
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

    const datasetRows = [NC_ASIAN_ROW, NC_WHITE_ROW, AL_ASIAN_ROW];

    const ASIAN_FINAL_ROW = {
      copd_count: 200,
      copd_no: 1800,
      copd_per_100k: 10000,
      diabetes_count: 600,
      diabetes_no: 1400,
      diabetes_per_100k: 30000,
      race_and_ethnicity: "Asian (Non-Hispanic)",
      state_fips: "00",
      state_name: "the United States",
    };
    const WHITE_FINAL_ROW = {
      copd_count: 500,
      copd_no: 500,
      copd_per_100k: 50000,
      diabetes_count: 600,
      diabetes_no: 400,
      diabetes_per_100k: 60000,
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

  test("National and Race Breakdown - include total", async () => {
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
      state_fips: "00",
      state_name: "the United States",
    };
    const WHITE_FINAL_ROW = {
      copd_count: 500,
      copd_no: 500,
      copd_per_100k: per100k(500, 500 + 500),
      diabetes_count: 600,
      diabetes_no: 400,
      diabetes_per_100k: per100k(600, 600 + 400),
      race_and_ethnicity: "White (Non-Hispanic)",
      state_fips: "00",
      state_name: "the United States",
    };
    const TOTAL_FINAL_ROW = {
      copd_count: 700,
      copd_no: 2300,
      copd_per_100k: per100k(700, 700 + 2300),
      diabetes_count: 1200,
      diabetes_no: 1800,
      diabetes_per_100k: per100k(1200, 1200 + 1800),
      race_and_ethnicity: "Total",
      state_fips: "00",
      state_name: "the United States",
    };

    const dataset = new Dataset(
      [NC_ASIAN_ROW, NC_WHITE_ROW, AL_ASIAN_ROW],
      FakeMetadataMap["brfss"]
    );
    const DATASET_MAP = {
      brfss: dataset,
    };
    const breakdown = Breakdowns.national().andRace().andIncludeTotal();
    const actual = brfssProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(
      new MetricQueryResponse([
        ASIAN_FINAL_ROW,
        WHITE_FINAL_ROW,
        TOTAL_FINAL_ROW,
      ])
    );
  });
});
