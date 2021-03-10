import BrfssProvider from "./BrfssProvider";
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
} from "./TestUtils";
import { WHITE_NH, ASIAN_NH, TOTAL, RACE } from "../utils/Constants";
import AcsHealthInsuranceProvider from "./AcsHealthInsuranceProvider";

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

function finalRow(
  fips: FipsSpec,
  breakdownName: string,
  breakdownValue: string,
  with_health_insurance: number,
  health_insurance_per_100k: number
) {
  const row = {
    [breakdownName]: breakdownValue,
    fips: fips.code,
    fips_name: fips.name,
    with_health_insurance: with_health_insurance,
    health_insurance_per_100k: health_insurance_per_100k,
  };
  return row;
}

function stateRow(
  fips: FipsSpec,
  breakdownName: string,
  breakdownValue: string,
  with_health_insurance: string,
  witout_health_insurance: string,
  total_health_insurance: string
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

const evaluateHealthInsurancWithAndWithoutTotal = createWithAndWithoutTotalEvaluator(
  /*metricIds=*/ ["with_health_insurance", "health_insurance_per_100k"],
  dataFetcher,
  new AcsHealthInsuranceProvider()
);

describe("AcsHealthInsuranceProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(FakeDatasetMetadataMap);
  });

  test("State and Race Breakdown", async () => {
    // Create raw rows with copd_count, copd_no, diabetes_count & diabetes_no
    const rawData = [
      stateRow(AL, "race", ASIAN_NH, "100", "900", "1000"),
      stateRow(NC, "race", ASIAN_NH, "100", "900", "1000"),
      stateRow(NC, "race", WHITE_NH, "250", "250", "500"),
    ];

    // Create final rows with diabetes_count & diabetes_per_100k
    const NC_ASIAN_FINAL = finalRow(NC, RACE, ASIAN_NH, 100, 10000);
    const NC_WHITE_FINAL = finalRow(NC, RACE, WHITE_NH, 250, 50000);
    const NC_TOTAL_FINAL = finalRow(NC, RACE, TOTAL, 350, 23333);

    await evaluateHealthInsurancWithAndWithoutTotal(
      "acs_health_insurance-health_insurance_by_race_state",
      rawData,
      Breakdowns.forFips(new Fips("37")),
      RACE,
      [NC_ASIAN_FINAL, NC_WHITE_FINAL],
      [NC_ASIAN_FINAL, NC_WHITE_FINAL, NC_TOTAL_FINAL]
    );
  });

  test("National and Race Breakdown", async () => {
    // Create raw rows with copd_count, copd_no, diabetes_count & diabetes_no
    const rawData = [
      stateRow(AL, "race", ASIAN_NH, "100", "900", "1000"),
      stateRow(NC, "race", ASIAN_NH, "100", "900", "1000"),
      stateRow(NC, "race", WHITE_NH, "250", "250", "500"),
    ];

    // Create final rows with diabetes_count & diabetes_per_100k
    const NC_ASIAN_FINAL = finalRow(USA, RACE, ASIAN_NH, 200, 10000);
    const NC_WHITE_FINAL = finalRow(USA, RACE, WHITE_NH, 250, 50000);
    const NC_TOTAL_FINAL = finalRow(USA, RACE, TOTAL, 450, 18000);

    await evaluateHealthInsurancWithAndWithoutTotal(
      "acs_health_insurance-health_insurance_by_race_state",
      rawData,
      Breakdowns.forFips(new Fips(USA.code)),
      RACE,
      [NC_ASIAN_FINAL, NC_WHITE_FINAL],
      [NC_ASIAN_FINAL, NC_WHITE_FINAL, NC_TOTAL_FINAL]
    );
  });
});
