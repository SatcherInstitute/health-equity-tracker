import { getDataManager } from "../../utils/globals";
import { Breakdowns, TimeView } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { ACS_2010_FIPS } from "../utils/Fips";
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

    const breakdownColumnName =
      breakdowns.getSoleDemographicBreakdown().columnName;

    // If requested, filter geography by state or county level. We apply the
    // geo filter right away to reduce subsequent calculation times.
    df = this.filterByGeo(df, breakdowns);

    if (df.toArray().length === 0) {
      return new MetricQueryResponse([], consumedDatasetIds);
    }
    df = this.renameGeoColumns(df, breakdowns);

    const stateFips = df.getSeries("fips").toArray()[0];
    if (
      breakdowns.geography === "state" &&
      // hacky but there should only be one fips code if
      // its for a state
      ACS_2010_FIPS.includes(stateFips)
    ) {
      const acs2010BreakdownId =
        "acs_2010_population-by_" + breakdownColumnName + "_territory";
      consumedDatasetIds = consumedDatasetIds.concat(acs2010BreakdownId);
    } else {
      const acsDatasetId = GetAcsDatasetId(breakdowns);
      consumedDatasetIds = consumedDatasetIds.concat(acsDatasetId);
    }

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return !breakdowns.time && breakdowns.hasExactlyOneDemographic();
  }
}

export default CdcCovidProvider;
