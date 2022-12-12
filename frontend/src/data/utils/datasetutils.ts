import { IDataFrame } from "data-forge";
import { MetricId, VariableConfig, VariableId } from "../config/MetricConfig";
import {
  Breakdowns,
  BreakdownVar,
  GeographicBreakdown,
} from "../query/Breakdowns";
import {
  UHC_API_NH_DETERMINANTS,
  UHC_DECADE_PLUS_5_AGE_DETERMINANTS,
  UHC_DETERMINANTS,
  UHC_VOTER_AGE_DETERMINANTS,
  ALL_UHC_DETERMINANTS,
} from "../variables/BrfssProvider";
import {
  RACE,
  ALL,
  BROAD_AGE_BUCKETS,
  DECADE_PLUS_5_AGE_BUCKETS,
  VOTER_AGE_BUCKETS,
  AGE_BUCKETS,
  ASIAN_NH,
  NHPI_NH,
  API_NH,
  NON_STANDARD_RACES,
  MULTI_OR_OTHER_STANDARD,
  MULTI_OR_OTHER_STANDARD_NH,
  AgeBucket,
  NON_HISPANIC,
  UNKNOWN,
  UNKNOWN_ETHNICITY,
  UNKNOWN_RACE,
  AGE,
  BJS_NATIONAL_AGE_BUCKETS,
  BJS_JAIL_AGE_BUCKETS,
  DemographicGroup,
} from "./Constants";
import { Row } from "./DatasetTypes";
import { Fips } from "./Fips";

/**
 * Reshapes the data frame by creating a new column for each value in
 * newColNames, and using the values from newColValues, grouping by
 * groupedByCol. For example, if you have a dataset with columns: "fips_name",
 * "race_and_ethnicity", and "population", calling:
 *     reshapeRowsToCols(df, "population", "race_and_ethnicity", "fips_name");
 * will convert this to a data frame with a "fips_name" column and a population
 * column for each race. You can optionally rename the columns using
 * colNameGenerator.
 */
export function reshapeRowsToCols(
  df: IDataFrame,
  newColValues: string,
  newColNames: string,
  groupedByCol: string,
  colNameGenerator?: (value: any) => string
): IDataFrame {
  return df
    .groupBy((row: any) => row[groupedByCol])
    .select((group) => {
      const newCols = group.aggregate({}, (acc: any, row: any) => {
        let newColName = row[newColNames];
        if (colNameGenerator) {
          newColName = colNameGenerator(newColName);
        }
        acc[newColName] = row[newColValues];
        return acc;
      });
      return { ...group.first(), ...newCols };
    })
    .inflate()
    .dropSeries([newColNames, newColValues]);
}

/**
 * Does the opposite of reshapeRowsToCols. For example, if you have a dataset
 * with a "fips_name" column and a population column for each race, calling:
 *     reshapeColsToRows(
 *         df, ["Black", "White", "Hispanic", ...], "population",
 *         "race_and_ethnicity");
 * will convert it to a dataset with columns: "fips_name",
 * "race_and_ethnicity", and "population"
 * @param df
 * @param cols
 * @param newCol
 * @param groupedByCol
 */
export function reshapeColsToRows(
  df: IDataFrame,
  cols: string[],
  newCol: string,
  groupedByCol: string
) {
  return df
    .selectMany((row) => {
      return cols.map((col) => {
        return { ...row, [groupedByCol]: col, [newCol]: row[col] };
      });
    })
    .dropSeries(cols);
}

/**
 * Groups df by all the columns in groupByCols, and applies the specified
 * function to each group, and then collects the resulting groups into a data
 * frame and returns that.
 */
export function applyToGroups(
  df: IDataFrame,
  groupByCols: string[],
  fn: (group: IDataFrame) => IDataFrame
): IDataFrame {
  const groups = df
    .groupBy((row) => row[groupByCols[0]])
    .select((group) => {
      if (groupByCols.length === 1) {
        return fn(group);
      }
      return applyToGroups(group, groupByCols.slice(1), fn);
    });
  if (groups.count() === 0) {
    return df;
  }
  return groups
    .skip(1)
    .aggregate(groups.first(), (prev, next) => prev.concat(next))
    .resetIndex();
}

export type JoinType = "inner" | "left" | "outer";

// TODO consider finding different library for joins, or write our own. This
// library doesn't support multi-col joins naturally, so this uses a workaround.
// I've also seen occasional issues with the page hanging that have been
// difficult to consistently reproduce.
/**
 * Joins two data frames on the specified columns, keeping all the remaining
 * columns from both.
 */
export function joinOnCols(
  df1: IDataFrame,
  df2: IDataFrame,
  cols: BreakdownVar[],
  joinType: JoinType = "inner"
): IDataFrame {
  const keySelector = (row: any) => {
    const keys = cols.map((col) => col + ": " + row[col]);
    return keys.join(",");
  };
  const aggFn = (row1: any, row2: any) => ({ ...row2, ...row1 });
  let joined;
  switch (joinType) {
    case "inner":
      joined = df1.join(df2, keySelector, keySelector, aggFn);
      break;
    case "left":
      joined = df1.joinOuterLeft(df2, keySelector, keySelector, aggFn);
      break;
    case "outer":
      joined = df1.joinOuter(df2, keySelector, keySelector, aggFn);
      break;
  }
  return joined.resetIndex();
}

export function asDate(dateStr: string) {
  const parts = dateStr.split("-").map(Number);
  // Date expects month to be 0-indexed so need to subtract 1.
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

// TODO handle date series missing
export function getLatestDate(df: IDataFrame): Date {
  const dateTimes = df
    .getSeries("date")
    .select((dateStr) => asDate(dateStr).getTime());
  return new Date(dateTimes.max());
}

/* 
Returns the lowest `listSize` & highest `listSize` values, unless there are ties in which case the only the tied highest or lowest values are returned. If there is overlap, it is removed from the highest values.
*/
export function getExtremeValues(
  data: Row[],
  fieldName: MetricId,
  listSize: number
) {
  if (data.length === 0) return [[], []];
  listSize = listSize > data.length ? data.length : listSize;

  // cleanup and sort the data
  let sortedData = data
    .filter((row: Row) => !isNaN(row[fieldName]) && row[fieldName] != null)
    .sort((rowA: Row, rowB: Row) => rowA[fieldName] - rowB[fieldName]); // ascending order

  const lowestValue = sortedData[0][fieldName];
  const valuesTiedAtLowest = sortedData.filter(
    (row) => row[fieldName] === lowestValue
  );

  const lowestValues =
    valuesTiedAtLowest.length > 1
      ? valuesTiedAtLowest
      : sortedData.slice(0, listSize);

  sortedData = sortedData.reverse();

  const highestValue = sortedData[0][fieldName];
  const valuesTiedAtHighest = sortedData.filter(
    (row) => row[fieldName] === highestValue
  );
  const highestValues: Row[] =
    valuesTiedAtHighest.length > 1
      ? valuesTiedAtHighest
      : sortedData.slice(0, listSize);

  const highestValuesNoOverlap = highestValues.filter(
    (value) => !lowestValues.includes(value)
  );

  return [lowestValues, highestValuesNoOverlap];
}

/*
Analyzes state and determines if the 2nd population source should be used
*/
export interface ShouldShowAltPopCompareI {
  fips: { isState: () => boolean };
  breakdownVar: BreakdownVar;
  variableConfig: { variableId: VariableId };
}

export function shouldShowAltPopCompare(fromProps: ShouldShowAltPopCompareI) {
  return (
    fromProps.fips.isState() &&
    fromProps.breakdownVar === RACE &&
    fromProps.variableConfig.variableId === "covid_vaccinations"
  );
}

/* 
There are many gaps in the data, and not every variable contains info at each demographic breakdown by each geographic level.
This nested dictionary keeps track of known gaps, and is utilized by the UI (e.g. disable demographic toggle options)
*/
const missingAgeAllGeos: VariableId[] = [
  "non_medical_drug_use",
  "non_medical_rx_opioid_use",
  "illicit_opioid_use",
  "preventable_hospitalizations",
  "women_state_legislatures",
  "women_us_congress",
];

const missingSexAllGeos: VariableId[] = [
  "women_state_legislatures",
  "women_us_congress",
];

export const DATA_GAPS: Partial<
  Record<GeographicBreakdown, Partial<Record<BreakdownVar, VariableId[]>>>
> = {
  national: {
    age: [...missingAgeAllGeos],
    sex: [...missingSexAllGeos],
  },
  state: {
    age: [...missingAgeAllGeos, "covid_vaccinations", "prison"],
    sex: [...missingSexAllGeos, "covid_vaccinations"],
  },
  territory: {
    age: [...missingAgeAllGeos, "covid_vaccinations"],
    sex: [...missingSexAllGeos, "covid_vaccinations"],
  },
  county: {
    age: [...missingAgeAllGeos, "covid_vaccinations", "prison", "jail"],
    sex: [...missingSexAllGeos, "covid_vaccinations"],
    race_and_ethnicity: ["covid_vaccinations"],
  },
};

/* 

Conditionally hide some of the extra buckets from the table card, which generally should be showing only 1 complete set of buckets that show the entire population's comparison values.

*/
const includeAllsGroupsIds: VariableId[] = [
  "women_state_legislatures",
  "women_us_congress",
  "prison",
  "jail",
];

const NON_STANDARD_AND_MULTI = [
  ...NON_STANDARD_RACES,
  MULTI_OR_OTHER_STANDARD,
  MULTI_OR_OTHER_STANDARD_NH,
];

export function getExclusionList(
  currentVariable: VariableConfig,
  currentBreakdown: BreakdownVar,
  currentFips: Fips
): DemographicGroup[] {
  const current100k = currentVariable.metrics.per100k.metricId;
  const currentVariableId = currentVariable.variableId;
  let exclusionList = [UNKNOWN, UNKNOWN_ETHNICITY, UNKNOWN_RACE];

  if (!includeAllsGroupsIds.includes(currentVariableId)) {
    exclusionList.push(ALL);
  }

  if (currentBreakdown === RACE) {
    exclusionList.push(NON_HISPANIC);
  }

  // Incarceration
  if (currentVariableId === "prison") {
    if (currentBreakdown === RACE) {
      currentFips.isCounty()
        ? exclusionList.push(...NON_STANDARD_AND_MULTI, ASIAN_NH, NHPI_NH)
        : exclusionList.push(...NON_STANDARD_AND_MULTI, API_NH);
    }

    if (currentBreakdown === AGE) {
      currentFips.isUsa() &&
        exclusionList.push(
          ...AGE_BUCKETS.filter(
            (bucket: AgeBucket) =>
              !BJS_NATIONAL_AGE_BUCKETS.includes(bucket as any)
          )
        );

      currentFips.isState() &&
        exclusionList.push(
          // No demographic breakdowns so exclude ALL age buckets
          ...AGE_BUCKETS
        );
    }
  }
  if (currentVariableId === "jail") {
    if (currentBreakdown === RACE) {
      currentFips.isCounty()
        ? exclusionList.push(...NON_STANDARD_AND_MULTI, ASIAN_NH, NHPI_NH)
        : exclusionList.push(...NON_STANDARD_AND_MULTI, API_NH);
    }

    if (currentBreakdown === AGE) {
      exclusionList.push(
        ...AGE_BUCKETS.filter(
          (bucket: AgeBucket) => !BJS_JAIL_AGE_BUCKETS.includes(bucket as any)
        )
      );
    }
  }

  // UHC/BRFSS/AHR
  if (ALL_UHC_DETERMINANTS.includes(current100k) && currentBreakdown === RACE) {
    UHC_API_NH_DETERMINANTS.includes(current100k)
      ? exclusionList.push(ASIAN_NH, NHPI_NH)
      : exclusionList.push(API_NH);
  }

  if (ALL_UHC_DETERMINANTS.includes(current100k) && currentBreakdown === AGE) {
    // get correct age buckets for this determinant
    let determinantBuckets: any[] = [];
    if (UHC_DECADE_PLUS_5_AGE_DETERMINANTS.includes(current100k))
      determinantBuckets.push(...DECADE_PLUS_5_AGE_BUCKETS);
    else if (UHC_VOTER_AGE_DETERMINANTS.includes(current100k))
      determinantBuckets.push(...VOTER_AGE_BUCKETS);
    else if (UHC_DETERMINANTS.includes(current100k))
      determinantBuckets.push(...BROAD_AGE_BUCKETS);

    // remove all of the other age groups
    const irrelevantAgeBuckets = AGE_BUCKETS.filter(
      (bucket) => !determinantBuckets.includes(bucket)
    );
    exclusionList.push(...irrelevantAgeBuckets);
  }

  return exclusionList;
}

export function splitIntoKnownsAndUnknowns(
  data: Row[],
  breakdownVar: BreakdownVar
): Row[][] {
  const knowns: Row[] = [];
  const unknowns: Row[] = [];

  data.forEach((row: Row) => {
    if (
      row[breakdownVar] === UNKNOWN ||
      row[breakdownVar] === UNKNOWN_RACE ||
      row[breakdownVar] === UNKNOWN_ETHNICITY ||
      row[breakdownVar] === "Women of Unknown Race"
    ) {
      unknowns.push(row);
    } else knowns.push(row);
  });

  return [knowns, unknowns];
}

export function appendFipsIfNeeded(
  baseId: string,
  breakdowns: Breakdowns
): string {
  // if there is a parent fips, append it as needed (for county-level files)
  if (breakdowns.geography !== "county") return baseId;

  const isCountyQueryFromStateLevelMap =
    breakdowns.geography === "county" &&
    breakdowns.filterFips?.isStateOrTerritory();

  const fipsToAppend = isCountyQueryFromStateLevelMap
    ? breakdowns.filterFips?.code
    : breakdowns?.filterFips?.getParentFips()?.code;

  const fipsTag = fipsToAppend ? `-${fipsToAppend}` : "";
  return `${baseId}${fipsTag}`;
}
