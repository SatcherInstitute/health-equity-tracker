import BrfssProvider from "./BrfssProvider";
import { Breakdowns } from "../Breakdowns";
import { MetricQueryResponse } from "../MetricQuery";
import { Dataset } from "../DatasetTypes";
import { Fips, USA_FIPS, USA_DISPLAY_NAME } from "../../utils/madlib/Fips";
import FakeMetadataMap from "../FakeMetadataMap";
import { per100k } from "../datasetutils";

function fakeDataServerResponse(rows: any[]) {
  return {
    brfss: new Dataset(rows, FakeMetadataMap["brfss"]),
  };
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

    const dataServerResponse = fakeDataServerResponse([
      AL_ASIAN_ROW,
      NC_ASIAN_ROW,
      NC_WHITE_ROW,
    ]);

    // Evaluate the response without requesting total field
    const responseWithoutTotal = brfssProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips("37")).andRace()
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(
        [NC_ASIAN_FINAL_ROW, NC_WHITE_FINAL_ROW],
        ["brfss"]
      )
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = brfssProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips("37")).andRace(/*includeTotal=*/ true)
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
      state_fips: USA_FIPS,
      state_name: USA_DISPLAY_NAME,
    };
    const WHITE_FINAL_ROW = {
      copd_count: 500,
      copd_no: 500,
      copd_per_100k: per100k(500, 500 + 500),
      diabetes_count: 600,
      diabetes_no: 400,
      diabetes_per_100k: per100k(600, 600 + 400),
      race_and_ethnicity: "White (Non-Hispanic)",
      state_fips: USA_FIPS,
      state_name: USA_DISPLAY_NAME,
    };
    const TOTAL_FINAL_ROW = {
      copd_count: 700,
      copd_no: 2300,
      copd_per_100k: per100k(700, 700 + 2300),
      diabetes_count: 1200,
      diabetes_no: 1800,
      diabetes_per_100k: per100k(1200, 1200 + 1800),
      race_and_ethnicity: "Total",
      state_fips: USA_FIPS,
      state_name: USA_DISPLAY_NAME,
    };

    const dataServerResponse = fakeDataServerResponse([
      NC_ASIAN_ROW,
      NC_WHITE_ROW,
      AL_ASIAN_ROW,
    ]);

    // Evaluate the response without requesting total field
    const responseWithoutTotal = brfssProvider.getData(
      dataServerResponse,
      Breakdowns.national().andRace()
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse([ASIAN_FINAL_ROW, WHITE_FINAL_ROW], ["brfss"])
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = brfssProvider.getData(
      dataServerResponse,
      Breakdowns.national().andRace(/*includeTotal=*/ true)
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [ASIAN_FINAL_ROW, WHITE_FINAL_ROW, TOTAL_FINAL_ROW],
        ["brfss"]
      )
    );
  });
});
