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
  CA,
  WA,
} from "./TestUtils";
import { WHITE_NH, ASIAN_NH, TOTAL, RACE } from "../utils/Constants";
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
  breakdownName: string,
  breakdownValue: string,
  below_poverty_level_count: number,
  below_poverty_level_per_100k: number
) {
  const row = {
    [breakdownName]: breakdownValue,
    fips: fips.code,
    fips_name: fips.name,
    below_poverty_level_count: below_poverty_level_count,
    below_poverty_level_per_100k: below_poverty_level_per_100k,
  };
  return row;
}

function finalCountyRow(
  stateFips: FipsSpec,
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
    below_poverty_level: below_poverty_level,
    below_poverty_level_per_100k: below_poverty_level_per_100k,
  };
  return row;
}

function stateRow(
  fips: FipsSpec,
  breakdownName: string,
  breakdownValue: string,
  above_poverty: string,
  below_poverty: string,
) {
  return {
    [breakdownName]: breakdownValue,
    state_fips: fips.code,
    state_name: fips.name,
    with_health_insurance: with_health_insurance,
    witout_health_insurance: witout_health_insurance,
    total_health_insurance: total_health_insurance,
  };
}

function countyRow(
  stateFips: FipsSpec,
  countyFips: FipsSpec,
  breakdownName: string,
  breakdownValue: string,
  above_poverty_level: string,
  below_poverty_level: string,
) {
  return {
    [breakdownName]: breakdownValue,
    state_fips: stateFips.code,
    state_name: stateFips.name,
    county_fips: countyFips.code,
    county_name: countyFips.name,
    above_poverty_level: above_poverty_level,
    below_poverty_level: below_poverty_level,
  };
}

const evaluateHealthInsuranceWithAndWithoutTotal = createWithAndWithoutTotalEvaluator(
  /*metricIds=*/ ["health_insurance_count", "health_insurance_per_100k"],
  dataFetcher,
  new AcsPovertyProvider()
);

//TODO: Add more tests for breakdown by SEX.
describe("AcsHealthInsuranceProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(FakeDatasetMetadataMap);
  });

  test("State and Race Breakdown", async () => {
    // Create raw rows with health insurance coverage
    const rawData = [
      stateRow(AL, "race", ASIAN_NH, "100", "900", "1000"),
      stateRow(NC, "race", ASIAN_NH, "100", "900", "1000"),
      stateRow(NC, "race", WHITE_NH, "250", "250", "500"),
    ];

    // Create final rows with health insurance count
    // and health insurance per 100k
    const NC_ASIAN_FINAL = finalRow(NC, RACE, ASIAN_NH, 100, 10000);
    const NC_WHITE_FINAL = finalRow(NC, RACE, WHITE_NH, 250, 50000);
    const NC_TOTAL_FINAL = finalRow(NC, RACE, TOTAL, 350, 23333);

    await evaluateHealthInsuranceWithAndWithoutTotal(
      "acs_health_insurance-health_insurance_by_race_state",
      rawData,
      Breakdowns.forFips(new Fips("37")),
      RACE,
      [NC_ASIAN_FINAL, NC_WHITE_FINAL],
      [NC_ASIAN_FINAL, NC_WHITE_FINAL, NC_TOTAL_FINAL]
    );
  });

  test("National and Race Breakdown", async () => {
    // Create raw rows with health insurance coverage
    const rawData = [
      stateRow(AL, "race", ASIAN_NH, "100", "900", "1000"),
      stateRow(NC, "race", ASIAN_NH, "100", "900", "1000"),
      stateRow(NC, "race", WHITE_NH, "250", "250", "500"),
    ];

    // Create final rows with health insurance count
    // and health insurance per 100k
    const NC_ASIAN_FINAL = finalRow(USA, RACE, ASIAN_NH, 200, 10000);
    const NC_WHITE_FINAL = finalRow(USA, RACE, WHITE_NH, 250, 50000);
    const NC_TOTAL_FINAL = finalRow(USA, RACE, TOTAL, 450, 18000);

    await evaluateHealthInsuranceWithAndWithoutTotal(
      "acs_health_insurance-health_insurance_by_race_state",
      rawData,
      Breakdowns.forFips(new Fips(USA.code)),
      RACE,
      [NC_ASIAN_FINAL, NC_WHITE_FINAL],
      [NC_ASIAN_FINAL, NC_WHITE_FINAL, NC_TOTAL_FINAL]
    );
  });

  test("County and Race Breakdown", async () => {
    // Create raw rows with health insurance coverage
    const rawData = [
      countyRow(WA, KING_COUNTY, "race", ASIAN_NH, "100", "900", "1000"),
      countyRow(WA, KING_COUNTY, "race", WHITE_NH, "150", "800", "950"),
    ];

    // Create final rows with health insurance count
    // and health insurance per 100k
    const WA_KC_ASIAN_FINAL = finalCountyRow(
      WA,
      KING_COUNTY,
      RACE,
      ASIAN_NH,
      100,
      10000
    );
    const WA_KC_WHITE_FINAL = finalCountyRow(
      WA,
      KING_COUNTY,
      RACE,
      WHITE_NH,
      150,
      15789
    );
    const TOTAL_ROW = finalCountyRow(WA, KING_COUNTY, RACE, TOTAL, 250, 12821);

    await evaluateHealthInsuranceWithAndWithoutTotal(
      "acs_health_insurance-health_insurance_by_race_county",
      rawData,
      Breakdowns.byCounty(),
      RACE,
      [WA_KC_ASIAN_FINAL, WA_KC_WHITE_FINAL],
      [WA_KC_ASIAN_FINAL, WA_KC_WHITE_FINAL, TOTAL_ROW]
    );
  });
});
