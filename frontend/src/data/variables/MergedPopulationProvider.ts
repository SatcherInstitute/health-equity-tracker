import { IDataFrame } from "data-forge";
import { getDataManager } from "../../utils/globals";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import VariableProvider from "./VariableProvider";

class MergedPopulationProvider extends VariableProvider {
  constructor() {
    super("merged_pop_provider", ["population", "population_pct"]);
  }

  // ALERT! KEEP IN SYNC! Make sure you update DataSourceMetadata if you update dataset IDs
  getDatasetId(breakdowns: Breakdowns): string {
    const breakdownColumnName = breakdowns.getSoleDemographicBreakdown()
      .columnName;

    return "merged_population_data-by_" + breakdownColumnName + "_state";
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    let df = await this.getDataInternalWithoutPercents(breakdowns);

    // Calculate population_pct based on total for breakdown
    // Exactly one breakdown should be enabled per allowsBreakdowns()
    const breakdownColumnName = breakdowns.getSoleDemographicBreakdown()
      .columnName;

    df = this.renameTotalToAll(df, breakdownColumnName);

    df = this.calculations.calculatePctShare(
      df,
      "population",
      "population_pct",
      breakdownColumnName,
      ["fips"]
    );

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);
    return new MetricQueryResponse(df.toArray(), [
      this.getDatasetId(breakdowns),
    ]);
  }

  private async getDataInternalWithoutPercents(
    breakdowns: Breakdowns
  ): Promise<IDataFrame> {
    const mergedPopDataset = await getDataManager().loadDataset(
      this.getDatasetId(breakdowns)
    );
    let mergedPopDataFrame = mergedPopDataset.toDataFrame();

    // If requested, filter geography by state or coacs2010ty level
    // We apply the geo filter right away to reduce subsequent calculation times
    mergedPopDataFrame = this.filterByGeo(mergedPopDataFrame, breakdowns);
    mergedPopDataFrame = this.renameGeoColumns(mergedPopDataFrame, breakdowns);

    return mergedPopDataFrame;
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return !breakdowns.time && breakdowns.hasExactlyOneDemographic();
  }
}

export default MergedPopulationProvider;
