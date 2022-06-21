import { getDataManager } from "../../utils/globals";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { MetricId } from "../config/MetricConfig";

import VariableProvider from "./VariableProvider";

export const JAIL_METRICS: MetricId[] = [
  "jail_pct_share",
  "jail_per_100k",
  "jail_ratio_age_adjusted",
];

export const PRISON_METRICS: MetricId[] = [
  "prison_pct_share",
  "prison_per_100k",
  "prison_ratio_age_adjusted",
];

export const INCARCERATION_METRICS: MetricId[] = [
  ...JAIL_METRICS,
  ...PRISON_METRICS,
  "total_confined_children",
];

class IncarcerationProvider extends VariableProvider {
  constructor() {
    super("incarceration_provider", [
      "incarceration_population_pct",
      ...INCARCERATION_METRICS,
    ]);
  }

  getDatasetId(breakdowns: Breakdowns, dataType: string): string {
    let source = "";
    let dataType_ = "";

    if (
      breakdowns.geography === "national" ||
      breakdowns.geography === "state"
    ) {
      source = "bjs";
    }

    if (breakdowns.geography === "county") {
      source = "vera";
      dataType_ = `${dataType}_`;
    }

    return `${source}_incarceration_data-${dataType_}${
      breakdowns.getSoleDemographicBreakdown().columnName
    }_${breakdowns.geography}`;
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    let dataType = "";
    // determine JAIL vs PRISON based on the incoming requested metric ids
    if (metricQuery.metricIds.some((id) => JAIL_METRICS.includes(id)))
      dataType = "jail";
    if (metricQuery.metricIds.some((id) => PRISON_METRICS.includes(id)))
      dataType = "prison";

    const breakdowns = metricQuery.breakdowns;
    const datasetId = this.getDatasetId(breakdowns, dataType);
    const dataSource = await getDataManager().loadDataset(datasetId);
    let df = dataSource.toDataFrame();

    df = this.filterByGeo(df, breakdowns);

    df = this.renameGeoColumns(df, breakdowns);

    let consumedDatasetIds = [datasetId];

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest =
      !breakdowns.time && breakdowns.hasExactlyOneDemographic();

    return (
      breakdowns.geography === "national" ||
      breakdowns.geography === "state" ||
      breakdowns.geography === "county" ||
      validDemographicBreakdownRequest
    );
  }
}

export default IncarcerationProvider;
