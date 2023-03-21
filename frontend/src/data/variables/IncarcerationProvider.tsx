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
  "jail_pct_relative_inequity",
];

export const PRISON_METRICS: MetricId[] = [
  "prison_pct_share",
  "prison_per_100k",
  "prison_ratio_age_adjusted",
  "prison_pct_relative_inequity",
];

export const INCARCERATION_METRICS: MetricId[] = [
  ...JAIL_METRICS,
  ...PRISON_METRICS,
  "total_confined_children",
  "incarceration_population_pct",
];

class IncarcerationProvider extends VariableProvider {
  constructor() {
    super("incarceration_provider", INCARCERATION_METRICS);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.geography === "national") {
      if (breakdowns.hasOnlyRace())
        return "bjs_incarceration_data-race_and_ethnicity_national";
      if (breakdowns.hasOnlyAge()) return "bjs_incarceration_data-age_national";
      if (breakdowns.hasOnlySex()) return "bjs_incarceration_data-sex_national";
    }
    if (breakdowns.geography === "state") {
      if (breakdowns.hasOnlyRace())
        return "bjs_incarceration_data-race_and_ethnicity_state";
      if (breakdowns.hasOnlyAge()) return "bjs_incarceration_data-age_state";
      if (breakdowns.hasOnlySex()) return "bjs_incarceration_data-sex_state";
    }

    if (breakdowns.geography === "county") {
      if (breakdowns.hasOnlyRace())
        return appendFipsIfNeeded(
          "vera_incarceration_county-by_race_and_ethnicity_county_time_series",
          breakdowns
        );
      if (breakdowns.hasOnlyAge())
        return appendFipsIfNeeded(
          "vera_incarceration_county-by_age_county_time_series",
          breakdowns
        );
      if (breakdowns.hasOnlySex())
        return appendFipsIfNeeded(
          "vera_incarceration_county-by_sex_county_time_series",
          breakdowns
        );
    }
    throw new Error("Not implemented");
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const variableId: VariableId | undefined = metricQuery?.variableId;
    const timeView = metricQuery.timeView;
    const datasetId = this.getDatasetId(breakdowns);
    const dataSource = await getDataManager().loadDataset(datasetId);
    let df = dataSource.toDataFrame();

    df = this.filterByGeo(df, breakdowns);

    let mostRecentYear: string = "";
    if (variableId === "prison") mostRecentYear = "2016";
    if (variableId === "jail") mostRecentYear = "2018";

    df = this.filterByTimeView(df, timeView, mostRecentYear);
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
        "decia_2010_territory_population-by_race_and_ethnicity_territory_state_level"
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
      (breakdowns.geography === "national" ||
        breakdowns.geography === "state" ||
        breakdowns.geography === "county") &&
      validDemographicBreakdownRequest
    );
  }
}

export default IncarcerationProvider;
