import { getDataManager } from "../../utils/globals";
import { type MetricId } from "../config/MetricConfig";
import { type Breakdowns } from "../query/Breakdowns";
import { type MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
// import { appendFipsIfNeeded } from "../utils/datasetutils";
import VariableProvider from "./VariableProvider";

export const PHRMA_DETERMINANTS: MetricId[] = [
  "sample_pct_rate",
  "sample_pct_share",
  "phrma_population_pct",
];

class PhrmaProvider extends VariableProvider {
  constructor() {
    super("phrma_provider", PHRMA_DETERMINANTS);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.geography === "national") {
      if (breakdowns.hasOnlyRace()) {
        return "phrma-race_and_ethnicity_national";
      }
      if (breakdowns.hasOnlyAge()) {
        return "phrma-age_national";
      }
      if (breakdowns.hasOnlySex()) {
        return "phrma-sex_national";
      }
    }
    if (breakdowns.geography === "state") {
      if (breakdowns.hasOnlyRace()) {
        return "phrma-race_and_ethnicity_state";
      }
      if (breakdowns.hasOnlyAge()) return "phrma-age_state";
      if (breakdowns.hasOnlySex()) return "phrma-sex_state";
    }

    if (breakdowns.geography === "county") {
      if (breakdowns.hasOnlyRace()) {
        return "phrma-race_and_ethnicity_county";
      }
      if (breakdowns.hasOnlyAge()) {
        return "phrma-age_county";
      }
      if (breakdowns.hasOnlySex()) {
        return "phrma-sex_county";
      }
    }
    throw new Error("Not implemented");
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const datasetId = this.getDatasetId(breakdowns);
    const phrma = await getDataManager().loadDataset(datasetId);
    let df = phrma.toDataFrame();

    df = this.filterByGeo(df, breakdowns);
    df = this.renameGeoColumns(df, breakdowns);
    const consumedDatasetIds = [datasetId];

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

export default PhrmaProvider;
