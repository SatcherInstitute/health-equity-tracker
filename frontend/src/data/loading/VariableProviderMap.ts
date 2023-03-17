import AcsConditionProvider from "../variables/AcsConditionProvider";
import AcsPopulationProvider from "../variables/AcsPopulationProvider";
import Acs2010PopulationProvider from "../variables/Acs2010PopulationProvider";
import VariableProvider from "../variables/VariableProvider";
import CdcCovidProvider from "../variables/CdcCovidProvider";
import HivProvider from "../variables/HivProvider";
import BrfssProvider from "../variables/BrfssProvider";
import CawpProvider from "../variables/CawpProvider";
import IncarcerationProvider from "../variables/IncarcerationProvider";
import { MetricId } from "../config/MetricConfig";
import VaccineProvider from "../variables/VaccineProvider";
import GeoContextProvider from "../variables/GeoContextProvider";

export type ProviderId =
  | "acs_condition_provider"
  | "acs_pop_provider"
  | "cdc_covid_provider"
  | "hiv_provider"
  | "geo_context_provider"
  | "vaccine_provider"
  | "covid_provider"
  | "brfss_provider"
  | "cawp_provider"
  | "incarceration_provider"
  | "acs_2010_pop_provider";

export default class VariableProviderMap {
  private providers: VariableProvider[];
  private providersById: Record<ProviderId, VariableProvider>;
  private metricsToProviderIds: Record<MetricId, ProviderId>;

  constructor() {
    const acsProvider = new AcsPopulationProvider();
    const acs2010Provider = new Acs2010PopulationProvider();
    this.providers = [
      acsProvider,
      acs2010Provider,
      new AcsConditionProvider(),
      new CdcCovidProvider(acsProvider),
      new HivProvider(),
      new GeoContextProvider(),
      new CawpProvider(),
      new IncarcerationProvider(),
      new BrfssProvider(),
      new VaccineProvider(acsProvider),
    ];
    this.providersById = this.getProvidersById();
    this.metricsToProviderIds = this.getMetricsToProviderIdsMap();
  }

  private getProvidersById(): Record<ProviderId, VariableProvider> {
    const providersById: Partial<Record<ProviderId, VariableProvider>> =
      Object.fromEntries(this.providers.map((p) => [p.providerId, p]));
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
