import { IDataFrame } from "data-forge";
import { Breakdowns } from "../Breakdowns";
import { Dataset } from "../DatasetTypes";
import { applyToGroups, percent } from "../datasetutils";
import { USA_FIPS, USA_DISPLAY_NAME } from "../../utils/madlib/Fips";
import VariableProvider from "./VariableProvider";
import { MetricQueryResponse } from "../MetricQuery";

const standardizedRaces = [
  "American Indian and Alaska Native (Non-Hispanic)",
  "Asian (Non-Hispanic)",
  "Black or African American (Non-Hispanic)",
  "Hispanic or Latino",
  "Native Hawaiian and Pacific Islander (Non-Hispanic)",
  "Some other race (Non-Hispanic)",
  "Two or more races (Non-Hispanic)",
  "White (Non-Hispanic)",
  "Total",
];

function createNationalTotal(dataFrame: IDataFrame, breakdown: string) {
  return dataFrame
    .pivot(breakdown, {
      // TODO for the purpose of charts, rename state_name to something more
      // general so we can compare counties with states with the nation.
      state_fips: (series) => USA_FIPS,
      state_name: (series) => USA_DISPLAY_NAME,
      population: (series) => series.sum(),
    })
    .resetIndex();
}

class AcsPopulationProvider extends VariableProvider {
  constructor() {
    super(
      "acs_pop_provider",
      ["population", "population_pct"],
      ["acs_population-by_race_state_std", "acs_population-by_age_state"]
    );
  }

  getDataInternal(
    datasets: Record<string, Dataset>,
    breakdowns: Breakdowns
  ): MetricQueryResponse {
    let df = this.getDataInternalWithoutPercents(datasets, breakdowns);
    if (breakdowns.filterFips) {
      df = df.where((row) => row.state_fips === breakdowns.filterFips);
    }

    df = applyToGroups(df, ["state_name"], (group) => {
      // Race categories don't add up to zero, so they are special cased
      let totalStatePopulation =
        breakdowns.demographic === "race_nonstandard" ||
        breakdowns.demographic === "race"
          ? group
              .where((r: any) => r["race_and_ethnicity"] === "Total")
              .first()["population"]
          : df.getSeries("population").sum();
      return group.generateSeries({
        population_pct: (row) => percent(row.population, totalStatePopulation),
      });
    });
    return new MetricQueryResponse(df.toArray());
  }

  private getDataInternalWithoutPercents(
    datasets: Record<string, Dataset>,
    breakdowns: Breakdowns
  ): IDataFrame {
    const statePopByBreakdown =
      breakdowns.demographic === "age"
        ? datasets["acs_population-by_age_state"]
        : datasets["acs_population-by_race_state_std"];
    const acsDataFrame = statePopByBreakdown.toDataFrame();

    switch (breakdowns.demographic) {
      case "race_nonstandard":
        return breakdowns.geography === "national"
          ? createNationalTotal(acsDataFrame, "race_and_ethnicity")
          : acsDataFrame;
      case "race":
        const standardizedAcsData = acsDataFrame.where((row) =>
          standardizedRaces.includes(row.race_and_ethnicity)
        );
        return breakdowns.geography === "national"
          ? createNationalTotal(standardizedAcsData, "race_and_ethnicity")
          : standardizedAcsData;
      case "age":
        return breakdowns.geography === "national"
          ? createNationalTotal(acsDataFrame, "age")
          : acsDataFrame;
    }

    throw new Error("Not implemented");
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return (
      !breakdowns.time &&
      ["state", "national"].includes(breakdowns.geography) &&
      ["race", "race_nonstandard", "age"].includes(
        breakdowns.demographic as string
      )
    );
  }
}

export default AcsPopulationProvider;
