import { DataFrame } from "data-forge";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import AcsPopulationProvider from "./AcsPopulationProvider";
import Acs2010PopulationProvider from "./Acs2010PopulationProvider";
import VariableProvider from "./VariableProvider";

class AcsNationalPopulationProvider extends VariableProvider {
  private acsProvider: AcsPopulationProvider;
  private acs2010Provider: Acs2010PopulationProvider;

  constructor(
    acsProvider: AcsPopulationProvider,
    acs2010Provider: Acs2010PopulationProvider
  ) {
    super("acs_national_pop_provider", ["population", "population_pct"]);
    this.acsProvider = acsProvider;
    this.acs2010Provider = acs2010Provider;
  }

  // ALERT! KEEP IN SYNC! Make sure you update DataSourceMetadata if you update dataset IDs
  getDatasetId(breakdowns: Breakdowns): string {
    return "cool_population_provider";
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const acsBreakdowns = breakdowns.copy();
    acsBreakdowns.time = false;

    const acsQueryResponse = await this.acsProvider.getData(
      new MetricQuery(["population_pct"], acsBreakdowns)
    );

    const acsPopulation = new DataFrame(acsQueryResponse.data);

    // Calculate population_pct based on total for breakdown
    // Exactly one breakdown should be enabled per allowsBreakdowns()
    const acs2010QueryResponse = await this.acs2010Provider.getData(
      new MetricQuery(["population", "population_pct"], acsBreakdowns)
    );
    const acs2010Population = new DataFrame(acs2010QueryResponse.data);

    const breakdownColumnName = breakdowns.getSoleDemographicBreakdown()
      .columnName;

    let df = acsPopulation.merge(acs2010Population);

    console.log(df.toArray());

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

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return !breakdowns.time && breakdowns.hasExactlyOneDemographic();
  }
}

export default AcsNationalPopulationProvider;
