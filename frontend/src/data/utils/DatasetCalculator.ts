import { DataFrame, IDataFrame } from "data-forge";
import { BreakdownVar } from "../query/Breakdowns";
import { ALL, UNKNOWN, UNKNOWN_RACE } from "./Constants";
import { applyToGroups } from "./datasetutils";

type OptionalNumber = number | undefined | null;

export class DatasetCalculator {
  /** Calculates a rate as occurrences per 100k */
  per100k(numerator: number, denominator: number): number | null {
    // per100k is just a percent scaled up by 1000.
    return this.percentAvoidRoundingToZero(
      1000 * numerator,
      denominator,
      /* defaultDecimals= */ 0,
      /* maxDecimals= */ 0
    );
  }

  /**
   * Calculates a rate as a percent to one decimal place, or 2 places if the
   * number would otherwise round to 0.
   */
  percent(
    numerator: OptionalNumber,
    denominator: OptionalNumber
  ): number | null {
    return this.percentAvoidRoundingToZero(numerator, denominator);
  }

  /**
   * Calculates percentage to the specified number of decimal places.
   * numDecimals must be 0 or greater.
   */
  percentToXDecimals(
    numerator: OptionalNumber,
    denominator: OptionalNumber,
    numDecimals: number = 1
  ): number | null {
    const decMultiplier = Math.pow(10, numDecimals);
    return numerator == null ||
      Number.isNaN(numerator) ||
      denominator == null ||
      Number.isNaN(denominator) ||
      denominator === 0
      ? null
      : Math.round((100 * decMultiplier * numerator) / denominator) /
          decMultiplier;
  }

  /**
   * Calculates percentage to `defaultDecimals` number of decimal places. If
   * the percentage would round to 0, calculates with more decimal places until
   * either it doesn't round to 0, or until `maxDecimals`. `defaultDecimals`
   * and `maxDecimals` should be >= 0 and `maxDecimals` should be >=
   * `defaultDecimals`.
   */
  percentAvoidRoundingToZero(
    numerator: OptionalNumber,
    denominator: OptionalNumber,
    defaultDecimals: number = 1,
    maxDecimals: number = 2
  ): number | null {
    let decimals = defaultDecimals;
    let pct = this.percentToXDecimals(numerator, denominator, decimals);

    // If the number is not exactly 0 but rounded to 0, and we're still less
    // than the maximum number of decimals, add a decimal place and try again.
    while (pct === 0 && numerator !== 0 && decimals < maxDecimals) {
      decimals++;
      pct = this.percentToXDecimals(numerator, denominator, decimals);
    }
    return pct;
  }

  /**
   * Calculates a percent share column. In order for this to work, a "Total"
   * value must be present for each group being applied to.
   * Note that this function is not very efficient so it should only be used on
   * small batches of data.
   * @param df The DataFrame to apply to
   * @param rawCountCol The name of the column with the raw count
   * @param pctShareCol The name of the column to create with percent share
   * @param breakdownCol The name of the column to calculate the percent across.
   * @param groupByCols The columns to group by before calculating the total.
   */
  calculatePctShare(
    df: IDataFrame,
    rawCountCol: string,
    pctShareCol: string,
    breakdownCol: BreakdownVar,
    groupByCols: string[]
  ) {
    return applyToGroups(df, groupByCols, (group) => {
      const totalRow = group.where((r) => r[breakdownCol] === ALL);
      if (totalRow.count() === 0) {
        throw new Error("No Total value for group");
      }
      const total = totalRow.first()[rawCountCol];
      return group
        .generateSeries({
          [pctShareCol]: (row) => this.percent(row[rawCountCol], total),
        })
        .resetIndex();
    });
  }

  calculatePctShareOfKnown(
    df: IDataFrame,
    rawCountColumnName: string, // Example. case_count_share_of_known
    shareOfKnownColumnName: string, // Example: case_count_share_of_known
    breakdownCol: BreakdownVar
  ) {
    let dataFrame = df;

    // Remove and store rows for which calculating share_of_known is illogical
    // These rows will be added back at the end of calculations.
    // This leaves only the rows to be summed to calculate TOTAL_KNOWN metric
    const originalTotalRow = dataFrame.where(
      (row) => row[breakdownCol] === ALL
    );
    const originalUnknownRow = dataFrame.where(
      (row) => row[breakdownCol] === UNKNOWN
    );
    const originalUnknownRaceRow = dataFrame.where(
      (row) => row[breakdownCol] === UNKNOWN_RACE
    );
    dataFrame = dataFrame.where(
      (row) =>
        row[breakdownCol] !== ALL &&
        row[breakdownCol] !== UNKNOWN &&
        row[breakdownCol] !== UNKNOWN_RACE
    );

    // Generate Total of Known Values sum to be used to calculate share_of_known
    // metrics for each breakdown value
    const knownValuesTotal = dataFrame.pivot(["fips", "fips_name"], {
      [rawCountColumnName]: (series) => series.sum(),
      population: (series) => series.sum(),
      [breakdownCol]: (series) => ALL,
    });

    // Append calculated Total of Known Values sum to the data frame and use to calculatePctShare()
    dataFrame = dataFrame.concat(knownValuesTotal).resetIndex();
    dataFrame = this.calculatePctShare(
      dataFrame,
      rawCountColumnName,
      shareOfKnownColumnName,
      breakdownCol,
      ["fips"]
    );

    // Remove Total of Known Values that was used to calculate the _share_of_known metrics
    dataFrame = dataFrame.where((row) => row[breakdownCol] !== ALL);

    // Update original Total row to have a logic value, 100%, for the _share_of_known metric and attach to DF
    let updatedTotalRow = originalTotalRow.toArray()[0];
    updatedTotalRow[shareOfKnownColumnName] = 100;
    dataFrame = dataFrame.concat(new DataFrame([updatedTotalRow])).resetIndex();

    // Add back original unknown rows unchanged; they have no value for the METRIC_share_of_known column
    if (originalUnknownRow) {
      dataFrame = dataFrame.concat(originalUnknownRow).resetIndex();
    }
    if (originalUnknownRaceRow) {
      dataFrame = dataFrame.concat(originalUnknownRaceRow).resetIndex();
    }

    return dataFrame;
  }
}
