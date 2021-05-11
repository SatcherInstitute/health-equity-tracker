import { Breakdowns } from "../query/Breakdowns";
import { maybeApplyRowReorder, per100k } from "../utils/datasetutils";
import { USA_FIPS, USA_DISPLAY_NAME } from "../utils/Fips";
import VariableProvider from "./VariableProvider";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { getDataManager } from "../../utils/globals";
import {
  ALL,
  ABOVE_POVERTY_COL,
  BELOW_POVERTY_COL,
  WHITE_NH,
  HISPANIC,
} from "../utils/Constants";
import { IDataFrame, ISeries } from "data-forge";

class AcsPovertyProvider extends VariableProvider {
  constructor() {
    super("acs_poverty_provider", [
      "poverty_count",
      "poverty_per_100k",
      "poverty_pct_share",
      "poverty_population_pct",
    ]);
  }
  // ALERT! Make sure you update DataSourceMetadata if you update dataset IDs
  getDatasetId(breakdowns: Breakdowns): string {
    let datasetPrefix = "acs_poverty_dataset-poverty_by_";

    let breakdownSelector;
    if (breakdowns.hasOnlyAge()) {
      breakdownSelector = "age";
    } else if (breakdowns.hasOnlyRace()) {
      breakdownSelector = "race";
    } else {
      breakdownSelector = "sex";
    }

    return (
      datasetPrefix +
      breakdownSelector +
      (breakdowns.geography === "county" ? "_county" : "_state")
    );
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const breakdownCol = breakdowns.getSoleDemographicBreakdown().columnName;
    const datasetId = this.getDatasetId(breakdowns);
    const acsDataset = await getDataManager().loadDataset(datasetId);

    let df = acsDataset.toDataFrame();

    // If requested, filter geography by state or county level
    // We apply the geo filter right away to reduce subsequent calculation times
    df = this.filterByGeo(df, breakdowns);
    df = this.renameGeoColumns(df, breakdowns);

    df = this.aggregateByBreakdown(df, breakdownCol);
    if (breakdowns.geography === "national") {
      df = df
        .pivot([breakdownCol], {
          fips: (series) => USA_FIPS,
          fips_name: (series) => USA_DISPLAY_NAME,
          above_poverty_line: (series) => series.sum(),
          below_poverty_line: (series) => series.sum(),
        })
        .resetIndex();
    }

    // Remove white hispanic to bring inline with others
    df = df.where(
      (row) =>
        //We remove these races because they are subsets
        row["race_and_ethnicity"] !== WHITE_NH
    );

    // Calculate totals where dataset doesn't provide it
    // TODO- this should be removed when Totals come from the Data Server
    const calculatedValueForAll = df
      .where(
        (row) =>
          //We remove these races because they are subsets
          row["race_and_ethnicity"] !== HISPANIC
      )
      .pivot(["fips", "fips_name"], {
        above_poverty_line: (series: ISeries) => series.sum(),
        below_poverty_line: (series: ISeries) => series.sum(),
        [breakdownCol]: (series: ISeries) => ALL,
      })
      .resetIndex();
    df = df.concat(calculatedValueForAll).resetIndex();

    // Add a column for all people.
    df = df.generateSeries({
      total_pop: (row) => row[BELOW_POVERTY_COL] + row[ABOVE_POVERTY_COL],
    });

    df = df.generateSeries({
      poverty_per_100k: (row) =>
        per100k(row[BELOW_POVERTY_COL], row["total_pop"]),
    });

    df = df.renameSeries({
      below_poverty_line: "poverty_count",
    });

    df = this.calculatePctShare(
      df,
      "poverty_count",
      "poverty_pct_share",
      breakdowns.getSoleDemographicBreakdown().columnName,
      ["fips"]
    );

    df = this.calculatePctShare(
      df,
      "total_pop",
      "poverty_population_pct",
      breakdowns.getSoleDemographicBreakdown().columnName,
      ["fips"]
    );

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(
      maybeApplyRowReorder(df.toArray(), breakdowns),
      [datasetId]
    );
  }

  aggregateByBreakdown(df: IDataFrame, breakdownCol: string) {
    let breakdown_cols = ["race_and_ethnicity", "age", "sex"];

    //Get all collumns minus the breakdown cols and the summation cols.
    let default_cols = df
      .getColumnNames()
      .filter(
        (c) =>
          breakdown_cols.indexOf(c) === -1 &&
          c !== ABOVE_POVERTY_COL &&
          c !== BELOW_POVERTY_COL
      );

    // Add the breakdown col to the pivot
    let cols_to_grp_by = default_cols.concat([breakdownCol]);

    // Sum the pivot cols to merge to breakdown col only
    df = df.pivot(cols_to_grp_by, {
      above_poverty_line: (series: ISeries) => series.sum(),
      below_poverty_line: (series: ISeries) => series.sum(),
    });

    return df;
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return breakdowns.hasExactlyOneDemographic() && !breakdowns.time;
  }
}

export default AcsPovertyProvider;
