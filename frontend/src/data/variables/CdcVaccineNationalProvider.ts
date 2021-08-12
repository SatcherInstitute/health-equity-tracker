import { DataFrame } from "data-forge";
import { getDataManager } from "../../utils/globals";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { joinOnCols } from "../utils/datasetutils";
import AcsPopulationProvider from "./AcsPopulationProvider";
import VariableProvider from "./VariableProvider";

class CdcVaccineNationalProvider extends VariableProvider {
  private acsProvider: AcsPopulationProvider;

  constructor(acsProvider: AcsPopulationProvider) {
    super("cdc_vaccine_national_provider", [
      "vaccinated_pct_share",
      "vaccinated_per_100k",
      "vaccine_population_pct",
    ]);
    this.acsProvider = acsProvider;
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.geography === "national") {
      return (
        "cdc_vaccination_national-" +
        breakdowns.getSoleDemographicBreakdown().columnName
      );
    }

    return "";
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;

    const datasetId = this.getDatasetId(breakdowns);
    const brfss = await getDataManager().loadDataset(datasetId);
    let df = brfss.toDataFrame();

    const breakdownColumnName = breakdowns.getSoleDemographicBreakdown()
      .columnName;

    df = this.filterByGeo(df, breakdowns);
    df = this.renameGeoColumns(df, breakdowns);
    df = this.renameTotalToAll(df, breakdownColumnName);

    let acsBreakdowns = breakdowns.copy();
    acsBreakdowns.time = false;

    let consumedDatasetIds = [datasetId];

    const acsQueryResponse = await this.acsProvider.getData(
      new MetricQuery(["population", "population_pct"], acsBreakdowns)
    );

    consumedDatasetIds = consumedDatasetIds.concat(
      acsQueryResponse.consumedDatasetIds
    );

    const acs = new DataFrame(acsQueryResponse.data);
    df = joinOnCols(df, acs, ["fips", breakdownColumnName], "left");

    df = df.renameSeries({
      population_pct: "vaccine_population_pct",
    });

    df = df.generateSeries({
      vaccinated_per_100k: (row) =>
        this.calculations.per100k(row.fully_vaccinated, row.population),
    });

    // Calculate any share_of_known metrics that may have been requested in the query
    if (this.allowsBreakdowns(breakdowns)) {
      df = this.calculations.calculatePctShare(
        df,
        "fully_vaccinated",
        "vaccinated_pct_share",
        breakdownColumnName,
        ["fips"]
      );
    }

    df = df.dropSeries(["population"]).resetIndex();

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);
    return new MetricQueryResponse(df.toArray(), consumedDatasetIds);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest =
      !breakdowns.time && breakdowns.hasExactlyOneDemographic();

    return (
      breakdowns.geography === "national" && validDemographicBreakdownRequest
    );
  }
}

export default CdcVaccineNationalProvider;
