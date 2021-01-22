import { Breakdowns } from "../Breakdowns";
import { Dataset } from "../DatasetTypes";
import { ProviderId, MetricId } from "../variableProviders";
import {
  MetricQueryResponse,
  createMissingDataResponse,
  MetricQuery,
} from "../MetricQuery";

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
    metricQuery: MetricQuery,
    datasets: Record<string, Dataset>
  ): MetricQueryResponse {
    if (!this.allowsBreakdowns(metricQuery.breakdowns)) {
      return createMissingDataResponse(
        "Breakdowns not supported for provider " +
          this.providerId +
          ": " +
          metricQuery.breakdowns.getBreakdownString()
      );
    }

    const missingDatasetIds = this.datasetIds.filter((id) => !datasets[id]);
    if (missingDatasetIds.length > 0) {
      return createMissingDataResponse(
        "Datasets not loaded properly: " + missingDatasetIds.join(",")
      );
    }

    return this.getDataInternal(metricQuery, datasets);
  }

  abstract getDataInternal(
    metricQuery: MetricQuery,
    datasets: Record<string, Dataset>
  ): MetricQueryResponse;

  abstract allowsBreakdowns(breakdowns: Breakdowns): boolean;

  static getUniqueDatasetIds(providers: VariableProvider[]): string[] {
    return Array.from(new Set(providers.map((p) => p.datasetIds).flat()));
  }
}

export default VariableProvider;
