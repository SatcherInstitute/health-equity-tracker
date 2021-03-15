import { Breakdowns, ALL_RACES_DISPLAY_NAME } from "../query/Breakdowns";
import { per100k } from "../utils/datasetutils";
import { USA_FIPS, USA_DISPLAY_NAME } from "../utils/Fips";
import VariableProvider from "./VariableProvider";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { getDataManager } from "../../utils/globals";
import { TOTAL } from "../utils/Constants";
import { ISeries } from "data-forge";

class AcsHealthInsuranceProvider extends VariableProvider {
  constructor() {
    super("acs_health_insurance_provider", [
      "health_insurance_count",
      "health_insurance_per_100k",
    ]);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    if (breakdowns.hasOnlySex()) {
      return breakdowns.geography === "county"
        ? "acs_health_insurance-health_insurance_by_sex_county"
        : "acs_health_insurance-health_insurance_by_sex_state";
    }

    if (breakdowns.hasOnlyRace()) {
      return breakdowns.geography === "county"
        ? "acs_health_insurance-health_insurance_by_race_county"
        : "acs_health_insurance-health_insurance_by_race_state";
    }

    // Age only breakdown is not supported yet, due to the dataset not being
    // Aggregated on the backend.
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
    df = this.mergeStateCountyFips(df);
    df = this.filterByGeo(df, breakdowns);
    df = this.renameGeoColumns(df, breakdowns);
    df = df.renameSeries({ race: "race_and_ethnicity" });
    df = df.parseInts([
      "with_health_insurance",
      "without_health_insurance",
      "total_health_insurance",
    ]);

    if (breakdowns.geography === "national") {
      df = df
        .pivot(
          [
            breakdowns.demographicBreakdowns.race_and_ethnicity.columnName,
            breakdowns.demographicBreakdowns.sex.columnName,
          ],
          {
            fips: (series) => USA_FIPS,
            fips_name: (series) => USA_DISPLAY_NAME,
            with_health_insurance: (series) => series.sum(),
            without_health_insurance: (series) => series.sum(),
            total_health_insurance: (series) => series.sum(),
          }
        )
        .resetIndex();
    } else {
      df = df.pivot(
        ["fips", "fips_name"]
          .concat(
            breakdowns.demographicBreakdowns.age.enabled
              ? [breakdowns.demographicBreakdowns.age.columnName]
              : []
          )
          .concat(
            breakdowns.demographicBreakdowns.sex.enabled
              ? [breakdowns.demographicBreakdowns.sex.columnName]
              : []
          )
          .concat(
            breakdowns.demographicBreakdowns.race_and_ethnicity.enabled
              ? [breakdowns.demographicBreakdowns.race_and_ethnicity.columnName]
              : []
          ),
        {
          with_health_insurance: (series) => series.sum(),
          without_health_insurance: (series) => series.sum(),
          total_health_insurance: (series) => series.sum(),
        }
      );
    }

    let totalPivot: { [key: string]: (series: ISeries) => any } = {
      with_health_insurance: (series: ISeries) => series.sum(),
      without_health_insurance: (series: ISeries) => series.sum(),
      total_health_insurance: (series: ISeries) => series.sum(),
    };

    Object.values(breakdowns.demographicBreakdowns).forEach((demo) => {
      if (demo && demo.enabled) {
        totalPivot[demo.columnName] = (series: ISeries) => TOTAL;
      }
    });

    // Calculate totals where dataset doesn't provide it
    // TODO- this should be removed when Totals come from the Data Server
    const total = df.pivot(["fips", "fips_name"], totalPivot).resetIndex();
    df = df.concat(total).resetIndex();

    df = df.generateSeries({
      health_insurance_per_100k: (row) =>
        per100k(row.with_health_insurance, row.total_health_insurance),
    });

    df = df.renameSeries({
      total_health_insurance: "total",
      with_health_insurance: "health_insurance_count",
    });
    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(df.toArray(), [datasetId]);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return (
      breakdowns.hasExactlyOneDemographic() &&
      !breakdowns.hasOnlyAge() &&
      !breakdowns.time
    );
  }
}

export default AcsHealthInsuranceProvider;
