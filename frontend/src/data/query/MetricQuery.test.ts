import { MetricQueryResponse } from "../query/MetricQuery";

let metricQueryResponse: MetricQueryResponse;

describe("MetricQueryResponse", () => {
  beforeEach(() => {
    metricQueryResponse = new MetricQueryResponse(
      [
        {
          fips: "01",
          race_and_ethnicity: "White",
          covid_cases: 7,
          invalid: undefined,
        },
        {
          fips: "01",
          race_and_ethnicity: "White (Non-Hispanic)",
          covid_cases: "abc",
          invalid: undefined,
        },
        {
          fips: "01",
          race_and_ethnicity: "Asian",
          covid_cases: 2,
          invalid: undefined,
        },
        {
          fips: "01",
          race_and_ethnicity: "Asian (Non-Hispanic)",
          covid_cases: undefined,
          invalid: undefined,
        },
        {
          fips: "02",
          race_and_ethnicity: "White",
          covid_cases: 12,
          invalid: undefined,
        },
        {
          fips: "02",
          race_and_ethnicity: "Asian",
          covid_cases: 5,
          invalid: undefined,
        },
      ],
      ["dataset1"]
    );
  });

  test("getFieldRange()", async () => {
    expect(metricQueryResponse.getFieldRange("covid_cases")).toEqual({
      min: 2,
      max: 12,
    });
    expect(metricQueryResponse.getFieldRange("race_and_ethnicity")).toEqual(
      undefined
    );
    expect(metricQueryResponse.getFieldRange("invalid")).toEqual(undefined);
  });

  test("getUniqueFieldValues()", async () => {
    expect(
      metricQueryResponse.getUniqueFieldValues("race_and_ethnicity")
    ).toEqual([
      "White",
      "White (Non-Hispanic)",
      "Asian",
      "Asian (Non-Hispanic)",
    ]);
    expect(metricQueryResponse.getUniqueFieldValues("fips")).toEqual([
      "01",
      "02",
    ]);
    expect(metricQueryResponse.getUniqueFieldValues("invalid")).toEqual([]);
  });

  test("fieldHasMissingValues()", async () => {
    expect(metricQueryResponse.invalidValues).toEqual({
      covid_cases: 1,
      invalid: 6,
    });
    expect(metricQueryResponse.isFieldMissing("covid_cases")).toEqual(false);
    expect(metricQueryResponse.isFieldMissing("invalid")).toEqual(true);
  });
});
