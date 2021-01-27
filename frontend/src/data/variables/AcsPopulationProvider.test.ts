import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns } from "../Breakdowns";
import { MetricQueryResponse, createMissingDataResponse } from "../MetricQuery";
import { Dataset } from "../DatasetTypes";
import { Fips, USA_FIPS, USA_DISPLAY_NAME } from "../../utils/madlib/Fips";
import FakeMetadataMap from "../FakeMetadataMap";

const WHITE = "White (Non-Hispanic)";
const ASIAN = "Asian (Non-Hispanic)";
const TOTAL = "Total";

function fakeDataServerResponse(datasetId: string, data: any[]) {
  let dataServerResponse: Record<string, Dataset> = {};
  [
    "acs_population-by_race_state_std",
    "acs_population-by_age_state",
    "acs_population-by_race_county_std",
  ].forEach((id) => {
    const datasetRows = id === datasetId ? data : [];
    dataServerResponse[id] = new Dataset(datasetRows, FakeMetadataMap[id]);
  });
  return dataServerResponse;
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

function stateRow(
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

    expect(acsProvider.getData({}, Breakdowns.national())).toEqual(
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
      stateRow("37037", "Chatam", "race_and_ethnicity", TOTAL, 2),
      stateRow("37037", "Chatam", "race_and_ethnicity", ASIAN, 2),
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

    const NC_TOTAL_ROW = stateRow("37", "NC", "race_and_ethnicity", TOTAL, 20);
    const NC_ASIAN_ROW = stateRow("37", "NC", "race_and_ethnicity", ASIAN, 5);
    const NC_WHITE_ROW = stateRow("37", "NC", "race_and_ethnicity", WHITE, 15);

    const NC_TOTAL_FINAL_ROW = addPopulationPctToRow(NC_TOTAL_ROW, 100);
    const NC_ASIAN_FINAL_ROW = addPopulationPctToRow(NC_ASIAN_ROW, 25);
    const NC_WHITE_FINAL_ROW = addPopulationPctToRow(NC_WHITE_ROW, 75);

    const acsRaceRows = [
      stateRow("01", "AL", "race_and_ethnicity", TOTAL, 2),
      stateRow("01", "AL", "race_and_ethnicity", ASIAN, 2),
      NC_ASIAN_ROW,
      NC_WHITE_ROW,
      NC_TOTAL_ROW,
    ];

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_race_state_std",
      acsRaceRows
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

    const NC_ASIAN_ROW = stateRow("37", "NC", "race_and_ethnicity", ASIAN, 5);
    const NC_WHITE_ROW = stateRow("37", "NC", "race_and_ethnicity", WHITE, 15);
    const NC_TOTAL_ROW = stateRow("37", "NC", "race_and_ethnicity", TOTAL, 20);

    const AL_ASIAN_ROW = stateRow("01", "AL", "race_and_ethnicity", ASIAN, 5);
    const AL_TOTAL_ROW = stateRow("01", "AL", "race_and_ethnicity", TOTAL, 5);

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
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.national().andRace()
    );
    expect(responseWithoutTotal).toEqual(
      new MetricQueryResponse(
        [NATIONAL_ASIAN_FINAL_ROW, NATIONAL_WHITE_FINAL_ROW],
        ["acs_population-by_race_state_std"]
      )
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.national().andRace(/*includeTotal=*/ true)
    );
    expect(responseWithTotal).toEqual(
      new MetricQueryResponse(
        [
          NATIONAL_ASIAN_FINAL_ROW,
          NATIONAL_TOTAL_FINAL_ROW,
          NATIONAL_WHITE_FINAL_ROW,
        ],
        ["acs_population-by_race_state_std"]
      )
    );
  });

  test("State and Age Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const NC_AGE_0_9 = stateRow("37", "NC", "age", "0-9", 15);
    const NC_AGE_10_19 = stateRow("37", "NC", "age", "10-19", 10);
    const acsAgeRows = [
      stateRow("01", "AL", "age", "10-19", 2),
      NC_AGE_0_9,
      NC_AGE_10_19,
    ];

    const NC_AGE_0_9_FINAL = addPopulationPctToRow(NC_AGE_0_9, 60);
    const NC_AGE_10_19_FINAL = addPopulationPctToRow(NC_AGE_10_19, 40);
    const NC_TOTAL_FINAL = addPopulationPctToRow(
      stateRow("37", "NC", "age", "Total", 25),
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
        [NC_AGE_0_9_FINAL, NC_AGE_10_19_FINAL, NC_TOTAL_FINAL],
        ["acs_population-by_age_state"]
      )
    );
  });

  test("National and Age Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const AL_AGE_0_9 = stateRow("01", "AL", "age", "0-9", 15);
    const NC_AGE_0_9 = stateRow("37", "NC", "age", "0-9", 15);
    const NC_AGE_10_19 = stateRow("37", "NC", "age", "10-19", 10);
    const acsAgeRows = [AL_AGE_0_9, NC_AGE_0_9, NC_AGE_10_19];

    const AGE_0_9_FINAL = addPopulationPctToRow(
      stateRow(USA_FIPS, USA_DISPLAY_NAME, "age", "0-9", 30),
      75
    );
    const AGE_10_19_FINAL = addPopulationPctToRow(
      stateRow(USA_FIPS, USA_DISPLAY_NAME, "age", "10-19", 10),
      25
    );
    const AGE_TOTAL_FINAL = addPopulationPctToRow(
      stateRow(USA_FIPS, USA_DISPLAY_NAME, "age", "Total", 40),
      100
    );

    const dataServerResponse = fakeDataServerResponse(
      "acs_population-by_age_state",
      acsAgeRows
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

    const dataServerResponse = fakeDataServerResponse("", []);

    // Evaluate the response without requesting total field
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips("37")).andGender()
    );
    expect(responseWithoutTotal).toEqual(
      createMissingDataResponse(
        "Breakdowns not supported for provider acs_pop_provider: filterFips:37,geography:state,sex:without total"
      )
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.forFips(new Fips("37")).andGender(/*includeTotal=*/ true)
    );
    expect(responseWithTotal).toEqual(
      createMissingDataResponse(
        "Breakdowns not supported for provider acs_pop_provider: filterFips:37,geography:state,sex:with total"
      )
    );
  });

  test("National and Gender Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const dataServerResponse = fakeDataServerResponse("", []);

    // Evaluate the response without requesting total field
    const responseWithoutTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.national().andGender()
    );
    expect(responseWithoutTotal).toEqual(
      createMissingDataResponse(
        "Breakdowns not supported for provider acs_pop_provider: geography:national,sex:without total"
      )
    );

    // Evaluate the response with requesting total field
    const responseWithTotal = acsProvider.getData(
      dataServerResponse,
      Breakdowns.national().andGender(/*includeTotal=*/ true)
    );
    expect(responseWithTotal).toEqual(
      createMissingDataResponse(
        "Breakdowns not supported for provider acs_pop_provider: geography:national,sex:with total"
      )
    );
  });
});
