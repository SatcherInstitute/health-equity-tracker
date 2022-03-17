import { getDataManager } from "../../utils/globals";
import { MetricId } from "../config/MetricConfig";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { USA_FIPS } from "../utils/Fips";
import VariableProvider from "./VariableProvider";

export const CAWP_DETERMINANTS: MetricId[] = [
  "cawp_population_pct",
  "women_state_leg_pct",
  "women_state_leg_pct_share",
];

class CawpProvider extends VariableProvider {
  constructor() {
    super("cawp_provider", ["cawp_population_pct", ...CAWP_DETERMINANTS]);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    return "cawp_data-" + breakdowns.getSoleDemographicBreakdown().columnName;
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const datasetId = this.getDatasetId(breakdowns);
    const cawp = await getDataManager().loadDataset(datasetId);
    let df = cawp.toDataFrame();

    df = this.filterByGeo(df, breakdowns);

    df = this.renameGeoColumns(df, breakdowns);

    if (breakdowns.geography === "national") {
      df = df.where((row) => row.fips === USA_FIPS);
    } else if (breakdowns.geography === "state") {
      df = df.where((row) => row.fips !== USA_FIPS);
    }

    let consumedDatasetIds = [datasetId];

    df = df.renameSeries({
      population_pct: "cawp_population_pct",
    });

    df = df
      .generateSeries({
        women_state_leg_pct_share: (row) => row["women_state_leg_pct"],
      })
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

export default CawpProvider;
