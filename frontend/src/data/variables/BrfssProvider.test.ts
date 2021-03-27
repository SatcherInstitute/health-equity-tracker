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

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

function finalRow(
  fips: FipsSpec,
  breakdownName: string,
  breakdownValue: string,
  diabetes_count: number,
  diabetes_per_100k: number
) {
  const row = {
    [breakdownName]: breakdownValue,
    fips: fips.code,
    fips_name: fips.name,
    diabetes_count: diabetes_count,
    diabetes_per_100k: diabetes_per_100k,
  };
  return row;
}

function stateRow(
  fips: FipsSpec,
  breakdownName: string,
  breakdownValue: string,
  copd_count: number,
  copd_no: number,
  diabetes_count: number,
  diabetes_no: number
) {
  return {
    [breakdownName]: breakdownValue,
    state_fips: fips.code,
    state_name: fips.name,
    copd_count: copd_count,
    copd_no: copd_no,
    diabetes_count: diabetes_count,
    diabetes_no: diabetes_no,
  };
}

const evaluateDiabetesCountAndPer100kWithAndWithoutTotal = createWithAndWithoutTotalEvaluator(
  /*metricIds=*/ ["diabetes_count", "diabetes_per_100k"],
  dataFetcher,
  new BrfssProvider()
);

describe("BrfssProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(FakeDatasetMetadataMap);
  });

  test("State and Race Breakdown", async () => {
    // Create raw rows with copd_count, copd_no, diabetes_count & diabetes_no
    const rawData = [
      stateRow(AL, RACE, ASIAN_NH, 100, 900, 200, 800),
      stateRow(NC, RACE, ASIAN_NH, 100, 900, 400, 600),
      stateRow(NC, RACE, WHITE_NH, 500, 500, 600, 400),
    ];

    // Create final rows with diabetes_count & diabetes_per_100k
    const NC_ASIAN_FINAL = finalRow(NC, RACE, ASIAN_NH, 400, 40000);
    const NC_WHITE_FINAL = finalRow(NC, RACE, WHITE_NH, 600, 60000);
    const NC_TOTAL_FINAL = finalRow(NC, RACE, TOTAL, 1000, 50000);

    await evaluateDiabetesCountAndPer100kWithAndWithoutTotal(
      "brfss",
      rawData,
      Breakdowns.forFips(new Fips("37")),
      RACE,
      [NC_ASIAN_FINAL, NC_WHITE_FINAL],
      [NC_TOTAL_FINAL, NC_ASIAN_FINAL, NC_WHITE_FINAL]
    );
  });

  test("National and Race Breakdown", async () => {
    // Create raw rows with copd_count, copd_no, diabetes_count & diabetes_no
    const rawData = [
      stateRow(AL, RACE, ASIAN_NH, 100, 900, 200, 800),
      stateRow(NC, RACE, ASIAN_NH, 100, 900, 400, 600),
      stateRow(NC, RACE, WHITE_NH, 500, 500, 600, 400),
    ];

    // Create final rows with diabetes_count & diabetes_per_100k
    const ASIAN_FINAL = finalRow(USA, RACE, ASIAN_NH, 600, 30000);
    const WHITE_FINAL = finalRow(USA, RACE, WHITE_NH, 600, 60000);
    const TOTAL_FINAL = finalRow(USA, RACE, TOTAL, 1200, 40000);

    await evaluateDiabetesCountAndPer100kWithAndWithoutTotal(
      "brfss",
      rawData,
      Breakdowns.national(),
      RACE,
      [ASIAN_FINAL, WHITE_FINAL],
      [TOTAL_FINAL, ASIAN_FINAL, WHITE_FINAL]
    );
  });
});
