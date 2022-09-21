import { METRIC_CONFIG, VariableConfig } from "../config/MetricConfig";
import { BreakdownVar } from "../query/Breakdowns";
import { getExclusionList } from "./datasetutils";
import { Fips } from "./Fips";

describe("DatasetUtils Unit Tests", () => {
  test("Test getExclusionList()", async () => {
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
      "Two or more races & Unrepresented race (Non-Hispanic)",
      "Asian, Native Hawaiian, and Pacific Islander (Non-Hispanic)",
    ];
    const sampleExclusionListPrisonRaceUSA = getExclusionList(
      sampleVariableConfigPrisonRaceUSA,
      sampleBreakdownPrisonRaceUSA,
      sampleFipsPrisonRaceUSA
    );
    expect(sampleExclusionListPrisonRaceUSA).toEqual(
      expectedExclusionListPrisonRaceUSA
    );

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
