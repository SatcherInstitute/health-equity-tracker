import { DataFrame } from "data-forge";
import { Breakdowns } from "../Breakdowns";
import { Dataset } from "../DatasetTypes";
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

class CovidProvider extends VariableProvider {
  private acsProvider: AcsPopulationProvider;

  constructor(acsProvider: AcsPopulationProvider) {
    super(
      "covid_provider",
      [
        "covid_cases",
        "covid_deaths",
        "covid_hosp",
        "covid_cases_pct_of_geo",
        "covid_deaths_pct_of_geo",
        "covid_hosp_pct_of_geo",
        "covid_deaths_per_100k",
        "covid_cases_per_100k",
        "covid_hosp_per_100k",
      ],
      ["covid_by_state_and_race"].concat(acsProvider.datasetIds)
    );
    this.acsProvider = acsProvider;
  }

  getDataInternal(
    datasets: Record<string, Dataset>,
    breakdowns: Breakdowns
  ): MetricQueryResponse {
    const covid_by_state_and_race = datasets["covid_by_state_and_race"];
    // TODO need to figure out how to handle getting this at the national level
    // because each state reports race differently.
    let df = covid_by_state_and_race.toDataFrame();

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
      breakdowns.geography === "state"
        ? df
        : df
            .pivot(["date", "race_and_ethnicity"], {
              state_fips: (series) => USA_FIPS,
              state_name: (series) => USA_DISPLAY_NAME,
              covid_cases: (series) => series.sum(),
              covid_deaths: (series) => series.sum(),
              covid_hosp: (series) => series.sum(),
            })
            .resetIndex();

    if (breakdowns.filterFips) {
      df = df.where((row) => row.state_fips === breakdowns.filterFips);
    }

    // TODO How to handle territories?
    const acsBreakdowns = breakdowns.copy();
    acsBreakdowns.time = false;

    const acsMetricQueryResponse = this.acsProvider.getData(
      datasets,
      acsBreakdowns
    );
    if (acsMetricQueryResponse.dataIsMissing()) {
      return acsMetricQueryResponse;
    }
    const acsPopulation = new DataFrame(acsMetricQueryResponse.data);

    // TODO this is a weird hack - prefer left join but for some reason it's
    // causing issues.
    const supportedGeos = acsPopulation
      .distinct((row) => row.state_fips)
      .getSeries("state_fips")
      .toArray();
    const unknowns = df
      .where((row) => row.race_and_ethnicity === "Unknown")
      .where((row) => supportedGeos.includes(row.state_fips));

    df = joinOnCols(df, acsPopulation, ["state_fips", "race_and_ethnicity"]);

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
      df = applyToGroups(df, ["date", "state_fips"], (group) => {
        const total = group
          .where((r) => r.race_and_ethnicity === "Total")
          .first()[col];
        return group.generateSeries({
          [col + "_pct_of_geo"]: (row) => percent(row[col], total),
        });
      });
    });

    return new MetricQueryResponse(df.toArray());
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return (
      breakdowns.demographic === "race_nonstandard" &&
      (breakdowns.geography === "state" || breakdowns.geography === "national")
    );
  }
}

export default CovidProvider;
