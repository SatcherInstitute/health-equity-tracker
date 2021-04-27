import BrfssProvider from "./BrfssProvider";
import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns, BreakdownVar } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { Fips } from "../utils/Fips";
import { FakeDatasetMetadataMap } from "../config/FakeDatasetMetadata";
import { excludeAll } from "../query/BreakdownFilter";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import FakeDataFetcher from "../../testing/FakeDataFetcher";
import { FipsSpec, NC, AL, USA } from "./TestUtils";
import { WHITE_NH, ASIAN_NH, ALL, RACE, UNKNOWN } from "../utils/Constants";
import { MetricId } from "../config/MetricConfig";

const METRIC_IDS: MetricId[] = [
  "diabetes_count",
  "diabetes_per_100k",
  "diabetes_pct_share",
  "copd_pct_share",
  "diabetes_count_share_of_known",
  "copd_count_share_of_known",
];

export async function evaluateWithAndWithoutAll(
  brfssDatasetId: string,
  rawCovidData: any[],
  acsDatasetId: string,
  rawAcsData: any[],
  baseBreakdown: Breakdowns,
  breakdownVar: BreakdownVar,
  rowsExcludingAll: any[],
  rowsIncludingAll: any[]
) {
  const acsProvider = new AcsPopulationProvider();
  const brfssProvider = new BrfssProvider(acsProvider);

  dataFetcher.setFakeDatasetLoaded(brfssDatasetId, rawCovidData);
  dataFetcher.setFakeDatasetLoaded(acsDatasetId, rawAcsData);

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await brfssProvider.getData(
    new MetricQuery(METRIC_IDS, baseBreakdown.addBreakdown(breakdownVar))
  );

  let consumedDatasetIds = ["brfss", "acs_population-by_race_state_std"];
  if (baseBreakdown.geography === "national") {
    consumedDatasetIds.push(acsDatasetId);
  }

  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse(rowsIncludingAll, consumedDatasetIds)
  );

  // Evaluate the response without requesting "All" field
  const responseExcludingAll = await brfssProvider.getData(
    new MetricQuery(
      METRIC_IDS,
      baseBreakdown.addBreakdown(breakdownVar, excludeAll())
    )
  );
  expect(responseExcludingAll).toEqual(
    new MetricQueryResponse(rowsExcludingAll, consumedDatasetIds)
  );
}

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

function finalRow(
  fips: FipsSpec,
  breakdownName: string,
  breakdownValue: string,
  diabetes_count: number,
  diabetes_per_100k: number,
  copd_pct_share: number,
  diabetes_pct_share: number,
  copd_count_share_of_known: number,
  diabetes_count_share_of_known: number
) {
  return {
    [breakdownName]: breakdownValue,
    fips: fips.code,
    fips_name: fips.name,
    diabetes_count: diabetes_count,
    diabetes_per_100k: diabetes_per_100k,
    copd_pct_share: copd_pct_share,
    diabetes_pct_share: diabetes_pct_share,
    copd_count_share_of_known: copd_count_share_of_known,
    diabetes_count_share_of_known: diabetes_count_share_of_known,
  };
}

function stateRow(
  fips: FipsSpec,
  breakdownName: string,
  breakdownValue: string,
  copd_count: number,
  copd_no: number,
  diabetes_count: number,
  diabetes_no: number,
  population: number
) {
  return [
    {
      [breakdownName]: breakdownValue,
      state_fips: fips.code,
      state_name: fips.name,
      copd_count: copd_count,
      copd_no: copd_no,
      diabetes_count: diabetes_count,
      diabetes_no: diabetes_no,
    },
    {
      state_fips: fips.code,
      state_name: fips.name,
      race_and_ethnicity: breakdownValue,
      population: population,
    },
  ];
}

describe("BrfssProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(FakeDatasetMetadataMap);
  });

  test("State and Race Breakdown", async () => {
    // Create raw rows with copd_count, copd_no, diabetes_count & diabetes_no

    const [AL_ASIAN_ROW, AL_ACS_ASIAN_ROW] = stateRow(
      /*fips=*/ AL,
      /*breakdownName=*/ RACE,
      /*breakdownValue=*/ ASIAN_NH,
      /*copd_yes=*/ 100,
      /*copd_no=*/ 900,
      /*diabetes_yes=*/ 200,
      /*diabetes_no=*/ 800,
      /*population=*/ 5000
    );

    const [NC_ASIAN_ROW, NC_ACS_ASIAN_ROW] = stateRow(
      NC,
      RACE,
      ASIAN_NH,
      100,
      900,
      400,
      600,
      5000
    );

    const [NC_WHITE_ROW, NC_ACS_WHITE_ROW] = stateRow(
      NC,
      RACE,
      WHITE_NH,
      500,
      500,
      600,
      400,
      5000
    );

    const rawData = [AL_ASIAN_ROW, NC_ASIAN_ROW, NC_WHITE_ROW];

    const rawAcsData = [AL_ACS_ASIAN_ROW, NC_ACS_ASIAN_ROW, NC_ACS_WHITE_ROW];

    // Create final rows with diabetes_count & diabetes_per_100k
    const NC_ASIAN_FINAL = finalRow(
      /*fips*/ NC,
      /*breakdownName*/ RACE,
      /*breakdownValue*/ ASIAN_NH,
      /*diabetes_count*/ 400,
      /*diabetes_per_100k*/ 40000,
      /*copd_pct_share*/ 16.7,
      /*diabetes_pct_share*/ 40,
      /*copd_count_share_of_known*/ 16.7,
      /*diabetes_count_share_of_known*/ 40
    );
    const NC_WHITE_FINAL = finalRow(
      NC,
      RACE,
      WHITE_NH,
      600,
      60000,
      83.3,
      60,
      83.3,
      60
    );
    const NC_ALL_FINAL = finalRow(
      NC,
      RACE,
      ALL,
      1000,
      50000,
      100,
      100,
      100,
      100
    );

    await evaluateWithAndWithoutAll(
      "brfss",
      rawData,
      "acs_population-by_race_state_std",
      rawAcsData,
      Breakdowns.forFips(new Fips("37")),
      RACE,
      [NC_ASIAN_FINAL, NC_WHITE_FINAL],
      [NC_ALL_FINAL, NC_ASIAN_FINAL, NC_WHITE_FINAL]
    );
  });

  test("National and Race Breakdown", async () => {
    // Create raw rows with copd_count, copd_no, diabetes_count & diabetes_no
    const [AL_ASIAN_ROW, AL_ACS_ASIAN_ROW] = stateRow(
      /*fips=*/ AL,
      /*breakdownName=*/ RACE,
      /*breakdownValue=*/ ASIAN_NH,
      /*copd_yes=*/ 100,
      /*copd_no=*/ 900,
      /*diabetes_yes=*/ 200,
      /*diabetes_no=*/ 800,
      /*population=*/ 5000
    );

    const [NC_ASIAN_ROW, NC_ACS_ASIAN_ROW] = stateRow(
      NC,
      RACE,
      ASIAN_NH,
      200,
      800,
      400,
      600,
      5000
    );

    const [NC_WHITE_ROW, NC_ACS_WHITE_ROW] = stateRow(
      NC,
      RACE,
      WHITE_NH,
      500,
      500,
      600,
      400,
      5000
    );

    const rawData = [AL_ASIAN_ROW, NC_ASIAN_ROW, NC_WHITE_ROW];

    const rawAcsData = [AL_ACS_ASIAN_ROW, NC_ACS_ASIAN_ROW, NC_ACS_WHITE_ROW];

    // Create final rows with diabetes_count & diabetes_per_100k
    const ASIAN_FINAL = finalRow(
      USA,
      RACE,
      ASIAN_NH,
      600,
      30000,
      37.5,
      50,
      37.5,
      50
    );
    const WHITE_FINAL = finalRow(
      USA,
      RACE,
      WHITE_NH,
      600,
      60000,
      62.5,
      50,
      62.5,
      50
    );
    const ALL_FINAL = finalRow(USA, RACE, ALL, 1200, 40000, 100, 100, 100, 100);

    await evaluateWithAndWithoutAll(
      "brfss",
      rawData,
      "acs_population-by_race_state_std",
      rawAcsData,
      Breakdowns.national(),
      RACE,
      [ASIAN_FINAL, WHITE_FINAL],
      [ALL_FINAL, ASIAN_FINAL, WHITE_FINAL]
    );
    // });
  });

  test("Calculates share of known with unknown present", async () => {
    // Create raw rows with copd_count, copd_no, diabetes_count & diabetes_no
    const [AL_ASIAN_ROW, AL_ACS_ASIAN_ROW] = stateRow(
      /*fips=*/ AL,
      /*breakdownName=*/ RACE,
      /*breakdownValue=*/ ASIAN_NH,
      /*copd_yes=*/ 100,
      /*copd_no=*/ 900,
      /*diabetes_yes=*/ 200,
      /*diabetes_no=*/ 800,
      /*population=*/ 5000
    );

    const [NC_UNKNOWN_ROW, UNUSED_NC_UNKNOWN] = stateRow(
      /*fips=*/ NC,
      /*breakdownName=*/ RACE,
      /*breakdownValue=*/ UNKNOWN,
      /*copd_yes=*/ 100,
      /*copd_no=*/ 100,
      /*diabetes_yes=*/ 100,
      /*diabetes_no=*/ 100,
      /*population=*/ 1
    );

    const [NC_ASIAN_ROW, NC_ACS_ASIAN_ROW] = stateRow(
      NC,
      RACE,
      ASIAN_NH,
      200,
      800,
      400,
      600,
      5000
    );

    const [NC_WHITE_ROW, NC_ACS_WHITE_ROW] = stateRow(
      NC,
      RACE,
      WHITE_NH,
      500,
      500,
      600,
      400,
      5000
    );

    const rawData = [AL_ASIAN_ROW, NC_UNKNOWN_ROW, NC_ASIAN_ROW, NC_WHITE_ROW];

    const rawAcsData = [AL_ACS_ASIAN_ROW, NC_ACS_ASIAN_ROW, NC_ACS_WHITE_ROW];

    // Create final rows with diabetes_count & diabetes_per_100k
    const ASIAN_FINAL = finalRow(
      USA,
      RACE,
      ASIAN_NH,
      600,
      30000,
      33.7,
      46.5,
      37.5,
      50
    );
    const WHITE_FINAL = finalRow(
      USA,
      RACE,
      WHITE_NH,
      600,
      60000,
      56.1,
      46.5,
      62.5,
      50
    );
    const ALL_FINAL = finalRow(USA, RACE, ALL, 1300, 40625, 100, 100, 100, 100);

    const UNKNOWN_FINAL = {
      race_and_ethnicity: UNKNOWN,
      fips: USA.code,
      fips_name: USA.name,
      diabetes_count: 100,
      diabetes_per_100k: 50000,
      copd_pct_share: 10.2,
      diabetes_pct_share: 7,
    };

    await evaluateWithAndWithoutAll(
      "brfss",
      rawData,
      "acs_population-by_race_state_std",
      rawAcsData,
      Breakdowns.national(),
      RACE,
      [ASIAN_FINAL, WHITE_FINAL, UNKNOWN_FINAL],
      [ALL_FINAL, ASIAN_FINAL, WHITE_FINAL, UNKNOWN_FINAL]
    );
  });
});
