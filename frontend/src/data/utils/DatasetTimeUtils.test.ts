import { METRIC_CONFIG } from "../config/MetricConfig";
import {
  generateConsecutivePeriods,
  getPrettyDate,
  interpolateTimePeriods,
  getNestedData,
  getNestedUnknowns,
  makeA11yTableData,
} from "./DatasetTimeUtils";
import { Row } from "./DatasetTypes";
import { splitIntoKnownsAndUnknowns } from "./datasetutils";

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

const twoYearsOfNormalData = [
  {
    sex: "Male",
    jail_per_100k: 3000,
    jail_pct_share: 30.0,
    time_period: "2020",
  },
  {
    sex: "Male",
    jail_per_100k: 2000,
    jail_pct_share: 30.0,
    time_period: "2021",
  },
  {
    sex: "Female",
    jail_per_100k: 300,
    jail_pct_share: 30.0,
    time_period: "2020",
  },
  {
    sex: "Female",
    jail_per_100k: 200,
    jail_pct_share: 30.0,
    time_period: "2021",
  },
  {
    sex: "Unknown",
    jail_per_100k: null,
    jail_pct_share: 40.0,
    time_period: "2020",
  },
  {
    sex: "Unknown",
    jail_per_100k: null,
    jail_pct_share: 40.0,
    time_period: "2021",
  },
];

describe("Tests for nesting functions", () => {
  test("test getNestedData()", () => {
    const expectedNestedData = [
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
    ).toEqual(expectedNestedData);
  });

  test("test getNestedUnknowns()", () => {
    const twoYearsOfUnknownsFromNormalData = twoYearsOfNormalData.filter(
      (row) => row.sex === "Unknown"
    );
    const expectedNestedUnknowns = [
      ["2020", 40],
      ["2021", 40],
    ];

    expect(
      getNestedUnknowns(twoYearsOfUnknownsFromNormalData, "jail_pct_share")
    ).toEqual(expectedNestedUnknowns);
  });
});

describe("Tests for A11y Table Data functions", () => {
  test("test makeA11yTableData()", () => {
    const [known, unknown] = splitIntoKnownsAndUnknowns(
      twoYearsOfNormalData,
      "sex"
    );

    const expectedA11yTableDataOnlyMale: Row[] = [
      {
        "% of total jail population with unknown sex": 40,
        Male: 3000,
        "Time period": "2020",
      },
      {
        "% of total jail population with unknown sex": 40,
        Male: 2000,
        "Time period": "2021",
      },
    ];

    const jail = METRIC_CONFIG.incarceration.find(
      (datatype) => datatype.variableId === "jail"
    );

    const knownMetric = jail?.metrics.per100k;
    const unknownMetric = jail?.metrics.pct_share;

    expect(
      makeA11yTableData(known, unknown, "sex", knownMetric!, unknownMetric!, [
        "Male",
      ])
    ).toEqual(expectedA11yTableDataOnlyMale);
  });
});

describe("Tests getPrettyDate() function", () => {
  test("YYYY conversion", () => {
    expect(getPrettyDate("2020")).toEqual("2020");
  });
  test("YYYY-MM conversion", () => {
    expect(getPrettyDate("2020-01")).toEqual("January 2020");
  });
  test("don't convert, just pass through", () => {
    expect(getPrettyDate("20-1")).toEqual("20-1");
  });
});
