import { Breakdowns } from "../query/Breakdowns";
import { per100k } from "../utils/datasetutils";
import { USA_FIPS, USA_DISPLAY_NAME } from "../utils/Fips";
import VariableProvider from "./VariableProvider";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { getDataManager } from "../../utils/globals";
import { TOTAL } from "../utils/Constants";
import { IDataFrame, ISeries } from "data-forge";

const ABOVE_POVERTY_COL = "above_poverty_line";
const BELOW_POVERTY_COL = "below_poverty_line";

class AcsPovertyProvider extends VariableProvider {
  constructor() {
    super("acs_poverty_provider", ["poverty_count", "poverty_per_100k"]);
  }

  getDatasetId(breakdowns: Breakdowns): string {
    return (
      "acs_poverty_dataset-poverty_by_race_age_sex_" + breakdowns.geography
    );
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
    df = df.parseInts([ABOVE_POVERTY_COL, BELOW_POVERTY_COL]);

    df = this.aggregateByBreakdown(df, breakdowns);

    if (breakdowns.geography === "national") {
      //TODO
      df = df
        .pivot([breakdowns.getSoleDemographicBreakdown().columnName], {
          fips: (series) => USA_FIPS,
          fips_name: (series) => USA_DISPLAY_NAME,
          above_poverty_line: (series) => series.sum(),
          below_poverty_line: (series) => series.sum(),
        })
        .resetIndex();
    }

    let totalPivot: { [key: string]: (series: ISeries) => any } = {
      above_poverty_line: (series: ISeries) => series.sum(),
      below_poverty_line: (series: ISeries) => series.sum(),
    };

    totalPivot[breakdowns.getSoleDemographicBreakdown().columnName] = (
      series: ISeries
    ) => TOTAL;

    // Calculate totals where dataset doesn't provide it
    // TODO- this should be removed when Totals come from the Data Server
    const total = df.pivot(["fips", "fips_name"], totalPivot).resetIndex();
    df = df.concat(total).resetIndex();

    df = df.generateSeries({
      poverty_per_100k: (row) =>
        per100k(
          row[BELOW_POVERTY_COL],
          row[BELOW_POVERTY_COL] + row[ABOVE_POVERTY_COL]
        ),
    });

    df = df.renameSeries({
      below_poverty_line: "poverty_count",
    });
    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(df.toArray(), [datasetId]);
  }

  aggregateByBreakdown(df: IDataFrame, breakdowns: Breakdowns) {
    let breakdown_cols = ["race_and_ethnicity", "age", "sex"];
    let default_cols = df
      .getColumnNames()
      .filter(
        (c) =>
          breakdown_cols.indexOf(c) == -1 &&
          c != ABOVE_POVERTY_COL &&
          c != BELOW_POVERTY_COL
      );
    let cols_to_grp_by = default_cols.concat([
      breakdowns.getSoleDemographicBreakdown().columnName,
    ]);
    df = df.pivot(cols_to_grp_by, {
      above_poverty_line: (series: ISeries) => series.sum(),
      below_poverty_line: (series: ISeries) => series.sum(),
    });

    return df;
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return (
      breakdowns.hasExactlyOneDemographic() &&
      !breakdowns.hasOnlyAge() &&
      !breakdowns.time
    );
  }
}

export default AcsPovertyProvider;
