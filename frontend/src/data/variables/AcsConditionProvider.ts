import { getDataManager } from "../../utils/globals";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import VariableProvider from "./VariableProvider";
import { appendFipsIfNeeded } from "../utils/datasetutils";

class AcsConditionProvider extends VariableProvider {
  constructor() {
    super("acs_condition_provider", [
      "uninsured_population_pct",
      "uninsured_per_100k",
      "uninsured_pct_share",
      "uninsured_ratio_age_adjusted",
      "uninsured_pct_relative_inequity",
      "poverty_population_pct",
      "poverty_per_100k",
      "poverty_pct_share",
      "poverty_ratio_age_adjusted",
      "poverty_pct_relative_inequity",
    ]);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.hasOnlyRace()) {
      if (breakdowns.geography === "county") {
        return appendFipsIfNeeded(
          "acs_condition-by_race_county_processed",
          breakdowns
        );
      } else if (breakdowns.geography === "state") {
        return "acs_condition-by_race_state_processed";
      } else if (breakdowns.geography === "national") {
        return "acs_condition-by_race_national_processed";
      }
    }
    if (breakdowns.hasOnlyAge()) {
      if (breakdowns.geography === "county") {
        return appendFipsIfNeeded(
          "acs_condition-by_age_county_processed",
          breakdowns
        );
      } else if (breakdowns.geography === "state") {
        return "acs_condition-by_age_state_processed";
      } else if (breakdowns.geography === "national") {
        return "acs_condition-by_age_national_processed";
      }
    }
    if (breakdowns.hasOnlySex()) {
      if (breakdowns.geography === "county") {
        return appendFipsIfNeeded(
          "acs_condition-by_sex_county_processed",
          breakdowns
        );
      } else if (breakdowns.geography === "state") {
        return "acs_condition-by_sex_state_processed";
      } else if (breakdowns.geography === "national") {
        return "acs_condition-by_sex_national_processed";
      }
    }

    // Fallback for future breakdowns
    throw new Error("Not implemented");
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const datasetId = this.getDatasetId(breakdowns);
    const acsDataset = await getDataManager().loadDataset(datasetId);

    let df = acsDataset.toDataFrame();

    // If requested, filter geography by state or county level
    // We apply the geo filter right away to reduce subsequent calculation times
    df = this.filterByGeo(df, breakdowns);
    df = this.renameGeoColumns(df, breakdowns);

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(df.toArray(), [datasetId]);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return breakdowns.hasExactlyOneDemographic() && !breakdowns.time;
  }
}

export default AcsConditionProvider;
