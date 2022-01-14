import { Breakdowns, BreakdownVar } from "../query/Breakdowns";
import { Fips } from "../utils/Fips";
import { DatasetMetadataMap } from "../config/DatasetMetadata";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import FakeDataFetcher from "../../testing/FakeDataFetcher";
import { createWithAndWithoutAllEvaluator, FipsSpec, NC } from "./TestUtils";
import {
  WHITE,
  ASIAN_NH,
  ALL,
  RACE,
  MALE,
  FEMALE,
  SEX,
  DemographicGroup,
} from "../utils/Constants";
import AcsPovertyProvider from "./AcsPovertyProvider";

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
  breakdownName: BreakdownVar,
  breakdownValue: DemographicGroup,
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
  breakdownName: BreakdownVar,
  breakdownValue: DemographicGroup,
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
    [RACE]: race_value,
    age: age_value,
    sex: sex_value,
    state_fips: fips.code,
    state_name: fips.name,
    above_poverty_line: Number(above_poverty),
    below_poverty_line: Number(below_poverty),
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
    [RACE]: race_value,
    age: age_value,
    sex: sex_value,
    above_poverty_line: Number(above_poverty),
    below_poverty_line: Number(below_poverty),
  };
}

const evaluatePovertyWithAll = createWithAndWithoutAllEvaluator(
  /*metricIds=*/ ["poverty_count", "poverty_per_100k"],
  dataFetcher,
  new AcsPovertyProvider()
);

//TODO: Add more tests for breakdown by SEX.
describe("AcsPovertyProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap);
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
    const NC_ALL_FINAL = finalRow(NC, RACE, ALL, 200, 10000);

    await evaluatePovertyWithAll(
      "acs_poverty_dataset-poverty_by_race_state",
      rawData,
      Breakdowns.forFips(new Fips("37")),
      RACE,
      [NC_ASIAN_FINAL],
      [NC_ALL_FINAL, NC_ASIAN_FINAL]
    );
  });

  test("testing state aggregate by race multiple", async () => {
    // Create raw rows with poverty coverage
    const rawData = [
      stateRow(NC, ASIAN_NH, "10-19", MALE, "50", "950"),
      stateRow(NC, ASIAN_NH, "20-29", MALE, "150", "850"),
      stateRow(NC, WHITE, "10-19", MALE, "100", "100"),
    ];

    // Create final rows with poverty count
    // and poverty per 100k
    const NC_ASIAN_FINAL = finalRow(NC, RACE, ASIAN_NH, 200, 10000);
    const NC_WHITE_FINAL = finalRow(NC, RACE, WHITE, 100, 50000);
    const NC_ALL_FINAL = finalRow(NC, RACE, ALL, 300, 13636);

    await evaluatePovertyWithAll(
      "acs_poverty_dataset-poverty_by_race_state",
      rawData,
      Breakdowns.forFips(new Fips("37")),
      RACE,
      [NC_ASIAN_FINAL, NC_WHITE_FINAL],
      [NC_ALL_FINAL, NC_ASIAN_FINAL, NC_WHITE_FINAL]
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
    const NC_ALL_FINAL = finalRow(NC, SEX, ALL, 200, 10000);

    await evaluatePovertyWithAll(
      "acs_poverty_dataset-poverty_by_sex_state",
      rawData,
      Breakdowns.forFips(new Fips("37")),
      SEX,
      [NC_FEMALE_FINAL, NC_MALE_FINAL],
      [NC_ALL_FINAL, NC_FEMALE_FINAL, NC_MALE_FINAL]
    );
  });

  /* -------------------------------------------- */

  test("testing county aggregate by race alone", async () => {
    // Create raw rows with poverty coverage
    const rawData = [
      countyRow(NC, MARIN, ASIAN_NH, "10-19", MALE, "1", "999"),
      countyRow(NC, KING_COUNTY, ASIAN_NH, "10-19", MALE, "50", "950"),
      countyRow(NC, KING_COUNTY, ASIAN_NH, "20-29", MALE, "150", "850"),
      countyRow(NC, KING_COUNTY, WHITE, "10-19", MALE, "100", "100"),
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
    const KC_WHITE_FINAL = finalCountyRow(KING_COUNTY, RACE, WHITE, 100, 50000);
    const KC_ALL_FINAL = finalCountyRow(KING_COUNTY, RACE, ALL, 300, 13636);
    const MARIN_ASIAN_ROW_FINAL = finalCountyRow(MARIN, RACE, ASIAN_NH, 1, 100);
    const MARIN_ALL_ROW_FINAL = finalCountyRow(MARIN, RACE, ALL, 1, 100);

    await evaluatePovertyWithAll(
      "acs_poverty_dataset-poverty_by_race_county",
      rawData,
      Breakdowns.byCounty(),
      RACE,
      [MARIN_ASIAN_ROW_FINAL, NC_ASIAN_FINAL, KC_WHITE_FINAL],
      [
        MARIN_ASIAN_ROW_FINAL,
        MARIN_ALL_ROW_FINAL,
        NC_ASIAN_FINAL,
        KC_WHITE_FINAL,
        KC_ALL_FINAL,
      ]
    );
  });
});
