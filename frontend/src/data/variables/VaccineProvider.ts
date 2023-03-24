import { getDataManager } from "../../utils/globals";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { appendFipsIfNeeded } from "../utils/datasetutils";
import { GetAcsDatasetId } from "./AcsPopulationProvider";
import AcsPopulationProvider from "./AcsPopulationProvider";
import VariableProvider from "./VariableProvider";
import { RACE } from "../utils/Constants";

class VaccineProvider extends VariableProvider {
  private acsProvider: AcsPopulationProvider;

  constructor(acsProvider: AcsPopulationProvider) {
    super("vaccine_provider", [
      "acs_vaccinated_pop_pct",
      "vaccinated_pct_share",
      "vaccinated_per_100k",
      "vaccinated_pop_pct",
      "vaccinated_ratio_age_adjusted",
      "vaccinated_pct_relative_inequity",
    ]);
    this.acsProvider = acsProvider;
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.geography === "national") {
      if (breakdowns.hasOnlyRace()) {
        return "cdc_vaccination_national-race_processed";
      } else if (breakdowns.hasOnlySex()) {
        return "cdc_vaccination_national-sex_processed";
      } else if (breakdowns.hasOnlyAge()) {
        return "cdc_vaccination_national-age_processed";
      }
    } else if (breakdowns.geography === "state" && breakdowns.hasOnlyRace()) {
      return "kff_vaccination-race_and_ethnicity_processed";
    } else if (breakdowns.geography === "county") {
      return appendFipsIfNeeded(
        "cdc_vaccination_county-race_and_ethnicity_processed",
        breakdowns
      );
    }
    throw new Error("Not implemented");
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const timeView = metricQuery.timeView;

    const datasetId = this.getDatasetId(breakdowns);
    const vaxData = await getDataManager().loadDataset(datasetId);
    let df = vaxData.toDataFrame();

    df = this.filterByTimeView(df, timeView);

    df = this.filterByGeo(df, breakdowns);
    df = this.renameGeoColumns(df, breakdowns);

    let acsBreakdowns = breakdowns.copy();
    acsBreakdowns.time = false;

    let consumedDatasetIds = [datasetId];

    if (breakdowns.geography === "national") {
      consumedDatasetIds = consumedDatasetIds.concat(
        GetAcsDatasetId(breakdowns)
      );
    } else if (breakdowns.geography === "state") {
      consumedDatasetIds = consumedDatasetIds.concat(
        "acs_population-by_race_state",
        "acs_2010_population-by_race_and_ethnicity_territory"
      );
    } else if (breakdowns.geography === "county") {
      // We merge this in on the backend, no need to redownload it here
      // but we want to provide the proper citation
      consumedDatasetIds = consumedDatasetIds.concat(
        "acs_population-by_race_county"
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
        (breakdowns.geography === "state" &&
          breakdowns.getSoleDemographicBreakdown().columnName === RACE) ||
        (breakdowns.geography === "county" &&
          breakdowns.getSoleDemographicBreakdown().columnName === RACE)) &&
      validDemographicBreakdownRequest
    );
  }
}

export default VaccineProvider;
