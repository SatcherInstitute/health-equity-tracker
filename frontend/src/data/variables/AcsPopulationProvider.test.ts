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
    county_name: county_name,
    [breakdownName]: breakdownValue,
    population: population,
  };
}

function row(
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

describe("AcsPopulationProvider", () => {
  test("Invalid Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    expect(acsProvider.getData({}, Breakdowns.national())).toEqual(
      createMissingDataResponse(
        'Breakdowns not supported for provider acs_pop_provider: {"geography":"national"}'
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

    const CHATAM_TOTAL_FINAL_ROW = Object.assign(CHATAM_TOTAL_ROW, {
      population_pct: 100,
    });
    const CHATAM_ASIAN_FINAL_ROW = Object.assign(CHATAM_ASIAN_ROW, {
      population_pct: 100,
    });
    const DURHAM_ASIAN_FINAL_ROW = Object.assign(DURHAM_ASIAN_ROW, {
      population_pct: 25,
    });
    const DURHAM_WHITE_FINAL_ROW = Object.assign(DURHAM_WHITE_ROW, {
      population_pct: 75,
    });
    const DURHAM_TOTAL_FINAL_ROW = Object.assign(DURHAM_TOTAL_ROW, {
      population_pct: 100,
    });
    const expectedRows = [
      CHATAM_TOTAL_FINAL_ROW,
      CHATAM_ASIAN_FINAL_ROW,
      DURHAM_ASIAN_FINAL_ROW,
      DURHAM_WHITE_FINAL_ROW,
      DURHAM_TOTAL_FINAL_ROW,
    ];

    const breakdown = Breakdowns.byCounty()
      .withGeoFilter(new Fips("37"))
      .andRace(true);
    const actual = acsProvider.getData(
      fakeDataServerResponse(
        "acs_population-by_race_county_std",
        acsRaceCountyData
      ),
      breakdown
    );
    expect(actual).toEqual(
      new MetricQueryResponse(expectedRows, [
        "acs_population-by_race_county_std",
      ])
    );
  });

  test("County and Race Breakdown", async () => {
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
      row("37037", "Chatam", "race_and_ethnicity", TOTAL, 2),
      row("37037", "Chatam", "race_and_ethnicity", ASIAN, 2),
      DURHAM_ASIAN_ROW,
      DURHAM_WHITE_ROW,
      DURHAM_TOTAL_ROW,
    ];

    const DURHAM_ASIAN_FINAL_ROW = Object.assign(DURHAM_ASIAN_ROW, {
      population_pct: 25,
    });
    const DURHAM_WHITE_FINAL_ROW = Object.assign(DURHAM_WHITE_ROW, {
      population_pct: 75,
    });
    const DURHAM_TOTAL_FINAL_ROW = Object.assign(DURHAM_TOTAL_ROW, {
      population_pct: 100,
    });
    const expectedRows = [
      DURHAM_ASIAN_FINAL_ROW,
      DURHAM_WHITE_FINAL_ROW,
      DURHAM_TOTAL_FINAL_ROW,
    ];

    const breakdown = Breakdowns.forFips(new Fips("37063")).andRace(true);
    const actual = acsProvider.getData(
      fakeDataServerResponse(
        "acs_population-by_race_county_std",
        acsRaceCountyData
      ),
      breakdown
    );
    expect(actual).toEqual(
      new MetricQueryResponse(expectedRows, [
        "acs_population-by_race_county_std",
      ])
    );
  });

  test("State and Race Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const NC_ASIAN_ROW = row("37", "NC", "race_and_ethnicity", ASIAN, 5);
    const NC_WHITE_ROW = row("37", "NC", "race_and_ethnicity", WHITE, 15);
    const NC_TOTAL_ROW = row("37", "NC", "race_and_ethnicity", TOTAL, 20);

    const acsRaceStateData = [
      row("01", "AL", "race_and_ethnicity", TOTAL, 2),
      row("01", "AL", "race_and_ethnicity", ASIAN, 2),
      NC_ASIAN_ROW,
      NC_WHITE_ROW,
      NC_TOTAL_ROW,
    ];

    const NC_ASIAN_FINAL_ROW = Object.assign(NC_ASIAN_ROW, {
      population_pct: 25,
    });
    const NC_WHITE_FINAL_ROW = Object.assign(NC_WHITE_ROW, {
      population_pct: 75,
    });
    const NC_TOTAL_FINAL_ROW = Object.assign(NC_TOTAL_ROW, {
      population_pct: 100,
    });
    const expectedRows = [
      NC_ASIAN_FINAL_ROW,
      NC_WHITE_FINAL_ROW,
      NC_TOTAL_FINAL_ROW,
    ];

    const breakdown = Breakdowns.forFips(new Fips("37")).andRace(true);
    const actual = acsProvider.getData(
      fakeDataServerResponse(
        "acs_population-by_race_state_std",
        acsRaceStateData
      ),
      breakdown
    );
    expect(actual).toEqual(
      new MetricQueryResponse(expectedRows, [
        "acs_population-by_race_state_std",
      ])
    );
  });

  test("National and Race Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const NC_ASIAN_ROW = row("37", "NC", "race_and_ethnicity", ASIAN, 5);
    const NC_WHITE_ROW = row("37", "NC", "race_and_ethnicity", WHITE, 15);
    const NC_TOTAL_ROW = row("37", "NC", "race_and_ethnicity", TOTAL, 20);

    const AL_ASIAN_ROW = row("01", "AL", "race_and_ethnicity", ASIAN, 5);
    const AL_TOTAL_ROW = row("01", "AL", "race_and_ethnicity", TOTAL, 5);

    const acsRaceStateData = [
      AL_TOTAL_ROW,
      AL_ASIAN_ROW,
      NC_ASIAN_ROW,
      NC_WHITE_ROW,
      NC_TOTAL_ROW,
    ];

    function finalRow(
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
    const expectedRows = [
      finalRow(ASIAN, /*population=*/ 10, /*population_pct=*/ 40),
      finalRow(TOTAL, /*population=*/ 25, /*population_pct=*/ 100),
      finalRow(WHITE, /*population=*/ 15, /*population_pct=*/ 60),
    ];

    const breakdown = Breakdowns.national().andRace(true);
    const actual = acsProvider.getData(
      fakeDataServerResponse(
        "acs_population-by_race_state_std",
        acsRaceStateData
      ),
      breakdown
    );
    expect(actual).toEqual(
      new MetricQueryResponse(expectedRows, [
        "acs_population-by_race_state_std",
      ])
    );
  });

  test("State and Age Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const NC_AGE_0_9 = row("37", "NC", "age", "0-9", 15);
    const NC_AGE_10_19 = row("37", "NC", "age", "10-19", 10);
    const acsAgeStateData = [
      row("01", "AL", "age", "10-19", 2),
      NC_AGE_0_9,
      NC_AGE_10_19,
    ];

    const NC_AGE_0_9_FINAL = Object.assign(NC_AGE_0_9, { population_pct: 60 });
    const NC_AGE_10_19_FINAL = Object.assign(NC_AGE_10_19, {
      population_pct: 40,
    });

    const expectedRows = [NC_AGE_0_9_FINAL, NC_AGE_10_19_FINAL];

    const breakdown = Breakdowns.forFips(new Fips("37")).andAge();
    const actual = acsProvider.getData(
      fakeDataServerResponse("acs_population-by_age_state", acsAgeStateData),
      breakdown
    );
    expect(actual).toEqual(
      new MetricQueryResponse(expectedRows, ["acs_population-by_age_state"])
    );
  });

  test("National and Age Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const AL_AGE_0_9 = row("01", "AL", "age", "0-9", 15);
    const NC_AGE_0_9 = row("37", "NC", "age", "0-9", 15);
    const NC_AGE_10_19 = row("37", "NC", "age", "10-19", 10);
    const acsAgeStateData = [AL_AGE_0_9, NC_AGE_0_9, NC_AGE_10_19];

    const AGE_0_9_FINAL = Object.assign(
      row(USA_FIPS, USA_DISPLAY_NAME, "age", "0-9", 30),
      { population_pct: 75 }
    );
    const AGE_10_19_FINAL = Object.assign(
      row(USA_FIPS, USA_DISPLAY_NAME, "age", "10-19", 10),
      { population_pct: 25 }
    );

    const expectedRows = [AGE_0_9_FINAL, AGE_10_19_FINAL];

    const breakdown = Breakdowns.national().andAge();
    const actual = acsProvider.getData(
      fakeDataServerResponse("acs_population-by_age_state", acsAgeStateData),
      breakdown
    );
    expect(actual).toEqual(
      new MetricQueryResponse(expectedRows, ["acs_population-by_age_state"])
    );
  });

  test("State and Gender Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const NC_MALE = row("37", "NC", "sex", "male", 15);
    const NC_FEMALE = row("37", "NC", "sex", "female", 10);
    const acsSexStateData = [
      row("01", "AL", "sex", "male", 2),
      NC_MALE,
      NC_FEMALE,
    ];

    const NC_MALE_FINAL = Object.assign(NC_MALE, { population_pct: 60 });
    const NC_FEMALE_FINAL = Object.assign(NC_FEMALE, {
      population_pct: 40,
    });
    const expectedRows = [NC_MALE_FINAL, NC_FEMALE_FINAL];

    const breakdown = Breakdowns.forFips(new Fips("37")).andGender();
    const actual = acsProvider.getData(
      fakeDataServerResponse("acs_population-by_sex_state", acsSexStateData),
      breakdown
    );
    expect(actual).toEqual(
      new MetricQueryResponse(expectedRows, ["acs_population-by_sex_state"])
    );
  });

  test("National and Gender Breakdown", async () => {
    const acsProvider = new AcsPopulationProvider();

    const AL_MALE = row("01", "AL", "sex", "Male", 15);
    const NC_MALE = row("37", "NC", "sex", "Male", 15);
    const NC_FEMALE = row("37", "NC", "sex", "Female", 10);
    const acsSexStateData = [AL_MALE, NC_MALE, NC_FEMALE];

    const MALE_FINAL = Object.assign(
      row(USA_FIPS, USA_DISPLAY_NAME, "sex", "Male", 30),
      { population_pct: 75 }
    );
    const FEMALE_FINAL = Object.assign(
      row(USA_FIPS, USA_DISPLAY_NAME, "sex", "Female", 10),
      { population_pct: 25 }
    );

    const expectedRows = [FEMALE_FINAL, MALE_FINAL];

    const breakdown = Breakdowns.national().andGender();
    const actual = acsProvider.getData(
      fakeDataServerResponse("acs_population-by_sex_state", acsSexStateData),
      breakdown
    );
    expect(actual).toEqual(
      new MetricQueryResponse(expectedRows, ["acs_population-by_sex_state"])
    );
  });
});
