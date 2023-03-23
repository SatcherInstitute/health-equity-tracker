import { IDataFrame } from "data-forge";
import { getDataManager } from "../../utils/globals";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import VariableProvider from "./VariableProvider";

// TODO: Once all vaxx sources are being calculated on the backend, we should no longer need any population providers right?
// Area total population comes from geo_context and population pct shares used on the comparison bar charts and tables are
// now embedded within each fetched data source json table.

class Decia2010PopulationProvider extends VariableProvider {
  constructor() {
    super("decia_2010_pop_provider", ["population_pct_decia"]);
  }

  // ALERT! KEEP IN SYNC! Make sure you update data/config/DatasetMetadata AND data/config/MetadataMap.ts if you update dataset IDs
  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.hasOnlyRace()) {
      return "decia_2010_territory_population-by_race_and_ethnicity_territory_state_level";
    } else if (breakdowns.hasOnlyAge()) {
      return "decia_2010_territory_population-by_age_territory_state_level";
    } else if (breakdowns.hasOnlySex()) {
      return "decia_2010_territory_population-by_sex_territory_state_level";
    }

    throw new Error("Not implemented");
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    let df = await this.getDataInternalWithoutPercents(breakdowns);

    df = df
      .generateSeries({ population_decia: (row) => row["population"] })
      .resetIndex();
    df = df
      .generateSeries({
        population_pct_decia: (row) => row["population_pct"],
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
    const decia2010Dataset = await getDataManager().loadDataset(
      this.getDatasetId(breakdowns)
    );
    let decia2010DataFrame = decia2010Dataset.toDataFrame();

    // If requested, filter geography by state or county level
    // We apply the geo filter right away to reduce subsequent calculation times
    decia2010DataFrame = this.filterByGeo(decia2010DataFrame, breakdowns);
    decia2010DataFrame = this.renameGeoColumns(decia2010DataFrame, breakdowns);

    return decia2010DataFrame;
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return !breakdowns.time && breakdowns.hasExactlyOneDemographic();
  }
}

export default Decia2010PopulationProvider;
