import BrfssProvider from "./BrfssProvider";
import { Breakdowns, BreakdownVar } from "../Breakdowns";
import { Fips } from "../../utils/madlib/Fips";
import FakeMetadataMap from "../FakeMetadataMap";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import FakeDataFetcher from "../../testing/FakeDataFetcher";
import {
  evaluateWithAndWithoutTotalInternal,
  FipsSpec,
  NC,
  AL,
  USA,
  WHITE,
  ASIAN,
  TOTAL,
  RACE,
  AGE,
  SEX,
} from "./TestUtils";

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

function finalRow(
  fips: FipsSpec,
  breakdownName: string,
  breakdownValue: string,
  copd_count: number,
  copd_no: number,
  copd_per_100k: number,
  diabetes_count: number,
  diabetes_no: number,
  diabetes_per_100k: number
) {
  return {
    [breakdownName]: breakdownValue,
    fips: fips.code,
    fips_name: fips.name,
    copd_count: copd_count,
    copd_no: copd_no,
    copd_per_100k: copd_per_100k,
    diabetes_count: diabetes_count,
    diabetes_no: diabetes_no,
    diabetes_per_100k: diabetes_per_100k,
  };
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

async function evaluateWithAndWithoutTotal(
  datasetId: string,
  rawData: any[],
  baseBreakdown: Breakdowns,
  breakdownVar: BreakdownVar,
  nonTotalRows: any[],
  totalRows: any[]
) {
  const brfssProvider = new BrfssProvider();

  return evaluateWithAndWithoutTotalInternal(
    "diabetes_count",
    dataFetcher,
    brfssProvider,
    datasetId,
    rawData,
    baseBreakdown,
    breakdownVar,
    nonTotalRows,
    totalRows
  );
}

describe("BrfssProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(FakeMetadataMap);
  });

  test("State and Race Breakdown", async () => {
    const rawData = [
      stateRow(AL, RACE, ASIAN, 100, 900, 200, 800),
      stateRow(NC, RACE, ASIAN, 100, 900, 400, 600),
      stateRow(NC, RACE, WHITE, 500, 500, 600, 400),
    ];

    const NC_ASIAN_FINAL = finalRow(
      NC,
      RACE,
      ASIAN,
      100,
      900,
      10000,
      400,
      600,
      40000
    );
    const NC_WHITE_FINAL = finalRow(
      NC,
      RACE,
      WHITE,
      500,
      500,
      50000,
      600,
      400,
      60000
    );
    const NC_TOTAL_FINAL = finalRow(
      NC,
      RACE,
      TOTAL,
      600,
      1400,
      30000,
      1000,
      1000,
      50000
    );

    evaluateWithAndWithoutTotal(
      "brfss",
      rawData,
      Breakdowns.forFips(new Fips("37")),
      RACE,
      [NC_ASIAN_FINAL, NC_WHITE_FINAL],
      [NC_ASIAN_FINAL, NC_WHITE_FINAL, NC_TOTAL_FINAL]
    );
  });

  test("National and Race Breakdown", async () => {
    const rawData = [
      stateRow(AL, RACE, ASIAN, 100, 900, 200, 800),
      stateRow(NC, RACE, ASIAN, 100, 900, 400, 600),
      stateRow(NC, RACE, WHITE, 500, 500, 600, 400),
    ];

    const ASIAN_FINAL = finalRow(
      USA,
      RACE,
      ASIAN,
      200,
      1800,
      10000,
      600,
      1400,
      30000
    );
    const WHITE_FINAL = finalRow(
      USA,
      RACE,
      WHITE,
      500,
      500,
      50000,
      600,
      400,
      60000
    );
    const TOTAL_FINAL = finalRow(
      USA,
      RACE,
      TOTAL,
      700,
      2300,
      23333,
      1200,
      1800,
      40000
    );

    evaluateWithAndWithoutTotal(
      "brfss",
      rawData,
      Breakdowns.national(),
      RACE,
      [ASIAN_FINAL, WHITE_FINAL],
      [ASIAN_FINAL, WHITE_FINAL, TOTAL_FINAL]
    );
  });
});
