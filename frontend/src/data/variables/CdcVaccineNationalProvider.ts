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
      "vaccinated_share_of_known",
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
    } else if (
      breakdowns.geography === "state" &&
      breakdowns.getSoleDemographicBreakdown().columnName ===
        "race_and_ethnicity"
    ) {
      return "kff_vaccination-race_and_ethnicity";
    }

    return "";
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;

    const datasetId = this.getDatasetId(breakdowns);
    const vaxData = await getDataManager().loadDataset(datasetId);
    let df = vaxData.toDataFrame();

    console.log(df.toArray());

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

    console.log(df.toArray());

    if (breakdowns.geography === "national") {
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

        df = this.calculations.calculatePctShareOfKnown(
          df,
          "fully_vaccinated",
          "vaccinated_share_of_known",
          breakdownColumnName
        );
      }
    } else if (breakdowns.geography === "state") {
      df = df.generateSeries({
        vaccinated_per_100k: (row) =>
          row.vaccinated_pct == null ? null : row.vaccinated_pct * 1000,
      });

      console.log(df.toArray());
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
      (breakdowns.geography === "national" ||
        (breakdowns.geography === "state" &&
          breakdowns.getSoleDemographicBreakdown().columnName ===
            "race_and_ethnicity")) &&
      validDemographicBreakdownRequest
    );
  }
}

export default CdcVaccineNationalProvider;
