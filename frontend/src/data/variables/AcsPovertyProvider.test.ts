import { Breakdowns } from "../query/Breakdowns";
import { Fips } from "../utils/Fips";
import { FakeDatasetMetadataMap } from "../config/FakeDatasetMetadata";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import FakeDataFetcher from "../../testing/FakeDataFetcher";
import {
  createWithAndWithoutTotalEvaluator,
  FipsSpec,
  NC,
  AL,
  USA,
  WA,
} from "./TestUtils";
import {
  WHITE_NH,
  ASIAN_NH,
  TOTAL,
  RACE,
  MALE,
  FEMALE,
  SEX,
  AGE,
} from "../utils/Constants";
import AcsPovertyProvider from "./AcsPovertyProvider";
import { count } from "console";

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

export const MARIN: FipsSpec = {
  code: "0641",
  name: "Marin County",
};
export const KING_COUNTY: FipsSpec = {
  code: "53033",
  name: "King County",
};

function finalRow(
  fips: FipsSpec,
  breakdownName: string,
  breakdownValue: string,
  below_poverty_level_count: number,
  below_poverty_level_per_100k: number
) {
  const row = {
    [breakdownName]: breakdownValue,
    fips: fips.code,
    fips_name: fips.name,
    poverty_count: below_poverty_level_count,
    poverty_per_100k: below_poverty_level_per_100k,
  };
  return row;
}

function finalCountyRow(
  countyFips: FipsSpec,
  breakdownName: string,
  breakdownValue: string,
  below_poverty_level: number,
  below_poverty_level_per_100k: number
) {
  const row = {
    [breakdownName]: breakdownValue,
    fips: countyFips.code,
    fips_name: countyFips.name,
    poverty_count: below_poverty_level,
    poverty_per_100k: below_poverty_level_per_100k,
  };
  return row;
}

function stateRow(
  fips: FipsSpec,
  race_value: string,
  age_value: string,
  sex_value: string,
  below_poverty: string,
  above_poverty: string
) {
  return {
    race: race_value,
    age: age_value,
    sex: sex_value,
    state_fips: fips.code,
    state_name: fips.name,
    above_poverty_line: above_poverty,
    below_poverty_line: below_poverty,
  };
}

function countyRow(
  stateFips: FipsSpec,
  countyFips: FipsSpec,
  race_value: string,
  age_value: string,
  sex_value: string,
  below_poverty: string,
  above_poverty: string
) {
  return {
    state_fips: stateFips.code,
    state_name: stateFips.name,
    county_fips: countyFips.code,
    county_name: countyFips.name,
    race: race_value,
    age: age_value,
    sex: sex_value,
    above_poverty_line: above_poverty,
    below_poverty_line: below_poverty,
  };
}

const evaluatePovertyWithTotal = createWithAndWithoutTotalEvaluator(
  /*metricIds=*/ ["poverty_count", "poverty_per_100k"],
  dataFetcher,
  new AcsPovertyProvider()
);

//TODO: Add more tests for breakdown by SEX.
describe("AcsPovertyProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(FakeDatasetMetadataMap);
  });

  test("testing state aggregate by race alone", async () => {
    // Create raw rows with poverty coverage
    const rawData = [
      stateRow(NC, ASIAN_NH, "10-19", MALE, "50", "950"),
      stateRow(NC, ASIAN_NH, "20-29", MALE, "150", "850"),
    ];

    // Create final rows with poverty count
    // and poverty per 100k
    const NC_ASIAN_FINAL = finalRow(NC, RACE, ASIAN_NH, 200, 10000);
    const NC_TOTAL_FINAL = finalRow(NC, RACE, TOTAL, 200, 10000);

    await evaluatePovertyWithTotal(
      "acs_poverty_dataset-poverty_by_race_age_sex_state",
      rawData,
      Breakdowns.forFips(new Fips("37")),
      RACE,
      [NC_ASIAN_FINAL],
      [NC_ASIAN_FINAL, NC_TOTAL_FINAL]
    );
  });

  test("testing state aggregate by race multiple", async () => {
    // Create raw rows with poverty coverage
    const rawData = [
      stateRow(NC, ASIAN_NH, "10-19", MALE, "50", "950"),
      stateRow(NC, ASIAN_NH, "20-29", MALE, "150", "850"),
      stateRow(NC, WHITE_NH, "10-19", MALE, "100", "100"),
    ];

    // Create final rows with poverty count
    // and poverty per 100k
    const NC_ASIAN_FINAL = finalRow(NC, RACE, ASIAN_NH, 200, 10000);
    const NC_WHITE_FINAL = finalRow(NC, RACE, WHITE_NH, 100, 50000);
    const NC_TOTAL_FINAL = finalRow(NC, RACE, TOTAL, 300, 13636);

    await evaluatePovertyWithTotal(
      "acs_poverty_dataset-poverty_by_race_age_sex_state",
      rawData,
      Breakdowns.forFips(new Fips("37")),
      RACE,
      [NC_ASIAN_FINAL, NC_WHITE_FINAL],
      [NC_ASIAN_FINAL, NC_WHITE_FINAL, NC_TOTAL_FINAL]
    );
  });

  test("testing state aggregate by sex alone", async () => {
    // Create raw rows with poverty coverage
    const rawData = [
      stateRow(NC, ASIAN_NH, "10-19", MALE, "50", "950"),
      stateRow(NC, ASIAN_NH, "10-19", FEMALE, "150", "850"),
    ];

    // Create final rows with poverty count
    // and poverty per 100k
    const NC_MALE_FINAL = finalRow(NC, SEX, MALE, 50, 5000);
    const NC_FEMALE_FINAL = finalRow(NC, SEX, FEMALE, 150, 15000);
    const NC_TOTAL_FINAL = finalRow(NC, SEX, TOTAL, 200, 10000);

    await evaluatePovertyWithTotal(
      "acs_poverty_dataset-poverty_by_race_age_sex_state",
      rawData,
      Breakdowns.forFips(new Fips("37")),
      SEX,
      [NC_FEMALE_FINAL, NC_MALE_FINAL],
      [NC_FEMALE_FINAL, NC_MALE_FINAL, NC_TOTAL_FINAL]
    );
  });

  /* -------------------------------------------- */

  test("testing county aggregate by race alone", async () => {
    // Create raw rows with poverty coverage
    const rawData = [
      countyRow(NC, MARIN, ASIAN_NH, "10-19", MALE, "1", "999"),
      countyRow(NC, KING_COUNTY, ASIAN_NH, "10-19", MALE, "50", "950"),
      countyRow(NC, KING_COUNTY, ASIAN_NH, "20-29", MALE, "150", "850"),
      countyRow(NC, KING_COUNTY, WHITE_NH, "10-19", MALE, "100", "100"),
    ];

    // Create final rows with poverty count
    // and poverty per 100k
    const NC_ASIAN_FINAL = finalCountyRow(
      KING_COUNTY,
      RACE,
      ASIAN_NH,
      200,
      10000
    );
    const NC_WHITE_FINAL = finalCountyRow(
      KING_COUNTY,
      RACE,
      WHITE_NH,
      100,
      50000
    );
    const NC_TOTAL_FINAL = finalCountyRow(KING_COUNTY, RACE, TOTAL, 300, 13636);
    const MARIN_ROW_FINAL = finalCountyRow(MARIN, RACE, ASIAN_NH, 1, 100);
    const MARIN_TOTAL_ROW_FINAL = finalCountyRow(MARIN, RACE, TOTAL, 1, 100);

    await evaluatePovertyWithTotal(
      "acs_poverty_dataset-poverty_by_race_age_sex_county",
      rawData,
      Breakdowns.byCounty(),
      RACE,
      [MARIN_ROW_FINAL, NC_ASIAN_FINAL, NC_WHITE_FINAL],
      [
        MARIN_ROW_FINAL,
        NC_ASIAN_FINAL,
        NC_WHITE_FINAL,
        MARIN_TOTAL_ROW_FINAL,
        NC_TOTAL_FINAL,
      ]
    );
  });
});
