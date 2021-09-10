import { DataFrame } from "data-forge";
import { getDataManager } from "../../utils/globals";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { joinOnCols } from "../utils/datasetutils";
import AcsPopulationProvider from "./AcsPopulationProvider";
import VariableProvider from "./VariableProvider";
import { ALL } from "../utils/Constants";

class VaccineProvider extends VariableProvider {
  private acsProvider: AcsPopulationProvider;

  constructor(acsProvider: AcsPopulationProvider) {
    super("vaccine_provider", [
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
    } else if (breakdowns.geography === "county") {
      return "cdc_vaccination_county-race_and_ethnicity";
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

    const breakdownColumnName = breakdowns.getSoleDemographicBreakdown()
      .columnName;

    df = this.filterByGeo(df, breakdowns);
    df = this.renameGeoColumns(df, breakdowns);
    df = this.renameTotalToAll(df, breakdownColumnName);

    let acsBreakdowns = breakdowns.copy();
    acsBreakdowns.time = false;

    let consumedDatasetIds = [datasetId];

    if (breakdowns.geography === "national" && breakdownColumnName !== "age") {
      const acsQueryResponse = await this.acsProvider.getData(
        new MetricQuery(["population_pct"], acsBreakdowns)
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
          this.calculations.per100k(row.vaccinated_first_dose, row.population),
      });

      // Calculate any share_of_known metrics that may have been requested in the query
      if (this.allowsBreakdowns(breakdowns)) {
        df = this.calculations.calculatePctShare(
          df,
          "vaccinated_first_dose",
          "vaccinated_pct_share",
          breakdownColumnName,
          ["fips"]
        );

        df = this.calculations.calculatePctShareOfKnown(
          df,
          "vaccinated_first_dose",
          "vaccinated_share_of_known",
          breakdownColumnName
        );
      }
    } else if (breakdowns.geography === "state") {
      const acsQueryResponse = await this.acsProvider.getData(
        new MetricQuery(["population_pct"], acsBreakdowns)
      );

      consumedDatasetIds = consumedDatasetIds.concat(
        acsQueryResponse.consumedDatasetIds
      );

      const acs = new DataFrame(acsQueryResponse.data);
      df = joinOnCols(df, acs, ["fips", breakdownColumnName], "left");

      df = df.renameSeries({
        population_pct: "vaccine_population_pct",
      });

      // We have to separate there because the ALL rows contain raw numbers
      // while the other rows are pre computed
      let totalDf = df.where((row) => row[breakdownColumnName] === ALL);
      let nonTotalDf = df.where((row) => row[breakdownColumnName] !== ALL);

      nonTotalDf = nonTotalDf.generateSeries({
        vaccinated_per_100k: (row) =>
          isNaN(row.vaccinated_pct) || row.vaccinated_pct == null
            ? null
            : row.vaccinated_pct * 1000 * 100,
      });

      nonTotalDf = nonTotalDf
        .generateSeries({
          vaccinated_pct_share: (row) =>
            row.vaccinated_pct_share == null || isNaN(row.vaccinated_pct_share)
              ? null
              : Math.round(row.vaccinated_pct_share * 100),
        })
        .resetIndex();

      totalDf = totalDf.generateSeries({
        vaccinated_per_100k: (row) =>
          this.calculations.per100k(row.vaccinated_first_dose, row.population),
      });

      totalDf = totalDf.generateSeries({
        vaccinated_pct_share: (row) => 100,
      });

      df = nonTotalDf.concat(totalDf).resetIndex();

      df = df
        .generateSeries({
          vaccinated_share_of_known: (row) => row["vaccinated_pct_share"],
        })
        .resetIndex();
    } else if (breakdowns.geography === "county") {
      // We merge this in on the backend, no need to redownload it here
      // but we want to provide the proper citation
      consumedDatasetIds = consumedDatasetIds.concat(
        "acs_population-by_race_county_std"
      );

      df = df.generateSeries({
        vaccinated_per_100k: (row) =>
          this.calculations.per100k(row.vaccinated_first_dose, row.population),
      });
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
            "race_and_ethnicity") ||
        (breakdowns.geography === "county" &&
          breakdowns.getSoleDemographicBreakdown().columnName ===
            "race_and_ethnicity")) &&
      validDemographicBreakdownRequest
    );
  }
}

export default VaccineProvider;
