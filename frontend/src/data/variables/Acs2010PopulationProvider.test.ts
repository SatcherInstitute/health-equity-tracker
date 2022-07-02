import FakeDataFetcher from "../../testing/FakeDataFetcher";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import { DatasetMetadataMap } from "../config/DatasetMetadata";
import { Breakdowns, BreakdownVar } from "../query/Breakdowns";
import { createMissingDataResponse, MetricQuery } from "../query/MetricQuery";
import {
  AGE,
  ALL,
  ASIAN_NH,
  DemographicGroup,
  FEMALE,
  MALE,
  RACE,
  SEX,
  WHITE_NH,
} from "../utils/Constants";
import { Fips } from "../utils/Fips";
import Acs2010PopulationProvider from "./Acs2010PopulationProvider";
import {
  AL,
  createWithAndWithoutAllEvaluator,
  FipsSpec,
  NC,
} from "./TestUtils";

function stateRow(
  fips: FipsSpec,
  breakdownName: BreakdownVar,
  breakdownValue: DemographicGroup,
  population: number,
  population_pct: number
) {
  return {
    state_fips: fips.code,
    state_name: fips.name,
    [breakdownName]: breakdownValue,
    population: population,
    population_pct: population_pct,
  };
}

function finalPopulationCountAndPctRow(
  fips: FipsSpec,
  breakdownName: BreakdownVar,
  breakdownValue: DemographicGroup,
  population: number,
  population_pct: number
) {
  return {
    fips: fips.code,
    fips_name: fips.name,
    [breakdownName]: breakdownValue,
    population: population,
    population_pct: population_pct,
  };
}

autoInitGlobals();

const dataFetcher = getDataFetcher() as FakeDataFetcher;

const evaluatePopulationCountAndPctWithAndWithoutTotal =
  createWithAndWithoutAllEvaluator(
    ["population", "population_pct"],
    dataFetcher,
    new Acs2010PopulationProvider()
  );

describe("Acs2010PopulationProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap);
  });

  test("Invalid Breakdown", async () => {
    const acsProvider = new Acs2010PopulationProvider();

    const response = await acsProvider.getData(
      new MetricQuery(["population", "population_pct"], Breakdowns.national())
    );
    expect(response).toEqual(
      createMissingDataResponse(
        "Breakdowns not supported for provider acs_2010_pop_provider: geography:national"
      )
    );
  });

  test("State and Race Breakdown", async () => {
    const rawData = [
      stateRow(AL, RACE, ALL, 2, 100),
      stateRow(AL, RACE, ASIAN_NH, 2, 100),
      stateRow(NC, RACE, ALL, 20, 100),
      stateRow(NC, RACE, ASIAN_NH, 5, 25),
      stateRow(NC, RACE, WHITE_NH, 15, 75),
    ];

    const NC_ALL_FINAL = finalPopulationCountAndPctRow(NC, RACE, ALL, 20, 100);
    const NC_ASIAN_FINAL = finalPopulationCountAndPctRow(
      NC,
      RACE,
      ASIAN_NH,
      5,
      25
    );
    const NC_WHITE_FINAL = finalPopulationCountAndPctRow(
      NC,
      RACE,
      WHITE_NH,
      15,
      75
    );

    await evaluatePopulationCountAndPctWithAndWithoutTotal(
      "acs_2010_population-by_race_and_ethnicity_territory",
      rawData,
      Breakdowns.forFips(new Fips(NC.code)),
      RACE,
      [NC_ASIAN_FINAL, NC_WHITE_FINAL],
      [NC_ALL_FINAL, NC_ASIAN_FINAL, NC_WHITE_FINAL]
    );
  });

  test("State and Age Breakdown", async () => {
    const rawData = [
      stateRow(AL, AGE, "10-19", 2, 100),
      stateRow(AL, AGE, ALL, 2, 100),
      stateRow(NC, AGE, "0-9", 15, 60),
      stateRow(NC, AGE, "10-19", 10, 40),
      stateRow(NC, AGE, ALL, 25, 100),
    ];

    const NC_AGE_0_9_FINAL = finalPopulationCountAndPctRow(
      NC,
      AGE,
      "0-9",
      15,
      60
    );
    const NC_AGE_10_19_FINAL = finalPopulationCountAndPctRow(
      NC,
      AGE,
      "10-19",
      10,
      40
    );
    const NC_ALL_FINAL = finalPopulationCountAndPctRow(NC, AGE, ALL, 25, 100);

    await evaluatePopulationCountAndPctWithAndWithoutTotal(
      "acs_2010_population-by_age_territory",
      rawData,
      Breakdowns.forFips(new Fips(NC.code)),
      AGE,
      [NC_AGE_0_9_FINAL, NC_AGE_10_19_FINAL],
      [NC_ALL_FINAL, NC_AGE_0_9_FINAL, NC_AGE_10_19_FINAL]
    );
  });

  test("State and Sex Breakdown", async () => {
    const rawData = [
      stateRow(AL, SEX, MALE, 2, 100),
      stateRow(AL, SEX, ALL, 2, 100),
      stateRow(NC, SEX, MALE, 15, 60),
      stateRow(NC, SEX, FEMALE, 10, 40),
      stateRow(NC, SEX, ALL, 25, 100),
    ];

    const NC_MALE_FINAL = finalPopulationCountAndPctRow(NC, SEX, MALE, 15, 60);
    const NC_FEMALE_FINAL = finalPopulationCountAndPctRow(
      NC,
      SEX,
      FEMALE,
      10,
      40
    );
    const NC_ALL = finalPopulationCountAndPctRow(NC, SEX, ALL, 25, 100);

    await evaluatePopulationCountAndPctWithAndWithoutTotal(
      "acs_2010_population-by_sex_territory",
      rawData,
      Breakdowns.forFips(new Fips(NC.code)),
      SEX,
      [NC_FEMALE_FINAL, NC_MALE_FINAL],
      [NC_ALL, NC_FEMALE_FINAL, NC_MALE_FINAL]
    );
  });
});
