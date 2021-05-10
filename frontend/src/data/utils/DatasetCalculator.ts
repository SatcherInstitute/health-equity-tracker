import { DataFrame, IDataFrame } from "data-forge";
import { BreakdownVar } from "../query/Breakdowns";
import { ALL, UNKNOWN, UNKNOWN_RACE } from "./Constants";
import { applyToGroups } from "./datasetutils";

export class DatasetCalculator {
  /** Calculates a rate as occurrences per 100k */
  per100k(numerator: number, denominator: number): number | null {
    return numerator == null || denominator == null || denominator === 0
      ? null
      : Math.round(100000 * (numerator / denominator));
  }

  /** Calculates a rate as a percent to one decimal place. */
  percent(numerator: number, denominator: number): number | null {
    return numerator == null || denominator == null || denominator === 0
      ? null
      : Math.round((1000 * numerator) / denominator) / 10;
  }

  /** Finds expected value of an ailment based on a population sample. */
  estimateTotal(
    sample_percentage: number,
    total_population: number
  ): number | null {
    return sample_percentage == null ||
      total_population == null ||
      total_population === 0
      ? null
      : Math.round((sample_percentage / 100) * total_population);
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
