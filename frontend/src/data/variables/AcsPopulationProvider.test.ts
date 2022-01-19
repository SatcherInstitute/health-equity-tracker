import FakeDataFetcher from "../../testing/FakeDataFetcher";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import { DatasetMetadataMap } from "../config/DatasetMetadata";
import { onlyIncludeStandardRaces } from "../query/BreakdownFilter";
import { Breakdowns, BreakdownVar } from "../query/Breakdowns";
import {
  createMissingDataResponse,
  MetricQuery,
  MetricQueryResponse,
} from "../query/MetricQuery";
import {
  AGE,
  ALL,
  ASIAN_NH,
  DemographicGroup,
  FEMALE,
  MALE,
  NON_HISPANIC,
  RACE,
  SEX,
  TOTAL,
  WHITE,
  WHITE_NH,
} from "../utils/Constants";
import { Fips } from "../utils/Fips";
import AcsPopulationProvider from "./AcsPopulationProvider";
import {
  AL,
  CHATAM,
  createWithAndWithoutAllEvaluator,
  DURHAM,
  FipsSpec,
  MARIN,
  NC,
  USA,
} from "./TestUtils";

function countyRow(
  fips: FipsSpec,
  breakdownName: BreakdownVar,
  breakdownValue: DemographicGroup,
  population: number,
  population_pct: number
) {
  return {
    county_fips: fips.code,
    state_fips: fips.code.substring(0, 2),
    county_name: fips.name,
    [breakdownName]: breakdownValue,
    population: population,
    population_pct: population_pct,
  };
}

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

function finalPopulationCountRow(
  fips: FipsSpec,
  breakdownName: BreakdownVar,
  breakdownValue: DemographicGroup,
  population: number
) {
  return {
    fips: fips.code,
    fips_name: fips.name,
    [breakdownName]: breakdownValue,
    population: population,
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
    new AcsPopulationProvider()
  );

const evaluatePopulationCountOnlyWithAndWithoutTotal =
  createWithAndWithoutAllEvaluator(
    "population",
    dataFetcher,
    new AcsPopulationProvider()
  );

describe("AcsPopulationProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap);
  });

  test("Invalid Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const response = await acsProvider.getData(
      new MetricQuery(["population", "population_pct"], Breakdowns.national())
    );
    expect(response).toEqual(
      createMissingDataResponse(
        "Breakdowns not supported for provider acs_pop_provider: geography:national"
      )
    );
  });

  test("Get all counties in state with Race Breakdown", async () => {
    const rawData = [
      countyRow(MARIN, RACE, WHITE_NH, 2, 100),
      countyRow(CHATAM, RACE, ALL, 2, 100),
      countyRow(CHATAM, RACE, ASIAN_NH, 2, 100),
      countyRow(DURHAM, RACE, ASIAN_NH, 5, 25),
      countyRow(DURHAM, RACE, WHITE_NH, 15, 75),
      countyRow(DURHAM, RACE, ALL, 20, 100),
    ];

    // Chatam county rows
    const C_ALL_FINAL = finalPopulationCountAndPctRow(
      CHATAM,
      RACE,
      ALL,
      2,
      100
    );
    const C_ASIAN_FINAL = finalPopulationCountAndPctRow(
      CHATAM,
      RACE,
      ASIAN_NH,
      2,
      100
    );

    // Durham county rows
    const D_ASIAN_FINAL = finalPopulationCountAndPctRow(
      DURHAM,
      RACE,
      ASIAN_NH,
      5,
      25
    );
    const D_WHITE_FINAL = finalPopulationCountAndPctRow(
      DURHAM,
      RACE,
      WHITE_NH,
      15,
      75
    );
    const D_ALL_FINAL = finalPopulationCountAndPctRow(
      DURHAM,
      RACE,
      ALL,
      20,
      100
    );

    await evaluatePopulationCountAndPctWithAndWithoutTotal(
      "acs_population-by_race_county_std",
      rawData,
      Breakdowns.byCounty().withGeoFilter(new Fips(NC.code)),
      RACE,
      [C_ASIAN_FINAL, D_ASIAN_FINAL, D_WHITE_FINAL],
      [C_ALL_FINAL, C_ASIAN_FINAL, D_ASIAN_FINAL, D_WHITE_FINAL, D_ALL_FINAL]
    );
  });

  test("Get one county with Race breakdown", async () => {
    const rawData = [
      countyRow(CHATAM, RACE, ALL, 2, 100),
      countyRow(CHATAM, RACE, ASIAN_NH, 2, 100),
      countyRow(DURHAM, RACE, ASIAN_NH, 5, 25),
      countyRow(DURHAM, RACE, WHITE_NH, 15, 75),
      countyRow(DURHAM, RACE, ALL, 20, 100),
    ];

    const D_ASIAN_FINAL = finalPopulationCountAndPctRow(
      DURHAM,
      RACE,
      ASIAN_NH,
      5,
      25
    );
    const D_WHITE_FINAL = finalPopulationCountAndPctRow(
      DURHAM,
      RACE,
      WHITE_NH,
      15,
      75
    );
    const D_ALL_FINAL = finalPopulationCountAndPctRow(
      DURHAM,
      RACE,
      ALL,
      20,
      100
    );

    await evaluatePopulationCountAndPctWithAndWithoutTotal(
      "acs_population-by_race_county_std",
      rawData,
      Breakdowns.forFips(new Fips(DURHAM.code)),
      RACE,
      [D_ASIAN_FINAL, D_WHITE_FINAL],
      [D_ALL_FINAL, D_ASIAN_FINAL, D_WHITE_FINAL]
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
      "acs_population-by_race_state_std",
      rawData,
      Breakdowns.forFips(new Fips(NC.code)),
      RACE,
      [NC_ASIAN_FINAL, NC_WHITE_FINAL],
      [NC_ALL_FINAL, NC_ASIAN_FINAL, NC_WHITE_FINAL]
    );
  });

  test("State and Race Breakdown with standard race filter", async () => {
    const rawData = [
      stateRow(AL, RACE, ALL, 2, 100),
      stateRow(AL, RACE, ASIAN_NH, 2, 100),
      stateRow(NC, RACE, ALL, 20, 100),
      stateRow(NC, RACE, ASIAN_NH, 5, 25),
      stateRow(NC, RACE, WHITE_NH, 15, 75),
      // Non-standard, will be excluded from the non-standard filter
      stateRow(NC, RACE, WHITE, 17, 85),
      stateRow(NC, RACE, NON_HISPANIC, 13, 65),
    ];

    const datasetId = "acs_population-by_race_state_std";
    dataFetcher.setFakeDatasetLoaded(datasetId, rawData);

    let response = await new AcsPopulationProvider().getData(
      new MetricQuery(
        ["population", "population_pct"],
        Breakdowns.forFips(new Fips(NC.code)).andRace()
      )
    );
    expect(response).toEqual(
      new MetricQueryResponse(
        [
          finalPopulationCountAndPctRow(NC, RACE, ALL, 20, 100),
          finalPopulationCountAndPctRow(NC, RACE, ASIAN_NH, 5, 25),
          finalPopulationCountAndPctRow(NC, RACE, NON_HISPANIC, 13, 65),
          finalPopulationCountAndPctRow(NC, RACE, WHITE, 17, 85),
          finalPopulationCountAndPctRow(NC, RACE, WHITE_NH, 15, 75),
        ],
        [datasetId]
      )
    );

    response = await new AcsPopulationProvider().getData(
      new MetricQuery(
        ["population", "population_pct"],
        Breakdowns.forFips(new Fips(NC.code)).andRace(
          onlyIncludeStandardRaces()
        )
      )
    );
    expect(response).toEqual(
      new MetricQueryResponse(
        [
          finalPopulationCountAndPctRow(NC, RACE, ALL, 20, 100),
          finalPopulationCountAndPctRow(NC, RACE, ASIAN_NH, 5, 25),
          finalPopulationCountAndPctRow(NC, RACE, WHITE_NH, 15, 75),
        ],
        [datasetId]
      )
    );
  });

  test("National and Race Breakdown", async () => {
    const rawData = [
      stateRow(NC, RACE, ASIAN_NH, 5, 40),
      stateRow(NC, RACE, WHITE_NH, 15, 60),
      stateRow(NC, RACE, ALL, 20, 100),
      stateRow(AL, RACE, ASIAN_NH, 5, 100),
      stateRow(AL, RACE, ALL, 5, 100),
    ];

    const NATIONAL_ASIAN_FINAL = finalPopulationCountAndPctRow(
      USA,
      RACE,
      ASIAN_NH,
      10,
      40
    );
    const NATIONAL_WHITE_FINAL = finalPopulationCountAndPctRow(
      USA,
      RACE,
      WHITE_NH,
      15,
      60
    );
    const NATIONAL_ALL_FINAL = finalPopulationCountAndPctRow(
      USA,
      RACE,
      ALL,
      25,
      100
    );

    await evaluatePopulationCountAndPctWithAndWithoutTotal(
      "acs_population-by_race_state_std",
      rawData,
      Breakdowns.national(),
      RACE,
      [NATIONAL_ASIAN_FINAL, NATIONAL_WHITE_FINAL],
      [NATIONAL_ALL_FINAL, NATIONAL_ASIAN_FINAL, NATIONAL_WHITE_FINAL]
    );
  });

  test("Get all counties in state with age Breakdown", async () => {
    const rawData = [
      countyRow(MARIN, AGE, "10-19", 2, 100),
      countyRow(MARIN, AGE, TOTAL, 2, 100),
      countyRow(CHATAM, AGE, "0-9", 2, 100),
      countyRow(CHATAM, AGE, TOTAL, 2, 100),
      countyRow(DURHAM, AGE, "0-9", 5, 25),
      countyRow(DURHAM, AGE, "10-19", 15, 75),
      countyRow(DURHAM, AGE, TOTAL, 20, 100),
    ];

    const C_0_9_FINAL = finalPopulationCountAndPctRow(
      CHATAM,
      AGE,
      "0-9",
      2,
      100
    );
    const C_ALL_FINAL = finalPopulationCountAndPctRow(CHATAM, AGE, ALL, 2, 100);

    const D_0_9_FINAL = finalPopulationCountAndPctRow(
      DURHAM,
      AGE,
      "0-9",
      5,
      25
    );
    const D_10_19_FINAL = finalPopulationCountAndPctRow(
      DURHAM,
      AGE,
      "10-19",
      15,
      75
    );
    const D_ALL_FINAL = finalPopulationCountAndPctRow(
      DURHAM,
      AGE,
      ALL,
      20,
      100
    );

    await evaluatePopulationCountAndPctWithAndWithoutTotal(
      "acs_population-by_age_county",
      rawData,
      Breakdowns.byCounty().withGeoFilter(new Fips(NC.code)),
      AGE,
      [C_0_9_FINAL, D_0_9_FINAL, D_10_19_FINAL],
      [C_ALL_FINAL, D_ALL_FINAL, C_0_9_FINAL, D_0_9_FINAL, D_10_19_FINAL]
    );
  });

  test("Get one county with age breakdown", async () => {
    const rawData = [
      countyRow(CHATAM, AGE, "0-9", 2, 100),
      countyRow(CHATAM, AGE, TOTAL, 2, 100),
      countyRow(DURHAM, AGE, "0-9", 5, 25),
      countyRow(DURHAM, AGE, "10-19", 15, 75),
      countyRow(DURHAM, AGE, TOTAL, 20, 100),
    ];

    const D_0_9_FINAL = finalPopulationCountAndPctRow(
      DURHAM,
      AGE,
      "0-9",
      5,
      25
    );
    const D_10_19_FINAL = finalPopulationCountAndPctRow(
      DURHAM,
      AGE,
      "10-19",
      15,
      75
    );
    const D_ALL_FINAL = finalPopulationCountAndPctRow(
      DURHAM,
      AGE,
      ALL,
      20,
      100
    );

    await evaluatePopulationCountAndPctWithAndWithoutTotal(
      "acs_population-by_age_county",
      rawData,
      Breakdowns.forFips(new Fips(DURHAM.code)),
      AGE,
      [D_0_9_FINAL, D_10_19_FINAL],
      [D_ALL_FINAL, D_0_9_FINAL, D_10_19_FINAL]
    );
  });

  test("State and Age Breakdown", async () => {
    const rawData = [
      stateRow(AL, AGE, "10-19", 2, 100),
      stateRow(AL, AGE, TOTAL, 2, 100),
      stateRow(NC, AGE, "0-9", 15, 60),
      stateRow(NC, AGE, "10-19", 10, 40),
      stateRow(NC, AGE, TOTAL, 25, 100),
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
      "acs_population-by_age_state",
      rawData,
      Breakdowns.forFips(new Fips(NC.code)),
      AGE,
      [NC_AGE_0_9_FINAL, NC_AGE_10_19_FINAL],
      [NC_ALL_FINAL, NC_AGE_0_9_FINAL, NC_AGE_10_19_FINAL]
    );
  });

  test("National and Age Breakdown", async () => {
    const rawData = [
      stateRow(AL, AGE, "0-9", 15, 100),
      stateRow(AL, AGE, TOTAL, 15, 100),
      stateRow(NC, AGE, "0-9", 15, 60),
      stateRow(NC, AGE, "10-19", 10, 40),
      stateRow(NC, AGE, TOTAL, 25, 100),
    ];

    const AGE_0_9_FINAL = finalPopulationCountAndPctRow(
      USA,
      AGE,
      "0-9",
      30,
      75
    );
    const AGE_10_19_FINAL = finalPopulationCountAndPctRow(
      USA,
      AGE,
      "10-19",
      10,
      25
    );
    const AGE_ALL_FINAL = finalPopulationCountAndPctRow(USA, AGE, ALL, 40, 100);

    await evaluatePopulationCountAndPctWithAndWithoutTotal(
      "acs_population-by_age_state",
      rawData,
      Breakdowns.national(),
      AGE,
      [AGE_0_9_FINAL, AGE_10_19_FINAL],
      [AGE_ALL_FINAL, AGE_0_9_FINAL, AGE_10_19_FINAL]
    );
  });

  test("State and Gender Breakdown", async () => {
    const rawData = [
      stateRow(AL, SEX, MALE, 2, 100),
      stateRow(AL, SEX, TOTAL, 2, 100),
      stateRow(NC, SEX, MALE, 15, 60),
      stateRow(NC, SEX, FEMALE, 10, 40),
      stateRow(NC, SEX, TOTAL, 25, 100),
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
      "acs_population-by_sex_state",
      rawData,
      Breakdowns.forFips(new Fips(NC.code)),
      SEX,
      [NC_FEMALE_FINAL, NC_MALE_FINAL],
      [NC_ALL, NC_FEMALE_FINAL, NC_MALE_FINAL]
    );
  });

  test("National and Gender Breakdown", async () => {
    const rawData = [
      stateRow(AL, SEX, MALE, 15, 100),
      stateRow(AL, SEX, TOTAL, 15, 100),
      stateRow(NC, SEX, MALE, 15, 60),
      stateRow(NC, SEX, FEMALE, 10, 40),
      stateRow(NC, SEX, TOTAL, 25, 100),
    ];

    const MALE_FINAL = finalPopulationCountAndPctRow(USA, SEX, MALE, 30, 75);
    const FEMALE_FINAL = finalPopulationCountAndPctRow(
      USA,
      SEX,
      FEMALE,
      10,
      25
    );
    const ALL_FINAL = finalPopulationCountAndPctRow(USA, SEX, ALL, 40, 100);

    await evaluatePopulationCountAndPctWithAndWithoutTotal(
      "acs_population-by_sex_state",
      rawData,
      Breakdowns.national(),
      SEX,
      [FEMALE_FINAL, MALE_FINAL],
      [ALL_FINAL, FEMALE_FINAL, MALE_FINAL]
    );
  });

  test("Filters metrics to only those requested", async () => {
    const rawData = [
      stateRow(AL, SEX, MALE, 15, 100),
      stateRow(AL, SEX, TOTAL, 15, 100),
      stateRow(NC, SEX, MALE, 15, 60),
      stateRow(NC, SEX, FEMALE, 10, 40),
      stateRow(NC, SEX, TOTAL, 25, 100),
    ];

    const MALE_FINAL = finalPopulationCountRow(USA, SEX, MALE, 30);
    const FEMALE_FINAL = finalPopulationCountRow(USA, SEX, FEMALE, 10);
    const ALL_FINAL = finalPopulationCountRow(USA, SEX, ALL, 40);

    await evaluatePopulationCountOnlyWithAndWithoutTotal(
      "acs_population-by_sex_state",
      rawData,
      Breakdowns.national(),
      SEX,
      [FEMALE_FINAL, MALE_FINAL],
      [ALL_FINAL, FEMALE_FINAL, MALE_FINAL]
    );
  });
});
