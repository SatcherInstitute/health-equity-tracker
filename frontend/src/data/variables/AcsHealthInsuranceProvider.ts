import { ISeries } from "data-forge";
import { getDataManager } from "../../utils/globals";
import { Breakdowns } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { ALL, HISPANIC, RACE, WHITE_NH } from "../utils/Constants";
import { USA_DISPLAY_NAME, USA_FIPS } from "../utils/Fips";
import VariableProvider from "./VariableProvider";

class AcsHealthInsuranceProvider extends VariableProvider {
  constructor() {
    super("acs_health_insurance_provider", [
      "health_insurance_count",
      "health_insurance_per_100k",
      "health_insurance_pct_share",
      "health_insurance_population_pct",
      "health_insurance_ratio_age_adjusted",
    ]);
  }

  // ALERT! KEEP IN SYNC! Make sure you update data/config/DatasetMetadata AND data/config/MetadataMap.ts if you update dataset IDs
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
        row[RACE] !== WHITE_NH
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
          row[RACE] !== HISPANIC
      )
      .pivot(["fips", "fips_name"], totalPivot)
      .resetIndex();
    df = df.concat(total).resetIndex();

    df = df.generateSeries({
      health_insurance_per_100k: (row) =>
        this.calculations.per100k(
          row.without_health_insurance,
          row.total_health_insurance
        ),
    });

    df = df.renameSeries({
      total_health_insurance: "total",
      without_health_insurance: "health_insurance_count",
    });

    df = this.calculations.calculatePctShare(
      df,
      "health_insurance_count",
      "health_insurance_pct_share",
      breakdowns.getSoleDemographicBreakdown().columnName,
      ["fips"]
    );

    df = this.calculations.calculatePctShare(
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
