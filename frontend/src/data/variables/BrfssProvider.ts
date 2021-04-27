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
import { ALL } from "../utils/Constants";

class BrfssProvider extends VariableProvider {
  private acsProvider: AcsPopulationProvider;

  constructor(acsProvider: AcsPopulationProvider) {
    super("brfss_provider", [
      "diabetes_count",
      "diabetes_per_100k",
      "diabetes_pct_share",
      "copd_count",
      "copd_per_100k",
      "copd_pct_share",
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

    // ALERT! KEEP IN SYNC! Make sure you update DataSourceMetadata if you update dataset IDs
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

    df = joinOnCols(
      df,
      new DataFrame(acsStateQueryResponse.data),
      ["fips", breakdownColumnName],
      "left"
    );

    if (breakdowns.geography === "national") {
      // Because BRFSS is a survey that samples each demographic
      // in each state at different rates, we must calculate the national
      // numbers by estimating the total number of diabetes and COPD
      // cases per demographic in each state and taking the sum.

      df = df.generateSeries({
        estimated_total_diabetes: (row) =>
          estimateTotal(
            row.diabetes_count,
            row.diabetes_count + row.diabetes_no,
            row.population
          ),
        estimated_total_copd: (row) =>
          estimateTotal(
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
      acsBreakdowns.geography = "national";
      const acsNationalQueryResponse = await this.acsProvider.getData(
        new MetricQuery(["population_pct"], acsBreakdowns)
      );
      consumedDatasetIds = consumedDatasetIds.concat(
        acsNationalQueryResponse.consumedDatasetIds
      );

      df = joinOnCols(
        df,
        new DataFrame(acsNationalQueryResponse.data),
        ["fips", breakdownColumnName],
        "left"
      );
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
        brfss_population_pct: (series) => series.sum(),
      })
      .resetIndex();
    df = df.concat(total).resetIndex();

    df = df.generateSeries({
      diabetes_per_100k: (row) =>
        per100k(row.diabetes_count, row.diabetes_count + row.diabetes_no),
      copd_per_100k: (row) =>
        per100k(row.copd_count, row.copd_count + row.copd_no),
    });

    if (breakdowns.hasOnlyRace()) {
      if (breakdowns.geography === "state") {
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
