import { TimeSeries, TrendsData } from "../../charts/trendsChart/types";
import { MetricConfig, MetricId } from "../config/MetricConfig";
import { BreakdownVar } from "../query/Breakdowns";
import { DemographicGroup, TIME_PERIOD, TIME_PERIOD_LABEL } from "./Constants";
import { Row } from "./DatasetTypes";

const MONTHLY_LENGTH = 7;
const YEARLY_LENGTH = 4;

const MONTHS: Record<string, string> = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  "10": "October",
  "11": "November",
  "12": "December",
};

/*

Nesting table data into time-series data needed by D3:

Currently BigQuery data is stored in json "rows" where every "column" name is present as a key to that location's value

D3 requires the data in a different format, as a series of nested arrays, per demographic group, per time_period

Before (Table / Vega) Example:

[
  {
    "sex": "male",
    "jail_per_100k": 3000,
    "time_period": "2020"
  },
  {
    "sex": "male",
    "jail_per_100k": 2000,
    "time_period": "2021"
  },
  {
    "sex": "female",
    "jail_per_100k": 300,
    "time_period": "2020"
  },
  {
    "sex": "female",
    "jail_per_100k": 200,
    "time_period": "2021"
  }
]

After (Time-Series / D3) Example:

[
  ["male", [["2020", 3000],["2021", 2000]]],
  ["female", [["2020", 300],["2021", 200]]1]
]

*/

export function generateConsecutivePeriods(data: Row[]): string[] {
  // scan dataset for earliest and latest time_period
  const shippedTimePeriods = data.map((row) => row.time_period).sort();
  const minPeriod = shippedTimePeriods[0];
  const maxPeriod = shippedTimePeriods[shippedTimePeriods.length - 1];
  let consecutivePeriods = [];

  // can only plot based on the least specific time periods.
  // However, all "time_periods" should already be same TimeUnit from backend
  const leastPeriodChars = Math.min(
    ...(shippedTimePeriods.map((period) => period.length) as number[])
  );

  if (leastPeriodChars === MONTHLY_LENGTH) {
    let currentPeriod = minPeriod;
    while (currentPeriod <= maxPeriod) {
      consecutivePeriods.push(currentPeriod);
      let [yyyy, mm]: string[] = currentPeriod.split("-");
      let nextMonth: number = +mm + 1;
      if (+nextMonth === 13) {
        yyyy = (+yyyy + 1).toString();
        mm = "01";
      } else mm = nextMonth.toString().padStart(2, "0");
      currentPeriod = `${yyyy}-${mm}`;
    }
  } else if (leastPeriodChars === YEARLY_LENGTH) {
    let currentPeriod = minPeriod;
    while (currentPeriod <= maxPeriod) {
      consecutivePeriods.push(currentPeriod);
      currentPeriod = (+currentPeriod + 1).toString();
    }
  }

  return consecutivePeriods;
}

// Some datasets are missing data points at certain time periods
// This function rebuilds the dataset ensuring a row for every time period
// between the earliest and latest date, interpolating nulls as needed
// At this point, data has already been filtered to a single demographic group in a single Fips location and those fields are irrelevant
export function interpolateTimePeriods(data: Row[]) {
  const consecutivePeriods = generateConsecutivePeriods(data);
  const interpolatedData = [];

  for (const timePeriod of consecutivePeriods) {
    const shippedRow = data.find((row) => row.time_period === timePeriod);

    if (shippedRow) interpolatedData.push(shippedRow);
    else interpolatedData.push({ time_period: timePeriod });
  }

  return interpolatedData;
}

export function getNestedRates(
  data: Row[],
  demographicGroups: DemographicGroup[],
  currentBreakdown: BreakdownVar,
  metricId: MetricId
): TrendsData {
  if (!data.some((row) => row[TIME_PERIOD])) return [];

  const nestedRates = demographicGroups.map((group) => {
    let groupRows = data.filter((row) => row[currentBreakdown] === group);
    groupRows = interpolateTimePeriods(groupRows);

    const groupTimeSeries = groupRows.map((row) => [
      row[TIME_PERIOD],
      row[metricId] != null ? row[metricId] : null,
    ]);

    return [group, groupTimeSeries];
  });

  return nestedRates as TrendsData;
}

export function getNestedUndueShares(
  data: Row[],
  demographicGroups: DemographicGroup[],
  currentBreakdown: BreakdownVar,
  conditionPctShareId: MetricId,
  popPctShareId: MetricId
): TrendsData {
  if (!data.some((row) => row[TIME_PERIOD])) return [];

  const nestedPctUndue = demographicGroups.map((group) => {
    let groupRows = data.filter((row) => row[currentBreakdown] === group);
    groupRows = interpolateTimePeriods(groupRows);

    const groupTimeSeries = groupRows.map((row) => {
      console.log(row);
      return [row[TIME_PERIOD], row["covid_deaths_inequitable_share"]];
    });

    return [group, groupTimeSeries];
  });

  return nestedPctUndue as TrendsData;
}

export function getNestedUnknowns(
  unknownsData: Row[],
  metricId: MetricId
): TimeSeries {
  if (!unknownsData.some((row) => row[TIME_PERIOD])) return [];
  unknownsData = interpolateTimePeriods(unknownsData);
  return unknownsData.map((row) => [row[TIME_PERIOD], row[metricId]]);
}

export function makeA11yTableData(
  knownsData: Row[],
  unknownsData: Row[],
  breakdownVar: BreakdownVar,
  knownMetric: MetricConfig,
  unknownMetric: MetricConfig,
  selectedGroups: DemographicGroup[]
): Row[] {
  const allTimePeriods = Array.from(
    new Set(knownsData.map((row) => row[TIME_PERIOD]))
  ).sort();

  const allDemographicGroups = Array.from(
    new Set(knownsData.map((row) => row[breakdownVar]))
  );

  const filteredDemographicGroups =
    selectedGroups.length > 0
      ? allDemographicGroups.filter((group) => selectedGroups.includes(group))
      : allDemographicGroups;

  const a11yData = allTimePeriods.map((timePeriod) => {
    // each a11y table row is by time_period
    const a11yRow: any = { [TIME_PERIOD_LABEL]: getPrettyDate(timePeriod) };

    // and shows value per demographic group
    for (let group of filteredDemographicGroups) {
      const rowForGroupTimePeriod = knownsData.find(
        (row) => row[breakdownVar] === group && row[TIME_PERIOD] === timePeriod
      );
      const value = rowForGroupTimePeriod?.[knownMetric.metricId];

      if (knownMetric.type !== "pct_share") a11yRow[group] = value;
      else {
        const popMetricId = knownMetric.populationComparisonMetric?.metricId;
        const populationPctShare = popMetricId
          ? rowForGroupTimePeriod?.[popMetricId]
          : null;
        a11yRow[group] = calculateShareDisparityPct(value, populationPctShare);
      }
    }

    // along with the unknown pct_share
    a11yRow[`Percent with unknown ${breakdownVar}`] = unknownsData.find(
      (row) => row[TIME_PERIOD] === timePeriod
    )?.[unknownMetric.metricId];

    return a11yRow;
  });

  return a11yData;
}

/* calculate shareDisparity% as (observed-expected)/expected */
export function calculateShareDisparityPct(
  observed: number | null | undefined,
  expected: number | null | undefined
) {
  // numerator and denominator can't be null or undefined; denominator also can't be 0
  if (observed == null || expected == null || expected === 0) return null;

  const shareDisparityPct = (observed - expected) / expected;
  const roundToSingleDecimal = 10;
  const asPercent = 100;

  return (
    Math.round(shareDisparityPct * asPercent * roundToSingleDecimal) /
    roundToSingleDecimal
  );
}

/*  
Convert time_period style date YYYY-MM (e.g. "2020-01") to human readable Month Year (e.g. "January 2020")
*/
export function getPrettyDate(timePeriod: string) {
  const [year, monthNum] = timePeriod?.split("-") || [undefined, undefined];
  return `${MONTHS[monthNum]} ${year}`;
}

/* Calculate the race groups with the highest and lowest average values over time */
export function getMinMaxGroups(data: TrendsData): string[] {
  const groupAveragesOverTime = data.map((groupData) => {
    const nonNullGroupData = groupData[1].filter(
      (dataPoint) => dataPoint[1] != null
    );
    const nonNullGroupValues = nonNullGroupData.map(
      (dataPoint) => dataPoint[1]
    );
    // @ts-ignore
    const sumOfGroupValues = nonNullGroupValues.reduce((a, b) => a + b, 0);
    const numberOfGroupValues = nonNullGroupValues.length;
    const groupAverage =
      Math.round((sumOfGroupValues / numberOfGroupValues) * 10) / 10;
    return [groupData[0], groupAverage];
  });

  const values: number[] = groupAveragesOverTime.map(
    (row: any) => row[1] as number
  );

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const groupsWithHighestAverage = groupAveragesOverTime
    .filter((groupItem: any) => groupItem[1] === maxValue)
    .map((groupItem: any) => groupItem[0]);
  const groupsWithLowestAverage = groupAveragesOverTime
    .filter((groupItem: any) => groupItem[1] === minValue)
    .map((groupItem: any) => groupItem[0]);

  const lowestAndHighestGroups = [
    ...groupsWithLowestAverage,
    ...groupsWithHighestAverage,
  ];

  return lowestAndHighestGroups as string[];
}
