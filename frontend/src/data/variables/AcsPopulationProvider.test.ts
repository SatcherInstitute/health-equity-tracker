import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns } from "../Breakdowns";
import { MetricQueryResponse, createMissingDataResponse } from "../MetricQuery";
import { Dataset } from "../DatasetTypes";
import { Fips, USA_FIPS, USA_DISPLAY_NAME } from "../../utils/madlib/Fips";
import FakeMetadataMap from "../FakeMetadataMap";

interface FipsSpec {
  code: string;
  name: string;
}

const WHITE = "White (Non-Hispanic)";
const ASIAN = "Asian (Non-Hispanic)";
const TOTAL = "Total";
const RACE = "race_and_ethnicity";
const AGE = "age";
const CHATAM: FipsSpec = {
  code: "37037",
  name: "Chatam County",
};
const DURHAM: FipsSpec = {
  code: "37063",
  name: "Durham County",
};
const NC: FipsSpec = {
  code: "37",
  name: "North Carolina",
};
const AL: FipsSpec = {
  code: "01",
  name: "Alabama",
};
const MARIN: FipsSpec = {
  code: "06041",
  name: "Marin County",
};
const USA: FipsSpec = {
  code: USA_FIPS,
  name: USA_DISPLAY_NAME,
};

function fakeDataServerResponse(datasetId: string, dataset: any[]) {
  let serverResponse: Record<string, Dataset> = {};

  new AcsPopulationProvider().datasetIds.forEach((id) => {
    const data = id === datasetId ? dataset : [];

    serverResponse[id] = new Dataset(data, FakeMetadataMap[id]);
  });

  return serverResponse;
}

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
    ingestion_ts: "2021-01-08 22:02:55.964254 UTC",
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

describe("AcsPopulationProvider", () => {
  test("Invalid Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const dataServerResponse = fakeDataServerResponse("", []);

    expect(
      acsProvider.getData(dataServerResponse, Breakdowns.national())
    ).toEqual(
      createMissingDataResponse(
        "Breakdowns not supported for provider acs_pop_provider: geography:national"
      )
    );
  });

  test("Get all counties in state with Race Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_race_county_std",
      [
        countyRow(MARIN, RACE, WHITE, 2),
        countyRow(CHATAM, RACE, TOTAL, 2),
        countyRow(CHATAM, RACE, ASIAN, 2),
        countyRow(DURHAM, RACE, ASIAN, 5),
        countyRow(DURHAM, RACE, WHITE, 15),
        countyRow(DURHAM, RACE, TOTAL, 20),
      ]
    );

    // Chatam county rows
    const C_TOTAL_FINAL = finalRow(CHATAM, RACE, TOTAL, 2, 100);
    const C_ASIAN_FINAL = finalRow(CHATAM, RACE, ASIAN, 2, 100);

    // Durham county rows
    const D_ASIAN_FINAL = finalRow(DURHAM, RACE, ASIAN, 5, 25);
    const D_WHITE_FINAL = finalRow(DURHAM, RACE, WHITE, 15, 75);
    const D_TOTAL_FINAL = finalRow(DURHAM, RACE, TOTAL, 20, 100);

    // Evaluate the response with requesting total field
    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.byCounty().withGeoFilter(new Fips(NC.code)).andRace(true)
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [
          C_TOTAL_FINAL,
          C_ASIAN_FINAL,
          D_ASIAN_FINAL,
          D_WHITE_FINAL,
          D_TOTAL_FINAL,
        ],
        ["acs_population-by_race_county_std"]
      )
    );

    // Evaluate the response without requesting total field
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.byCounty().withGeoFilter(new Fips(NC.code)).andRace()
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(
        [C_ASIAN_FINAL, D_ASIAN_FINAL, D_WHITE_FINAL],
        ["acs_population-by_race_county_std"]
      )
    );
  });

  test("Get one county with Race breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_race_county_std",
      [
        countyRow(CHATAM, RACE, TOTAL, 2),
        countyRow(CHATAM, RACE, ASIAN, 2),
        countyRow(DURHAM, RACE, ASIAN, 5),
        countyRow(DURHAM, RACE, WHITE, 15),
        countyRow(DURHAM, RACE, TOTAL, 20),
      ]
    );

    const D_ASIAN_FINAL = finalRow(DURHAM, RACE, ASIAN, 5, 25);
    const D_WHITE_FINAL = finalRow(DURHAM, RACE, WHITE, 15, 75);
    const D_TOTAL_FINAL = finalRow(DURHAM, RACE, TOTAL, 20, 100);

    // Evaluate the response with requesting total field
    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips(DURHAM.code)).andRace(true)
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [D_ASIAN_FINAL, D_WHITE_FINAL, D_TOTAL_FINAL],
        ["acs_population-by_race_county_std"]
      )
    );

    // Evaluate the response without requesting total field
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips(DURHAM.code)).andRace()
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(
        [D_ASIAN_FINAL, D_WHITE_FINAL],
        ["acs_population-by_race_county_std"]
      )
    );
  });

  test("State and Race Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_race_state_std",
      [
        stateRow(AL, RACE, TOTAL, 2),
        stateRow(AL, RACE, ASIAN, 2),
        stateRow(NC, RACE, TOTAL, 20),
        stateRow(NC, RACE, ASIAN, 5),
        stateRow(NC, RACE, WHITE, 15),
      ]
    );

    const NC_TOTAL_FINAL = finalRow(NC, RACE, TOTAL, 20, 100);
    const NC_ASIAN_FINAL = finalRow(NC, RACE, ASIAN, 5, 25);
    const NC_WHITE_FINAL = finalRow(NC, RACE, WHITE, 15, 75);

    // Evaluate the response without requesting total field
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips(NC.code)).andRace()
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(
        [NC_ASIAN_FINAL, NC_WHITE_FINAL],
        ["acs_population-by_race_state_std"]
      )
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips(NC.code)).andRace(/*includeTotal=*/ true)
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [NC_TOTAL_FINAL, NC_ASIAN_FINAL, NC_WHITE_FINAL],
        ["acs_population-by_race_state_std"]
      )
    );
  });

  test("National and Race Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_race_state_std",
      [
        stateRow(NC, RACE, ASIAN, 5),
        stateRow(NC, RACE, WHITE, 15),
        stateRow(NC, RACE, TOTAL, 20),
        stateRow(AL, RACE, ASIAN, 5),
        stateRow(AL, RACE, TOTAL, 5),
      ]
    );

    const NATIONAL_ASIAN_FINAL = finalRow(USA, RACE, ASIAN, 10, 40);
    const NATIONAL_WHITE_FINAL = finalRow(USA, RACE, WHITE, 15, 60);
    const NATIONAL_TOTAL_FINAL = finalRow(USA, RACE, TOTAL, 25, 100);

    // Evaluate the response without requesting total field
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.national().andRace()
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(
        [NATIONAL_ASIAN_FINAL, NATIONAL_WHITE_FINAL],
        ["acs_population-by_race_state_std"]
      )
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.national().andRace(true)
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [NATIONAL_ASIAN_FINAL, NATIONAL_TOTAL_FINAL, NATIONAL_WHITE_FINAL],
        ["acs_population-by_race_state_std"]
      )
    );
  });

  test("Get all counties in state with age Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_age_county",
      [
        countyRow(MARIN, AGE, "10-19", 2),
        countyRow(CHATAM, AGE, "0-9", 2),
        countyRow(DURHAM, AGE, "0-9", 5),
        countyRow(DURHAM, AGE, "10-19", 15),
      ]
    );

    const C_0_9_FINAL = finalRow(CHATAM, AGE, "0-9", 2, 100);
    const C_TOTAL_FINAL = finalRow(CHATAM, AGE, TOTAL, 2, 100);

    const D_0_9_FINAL = finalRow(DURHAM, AGE, "0-9", 5, 25);
    const D_10_19_FINAL = finalRow(DURHAM, AGE, "10-19", 15, 75);
    const D_TOTAL_FINAL = finalRow(DURHAM, AGE, "Total", 20, 100);

    // Evaluate the response with requesting total field
    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.byCounty().withGeoFilter(new Fips(NC.code)).andAge(true)
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [C_0_9_FINAL, C_TOTAL_FINAL, D_0_9_FINAL, D_10_19_FINAL, D_TOTAL_FINAL],
        ["acs_population-by_age_county"]
      )
    );

    // Evaluate the response without requesting total field
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.byCounty().withGeoFilter(new Fips(NC.code)).andAge()
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(
        [C_0_9_FINAL, D_0_9_FINAL, D_10_19_FINAL],
        ["acs_population-by_age_county"]
      )
    );
  });

  test("Get one county with age breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_age_county",
      [
        countyRow(CHATAM, AGE, "0-9", 2),
        countyRow(DURHAM, AGE, "0-9", 5),
        countyRow(DURHAM, AGE, "10-19", 15),
      ]
    );

    const D_0_9_FINAL = finalRow(DURHAM, AGE, "0-9", 5, 25);
    const D_10_19_FINAL = finalRow(DURHAM, AGE, "10-19", 15, 75);
    const D_TOTAL_FINAL = finalRow(DURHAM, AGE, TOTAL, 20, 100);

    // Evaluate the response with requesting total field
    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips(DURHAM.code)).andAge(true)
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [D_0_9_FINAL, D_10_19_FINAL, D_TOTAL_FINAL],
        ["acs_population-by_age_county"]
      )
    );

    // Evaluate the response without requesting total field
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips(DURHAM.code)).andAge()
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(
        [D_0_9_FINAL, D_10_19_FINAL],
        ["acs_population-by_age_county"]
      )
    );
  });

  test("State and Age Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_age_state",
      [
        stateRow(AL, AGE, "10-19", 2),
        stateRow(NC, AGE, "0-9", 15),
        stateRow(NC, AGE, "10-19", 10),
      ]
    );

    const NC_AGE_0_9_FINAL = finalRow(NC, AGE, "0-9", 15, 60);
    const NC_AGE_10_19_FINAL = finalRow(NC, AGE, "10-19", 10, 40);
    const NC_TOTAL_FINAL = finalRow(NC, AGE, TOTAL, 25, 100);

    // Evaluate the response without requesting total field
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips(NC.code)).andAge()
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(
        [NC_AGE_0_9_FINAL, NC_AGE_10_19_FINAL],
        ["acs_population-by_age_state"]
      )
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips(NC.code)).andAge(/*includeTotal=*/ true)
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [NC_AGE_0_9_FINAL, NC_AGE_10_19_FINAL, NC_TOTAL_FINAL],
        ["acs_population-by_age_state"]
      )
    );
  });

  test("National and Age Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_age_state",
      [
        stateRow(AL, AGE, "0-9", 15),
        stateRow(NC, AGE, "0-9", 15),
        stateRow(NC, AGE, "10-19", 10),
      ]
    );

    const AGE_0_9_FINAL = finalRow(USA, AGE, "0-9", 30, 75);
    const AGE_10_19_FINAL = finalRow(USA, AGE, "10-19", 10, 25);
    const AGE_TOTAL_FINAL = finalRow(USA, AGE, "Total", 40, 100);

    // Evaluate the response without requesting total field
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.national().andAge()
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(
        [AGE_0_9_FINAL, AGE_10_19_FINAL],
        ["acs_population-by_age_state"]
      )
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.national().andAge(/*includeTotal=*/ true)
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [AGE_0_9_FINAL, AGE_10_19_FINAL, AGE_TOTAL_FINAL],
        ["acs_population-by_age_state"]
      )
    );
  });

  test("State and Gender Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_sex_state",
      [
        stateRow(AL, "sex", "male", 2),
        stateRow(NC, "sex", "male", 15),
        stateRow(NC, "sex", "female", 10),
      ]
    );

    const NC_MALE_FINAL = finalRow(NC, "sex", "male", 15, 60);
    const NC_FEMALE_FINAL = finalRow(NC, "sex", "female", 10, 40);
    const NC_TOTAL = finalRow(NC, "sex", "Total", 25, 100);

    // Evaluate the response without requesting total field
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips(NC.code)).andGender()
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(
        [NC_MALE_FINAL, NC_FEMALE_FINAL],
        ["acs_population-by_sex_state"]
      )
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips(NC.code)).andGender(/*includeTotal=*/ true)
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [NC_MALE_FINAL, NC_FEMALE_FINAL, NC_TOTAL],
        ["acs_population-by_sex_state"]
      )
    );
  });

  test("National and Gender Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_sex_state",
      [
        stateRow(AL, "sex", "Male", 15),
        stateRow(NC, "sex", "Male", 15),
        stateRow(NC, "sex", "Female", 10),
      ]
    );

    const MALE_FINAL = finalRow(USA, "sex", "Male", 30, 75);
    const FEMALE_FINAL = finalRow(USA, "sex", "Female", 10, 25);
    const TOTAL_FINAL = finalRow(USA, "sex", "Total", 40, 100);

    // Evaluate the response without requesting total field
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.national().andGender()
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(
        [FEMALE_FINAL, MALE_FINAL],
        ["acs_population-by_sex_state"]
      )
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.national().andGender(/*includeTotal=*/ true)
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [FEMALE_FINAL, MALE_FINAL, TOTAL_FINAL],
        ["acs_population-by_sex_state"]
      )
    );
  });
});
