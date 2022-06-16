import React from "react";
import { getDataManager } from "../../utils/globals";
import { MetricId, VariableId } from "../config/MetricConfig";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { GetAcsDatasetId } from "./AcsPopulationProvider";
import VariableProvider from "./VariableProvider";

// states with combined prison and jail systems
export const COMBINED_INCARCERATION_STATES_LIST = [
  "Alaska",
  "Connecticut",
  "Delaware",
  "Hawaii",
  "Rhode Island",
  "Vermont",
];

export const SENTENCED_PRISONERS_MESSAGE =
  "The rates presented for the ‘Age’ filtered reports measure from those represents individuals under the jurisdiction of an adult prison facility who have been sentenced";

export const COMBINED_INCARCERATION_STATES_MESSAGE =
  "Alaska, Connecticut, Delaware, Hawaii, Rhode Island, and Vermont each operate an integrated system that combines prisons and jails, which are included here as prison facilities.";

export const COMBINED_QUALIFIER = "combined prison and jail";

export const MISSING_PRISON_DATA =
  "The rates presented for imprisonment nationally do not include individuals under the jurisdiction of territorial, military, or Indian Country facilities.";

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

export const ALASKA_PRIVATE_JAIL_CAVEAT =
  "In addition, Alaska contracts with a small network of private jails, which are included here only as jail facilities.";

export const BJS_VARIABLE_IDS: VariableId[] = ["prison", "jail"];

export const BJS_DETERMINANTS: MetricId[] = [
  "bjs_population_pct",
  "prison_pct_share",
  "prison_per_100k",
  "prison_ratio_age_adjusted",
  "jail_pct_share",
  "jail_per_100k",
  "jail_ratio_age_adjusted",
  "total_confined_children",
];

class BjsProvider extends VariableProvider {
  constructor() {
    super("bjs_provider", ["bjs_population_pct", ...BJS_DETERMINANTS]);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    return (
      "bjs_incarceration_data-" +
      breakdowns.getSoleDemographicBreakdown().columnName +
      "_" +
      breakdowns.geography
    );
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const datasetId = this.getDatasetId(breakdowns);
    const bjs = await getDataManager().loadDataset(datasetId);
    let df = bjs.toDataFrame();

    df = this.filterByGeo(df, breakdowns);

    df = this.renameGeoColumns(df, breakdowns);

    let consumedDatasetIds = [datasetId];

    let acsBreakdowns = breakdowns.copy();
    acsBreakdowns.time = false;

    const acsDatasetId = GetAcsDatasetId(breakdowns);
    consumedDatasetIds.push(acsDatasetId);

    consumedDatasetIds.push(
      "acs_2010_population-by_race_and_ethnicity_territory" // We merge this in on the backend
    );

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

export default BjsProvider;
