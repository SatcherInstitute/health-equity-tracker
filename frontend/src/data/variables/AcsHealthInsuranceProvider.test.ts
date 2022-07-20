import { Breakdowns, BreakdownVar } from "../query/Breakdowns";
import { Fips } from "../utils/Fips";
import { DatasetMetadataMap } from "../config/DatasetMetadata";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import FakeDataFetcher from "../../testing/FakeDataFetcher";
import {
  createWithAndWithoutAllEvaluator,
  FipsSpec,
  NC,
  AL,
  USA,
  WA,
} from "./TestUtils";
import {
  WHITE_NH,
  ASIAN_NH,
  ALL,
  RACE,
  WHITE,
  HISPANIC,
  DemographicGroup,
} from "../utils/Constants";
import AcsHealthInsuranceProvider from "./AcsHealthInsuranceProvider";

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
  without_health_insurance: number,
  health_insurance_per_100k: number
) {
  const row = {
    [breakdownName]: breakdownValue,
    fips: fips.code,
    fips_name: fips.name,
    health_insurance_count: without_health_insurance,
    health_insurance_per_100k: health_insurance_per_100k,
  };
  return row;
}

function finalCountyRow(
  stateFips: FipsSpec,
  countyFips: FipsSpec,
  breakdownName: BreakdownVar,
  breakdownValue: DemographicGroup,
  without_health_insurance: number,
  health_insurance_per_100k: number
) {
  const row = {
    [breakdownName]: breakdownValue,
    fips: countyFips.code,
    fips_name: countyFips.name,
    health_insurance_count: without_health_insurance,
    health_insurance_per_100k: health_insurance_per_100k,
  };
  return row;
}

function stateRow(
  fips: FipsSpec,
  breakdownName: BreakdownVar,
  breakdownValue: DemographicGroup,
  with_health_insurance: string,
  without_health_insurance: string,
  total_health_insurance: string
) {
  return {
    [breakdownName]: breakdownValue,
    state_fips: fips.code,
    state_name: fips.name,
    with_health_insurance: with_health_insurance,
    without_health_insurance: without_health_insurance,
    total_health_insurance: total_health_insurance,
  };
}

function countyRow(
  stateFips: FipsSpec,
  countyFips: FipsSpec,
  breakdownName: BreakdownVar,
  breakdownValue: DemographicGroup,
  with_health_insurance: string,
  without_health_insurance: string,
  total_health_insurance: string
) {
  return {
    [breakdownName]: breakdownValue,
    state_fips: stateFips.code,
    state_name: stateFips.name,
    county_fips: countyFips.code,
    county_name: countyFips.name,
    with_health_insurance: with_health_insurance,
    without_health_insurance: without_health_insurance,
    total_health_insurance: total_health_insurance,
  };
}

const evaluateHealthInsuranceWithAndWithoutTotal =
  createWithAndWithoutAllEvaluator(
    /*metricIds=*/ ["health_insurance_count", "health_insurance_per_100k"],
    dataFetcher,
    new AcsHealthInsuranceProvider()
  );

//TODO: Add more tests for breakdown by SEX.
describe("AcsHealthInsuranceProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap);
  });

  test("State and Race Breakdown", async () => {
    // Create raw rows with health insurance coverage
    const rawData = [
      stateRow(AL, RACE, ASIAN_NH, "100", "900", "1000"),
      stateRow(NC, RACE, ASIAN_NH, "100", "900", "1000"),
      stateRow(NC, RACE, WHITE, "250", "250", "500"),
    ];

    // Create final rows with health insurance count
    // and health insurance per 100k
    const NC_ASIAN_FINAL = finalRow(NC, RACE, ASIAN_NH, 900, 90000);
    const NC_WHITE_FINAL = finalRow(NC, RACE, WHITE, 250, 50000);
    const NC_ALL_FINAL = finalRow(NC, RACE, ALL, 1150, 76667);

    await evaluateHealthInsuranceWithAndWithoutTotal(
      "acs_health_insurance-health_insurance_by_race_age_state",
      rawData,
      Breakdowns.forFips(new Fips("37")),
      RACE,
      [NC_ASIAN_FINAL, NC_WHITE_FINAL],
      [NC_ALL_FINAL, NC_ASIAN_FINAL, NC_WHITE_FINAL]
    );
  });

  test("National and Race Breakdown", async () => {
    // Create raw rows with health insurance coverage
    const rawData = [
      stateRow(AL, RACE, ASIAN_NH, "100", "900", "1000"),
      stateRow(NC, RACE, ASIAN_NH, "100", "900", "1000"),
      stateRow(NC, RACE, WHITE, "250", "250", "500"),
    ];

    // Create final rows with health insurance count
    // and health insurance per 100k
    const NC_ASIAN_FINAL = finalRow(USA, RACE, ASIAN_NH, 1800, 90000);
    const NC_WHITE_FINAL = finalRow(USA, RACE, WHITE, 250, 50000);
    const NC_ALL_FINAL = finalRow(USA, RACE, ALL, 2050, 82000);

    await evaluateHealthInsuranceWithAndWithoutTotal(
      "acs_health_insurance-health_insurance_by_race_age_state",
      rawData,
      Breakdowns.forFips(new Fips(USA.code)),
      RACE,
      [NC_ASIAN_FINAL, NC_WHITE_FINAL],
      [NC_ALL_FINAL, NC_ASIAN_FINAL, NC_WHITE_FINAL]
    );
  });

  test("County and Race Breakdown", async () => {
    // Create raw rows with health insurance coverage
    const rawData = [
      countyRow(WA, KING_COUNTY, RACE, ASIAN_NH, "100", "900", "1000"),
      countyRow(WA, KING_COUNTY, RACE, WHITE, "150", "800", "950"),
    ];

    // Create final rows with health insurance count
    // and health insurance per 100k
    const WA_KC_ASIAN_FINAL = finalCountyRow(
      WA,
      KING_COUNTY,
      RACE,
      ASIAN_NH,
      900,
      90000
    );
    const WA_KC_WHITE_FINAL = finalCountyRow(
      WA,
      KING_COUNTY,
      RACE,
      WHITE,
      800,
      84211
    );
    const TOTAL_ROW = finalCountyRow(WA, KING_COUNTY, RACE, ALL, 1700, 87179);

    await evaluateHealthInsuranceWithAndWithoutTotal(
      "acs_health_insurance-health_insurance_by_race_age_county",
      rawData,
      Breakdowns.byCounty(),
      RACE,
      [WA_KC_ASIAN_FINAL, WA_KC_WHITE_FINAL],
      [WA_KC_ASIAN_FINAL, WA_KC_WHITE_FINAL, TOTAL_ROW]
    );
  });

  test("Testing total disaggregates by hispanic and white_nh", async () => {
    // Create raw rows with health insurance coverage
    const rawData = [
      stateRow(WA, RACE, WHITE, "100", "800", "900"),
      stateRow(WA, RACE, WHITE_NH, "200", "800", "1000"),
      stateRow(WA, RACE, HISPANIC, "400", "800", "1200"),
    ];

    const WA_HL = finalRow(WA, RACE, HISPANIC, 800, 66667);

    const WA_WHITE = finalRow(WA, RACE, WHITE, 800, 88889);

    const TOTAL_ROW = finalRow(WA, RACE, ALL, 800, 88889);

    await evaluateHealthInsuranceWithAndWithoutTotal(
      "acs_health_insurance-health_insurance_by_race_age_state",
      rawData,
      Breakdowns.forFips(new Fips("53")),
      RACE,
      [WA_HL, WA_WHITE],
      [TOTAL_ROW, WA_HL, WA_WHITE]
    );
  });
});
