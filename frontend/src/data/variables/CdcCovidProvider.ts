import { getDataManager } from "../../utils/globals";
import { Breakdowns, TimeView } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { GetAcsDatasetId } from "./AcsPopulationProvider";
import AcsPopulationProvider from "./AcsPopulationProvider";
import VariableProvider from "./VariableProvider";
import { CROSS_SECTIONAL, TIME_SERIES } from "../utils/Constants";
import { appendFipsIfNeeded } from "../utils/datasetutils";

class CdcCovidProvider extends VariableProvider {
  private acsProvider: AcsPopulationProvider;

  constructor(acsProvider: AcsPopulationProvider) {
    super("cdc_covid_provider", [
      "covid_cases",
      "covid_deaths",
      "covid_hosp",
      "covid_cases_share",
      "covid_deaths_share",
      "covid_hosp_share",
      "covid_cases_share_of_known",
      "covid_deaths_share_of_known",
      "covid_hosp_share_of_known",
      "covid_deaths_per_100k",
      "covid_cases_per_100k",
      "covid_hosp_per_100k",
      "death_ratio_age_adjusted",
      "hosp_ratio_age_adjusted",
      "cases_ratio_age_adjusted",
      "covid_population_pct",
      "covid_cases_pct_relative_inequity",
      "covid_deaths_pct_relative_inequity",
      "covid_hosp_pct_relative_inequity",
    ]);
    this.acsProvider = acsProvider;
  }

  // ALERT! KEEP IN SYNC! Make sure you update data/config/DatasetMetadata AND data/config/MetadataMap.ts if you update dataset IDs
  getDatasetId(breakdowns: Breakdowns, timeView: TimeView): string {
    if (timeView === CROSS_SECTIONAL) {
      if (breakdowns.hasOnlyRace()) {
        if (breakdowns.geography === "county") {
          return appendFipsIfNeeded(
            "cdc_restricted_data-by_race_county_processed",
            breakdowns
          );
        } else if (breakdowns.geography === "state") {
          return "cdc_restricted_data-by_race_state_processed-with_age_adjust";
        } else if (breakdowns.geography === "national") {
          return "cdc_restricted_data-by_race_national_processed-with_age_adjust";
        }
      }
      if (breakdowns.hasOnlyAge()) {
        if (breakdowns.geography === "county") {
          return appendFipsIfNeeded(
            "cdc_restricted_data-by_age_county_processed",
            breakdowns
          );
        } else if (breakdowns.geography === "state") {
          return "cdc_restricted_data-by_age_state_processed";
        } else if (breakdowns.geography === "national") {
          return "cdc_restricted_data-by_age_national_processed";
        }
      }
      if (breakdowns.hasOnlySex()) {
        if (breakdowns.geography === "county") {
          return appendFipsIfNeeded(
            "cdc_restricted_data-by_sex_county_processed",
            breakdowns
          );
        } else if (breakdowns.geography === "state") {
          return "cdc_restricted_data-by_sex_state_processed";
        } else if (breakdowns.geography === "national") {
          return "cdc_restricted_data-by_sex_national_processed";
        }
      }
    }

    if (timeView === TIME_SERIES) {
      if (breakdowns.hasOnlyRace()) {
        if (breakdowns.geography === "county") {
          return appendFipsIfNeeded(
            "cdc_restricted_data-by_race_county_processed_time_series",
            breakdowns
          );
        } else if (breakdowns.geography === "state") {
          return "cdc_restricted_data-by_race_state_processed_time_series";
        } else if (breakdowns.geography === "national") {
          return "cdc_restricted_data-by_race_national_processed_time_series";
        }
      }
      if (breakdowns.hasOnlyAge()) {
        if (breakdowns.geography === "county") {
          return appendFipsIfNeeded(
            "cdc_restricted_data-by_age_county_processed_time_series",
            breakdowns
          );
        } else if (breakdowns.geography === "state") {
          return "cdc_restricted_data-by_age_state_processed_time_series";
        } else if (breakdowns.geography === "national") {
          return "cdc_restricted_data-by_age_national_processed_time_series";
        }
      }
      if (breakdowns.hasOnlySex()) {
        if (breakdowns.geography === "county") {
          return appendFipsIfNeeded(
            "cdc_restricted_data-by_sex_county_processed_time_series",
            breakdowns
          );
        } else if (breakdowns.geography === "state") {
          return "cdc_restricted_data-by_sex_state_processed_time_series";
        } else if (breakdowns.geography === "national") {
          return "cdc_restricted_data-by_sex_national_processed_time_series";
        }
      }
    }

    throw new Error("Not implemented");
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const timeView = metricQuery.timeView;
    const datasetId = this.getDatasetId(breakdowns, timeView);

    const covidDataset = await getDataManager().loadDataset(datasetId);
    let consumedDatasetIds = [datasetId];
    let df = covidDataset.toDataFrame();

    // If requested, filter geography by state or county level. We apply the
    // geo filter right away to reduce subsequent calculation times.
    df = this.filterByGeo(df, breakdowns);

    if (df.toArray().length === 0) {
      return new MetricQueryResponse([], consumedDatasetIds);
    }
    df = this.renameGeoColumns(df, breakdowns);

    /* We use DECIA_2020 populations OR ACS on the backend; add the correct id so footer is correct */
    const isIslandArea = breakdowns.filterFips?.isIslandArea();

    // TODO: this should be a reusable function that can work for all Providers, just like GetAcsDatasetId() does
    if (isIslandArea) {
      if (breakdowns.hasOnlyRace()) {
        if (breakdowns.geography === "state")
          consumedDatasetIds.push(
            "decia_2020_territory_population-by_race_and_ethnicity_territory_state_level"
          );
        if (breakdowns.geography === "county")
          consumedDatasetIds.push(
            "decia_2020_territory_population-by_race_and_ethnicity_territory_county_level"
          );
      }

      if (breakdowns.hasOnlySex()) {
        if (breakdowns.geography === "state")
          consumedDatasetIds.push(
            "decia_2020_territory_population-by_sex_territory_state_level"
          );
        if (breakdowns.geography === "county")
          consumedDatasetIds.push(
            "decia_2020_territory_population-by_sex_territory_county_level"
          );
      }

      if (breakdowns.hasOnlyAge()) {
        if (breakdowns.geography === "state")
          consumedDatasetIds.push(
            "decia_2020_territory_population-by_age_territory_state_level"
          );
        if (breakdowns.geography === "county")
          consumedDatasetIds.push(
            "decia_2020_territory_population-by_age_territory_county_level"
          );
      }
    } else consumedDatasetIds.push(GetAcsDatasetId(breakdowns));

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return !breakdowns.time && breakdowns.hasExactlyOneDemographic();
  }
}

export default CdcCovidProvider;
