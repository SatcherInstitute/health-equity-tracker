import { IDataFrame } from "data-forge";
import { Breakdowns } from "../query/Breakdowns";
import { USA_FIPS, USA_DISPLAY_NAME } from "../utils/Fips";
import VariableProvider from "./VariableProvider";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { getDataManager } from "../../utils/globals";
import { maybeApplyRowReorder } from "../utils/datasetutils";

function createNationalTotal(dataFrame: IDataFrame, breakdown: string) {
  return dataFrame
    .pivot(breakdown, {
      fips: (series) => USA_FIPS,
      fips_name: (series) => USA_DISPLAY_NAME,
      population: (series) => series.sum(),
    })
    .resetIndex();
}

class AcsPopulationProvider extends VariableProvider {
  constructor() {
    super("acs_pop_provider", ["population", "population_pct"]);
  }

  // ALERT! KEEP IN SYNC! Make sure you update DataSourceMetadata if you update dataset IDs
  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.hasOnlySex()) {
      return breakdowns.geography === "county"
        ? "acs_population-by_sex_county"
        : "acs_population-by_sex_state";
    }
    // Note: this assumes all age buckets are included in the same dataset. If
    // we use multiple datasets for different age buckets we will need to check
    // the filters the age breakdown is requesting and select the dataset based
    // on which filters are applied (or select a default one). It is preferrable
    // to have the dataset include all breakdowns.
    if (breakdowns.hasOnlyAge()) {
      return breakdowns.geography === "county"
        ? "acs_population-by_age_county"
        : "acs_population-by_age_state";
    }
    if (breakdowns.hasOnlyRace()) {
      return breakdowns.geography === "county"
        ? "acs_population-by_race_county_std"
        : "acs_population-by_race_state_std";
    }
    throw new Error("Not implemented");
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
    return new MetricQueryResponse(
      maybeApplyRowReorder(df.toArray(), breakdowns),
      [this.getDatasetId(breakdowns)]
    );
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

    return breakdowns.geography === "national"
      ? createNationalTotal(
          acsDataFrame,
          breakdowns.getSoleDemographicBreakdown().columnName
        )
      : acsDataFrame;
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return !breakdowns.time && breakdowns.hasExactlyOneDemographic();
  }
}

export default AcsPopulationProvider;
