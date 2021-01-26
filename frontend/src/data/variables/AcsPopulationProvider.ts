import { IDataFrame } from "data-forge";
import { Breakdowns, DemographicBreakdownKey } from "../Breakdowns";
import { Dataset } from "../DatasetTypes";
import { applyToGroups, percent } from "../datasetutils";
import { USA_FIPS, USA_DISPLAY_NAME, Fips } from "../../utils/madlib/Fips";
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
      [
        "acs_population-by_race_state_std",
        "acs_population-by_race_county_std",
        "acs_population-by_age_state",
        "acs_population-by_sex_state",
      ]
    );
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.demographicBreakdowns.sex.enabled) {
      return "acs_population-by_sex_state";
    }
    if (breakdowns.demographicBreakdowns.age.enabled) {
      return "acs_population-by_age_state";
    }
    if (
      breakdowns.demographicBreakdowns.race_nonstandard.enabled ||
      breakdowns.demographicBreakdowns.race.enabled
    ) {
      return breakdowns.geography === "county"
        ? "acs_population-by_race_county_std"
        : "acs_population-by_race_state_std";
    }
    return "";
  }

  getDataInternal(
    datasets: Record<string, Dataset>,
    breakdowns: Breakdowns
  ): MetricQueryResponse {
    let df = this.getDataInternalWithoutPercents(datasets, breakdowns);
    const [fipsColumn, geoNameColumn] =
      breakdowns.geography === "county"
        ? ["county_fips", "county_name"]
        : ["state_fips", "state_name"];

    // If requested, filter geography by state or county level
    if (breakdowns.filterFips !== undefined) {
      const fips = breakdowns.filterFips as Fips;
      if (fips.isCounty()) {
        df = df.where((row) => row["county_fips"] === fips.code);
      } else if (fips.isState() && breakdowns.geography === "state") {
        df = df.where((row) => row["state_fips"] === fips.code);
      } else if (fips.isState() && breakdowns.geography === "county") {
        df = df.where(
          (row) => row["county_fips"].substring(0, 2) === fips.code
        );
      }
    }

    // Calculate totals where dataset doesn't provide it
    // TODO- this should be removed when Totals come from the Data Server
    ["age", "sex"].forEach((breakdownName) => {
      if (
        breakdowns.demographicBreakdowns[
          breakdownName as DemographicBreakdownKey
        ].enabled
      ) {
        df = df
          .concat(
            df.pivot([fipsColumn, geoNameColumn], {
              population: (series) => series.sum(),
              population_pct: (series) => 100,
              [breakdownName]: (series) => "Total",
            })
          )
          .resetIndex();
      }
    });

    // Calculate population_pct based on total for breakdown
    // Exactly one breakdown should be enabled per allowsBreakdowns()
    const enabledBreakdown = Object.values(
      breakdowns.demographicBreakdowns
    ).find((breakdown) => breakdown.enabled === true)!;
    df = applyToGroups(df, [geoNameColumn], (group) => {
      let totalPopulation = group
        .where((r: any) => r[enabledBreakdown.columnName] === "Total")
        .first()["population"];
      return group.generateSeries({
        population_pct: (row) => percent(row.population, totalPopulation),
      });
    });

    // If totals weren't requested, remove them
    Object.values(breakdowns.demographicBreakdowns).forEach(
      (demographicBreakdown) => {
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

    return new MetricQueryResponse(df.toArray(), [
      this.getDatasetId(breakdowns),
    ]);
  }

  private getDataInternalWithoutPercents(
    datasets: Record<string, Dataset>,
    breakdowns: Breakdowns
  ): IDataFrame {
    let acsDataFrame = datasets[this.getDatasetId(breakdowns)].toDataFrame();

    // Exactly one breakdown should be enabled, identify it
    const [breakdownVar, enabledBreakdown] = Object.entries(
      breakdowns.demographicBreakdowns
    ).find(([breakdownVar, breakdown]) => breakdown.enabled === true)!;

    // Race must be special cased to standardize the data before proceeding
    if (breakdownVar === "race") {
      acsDataFrame = acsDataFrame.where((row) =>
        standardizedRaces.includes(row.race_and_ethnicity)
      );
    }

    return breakdowns.geography === "national"
      ? createNationalTotal(acsDataFrame, enabledBreakdown.columnName)
      : acsDataFrame;
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    const validGeographicBreakdown =
      breakdowns.geography === "county"
        ? breakdowns.demographicBreakdowns.race_nonstandard.enabled ||
          breakdowns.demographicBreakdowns.race.enabled
        : true;

    return (
      !breakdowns.time &&
      breakdowns.hasExactlyOneDemographic() &&
      validGeographicBreakdown
    );
  }
}

export default AcsPopulationProvider;
