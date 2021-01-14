import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns } from "../Breakdowns";
import { MetricQueryResponse, createMissingDataResponse } from "../MetricQuery";
import { Dataset } from "../DatasetTypes";
import { Fips } from "../../utils/madlib/Fips";
import FakeMetadataMap from "../FakeMetadataMap";

function row(
  fips: string,
  state_name: string,
  breakdownName: string,
  breakdownValue: string,
  population: number
) {
  return {
    state_fips: fips,
    state_name: state_name,
    [breakdownName]: breakdownValue,
    population: population,
  };
}

describe("AcsPopulationProvider", () => {
  test("Invalid Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    expect(acsProvider.getData({}, Breakdowns.national())).toEqual(
      createMissingDataResponse(
        'Breakdowns not supported for provider acs_pop_provider: {"geography":"national"}'
      )
    );
  });

  test("State and Race Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const NC_ASIAN_ROW = row(
      "37",
      "NC",
      "race_and_ethnicity",
      "Asian (Non-Hispanic)",
      5
    );
    const NC_WHITE_ROW = row(
      "37",
      "NC",
      "race_and_ethnicity",
      "White (Non-Hispanic)",
      15
    );
    const NC_TOTAL_ROW = row("37", "NC", "race_and_ethnicity", "Total", 20);

    const rows = [
      row("01", "AL", "race_and_ethnicity", "Total", 2),
      row("01", "AL", "race_and_ethnicity", "Asian (Non-Hispanic)", 2),
      NC_ASIAN_ROW,
      NC_WHITE_ROW,
      NC_TOTAL_ROW,
    ];

    const NC_ASIAN_FINAL_ROW = Object.assign(NC_ASIAN_ROW, {
      population_pct: 25,
    });
    const NC_WHITE_FINAL_ROW = Object.assign(NC_WHITE_ROW, {
      population_pct: 75,
    });
    const NC_TOTAL_FINAL_ROW = Object.assign(NC_TOTAL_ROW, {
      population_pct: 100,
    });
    const expectedRows = [
      NC_ASIAN_FINAL_ROW,
      NC_WHITE_FINAL_ROW,
      NC_TOTAL_FINAL_ROW,
    ];

    const DATASET_MAP = {
      "acs_population-by_race_state_std": new Dataset(
        rows,
        FakeMetadataMap["acs_population-by_race_state_std"]
      ),
      "acs_population-by_age_state": new Dataset(
        [],
        FakeMetadataMap["acs_population-by_age_state"]
      ),
    };
    const breakdown = Breakdowns.forFips(new Fips("37")).andRace();
    const actual = acsProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(new MetricQueryResponse(expectedRows));
  });

  test("State and Age Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const NC_AGE_0_9 = row("37", "NC", "age", "0-9", 15);
    const NC_AGE_10_19 = row("37", "NC", "age", "10-19", 10);
    const rows = [row("01", "AL", "age", "10-19", 2), NC_AGE_0_9, NC_AGE_10_19];

    const NC_AGE_0_9_FINAL = Object.assign(NC_AGE_0_9, { population_pct: 60 });
    const NC_AGE_10_19_FINAL = Object.assign(NC_AGE_10_19, {
      population_pct: 40,
    });

    const expectedRows = [NC_AGE_0_9_FINAL, NC_AGE_10_19_FINAL];

    const DATASET_MAP = {
      "acs_population-by_race_state_std": new Dataset(
        [],
        FakeMetadataMap["acs_population-by_race_state_std"]
      ),
      "acs_population-by_age_state": new Dataset(
        rows,
        FakeMetadataMap["acs_population-by_age_state"]
      ),
    };
    const breakdown = Breakdowns.forFips(new Fips("37")).andAge();
    const actual = acsProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(new MetricQueryResponse(expectedRows));
  });

  test("State and Gender Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const breakdown = Breakdowns.forFips(new Fips("37")).andGender();

    const DATASET_MAP = {
      "acs_population-by_race_state_std": new Dataset(
        [],
        FakeMetadataMap["acs_population-by_race_state_std"]
      ),
      "acs_population-by_age_state": new Dataset(
        [],
        FakeMetadataMap["acs_population-by_age_state"]
      ),
    };

    const actual = acsProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(
      createMissingDataResponse(
        'Breakdowns not supported for provider acs_pop_provider: {"geography":"state","demographic":"sex","filterFips":"37"}'
      )
    );
  });
});
