import BrfssProvider from "./BrfssProvider";
import { Breakdowns } from "../Breakdowns";
import { MetricQueryResponse } from "../MetricQuery";
import { Dataset, DatasetMetadata } from "../DatasetTypes";
import { Fips } from "../../utils/madlib/Fips";

const DATASET_METADATA: DatasetMetadata = {
  id: "id",
  name: "name",
  description: "description",
  fields: [],
  data_source_name: "data_source_name",
  data_source_link: "data_source_link",
  geographic_level: "geographic_level",
  demographic_granularity: "demographic_granularity",
  update_frequency: "update_frequency",
  update_time: "update_time",
};

function row(
  fips: string,
  state_name: string,
  copd_count: number,
  copd_no: number,
  diabetes_count: number,
  diabetes_no: number,
  breakdownName: string,
  breakdownValue: string,
  population: number
) {
  return {
    state_fips: fips,
    state_name: state_name,
    copd_count: copd_count,
    diabetes_count: diabetes_count,
    diabetes_no: diabetes_no,
    copd_no: copd_no,
    [breakdownName]: breakdownValue,
    population: population,
  };
}

describe("BrfssProvider", () => {
  test("State and Race Breakdown", async () => {
    const brfssProvider = new BrfssProvider();

    const NC_ASIAN_ROW = row(
      "37",
      "NC",
      100,
      900,
      30,
      270,
      "race_and_ethnicity",
      "Asian (Non-Hispanic)"
    );
    const NC_WHITE_ROW = row(
      "37",
      "NC",
      200,
      200,
      1,
      99999,
      "race_and_ethnicity",
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

    const dataset = new Dataset(rows, DATASET_METADATA);
    const DATASET_MAP = {
      brfss: dataset,
    };
    const breakdown = Breakdowns.forFips(new Fips("37")).andRace();
    const actual = brfssProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(new MetricQueryResponse(expectedRows));
  });
});
