import { Breakdowns } from "../Breakdowns";
import { Dataset } from "../DatasetTypes";
import { ProviderId, MetricId } from "../variableProviders";
import { MetricQueryResponse, createMissingDataResponse } from "../MetricQuery";

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
  getData(
    datasets: Record<string, Dataset>,
    breakdowns: Breakdowns
  ): MetricQueryResponse {
    if (!this.allowsBreakdowns(breakdowns)) {
      return createMissingDataResponse(
        "Breakdowns not supported for provider " +
          this.providerId +
          ": " +
          JSON.stringify(breakdowns)
      );
    }

    const missingDatasetIds = this.datasetIds.filter((id) => !datasets[id]);
    if (missingDatasetIds.length > 0) {
      return createMissingDataResponse(
        "Datasets not loaded properly: " + missingDatasetIds.join(",")
      );
    }

    return this.getDataInternal(datasets, breakdowns);
  }

  abstract getDataInternal(
    datasets: Record<string, Dataset>,
    breakdowns: Breakdowns
  ): MetricQueryResponse;

  abstract allowsBreakdowns(breakdowns: Breakdowns): boolean;

  static getUniqueDatasetIds(providers: VariableProvider[]): string[] {
    return Array.from(new Set(providers.map((p) => p.datasetIds).flat()));
  }
}

export default VariableProvider;
