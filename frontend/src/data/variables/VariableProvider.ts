import { Breakdowns } from "../Breakdowns";
import { MetricId } from "../MetricConfig";
import { MetricQueryResponse, createMissingDataResponse } from "../MetricQuery";
import { ProviderId } from "../VariableProviderMap";
import { IDataFrame } from "data-forge";
import { Fips } from "../../utils/madlib/Fips";

abstract class VariableProvider {
  readonly providerId: ProviderId;
  readonly providesMetrics: MetricId[];

  constructor(providerId: ProviderId, providesMetrics: MetricId[]) {
    this.providerId = providerId;
    this.providesMetrics = providesMetrics;
  }

  async getData(breakdowns: Breakdowns): Promise<MetricQueryResponse> {
    if (!this.allowsBreakdowns(breakdowns)) {
      return createMissingDataResponse(
        "Breakdowns not supported for provider " +
          this.providerId +
          ": " +
          breakdowns.getUniqueKey()
      );
    }

    return await this.getDataInternal(breakdowns);
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
    breakdowns: Breakdowns
  ): Promise<MetricQueryResponse>;

  abstract allowsBreakdowns(breakdowns: Breakdowns): boolean;
}

export default VariableProvider;
