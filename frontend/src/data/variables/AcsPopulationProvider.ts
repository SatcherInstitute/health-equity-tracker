import { IDataFrame } from "data-forge";
import { Breakdowns, DemographicBreakdownKey } from "../Breakdowns";
import { applyToGroups, percent } from "../datasetutils";
import { USA_FIPS, USA_DISPLAY_NAME } from "../../utils/madlib/Fips";
import VariableProvider from "./VariableProvider";
import { MetricQuery, MetricQueryResponse } from "../MetricQuery";
import { getDataManager } from "../../utils/globals";
import { TOTAL } from "../Constants";

const standardizedRaces = [
  "American Indian and Alaska Native (Non-Hispanic)",
  "Asian (Non-Hispanic)",
  "Black or African American (Non-Hispanic)",
  "Hispanic or Latino",
  "Native Hawaiian and Pacific Islander (Non-Hispanic)",
  "Some other race (Non-Hispanic)",
  "Two or more races (Non-Hispanic)",
  "White (Non-Hispanic)",
  TOTAL,
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
    super("acs_pop_provider", ["population", "population_pct"]);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.hasOnlySex()) {
      return breakdowns.geography === "county"
        ? "acs_population-by_sex_county"
        : "acs_population-by_sex_state";
    }
    if (breakdowns.hasOnlyAge()) {
      return breakdowns.geography === "county"
        ? "acs_population-by_age_county"
        : "acs_population-by_age_state";
    }
    if (breakdowns.hasOnlyRace() || breakdowns.hasOnlyRaceNonStandard()) {
      return breakdowns.geography === "county"
        ? "acs_population-by_race_county_std"
        : "acs_population-by_race_state_std";
    }
    throw new Error("Not implemented");
  }

  // TODO - only return requested metric queries, remove unrequested columns
  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    let df = await this.getDataInternalWithoutPercents(breakdowns);
    const [fipsColumn, geoNameColumn] =
      breakdowns.geography === "county"
        ? ["county_fips", "county_name"]
        : ["state_fips", "state_name"];

    // If requested, filter geography by state or county level
    df = this.filterByGeo(df, breakdowns);

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
              [breakdownName]: (series) => TOTAL,
            })
          )
          .resetIndex();
      }
    });

    // Calculate population_pct based on total for breakdown
    // Exactly one breakdown should be enabled per allowsBreakdowns()
    const enabledBreakdown = Object.values(
      breakdowns.demographicBreakdowns
    ).find((breakdown) => breakdown.enabled)!;

    df = applyToGroups(df, [fipsColumn], (group) => {
      let totalPopulation = group
        .where((r: any) => r[enabledBreakdown.columnName] === TOTAL)
        .first()["population"];
      return group.generateSeries({
        population_pct: (row) => percent(row.population, totalPopulation),
      });
    });

    df = this.removeUnwantedDemographicTotals(df, breakdowns);

    // TODO - remove this when we stop getting this field from server
    df = df.dropSeries(["ingestion_ts"]).resetIndex();

    df = this.renameGeoColumns(df, breakdowns);

    return new MetricQueryResponse(df.toArray(), [
      this.getDatasetId(breakdowns),
    ]);
  }

  private async getDataInternalWithoutPercents(
    breakdowns: Breakdowns
  ): Promise<IDataFrame> {
    const acsDataset = await getDataManager().loadDataset(
      this.getDatasetId(breakdowns)
    );
    let acsDataFrame = acsDataset.toDataFrame();

    // Race must be special cased to standardize the data before proceeding
    if (breakdowns.hasOnlyRace()) {
      acsDataFrame = acsDataFrame.where((row) =>
        standardizedRaces.includes(row.race_and_ethnicity)
      );
    }

    // Exactly one breakdown should be enabled, identify it
    const enabledBreakdown = Object.values(
      breakdowns.demographicBreakdowns
    ).find((breakdown) => breakdown.enabled)!;

    return breakdowns.geography === "national"
      ? createNationalTotal(acsDataFrame, enabledBreakdown.columnName)
      : acsDataFrame;
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return !breakdowns.time && breakdowns.hasExactlyOneDemographic();
  }
}

export default AcsPopulationProvider;
