import { DataFrame } from "data-forge";
import { Breakdowns } from "../Breakdowns";
import VariableProvider from "./VariableProvider";
import { USA_FIPS, USA_DISPLAY_NAME } from "../../utils/madlib/Fips";
import AcsPopulationProvider from "./AcsPopulationProvider";
import {
  applyToGroups,
  asDate,
  getLatestDate,
  joinOnCols,
  per100k,
  percent,
} from "../datasetutils";
import { MetricQueryResponse } from "../MetricQuery";
import { getDataManager } from "../../utils/globals";

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
    ]);
    this.acsProvider = acsProvider;
  }

  async getDataInternal(breakdowns: Breakdowns): Promise<MetricQueryResponse> {
    const datasetId =
      breakdowns.geography === "county"
        ? "covid_by_county_and_race"
        : "covid_by_state_and_race";
    const covid_dataset = await getDataManager().loadDataset(datasetId);
    let consumedDatasetIds = [datasetId];

    const fipsColumn =
      breakdowns.geography === "county" ? "county_fips" : "state_fips";

    // TODO need to figure out how to handle getting this at the national level
    // because each state reports race differently.
    let df = covid_dataset.toDataFrame();

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
              state_fips: (series) => USA_FIPS,
              state_name: (series) => USA_DISPLAY_NAME,
              covid_cases: (series) => series.sum(),
              covid_deaths: (series) => series.sum(),
              covid_hosp: (series) => series.sum(),
            })
            .resetIndex()
        : df;

    df = this.filterByGeo(df, breakdowns);

    // TODO How to handle territories?
    const acsBreakdowns = breakdowns.copy();
    acsBreakdowns.time = false;
    acsBreakdowns.demographicBreakdowns.race_nonstandard = {
      enabled: true,
      columnName: "race_and_ethnicity",
      includeTotal: true,
    };

    const acsQueryResponse = await this.acsProvider.getData(acsBreakdowns);

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
      .distinct((row) => row[fipsColumn])
      .getSeries(fipsColumn)
      .toArray();
    const unknowns = df
      .where((row) => row.race_and_ethnicity === "Unknown")
      .where((row) => supportedGeos.includes(row[fipsColumn]));

    df = joinOnCols(df, acsPopulation, [fipsColumn, "race_and_ethnicity"]);

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

    // TODO this is a bit on the slow side. Maybe a better way to do it, or
    // pre-compute "total" column on server
    ["covid_cases", "covid_deaths", "covid_hosp"].forEach((col) => {
      df = applyToGroups(df, ["date", fipsColumn], (group) => {
        const total = group
          .where((r) => r.race_and_ethnicity === "Total")
          .first()[col];
        return group
          .generateSeries({
            [col + "_pct_of_geo"]: (row) => percent(row[col], total),
          })
          .resetIndex();
      });
    });

    df = this.removeUnwantedDemographicTotals(df, breakdowns);

    df = this.renameGeoColumns(df, breakdowns);

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return breakdowns.hasOnlyRaceNonStandard();
  }
}

export default CovidProvider;
