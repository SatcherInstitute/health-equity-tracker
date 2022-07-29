import { DataFrame } from "data-forge";
import { getDataManager } from "../../utils/globals";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { joinOnCols } from "../utils/datasetutils";
import { GetAcsDatasetId } from "./AcsPopulationProvider";
import AcsPopulationProvider from "./AcsPopulationProvider";
import VariableProvider from "./VariableProvider";
import { ALL, CROSS_SECTIONAL, RACE } from "../utils/Constants";

class VaccineProvider extends VariableProvider {
  private acsProvider: AcsPopulationProvider;

  constructor(acsProvider: AcsPopulationProvider) {
    super("vaccine_provider", [
      "acs_vaccine_population_pct",
      "vaccinated_pct_share",
      "vaccinated_share_of_known",
      "vaccinated_per_100k",
      "vaccine_population_pct",
      "vaccinated_ratio_age_adjusted",
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
      breakdowns.getSoleDemographicBreakdown().columnName === RACE
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
    const timeView = metricQuery.timeView;

    const datasetId = this.getDatasetId(breakdowns);
    const vaxData = await getDataManager().loadDataset(datasetId);
    let df = vaxData.toDataFrame();

    const breakdownColumnName =
      breakdowns.getSoleDemographicBreakdown().columnName;

    df = this.filterByGeo(df, breakdowns);
    df = this.filterByTimeView(df, timeView);
    df = this.renameGeoColumns(df, breakdowns);

    let acsBreakdowns = breakdowns.copy();
    acsBreakdowns.time = false;

    let consumedDatasetIds = [datasetId];

    if (breakdowns.geography === "national") {
      if (breakdownColumnName !== "age") {
        const acsQueryResponse = await this.acsProvider.getData(
          new MetricQuery(["population_pct"], acsBreakdowns, CROSS_SECTIONAL)
        );

        consumedDatasetIds = consumedDatasetIds.concat(
          acsQueryResponse.consumedDatasetIds
        );

        // We merge this in on the backend
        consumedDatasetIds = consumedDatasetIds.concat(
          "acs_2010_population-by_race_and_ethnicity_territory"
        );

        const acs = new DataFrame(acsQueryResponse.data);
        df = joinOnCols(df, acs, ["fips", breakdownColumnName], "left");
      }

      df = df.renameSeries({
        population_pct: "vaccine_population_pct",
      });

      df = df
        .generateSeries({
          vaccinated_pct_share: (row) => row["vaccinated_share_of_known"],
        })
        .resetIndex();
    } else if (breakdowns.geography === "state") {
      df = df
        .generateSeries({
          vaccinated_pct_share: (row) =>
            row.vaccinated_pct_share == null ||
            isNaN(row.vaccinated_pct_share) ||
            row.vaccinated_pct_share === 0
              ? null
              : Math.round(row.vaccinated_pct_share * 100),
        })
        .resetIndex();

      df = df
        .generateSeries({
          population_pct: (row) =>
            isNaN(row.population_pct) ||
            row.population_pct == null ||
            row.population_pct === 0
              ? null
              : Math.round(row.population_pct * 100),
        })
        .resetIndex();

      df = df
        .generateSeries({
          vaccinated_per_100k: (row) =>
            isNaN(row.vaccinated_pct) ||
            row.vaccinated_pct == null ||
            row.vaccinated_pct === 0
              ? null
              : Math.round(row.vaccinated_pct * 1000 * 100),
        })
        .resetIndex();

      df = df
        .renameSeries({
          population_pct: "vaccine_population_pct",
        })
        .resetIndex();

      const acsDatasetId = GetAcsDatasetId(breakdowns);
      consumedDatasetIds = consumedDatasetIds.concat(acsDatasetId);

      // We have to separate there because the ALL rows contain raw numbers
      // while the other rows are pre computed
      let totalDf = df.where((row) => row[breakdownColumnName] === ALL);
      const nonTotalDf = df.where((row) => row[breakdownColumnName] !== ALL);

      totalDf = totalDf
        .generateSeries({
          vaccinated_per_100k: (row) =>
            this.calculations.per100k(
              row.vaccinated_first_dose,
              row.population
            ),
        })
        .resetIndex();

      totalDf = totalDf
        .generateSeries({
          vaccinated_pct_share: (row) => 100,
        })
        .resetIndex();

      df = totalDf.concat(nonTotalDf).resetIndex();

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
          breakdowns.getSoleDemographicBreakdown().columnName === RACE) ||
        (breakdowns.geography === "county" &&
          breakdowns.getSoleDemographicBreakdown().columnName === RACE)) &&
      validDemographicBreakdownRequest
    );
  }
}

export default VaccineProvider;
