import { DataFrame } from "data-forge";
import { Breakdowns } from "../query/Breakdowns";
import VariableProvider from "./VariableProvider";
import { USA_FIPS, USA_DISPLAY_NAME } from "../utils/Fips";
import AcsPopulationProvider from "./AcsPopulationProvider";
import {
  asDate,
  getLatestDate,
  joinOnCols,
  per100k,
} from "../utils/datasetutils";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { getDataManager } from "../../utils/globals";
import { MetricId } from "../config/MetricConfig";

class CovidProvider extends VariableProvider {
  private acsProvider: AcsPopulationProvider;

  constructor(acsProvider: AcsPopulationProvider) {
    super("covid_provider", [
      "covid_cases",
      "covid_deaths",
      "covid_hosp",
      "covid_cases_pct_of_geo",
      "covid_deaths_pct_of_geo",
      "covid_hosp_pct_of_geo",
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

  // TODO - only return requested metric queries, remove unrequested columns
  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const datasetId =
      breakdowns.geography === "county"
        ? "covid_by_county_and_race"
        : "covid_by_state_and_race";
    const covid_dataset = await getDataManager().loadDataset(datasetId);
    let consumedDatasetIds = [datasetId];

    // TODO need to figure out how to handle getting this at the national level
    // because each state reports race differently.
    let df = covid_dataset.toDataFrame();

    // Filter by geography, return early if no results remain
    df = this.filterByGeo(df, breakdowns);
    if (df.toArray().length === 0) {
      return new MetricQueryResponse([], consumedDatasetIds);
    }
    df = this.renameGeoColumns(df, breakdowns);

    // TODO some of this can be generalized across providers.
    if (!breakdowns.time) {
      const lastTime = getLatestDate(df).getTime();
      df = df.where((row) => asDate(row.date).getTime() === lastTime);
    }

    df = df.renameSeries({
      Cases: "covid_cases",
      Deaths: "covid_deaths",
      Hosp: "covid_hosp",
    });

    df =
      breakdowns.geography === "national"
        ? df
            .pivot(["date", "race_and_ethnicity"], {
              fips: (series) => USA_FIPS,
              fips_name: (series) => USA_DISPLAY_NAME,
              covid_cases: (series) => series.sum(),
              covid_deaths: (series) => series.sum(),
              covid_hosp: (series) => series.sum(),
            })
            .resetIndex()
        : df;

    // TODO How to handle territories?
    const acsBreakdowns = breakdowns.copy();
    acsBreakdowns.time = false;

    // Get ACS population data
    const acsQueryResponse = await this.acsProvider.getData(
      new MetricQuery(["population", "population_pct"], acsBreakdowns)
    );
    consumedDatasetIds = consumedDatasetIds.concat(
      acsQueryResponse.consumedDatasetIds
    );
    if (acsQueryResponse.dataIsMissing()) {
      return acsQueryResponse;
    }
    const acsPopulation = new DataFrame(acsQueryResponse.data);

    // TODO this is a weird hack - prefer left join but for some reason it's
    // causing issues.
    const supportedGeos = acsPopulation
      .distinct((row) => row.fips)
      .getSeries("fips")
      .toArray();
    const unknowns = df
      .where((row) => row.race_and_ethnicity === "Unknown")
      .where((row) => supportedGeos.includes(row.fips));

    df = joinOnCols(df, acsPopulation, ["fips", "race_and_ethnicity"], "left");

    df = df
      .generateSeries({
        covid_cases_per_100k: (row) => per100k(row.covid_cases, row.population),
        covid_deaths_per_100k: (row) =>
          per100k(row.covid_deaths, row.population),
        covid_hosp_per_100k: (row) => per100k(row.covid_hosp, row.population),
      })
      .resetIndex();

    // Must reset index or calculation is wrong. TODO how to make this less brittle?
    df = df.concat(unknowns).resetIndex();

    if (breakdowns.hasOnlyRace()) {
      ["covid_cases", "covid_deaths", "covid_hosp"].forEach((col) => {
        df = this.calculatePctShare(
          df,
          col,
          col + "_pct_of_geo",
          breakdowns.demographicBreakdowns.race_and_ethnicity.columnName,
          ["date", "fips"]
        );
      });
    }

    // TODO - calculate actual reporting values instead of just copying fields
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
    df = df.dropSeries(["population", "population_pct"]).resetIndex();

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);
    return new MetricQueryResponse(df.toArray(), consumedDatasetIds);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return breakdowns.hasOnlyRace();
  }
}

export default CovidProvider;
