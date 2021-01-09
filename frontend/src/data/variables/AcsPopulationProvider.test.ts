import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns } from "../Breakdowns";
import { MetricQueryResponse, createMissingDataResponse } from "../MetricQuery";
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
      {
        state_fips: "01",
        state_name: "Alabama",
        race_and_ethnicity: "Total",
        population: 2,
      },
      {
        state_fips: "01",
        state_name: "Alabama",
        race_and_ethnicity: "Asian (Non-Hispanic)",
        population: 2,
      },
      {
        state_fips: "37",
        state_name: "North Carolina",
        race_and_ethnicity: "Total",
        population: 17,
      },
      {
        state_fips: "37",
        state_name: "North Carolina",
        race_and_ethnicity: "Asian (Non-Hispanic)",
        population: 7,
      },
      {
        state_fips: "37",
        state_name: "North Carolina",
        race_and_ethnicity: "White (Non-Hispanic)",
        population: 10,
      },
    ];

    const expectedRows = [
      {
        population: 17,
        population_pct: 100,
        race_and_ethnicity: "Total",
        state_fips: "37",
        state_name: "North Carolina",
      },
      {
        population: 7,
        population_pct: 41.2,
        race_and_ethnicity: "Asian (Non-Hispanic)",
        state_fips: "37",
        state_name: "North Carolina",
      },
      {
        population: 10,
        population_pct: 58.8,
        race_and_ethnicity: "White (Non-Hispanic)",
        state_fips: "37",
        state_name: "North Carolina",
      },
    ];

    const dataset = new Dataset(rows, DATASET_METADATA);
    const breakdown = Breakdowns.forFips(new Fips("37")).andRace();
    const actual = acsProvider.getData(
      { "acs_population-by_race_state_std": dataset },
      breakdown
    );
    expect(actual).toEqual(new MetricQueryResponse(expectedRows));
  });
});
