import { DataFrame } from "data-forge";
import { getDataManager } from "../../utils/globals";
import { MetricId } from "../config/MetricConfig";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { joinOnCols } from "../utils/datasetutils";
import {
  DC_COUNTY_FIPS,
  USA_DISPLAY_NAME,
  USA_FIPS,
  ACS_2010_FIPS,
} from "../utils/Fips";
import AcsPopulationProvider from "./AcsPopulationProvider";
import Acs2010PopulationProvider from "./Acs2010PopulationProvider";
import VariableProvider from "./VariableProvider";

class CdcCovidProvider extends VariableProvider {
  private acsProvider: AcsPopulationProvider;
  private acs2010Provider: Acs2010PopulationProvider;

  constructor(
    acsProvider: AcsPopulationProvider,
    acs2010Provider: Acs2010PopulationProvider
  ) {
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
    ]);
    this.acsProvider = acsProvider;
    this.acs2010Provider = acs2010Provider;
  }

  // ALERT! KEEP IN SYNC! Make sure you update DataSourceMetadata if you update dataset IDs
  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.hasOnlyRace()) {
      return breakdowns.geography === "county"
        ? "cdc_restricted_data-by_race_county"
        : "cdc_restricted_data-by_race_state";
    }
    if (breakdowns.hasOnlyAge()) {
      return breakdowns.geography === "county"
        ? "cdc_restricted_data-by_age_county"
        : "cdc_restricted_data-by_age_state";
    }
    if (breakdowns.hasOnlySex()) {
      return breakdowns.geography === "county"
        ? "cdc_restricted_data-by_sex_county"
        : "cdc_restricted_data-by_sex_state";
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

    const breakdownColumnName = breakdowns.getSoleDemographicBreakdown()
      .columnName;

    df = this.renameTotalToAll(df, breakdownColumnName);

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

    const acsBreakdowns = breakdowns.copy();
    acsBreakdowns.time = false;

    // Get ACS population_pct data. Population data is expected to already be
    // joined in at this point for this data.

    const onlyShareMetrics = metricQuery.metricIds.every((metric) =>
      metric.includes("share")
    );

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

    // Get island pop data if it exists
    const islandFips = df.getSeries("fips").toArray()[0];
    if (
      (breakdowns.geography === "state" &&
        // hacky but there should only be one fips code if
        // its for a state
        ACS_2010_FIPS.includes(islandFips)) ||
      (breakdowns.geography === "county" &&
        ACS_2010_FIPS.includes(islandFips.substring(0, 2)))
    ) {
      // We only have territory level population data for these territories
      acsBreakdowns.geography = "state";
      const acs2010QueryResponse = await this.acs2010Provider.getData(
        new MetricQuery(["population", "population_pct"], acsBreakdowns)
      );
      consumedDatasetIds = consumedDatasetIds.concat(
        acs2010QueryResponse.consumedDatasetIds
      );
      // We return an empty response if the only requested metric ids are "share"
      // metrics. These are the only metrics which don't require population data.
      if (acs2010QueryResponse.dataIsMissing() && !onlyShareMetrics) {
        return acs2010QueryResponse;
      }
      const acs2010Population = new DataFrame(acs2010QueryResponse.data);
      // TODO this is a weird hack - prefer left join but for some reason it's
      // causing issues. We should really do this on the BE instead.
      df = joinOnCols(
        df,
        acs2010Population,
        ["fips", breakdownColumnName],
        "left"
      );
    } else {
      const acsQueryResponse = await this.acsProvider.getData(
        new MetricQuery(["population_pct"], acsBreakdowns)
      );
      consumedDatasetIds = consumedDatasetIds.concat(
        acsQueryResponse.consumedDatasetIds
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
    }

    if (breakdowns.geography === "national") {
      // We get the population data for the territories from 2010, but merge
      // it in on the backend. This way we can properly site our source.
      const acs2010BreakdownId =
        "acs_2010_population-by_" + breakdownColumnName + "_territory";
      consumedDatasetIds = consumedDatasetIds.concat(acs2010BreakdownId);
    }

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
    df = df.dropSeries(["death_n", "death_unknown", "hosp_n", "hosp_unknown"]);

    // Clear all county-level DC data. See issue for more details:
    // https://github.com/SatcherInstitute/health-equity-tracker/issues/872.
    // TODO - fix this the right way.
    df = df.withSeries({
      covid_cases: (df) =>
        df.deflate((row) =>
          row.fips === DC_COUNTY_FIPS ? null : row.covid_cases
        ),
      covid_deaths: (df) =>
        df.deflate((row) =>
          row.fips === DC_COUNTY_FIPS ? null : row.covid_deaths
        ),
      covid_hosp: (df) =>
        df.deflate((row) =>
          row.fips === DC_COUNTY_FIPS ? null : row.covid_hosp
        ),
    });

    df = df
      .generateSeries({
        covid_cases_per_100k: (row) =>
          this.calculations.per100k(row.covid_cases, row.population),
        covid_deaths_per_100k: (row) =>
          this.calculations.per100k(row.covid_deaths, row.population),
        covid_hosp_per_100k: (row) =>
          this.calculations.per100k(row.covid_hosp, row.population),
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
      const rawCountColunn = shareOfUnknownColumnName.slice(
        0,
        -"_share_of_known".length
      );
      df = this.calculations.calculatePctShareOfKnown(
        df,
        rawCountColunn,
        shareOfUnknownColumnName,
        breakdownColumnName
      );
    });

    const populationMetric: MetricId[] = [
      "covid_cases_reporting_population",
      "covid_deaths_reporting_population",
      "covid_hosp_reporting_population",
    ];
    populationMetric.forEach((reportingPopulation) => {
      if (metricQuery.metricIds.includes(reportingPopulation)) {
        df = df
          .generateSeries({
            [reportingPopulation]: (row) => row["population"],
          })
          .resetIndex();
      }
    });

    const populationPctMetric: MetricId[] = [
      "covid_cases_reporting_population_pct",
      "covid_deaths_reporting_population_pct",
      "covid_hosp_reporting_population_pct",
    ];
    populationPctMetric.forEach((reportingPopulation) => {
      if (metricQuery.metricIds.includes(reportingPopulation)) {
        df = df
          .generateSeries({
            [reportingPopulation]: (row) => row["population_pct"],
          })
          .resetIndex();
      }
    });

    // Must reset index or calculation is wrong. TODO how to make this less brittle?
    df = df.dropSeries(["population", "population_pct"]).resetIndex();
    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return !breakdowns.time && breakdowns.hasExactlyOneDemographic();
  }
}

export default CdcCovidProvider;
