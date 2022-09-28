import { stripCountyFips } from "./Sources";

describe("stripCountyFips", () => {
  it("Should return string without fips code", () => {
    const output = ["cdc_restricted_data-by_race_county_processed_time_series"];
    const input = [
      "cdc_restricted_data-by_race_county_processed_time_series-48",
    ];
    expect(stripCountyFips(input)).toEqual(output);
  });
  it("Should return input when county level data isn't being displayed", () => {
    const output = [
      "cdc_restricted_data-by_race_county_processed_time_series-with_age_adjust",
    ];
    const input = [
      "cdc_restricted_data-by_race_county_processed_time_series-with_age_adjust",
    ];
    expect(stripCountyFips(input)).toEqual(output);
  });
  it("Should return string without fips code", () => {
    const output = [
      "cdc_restricted_data-by_race_county_processed_time_series",
      "cdc_restricted_data-by_age_county_processed_time_series",
      "cdc_restricted_data-by_race_county_processed_time_series-with_age_adjust",
    ];
    const input = [
      "cdc_restricted_data-by_race_county_processed_time_series-48",
      "cdc_restricted_data-by_age_county_processed_time_series-48",
      "cdc_restricted_data-by_race_county_processed_time_series-with_age_adjust",
    ];
    expect(stripCountyFips(input)).toEqual(output);
  });
});
