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
      "copd_count",
      "copd_per_100k",
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
        .pivot(breakdowns.demographicBreakdowns.race.columnName, {
          fips: (series) => USA_FIPS,
          fips_name: (series) => USA_DISPLAY_NAME,
          diabetes_count: (series) => series.sum(),
          diabetes_no: (series) => series.sum(),
          copd_count: (series) => series.sum(),
          copd_no: (series) => series.sum(),
        })
        .resetIndex();
    }

    if (!breakdowns.demographicBreakdowns.race.enabled) {
      df = df.pivot(["fips", "fips_name"], {
        race: (series) => ALL_RACES_DISPLAY_NAME,
        diabetes_count: (series) => series.sum(),
        diabetes_no: (series) => series.sum(),
        copd_count: (series) => series.sum(),
        copd_no: (series) => series.sum(),
      });
    }

    if (
      breakdowns.demographicBreakdowns.race.enabled &&
      breakdowns.demographicBreakdowns.race.includeTotal
    ) {
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
    }

    df = df.generateSeries({
      diabetes_per_100k: (row) =>
        per100k(row.diabetes_count, row.diabetes_count + row.diabetes_no),
      copd_per_100k: (row) =>
        per100k(row.copd_count, row.copd_count + row.copd_no),
    });

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
