import { IDataFrame } from "data-forge";
import { Row } from "../utils/DatasetTypes";
import { ALL, UNKNOWN, UNKNOWN_RACE, UNKNOWN_HL } from "../utils/Constants";
import { Breakdowns } from "../query/Breakdowns";

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
  cols: string[],
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

/** Calculates a rate as occurrences per 100k */
export function per100k(numerator: number, denominator: number): number | null {
  return numerator == null || denominator == null || denominator === 0
    ? null
    : Math.round(100000 * (numerator / denominator));
}

/** Calculates a rate as a percent to one decimal place. */
export function percent(numerator: number, denominator: number): number | null {
  return numerator == null || denominator == null || denominator === 0
    ? null
    : Math.round((1000 * numerator) / denominator) / 10;
}

/** Finds expected value of an ailment based on a population sample. */
export function estimateTotal(
  stateRow: Row,
  acsState: IDataFrame,
  stateTotals: IDataFrame,
  sample_count: number,
  sample_population: number,
  total_population: number
): number {
  if (
    stateRow.race_and_ethnicity === UNKNOWN_RACE ||
    stateRow.race_and_ethnicity === UNKNOWN
  ) {
    const state_population = acsState
      .where((row) => row.fips === stateRow.fips)
      .where((row) => row.race_and_ethnicity === ALL)
      .resetIndex()
      .at(0);

    if (state_population !== undefined) {
      total_population = state_population.population;
    }

    const sample_population = stateTotals
      .where((row) => row.fips === stateRow.fips)
      .resetIndex()
      .at(0).total_sample_size;

    return sample_count == null ||
      sample_population == null ||
      sample_population === 0
      ? 0
      : Math.round((sample_count / sample_population) * total_population);
  }

  return sample_count == null ||
    sample_population == null ||
    sample_population === 0
    ? 0
    : Math.round((sample_count / sample_population) * total_population);
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

function moveRowWithValueToFront(
  rows: Row[],
  fieldName: string,
  value: string
) {
  let finalRows: Row[] = Object.assign(rows, []);
  const indexOfValue = rows.findIndex((r: any) => r[fieldName] === value);
  if (indexOfValue !== -1) {
    const removedItem = finalRows.splice(indexOfValue, 1);
    finalRows = removedItem.concat(finalRows);
  }
  return finalRows;
}

function moveRowsWithValueToBack(
  rows: Row[],
  fieldName: string,
  value: string
) {
  let finalRows: Row[] = Object.assign(rows, []);
  let removedItems = [];
  let index = rows.findIndex((r: any) => r[fieldName] === value);
  while (index > 0) {
    removedItems.push(finalRows.splice(index, 1));
    index = rows.findIndex((r: any) => r[fieldName] === value);
  }
  removedItems.forEach((removedItem) => {
    finalRows = finalRows.concat(removedItem);
  });
  return finalRows;
}

function sortAlphabeticallyByField(rows: Row[], fieldName: string) {
  let finalRows: Row[] = Object.assign(rows, []);
  finalRows.sort((a, b) => a[fieldName].localeCompare(b[fieldName]));
  return finalRows;
}

export function maybeApplyRowReorder(rows: Row[], breakdowns: Breakdowns) {
  let finalRows: Row[] = Object.assign(rows, []);
  const reorderingColumn = breakdowns.getSoleDemographicBreakdown().columnName;
  // For charts displaying only one region of geographic granularity (for instance a bar chart of
  // race in LA county), we want a specific order of the metric values
  if (breakdowns.hasOneRegionOfGeographicGranularity()) {
    finalRows = sortAlphabeticallyByField(finalRows, reorderingColumn);
    finalRows = moveRowWithValueToFront(finalRows, reorderingColumn, ALL);
    finalRows = moveRowsWithValueToBack(finalRows, reorderingColumn, UNKNOWN);
    finalRows = moveRowsWithValueToBack(
      finalRows,
      reorderingColumn,
      UNKNOWN_HL
    );
  }
  return finalRows;
}
