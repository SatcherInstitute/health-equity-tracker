import { DataFrame } from "data-forge";
import { getDataManager } from "../../utils/globals";
import { MetricId } from "../config/MetricConfig";
import { exclude } from "../query/BreakdownFilter";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { NON_HISPANIC } from "../utils/Constants";
import { joinOnCols } from "../utils/datasetutils";
import { USA_FIPS } from "../utils/Fips";
import AcsPopulationProvider from "./AcsPopulationProvider";
import VariableProvider from "./VariableProvider";

export const UHC_BROAD_AGE_DETERMINANTS: MetricId[] = [
  "brfss_population_pct",
  "copd_pct",
  "copd_pct_share",
  "copd_per_100k",
  "diabetes_pct",
  "diabetes_pct_share",
  "diabetes_per_100k",
];

export const UHC_DECADE_PLUS_5_AGE_DETERMINANTS: MetricId[] = [];

class BrfssProvider extends VariableProvider {
  private acsProvider: AcsPopulationProvider;

  constructor(acsProvider: AcsPopulationProvider) {
    super("brfss_provider", [
      "brfss_population_pct",
      ...UHC_BROAD_AGE_DETERMINANTS,
      ...UHC_DECADE_PLUS_5_AGE_DETERMINANTS,
    ]);
    this.acsProvider = acsProvider;
  }

  getDatasetId(breakdowns: Breakdowns): string {
    return "uhc_data-" + breakdowns.getSoleDemographicBreakdown().columnName;
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;

    const datasetId = this.getDatasetId(breakdowns);
    const brfss = await getDataManager().loadDataset(datasetId);
    let df = brfss.toDataFrame();

    const breakdownColumnName =
      breakdowns.getSoleDemographicBreakdown().columnName;

    df = this.filterByGeo(df, breakdowns);
    df = this.renameGeoColumns(df, breakdowns);

    let acsBreakdowns = breakdowns.copy();
    acsBreakdowns.time = false;
    acsBreakdowns = acsBreakdowns.addBreakdown(
      breakdownColumnName,
      exclude(NON_HISPANIC)
    );

    if (breakdowns.geography === "national") {
      df = df.where((row) => row.fips === USA_FIPS);
    } else if (breakdowns.geography === "state") {
      df = df.where((row) => row.fips !== USA_FIPS);
    }
    let consumedDatasetIds = [datasetId];

    const acsQueryResponse = await this.acsProvider.getData(
      new MetricQuery(["population", "population_pct"], acsBreakdowns)
    );

    consumedDatasetIds = consumedDatasetIds.concat(
      acsQueryResponse.consumedDatasetIds
    );

    const acs = new DataFrame(acsQueryResponse.data);
    df = joinOnCols(df, acs, ["fips", breakdownColumnName], "left");

    df = df.generateSeries({
      estimated_total_diabetes: (row) =>
        this.calculations.estimateTotal(row.diabetes_pct, row.population),
      estimated_total_copd: (row) =>
        this.calculations.estimateTotal(row.copd_pct, row.population),
    });

    df = df.renameSeries({
      population_pct: "brfss_population_pct",
    });

    df = df.generateSeries({
      // these determinants are percentages and need to be converted to per 100k
      diabetes_per_100k: (row) =>
        row.diabetes_pct == null ? null : row.diabetes_pct * 1000,
      copd_per_100k: (row) =>
        row.copd_pct == null ? null : row.copd_pct * 1000,
    });

    // Calculate any share_of_known metrics that may have been requested in the query
    if (this.allowsBreakdowns(breakdowns)) {
      ["estimated_total_diabetes", "estimated_total_copd"].forEach((col) => {
        df = this.calculations.calculatePctShare(
          df,
          col,
          col.replace("estimated_total_", "") + "_pct_share",
          breakdownColumnName,
          ["fips"]
        );
      });
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
    return new MetricQueryResponse(df.toArray(), consumedDatasetIds);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest =
      !breakdowns.time && breakdowns.hasExactlyOneDemographic();

    return (
      (breakdowns.geography === "state" ||
        breakdowns.geography === "national") &&
      validDemographicBreakdownRequest
    );
  }
}

export default BrfssProvider;
