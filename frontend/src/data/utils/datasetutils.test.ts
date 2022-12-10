import {
  MetricId,
  METRIC_CONFIG,
  VariableConfig,
} from "../config/MetricConfig";
import { Breakdowns, BreakdownVar } from "../query/Breakdowns";
import {
  appendFipsIfNeeded,
  getExclusionList,
  getExtremeValues,
} from "./datasetutils";
import { Fips } from "./Fips";

describe("DatasetUtils.getExtremeValues() Unit Tests", () => {
  const data = [
    { some_condition: 0 },
    { some_condition: 0 },
    { some_condition: 0 },
    { some_condition: 3 },
    { some_condition: 4 },
    { some_condition: 5 },
    { some_condition: 6 },
    { some_condition: 7 },
    { some_condition: 8 },
    { some_condition: 10 },
    { some_condition: 10 },
  ];

  test("No Ties", async () => {
    const [hi, lo] = getExtremeValues(data, "some_condition" as MetricId, 5);
    expect(hi).toEqual([
      { some_condition: 10 },
      { some_condition: 10 },
      { some_condition: 8 },
      { some_condition: 7 },
      { some_condition: 6 },
    ]);
    expect(lo).toEqual([
      { some_condition: 0 },
      { some_condition: 0 },
      { some_condition: 0 },
      { some_condition: 3 },
      { some_condition: 4 },
    ]);
  });

  test("Tied Lowest more than listsize and Highest ", async () => {
    const [hi, lo] = getExtremeValues(data, "some_condition" as MetricId, 2);
    expect(hi).toEqual([{ some_condition: 10 }, { some_condition: 10 }]);
    expect(lo).toEqual([
      { some_condition: 0 },
      { some_condition: 0 },
      { some_condition: 0 },
    ]);
  });

  const dataOverlap = [
    { some_condition: 1 },
    { some_condition: 1 },
    { some_condition: 1 },
    { some_condition: 999 },
  ];

  test("Overlapping highest and lowest aren't repeated", async () => {
    const [hi, lo] = getExtremeValues(
      dataOverlap,
      "some_condition" as MetricId,
      2
    );
    console.log({ hi }, { lo });
    expect(hi).toEqual([{ some_condition: 999 }]);
    expect(lo).toEqual([
      { some_condition: 1 },
      { some_condition: 1 },
      { some_condition: 1 },
    ]);
  });
});

describe("DatasetUtils.appendFipsIfNeeded() Unit Tests", () => {
  // Only county-level breakdowns should get the appended parent fips
  const base_id = "base_dataset_id";

  test("County Level", async () => {
    const breakdowns_for_county = Breakdowns.forFips(new Fips("06037"));
    const generated_county_set_id = appendFipsIfNeeded(
      base_id,
      breakdowns_for_county
    );
    expect(generated_county_set_id).toEqual(base_id + "-06");
  });

  test("State Level", async () => {
    const breakdowns_for_state = Breakdowns.forFips(new Fips("06"));
    const generated_state_set_id = appendFipsIfNeeded(
      base_id,
      breakdowns_for_state
    );
    expect(generated_state_set_id).toEqual(base_id);
  });

  test("National Level", async () => {
    const breakdowns_for_USA = Breakdowns.forFips(new Fips("00"));
    const generated_USA_set_id = appendFipsIfNeeded(
      base_id,
      breakdowns_for_USA
    );
    expect(generated_USA_set_id).toEqual(base_id);
  });
});

describe("DatasetUtils.getExclusionList() Tests", () => {
  test("Prison by Race in USA Exclusions", async () => {
    const sampleVariableConfigPrisonRaceUSA: VariableConfig =
      METRIC_CONFIG.incarceration[0];
    const sampleBreakdownPrisonRaceUSA: BreakdownVar = "race_and_ethnicity";
    const sampleFipsPrisonRaceUSA: Fips = new Fips("00");
    const expectedExclusionListPrisonRaceUSA = [
      "Unknown",
      "Unknown ethnicity",
      "Unknown race",
      "Not Hispanic or Latino",
      "American Indian and Alaska Native",
      "Asian",
      "Black or African American",
      "Native Hawaiian and Pacific Islander",
      "Two or more races",
      "White",
      "Unrepresented race",
      "Two or more races & Unrepresented race",
      "Two or more races & Unrepresented race (NH)",
      "Asian, Native Hawaiian, and Pacific Islander (NH)",
    ];
    const sampleExclusionListPrisonRaceUSA = getExclusionList(
      sampleVariableConfigPrisonRaceUSA,
      sampleBreakdownPrisonRaceUSA,
      sampleFipsPrisonRaceUSA
    );
    expect(sampleExclusionListPrisonRaceUSA).toEqual(
      expectedExclusionListPrisonRaceUSA
    );
  });
  test("Diabetes by Sex in AL Exclusions", async () => {
    const sampleVariableConfigDiabetesSexAlabama: VariableConfig =
      METRIC_CONFIG.diabetes[0];
    const sampleBreakdownDiabetesSexAlabama: BreakdownVar = "sex";
    const sampleFipsDiabetesSexAlabama: Fips = new Fips("01");
    const expectedExclusionListDiabetesSexAlabama = [
      "Unknown",
      "Unknown ethnicity",
      "Unknown race",
      "All",
    ];
    const sampleExclusionListDiabetesSexAlabama = getExclusionList(
      sampleVariableConfigDiabetesSexAlabama,
      sampleBreakdownDiabetesSexAlabama,
      sampleFipsDiabetesSexAlabama
    );
    expect(sampleExclusionListDiabetesSexAlabama).toEqual(
      expectedExclusionListDiabetesSexAlabama
    );
  });
});
