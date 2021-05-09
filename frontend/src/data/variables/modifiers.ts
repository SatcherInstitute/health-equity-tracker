import { IDataFrame } from "data-forge";
import { MetricQuery } from "../query/MetricQuery";
import { percent, sumSeries } from "../utils/datasetutils";
import { ALL, UNKNOWN, UNKNOWN_HL, UNKNOWN_RACE } from "../utils/Constants";
import { Row } from "../utils/DatasetTypes";

/**
 * The apply function is called once per row, with the new row returned. This is
 * generally used to add new columns.
 */
export interface RowModifier {
  apply(row: Row): Row;
}

/**
 * The apply function is called once per group, where a group is defined by one
 * group per geographic region. This is generally used to add new columns.
 *
 * This may not be used to add or remove rows, because that can cause brittle
 * behavior. For example, adding a derived column and then adding rows will
 * result in the added rows not having the derived column, while adding rows and
 * then a derived column can result in accidentally calculating the derived
 * column incorrectly due to the additional rows.
 *
 * Adding rows should be done in the preprocesor step (or we could add a
 * separate mechanism for this).
 */
export interface OneDimensionalGroupModifier {
  apply(group: IDataFrame, metricQuery: MetricQuery): IDataFrame;
}

export class RowDerivedColumn implements RowModifier {
  readonly newColName: string;
  readonly newColumnFn: (row: Row) => any;

  constructor(newColName: string, newColumnFn: (row: Row) => any) {
    this.newColName = newColName;
    this.newColumnFn = newColumnFn;
  }

  apply(row: Row): Row {
    return { ...row, [this.newColName]: this.newColumnFn(row) };
  }
}

export class PctShareDerivedColumn implements OneDimensionalGroupModifier {
  readonly rawCountCol: string;
  readonly pctShareCol: string;
  readonly skipValues: string[];

  constructor(
    rawCountCol: string,
    pctShareSuffix: string,
    skipValues?: string[]
  ) {
    this.rawCountCol = rawCountCol;
    this.pctShareCol = rawCountCol + pctShareSuffix;
    this.skipValues = skipValues || [];
  }

  protected getDenominator(
    group: IDataFrame,
    metricQuery: MetricQuery
  ): number {
    const breakdownColumnName = metricQuery.breakdowns.getSoleDemographicBreakdown()
      .columnName;
    const totalRow = group.where((r) => r[breakdownColumnName] === ALL);
    if (totalRow.count() === 0) {
      throw new Error("No Total value for group");
    }

    return totalRow.first()[this.rawCountCol];
  }

  apply(group: IDataFrame, metricQuery: MetricQuery): IDataFrame {
    const breakdownColumnName = metricQuery.breakdowns.getSoleDemographicBreakdown()
      .columnName;
    const denominator = this.getDenominator(group, metricQuery);
    return group
      .generateSeries({
        [this.pctShareCol]: (row) => {
          return this.skipValues.includes(breakdownColumnName)
            ? null
            : percent(row[this.rawCountCol], denominator);
        },
      })
      .resetIndex();
  }
}

export class PctShareOfKnownDerivedColumn extends PctShareDerivedColumn {
  static DEFAULT_SKIP_VALUES = [ALL, UNKNOWN, UNKNOWN_RACE, UNKNOWN_HL];

  constructor(rawCountCol: string, pctShareSuffix: string) {
    super(
      rawCountCol,
      pctShareSuffix,
      PctShareOfKnownDerivedColumn.DEFAULT_SKIP_VALUES
    );
  }

  protected getDenominator(
    group: IDataFrame,
    metricQuery: MetricQuery
  ): number {
    const breakdownColumnName = metricQuery.breakdowns.getSoleDemographicBreakdown()
      .columnName;
    const counts = group
      .where((row) => this.skipValues.includes(row[breakdownColumnName]))
      .getSeries(this.rawCountCol);

    return sumSeries(counts);
  }
}
