import {
  generateConsecutivePeriods,
  getPrettyDate,
  calculateShareDisparityPct,
  // interpolateTimePeriods,
} from "./DatasetTimeUtils";

describe("DatasetTypes", () => {
  test("Testing generateConsecutivePeriods()", async () => {
    const testDataMonthly = [
      { time_period: "2000-01", anything_per_100k: 1234 },
      { time_period: "2000-03", anything_per_100k: 5678 },
    ];

    const expectedConsecutivePeriodsMonthly = ["2000-01", "2000-02", "2000-03"];

    expect(generateConsecutivePeriods(testDataMonthly)).toEqual(
      expectedConsecutivePeriodsMonthly
    );

    const testDataYearly = [
      { time_period: "2001", anything_per_100k: 1234 },
      { time_period: "2003", anything_per_100k: 5678 },
    ];

    const expectedConsecutivePeriodsYearly = ["2001", "2002", "2003"];

    expect(generateConsecutivePeriods(testDataYearly)).toEqual(
      expectedConsecutivePeriodsYearly
    );
  });
});

describe("Tests getPrettyDate() function", () => {
  test("Simple conversion", () => {
    expect(getPrettyDate("2020-01")).toEqual("January 2020");
  });
});

describe("Tests calculateShareDisparityPct() function", () => {
  test("Should be -100%", () => {
    expect(calculateShareDisparityPct(0, 10_000)).toEqual(-100);
  });
  test("Should be 0% with rounding", () => {
    expect(calculateShareDisparityPct(10_002, 10_000)).toEqual(0);
  });
  test("Should be 500%", () => {
    expect(calculateShareDisparityPct(60_000, 10_000)).toEqual(500);
  });
  test("Anything with 0 population share should be null", () => {
    expect(calculateShareDisparityPct(undefined, 0)).toEqual(null);
  });
  test("Anything with null values should be null", () => {
    expect(calculateShareDisparityPct(null, 10_000)).toEqual(null);
  });
});
