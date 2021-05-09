import { IDataFrame } from "data-forge";
import { Breakdowns } from "../query/Breakdowns";
import VariableProvider from "./VariableProvider";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { getDataManager } from "../../utils/globals";
import { applyToGroups, maybeApplyRowReorder } from "../utils/datasetutils";
import { ProviderId } from "../loading/VariableProviderMap";
import { MetricId } from "../config/MetricConfig";
import { Preprocessor } from "./preprocessors";
import { OneDimensionalGroupModifier, RowModifier } from "./modifiers";

// XXX open questions/todo list:
// - look into caching after pre-processing step, or move pre-processors after
//   geographic filter? Not sure if this is a performance problem.
// - automate DataSourceMetadata dataset_ids by using getDatasetId and
//   allowsBreakdowns.
// - one thing I don't love about the modifier API is the fact that the provider
//   is mutable and whether it fulfils the "providesMetrics" list properly
//   depends on what modifiers are added. Could address with a builder, or pass
//   all in the constructor (though there were issues with this because the
//   modifiers weren't one interface). At first I had exposed Operation
//   directly, which would be _fine_ but I wanted to attempt to be more
//   restrictive of what specific datasets can do to avoid brittle behavior
//   caused by arbitrary logic (which probably belongs on the backend).
// - Spekaing of being restrictive, should the RowModifier not allow arbitrary
//   row modifications? Could change to just have it return the new columns so
//   that it can only be used for that purpose.
// - Lots of test coverage lol

export type StandardVariableProviderOptions = {
  // If true, this provider uses a state-level dataset and automatically
  // aggregates to the national level. This does not support non-breakdown,
  // non-summable columns like a percentage. In that case, a national-level
  // dataset must be provided on the backend.
  autoGenerateNational?: boolean;

  // If a provider is passed in, this provider will automatically left-join on
  // the appropriate demographic and geographic breakdown columns.
  autoJoinWithPopulation?: VariableProvider;
};

// TODO: migrate all providers to use this class.

/**
 * The StandardVariableProvider class automates most aspects of data-processing
 * for a dataset and allows customization via options and extensible
 * preprocessors and modifiers.
 *
 * This class imposes some restrictions on datasets:
 * 1) With the exception of national-level, server-side datasets must already be
 *    aggregated to the appropriate geographic level. For simple datasets where
 *    all values are either breakdowns or counts that can be summed,
 *    national-level aggregation can be done automatically from state-level data
 *    via the autoGenerateNational param.
 * 2) Popuation joins can only be done at the same geographic level requested.
 *    For example, if the population join needs to be done at the state level
 *    and then aggregated to the national level, this must be done server-side.
 * 3) Server datasets must be named as such:
 *        {sourceId}-{underscore_separated_demographic_breakdowns}_{geography}
 *    Example:
 *        acs_population-by_race_state
 *    This class doesn't currently support multiple demographic breakdowns, but
 *    if/when it does, the naming should order breakdowns like:
 *        sex > age > race > time > geography
 *    Eg:
 *        acs_population-by_sex_age_race_county
 * 4) This class does not currently support multiple demographic breakdowns. We
 *    may extend the functionality in the future, but we will need to audit the
 *    behaviors because some things aren't well-defined or tested for multiple
 *    demographics, like state->national aggregation and calculations like
 *    percent share.
 * 5) A "Total" row must be included for every combination of demographic
 *    breakdowns.
 * 6) Every combination of geography and demographic breakdown must be
 *    supported: {national|state|county} x {sex|age|race}.
 *    However, this requirement can be dropped by subclassing and overriding
 *    allowsBreakdowns.
 *
 * Most of these requirements can be worked around using a Preprocessor. These
 * are run before doing most data processing, so you can do one-off changes as
 * if it were already done that way on the server.
 *
 * Modifiers are run near the end of data processing, right before applying
 * demographic filters, removing unnecessary columns, and sorting. These are
 * best for adding derived columns like percent share.
 */
export default class StandardVariableProvider extends VariableProvider {
  readonly sourceId: string;
  readonly autoGenerateNational: boolean;
  readonly populationProvider: VariableProvider | undefined;
  readonly preprocessors: Preprocessor[];
  readonly operations: Operation[];

  constructor(
    sourceId: string,
    providerId: ProviderId,
    providesMetrics: MetricId[],
    {
      autoGenerateNational = false,
      autoJoinWithPopulation = undefined,
    }: StandardVariableProviderOptions = {}
  ) {
    super(providerId, providesMetrics);
    this.sourceId = sourceId;
    this.autoGenerateNational = autoGenerateNational;
    this.populationProvider = autoJoinWithPopulation;
    this.preprocessors = [];
    this.operations = [];
  }

  addPreprocessor(preprocessor: Preprocessor): StandardVariableProvider {
    this.preprocessors.push(preprocessor);
    return this;
  }

  addRowModifier(rowModifier: RowModifier): StandardVariableProvider {
    this.operations.push(new RowOperation(rowModifier));
    return this;
  }

  addOneDimensionalGroupModifier(
    groupModifier: OneDimensionalGroupModifier
  ): StandardVariableProvider {
    this.operations.push(new OneDimensionalGroupOperation(groupModifier));
    return this;
  }

  private shouldAutoGenerateNational(breakdowns: Breakdowns): boolean {
    return this.autoGenerateNational && breakdowns.geography === "national";
  }

  // ALERT! KEEP IN SYNC! Make sure you update DataSourceMetadata if you update dataset IDs
  getDatasetId(breakdowns: Breakdowns): string {
    const breakdownStrings = breakdowns.getOrderedBreakdowns().map((b) => {
      if (b === "race_and_ethnicity") {
        return "race";
      }
      if (b === "fips") {
        // If auto-generating national data, request state-level data because
        // it will be automatically aggregated to the national level.
        return this.shouldAutoGenerateNational(breakdowns)
          ? "state"
          : breakdowns.geography;
      }
      return b;
    });
    const res = this.sourceId + "-by_" + breakdownStrings.join("_");
    return res;
  }

  async getDataInternal(
    metricQuery: MetricQuery
  ): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const datasetId = this.getDatasetId(breakdowns);
    let consumedDatasetIds = [datasetId];

    const dataset = await getDataManager().loadDataset(datasetId);
    let df = dataset.toDataFrame();

    this.preprocessors.forEach((preprocessor) => {
      df = preprocessor.apply(df, metricQuery);
    });

    // If requested, filter geography by state or county level
    // We apply the geo filter right away to reduce subsequent calculation times
    df = this.filterByGeo(df, breakdowns);
    if (df.count() === 0) {
      return new MetricQueryResponse([], [datasetId]);
    }

    df = this.renameGeoColumns(df, breakdowns);

    if (this.shouldAutoGenerateNational(breakdowns)) {
      df = this.sumStateToNational(df, breakdowns);
    }

    // Calculate population_pct based on total for breakdown
    // Exactly one breakdown should be enabled per allowsBreakdowns()
    const breakdownColumnName = breakdowns.getSoleDemographicBreakdown()
      .columnName;

    df = this.renameTotalToAll(df, breakdownColumnName);

    if (this.populationProvider) {
      const [data, updatedConsumedIds] = await this.joinWithPopulation(
        df,
        breakdowns,
        consumedDatasetIds,
        this.populationProvider
      );
      df = data;
      consumedDatasetIds = updatedConsumedIds;
    }

    this.operations.forEach((operation) => {
      df = operation.apply(df, metricQuery);
    });

    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);
    return new MetricQueryResponse(
      maybeApplyRowReorder(df.toArray(), breakdowns),
      consumedDatasetIds
    );
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return !breakdowns.time && breakdowns.hasExactlyOneDemographic();
  }
}

/**
 * Interface for applying an operation to a DataFrame based on the given query.
 * This interface and its implementations are intentionally not exposed beyond
 * this file because the interface is extremely general and we want to restrict
 * what kind of operations are supported.
 *
 * To add support for new types of
 * modifiers, create an interface for the new modifier and add an Operation
 * implementation that adapts the new modifier.
 */
interface Operation {
  apply(df: IDataFrame, metricQuery: MetricQuery): IDataFrame;
}

class RowOperation implements Operation {
  readonly rowModifier: RowModifier;

  constructor(rowModifier: RowModifier) {
    this.rowModifier = rowModifier;
  }

  apply(df: IDataFrame, metricQuery: MetricQuery): IDataFrame {
    return df.select((row) => this.rowModifier.apply(row)).resetIndex();
  }
}

class OneDimensionalGroupOperation implements Operation {
  readonly groupModifier: OneDimensionalGroupModifier;

  constructor(groupModifier: OneDimensionalGroupModifier) {
    this.groupModifier = groupModifier;
  }

  apply(df: IDataFrame, metricQuery: MetricQuery): IDataFrame {
    const result = applyToGroups(df, ["fips"], (group) =>
      this.groupModifier.apply(group, metricQuery)
    );

    if (df.count() !== result.count()) {
      throw new Error(
        "Group modifier should not change the number of rows per group."
      );
    }

    return result;
  }
}
