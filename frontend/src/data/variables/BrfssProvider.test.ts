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
  "copd_per_100k",
  "copd_pct_share",
  "diabetes_per_100k",
  "diabetes_pct_share",
  "depression_per_100k",
  "depression_pct_share",
  "excessive_drinking_per_100k",
  "excessive_drinking_pct_share",
  "frequent_mental_distress_per_100k",
  "frequent_mental_distress_pct_share",
  "illicit_opioid_use_per_100k",
  "illicit_opioid_use_pct_share",
  "non_medical_drug_use_per_100k",
  "non_medical_drug_use_pct_share",
  "suicide_per_100k",
  "suicide_pct_share",
  "asthma_per_100k",
  "asthma_pct_share",
  "cardiovascular_diseases_per_100k",
  "cardiovascular_diseases_pct_share",
  "chronic_kidney_disease_per_100k",
  "chronic_kidney_disease_pct_share",
  "avoided_care_per_100k",
  "avoided_care_pct_share",
  "preventable_hospitalizations_per_100k",
  "preventable_hospitalizations_pct_share",
  "voter_participation_per_100k",
  "voter_participation_pct_share",
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
  depression_per_100k: number,
  excessive_drinking_per_100k: number,
  frequent_mental_distress_per_100k: number,
  illicit_opioid_use_per_100k: number,
  non_medical_drug_use_per_100k: number,
  suicide_per_100k: number,
  asthma_per_100k: number,
  cardiovascular_diseases_per_100k: number,
  chronic_kidney_disease_per_100k: number,
  avoided_care_per_100k: number,
  preventable_hospitalizations_per_100k: number,
  voter_participation_per_100k: number,
  copd_pct_share: number,
  diabetes_pct_share: number,
  depression_pct_share: number,
  excessive_drinking_pct_share: number,
  frequent_mental_distress_pct_share: number,
  illicit_opioid_use_pct_share: number,
  non_medical_drug_use_pct_share: number,
  suicide_pct_share: number,
  asthma_pct_share: number,
  cardiovascular_diseases_pct_share: number,
  chronic_kidney_disease_pct_share: number,
  avoided_care_pct_share: number,
  preventable_hospitalizations_pct_share: number,
  voter_participation_pct_share: number
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
    asthma_per_100k,
    cardiovascular_diseases_per_100k,
    chronic_kidney_disease_per_100k,
    avoided_care_per_100k,
    preventable_hospitalizations_per_100k,
    voter_participation_per_100k,
    copd_pct_share,
    diabetes_pct_share,
    depression_pct_share,
    excessive_drinking_pct_share,
    frequent_mental_distress_pct_share,
    illicit_opioid_use_pct_share,
    non_medical_drug_use_pct_share,
    suicide_pct_share,
    asthma_pct_share,
    cardiovascular_diseases_pct_share,
    chronic_kidney_disease_pct_share,
    avoided_care_pct_share,
    preventable_hospitalizations_pct_share,
    voter_participation_pct_share,
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
  asthma_per_100k: number,
  cardiovascular_diseases_per_100k: number,
  chronic_kidney_disease_per_100k: number,
  avoided_care_per_100k: number,
  preventable_hospitalizations_per_100k: number,
  voter_participation_per_100k: number,
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
      asthma_per_100k,
      cardiovascular_diseases_per_100k,
      chronic_kidney_disease_per_100k,
      avoided_care_per_100k,
      preventable_hospitalizations_per_100k,
      voter_participation_per_100k,
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
      /* asthma_per_100k, */ 10_000,
      /* cardiovascular_diseases_per_100k, */ 10_000,
      /* chronic_kidney_disease_per_100k, */ 10_000,
      /* avoided_care_per_100k, */ 10_000,
      /* preventable_hospitalizations_per_100k, */ 10_000,
      /* voter_participation_per_100k, */ 10_000,
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
      /* suicide_per_100k */ 15_000,
      /* asthma_per_100k, */ 15_000,
      /* cardiovascular_diseases_per_100k, */ 15_000,
      /* chronic_kidney_disease_per_100k, */ 15_000,
      /* avoided_care_per_100k, */ 15_000,
      /* preventable_hospitalizations_per_100k, */ 15_000,
      /* voter_participation_per_100k, */ 15_000,
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
      /* suicide_per_100k */ 25_000,
      /* asthma_per_100k, */ 25_000,
      /* cardiovascular_diseases_per_100k, */ 25_000,
      /* chronic_kidney_disease_per_100k, */ 25_000,
      /* avoided_care_per_100k, */ 25_000,
      /* preventable_hospitalizations_per_100k, */ 25_000,
      /* voter_participation_per_100k, */ 25_000,
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
      /* suicide_per_100k */ 20_000,
      /* asthma_per_100k, */ 20_000,
      /* cardiovascular_diseases_per_100k, */ 20_000,
      /* chronic_kidney_disease_per_100k, */ 20_000,
      /* avoided_care_per_100k, */ 20_000,
      /* preventable_hospitalizations_per_100k, */ 20_000,
      /* voter_participation_per_100k, */ 20_000,
      /*population=*/ 5_000
    );

    const rawData = [AL_ASIAN_ROW, NC_ASIAN_ROW, NC_WHITE_ROW, NC_ALL_ROW];

    const rawAcsData = [
      AL_ACS_ASIAN_ROW,
      NC_ACS_ASIAN_ROW,
      NC_ACS_WHITE_ROW,
      NC_ACS_ALL_ROW,
    ];

    // Create final rows
    const NC_ASIAN_FINAL = finalRow(
      /*fips*/ NC,
      /*breakdownName*/ RACE,
      /*breakdownValue*/ ASIAN_NH,
      /*copd_per_100k*/ 15_000,
      /*diabetes_per_100k*/ 15_000,
      /* depression_per_100k */ 15_000,
      /* excessive_drinking_per_100k */ 15_000,
      /* frequent_mental_distress_per_100k */ 15_000,
      /* illicit_opioid_use_per_100k */ 15_000,
      /* non_medical_drug_use_per_100k */ 15_000,
      /* suicide_per_100k */ 15_000,
      /* asthma_per_100k, */ 15_000,
      /* cardiovascular_diseases_per_100k, */ 15_000,
      /* chronic_kidney_disease_per_100k, */ 15_000,
      /* avoided_care_per_100k, */ 15_000,
      /* preventable_hospitalizations_per_100k, */ 15_000,
      /* voter_participation_per_100k, */ 15_000,

      /*copd_pct_share*/ 15,
      /*diabetes_pct_share*/ 15,
      /* depression_pct_share */ 15,
      /* excessive_drinking_pct_share */ 15,
      /* frequent_mental_distress_pct_share */ 15,
      /* illicit_opioid_use_pct_share */ 15,
      /* non_medical_drug_use_pct_share */ 15,
      /* suicide_pct_share */ 15,
      /* asthma_pct_share, */ 15,
      /* cardiovascular_diseases_pct_share, */ 15,
      /* chronic_kidney_disease_pct_share, */ 15,
      /* avoided_care_pct_share, */ 15,
      /* preventable_hospitalizations_pct_share, */ 15,
      /* voter_participation_pct_share, */ 15
    );
    const NC_WHITE_FINAL = finalRow(
      NC,
      RACE,
      WHITE_NH,
      /*copd_per_100k*/ 25_000,
      /*diabetes_per_100k*/ 25_000,
      /* depression_per_100k */ 25_000,
      /* excessive_drinking_per_100k */ 25_000,
      /* frequent_mental_distress_per_100k */ 25_000,
      /* illicit_opioid_use_per_100k */ 25_000,
      /* non_medical_drug_use_per_100k */ 25_000,
      /* suicide_per_100k */ 25_000,
      /* asthma_per_100k, */ 25_000,
      /* cardiovascular_diseases_per_100k, */ 25_000,
      /* chronic_kidney_disease_per_100k, */ 25_000,
      /* avoided_care_per_100k, */ 25_000,
      /* preventable_hospitalizations_per_100k, */ 25_000,
      /* voter_participation_per_100k, */ 25_000,

      /*copd_pct_share*/ 25,
      /*diabetes_pct_share*/ 25,
      /* depression_pct_share */ 25,
      /* excessive_drinking_pct_share */ 25,
      /* frequent_mental_distress_pct_share */ 25,
      /* illicit_opioid_use_pct_share */ 25,
      /* non_medical_drug_use_pct_share */ 25,
      /* suicide_pct_share */ 25,
      /* asthma_pct_share, */ 25,
      /* cardiovascular_diseases_pct_share, */ 25,
      /* chronic_kidney_disease_pct_share, */ 25,
      /* avoided_care_pct_share, */ 25,
      /* preventable_hospitalizations_pct_share, */ 25,
      /* voter_participation_pct_share, */ 25
    );

    // * ALL should be 100% share
    const NC_ALL_FINAL = finalRow(
      NC,
      RACE,
      ALL,
      /*copd_per_100k*/ 20_000,
      /*diabetes_per_100k*/ 20_000,
      /* depression_per_100k */ 20_000,
      /* excessive_drinking_per_100k */ 20_000,
      /* frequent_mental_distress_per_100k */ 20_000,
      /* illicit_opioid_use_per_100k */ 20_000,
      /* non_medical_drug_use_per_100k */ 20_000,
      /* suicide_per_100k */ 20_000,
      /* asthma_per_100k, */ 20_000,
      /* cardiovascular_diseases_per_100k, */ 20_000,
      /* chronic_kidney_disease_per_100k, */ 20_000,
      /* avoided_care_per_100k, */ 20_000,
      /* preventable_hospitalizations_per_100k, */ 20_000,
      /* voter_participation_per_100k, */ 20_000,

      /*copd_pct_share*/ 100,
      /*diabetes_pct_share*/ 100,
      /* depression_pct_share */ 100,
      /* excessive_drinking_pct_share */ 100,
      /* frequent_mental_distress_pct_share */ 100,
      /* illicit_opioid_use_pct_share */ 100,
      /* non_medical_drug_use_pct_share */ 100,
      /* suicide_pct_share */ 100,
      /* asthma_pct_share, */ 100,
      /* cardiovascular_diseases_pct_share, */ 100,
      /* chronic_kidney_disease_pct_share, */ 100,
      /* avoided_care_pct_share, */ 100,
      /* preventable_hospitalizations_pct_share, */ 100,
      /* voter_participation_pct_share, */ 100
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
      /* suicide_per_100k */ 10_000,
      /* asthma_per_100k, */ 10_000,
      /* cardiovascular_diseases_per_100k, */ 10_000,
      /* chronic_kidney_disease_per_100k, */ 10_000,
      /* avoided_care_per_100k, */ 10_000,
      /* preventable_hospitalizations_per_100k, */ 10_000,
      /* voter_participation_per_100k, */ 10_000,
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
      /* suicide_per_100k */ 30_000,
      /* asthma_per_100k, */ 30_000,
      /* cardiovascular_diseases_per_100k, */ 30_000,
      /* chronic_kidney_disease_per_100k, */ 30_000,
      /* avoided_care_per_100k, */ 30_000,
      /* preventable_hospitalizations_per_100k, */ 30_000,
      /* voter_participation_per_100k, */ 30_000,
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
      /* suicide_per_100k */ 10_000,
      /* asthma_per_100k, */ 10_000,
      /* cardiovascular_diseases_per_100k, */ 10_000,
      /* chronic_kidney_disease_per_100k, */ 10_000,
      /* avoided_care_per_100k, */ 10_000,
      /* preventable_hospitalizations_per_100k, */ 10_000,
      /* voter_participation_per_100k, */ 10_000,
      /*population=*/ 500_000
    );

    const rawData = [USA_ALL_ROW, USA_ASIAN_ROW, USA_WHITE_ROW];

    const rawAcsData = [USA_ACS_WHITE_ROW, USA_ACS_ALL_ROW, USA_ACS_ASIAN_ROW];

    // Create final rows
    const ASIAN_FINAL = finalRow(
      USA,
      RACE,
      ASIAN_NH,
      /*copd_per_100k*/ 10_000,
      /*diabetes_per_100k*/ 10_000,
      /* depression_per_100k */ 10_000,
      /* excessive_drinking_per_100k */ 10_000,
      /* frequent_mental_distress_per_100k */ 10_000,
      /* illicit_opioid_use_per_100k */ 10_000,
      /* non_medical_drug_use_per_100k */ 10_000,
      /* suicide_per_100k */ 10_000,
      /* asthma_per_100k, */ 10_000,
      /* cardiovascular_diseases_per_100k, */ 10_000,
      /* chronic_kidney_disease_per_100k, */ 10_000,
      /* avoided_care_per_100k, */ 10_000,
      /* preventable_hospitalizations_per_100k, */ 10_000,
      /* voter_participation_per_100k, */ 10_000,

      /*copd_pct_share*/ 20,
      /*diabetes_pct_share*/ 20,
      /* depression_pct_share */ 20,
      /* excessive_drinking_pct_share */ 20,
      /* frequent_mental_distress_pct_share */ 20,
      /* illicit_opioid_use_pct_share */ 20,
      /* non_medical_drug_use_pct_share */ 20,
      /* suicide_pct_share */ 20,
      /* asthma_pct_share, */ 20,
      /* cardiovascular_diseases_pct_share, */ 20,
      /* chronic_kidney_disease_pct_share, */ 20,
      /* avoided_care_pct_share, */ 20,
      /* preventable_hospitalizations_pct_share, */ 20,
      /* voter_participation_pct_share, */ 20
    );
    const WHITE_FINAL = finalRow(
      USA,
      RACE,
      WHITE_NH,
      /*copd_per_100k*/ 30_000,
      /*diabetes_per_100k*/ 30_000,
      /* depression_per_100k */ 30_000,
      /* excessive_drinking_per_100k */ 30_000,
      /* frequent_mental_distress_per_100k */ 30_000,
      /* illicit_opioid_use_per_100k */ 30_000,
      /* non_medical_drug_use_per_100k */ 30_000,
      /* suicide_per_100k */ 30_000,
      /* asthma_per_100k, */ 30_000,
      /* cardiovascular_diseases_per_100k, */ 30_000,
      /* chronic_kidney_disease_per_100k, */ 30_000,
      /* avoided_care_per_100k, */ 30_000,
      /* preventable_hospitalizations_per_100k, */ 30_000,
      /* voter_participation_per_100k, */ 30_000,

      /*copd_pct_share*/ 60,
      /*diabetes_pct_share*/ 60,
      /* depression_pct_share */ 60,
      /* excessive_drinking_pct_share */ 60,
      /* frequent_mental_distress_pct_share */ 60,
      /* illicit_opioid_use_pct_share */ 60,
      /* non_medical_drug_use_pct_share */ 60,
      /* suicide_pct_share */ 60,
      /* asthma_pct_share, */ 60,
      /* cardiovascular_diseases_pct_share, */ 60,
      /* chronic_kidney_disease_pct_share, */ 60,
      /* avoided_care_pct_share, */ 60,
      /* preventable_hospitalizations_pct_share, */ 60,
      /* voter_participation_pct_share, */ 60
    );

    // * ALL should be 100% share
    const ALL_FINAL = finalRow(
      USA,
      RACE,
      ALL,
      /*copd_per_100k*/ 10_000,
      /*diabetes_per_100k*/ 10_000,
      /* depression_per_100k */ 10_000,
      /* excessive_drinking_per_100k */ 10_000,
      /* frequent_mental_distress_per_100k */ 10_000,
      /* illicit_opioid_use_per_100k */ 10_000,
      /* non_medical_drug_use_per_100k */ 10_000,
      /* suicide_per_100k */ 10_000,
      /* asthma_per_100k, */ 10_000,
      /* cardiovascular_diseases_per_100k, */ 10_000,
      /* chronic_kidney_disease_per_100k, */ 10_000,
      /* avoided_care_per_100k, */ 10_000,
      /* preventable_hospitalizations_per_100k, */ 10_000,
      /* voter_participation_per_100k, */ 10_000,

      /*copd_pct_share*/ 100,
      /*diabetes_pct_share*/ 100,
      /* depression_pct_share */ 100,
      /* excessive_drinking_pct_share */ 100,
      /* frequent_mental_distress_pct_share */ 100,
      /* illicit_opioid_use_pct_share */ 100,
      /* non_medical_drug_use_pct_share */ 100,
      /* suicide_pct_share */ 100,
      /* asthma_pct_share, */ 100,
      /* cardiovascular_diseases_pct_share, */ 100,
      /* chronic_kidney_disease_pct_share, */ 100,
      /* avoided_care_pct_share, */ 100,
      /* preventable_hospitalizations_pct_share, */ 100,
      /* voter_participation_pct_share, */ 100
    );

    await evaluateWithAndWithoutAll(
      "uhc_data-race_and_ethnicity",
      rawData,
      "acs_population-by_race_national",
      rawAcsData,
      Breakdowns.national(),
      RACE,
      [ASIAN_FINAL, WHITE_FINAL],
      [ALL_FINAL, ASIAN_FINAL, WHITE_FINAL]
    );
  });
});
