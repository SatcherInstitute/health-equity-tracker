import { DataFrame } from "data-forge";
import { Breakdowns, ALL_RACES_DISPLAY_NAME } from "../query/Breakdowns";
import {
  per100k,
  maybeApplyRowReorder,
  joinOnCols,
  estimateTotal,
} from "../utils/datasetutils";
import { USA_FIPS, USA_DISPLAY_NAME } from "../utils/Fips";
import VariableProvider from "./VariableProvider";
import AcsPopulationProvider from "./AcsPopulationProvider";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { getDataManager } from "../../utils/globals";
import { ALL, NON_HISPANIC } from "../utils/Constants";
import { exclude } from "../query/BreakdownFilter";

class BrfssProvider extends VariableProvider {
  private acsProvider: AcsPopulationProvider;

  constructor(acsProvider: AcsPopulationProvider) {
    super("brfss_provider", [
      "diabetes_count",
      "diabetes_per_100k",
      "diabetes_pct_share",
      "diabetes_count_share_of_known",
      "copd_count",
      "copd_per_100k",
      "copd_pct_share",
      "copd_count_share_of_known",
      "brfss_population_pct",
    ]);
    this.acsProvider = acsProvider;
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const brfss = await getDataManager().loadDataset("brfss");
    let df = brfss.toDataFrame();

    const breakdownColumnName = breakdowns.getSoleDemographicBreakdown()
      .columnName;

    df = this.filterByGeo(df, breakdowns);
    df = this.renameGeoColumns(df, breakdowns);

    // TODO How to handle territories?
    let acsBreakdowns = breakdowns.copy();
    acsBreakdowns.time = false;
    acsBreakdowns = acsBreakdowns.addBreakdown(
      breakdownColumnName,
      exclude(NON_HISPANIC)
    );
    let consumedDatasetIds = ["brfss"];

    if (breakdowns.geography === "national") {
      // So we can calculate the estimated disease prevalence
      // for each state.
      acsBreakdowns.geography = "state";
    }

    const acsStateQueryResponse = await this.acsProvider.getData(
      new MetricQuery(["population", "population_pct"], acsBreakdowns)
    );
    consumedDatasetIds = consumedDatasetIds.concat(
      acsStateQueryResponse.consumedDatasetIds
    );

    const acsState = new DataFrame(acsStateQueryResponse.data);
    df = joinOnCols(df, acsState, ["fips", breakdownColumnName], "left");

    var acsNational: DataFrame;
    if (breakdowns.geography === "national") {
      // Because BRFSS is a survey that samples each demographic
      // in each state at different rates, we must calculate the national
      // numbers by estimating the total number of diabetes and COPD
      // cases per demographic in each state and taking the sum.
      acsBreakdowns.geography = "national";
      const acsNationalQueryResponse = await this.acsProvider.getData(
        new MetricQuery(["population_pct"], acsBreakdowns)
      );
      consumedDatasetIds = consumedDatasetIds.concat(
        acsNationalQueryResponse.consumedDatasetIds
      );

      acsNational = new DataFrame(acsNationalQueryResponse.data);

      let stateTotalsDiabetes = df
        .pivot("fips", {
          diabetes_no: (series) => series.sum(),
          diabetes_count: (series) => series.sum(),
        })
        .resetIndex();

      stateTotalsDiabetes = stateTotalsDiabetes
        .generateSeries({
          total_sample_size: (row) => row.diabetes_no + row.diabetes_count,
        })
        .resetIndex();

      let stateTotalsCopd = df
        .pivot("fips", {
          copd_no: (series) => series.sum(),
          copd_count: (series) => series.sum(),
        })
        .resetIndex();

      stateTotalsCopd = stateTotalsCopd
        .generateSeries({
          total_sample_size: (row) => row.copd_no + row.copd_count,
        })
        .resetIndex();

      df = df.generateSeries({
        estimated_total_diabetes: (row) =>
          estimateTotal(
            row,
            acsState,
            stateTotalsDiabetes,
            row.diabetes_count,
            row.diabetes_count + row.diabetes_no,
            row.population
          ),
        estimated_total_copd: (row) =>
          estimateTotal(
            row,
            acsState,
            stateTotalsCopd,
            row.copd_count,
            row.copd_count + row.copd_no,
            row.population
          ),
      });

      df = df
        .pivot(breakdownColumnName, {
          fips: (series) => USA_FIPS,
          fips_name: (series) => USA_DISPLAY_NAME,
          diabetes_count: (series) => series.sum(),
          diabetes_no: (series) => series.sum(),
          copd_count: (series) => series.sum(),
          copd_no: (series) => series.sum(),
          estimated_total_copd: (series) => series.sum(),
          estimated_total_diabetes: (series) => series.sum(),
        })
        .resetIndex();

      // We need to get the national acs dataset here in order to
      // get the national pct share of population for each state.
      //
      // TODO: remove both calls to the ACS provider once we
      // automatically merge ACS data in the backend

      df = joinOnCols(df, acsNational, ["fips", breakdownColumnName], "left");
    }

    df = df.renameSeries({
      population_pct: "brfss_population_pct",
    });

    if (!breakdowns.demographicBreakdowns.race_and_ethnicity.enabled) {
      df = df.pivot(["fips", "fips_name"], {
        race: (series) => ALL_RACES_DISPLAY_NAME,
        diabetes_count: (series) => series.sum(),
        diabetes_no: (series) => series.sum(),
        copd_count: (series) => series.sum(),
        copd_no: (series) => series.sum(),
      });
    }

    // Calculate totals where dataset doesn't provide it
    // TODO- this should be removed when Totals come from the Data Server
    const total = df
      .pivot(["fips", "fips_name"], {
        diabetes_count: (series) => series.sum(),
        diabetes_no: (series) => series.sum(),
        copd_count: (series) => series.sum(),
        copd_no: (series) => series.sum(),
        estimated_total_copd: (series) => series.sum(),
        estimated_total_diabetes: (series) => series.sum(),
        [breakdownColumnName]: (series) => ALL,
        population: (series) =>
          series.where((population) => !isNaN(population)).sum(),
        brfss_population_pct: (series) =>
          series
            .where((brfss_population_pct) => !isNaN(brfss_population_pct))
            .sum(),
      })
      .resetIndex();
    df = df.concat(total).resetIndex();

    df = df.generateSeries({
      diabetes_per_100k: (row) =>
        per100k(row.diabetes_count, row.diabetes_count + row.diabetes_no),
      copd_per_100k: (row) =>
        per100k(row.copd_count, row.copd_count + row.copd_no),
    });

    // Calculate any share_of_known metrics that may have been requested in the query

    if (breakdowns.hasOnlyRace()) {
      if (breakdowns.geography === "state") {
        const shareOfUnknownMetrics = metricQuery.metricIds.filter((metricId) =>
          [
            "copd_count_share_of_known",
            "diabetes_count_share_of_known",
          ].includes(metricId)
        );
        shareOfUnknownMetrics.forEach((shareOfUnknownColumnName) => {
          const rawCountColunn = shareOfUnknownColumnName.slice(
            0,
            -"_share_of_known".length
          );
          df = this.calculatePctShareOfKnown(
            df,
            rawCountColunn,
            shareOfUnknownColumnName,
            breakdownColumnName
          );
        });

        ["diabetes_count", "copd_count"].forEach((col) => {
          df = this.calculatePctShare(
            df,
            col,
            col.split("_")[0] + "_pct_share",
            breakdownColumnName,
            ["fips"]
          );
        });
      } else if (breakdowns.geography === "national") {
        const shareOfUnknownMetrics = metricQuery.metricIds.filter((metricId) =>
          [
            "copd_count_share_of_known",
            "diabetes_count_share_of_known",
          ].includes(metricId)
        );

        shareOfUnknownMetrics.forEach((shareOfUnknownColumnName) => {
          const rawCountColunn = shareOfUnknownColumnName.slice(
            0,
            -"_count_share_of_known".length
          );
          df = this.calculatePctShareOfKnown(
            df,
            "estimated_total_" + rawCountColunn,
            shareOfUnknownColumnName,
            breakdownColumnName
          );
        });

        ["estimated_total_diabetes", "estimated_total_copd"].forEach((col) => {
          df = this.calculatePctShare(
            df,
            col,
            col.split("_")[2] + "_pct_share",
            breakdownColumnName,
            ["fips"]
          );
        });
      }
    }

    df = df
      .dropSeries([
        "population",
        "estimated_total_copd",
        "estimated_total_diabetes",
      ])
      .resetIndex();

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);
    return new MetricQueryResponse(
      maybeApplyRowReorder(df.toArray(), breakdowns),
      consumedDatasetIds
    );
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest =
      breakdowns.demographicBreakdownCount() === 0 || breakdowns.hasOnlyRace();

    return (
      !breakdowns.time &&
      (breakdowns.geography === "state" ||
        breakdowns.geography === "national") &&
      validDemographicBreakdownRequest
    );
  }
}

export default BrfssProvider;
