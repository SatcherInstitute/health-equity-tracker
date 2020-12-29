import { Breakdowns } from "../Breakdowns";
import { Dataset, Row } from "../DatasetTypes";
import { ProviderId, MetricId } from "../variableProviders";
import { ExpectedError } from "../MetricQuery";

abstract class VariableProvider {
  readonly providerId: ProviderId;
  readonly providesMetrics: MetricId[];
  readonly datasetIds: readonly string[];

  constructor(
    providerId: ProviderId,
    providesMetrics: MetricId[],
    datasetIds: string[]
  ) {
    this.providerId = providerId;
    this.providesMetrics = providesMetrics;
    this.datasetIds = datasetIds;
  }

  // TODO change return type to MetricQueryResponse instead of Row[]
  getData(datasets: Record<string, Dataset>, breakdowns: Breakdowns): Row[] {
    if (!this.allowsBreakdowns(breakdowns)) {
      throw new ExpectedError(
        "Breakdowns not supported for provider " +
          this.providerId +
          ": " +
          JSON.stringify(breakdowns)
      );
    }

    const missingDatasetIds = this.datasetIds.filter((id) => !datasets[id]);
    if (missingDatasetIds.length > 0) {
      throw new ExpectedError(
        "Datasets not loaded properly: " + missingDatasetIds.join(",")
      );
    }

    const data = this.getDataInternal(datasets, breakdowns);

    if (data.length > 0) {
      return data;
    } else {
      throw new ExpectedError("Dataset returned empty.");
    }
  }

  abstract getDataInternal(
    datasets: Record<string, Dataset>,
    breakdowns: Breakdowns
  ): Row[];

  abstract allowsBreakdowns(breakdowns: Breakdowns): boolean;

  static getUniqueDatasetIds(providers: VariableProvider[]): string[] {
    return Array.from(new Set(providers.map((p) => p.datasetIds).flat()));
  }
}

export default VariableProvider;
