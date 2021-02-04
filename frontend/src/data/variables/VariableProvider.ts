import { Breakdowns, BreakdownVar } from "../Breakdowns";
import {
  MetricQueryResponse,
  createMissingDataResponse,
  MetricQuery,
} from "../MetricQuery";
import { MetricId } from "../MetricConfig";
import { ProviderId } from "../VariableProviderMap";
import { IDataFrame } from "data-forge";
import { Fips } from "../../utils/madlib/Fips";
import { TOTAL } from "../Constants";
import { applyToGroups, percent } from "../datasetutils";

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

  removeUnwantedDemographicTotals(
    df: IDataFrame,
    breakdowns: Breakdowns
  ): IDataFrame {
    let dataFrame = df;
    Object.values(breakdowns.demographicBreakdowns).forEach(
      (demographicBreakdown) => {
        if (
          demographicBreakdown.enabled &&
          !demographicBreakdown.includeTotal
        ) {
          dataFrame = dataFrame
            .where((row) => row[demographicBreakdown.columnName] !== TOTAL)
            .resetIndex();
        }
      }
    );
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
      const total = group.where((r) => r[breakdownCol] === TOTAL).first()[
        rawCountCol
      ];
      return group
        .generateSeries({
          [pctShareCol]: (row) => percent(row[rawCountCol], total),
        })
        .resetIndex();
    });
  }

  abstract getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse>;

  abstract allowsBreakdowns(breakdowns: Breakdowns): boolean;
}

export default VariableProvider;
