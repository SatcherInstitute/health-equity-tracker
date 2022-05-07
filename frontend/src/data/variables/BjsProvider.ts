import { getDataManager } from "../../utils/globals";
import { MetricId } from "../config/MetricConfig";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { GetAcsDatasetId } from "./AcsPopulationProvider";
import VariableProvider from "./VariableProvider";

export const BJS_DETERMINANTS: MetricId[] = [
  "bjs_population_pct",
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

    df = df.renameSeries({
      population_pct: "bjs_population_pct",
    });

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
    // return (
    //   (
    //     breakdowns.geography === "national") &&
    //   validDemographicBreakdownRequest
    // );
  }
}

export default BjsProvider;
