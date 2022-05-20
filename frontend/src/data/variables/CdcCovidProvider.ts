import { DataFrame } from "data-forge";
import { getDataManager } from "../../utils/globals";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { joinOnCols } from "../utils/datasetutils";
import { USA_DISPLAY_NAME, USA_FIPS, ACS_2010_FIPS } from "../utils/Fips";
import { GetAcsDatasetId } from "./AcsPopulationProvider";
import AcsPopulationProvider from "./AcsPopulationProvider";
import VariableProvider from "./VariableProvider";

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
      "covid_cases_reporting_population",
      "covid_deaths_reporting_population",
      "covid_hosp_reporting_population",
      "covid_cases_reporting_population_pct",
      "covid_deaths_reporting_population_pct",
      "covid_hosp_reporting_population_pct",
      "death_ratio_age_adjusted",
      "hosp_ratio_age_adjusted",
      "cases_ratio_age_adjusted",
      "covid_population_pct",
    ]);
    this.acsProvider = acsProvider;
  }

  // ALERT! KEEP IN SYNC! Make sure you update data/config/DatasetMetadata AND data/config/MetadataMap.ts if you update dataset IDs
  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.hasOnlyRace()) {
      if (breakdowns.geography === "county") {
        return "cdc_restricted_data-by_race_county_processed";
      } else if (breakdowns.geography === "state") {
        return "cdc_restricted_data-by_race_state_processed-with_age_adjust";
      } else if (breakdowns.geography === "national") {
        return "cdc_restricted_data-by_race_state";
      }
    }
    if (breakdowns.hasOnlyAge()) {
      if (breakdowns.geography === "county") {
        return "cdc_restricted_data-by_age_county_processed";
      } else if (breakdowns.geography === "state") {
        return "cdc_restricted_data-by_age_state_processed";
      } else if (breakdowns.geography === "national") {
        return "cdc_restricted_data-by_age_state";
      }
    }
    if (breakdowns.hasOnlySex()) {
      if (breakdowns.geography === "county") {
        return "cdc_restricted_data-by_sex_county_processed";
      } else if (breakdowns.geography === "state") {
        return "cdc_restricted_data-by_sex_state_processed";
      } else if (breakdowns.geography === "national") {
        return "cdc_restricted_data-by_sex_state";
      }
    }
    throw new Error("Not implemented");
  }

  // TODO - only return requested metric queries, remove unrequested columns
  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const datasetId = this.getDatasetId(breakdowns);

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

    df = df.renameSeries({
      cases: "covid_cases",
      death_y: "covid_deaths",
      hosp_y: "covid_hosp",
    });

    // NaN signifies missing data.
    df = df.transformSeries({
      covid_cases: (value) => (isNaN(value) ? null : value),
      covid_deaths: (value) => (isNaN(value) ? null : value),
      covid_hosp: (value) => (isNaN(value) ? null : value),
    });

    // TODO: Move this calculation to the backend
    df =
      breakdowns.geography === "national"
        ? df
            .pivot([breakdownColumnName], {
              fips: (series) => USA_FIPS,
              fips_name: (series) => USA_DISPLAY_NAME,
              covid_cases: (series) => series.sum(),
              covid_deaths: (series) => series.sum(),
              covid_hosp: (series) => series.sum(),
              population: (series) =>
                series.where((population) => !isNaN(population)).sum(),
            })
            .resetIndex()
        : df;

    // TODO: Allow for population sources to have multiple sources
    // so we don't have to do this weirdness
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

    // TODO: Move this merge to the backend
    if (breakdowns.geography === "national") {
      if (breakdownColumnName === "race_and_ethnicity") {
        const ageAdjustDatasetID =
          "cdc_restricted_data-by_race_national-with_age_adjust";
        const ageAdjustDataset = await getDataManager().loadDataset(
          ageAdjustDatasetID
        );
        let ageAdjustDf = ageAdjustDataset.toDataFrame();

        df = joinOnCols(df, ageAdjustDf, [breakdownColumnName], "left");
      }

      const onlyShareMetrics = metricQuery.metricIds.every((metric) =>
        metric.includes("share")
      );

      const acsBreakdowns = breakdowns.copy();
      acsBreakdowns.time = false;

      const acsQueryResponse = await this.acsProvider.getData(
        new MetricQuery(["population_pct"], acsBreakdowns)
      );

      // We return an empty response if the only requested metric ids are "share"
      // metrics. These are the only metrics which don't require population data.
      if (acsQueryResponse.dataIsMissing() && !onlyShareMetrics) {
        return acsQueryResponse;
      }
      const acsPopulation = new DataFrame(acsQueryResponse.data);
      // TODO this is a weird hack - prefer left join but for some reason it's
      // causing issues. We should really do this on the BE instead.
      df = joinOnCols(df, acsPopulation, ["fips", breakdownColumnName], "left");

      // We get the population data for the territories from 2010, but merge
      // it in on the backend. This way we can properly site our source.
      const acs2010BreakdownId =
        "acs_2010_population-by_" + breakdownColumnName + "_territory";
      consumedDatasetIds = consumedDatasetIds.concat(acs2010BreakdownId);

      // If a given geo x breakdown has all unknown hospitalizations or deaths,
      // we treat it as if it has "no data," i.e. we clear the hosp/death fields.
      df = df
        .generateSeries({
          covid_deaths: (row) =>
            row.death_unknown === row.covid_cases ? null : row.covid_deaths,
          covid_hosp: (row) =>
            row.hosp_unknown === row.covid_cases ? null : row.covid_hosp,
        })
        .resetIndex();

      // Drop unused columns for simplicity.
      df = df.dropSeries([
        "death_n",
        "death_unknown",
        "hosp_n",
        "hosp_unknown",
      ]);

      df = df
        .generateSeries({
          // Calculate per100k
          covid_cases_per_100k: (row) =>
            this.calculations.per100k(row.covid_cases, row.population),
          covid_deaths_per_100k: (row) =>
            this.calculations.per100k(row.covid_deaths, row.population),
          covid_hosp_per_100k: (row) =>
            this.calculations.per100k(row.covid_hosp, row.population),
          //  Correct types for Age-Adjusted Ratios
          hosp_ratio_age_adjusted: (row) =>
            row.hosp_ratio_age_adjusted == null
              ? null
              : row.hosp_ratio_age_adjusted,
          death_ratio_age_adjusted: (row) =>
            row.death_ratio_age_adjusted == null
              ? null
              : row.death_ratio_age_adjusted,
        })
        .resetIndex();

      ["covid_cases", "covid_deaths", "covid_hosp"].forEach((col) => {
        df = this.calculations.calculatePctShare(
          df,
          col,
          col + "_share",
          breakdownColumnName,
          ["fips"]
        );
      });

      // Calculate any share_of_known metrics that may have been requested in the query
      const shareOfUnknownMetrics = metricQuery.metricIds.filter((metricId) =>
        [
          "covid_cases_share_of_known",
          "covid_deaths_share_of_known",
          "covid_hosp_share_of_known",
        ].includes(metricId)
      );
      shareOfUnknownMetrics.forEach((shareOfUnknownColumnName) => {
        const rawCountColumn = shareOfUnknownColumnName.slice(
          0,
          -"_share_of_known".length
        );
        df = this.calculations.calculatePctShareOfKnown(
          df,
          rawCountColumn,
          shareOfUnknownColumnName,
          breakdownColumnName
        );
      });

      df = df.renameSeries({
        population_pct: "covid_population_pct",
      });

      // Must reset index or calculation is wrong. TODO how to make this less brittle?
      df = df.dropSeries(["population", "population_pct"]).resetIndex();
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
