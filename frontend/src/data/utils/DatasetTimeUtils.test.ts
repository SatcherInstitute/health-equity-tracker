import {
  generateConsecutivePeriods,
  getPrettyDate,
  interpolateTimePeriods,
  getNestedData,
} from "./DatasetTimeUtils";

describe("Tests for time_period functions", () => {
  test("test interpolateTimePeriods()", () => {
    const dataMissingMonths = [
      { time_period: "2020-01", some_metric: 1 },
      { time_period: "2020-02", some_metric: 2 },
      // one missing month of data
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

describe("Tests for nesting functions", () => {
  test("test getNestedData()", () => {
    const twoYearsOfNormalData = [
      {
        sex: "Male",
        jail_per_100k: 3000,
        time_period: "2020",
      },
      {
        sex: "Male",
        jail_per_100k: 2000,
        time_period: "2021",
      },
      {
        sex: "Female",
        jail_per_100k: 300,
        time_period: "2020",
      },
      {
        sex: "Female",
        jail_per_100k: 200,
        time_period: "2021",
      },
    ];

    const twoYearsOfNestedData = [
      [
        "Male",
        [
          ["2020", 3000],
          ["2021", 2000],
        ],
      ],
      [
        "Female",
        [
          ["2020", 300],
          ["2021", 200],
        ],
      ],
    ];

    expect(
      getNestedData(
        twoYearsOfNormalData,
        ["Male", "Female"],
        "sex",
        "jail_per_100k"
      )
    ).toEqual(twoYearsOfNestedData);
  });
});

describe("Tests getPrettyDate() function", () => {
  test("Simple conversion", () => {
    expect(getPrettyDate("2020-01")).toEqual("January 2020");
  });
});
