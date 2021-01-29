import AcsPopulationProvider from "./AcsPopulationProvider";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import { Breakdowns } from "../query/Breakdowns";
import {
  MetricQuery,
  createMissingDataResponse,
  MetricQueryResponse,
} from "../query/MetricQuery";
import { Fips } from "../utils/Fips";
import FakeMetadataMap from "../config/FakeMetadataMap";
import FakeDataFetcher from "../../testing/FakeDataFetcher";
import {
  createWithAndWithoutTotalEvaluator,
  FipsSpec,
  CHATAM,
  DURHAM,
  NC,
  AL,
  MARIN,
  USA,
} from "./TestUtils";
import {
  WHITE_NH,
  ASIAN_NH,
  TOTAL,
  RACE,
  AGE,
  SEX,
  MALE,
  FEMALE,
  NON_HISPANIC,
  WHITE,
} from "../utils/Constants";
import { onlyIncludeStandardRaces } from "../query/BreakdownFilter";

function countyRow(
  fips: FipsSpec,
  breakdownName: string,
  breakdownValue: string,
  population: number
) {
  return {
    county_fips: fips.code,
    state_fips: fips.code.substring(0, 2),
    county_name: fips.name,
    [breakdownName]: breakdownValue,
    population: population,
  };
}

function stateRow(
  fips: FipsSpec,
  breakdownName: string,
  breakdownValue: string,
  population: number
) {
  return {
    state_fips: fips.code,
    state_name: fips.name,
    [breakdownName]: breakdownValue,
    population: population,
  };
}

function finalRow(
  fips: FipsSpec,
  breakdownName: string,
  breakdownValue: string,
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

const evaluateWithAndWithoutTotal = createWithAndWithoutTotalEvaluator(
  "population",
  dataFetcher,
  new AcsPopulationProvider()
);

describe("AcsPopulationProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(FakeMetadataMap);
  });

  test("Invalid Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const response = await acsProvider.getData(
      new MetricQuery("population", Breakdowns.national())
    );
    expect(response).toEqual(
      createMissingDataResponse(
        "Breakdowns not supported for provider acs_pop_provider: geography:national"
      )
    );
  });

  test("Get all counties in state with Race Breakdown", async () => {
    const rawData = [
      countyRow(MARIN, RACE, WHITE_NH, 2),
      countyRow(CHATAM, RACE, TOTAL, 2),
      countyRow(CHATAM, RACE, ASIAN_NH, 2),
      countyRow(DURHAM, RACE, ASIAN_NH, 5),
      countyRow(DURHAM, RACE, WHITE_NH, 15),
      countyRow(DURHAM, RACE, TOTAL, 20),
    ];

    // Chatam county rows
    const C_TOTAL_FINAL = finalRow(CHATAM, RACE, TOTAL, 2, 100);
    const C_ASIAN_FINAL = finalRow(CHATAM, RACE, ASIAN_NH, 2, 100);

    // Durham county rows
    const D_ASIAN_FINAL = finalRow(DURHAM, RACE, ASIAN_NH, 5, 25);
    const D_WHITE_FINAL = finalRow(DURHAM, RACE, WHITE_NH, 15, 75);
    const D_TOTAL_FINAL = finalRow(DURHAM, RACE, TOTAL, 20, 100);

    await evaluateWithAndWithoutTotal(
      "acs_population-by_race_county_std",
      rawData,
      Breakdowns.byCounty().withGeoFilter(new Fips(NC.code)),
      RACE,
      [C_ASIAN_FINAL, D_ASIAN_FINAL, D_WHITE_FINAL],
      [
        C_TOTAL_FINAL,
        C_ASIAN_FINAL,
        D_ASIAN_FINAL,
        D_WHITE_FINAL,
        D_TOTAL_FINAL,
      ]
    );
  });

  test("Get one county with Race breakdown", async () => {
    const rawData = [
      countyRow(CHATAM, RACE, TOTAL, 2),
      countyRow(CHATAM, RACE, ASIAN_NH, 2),
      countyRow(DURHAM, RACE, ASIAN_NH, 5),
      countyRow(DURHAM, RACE, WHITE_NH, 15),
      countyRow(DURHAM, RACE, TOTAL, 20),
    ];

    const D_ASIAN_FINAL = finalRow(DURHAM, RACE, ASIAN_NH, 5, 25);
    const D_WHITE_FINAL = finalRow(DURHAM, RACE, WHITE_NH, 15, 75);
    const D_TOTAL_FINAL = finalRow(DURHAM, RACE, TOTAL, 20, 100);

    await evaluateWithAndWithoutTotal(
      "acs_population-by_race_county_std",
      rawData,
      Breakdowns.forFips(new Fips(DURHAM.code)),
      RACE,
      [D_ASIAN_FINAL, D_WHITE_FINAL],
      [D_ASIAN_FINAL, D_WHITE_FINAL, D_TOTAL_FINAL]
    );
  });

  test("State and Race Breakdown", async () => {
    const rawData = [
      stateRow(AL, RACE, TOTAL, 2),
      stateRow(AL, RACE, ASIAN_NH, 2),
      stateRow(NC, RACE, TOTAL, 20),
      stateRow(NC, RACE, ASIAN_NH, 5),
      stateRow(NC, RACE, WHITE_NH, 15),
    ];

    const NC_TOTAL_FINAL = finalRow(NC, RACE, TOTAL, 20, 100);
    const NC_ASIAN_FINAL = finalRow(NC, RACE, ASIAN_NH, 5, 25);
    const NC_WHITE_FINAL = finalRow(NC, RACE, WHITE_NH, 15, 75);

    await evaluateWithAndWithoutTotal(
      "acs_population-by_race_state_std",
      rawData,
      Breakdowns.forFips(new Fips(NC.code)),
      RACE,
      [NC_ASIAN_FINAL, NC_WHITE_FINAL],
      [NC_TOTAL_FINAL, NC_ASIAN_FINAL, NC_WHITE_FINAL]
    );
  });

  test("State and Race Breakdown with standard race filter", async () => {
    const rawData = [
      stateRow(AL, RACE, TOTAL, 2),
      stateRow(AL, RACE, ASIAN_NH, 2),
      stateRow(NC, RACE, TOTAL, 20),
      stateRow(NC, RACE, ASIAN_NH, 5),
      stateRow(NC, RACE, WHITE_NH, 15),
      // Non-standard, will be excluded from the non-standard filter
      stateRow(NC, RACE, WHITE, 17),
      stateRow(NC, RACE, NON_HISPANIC, 13),
    ];

    const datasetId = "acs_population-by_race_state_std";
    dataFetcher.setFakeDatasetLoaded(datasetId, rawData);

    let response = await new AcsPopulationProvider().getData(
      new MetricQuery(
        "population",
        Breakdowns.forFips(new Fips(NC.code)).andRace()
      )
    );
    expect(response).toEqual(
      new MetricQueryResponse(
        [
          finalRow(NC, RACE, TOTAL, 20, 100),
          finalRow(NC, RACE, ASIAN_NH, 5, 25),
          finalRow(NC, RACE, WHITE_NH, 15, 75),
          finalRow(NC, RACE, WHITE, 17, 85),
          finalRow(NC, RACE, NON_HISPANIC, 13, 65),
        ],
        [datasetId]
      )
    );

    response = await new AcsPopulationProvider().getData(
      new MetricQuery(
        "population",
        Breakdowns.forFips(new Fips(NC.code)).andRace(
          onlyIncludeStandardRaces()
        )
      )
    );
    expect(response).toEqual(
      new MetricQueryResponse(
        [
          finalRow(NC, RACE, TOTAL, 20, 100),
          finalRow(NC, RACE, ASIAN_NH, 5, 25),
          finalRow(NC, RACE, WHITE_NH, 15, 75),
        ],
        [datasetId]
      )
    );
  });

  test("National and Race Breakdown", async () => {
    const rawData = [
      stateRow(NC, RACE, ASIAN_NH, 5),
      stateRow(NC, RACE, WHITE_NH, 15),
      stateRow(NC, RACE, TOTAL, 20),
      stateRow(AL, RACE, ASIAN_NH, 5),
      stateRow(AL, RACE, TOTAL, 5),
    ];

    const NATIONAL_ASIAN_FINAL = finalRow(USA, RACE, ASIAN_NH, 10, 40);
    const NATIONAL_WHITE_FINAL = finalRow(USA, RACE, WHITE_NH, 15, 60);
    const NATIONAL_TOTAL_FINAL = finalRow(USA, RACE, TOTAL, 25, 100);

    await evaluateWithAndWithoutTotal(
      "acs_population-by_race_state_std",
      rawData,
      Breakdowns.national(),
      RACE,
      [NATIONAL_ASIAN_FINAL, NATIONAL_WHITE_FINAL],
      [NATIONAL_ASIAN_FINAL, NATIONAL_TOTAL_FINAL, NATIONAL_WHITE_FINAL]
    );
  });

  test("Get all counties in state with age Breakdown", async () => {
    const rawData = [
      countyRow(MARIN, AGE, "10-19", 2),
      countyRow(CHATAM, AGE, "0-9", 2),
      countyRow(DURHAM, AGE, "0-9", 5),
      countyRow(DURHAM, AGE, "10-19", 15),
    ];

    const C_0_9_FINAL = finalRow(CHATAM, AGE, "0-9", 2, 100);
    const C_TOTAL_FINAL = finalRow(CHATAM, AGE, TOTAL, 2, 100);

    const D_0_9_FINAL = finalRow(DURHAM, AGE, "0-9", 5, 25);
    const D_10_19_FINAL = finalRow(DURHAM, AGE, "10-19", 15, 75);
    const D_TOTAL_FINAL = finalRow(DURHAM, AGE, TOTAL, 20, 100);

    await evaluateWithAndWithoutTotal(
      "acs_population-by_age_county",
      rawData,
      Breakdowns.byCounty().withGeoFilter(new Fips(NC.code)),
      AGE,
      [C_0_9_FINAL, D_0_9_FINAL, D_10_19_FINAL],
      [C_0_9_FINAL, C_TOTAL_FINAL, D_0_9_FINAL, D_10_19_FINAL, D_TOTAL_FINAL]
    );
  });

  test("Get one county with age breakdown", async () => {
    const rawData = [
      countyRow(CHATAM, AGE, "0-9", 2),
      countyRow(DURHAM, AGE, "0-9", 5),
      countyRow(DURHAM, AGE, "10-19", 15),
    ];

    const D_0_9_FINAL = finalRow(DURHAM, AGE, "0-9", 5, 25);
    const D_10_19_FINAL = finalRow(DURHAM, AGE, "10-19", 15, 75);
    const D_TOTAL_FINAL = finalRow(DURHAM, AGE, TOTAL, 20, 100);

    await evaluateWithAndWithoutTotal(
      "acs_population-by_age_county",
      rawData,
      Breakdowns.forFips(new Fips(DURHAM.code)),
      AGE,
      [D_0_9_FINAL, D_10_19_FINAL],
      [D_0_9_FINAL, D_10_19_FINAL, D_TOTAL_FINAL]
    );
  });

  test("State and Age Breakdown", async () => {
    const rawData = [
      stateRow(AL, AGE, "10-19", 2),
      stateRow(NC, AGE, "0-9", 15),
      stateRow(NC, AGE, "10-19", 10),
    ];

    const NC_AGE_0_9_FINAL = finalRow(NC, AGE, "0-9", 15, 60);
    const NC_AGE_10_19_FINAL = finalRow(NC, AGE, "10-19", 10, 40);
    const NC_TOTAL_FINAL = finalRow(NC, AGE, TOTAL, 25, 100);

    await evaluateWithAndWithoutTotal(
      "acs_population-by_age_state",
      rawData,
      Breakdowns.forFips(new Fips(NC.code)),
      AGE,
      [NC_AGE_0_9_FINAL, NC_AGE_10_19_FINAL],
      [NC_AGE_0_9_FINAL, NC_AGE_10_19_FINAL, NC_TOTAL_FINAL]
    );
  });

  test("National and Age Breakdown", async () => {
    const rawData = [
      stateRow(AL, AGE, "0-9", 15),
      stateRow(NC, AGE, "0-9", 15),
      stateRow(NC, AGE, "10-19", 10),
    ];

    const AGE_0_9_FINAL = finalRow(USA, AGE, "0-9", 30, 75);
    const AGE_10_19_FINAL = finalRow(USA, AGE, "10-19", 10, 25);
    const AGE_TOTAL_FINAL = finalRow(USA, AGE, TOTAL, 40, 100);

    await evaluateWithAndWithoutTotal(
      "acs_population-by_age_state",
      rawData,
      Breakdowns.national(),
      AGE,
      [AGE_0_9_FINAL, AGE_10_19_FINAL],
      [AGE_0_9_FINAL, AGE_10_19_FINAL, AGE_TOTAL_FINAL]
    );
  });

  test("State and Gender Breakdown", async () => {
    const rawData = [
      stateRow(AL, SEX, MALE, 2),
      stateRow(NC, SEX, MALE, 15),
      stateRow(NC, SEX, FEMALE, 10),
    ];

    const NC_MALE_FINAL = finalRow(NC, SEX, MALE, 15, 60);
    const NC_FEMALE_FINAL = finalRow(NC, SEX, FEMALE, 10, 40);
    const NC_TOTAL = finalRow(NC, SEX, TOTAL, 25, 100);

    await evaluateWithAndWithoutTotal(
      "acs_population-by_sex_state",
      rawData,
      Breakdowns.forFips(new Fips(NC.code)),
      SEX,
      [NC_MALE_FINAL, NC_FEMALE_FINAL],
      [NC_MALE_FINAL, NC_FEMALE_FINAL, NC_TOTAL]
    );
  });

  test("National and Gender Breakdown", async () => {
    const rawData = [
      stateRow(AL, SEX, MALE, 15),
      stateRow(NC, SEX, MALE, 15),
      stateRow(NC, SEX, FEMALE, 10),
    ];

    const MALE_FINAL = finalRow(USA, SEX, MALE, 30, 75);
    const FEMALE_FINAL = finalRow(USA, SEX, FEMALE, 10, 25);
    const TOTAL_FINAL = finalRow(USA, SEX, TOTAL, 40, 100);

    await evaluateWithAndWithoutTotal(
      "acs_population-by_sex_state",
      rawData,
      Breakdowns.national(),
      SEX,
      [FEMALE_FINAL, MALE_FINAL],
      [FEMALE_FINAL, MALE_FINAL, TOTAL_FINAL]
    );
  });
});
