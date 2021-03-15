import { Breakdowns, ALL_RACES_DISPLAY_NAME } from "../query/Breakdowns";
import { per100k } from "../utils/datasetutils";
import { USA_FIPS, USA_DISPLAY_NAME } from "../utils/Fips";
import VariableProvider from "./VariableProvider";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { getDataManager } from "../../utils/globals";
import { TOTAL } from "../utils/Constants";

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
    }

    if (!breakdowns.demographicBreakdowns.race_and_ethnicity.enabled) {
      df = df.pivot(
        ["fips", "fips_name", "sex"].concat(
          breakdowns.hasOnlySex() ? [] : ["age"]
        ),
        {
          race: (series) => ALL_RACES_DISPLAY_NAME,
          with_health_insurance: (series) => series.sum(),
          without_health_insurance: (series) => series.sum(),
          total_health_insurance: (series) => series.sum(),
        }
      );
      // Calculate totals where dataset doesn't provide it
      // TODO- this should be removed when Totals come from the Data Server
      const total = df
        .pivot(["fips", "fips_name"], {
          with_health_insurance: (series) => series.sum(),
          without_health_insurance: (series) => series.sum(),
          total_health_insurance: (series) => series.sum(),
          sex: (series) => TOTAL,
        })
        .resetIndex();
      df = df.concat(total).resetIndex();
    } else {
      // Calculate totals where dataset doesn't provide it
      // TODO- this should be removed when Totals come from the Data Server
      const total = df
        .pivot(["fips", "fips_name"], {
          with_health_insurance: (series) => series.sum(),
          without_health_insurance: (series) => series.sum(),
          total_health_insurance: (series) => series.sum(),
          race_and_ethnicity: (series) => TOTAL,
        })
        .resetIndex();
      df = df.concat(total).resetIndex();
    }

    df = df.generateSeries({
      health_insurance_per_100k: (row) =>
        per100k(row.with_health_insurance, row.total_health_insurance),
    });

    // We can't do percent share for national because different survey rates
    // across states may skew the results. To do that, we need to combine BRFSS
    // survey results with state populations to estimate total counts for each
    // state, and then use that estimate to determine the percent share.
    // TODO this causes the "vs Population" Disparity Bar Chart to be broken for
    // the national level. We need some way of indicating why the share of cases
    // isn't there. Or, we can do this computation on the server.
    if (breakdowns.hasOnlyRace() && breakdowns.geography === "state") {
      ["health_insurance"].forEach((col) => {
        df = this.calculatePctShare(
          df,
          col,
          col.split("_")[0] + "_pct_share",
          breakdowns.demographicBreakdowns.race_and_ethnicity.columnName,
          ["fips"]
        );
      });
    }
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
