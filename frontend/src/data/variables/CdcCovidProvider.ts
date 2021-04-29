import { DataFrame } from "data-forge";
import { Breakdowns } from "../query/Breakdowns";
import VariableProvider from "./VariableProvider";
import { USA_FIPS, USA_DISPLAY_NAME } from "../utils/Fips";
import AcsPopulationProvider from "./AcsPopulationProvider";
import {
  joinOnCols,
  per100k,
  maybeApplyRowReorder,
} from "../utils/datasetutils";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { getDataManager } from "../../utils/globals";
import { MetricId } from "../config/MetricConfig";

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
    ]);
    this.acsProvider = acsProvider;
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

    df = df
      .generateSeries({
        covid_cases_per_100k: (row) => per100k(row.covid_cases, row.population),
        covid_deaths_per_100k: (row) =>
          per100k(row.covid_deaths, row.population),
        covid_hosp_per_100k: (row) => per100k(row.covid_hosp, row.population),
      })
      .resetIndex();

    ["covid_cases", "covid_deaths", "covid_hosp"].forEach((col) => {
      df = this.calculatePctShare(
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
      df = this.calculatePctShareOfKnown(
        df,
        rawCountColunn,
        shareOfUnknownColumnName,
        breakdownColumnName
      );
    });

    // TODO - calculate actual reporting values on the BE instead of just copying fields
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

    // TODO How to handle territories?
    const acsBreakdowns = breakdowns.copy();
    acsBreakdowns.time = false;

    // Get ACS population_pct data. Population data is expected to already be
    // joined in at this point for this data.
    const acsQueryResponse = await this.acsProvider.getData(
      new MetricQuery(["population_pct"], acsBreakdowns)
    );
    consumedDatasetIds = consumedDatasetIds.concat(
      acsQueryResponse.consumedDatasetIds
    );
    if (acsQueryResponse.dataIsMissing()) {
      return acsQueryResponse;
    }
    const acsPopulation = new DataFrame(acsQueryResponse.data);

    // TODO this is a weird hack - prefer left join but for some reason it's
    // causing issues. We should really do this on the BE instead.
    const supportedGeos = acsPopulation
      .distinct((row) => row.fips)
      .getSeries("fips")
      .toArray();

    const unknowns = df
      .where((row) => row.breakdownColumnName === "Unknown")
      .where((row) => supportedGeos.includes(row.fips));

    df = joinOnCols(df, acsPopulation, ["fips", breakdownColumnName], "left");

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
    df = df.concat(unknowns).resetIndex();

    df = df.dropSeries(["population", "population_pct"]).resetIndex();
    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(
      maybeApplyRowReorder(df.toArray(), breakdowns),
      consumedDatasetIds
    );
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return !breakdowns.time && breakdowns.hasExactlyOneDemographic();
  }
}

export default CdcCovidProvider;
