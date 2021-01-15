import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns } from "../Breakdowns";
import { MetricQueryResponse, createMissingDataResponse } from "../MetricQuery";
import { Dataset } from "../DatasetTypes";
import { Fips, USA_FIPS, USA_DISPLAY_NAME } from "../../utils/madlib/Fips";
import FakeMetadataMap from "../FakeMetadataMap";

const WHITE = "White (Non-Hispanic)";
const ASIAN = "Asian (Non-Hispanic)";
const TOTAL = "Total";

function fakeDataServerResponse(acsRaceRows: any[], acsAgeRows: any[]) {
  return {
    "acs_population-by_race_state_std": new Dataset(
      acsRaceRows,
      FakeMetadataMap["acs_population-by_race_state_std"]
    ),
    "acs_population-by_age_state": new Dataset(
      acsAgeRows,
      FakeMetadataMap["acs_population-by_age_state"]
    ),
  };
}

function rawPopulationRow(
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

function addPopulationPctToRow(row: {}, pct: number) {
  return Object.assign(row, {
    population_pct: pct,
  });
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

    const NC_TOTAL_ROW = rawPopulationRow(
      "37",
      "NC",
      "race_and_ethnicity",
      TOTAL,
      20
    );
    const NC_ASIAN_ROW = rawPopulationRow(
      "37",
      "NC",
      "race_and_ethnicity",
      ASIAN,
      5
    );
    const NC_WHITE_ROW = rawPopulationRow(
      "37",
      "NC",
      "race_and_ethnicity",
      WHITE,
      15
    );

    const NC_TOTAL_FINAL_ROW = addPopulationPctToRow(NC_TOTAL_ROW, 100);
    const NC_ASIAN_FINAL_ROW = addPopulationPctToRow(NC_ASIAN_ROW, 25);
    const NC_WHITE_FINAL_ROW = addPopulationPctToRow(NC_WHITE_ROW, 75);

    const acsRaceRows = [
      rawPopulationRow("01", "AL", "race_and_ethnicity", TOTAL, 2),
      rawPopulationRow("01", "AL", "race_and_ethnicity", ASIAN, 2),
      NC_ASIAN_ROW,
      NC_WHITE_ROW,
      NC_TOTAL_ROW,
    ];

    const dataServerResponse = fakeDataServerResponse(
      acsRaceRows,
      /*acsAgeRows=*/ []
    );
    const breakdown = Breakdowns.forFips(new Fips("37")).andRace();
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      breakdown
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse([NC_ASIAN_FINAL_ROW, NC_WHITE_FINAL_ROW])
    );
    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      breakdown.andIncludeTotal()
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse([
        NC_ASIAN_FINAL_ROW,
        NC_WHITE_FINAL_ROW,
        NC_TOTAL_FINAL_ROW,
      ])
    );
  });

  test("National and Race Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const NC_ASIAN_ROW = rawPopulationRow(
      "37",
      "NC",
      "race_and_ethnicity",
      ASIAN,
      5
    );
    const NC_WHITE_ROW = rawPopulationRow(
      "37",
      "NC",
      "race_and_ethnicity",
      WHITE,
      15
    );
    const NC_TOTAL_ROW = rawPopulationRow(
      "37",
      "NC",
      "race_and_ethnicity",
      TOTAL,
      20
    );

    const AL_ASIAN_ROW = rawPopulationRow(
      "01",
      "AL",
      "race_and_ethnicity",
      ASIAN,
      5
    );
    const AL_TOTAL_ROW = rawPopulationRow(
      "01",
      "AL",
      "race_and_ethnicity",
      TOTAL,
      5
    );

    const acsRaceRows = [
      AL_TOTAL_ROW,
      AL_ASIAN_ROW,
      NC_ASIAN_ROW,
      NC_WHITE_ROW,
      NC_TOTAL_ROW,
    ];

    function finalNationalRow(
      race: string,
      population: number,
      population_pct: number
    ) {
      return {
        state_fips: USA_FIPS,
        state_name: USA_DISPLAY_NAME,
        race_and_ethnicity: race,
        population: population,
        population_pct: population_pct,
      };
    }

    const NATIONAL_ASIAN_FINAL_ROW = finalNationalRow(
      ASIAN,
      /*population=*/ 10,
      /*population_pct=*/ 40
    );
    const NATIONAL_WHITE_FINAL_ROW = finalNationalRow(
      WHITE,
      /*population=*/ 15,
      /*population_pct=*/ 60
    );
    const NATIONAL_TOTAL_FINAL_ROW = finalNationalRow(
      TOTAL,
      /*population=*/ 25,
      /*population_pct=*/ 100
    );

    const dataServerResponse = fakeDataServerResponse(
      acsRaceRows,
      /*acsAgeRows=*/ []
    );
    const breakdown = Breakdowns.national().andRace();
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      breakdown
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse([
        NATIONAL_ASIAN_FINAL_ROW,
        NATIONAL_WHITE_FINAL_ROW,
      ])
    );

    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      breakdown.andIncludeTotal()
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse([
        NATIONAL_ASIAN_FINAL_ROW,
        NATIONAL_TOTAL_FINAL_ROW,
        NATIONAL_WHITE_FINAL_ROW,
      ])
    );
  });

  test("National and Race Breakdown - include total", async () => {
    const acsProvider = new AcsPopulationProvider();

    const NC_ASIAN_ROW = rawPopulationRow(
      "37",
      "NC",
      "race_and_ethnicity",
      ASIAN,
      5
    );
    const NC_WHITE_ROW = rawPopulationRow(
      "37",
      "NC",
      "race_and_ethnicity",
      WHITE,
      15
    );
    const NC_TOTAL_ROW = rawPopulationRow(
      "37",
      "NC",
      "race_and_ethnicity",
      TOTAL,
      20
    );

    const AL_ASIAN_ROW = rawPopulationRow(
      "01",
      "AL",
      "race_and_ethnicity",
      ASIAN,
      5
    );
    const AL_TOTAL_ROW = rawPopulationRow(
      "01",
      "AL",
      "race_and_ethnicity",
      TOTAL,
      5
    );

    const datasetRows = [
      AL_TOTAL_ROW,
      AL_ASIAN_ROW,
      NC_ASIAN_ROW,
      NC_WHITE_ROW,
      NC_TOTAL_ROW,
    ];

    function finalNationalRow(
      race: string,
      population: number,
      population_pct: number
    ) {
      return {
        state_fips: USA_FIPS,
        state_name: USA_DISPLAY_NAME,
        race_and_ethnicity: race,
        population: population,
        population_pct: population_pct,
      };
    }
    const expectedRows = [
      finalNationalRow(ASIAN, /*population=*/ 10, /*population_pct=*/ 40),
      finalNationalRow(WHITE, /*population=*/ 15, /*population_pct=*/ 60),
    ];

    const DATASET_MAP = {
      "acs_population-by_race_state_std": new Dataset(
        datasetRows,
        FakeMetadataMap["acs_population-by_race_state_std"]
      ),
      "acs_population-by_age_state": new Dataset(
        [],
        FakeMetadataMap["acs_population-by_age_state"]
      ),
    };
    const breakdown = Breakdowns.national().andRace();
    const actual = acsProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(new MetricQueryResponse(expectedRows));
  });

  test("State and Age Breakdown - don't include total", async () => {
    const acsProvider = new AcsPopulationProvider();

    const NC_AGE_0_9 = rawPopulationRow("37", "NC", "age", "0-9", 15);
    const NC_AGE_10_19 = rawPopulationRow("37", "NC", "age", "10-19", 10);
    const datasetRows = [
      rawPopulationRow("01", "AL", "age", "10-19", 2),
      NC_AGE_0_9,
      NC_AGE_10_19,
    ];

    const NC_AGE_0_9_FINAL = addPopulationPctToRow(NC_AGE_0_9, 60);
    const NC_AGE_10_19_FINAL = addPopulationPctToRow(NC_AGE_10_19, 40);

    const expectedRows = [NC_AGE_0_9_FINAL, NC_AGE_10_19_FINAL];

    const DATASET_MAP = {
      "acs_population-by_race_state_std": new Dataset(
        [],
        FakeMetadataMap["acs_population-by_race_state_std"]
      ),
      "acs_population-by_age_state": new Dataset(
        datasetRows,
        FakeMetadataMap["acs_population-by_age_state"]
      ),
    };
    const breakdown = Breakdowns.forFips(new Fips("37")).andAge();
    const actual = acsProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(new MetricQueryResponse(expectedRows));
  });

  test("State and Age Breakdown - include total", async () => {
    const acsProvider = new AcsPopulationProvider();

    const NC_AGE_0_9 = rawPopulationRow("37", "NC", "age", "0-9", 15);
    const NC_AGE_10_19 = rawPopulationRow("37", "NC", "age", "10-19", 10);
    const datasetRows = [
      rawPopulationRow("01", "AL", "age", "10-19", 2),
      NC_AGE_0_9,
      NC_AGE_10_19,
    ];

    const NC_AGE_0_9_FINAL = addPopulationPctToRow(NC_AGE_0_9, 60);
    const NC_AGE_10_19_FINAL = addPopulationPctToRow(NC_AGE_10_19, 40);
    const NC_TOTAL_FINAL = addPopulationPctToRow(
      rawPopulationRow("37", "NC", "age", "Total", 25),
      100
    );

    const expectedRows = [NC_AGE_0_9_FINAL, NC_AGE_10_19_FINAL, NC_TOTAL_FINAL];

    const DATASET_MAP = {
      "acs_population-by_race_state_std": new Dataset(
        [],
        FakeMetadataMap["acs_population-by_race_state_std"]
      ),
      "acs_population-by_age_state": new Dataset(
        datasetRows,
        FakeMetadataMap["acs_population-by_age_state"]
      ),
    };
    const breakdown = Breakdowns.forFips(new Fips("37"))
      .andAge()
      .andIncludeTotal();
    const actual = acsProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(new MetricQueryResponse(expectedRows));
  });

  test("National and Age Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const AL_AGE_0_9 = rawPopulationRow("01", "AL", "age", "0-9", 15);
    const NC_AGE_0_9 = rawPopulationRow("37", "NC", "age", "0-9", 15);
    const NC_AGE_10_19 = rawPopulationRow("37", "NC", "age", "10-19", 10);
    const datasetRows = [AL_AGE_0_9, NC_AGE_0_9, NC_AGE_10_19];

    const AGE_0_9_FINAL = addPopulationPctToRow(
      rawPopulationRow(USA_FIPS, USA_DISPLAY_NAME, "age", "0-9", 30),
      75
    );
    const AGE_10_19_FINAL = addPopulationPctToRow(
      rawPopulationRow(USA_FIPS, USA_DISPLAY_NAME, "age", "10-19", 10),
      25
    );

    const DATASET_MAP = {
      "acs_population-by_race_state_std": new Dataset(
        [],
        FakeMetadataMap["acs_population-by_race_state_std"]
      ),
      "acs_population-by_age_state": new Dataset(
        datasetRows,
        FakeMetadataMap["acs_population-by_age_state"]
      ),
    };
    const breakdown = Breakdowns.national().andAge();
    const actual = acsProvider.getData(DATASET_MAP, breakdown);
    expect(actual).toEqual(
      new MetricQueryResponse([AGE_0_9_FINAL, AGE_10_19_FINAL])
    );
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

  test("National and Gender Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const breakdown = Breakdowns.national().andGender();

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
        'Breakdowns not supported for provider acs_pop_provider: {"geography":"national","demographic":"sex"}'
      )
    );
  });
});
