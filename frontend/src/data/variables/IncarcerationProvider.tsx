import React from "react";
import { getDataManager } from "../../utils/globals";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { MetricId, VariableId } from "../config/MetricConfig";
import VariableProvider from "./VariableProvider";
import { GetAcsDatasetId } from "./AcsPopulationProvider";
import { appendFipsIfNeeded } from "../utils/datasetutils";

export function CombinedIncarcerationStateMessage() {
  return (
    <>
      <b>Alaska</b>, <b>Connecticut</b>, <b>Delaware</b>, <b>Hawaii</b>,{" "}
      <b>Rhode Island</b>, and <b>Vermont</b> each operate an integrated system
      that combines both prisons and jails; for our reports these are treated
      only as prison facilities.
    </>
  );
}

// states with combined prison and jail systems
export const COMBINED_INCARCERATION_STATES_LIST = [
  "Alaska",
  "Connecticut",
  "Delaware",
  "Hawaii",
  "Rhode Island",
  "Vermont",
];

export const COMBINED_QUALIFIER = "(combined prison and jail)";
export const PRIVATE_JAILS_QUALIFIER = "(private jail system only)";
export const ALASKA_PRIVATE_JAIL_CAVEAT =
  "In addition, Alaska contracts with a small network of private jails, which are included here only as jail facilities.";

export const INCARCERATION_IDS: VariableId[] = ["prison", "jail"];

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
    let detail = "";

    if (
      breakdowns.geography === "national" ||
      breakdowns.geography === "state"
    ) {
      source = "bjs";
      detail = "data";
    }

    if (breakdowns.geography === "county") {
      source = "vera";
      dataType_ = `${dataType}_`;
      detail = "county";
    }

    const baseId = `${source}_incarceration_${detail}-${dataType_}${
      breakdowns.getSoleDemographicBreakdown().columnName
    }_${breakdowns.geography}`;

    return appendFipsIfNeeded(baseId, breakdowns);
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;

    let dataType = "";
    // determine JAIL vs PRISON based on the incoming requested metric ids

    if (breakdowns.geography === "county") {
      if (metricQuery.metricIds.some((id) => JAIL_METRICS.includes(id)))
        dataType = "jail";
      else if (metricQuery.metricIds.some((id) => PRISON_METRICS.includes(id)))
        dataType = "prison";
    }

    const datasetId = this.getDatasetId(breakdowns, dataType);
    const dataSource = await getDataManager().loadDataset(datasetId);
    let df = dataSource.toDataFrame();

    df = this.filterByGeo(df, breakdowns);

    df = this.renameGeoColumns(df, breakdowns);

    const consumedDatasetIds = [datasetId];

    if (breakdowns.geography !== "county") {
      consumedDatasetIds.push(GetAcsDatasetId(breakdowns));
    }

    if (
      breakdowns.geography === "national" ||
      breakdowns.geography === "territory"
    ) {
      consumedDatasetIds.push(
        "acs_2010_population-by_race_and_ethnicity_territory"
      );
    }

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
