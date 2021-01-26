import { Breakdowns } from "../Breakdowns";
import { ProviderId, MetricId } from "../variableProviders";
import { MetricQueryResponse, createMissingDataResponse } from "../MetricQuery";

abstract class VariableProvider {
  readonly providerId: ProviderId;
  readonly providesMetrics: MetricId[];

  constructor(providerId: ProviderId, providesMetrics: MetricId[]) {
    this.providerId = providerId;
    this.providesMetrics = providesMetrics;
  }

  async getData(breakdowns: Breakdowns): Promise<MetricQueryResponse> {
    if (!this.allowsBreakdowns(breakdowns)) {
      return createMissingDataResponse(
        "Breakdowns not supported for provider " +
          this.providerId +
          ": " +
          breakdowns.getUniqueKey()
      );
    }

    return await this.getDataInternal(breakdowns);
  }

  abstract getDataInternal(
    breakdowns: Breakdowns
  ): Promise<MetricQueryResponse>;

  abstract allowsBreakdowns(breakdowns: Breakdowns): boolean;
}

export default VariableProvider;
