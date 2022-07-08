import { Dataset } from "./DatasetTypes";

describe("DatasetTypes", () => {
  const fakeMetaData = {
    id: "kff_vaccination-race_and_ethnicity",
    name: "COVID-19 Indicators",
    source_id: "kff_vaccination",
    update_time: "June 2022",
  };

  // including strings that have double-quotes and commas
  const fakeRows = [
    {
      population_pct: 1.0,
      race: "All",
      race_and_ethnicity: "All",
      race_category_id: "ALL",
      race_includes_hispanic: null,
      state_fips: "01",
      state_name: "Alabama",
      some_condition_per_100k: null,
      some_condition_pct_share: "<0.01",
    },
    {
      population_pct: 99.0,
      race: "Asian, Native Hawaiian, and Pacific Islander",
      race_and_ethnicity: "Asian, Native Hawaiian, and Pacific Islander",
      race_category_id: "API_NH",
      race_includes_hispanic: true,
      state_fips: "01",
      state_name: "Alabama",
      some_condition_per_100k: null,
      some_condition_pct_share: "<0.01",
    },
  ];

  const expectedCsvString =
    'population_pct,race,race_and_ethnicity,race_category_id,race_includes_hispanic,state_fips,state_name,some_condition_per_100k,some_condition_pct_share\r\n1,All,All,ALL,,01,Alabama,,<0.01\r\n99,"""Asian, Native Hawaiian, and Pacific Islander""","""Asian, Native Hawaiian, and Pacific Islander""",API_NH,true,01,Alabama,,<0.01';

  let dataset = new Dataset(fakeRows, fakeMetaData);

  test("Testing toCsvString()", async () => {
    expect(dataset.toCsvString()).toEqual(expectedCsvString);
  });
});
