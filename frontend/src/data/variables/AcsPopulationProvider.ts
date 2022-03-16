import { IDataFrame } from "data-forge";
import { getDataManager } from "../../utils/globals";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import VariableProvider from "./VariableProvider";

export function GetAcsDatasetId(breakdowns: Breakdowns): string {
  if (breakdowns.hasOnlySex()) {
    return "acs_population-by_sex_" + breakdowns.geography;
  }
  // Note: this assumes all age buckets are included in the same dataset. If
  // we use multiple datasets for different age buckets we will need to check
  // the filters the age breakdown is requesting and select the dataset based
  // on which filters are applied (or select a default one). It is preferrable
  // to have the dataset include all breakdowns.
  if (breakdowns.hasOnlyAge()) {
    return "acs_population-by_age_" + breakdowns.geography;
  }
  if (breakdowns.hasOnlyRace()) {
    return breakdowns.geography === "national"
      ? "acs_population-by_race_national"
      : "acs_population-by_race_" + breakdowns.geography + "_std";
  }
  throw new Error("Not implemented");
}

class AcsPopulationProvider extends VariableProvider {
  constructor() {
    super("acs_pop_provider", ["population", "population_pct"]);
  }

  // ALERT! KEEP IN SYNC! Make sure you update data/config/DatasetMetadata AND data/config/MetadataMap.ts if you update dataset IDs
  getDatasetId(breakdowns: Breakdowns): string {
    return GetAcsDatasetId(breakdowns);
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    let df = await this.getDataInternalWithoutPercents(breakdowns);

    // Calculate population_pct based on total for breakdown
    // Exactly one breakdown should be enabled per allowsBreakdowns()
    const breakdownColumnName =
      breakdowns.getSoleDemographicBreakdown().columnName;

    df = this.renameTotalToAll(df, breakdownColumnName);

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(df.toArray(), [
      this.getDatasetId(breakdowns),
    ]);
  }

  private async getDataInternalWithoutPercents(
    breakdowns: Breakdowns
  ): Promise<IDataFrame> {
    const acsDataset = await getDataManager().loadDataset(
      this.getDatasetId(breakdowns)
    );
    let acsDataFrame = acsDataset.toDataFrame();

    // If requested, filter geography by state or county level
    // We apply the geo filter right away to reduce subsequent calculation times
    acsDataFrame = this.filterByGeo(acsDataFrame, breakdowns);
    acsDataFrame = this.renameGeoColumns(acsDataFrame, breakdowns);

    return acsDataFrame;
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return !breakdowns.time && breakdowns.hasExactlyOneDemographic();
  }
}

export default AcsPopulationProvider;
