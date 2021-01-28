import BrfssProvider from "./BrfssProvider";
import { Breakdowns } from "../Breakdowns";
import { Fips } from "../../utils/madlib/Fips";
import FakeMetadataMap from "../FakeMetadataMap";
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
import { WHITE, ASIAN, TOTAL, RACE } from "../Constants";

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

const evaluateWithAndWithoutTotal = createWithAndWithoutTotalEvaluator(
  "diabetes_count",
  dataFetcher,
  new BrfssProvider()
);

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
      /*copd_count=*/ 100,
      /*copd_no=*/ 900,
      /*copd_per_100k=*/ 10000,
      /*diabetes_count=*/ 400,
      /*diabetes_no=*/ 600,
      /*diabetes_per_100k=*/ 40000
    );
    const NC_WHITE_FINAL = finalRow(
      NC,
      RACE,
      WHITE,
      /*copd_count=*/ 500,
      /*copd_no=*/ 500,
      /*copd_per_100k=*/ 50000,
      /*diabetes_count=*/ 600,
      /*diabetes_no=*/ 400,
      /*diabetes_per_100k=*/ 60000
    );
    const NC_TOTAL_FINAL = finalRow(
      NC,
      RACE,
      TOTAL,
      /*copd_count=*/ 600,
      /*copd_no=*/ 1400,
      /*copd_per_100k=*/ 30000,
      /*diabetes_count=*/ 1000,
      /*diabetes_no=*/ 1000,
      /*diabetes_per_100k=*/ 50000
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
      /*copd_count=*/ 200,
      /*copd_no=*/ 1800,
      /*copd_per_100k=*/ 10000,
      /*diabetes_count=*/ 600,
      /*diabetes_no=*/ 1400,
      /*diabetes_per_100k=*/ 30000
    );
    const WHITE_FINAL = finalRow(
      USA,
      RACE,
      WHITE,
      /*copd_count=*/ 500,
      /*copd_no=*/ 500,
      /*copd_per_100k=*/ 50000,
      /*diabetes_count=*/ 600,
      /*diabetes_no=*/ 400,
      /*diabetes_per_100k=*/ 60000
    );
    const TOTAL_FINAL = finalRow(
      USA,
      RACE,
      TOTAL,
      /*copd_count=*/ 700,
      /*copd_no=*/ 2300,
      /*copd_per_100k=*/ 23333,
      /*diabetes_count=*/ 1200,
      /*diabetes_no=*/ 1800,
      /*diabetes_per_100k=*/ 40000
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
