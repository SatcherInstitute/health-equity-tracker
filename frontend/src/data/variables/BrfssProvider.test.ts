import BrfssProvider from "./BrfssProvider";
import { Breakdowns } from "../Breakdowns";
import { MetricQueryResponse } from "../MetricQuery";
import { Dataset, DatasetMetadata } from "../DatasetTypes";
import { Fips } from "../../utils/madlib/Fips";
import FakeMetadataMap from "../FakeMetadataMap";

function rowNC(
  copd_count: number,
  copd_no: number,
  diabetes_count: number,
  diabetes_no: number,
  race: string
) {
  return {
    state_fips: "37",
    state_name: "North Carolina",
    copd_count: copd_count,
    diabetes_count: diabetes_count,
    diabetes_no: diabetes_no,
    copd_no: copd_no,
    race_and_ethnicity: race,
  };
}

describe("BrfssProvider", () => {
  test("State and Race Breakdown", async () => {
    const brfssProvider = new BrfssProvider();

    const NC_ASIAN_ROW = rowNC(
      /*copd_count=*/ 100,
      /*copd_no=*/ 900,
      /*diabetes_count=*/ 30,
      /*diabetes_no=*/ 270,
      "Asian (Non-Hispanic)"
    );
    const NC_WHITE_ROW = rowNC(
      /*copd_count=*/ 200,
      /*copd_no=*/ 200,
      /*diabetes_count=*/ 1,
      /*diabetes_no=*/ 99999,
      "White (Non-Hispanic)"
    );
    const rows = [NC_ASIAN_ROW, NC_WHITE_ROW];

    const NC_ASIAN_FINAL_ROW = Object.assign(NC_ASIAN_ROW, {
      copd_per_100k: 10000,
      diabetes_per_100k: 10000,
    });
    const NC_WHITE_FINAL_ROW = Object.assign(NC_WHITE_ROW, {
      copd_per_100k: 50000,
      diabetes_per_100k: 1,
    });
    const expectedRows = [NC_ASIAN_FINAL_ROW, NC_WHITE_FINAL_ROW];

    const dataset = new Dataset(rows, FakeMetadataMap["brfss"]);
    const DATASET_MAP = {
      brfss: dataset,
    };
    const breakdown = Breakdowns.forFips(new Fips(/*NC Fips=*/ "37")).andRace();
    const actual = brfssProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(new MetricQueryResponse(expectedRows));
  });
});
