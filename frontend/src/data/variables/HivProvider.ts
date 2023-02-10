import { getDataManager } from "../../utils/globals";
import { MetricId } from "../config/MetricConfig";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { appendFipsIfNeeded } from "../utils/datasetutils";
import VariableProvider from "./VariableProvider";

export const HIV_DETERMINANTS: MetricId[] = [
  "hiv_diagnoses_per_100k",
  "hiv_diagnoses_pct_share",
  "hiv_diagnoses_pct_relative_inequity",
  "hiv_diagnoses_ratio_age_adjusted",
  "hiv_population_pct", // population shares of 13+
];

class HivProvider extends VariableProvider {
  constructor() {
    super("hiv_provider", HIV_DETERMINANTS);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.geography === "national") {
      if (breakdowns.hasOnlyRace())
        return "cdc_hiv_data-race_and_ethnicity_national";
      if (breakdowns.hasOnlyAge()) return "cdc_hiv_data-age_national";
      if (breakdowns.hasOnlySex()) return "cdc_hiv_data-sex_national";
    }
    if (breakdowns.geography === "state") {
      if (breakdowns.hasOnlyRace())
        return "cdc_hiv_data-race_and_ethnicity_state";
      if (breakdowns.hasOnlyAge()) return "cdc_hiv_data-age_state";
      if (breakdowns.hasOnlySex()) return "cdc_hiv_data-sex_state";
    }

    if (breakdowns.geography === "county") {
      if (breakdowns.hasOnlyRace())
        return appendFipsIfNeeded(
          "cdc_hiv_data-race_and_ethnicity_county",
          breakdowns
        );
      if (breakdowns.hasOnlyAge())
        return appendFipsIfNeeded("cdc_hiv_data-age_county", breakdowns);
      if (breakdowns.hasOnlySex())
        return appendFipsIfNeeded("cdc_hiv_data-sex_county", breakdowns);
    }
    throw new Error("Not implemented");
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const datasetId = this.getDatasetId(breakdowns);
    const hiv = await getDataManager().loadDataset(datasetId);
    let df = hiv.toDataFrame();

    df = this.filterByGeo(df, breakdowns);
    df = this.renameGeoColumns(df, breakdowns);

    let consumedDatasetIds = [datasetId];

    df = df.renameSeries({
      population_pct: "hiv_population_pct",
    });

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest =
      !breakdowns.time && breakdowns.hasExactlyOneDemographic();

    return (
      (breakdowns.geography === "county" ||
        breakdowns.geography === "state" ||
        breakdowns.geography === "national") &&
      validDemographicBreakdownRequest
    );
  }
}

export default HivProvider;
