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
import { WHITE_NH, ASIAN_NH, ALL, RACE } from "../utils/Constants";
import { MetricId } from "../config/MetricConfig";

const METRIC_IDS: MetricId[] = [
  "copd_per_100k",
  "diabetes_per_100k",
  "depression_per_100k",
  "excessive_drinking_per_100k",
  "frequent_mental_distress_per_100k",
  "illicit_opioid_use_per_100k",
  "non_medical_drug_use_per_100k",
  "suicide_per_100k",
  "copd_pct_share",
  "diabetes_pct_share",
  "depression_pct_share",
  "excessive_drinking_pct_share",
  "frequent_mental_distress_pct_share",
  "illicit_opioid_use_pct_share",
  "non_medical_drug_use_pct_share",
  "suicide_pct_share",
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
  breakdownName: string,
  breakdownValue: string,
  copd_per_100k: number,
  diabetes_per_100k: number,
  depression_per_100k: number,
  excessive_drinking_per_100k: number,
  frequent_mental_distress_per_100k: number,
  illicit_opioid_use_per_100k: number,
  non_medical_drug_use_per_100k: number,
  suicide_per_100k: number,
  copd_pct_share: number,
  diabetes_pct_share: number,
  depression_pct_share: number,
  excessive_drinking_pct_share: number,
  frequent_mental_distress_pct_share: number,
  illicit_opioid_use_pct_share: number,
  non_medical_drug_use_pct_share: number,
  suicide_pct_share: number
) {
  return {
    [breakdownName]: breakdownValue,
    fips: fips.code,
    fips_name: fips.name,
    copd_per_100k,
    diabetes_per_100k,
    depression_per_100k,
    excessive_drinking_per_100k,
    frequent_mental_distress_per_100k,
    illicit_opioid_use_per_100k,
    non_medical_drug_use_per_100k,
    suicide_per_100k,
    copd_pct_share,
    diabetes_pct_share,
    depression_pct_share,
    excessive_drinking_pct_share,
    frequent_mental_distress_pct_share,
    illicit_opioid_use_pct_share,
    non_medical_drug_use_pct_share,
    suicide_pct_share,
  };
}

function stateRow(
  fips: FipsSpec,
  breakdownName: string,
  breakdownValue: string,
  copd_pct: number,
  diabetes_pct: number,
  depression_pct: number,
  excessive_drinking_pct: number,
  frequent_mental_distress_pct: number,
  illicit_opioid_use_pct: number,
  non_medical_drug_use_pct: number,
  suicide_pct: number,
  population: number
) {
  return [
    {
      [breakdownName]: breakdownValue,
      state_fips: fips.code,
      state_name: fips.name,
      copd_pct,
      diabetes_pct,
      depression_pct,
      excessive_drinking_pct,
      frequent_mental_distress_pct,
      illicit_opioid_use_pct,
      non_medical_drug_use_pct,
      suicide_pct,
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
      /*copd_pct=*/ 10,
      /*diabetes_pct=*/ 10,
      /* depression_pct */ 10,
      /* excessive_drinking_pct */ 10,
      /* frequent_mental_distress_pct */ 10,
      /* illicit_opioid_use_pct */ 10,
      /* non_medical_drug_use_pct */ 10,
      /* suicide_pct */ 10,
      /*population=*/ 1000
    );

    const [NC_ASIAN_ROW, NC_ACS_ASIAN_ROW] = stateRow(
      /*fips=*/ NC,
      /*breakdownName=*/ RACE,
      /*breakdownValue=*/ ASIAN_NH,
      /*copd_pct=*/ 20,
      /*diabetes_pct=*/ 20,
      /* depression_pct */ 20,
      /* excessive_drinking_pct */ 20,
      /* frequent_mental_distress_pct */ 20,
      /* illicit_opioid_use_pct */ 20,
      /* non_medical_drug_use_pct */ 20,
      /* suicide_pct */ 20,
      /*population=*/ 1000
    );

    const [NC_WHITE_ROW, NC_ACS_WHITE_ROW] = stateRow(
      /*fips=*/ NC,
      /*breakdownName=*/ RACE,
      /*breakdownValue=*/ WHITE_NH,
      /*copd_pct=*/ 50,
      /*diabetes_pct=*/ 50,
      /* depression_pct */ 50,
      /* excessive_drinking_pct */ 50,
      /* frequent_mental_distress_pct */ 50,
      /* illicit_opioid_use_pct */ 50,
      /* non_medical_drug_use_pct */ 50,
      /* suicide_pct */ 50,
      /*population=*/ 1000
    );

    const [NC_ALL_ROW, NC_ACS_ALL_ROW] = stateRow(
      /*fips=*/ NC,
      /*breakdownName=*/ RACE,
      /*breakdownValue=*/ ALL,
      /*copd_pct=*/ 50,
      /*diabetes_pct=*/ 50,
      /* depression_pct */ 50,
      /* excessive_drinking_pct */ 50,
      /* frequent_mental_distress_pct */ 50,
      /* illicit_opioid_use_pct */ 50,
      /* non_medical_drug_use_pct */ 50,
      /* suicide_pct */ 50,
      /*population=*/ 2000
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
      /*diabetes_per_100k*/ 20000,
      /* depression_per_100k */ 20000,
      /* excessive_drinking_per_100k */ 20000,
      /* frequent_mental_distress_per_100k */ 20000,
      /* illicit_opioid_use_per_100k */ 20000,
      /* non_medical_drug_use_per_100k */ 20000,
      /* suicide_per_100k */ 20000,
      /*copd_pct_share*/ 28.6,
      /*diabetes_pct_share*/ 44.4,
      /* depression_pct_share */ 1,
      /* excessive_drinking_pct_share */ 1,
      /* frequent_mental_distress_pct_share */ 1,
      /* illicit_opioid_use_pct_share */ 1,
      /* non_medical_drug_use_pct_share */ 1,
      /* suicide_pct_share */ 1
    );
    const NC_WHITE_FINAL = finalRow(
      NC,
      RACE,
      WHITE_NH,
      /*copd_per_100k*/ 50000,
      /*diabetes_per_100k*/ 50000,
      /* depression_per_100k */ 50000,
      /* excessive_drinking_per_100k */ 50000,
      /* frequent_mental_distress_per_100k */ 50000,
      /* illicit_opioid_use_per_100k */ 50000,
      /* non_medical_drug_use_per_100k */ 50000,
      /* suicide_per_100k */ 50000,
      /*copd_pct_share*/ 71.4,
      /*diabetes_pct_share*/ 55.6,
      /* depression_pct_share */ 1,
      /* excessive_drinking_pct_share */ 1,
      /* frequent_mental_distress_pct_share */ 1,
      /* illicit_opioid_use_pct_share */ 1,
      /* non_medical_drug_use_pct_share */ 1,
      /* suicide_pct_share */ 1
    );
    const NC_ALL_FINAL = finalRow(
      NC,
      RACE,
      ALL,
      /*copd_per_100k*/ 1,
      /*diabetes_per_100k*/ 1,
      /* depression_per_100k */ 1,
      /* excessive_drinking_per_100k */ 1,
      /* frequent_mental_distress_per_100k */ 1,
      /* illicit_opioid_use_per_100k */ 1,
      /* non_medical_drug_use_per_100k */ 1,
      /* suicide_per_100k */ 1,
      /*copd_pct_share*/ 1,
      /*diabetes_pct_share*/ 1,
      /* depression_pct_share */ 1,
      /* excessive_drinking_pct_share */ 1,
      /* frequent_mental_distress_pct_share */ 1,
      /* illicit_opioid_use_pct_share */ 1,
      /* non_medical_drug_use_pct_share */ 1,
      /* suicide_pct_share */ 1
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
      /*copd_pct=*/ 10,
      /*diabetes_pct=*/ 10,
      /* depression_pct */ 10,
      /* excessive_drinking_pct */ 10,
      /* frequent_mental_distress_pct */ 10,
      /* illicit_opioid_use_pct */ 10,
      /* non_medical_drug_use_pct */ 10,
      /* suicide_pct */ 10,
      /*population=*/ 1000000
    );

    const [USA_WHITE_ROW, USA_ACS_WHITE_ROW] = stateRow(
      USA,
      RACE,
      WHITE_NH,
      /*copd_pct=*/ 20,
      /*diabetes_pct=*/ 20,
      /* depression_pct */ 20,
      /* excessive_drinking_pct */ 20,
      /* frequent_mental_distress_pct */ 20,
      /* illicit_opioid_use_pct */ 20,
      /* non_medical_drug_use_pct */ 20,
      /* suicide_pct */ 20,
      /*population=*/ 1000000
    );

    const [USA_ALL_ROW, USA_ACS_ALL_ROW] = stateRow(
      USA,
      RACE,
      ALL,
      /*copd_pct=*/ 50,
      /*diabetes_pct=*/ 50,
      /* depression_pct */ 50,
      /* excessive_drinking_pct */ 50,
      /* frequent_mental_distress_pct */ 50,
      /* illicit_opioid_use_pct */ 50,
      /* non_medical_drug_use_pct */ 50,
      /* suicide_pct */ 50,
      /*population=*/ 2000000
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
      /* depression_per_100k */ 10000,
      /* excessive_drinking_per_100k */ 10000,
      /* frequent_mental_distress_per_100k */ 10000,
      /* illicit_opioid_use_per_100k */ 10000,
      /* non_medical_drug_use_per_100k */ 10000,
      /* suicide_per_100k */ 10000,
      /*copd_pct_share*/ 1,
      /*diabetes_pct_share*/ 1,
      /* depression_pct_share */ 1,
      /* excessive_drinking_pct_share */ 1,
      /* frequent_mental_distress_pct_share */ 1,
      /* illicit_opioid_use_pct_share */ 1,
      /* non_medical_drug_use_pct_share */ 1,
      /* suicide_pct_share */ 1
    );
    const WHITE_FINAL = finalRow(
      USA,
      RACE,
      WHITE_NH,
      /*copd_per_100k*/ 20000,
      /*diabetes_per_100k*/ 20000,
      /* depression_per_100k */ 20000,
      /* excessive_drinking_per_100k */ 20000,
      /* frequent_mental_distress_per_100k */ 20000,
      /* illicit_opioid_use_per_100k */ 20000,
      /* non_medical_drug_use_per_100k */ 20000,
      /* suicide_per_100k */ 20000,
      /*copd_pct_share*/ 1,
      /*diabetes_pct_share*/ 1,
      /* depression_pct_share */ 1,
      /* excessive_drinking_pct_share */ 1,
      /* frequent_mental_distress_pct_share */ 1,
      /* illicit_opioid_use_pct_share */ 1,
      /* non_medical_drug_use_pct_share */ 1,
      /* suicide_pct_share */ 1
    );
    const ALL_FINAL = finalRow(
      USA,
      RACE,
      ALL,
      /*copd_per_100k*/ 50000,
      /*diabetes_per_100k*/ 50000,
      /* depression_per_100k */ 50000,
      /* excessive_drinking_per_100k */ 50000,
      /* frequent_mental_distress_per_100k */ 50000,
      /* illicit_opioid_use_per_100k */ 50000,
      /* non_medical_drug_use_per_100k */ 50000,
      /* suicide_per_100k */ 50000,
      /*copd_pct_share*/ 1,
      /*diabetes_pct_share*/ 1,
      /* depression_pct_share */ 1,
      /* excessive_drinking_pct_share */ 1,
      /* frequent_mental_distress_pct_share */ 1,
      /* illicit_opioid_use_pct_share */ 1,
      /* non_medical_drug_use_pct_share */ 1,
      /* suicide_pct_share */ 1
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
