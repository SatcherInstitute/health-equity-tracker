import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns } from "../Breakdowns";
import { MetricQueryResponse, createMissingDataResponse } from "../MetricQuery";
import { Dataset, DatasetMetadata, Row } from "../DatasetTypes";
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

class TestRow {
  row: any;

  constructor(row: Row) {
    this.row = row;
  }

  add(key: string, value: string) {
    this.row[key] = value;
    return this.row;
  }
}

function row(
  fips: string,
  state_name: string,
  breakdownK: string,
  breakdownV: string,
  population: string
) {
  return {
    state_fips: fips,
    state_name: state_name,
    [breakdownK]: breakdownV,
    population: population,
  };
}

function row2(
  fips: string,
  state_name: string,
  breakdownK: string,
  breakdownV: string,
  population: string,
  field: string,
  value: number
) {
  return {
    state_fips: fips,
    state_name: state_name,
    [breakdownK]: breakdownV,
    population: population,
    [field]: value,
  };
}

describe("AcsPopulationProvider", () => {
  test("Invalid Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const expectedMetricQueryResponse = createMissingDataResponse(
      'Breakdowns not supported for provider acs_pop_provider: {"geography":"national"}'
    );

    expect(acsProvider.getData({}, Breakdowns.national())).toEqual(
      expectedMetricQueryResponse
    );
  });

  test("State and Race Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const rows = [
      row("01", "AL", "race_and_ethnicity", "Total", "2"),
      row("01", "AL", "race_and_ethnicity", "Asian (Non-Hispanic)", "2"),
      row("37", "NC", "race_and_ethnicity", "Total", "20"),
      row("37", "NC", "race_and_ethnicity", "Asian (Non-Hispanic)", "5"),
      row("37", "NC", "race_and_ethnicity", "White (Non-Hispanic)", "15"),
    ];

    const expectedRows = [
      row2(
        "37",
        "NC",
        "race_and_ethnicity",
        "Total",
        "20",
        "population_pct",
        100
      ),
      row2(
        "37",
        "NC",
        "race_and_ethnicity",
        "Asian (Non-Hispanic)",
        "5",
        "population_pct",
        25
      ),
      row2(
        "37",
        "NC",
        "race_and_ethnicity",
        "White (Non-Hispanic)",
        "15",
        "population_pct",
        75
      ),
    ];

    const dataset = new Dataset(rows, DATASET_METADATA);
    const DATASET_MAP = {
      "acs_population-by_race_state_std": dataset,
      "acs_population-by_age_state": new Dataset([], DATASET_METADATA),
    };
    const breakdown = Breakdowns.forFips(new Fips("37")).andRace();
    const actual = acsProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(new MetricQueryResponse(expectedRows));
  });

  test("State and Age Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const rows = [
      row("01", "AL", "age", "10-19", "2"),
      row("37", "NC", "age", "0-9", 15),
      row("37", "NC", "age", "10-19", 10),
    ];

    const expectedRows = [
      row2("37", "NC", "age", "0-9", 15, "population_pct", 60),
      row2("37", "NC", "age", "10-19", 10, "population_pct", 40),
    ];

    const dataset = new Dataset(rows, DATASET_METADATA);
    const breakdown = Breakdowns.forFips(new Fips("37")).andAge();
    const DATASET_MAP = {
      "acs_population-by_race_state_std": new Dataset([], DATASET_METADATA),
      "acs_population-by_age_state": dataset,
    };

    const actual = acsProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(new MetricQueryResponse(expectedRows));
  });
});
