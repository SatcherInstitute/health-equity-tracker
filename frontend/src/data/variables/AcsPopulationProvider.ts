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

    // Calculate totals where dataset doesn't provide it
    ["age", "sex"].forEach((breakdownName) => {
      if (breakdowns.demographicBreakdowns[breakdownName].enabled) {
        df = df
          .concat(
            df.pivot(["state_fips", "state_name"], {
              population: (series) => series.sum(),
              population_pct: (series) => 100,
              [breakdownName]: (series) => "Total",
            })
          )
          .resetIndex();
      }
    });

    // Calculate population_pct based on total
    const enabledBreakdownKey: string = Object.keys(
      breakdowns.demographicBreakdowns
    ).find((key) => breakdowns.demographicBreakdowns[key].enabled === true)!;
    const columnName =
      breakdowns.demographicBreakdowns[enabledBreakdownKey].columnName;
    df = applyToGroups(df, ["state_name"], (group) => {
      let totalPopulation = group
        .where((r: any) => r[columnName] === "Total")
        .first()["population"];
      return group.generateSeries({
        population_pct: (row) => percent(row.population, totalPopulation),
      });
    });

    // If totals weren't requested, remove them
    Object.entries(breakdowns.demographicBreakdowns).forEach(
      ([key, demographicBreakdown]) => {
        if (
          demographicBreakdown.enabled &&
          !demographicBreakdown.includeTotal
        ) {
          df = df
            .where((row) => row[demographicBreakdown.columnName] !== "Total")
            .resetIndex();
        }
      }
    );

    return new MetricQueryResponse(df.toArray());
  }

  private getDataInternalWithoutPercents(
    datasets: Record<string, Dataset>,
    breakdowns: Breakdowns
  ): IDataFrame {
    const statePopByBreakdown = breakdowns.demographicBreakdowns.age.enabled
      ? datasets["acs_population-by_age_state"]
      : datasets["acs_population-by_race_state_std"];
    const acsDataFrame = statePopByBreakdown.toDataFrame();

    if (breakdowns.demographicBreakdowns.race_nonstandard.enabled) {
      return breakdowns.geography === "national"
        ? createNationalTotal(
            acsDataFrame,
            breakdowns.demographicBreakdowns.race_nonstandard.columnName
          )
        : acsDataFrame;
    }
    if (breakdowns.demographicBreakdowns.race.enabled) {
      const standardizedAcsData = acsDataFrame.where((row) =>
        standardizedRaces.includes(row.race_and_ethnicity)
      );
      return breakdowns.geography === "national"
        ? createNationalTotal(
            standardizedAcsData,
            breakdowns.demographicBreakdowns.race.columnName
          )
        : standardizedAcsData;
    }
    if (breakdowns.demographicBreakdowns.age.enabled) {
      return breakdowns.geography === "national"
        ? createNationalTotal(
            acsDataFrame,
            breakdowns.demographicBreakdowns.age.columnName
          )
        : acsDataFrame;
    }

    throw new Error("Not implemented");
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validDemographicBreakdownRequest: boolean =
      breakdowns.demographicBreakdownCount() === 1 &&
      (breakdowns.demographicBreakdowns.race_nonstandard.enabled ||
        breakdowns.demographicBreakdowns.race.enabled ||
        breakdowns.demographicBreakdowns.age.enabled);

    return (
      !breakdowns.time &&
      ["state", "national"].includes(breakdowns.geography) &&
      validDemographicBreakdownRequest
    );
  }
}

export default AcsPopulationProvider;
