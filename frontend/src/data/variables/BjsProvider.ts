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

export const COMBINED_INCARCERATION_STATES_MESSAGE =
  "Note: Alaska, Connecticut, Delaware, Hawaii, Rhode Island, and Vermont each operate an integrated system that combines prisons and jails.";

export const BJS_VARIABLE_IDS: VariableId[] = [
  "prison",
  "jail",
  "combined_incarceration",
];

export const BJS_DETERMINANTS: MetricId[] = [
  "bjs_population_pct",
  "prison_estimated_total",
  "prison_pct_share",
  "prison_per_100k",
  "prison_ratio_age_adjusted",
];

class BjsProvider extends VariableProvider {
  constructor() {
    super("bjs_provider", ["bjs_population_pct", ...BJS_DETERMINANTS]);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    return (
      "bjs_data-" +
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

    // // swap backend juvenile bucket with frontend label
    // df = df.map((row) =>
    //   row["age"] === "0-17" ? { ...row, age: UNDER_18_PRISON } : row
    // );

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
