import { IDataFrame } from "data-forge";
import { Breakdowns, DemographicBreakdownKey } from "../query/Breakdowns";
import { USA_FIPS, USA_DISPLAY_NAME } from "../utils/Fips";
import VariableProvider from "./VariableProvider";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { getDataManager } from "../../utils/globals";
import { TOTAL } from "../utils/Constants";

function createNationalTotal(dataFrame: IDataFrame, breakdown: string) {
  return dataFrame
    .pivot(breakdown, {
      fips: (series) => USA_FIPS,
      fips_name: (series) => USA_DISPLAY_NAME,
      population: (series) => series.sum(),
    })
    .resetIndex();
}

class AcsHealthInsuranceProvider extends VariableProvider {
  constructor() {
    super("acs_health_insurance_provider", ["health_insurance"]);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.hasOnlySex()) {
      return breakdowns.geography === "county"
        ? "acs_health_Insurance_manual_test-by_sex_county"
        : "acs_health_Insurance_manual_test-by_sex_state";
    }

    // Age only breakdown is not supported yet, due to the dataset not being
    // Aggregated on the backend.

    if (breakdowns.hasOnlyRace()) {
      return breakdowns.geography === "county"
        ? "acs_health_insurance_manual_test-table_health_insurance_by_race_county"
        : "acs_health_insurance_manual_test-table_health_insurance_by_race_state";
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
    // TODO: this should be removed when Totals come from the Data Server. Note
    // that this assumes that the categories sum to exactly the total
    const breakdownsToSum: DemographicBreakdownKey[] = ["age", "sex"];
    breakdownsToSum.forEach((breakdownName) => {
      if (breakdowns.demographicBreakdowns[breakdownName].enabled) {
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

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);
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

    return breakdowns.geography === "national"
      ? createNationalTotal(
          acsDataFrame,
          breakdowns.getSoleDemographicBreakdown().columnName
        )
      : acsDataFrame;
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return (
      !breakdowns.hasOnlyAge() &&
      !breakdowns.time &&
      breakdowns.hasExactlyOneDemographic()
    );
  }
}

export default AcsHealthInsuranceProvider;
