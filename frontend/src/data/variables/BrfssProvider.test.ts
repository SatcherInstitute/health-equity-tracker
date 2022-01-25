import BrfssProvider from "./BrfssProvider";
import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns, BreakdownVar } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { Fips } from "../utils/Fips";
import { DatasetMetadataMap } from "../config/DatasetMetadata";
import { excludeAll } from "../query/BreakdownFilter";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import FakeDataFetcher from "../../testing/FakeDataFetcher";
import { FipsSpec, NC, AL, USA } from "./TestUtils";
import {
  WHITE_NH,
  ASIAN_NH,
  ALL,
  RACE,
  DemographicGroup,
} from "../utils/Constants";
import { MetricId } from "../config/MetricConfig";

const METRIC_IDS: MetricId[] = [
  "diabetes_per_100k",
  "diabetes_pct_share",
  "copd_pct_share",
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

  const consumedDatasetIds = ["uhc_data-race_and_ethnicity", acsDatasetId];

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
  breakdownName: BreakdownVar,
  breakdownValue: DemographicGroup,
  copd_per_100k: number,
  diabetes_per_100k: number,
  copd_pct_share: number,
  diabetes_pct_share: number
) {
  return {
    [breakdownName]: breakdownValue,
    fips: fips.code,
    fips_name: fips.name,
    diabetes_per_100k: diabetes_per_100k,
    copd_pct_share: copd_pct_share,
    diabetes_pct_share: diabetes_pct_share,
  };
}

function stateRow(
  fips: FipsSpec,
  breakdownName: BreakdownVar,
  breakdownValue: DemographicGroup,
  copd_per_100k: number,
  diabetes_per_100k: number,
  depression_per_100k: number,
  excessive_drinking_per_100k: number,
  frequent_mental_distress_per_100k: number,
  illicit_opioid_use_per_100k: number,
  non_medical_drug_use_per_100k: number,
  suicide_per_100k: number,
  population: number
) {
  return [
    {
      [breakdownName]: breakdownValue,
      state_fips: fips.code,
      state_name: fips.name,
      copd_per_100k,
      diabetes_per_100k,
      depression_per_100k,
      excessive_drinking_per_100k,
      frequent_mental_distress_per_100k,
      illicit_opioid_use_per_100k,
      non_medical_drug_use_per_100k,
      suicide_per_100k,
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
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap);
  });

  test("State and Race Breakdown", async () => {
    const [AL_ASIAN_ROW, AL_ACS_ASIAN_ROW] = stateRow(
      /*fips=*/ AL,
      /*breakdownName=*/ RACE,
      /*breakdownValue=*/ ASIAN_NH,
      /*copd_per_100k=*/ 10_000,
      /*diabetes_per_100k=*/ 10_000,
      /* depression_per_100k */ 10_000,
      /* excessive_drinking_per_100k */ 10_000,
      /* frequent_mental_distress_per_100k */ 10_000,
      /* illicit_opioid_use_per_100k */ 10_000,
      /* non_medical_drug_use_per_100k */ 10_000,
      /* suicide_per_100k */ 10,
      /*population=*/ 1000
    );

    const [NC_ASIAN_ROW, NC_ACS_ASIAN_ROW] = stateRow(
      /*fips=*/ NC,
      /*breakdownName=*/ RACE,
      /*breakdownValue=*/ ASIAN_NH,
      /*copd_per_100k=*/ 15_000,
      /*diabetes_per_100k=*/ 15_000,
      /* depression_per_100k */ 15_000,
      /* excessive_drinking_per_100k */ 15_000,
      /* frequent_mental_distress_per_100k */ 15_000,
      /* illicit_opioid_use_per_100k */ 15_000,
      /* non_medical_drug_use_per_100k */ 15_000,
      /* suicide_per_100k */ 15,
      /*population=*/ 1_000
    );

    const [NC_WHITE_ROW, NC_ACS_WHITE_ROW] = stateRow(
      /*fips=*/ NC,
      /*breakdownName=*/ RACE,
      /*breakdownValue=*/ WHITE_NH,
      /*copd_per_100k=*/ 25_000,
      /*diabetes_per_100k=*/ 25_000,
      /* depression_per_100k */ 25_000,
      /* excessive_drinking_per_100k */ 25_000,
      /* frequent_mental_distress_per_100k */ 25_000,
      /* illicit_opioid_use_per_100k */ 25_000,
      /* non_medical_drug_use_per_100k */ 25_000,
      /* suicide_per_100k */ 25,
      /*population=*/ 1_000
    );

    const [NC_ALL_ROW, NC_ACS_ALL_ROW] = stateRow(
      /*fips=*/ NC,
      /*breakdownName=*/ RACE,
      /*breakdownValue=*/ ALL,
      /*copd_per_100k=*/ 20_000,
      /*diabetes_per_100k=*/ 20_000,
      /* depression_per_100k */ 20_000,
      /* excessive_drinking_per_100k */ 20_000,
      /* frequent_mental_distress_per_100k */ 20_000,
      /* illicit_opioid_use_per_100k */ 20_000,
      /* non_medical_drug_use_per_100k */ 20_000,
      /* suicide_per_100k */ 20,
      /*population=*/ 5_000
    );

    const rawData = [AL_ASIAN_ROW, NC_ASIAN_ROW, NC_WHITE_ROW, NC_ALL_ROW];

    const rawAcsData = [
      AL_ACS_ASIAN_ROW,
      NC_ACS_ASIAN_ROW,
      NC_ACS_WHITE_ROW,
      NC_ACS_ALL_ROW,
    ];

    // Create final rows with diabetes_count & diabetes_per_100k
    const NC_ASIAN_FINAL = finalRow(
      /*fips*/ NC,
      /*breakdownName*/ RACE,
      /*breakdownValue*/ ASIAN_NH,
      /*copd_per_100k*/ 20000,
      /*diabetes_per_100k*/ 15000,
      /*copd_pct_share*/ 15,
      /*diabetes_pct_share*/ 15
    );
    const NC_WHITE_FINAL = finalRow(
      NC,
      RACE,
      WHITE_NH,
      /*copd_per_100k*/ 50000,
      /*diabetes_per_100k*/ 25000,
      /*copd_pct_share*/ 25,
      /*diabetes_pct_share*/ 25
    );

    // * ALL should be 100% share
    const NC_ALL_FINAL = finalRow(
      NC,
      RACE,
      ALL,
      /*copd_per_100k*/ 35000,
      /*diabetes_per_100k*/ 20000,
      /*copd_pct_share*/ 100,
      /*diabetes_pct_share*/ 100
    );

    await evaluateWithAndWithoutAll(
      "uhc_data-race_and_ethnicity",
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
    const [USA_ASIAN_ROW, USA_ACS_ASIAN_ROW] = stateRow(
      USA,
      RACE,
      ASIAN_NH,
      /*copd_per_100k=*/ 10_000,
      /*diabetes_per_100k=*/ 10_000,
      /* depression_per_100k */ 10_000,
      /* excessive_drinking_per_100k */ 10_000,
      /* frequent_mental_distress_per_100k */ 10_000,
      /* illicit_opioid_use_per_100k */ 10_000,
      /* non_medical_drug_use_per_100k */ 10_000,
      /* suicide_per_100k */ 10,
      /*population=*/ 100_000
    );

    const [USA_WHITE_ROW, USA_ACS_WHITE_ROW] = stateRow(
      USA,
      RACE,
      WHITE_NH,
      /*copd_per_100k=*/ 30_000,
      /*diabetes_per_100k=*/ 30_000,
      /* depression_per_100k */ 30_000,
      /* excessive_drinking_per_100k */ 30_000,
      /* frequent_mental_distress_per_100k */ 30_000,
      /* illicit_opioid_use_per_100k */ 30_000,
      /* non_medical_drug_use_per_100k */ 30_000,
      /* suicide_per_100k */ 30,
      /*population=*/ 100_000
    );

    const [USA_ALL_ROW, USA_ACS_ALL_ROW] = stateRow(
      USA,
      RACE,
      ALL,
      /*copd_per_100k=*/ 10_000,
      /*diabetes_per_100k=*/ 10_000,
      /* depression_per_100k */ 10_000,
      /* excessive_drinking_per_100k */ 10_000,
      /* frequent_mental_distress_per_100k */ 10_000,
      /* illicit_opioid_use_per_100k */ 10_000,
      /* non_medical_drug_use_per_100k */ 10_000,
      /* suicide_per_100k */ 10,
      /*population=*/ 500_000
    );

    const rawData = [USA_ALL_ROW, USA_ASIAN_ROW, USA_WHITE_ROW];

    const rawAcsData = [USA_ACS_WHITE_ROW, USA_ACS_ALL_ROW, USA_ACS_ASIAN_ROW];

    // Create final rows with diabetes_count & diabetes_per_100k
    const ASIAN_FINAL = finalRow(
      USA,
      RACE,
      ASIAN_NH,
      /*copd_per_100k*/ 10000,
      /*diabetes_per_100k*/ 10000,
      /*copd_pct_share*/ 20,
      /*diabetes_pct_share*/ 20
    );
    const WHITE_FINAL = finalRow(
      USA,
      RACE,
      WHITE_NH,
      /*copd_per_100k*/ 20000,
      /*diabetes_per_100k*/ 30000,
      /*copd_pct_share*/ 60,
      /*diabetes_pct_share*/ 60
    );

    // * ALL should be 100% share
    const ALL_FINAL = finalRow(
      USA,
      RACE,
      ALL,
      /*copd_per_100k*/ 15000,
      /*diabetes_per_100k*/ 10000,
      /*copd_pct_share*/ 100,
      /*diabetes_pct_share*/ 100
    );

    await evaluateWithAndWithoutAll(
      "uhc_data-race_and_ethnicity",
      rawData,
      "acs_population-by_race_state_std",
      rawAcsData,
      Breakdowns.national(),
      RACE,
      [ASIAN_FINAL, WHITE_FINAL],
      [ALL_FINAL, ASIAN_FINAL, WHITE_FINAL]
    );
  });
});
