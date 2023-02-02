import { getDataManager } from "../../utils/globals";
import { MetricId } from "../config/MetricConfig";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
// import { appendFipsIfNeeded } from "../utils/datasetutils";
import VariableProvider from "./VariableProvider";

const HIV_DETERMINANTS: MetricId[] = [
  "hiv_cases_per_100k",
  "hiv_pct_share",
  "hiv_pct_relative_inequity",
  "hiv_ratio_age_adjusted",
];

class HivProvider extends VariableProvider {
  constructor() {
    super("hiv_provider", ["hiv_population_pct", ...HIV_DETERMINANTS]);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.geography === "national") {
      if (breakdowns.hasOnlyRace())
        return "cdc_hiv-race_and_ethnicity_national";
      if (breakdowns.hasOnlyAge()) return "cdc_hiv-age_national";
      if (breakdowns.hasOnlySex()) return "cdc_hiv-sex_national";
    }
    if (breakdowns.geography === "state") {
      if (breakdowns.hasOnlyRace()) return "cdc_hiv-race_and_ethnicity_state";
      if (breakdowns.hasOnlyAge()) return "cdc_hiv-age_state";
      if (breakdowns.hasOnlySex()) return "cdc_hiv-sex_state";
    }

    if (breakdowns.geography === "county") {
      if (breakdowns.hasOnlyRace()) return "cdc_hiv-race_and_ethnicity_county";
      if (breakdowns.hasOnlyAge()) return "cdc_hiv-age_county";
      if (breakdowns.hasOnlySex()) return "cdc_hiv-sex_county";
      // if (breakdowns.hasOnlyRace())
      //   return appendFipsIfNeeded("cdc_hiv-race_and_ethnicity_county", breakdowns);
      // if (breakdowns.hasOnlyAge())
      //   return appendFipsIfNeeded("cdc_hiv-age_county", breakdowns);
      // if (breakdowns.hasOnlySex())
      //   return appendFipsIfNeeded("cdc_hiv-sex_county", breakdowns);
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

    // TODO! Figure out a way to read the latest date ? is this already in place somewhere?
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
