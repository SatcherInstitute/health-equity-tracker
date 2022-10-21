import {
  generateConsecutivePeriods,
  getPrettyDate,
  interpolateTimePeriods,
} from "./DatasetTimeUtils";

describe("Tests for time_period functions", () => {
  test("test interpolateTimePeriods()", () => {
    const dataMissingMonths = [
      { time_period: "2020-01", some_metric: 1 },
      { time_period: "2020-02", some_metric: 2 },
      { time_period: "2020-04", some_metric: 4 },
      { time_period: "2020-05", some_metric: 5 },
    ];

    const dataAllMonths = [
      { time_period: "2020-01", some_metric: 1 },
      { time_period: "2020-02", some_metric: 2 },
      { time_period: "2020-03", some_metric: undefined },
      { time_period: "2020-04", some_metric: 4 },
      { time_period: "2020-05", some_metric: 5 },
    ];

    expect(interpolateTimePeriods(dataMissingMonths)).toEqual(dataAllMonths);
  });

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
