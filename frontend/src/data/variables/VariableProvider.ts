import { Breakdowns } from "../Breakdowns";
import { Dataset } from "../DatasetTypes";
import { ProviderId, MetricId } from "../variableProviders";
import { MetricQueryResponse, createMissingDataResponse } from "../MetricQuery";
import { IDataFrame } from "data-forge";
import { Fips } from "../../utils/madlib/Fips";

abstract class VariableProvider {
  readonly providerId: ProviderId;
  readonly providesMetrics: MetricId[];
  readonly datasetIds: readonly string[];

  constructor(
    providerId: ProviderId,
    providesMetrics: MetricId[],
    datasetIds: string[]
  ) {
    this.providerId = providerId;
    this.providesMetrics = providesMetrics;
    this.datasetIds = datasetIds;
  }

  // TODO change return type to MetricQueryResponse instead of Row[]
  getData(
    datasets: Record<string, Dataset>,
    breakdowns: Breakdowns
  ): MetricQueryResponse {
    if (!this.allowsBreakdowns(breakdowns)) {
      return createMissingDataResponse(
        "Breakdowns not supported for provider " +
          this.providerId +
          ": " +
          breakdowns.getUniqueKey()
      );
    }

    const missingDatasetIds = this.datasetIds.filter((id) => !datasets[id]);
    if (missingDatasetIds.length > 0) {
      return createMissingDataResponse(
        "Datasets not loaded properly: " + missingDatasetIds.join(",")
      );
    }

    return this.getDataInternal(datasets, breakdowns);
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
    const [fipsColumn, geoNameColumn] =
      breakdowns.geography === "county"
        ? ["county_fips", "county_name"]
        : ["state_fips", "state_name"];

    return df
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
            .where((row) => row[demographicBreakdown.columnName] !== "Total")
            .resetIndex();
        }
      }
    );
    return dataFrame;
  }

  abstract getDataInternal(
    datasets: Record<string, Dataset>,
    breakdowns: Breakdowns
  ): MetricQueryResponse;

  abstract allowsBreakdowns(breakdowns: Breakdowns): boolean;

  static getUniqueDatasetIds(providers: VariableProvider[]): string[] {
    return Array.from(new Set(providers.map((p) => p.datasetIds).flat()));
  }
}

export default VariableProvider;
