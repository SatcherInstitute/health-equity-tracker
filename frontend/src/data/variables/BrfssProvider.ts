import { DataFrame } from "data-forge";
import { Breakdowns } from "../query/Breakdowns";
import {
  maybeApplyRowReorder,
  joinOnCols,
  estimateTotal,
} from "../utils/datasetutils";
import { USA_FIPS } from "../utils/Fips";
import VariableProvider from "./VariableProvider";
import AcsPopulationProvider from "./AcsPopulationProvider";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { getDataManager } from "../../utils/globals";
import { NON_HISPANIC } from "../utils/Constants";
import { exclude } from "../query/BreakdownFilter";

class BrfssProvider extends VariableProvider {
  private acsProvider: AcsPopulationProvider;

  constructor(acsProvider: AcsPopulationProvider) {
    super("brfss_provider", [
      "brfss_population_pct",
      "copd_pct",
      "copd_pct_share",
      "copd_per_100k",
      "diabetes_pct",
      "diabetes_pct_share",
      "diabetes_per_100k",
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

    if (breakdowns.geography === "national") {
      df = df.where((row) => row.fips === USA_FIPS);
    } else if (breakdowns.geography === "state") {
      df = df.where((row) => row.fips !== USA_FIPS);
    }
    let consumedDatasetIds = ["brfss"];

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
        estimateTotal(row.diabetes_pct, row.population),
      estimated_total_copd: (row) =>
        estimateTotal(row.copd_pct, row.population),
    });

    df = df.renameSeries({
      population_pct: "brfss_population_pct",
    });

    df = df.generateSeries({
      diabetes_per_100k: (row) =>
        row.diabetes_pct == null ? null : row.diabetes_pct * 1000,
      copd_per_100k: (row) =>
        row.copd_pct == null ? null : row.copd_pct * 1000,
    });

    // Calculate any share_of_known metrics that may have been requested in the query
    if (breakdowns.hasOnlyRace()) {
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
