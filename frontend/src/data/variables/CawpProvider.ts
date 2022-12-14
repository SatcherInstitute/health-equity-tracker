import { getDataManager } from "../../utils/globals";
import { MetricId, VariableId } from "../config/MetricConfig";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { GetAcsDatasetId } from "./AcsPopulationProvider";
import VariableProvider from "./VariableProvider";
import {
  UNKNOWN_RACE,
  HISPANIC,
  MULTI,
  MULTI_OR_OTHER_STANDARD,
  UNREPRESENTED,
} from "../utils/Constants";

export const CAWP_DETERMINANTS: MetricId[] = [
  "cawp_population_pct",
  "pct_share_of_state_leg",
  "pct_share_of_women_state_leg",
  "women_state_leg_ratio_age_adjusted",
  "women_state_leg_pct_relative_inequity",
  "women_this_race_state_leg_count",
  "total_state_leg_count",
  "pct_share_of_us_congress",
  "pct_share_of_women_us_congress",
  "women_us_congress_ratio_age_adjusted",
  "women_us_congress_pct_relative_inequity",
  "women_this_race_us_congress_count",
  "total_us_congress_count",
];

export const CAWP_DATA_TYPES: VariableId[] = [
  "women_state_legislatures",
  "women_us_congress",
];

export function getWomenRaceLabel(raceLabel: string) {
  switch (raceLabel) {
    case MULTI:
      return "Women of Two or More Races";
    case MULTI_OR_OTHER_STANDARD:
      return "Women of Two or More Races & Unrepresented Race";
    case UNREPRESENTED:
      return "Women of an Unrepresented Race";
    case UNKNOWN_RACE:
      return `Women of Unknown Race`;
    case HISPANIC:
      return "Latinas and Hispanic Women";
  }
  return `${raceLabel} Women`;
}

class CawpProvider extends VariableProvider {
  constructor() {
    super("cawp_provider", ["cawp_population_pct", ...CAWP_DETERMINANTS]);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    const breakdownId =
      breakdowns.getSoleDemographicBreakdown().columnName +
      "_" +
      breakdowns.geography;

    return `cawp_time_data-${breakdownId}_time_series`;
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const timeView = metricQuery.timeView;
    const datasetId = this.getDatasetId(breakdowns);
    const cawp = await getDataManager().loadDataset(datasetId);
    let df = cawp.toDataFrame();

    df = this.filterByGeo(df, breakdowns);

    // TODO! Figure out a way to read the latest date ? is this already in place somewhere?
    df = this.filterByTimeView(df, timeView, "2022");
    df = this.renameGeoColumns(df, breakdowns);

    let consumedDatasetIds = [datasetId];

    let acsBreakdowns = breakdowns.copy();
    acsBreakdowns.time = false;

    if (
      metricQuery.metricIds.includes("cawp_population_pct") ||
      metricQuery.metricIds.includes(
        "women_us_congress_pct_relative_inequity"
      ) ||
      metricQuery.metricIds.includes("women_state_leg_pct_relative_inequity")
    ) {
      consumedDatasetIds.push(GetAcsDatasetId(breakdowns));
      if (metricQuery.breakdowns.filterFips?.isTerritory())
        consumedDatasetIds.push(
          "acs_2010_population-by_race_and_ethnicity_territory"
        );
    }
    if (metricQuery.metricIds.includes("pct_share_of_us_congress"))
      consumedDatasetIds.push("the_unitedstates_project");

    df = df.renameSeries({
      population_pct: "cawp_population_pct",
    });

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest =
      !breakdowns.time && breakdowns.hasOnlyRace();

    return (
      (breakdowns.geography === "state" ||
        breakdowns.geography === "national") &&
      validDemographicBreakdownRequest
    );
  }
}

export default CawpProvider;
