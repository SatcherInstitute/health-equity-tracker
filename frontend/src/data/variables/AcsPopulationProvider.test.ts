import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns } from "../Breakdowns";
import { MetricQueryResponse, createMissingDataResponse } from "../MetricQuery";
import { Dataset } from "../DatasetTypes";
import { Fips, USA_FIPS, USA_DISPLAY_NAME } from "../../utils/madlib/Fips";
import FakeMetadataMap from "../FakeMetadataMap";

const WHITE = "White (Non-Hispanic)";
const ASIAN = "Asian (Non-Hispanic)";
const TOTAL = "Total";

function fakeDataServerResponse(datasetId: string, dataset: any[]) {
  let serverResponse: Record<string, Dataset> = {};

  new AcsPopulationProvider().datasetIds.forEach((id) => {
    const data = id === datasetId ? dataset : [];

    serverResponse[id] = new Dataset(data, FakeMetadataMap[id]);
  });

  return serverResponse;
}

function countyRow(
  fips: string,
  county_name: string,
  breakdownName: string,
  breakdownValue: string,
  population: number
) {
  return {
    county_fips: fips,
    state_fips: fips.substring(0, 2),
    county_name: county_name,
    [breakdownName]: breakdownValue,
    ingestion_ts: "2021-01-08 22:02:55.964254 UTC",
    population: population,
  };
}

function rawPopulationRow(
  fips: string,
  state_name: string,
  breakdownName: string,
  breakdownValue: string,
  population: number
) {
  return {
    state_fips: fips,
    state_name: state_name,
    [breakdownName]: breakdownValue,
    population: population,
  };
}

function addPopulationPctToRow(row: {}, pct: number) {
  return Object.assign(row, {
    population_pct: pct,
  });
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

    const CHATAM_TOTAL_ROW = countyRow(
      "37037",
      "Chatam",
      "race_and_ethnicity",
      TOTAL,
      2
    );
    const CHATAM_ASIAN_ROW = countyRow(
      "37037",
      "Chatam",
      "race_and_ethnicity",
      ASIAN,
      2
    );
    const DURHAM_ASIAN_ROW = countyRow(
      "37063",
      "Durham",
      "race_and_ethnicity",
      ASIAN,
      5
    );
    const DURHAM_WHITE_ROW = countyRow(
      "37063",
      "Durham",
      "race_and_ethnicity",
      WHITE,
      15
    );
    const DURHAM_TOTAL_ROW = countyRow(
      "37063",
      "Durham",
      "race_and_ethnicity",
      TOTAL,
      20
    );

    const acsRaceCountyData = [
      countyRow("01111", "AL county", "race_and_ethnicity", WHITE, 2),
      CHATAM_TOTAL_ROW,
      CHATAM_ASIAN_ROW,
      DURHAM_ASIAN_ROW,
      DURHAM_WHITE_ROW,
      DURHAM_TOTAL_ROW,
    ];

    const CHATAM_TOTAL_FINAL_ROW = addPopulationPctToRow(CHATAM_TOTAL_ROW, 100);
    const CHATAM_ASIAN_FINAL_ROW = addPopulationPctToRow(CHATAM_ASIAN_ROW, 100);
    const DURHAM_ASIAN_FINAL_ROW = addPopulationPctToRow(DURHAM_ASIAN_ROW, 25);
    const DURHAM_WHITE_FINAL_ROW = addPopulationPctToRow(DURHAM_WHITE_ROW, 75);
    const DURHAM_TOTAL_FINAL_ROW = addPopulationPctToRow(DURHAM_TOTAL_ROW, 100);

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_race_county_std",
      acsRaceCountyData
    );

    // Evaluate the response with requesting total field
    const rowsWithTotal = [
      CHATAM_TOTAL_FINAL_ROW,
      CHATAM_ASIAN_FINAL_ROW,
      DURHAM_ASIAN_FINAL_ROW,
      DURHAM_WHITE_FINAL_ROW,
      DURHAM_TOTAL_FINAL_ROW,
    ];
    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.byCounty().withGeoFilter(new Fips("37")).andRace(true)
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(rowsWithTotal, [
        "acs_population-by_race_county_std",
      ])
    );

    // Evaluate the response without requesting total field
    const rowsWithoutTotal = [
      CHATAM_ASIAN_FINAL_ROW,
      DURHAM_ASIAN_FINAL_ROW,
      DURHAM_WHITE_FINAL_ROW,
    ];
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.byCounty().withGeoFilter(new Fips("37")).andRace()
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(rowsWithoutTotal, [
        "acs_population-by_race_county_std",
      ])
    );
  });

  test("Get one county with Race breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const DURHAM_ASIAN_ROW = countyRow(
      "37063",
      "Durham",
      "race_and_ethnicity",
      ASIAN,
      5
    );
    const DURHAM_WHITE_ROW = countyRow(
      "37063",
      "Durham",
      "race_and_ethnicity",
      WHITE,
      15
    );
    const DURHAM_TOTAL_ROW = countyRow(
      "37063",
      "Durham",
      "race_and_ethnicity",
      TOTAL,
      20
    );

    const acsRaceCountyData = [
      rawPopulationRow("37037", "Chatam", "race_and_ethnicity", TOTAL, 2),
      rawPopulationRow("37037", "Chatam", "race_and_ethnicity", ASIAN, 2),
      DURHAM_ASIAN_ROW,
      DURHAM_WHITE_ROW,
      DURHAM_TOTAL_ROW,
    ];

    const DURHAM_ASIAN_FINAL_ROW = addPopulationPctToRow(DURHAM_ASIAN_ROW, 25);
    const DURHAM_WHITE_FINAL_ROW = addPopulationPctToRow(DURHAM_WHITE_ROW, 75);
    const DURHAM_TOTAL_FINAL_ROW = addPopulationPctToRow(DURHAM_TOTAL_ROW, 100);

    // Evaluate the response with requesting total field
    const rowsWithTotal = [
      DURHAM_ASIAN_FINAL_ROW,
      DURHAM_WHITE_FINAL_ROW,
      DURHAM_TOTAL_FINAL_ROW,
    ];
    const responseWithTotal = acsProvider.getData(
      fakeDataServerResponse(
        "acs_population-by_race_county_std",
        acsRaceCountyData
      ),
      Breakdowns.forFips(new Fips("37063")).andRace(true)
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(rowsWithTotal, [
        "acs_population-by_race_county_std",
      ])
    );

    // Evaluate the response without requesting total field
    const rowsWithoutTotal = [DURHAM_ASIAN_FINAL_ROW, DURHAM_WHITE_FINAL_ROW];
    const responseWithoutTotal = acsProvider.getData(
      fakeDataServerResponse(
        "acs_population-by_race_county_std",
        acsRaceCountyData
      ),
      Breakdowns.forFips(new Fips("37063")).andRace()
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(rowsWithoutTotal, [
        "acs_population-by_race_county_std",
      ])
    );
  });

  test("State and Race Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const NC_TOTAL_ROW = rawPopulationRow(
      "37",
      "NC",
      "race_and_ethnicity",
      TOTAL,
      20
    );
    const NC_ASIAN_ROW = rawPopulationRow(
      "37",
      "NC",
      "race_and_ethnicity",
      ASIAN,
      5
    );
    const NC_WHITE_ROW = rawPopulationRow(
      "37",
      "NC",
      "race_and_ethnicity",
      WHITE,
      15
    );

    const NC_TOTAL_FINAL_ROW = addPopulationPctToRow(NC_TOTAL_ROW, 100);
    const NC_ASIAN_FINAL_ROW = addPopulationPctToRow(NC_ASIAN_ROW, 25);
    const NC_WHITE_FINAL_ROW = addPopulationPctToRow(NC_WHITE_ROW, 75);

    const acsRaceStateData = [
      rawPopulationRow("01", "AL", "race_and_ethnicity", TOTAL, 2),
      rawPopulationRow("01", "AL", "race_and_ethnicity", ASIAN, 2),
      NC_ASIAN_ROW,
      NC_WHITE_ROW,
      NC_TOTAL_ROW,
    ];

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_race_state_std",
      acsRaceStateData
    );

    // Evaluate the response without requesting total field
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips("37")).andRace()
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(
        [NC_ASIAN_FINAL_ROW, NC_WHITE_FINAL_ROW],
        ["acs_population-by_race_state_std"]
      )
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips("37")).andRace(/*includeTotal=*/ true)
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [NC_ASIAN_FINAL_ROW, NC_WHITE_FINAL_ROW, NC_TOTAL_FINAL_ROW],
        ["acs_population-by_race_state_std"]
      )
    );
  });

  test("National and Race Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const NC_ASIAN_ROW = rawPopulationRow(
      "37",
      "NC",
      "race_and_ethnicity",
      ASIAN,
      5
    );
    const NC_WHITE_ROW = rawPopulationRow(
      "37",
      "NC",
      "race_and_ethnicity",
      WHITE,
      15
    );
    const NC_TOTAL_ROW = rawPopulationRow(
      "37",
      "NC",
      "race_and_ethnicity",
      TOTAL,
      20
    );

    const AL_ASIAN_ROW = rawPopulationRow(
      "01",
      "AL",
      "race_and_ethnicity",
      ASIAN,
      5
    );
    const AL_TOTAL_ROW = rawPopulationRow(
      "01",
      "AL",
      "race_and_ethnicity",
      TOTAL,
      5
    );

    const acsRaceStateData = [
      AL_TOTAL_ROW,
      AL_ASIAN_ROW,
      NC_ASIAN_ROW,
      NC_WHITE_ROW,
      NC_TOTAL_ROW,
    ];

    function finalNationalRow(
      race: string,
      population: number,
      population_pct: number
    ) {
      return {
        state_fips: USA_FIPS,
        state_name: USA_DISPLAY_NAME,
        race_and_ethnicity: race,
        population: population,
        population_pct: population_pct,
      };
    }

    const NATIONAL_ASIAN_FINAL_ROW = finalNationalRow(
      ASIAN,
      /*population=*/ 10,
      /*population_pct=*/ 40
    );
    const NATIONAL_WHITE_FINAL_ROW = finalNationalRow(
      WHITE,
      /*population=*/ 15,
      /*population_pct=*/ 60
    );
    const NATIONAL_TOTAL_FINAL_ROW = finalNationalRow(
      TOTAL,
      /*population=*/ 25,
      /*population_pct=*/ 100
    );

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_race_state_std",
      acsRaceStateData
    );

    // Evaluate the response without requesting total field
    const expectedNoTotalRows = [
      finalNationalRow(ASIAN, /*population=*/ 10, /*population_pct=*/ 40),
      finalNationalRow(WHITE, /*population=*/ 15, /*population_pct=*/ 60),
    ];
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.national().andRace()
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(expectedNoTotalRows, [
        "acs_population-by_race_state_std",
      ])
    );

    // Evaluate the response with requesting total field
    const expectedTotalRows = [
      finalNationalRow(ASIAN, /*population=*/ 10, /*population_pct=*/ 40),
      finalNationalRow(TOTAL, /*population=*/ 25, /*population_pct=*/ 100),
      finalNationalRow(WHITE, /*population=*/ 15, /*population_pct=*/ 60),
    ];
    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.national().andRace(true)
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(expectedTotalRows, [
        "acs_population-by_race_state_std",
      ])
    );
  });

  test("State and Age Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const NC_AGE_0_9 = rawPopulationRow("37", "NC", "age", "0-9", 15);
    const NC_AGE_10_19 = rawPopulationRow("37", "NC", "age", "10-19", 10);
    const acsAgeRows = [
      rawPopulationRow("01", "AL", "age", "10-19", 2),
      NC_AGE_0_9,
      NC_AGE_10_19,
    ];

    const NC_AGE_0_9_FINAL = addPopulationPctToRow(NC_AGE_0_9, 60);
    const NC_AGE_10_19_FINAL = addPopulationPctToRow(NC_AGE_10_19, 40);
    const AGE_TOTAL_FINAL = addPopulationPctToRow(
      rawPopulationRow("37", "NC", "age", "Total", 25),
      100
    );

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_age_state",
      acsAgeRows
    );

    // Evaluate the response without requesting total field
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips("37")).andAge()
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
      Breakdowns.forFips(new Fips("37")).andAge(/*includeTotal=*/ true)
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [NC_AGE_0_9_FINAL, NC_AGE_10_19_FINAL, AGE_TOTAL_FINAL],
        ["acs_population-by_age_state"]
      )
    );
  });

  test("National and Age Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const AL_AGE_0_9 = rawPopulationRow("01", "AL", "age", "0-9", 15);
    const NC_AGE_0_9 = rawPopulationRow("37", "NC", "age", "0-9", 15);
    const NC_AGE_10_19 = rawPopulationRow("37", "NC", "age", "10-19", 10);
    const acsAgeStateData = [AL_AGE_0_9, NC_AGE_0_9, NC_AGE_10_19];

    const AGE_0_9_FINAL = addPopulationPctToRow(
      rawPopulationRow(USA_FIPS, USA_DISPLAY_NAME, "age", "0-9", 30),
      75
    );
    const AGE_10_19_FINAL = addPopulationPctToRow(
      rawPopulationRow(USA_FIPS, USA_DISPLAY_NAME, "age", "10-19", 10),
      25
    );
    const AGE_TOTAL_FINAL = addPopulationPctToRow(
      rawPopulationRow(USA_FIPS, USA_DISPLAY_NAME, "age", "Total", 40),
      100
    );

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_age_state",
      acsAgeStateData
    );

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

    const NC_MALE = rawPopulationRow("37", "NC", "sex", "male", 15);
    const NC_FEMALE = rawPopulationRow("37", "NC", "sex", "female", 10);
    const acsSexStateData = [
      rawPopulationRow("01", "AL", "sex", "male", 2),
      NC_MALE,
      NC_FEMALE,
    ];

    const NC_MALE_FINAL = addPopulationPctToRow(NC_MALE, 60);
    const NC_FEMALE_FINAL = addPopulationPctToRow(NC_FEMALE, 40);
    const NC_TOTAL = addPopulationPctToRow(
      rawPopulationRow("37", "NC", "sex", "Total", 25),
      100
    );

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_sex_state",
      acsSexStateData
    );

    // Evaluate the response without requesting total field
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips("37")).andGender()
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
      Breakdowns.forFips(new Fips("37")).andGender(/*includeTotal=*/ true)
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

    const AL_MALE = rawPopulationRow("01", "AL", "sex", "Male", 15);
    const NC_MALE = rawPopulationRow("37", "NC", "sex", "Male", 15);
    const NC_FEMALE = rawPopulationRow("37", "NC", "sex", "Female", 10);
    const acsSexStateData = [AL_MALE, NC_MALE, NC_FEMALE];

    const MALE_FINAL = addPopulationPctToRow(
      rawPopulationRow(USA_FIPS, USA_DISPLAY_NAME, "sex", "Male", 30),
      75
    );
    const FEMALE_FINAL = addPopulationPctToRow(
      rawPopulationRow(USA_FIPS, USA_DISPLAY_NAME, "sex", "Female", 10),
      25
    );
    const TOTAL_FINAL = addPopulationPctToRow(
      rawPopulationRow(USA_FIPS, USA_DISPLAY_NAME, "sex", "Total", 40),
      100
    );

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_sex_state",
      acsSexStateData
    );

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
