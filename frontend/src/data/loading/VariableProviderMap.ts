import AcsPopulationProvider from "../variables/AcsPopulationProvider";
import VariableProvider from "../variables/VariableProvider";
import CdcCovidProvider from "../variables/CdcCovidProvider";
import BrfssProvider from "../variables/BrfssProvider";
import { MetricId } from "../config/MetricConfig";
import AcsHealthInsuranceProvider from "../variables/AcsHealthInsuranceProvider";
import AcsPovertyProvider from "../variables/AcsPovertyProvider";

export type ProviderId =
  | "acs_health_insurance_provider"
  | "acs_pop_provider"
  | "acs_poverty_provider"
  | "cdc_covid_provider"
  | "covid_provider"
  | "brfss_provider";

export default class VariableProviderMap {
  private providers: VariableProvider[];
  private providersById: Record<ProviderId, VariableProvider>;
  private metricsToProviderIds: Record<MetricId, ProviderId>;

  constructor() {
    const acsProvider = new AcsPopulationProvider();
    this.providers = [
      acsProvider,
      new CdcCovidProvider(acsProvider),
      new BrfssProvider(),
      new AcsHealthInsuranceProvider(),
      new AcsPovertyProvider(),
    ];

    this.providersById = this.getProvidersById();
    this.metricsToProviderIds = this.getMetricsToProviderIdsMap();
  }

  private getProvidersById(): Record<ProviderId, VariableProvider> {
    const providersById: Partial<Record<
      ProviderId,
      VariableProvider
    >> = Object.fromEntries(this.providers.map((p) => [p.providerId, p]));
    return providersById as Record<ProviderId, VariableProvider>;
  }

  private getMetricsToProviderIdsMap(): Record<MetricId, ProviderId> {
    const metricsToProviderIds: Partial<Record<MetricId, ProviderId>> = {};
    this.providers.forEach((provider) => {
      provider.providesMetrics.forEach((varId) => {
        metricsToProviderIds[varId] = provider.providerId;
      });
    });
    return metricsToProviderIds as Record<MetricId, ProviderId>;
  }

  /**
   * Returns a list of all VariableProviders required to get the specified
   * variables.
   */
  getUniqueProviders(metricIds: MetricId[]): VariableProvider[] {
    const providerIds = metricIds.map((id) => {
      const providerId = this.metricsToProviderIds[id];
      if (!providerId) {
        throw new Error("No provider configured for metric id: " + id);
      }
      return providerId;
    });
    const dedupedIds = Array.from(new Set(providerIds));
    return dedupedIds.map((id) => this.providersById[id]);
  }
}
