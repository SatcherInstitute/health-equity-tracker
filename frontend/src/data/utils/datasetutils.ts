import { IDataFrame } from "data-forge";
import { MetricId, VariableId } from "../config/MetricConfig";
import { BreakdownVar, GeographicBreakdown } from "../query/Breakdowns";
import { RACE } from "./Constants";
import { Row } from "./DatasetTypes";

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

export const getLowestN = (
  data: Row[],
  fieldName: MetricId,
  listSize: number
): Row[] => {
  return data
    .filter((row: Row) => !isNaN(row[fieldName]) && row[fieldName] != null)
    .sort((rowA: Row, rowB: Row) => rowA[fieldName] - rowB[fieldName])
    .slice(0, listSize);
};

export const getHighestN = (
  data: Row[],
  fieldName: MetricId,
  listSize: number
): Row[] => {
  return data
    .filter((row: Row) => !isNaN(row[fieldName]) && row[fieldName] != null)
    .sort((rowA: Row, rowB: Row) => rowB[fieldName] - rowA[fieldName])
    .slice(0, listSize);
};

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
    age: [...missingAgeAllGeos, "covid_vaccinations"],
    sex: [...missingSexAllGeos, "covid_vaccinations"],
  },
  territory: {
    age: [...missingAgeAllGeos, "covid_vaccinations"],
    sex: [...missingSexAllGeos, "covid_vaccinations"],
  },
  county: {
    age: [...missingAgeAllGeos, "covid_vaccinations"],
    sex: [...missingSexAllGeos, "covid_vaccinations"],
    race_and_ethnicity: ["covid_vaccinations"],
  },
};
