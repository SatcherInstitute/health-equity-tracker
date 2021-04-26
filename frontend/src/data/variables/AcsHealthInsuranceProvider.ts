import { Breakdowns } from "../query/Breakdowns";
import { per100k } from "../utils/datasetutils";
import { USA_FIPS, USA_DISPLAY_NAME } from "../utils/Fips";
import VariableProvider from "./VariableProvider";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { getDataManager } from "../../utils/globals";
import { ALL, WHITE_NH, HISPANIC } from "../utils/Constants";
import { ISeries } from "data-forge";

class AcsHealthInsuranceProvider extends VariableProvider {
  constructor() {
    super("acs_health_insurance_provider", [
      "health_insurance_count",
      "health_insurance_per_100k",
      "health_insurance_pct_share",
      "health_insurance_population_pct",
    ]);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.hasOnlySex() || breakdowns.hasOnlyAge()) {
      return breakdowns.geography === "county"
        ? "acs_health_insurance-health_insurance_by_sex_age_county"
        : "acs_health_insurance-health_insurance_by_sex_age_state";
    }

    if (breakdowns.hasOnlyRace()) {
      return breakdowns.geography === "county"
        ? "acs_health_insurance-health_insurance_by_race_age_county"
        : "acs_health_insurance-health_insurance_by_race_age_state";
    }

    // Fallback for future breakdowns
    throw new Error("Not implemented");
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const datasetId = this.getDatasetId(breakdowns);
    const acsDataset = await getDataManager().loadDataset(datasetId);

    let df = acsDataset.toDataFrame();

    // If requested, filter geography by state or county level
    // We apply the geo filter right away to reduce subsequent calculation times
    df = this.filterByGeo(df, breakdowns);
    df = this.renameGeoColumns(df, breakdowns);

    // TODO: remove this code once the pipeline is run with the new race
    // standardization changes.
    if (!df.getColumnNames().includes("race_and_ethnicity")) {
      df = df.renameSeries({ race: "race_and_ethnicity" });
    }

    df = df.parseInts([
      "with_health_insurance",
      "without_health_insurance",
      "total_health_insurance",
    ]);

    if (breakdowns.geography === "national") {
      df = df
        .pivot([breakdowns.getSoleDemographicBreakdown().columnName], {
          fips: (series) => USA_FIPS,
          fips_name: (series) => USA_DISPLAY_NAME,
          with_health_insurance: (series) => series.sum(),
          without_health_insurance: (series) => series.sum(),
          total_health_insurance: (series) => series.sum(),
        })
        .resetIndex();
    } else {
      df = df.pivot(
        [
          "fips",
          "fips_name",
          breakdowns.getSoleDemographicBreakdown().columnName,
        ],
        {
          with_health_insurance: (series) => series.sum(),
          without_health_insurance: (series) => series.sum(),
          total_health_insurance: (series) => series.sum(),
        }
      );
    }

    //Remove white hispanic to bring inline with others
    df = df.where(
      (row) =>
        //We remove these races because they are subsets
        row["race_and_ethnicity"] !== WHITE_NH
    );

    let totalPivot: { [key: string]: (series: ISeries) => any } = {
      with_health_insurance: (series: ISeries) => series.sum(),
      without_health_insurance: (series: ISeries) => series.sum(),
      total_health_insurance: (series: ISeries) => series.sum(),
    };

    totalPivot[breakdowns.getSoleDemographicBreakdown().columnName] = (
      series: ISeries
    ) => ALL;

    // Calculate totals where dataset doesn't provide it
    // TODO- this should be removed when Totals come from the Data Server
    const total = df
      .where(
        (row) =>
          //We remove these races because they are subsets
          row["race_and_ethnicity"] !== HISPANIC
      )
      .pivot(["fips", "fips_name"], totalPivot)
      .resetIndex();
    df = df.concat(total).resetIndex();

    df = df.generateSeries({
      health_insurance_per_100k: (row) =>
        per100k(row.without_health_insurance, row.total_health_insurance),
    });

    df = df.renameSeries({
      total_health_insurance: "total",
      without_health_insurance: "health_insurance_count",
    });

    df = this.calculatePctShare(
      df,
      "health_insurance_count",
      "health_insurance_pct_share",
      breakdowns.getSoleDemographicBreakdown().columnName,
      ["fips"]
    );

    df = this.calculatePctShare(
      df,
      "total",
      "health_insurance_population_pct",
      breakdowns.getSoleDemographicBreakdown().columnName,
      ["fips"]
    );

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(df.toArray(), [datasetId]);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return breakdowns.hasExactlyOneDemographic() && !breakdowns.time;
  }
}

export default AcsHealthInsuranceProvider;
