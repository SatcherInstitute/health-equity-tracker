import { IDataFrame } from "data-forge";
import { Breakdowns } from "../Breakdowns";
import { Dataset, Row } from "../DatasetTypes";
import { applyToGroups, percent } from "../datasetutils";
import { USA_FIPS, USA_DISPLAY_NAME } from "../../utils/madlib/Fips";
import VariableProvider from "./VariableProvider";

const standardizedRaces = [
  "American Indian and Alaska Native alone (Non-Hispanic)",
  "Asian alone (Non-Hispanic)",
  "Black or African American alone (Non-Hispanic)",
  "Hispanic or Latino",
  "Native Hawaiian and Other Pacific Islander alone (Non-Hispanic)",
  "Some other race alone (Non-Hispanic)",
  "Two or more races (Non-Hispanic)",
  "White alone (Non-Hispanic)",
  "Total",
];

class AcsPopulationProvider extends VariableProvider {
  constructor() {
    super(
      "acs_pop_provider",
      ["population", "population_pct"],
      ["acs_state_population_by_race_nonstandard"]
    );
  }

  getDataInternal(
    datasets: Record<string, Dataset>,
    breakdowns: Breakdowns
  ): Row[] {
    let df = this.getDataInternalWithoutPercents(datasets, breakdowns);

    if (breakdowns.filterFips) {
      df = df.where((row) => row.state_fips === breakdowns.filterFips);
    }

    df = applyToGroups(df, ["state_name"], (group) => {
      const total = group
        .where((r) => r.race_and_ethnicity === "Total")
        .first()["population"];
      return group.generateSeries({
        population_pct: (row) => percent(row.population, total),
      });
    });
    return df.toArray();
  }

  private getDataInternalWithoutPercents(
    datasets: Record<string, Dataset>,
    breakdowns: Breakdowns
  ): IDataFrame {
    const statePopByRace = datasets["acs_state_population_by_race_nonstandard"];
    const acsNonStandard = statePopByRace.toDataFrame();

    if (
      breakdowns.demographic === "race_nonstandard" &&
      breakdowns.geography === "state"
    ) {
      return acsNonStandard;
    }

    if (
      breakdowns.demographic === "race_nonstandard" &&
      breakdowns.geography === "national"
    ) {
      return acsNonStandard
        .pivot("race_and_ethnicity", {
          // TODO for the purpose of charts, rename state_name to something more
          // general so we can compare counties with states with the nation.
          state_fips: (series) => USA_FIPS,
          state_name: (series) => USA_DISPLAY_NAME,
          population: (series) => series.sum(),
        })
        .resetIndex();
    }

    const acsStandard = acsNonStandard.where((row) =>
      standardizedRaces.includes(row.race_and_ethnicity)
    );
    if (breakdowns.demographic === "race" && breakdowns.geography === "state") {
      return acsStandard;
    }

    if (
      breakdowns.demographic === "race" &&
      breakdowns.geography === "national"
    ) {
      return acsStandard
        .pivot("race_and_ethnicity", {
          state_fips: (series) => USA_FIPS,
          state_name: (series) => USA_DISPLAY_NAME,
          population: (series) => series.sum(),
        })
        .resetIndex();
    }

    throw new Error("Not implemented");
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return (
      !breakdowns.time &&
      (breakdowns.geography === "state" ||
        breakdowns.geography === "national") &&
      (breakdowns.demographic === "race" ||
        breakdowns.demographic === "race_nonstandard")
    );
  }
}

export default AcsPopulationProvider;
