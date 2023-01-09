import { getDataManager } from "../../utils/globals";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { appendFipsIfNeeded } from "../utils/datasetutils";
import VariableProvider from "./VariableProvider";

class GeoContextProvider extends VariableProvider {
  constructor() {
    super("geo_context_provider", ["svi", "population", "population_2010"]);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.geography === "national") return "geo_context-national";
    if (breakdowns.geography === "state") return "geo_context-state";
    if (breakdowns.geography === "county")
      return appendFipsIfNeeded("geo_context_county", breakdowns);

    throw new Error(`Geography-level ${breakdowns.geography}: Not implemented`);
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    console.log({ metricQuery });

    const breakdowns = metricQuery.breakdowns;
    const datasetId = this.getDatasetId(breakdowns);
    const geoContext = await getDataManager().loadDataset(datasetId);

    let df = geoContext.toDataFrame();

    df = this.filterByGeo(df, breakdowns);
    df = this.renameGeoColumns(df, breakdowns);

    let consumedDatasetIds = [datasetId];
    // add ACS datasetID

    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return (
      breakdowns.geography === "county" ||
      breakdowns.geography === "state" ||
      breakdowns.geography === "national"
    );
  }
}

export default GeoContextProvider;
