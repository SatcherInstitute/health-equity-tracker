import { IDataFrame } from "data-forge";
import { Breakdowns, DemographicBreakdownKey } from "../Breakdowns";
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
      fips: (series) => USA_FIPS,
      fips_name: (series) => USA_DISPLAY_NAME,
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
            df.pivot(["fips", "fips_name"], {
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
    const breakdownColumnName = breakdowns.getSoleDemographicBreakdown()
      .columnName;

    df = this.calculatePctShare(
      df,
      "population",
      "population_pct",
      breakdownColumnName,
      ["fips"]
    );

    df = this.removeUnwantedDemographicTotals(df, breakdowns);

    // TODO - remove this when we stop getting this field from server
    df = df.dropSeries(["ingestion_ts"]).resetIndex();

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

    // If requested, filter geography by state or county level
    // We apply the geo filter right away to reduce subsequent calculation times
    acsDataFrame = this.filterByGeo(acsDataFrame, breakdowns);
    acsDataFrame = this.renameGeoColumns(acsDataFrame, breakdowns);

    // Race must be special cased to standardize the data before proceeding
    if (breakdowns.hasOnlyRace()) {
      acsDataFrame = acsDataFrame.where((row) =>
        standardizedRaces.includes(row.race_and_ethnicity)
      );
    }

    return breakdowns.geography === "national"
      ? createNationalTotal(
          acsDataFrame,
          breakdowns.getSoleDemographicBreakdown().columnName
        )
      : acsDataFrame;
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return !breakdowns.time && breakdowns.hasExactlyOneDemographic();
  }
}

export default AcsPopulationProvider;
