import { IDataFrame } from "data-forge";
import { Fips } from "../../data/utils/Fips";
import { MetricId } from "../config/MetricConfig";
import { ProviderId } from "../loading/VariableProviderMap";
import { Breakdowns, TimeView } from "../query/Breakdowns";
import {
  createMissingDataResponse,
  MetricQuery,
  MetricQueryResponse,
} from "../query/MetricQuery";
import { DatasetOrganizer } from "../sorting/DatasetOrganizer";
import { CROSS_SECTIONAL, LONGITUDINAL, TIME_PERIOD } from "../utils/Constants";
import { DatasetCalculator } from "../utils/DatasetCalculator";

abstract class VariableProvider {
  readonly providerId: ProviderId;
  readonly providesMetrics: MetricId[];
  protected readonly calculations = new DatasetCalculator();

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

    let resp = await this.getDataInternal(metricQuery);
    new DatasetOrganizer(resp.data, metricQuery.breakdowns).organize();
    return resp;
  }

  filterByGeo(df: IDataFrame, breakdowns: Breakdowns): IDataFrame {
    const fipsColumn: string =
      breakdowns.geography === "county" ? "county_fips" : "state_fips";

    if (breakdowns.filterFips !== undefined) {
      const fips = breakdowns.filterFips as Fips;
      if (fips.isStateOrTerritory() && breakdowns.geography === "county") {
        return df
          .where((row) => fips.isParentOf(row["county_fips"]))
          .resetIndex();
      } else {
        return df.where((row) => row[fipsColumn] === fips.code).resetIndex();
      }
    }
    return df;
  }

  filterByTimeView(
    df: IDataFrame,
    timeView: TimeView,
    sourceCurrentTimePeriod?: string
  ): IDataFrame {
    // This method should only be used when the CROSS_SECTIONAL VEGA dataset is a recent subset of the LONGITUDINAL D3 dataset
    // For other sources like COVID, the LONGITUDINAL set is in a distinct table that doesn't need the added filtering

    // for updated datasets
    // - return recent slice for CROSS
    // - return full df for LONG

    // for older datasets
    // - return full set for CROSS
    // - return empty df for LONG to trigger missing data on compare view

    // const currentTimePeriod = sourceCurrentTimePeriod || "current"

    if (df.getColumnNames().includes(TIME_PERIOD)) {
      if (timeView === CROSS_SECTIONAL) {
        df = df.where((row) => row[TIME_PERIOD] === sourceCurrentTimePeriod);
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

    if (metricQuery.timeView === LONGITUDINAL)
      requestedColumns.push(TIME_PERIOD);

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

  abstract getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse>;

  abstract allowsBreakdowns(breakdowns: Breakdowns): boolean;

  abstract getDatasetId(breakdown: Breakdowns, dataType?: string): string;
}

export default VariableProvider;
