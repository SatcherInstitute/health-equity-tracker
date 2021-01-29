import { Breakdowns, ALL_RACES_DISPLAY_NAME } from "../Breakdowns";
import { per100k } from "../datasetutils";
import { USA_FIPS, USA_DISPLAY_NAME } from "../../utils/madlib/Fips";
import VariableProvider from "./VariableProvider";
import { MetricQuery, MetricQueryResponse } from "../MetricQuery";
import { getDataManager } from "../../utils/globals";
import { TOTAL } from "../Constants";

class BrfssProvider extends VariableProvider {
  constructor() {
    super("brfss_provider", [
      "diabetes_count",
      "diabetes_per_100k",
      "diabetes_pct_share",
      "copd_count",
      "copd_per_100k",
      "copd_pct_share",
    ]);
  }

  // TODO - only return requested metric queries, remove unrequested columns
  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const brfss = await getDataManager().loadDataset("brfss");
    let df = brfss.toDataFrame();

    df = this.filterByGeo(df, breakdowns);
    df = this.renameGeoColumns(df, breakdowns);

    if (breakdowns.geography === "national") {
      df = df
        .pivot(breakdowns.demographicBreakdowns.race_and_ethnicity.columnName, {
          fips: (series) => USA_FIPS,
          fips_name: (series) => USA_DISPLAY_NAME,
          diabetes_count: (series) => series.sum(),
          diabetes_no: (series) => series.sum(),
          copd_count: (series) => series.sum(),
          copd_no: (series) => series.sum(),
        })
        .resetIndex();
    }

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
        race_and_ethnicity: (series) => TOTAL,
      })
      .resetIndex();
    df = df.concat(total).resetIndex();

    df = df.generateSeries({
      diabetes_per_100k: (row) =>
        per100k(row.diabetes_count, row.diabetes_count + row.diabetes_no),
      copd_per_100k: (row) =>
        per100k(row.copd_count, row.copd_count + row.copd_no),
    });

    // We can't do percent share for national because different survey rates
    // across states may skew the results. To do that, we need to combine BRFSS
    // survey results with state populations to estimate total counts for each
    // state, and then use that estimate to determine the percent share.
    // TODO this causes the "vs Population" Disparity Bar Chart to be broken for
    // the national level. We need some way of indicating why the share of cases
    // isn't there. Or, we can do this computation on the server.
    if (breakdowns.hasOnlyRace() && breakdowns.geography === "state") {
      ["diabetes_count", "copd_count"].forEach((col) => {
        df = this.calculatePctShare(
          df,
          col,
          col.split("_")[0] + "_pct_share",
          breakdowns.demographicBreakdowns.race_and_ethnicity.columnName,
          ["fips"]
        );
      });
    }

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    return new MetricQueryResponse(df.toArray(), ["brfss"]);
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
