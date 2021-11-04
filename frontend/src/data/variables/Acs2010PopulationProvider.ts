import { IDataFrame } from "data-forge";
import { getDataManager } from "../../utils/globals";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import VariableProvider from "./VariableProvider";

class Acs2010PopulationProvider extends VariableProvider {
  constructor() {
    super("acs_2010_pop_provider", ["population_2010", "population_pct_2010"]);
  }

  // ALERT! KEEP IN SYNC! Make sure you update DataSourceMetadata if you update dataset IDs
  getDatasetId(breakdowns: Breakdowns): string {
    const breakdownColumnName = breakdowns.getSoleDemographicBreakdown()
      .columnName;

    return "acs_2010_population-by_" + breakdownColumnName + "_territory";
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

    df = df
      .generateSeries({ population_2010: (row) => row["population"] })
      .resetIndex();
    df = df
      .generateSeries({
        population_pct_2010: (row) => row["population_pct"],
      })
      .resetIndex();

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);
    return new MetricQueryResponse(df.toArray(), [
      this.getDatasetId(breakdowns),
    ]);
  }

  private async getDataInternalWithoutPercents(
    breakdowns: Breakdowns
  ): Promise<IDataFrame> {
    const acs2010Dataset = await getDataManager().loadDataset(
      this.getDatasetId(breakdowns)
    );
    let acs2010DataFrame = acs2010Dataset.toDataFrame();

    // If requested, filter geography by state or coacs2010ty level
    // We apply the geo filter right away to reduce subsequent calculation times
    acs2010DataFrame = this.filterByGeo(acs2010DataFrame, breakdowns);
    acs2010DataFrame = this.renameGeoColumns(acs2010DataFrame, breakdowns);

    return acs2010DataFrame;
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return !breakdowns.time && breakdowns.hasExactlyOneDemographic();
  }
}

export default Acs2010PopulationProvider;
