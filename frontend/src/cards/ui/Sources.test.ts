import { stripCountyFips } from "./Sources";

describe("stripCountyFips", () => {
  it("Should return string with fips code", () => {
    const output = ["cdc_restricted_data-by_race_county_processed_time_series"];
    const input = [
      "cdc_restricted_data-by_race_county_processed_time_series-48",
    ];
    expect(stripCountyFips(input)).toEqual(output);
  });
  it("Should return input if not on county level", () => {
    const output = [
      "cdc_restricted_data-by_race_county_processed_time_series-with_age_adjust",
    ];
    const input = [
      "cdc_restricted_data-by_race_county_processed_time_series-with_age_adjust",
    ];
    expect(stripCountyFips(input)).toEqual(output);
  });
});
