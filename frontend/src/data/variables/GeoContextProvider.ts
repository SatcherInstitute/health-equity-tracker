import { getDataManager } from "../../utils/globals";
import { Breakdowns, GeographicBreakdown } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { appendFipsIfNeeded } from "../utils/datasetutils";
import VariableProvider from "./VariableProvider";

class GeoContextProvider extends VariableProvider {
  constructor() {
    super("geo_context_provider", ["svi", "population"]);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.geography === "national") return "geo_context-national";
    if (breakdowns.geography === "state") return "geo_context-state";
    if (breakdowns.geography === "county")
      return appendFipsIfNeeded("geo_context-county", breakdowns);

    throw new Error(`Geography-level ${breakdowns.geography}: Not implemented`);
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const datasetId = this.getDatasetId(breakdowns);
    const geoContext = await getDataManager().loadDataset(datasetId);

    let df = geoContext.toDataFrame();
    df = this.filterByGeo(df, breakdowns);
    df = this.renameGeoColumns(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);

    const isAcs2010 = breakdowns.filterFips?.needsACS2010();

    const geographyToACSDatasetMap: Record<GeographicBreakdown, string> = {
      county: isAcs2010
        ? "acs_2010_population-by_age_territory"
        : "acs_population-by_age_county",
      state: isAcs2010
        ? "acs_2010_population-by_age_territory"
        : "acs_population-by_age_state",
      national: "acs_population-by_age_national",
      // next entries are unused
      "state/territory": isAcs2010
        ? "acs_2010_population-by_age_territory"
        : "acs_population-by_age_state",
      territory: "acs_2010_population-by_age_territory",
    };

    //  determine the consumed ACS and SVI datasets
    const consumedDatasetIds = [geographyToACSDatasetMap[breakdowns.geography]];
    if (breakdowns.geography === "county")
      consumedDatasetIds.push("cdc_svi_county-age");

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return (
      (breakdowns.geography === "county" ||
        breakdowns.geography === "state" ||
        breakdowns.geography === "national") &&
      breakdowns.hasNoDemographicBreakdown()
    );
  }
}

export default GeoContextProvider;
