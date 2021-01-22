import { Breakdowns, ALL_RACES_DISPLAY_NAME } from "../Breakdowns";
import { Dataset } from "../DatasetTypes";
import { per100k } from "../datasetutils";
import { USA_FIPS, USA_DISPLAY_NAME } from "../../utils/madlib/Fips";
import VariableProvider from "./VariableProvider";
import { MetricQueryResponse } from "../MetricQuery";

class BrfssProvider extends VariableProvider {
  constructor() {
    super(
      "brfss_provider",
      ["diabetes_count", "diabetes_per_100k", "copd_count", "copd_per_100k"],
      ["brfss"]
    );
  }

  getDataInternal(
    datasets: Record<string, Dataset>,
    breakdowns: Breakdowns
  ): MetricQueryResponse {
    const brfss = datasets["brfss"];
    let df = brfss.toDataFrame();

    if (breakdowns.geography === "national") {
      df = df.pivot("race_and_ethnicity", {
        state_fips: (series) => USA_FIPS,
        state_name: (series) => USA_DISPLAY_NAME,
        diabetes_count: (series) => series.sum(),
        diabetes_no: (series) => series.sum(),
        copd_count: (series) => series.sum(),
        copd_no: (series) => series.sum(),
      });
    }

    if (breakdowns.filterFips) {
      df = df.where((row) => row.state_fips === breakdowns.filterFips);
    }

    if (!breakdowns.race) {
      df = df.pivot(["state_name", "state_fips"], {
        race: (series) => ALL_RACES_DISPLAY_NAME,
        diabetes_count: (series) => series.sum(),
        diabetes_no: (series) => series.sum(),
        copd_count: (series) => series.sum(),
        copd_no: (series) => series.sum(),
      });
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
      breakdowns.demographicBreakdownCount() === 0 ||
      (breakdowns.demographicBreakdownCount() === 1 && breakdowns.race);

    return (
      !breakdowns.time &&
      (breakdowns.geography === "state" ||
        breakdowns.geography === "national") &&
      validDemographicBreakdownRequest
    );
  }
}

export default BrfssProvider;
