import { Breakdowns, BreakdownVar } from "../query/Breakdowns";
import {
  MetricQueryResponse,
  createMissingDataResponse,
  MetricQuery,
} from "../query/MetricQuery";
import { MetricId } from "../config/MetricConfig";
import { ProviderId } from "../loading/VariableProviderMap";
import { DataFrame, IDataFrame } from "data-forge";
import { Fips } from "../../data/utils/Fips";
import { ALL, TOTAL, UNKNOWN, UNKNOWN_RACE } from "../utils/Constants";
import { applyToGroups, percent } from "../utils/datasetutils";

abstract class VariableProvider {
  readonly providerId: ProviderId;
  readonly providesMetrics: MetricId[];

  constructor(providerId: ProviderId, providesMetrics: MetricId[]) {
    this.providerId = providerId;
    this.providesMetrics = providesMetrics;
  }

  async getData(metricQuery: MetricQuery): Promise<MetricQueryResponse> {
    if (!this.allowsBreakdowns(metricQuery.breakdowns)) {
      return createMissingDataResponse(
        "Breakdowns not supported for provider " +
          this.providerId +
          ": " +
          metricQuery.breakdowns.getUniqueKey()
      );
    }

    // TODO - check that the metrics are all provided by this provider once we don't have providers relying on other providers

    return await this.getDataInternal(metricQuery);
  }

  filterByGeo(df: IDataFrame, breakdowns: Breakdowns): IDataFrame {
    const fipsColumn: string =
      breakdowns.geography === "county" ? "county_fips" : "state_fips";

    if (breakdowns.filterFips !== undefined) {
      const fips = breakdowns.filterFips as Fips;
      if (fips.isState() && breakdowns.geography === "county") {
        return df
          .where((row) => fips.isParentOf(row["county_fips"]))
          .resetIndex();
      } else {
        return df.where((row) => row[fipsColumn] === fips.code).resetIndex();
      }
    }
    return df;
  }

  renameGeoColumns(df: IDataFrame, breakdowns: Breakdowns): IDataFrame {
    let newDataframe = df;
    const [fipsColumn, geoNameColumn] =
      breakdowns.geography === "county"
        ? ["county_fips", "county_name"]
        : ["state_fips", "state_name"];

    if (breakdowns.geography === "county") {
      newDataframe = newDataframe.dropSeries(["state_fips"]).resetIndex();
    }

    return newDataframe
      .renameSeries({
        [fipsColumn]: "fips",
        [geoNameColumn]: "fips_name",
      })
      .resetIndex();
  }

  removeUnrequestedColumns(df: IDataFrame, metricQuery: MetricQuery) {
    let dataFrame = df;
    let requestedColumns = ["fips", "fips_name"].concat(metricQuery.metricIds);
    // Add column names of enabled breakdowns
    requestedColumns = requestedColumns.concat(
      Object.entries(metricQuery.breakdowns.demographicBreakdowns)
        .filter(([unusedKey, breakdown]) => breakdown.enabled)
        .map(([unusedKey, breakdown]) => breakdown.columnName)
    );

    const columnsToRemove = dataFrame
      .getColumnNames()
      .filter((column) => !requestedColumns.includes(column));

    return dataFrame.dropSeries(columnsToRemove).resetIndex();
  }

  // Renames all instances of Total in the column to All
  // TODO: Backend should do this instead so frontend doesn't have to
  renameTotalToAll(df: IDataFrame, columnName: string) {
    return df.transformSeries({
      [columnName]: (series) => (series === TOTAL ? ALL : series),
    });
  }

  applyDemographicBreakdownFilters(
    df: IDataFrame,
    breakdowns: Breakdowns
  ): IDataFrame {
    let dataFrame = df;
    Object.values(breakdowns.demographicBreakdowns).forEach((demo) => {
      if (demo.enabled && demo.filter) {
        const filter = demo.filter;
        dataFrame = dataFrame
          .where((row) => {
            const value = row[demo.columnName];
            return filter.include === filter.values.includes(value);
          })
          .resetIndex();
      }
    });
    return dataFrame;
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
          [pctShareCol]: (row) => percent(row[rawCountCol], total),
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

  abstract getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse>;

  abstract allowsBreakdowns(breakdowns: Breakdowns): boolean;

  abstract getDatasetId(breakdown: Breakdowns): string;
}

export default VariableProvider;
