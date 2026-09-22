import type { MetricId } from '../config/MetricConfigTypes'
import UniversalProvider from '../providers/UniversalProvider'
import type VariableProvider from '../providers/VariableProvider'
import {
  ACS_CONDITION_CONFIG,
  ACS_CONDITION_METRICS,
  AHR_CONFIG,
  AHR_PROVIDER_METRICS,
  BLACK_WOMEN_METRICS,
  CAWP_CONFIG,
  CAWP_METRICS,
  CDC_CANCER_CONFIG,
  CDC_CANCER_METRICS,
  CDC_COVID_CONFIG,
  CDC_COVID_METRICS,
  GEO_CONTEXT_CONFIG,
  GUN_DEATHS_BLACK_MEN_CONFIG,
  GUN_DEATHS_BLACK_MEN_METRIC_IDS,
  GUN_VIOLENCE_CONFIG,
  GUN_VIOLENCE_METRIC_IDS,
  GUN_VIOLENCE_YOUTH_CONFIG,
  GUN_VIOLENCE_YOUTH_METRIC_IDS,
  HIV_BLACK_WOMEN_CONFIG,
  HIV_CONFIG,
  HIV_METRICS,
  INCARCERATION_CONFIG,
  INCARCERATION_METRIC_IDS,
  MATERNAL_MORTALITY_CONFIG,
  MATERNAL_MORTALITY_METRIC_IDS,
  PHRMA_BRFSS_CONFIG,
  PHRMA_BRFSS_METRICS,
  PHRMA_CONFIG,
  PHRMA_METRICS,
  VACCINE_CONFIG,
  VACCINE_METRICS,
} from './DataSourceConfigs'

export type ProviderId =
  | 'acs_condition_provider'
  | 'acs_pop_provider'
  | 'ahr_provider'
  | 'cawp_provider'
  | 'cdc_cancer_provider'
  | 'cdc_covid_provider'
  | 'covid_provider'
  | 'geo_context_provider'
  | 'gun_violence_provider'
  | 'gun_violence_youth_provider'
  | 'gun_violence_black_men_provider'
  | 'hiv_black_women_provider'
  | 'hiv_provider'
  | 'incarceration_provider'
  | 'maternal_mortality_provider'
  | 'phrma_provider'
  | 'phrma_brfss_provider'
  | 'vaccine_provider'

export default class VariableProviderMap {
  private readonly providers: VariableProvider[]
  private readonly providersById: Record<ProviderId, VariableProvider>
  private readonly metricsToProviderIds: Record<MetricId, ProviderId>

  constructor() {
    this.providers = [
      new UniversalProvider(
        'acs_condition_provider',
        ACS_CONDITION_METRICS,
        ACS_CONDITION_CONFIG,
      ),
      new UniversalProvider('ahr_provider', AHR_PROVIDER_METRICS, AHR_CONFIG),
      new UniversalProvider('cawp_provider', CAWP_METRICS, CAWP_CONFIG),
      new UniversalProvider(
        'cdc_cancer_provider',
        CDC_CANCER_METRICS,
        CDC_CANCER_CONFIG,
      ),
      new UniversalProvider(
        'cdc_covid_provider',
        CDC_COVID_METRICS,
        CDC_COVID_CONFIG,
      ),
      new UniversalProvider(
        'geo_context_provider',
        ['svi', 'population'],
        GEO_CONTEXT_CONFIG,
      ),
      new UniversalProvider(
        'gun_violence_provider',
        GUN_VIOLENCE_METRIC_IDS,
        GUN_VIOLENCE_CONFIG,
      ),
      new UniversalProvider(
        'gun_violence_youth_provider',
        GUN_VIOLENCE_YOUTH_METRIC_IDS,
        GUN_VIOLENCE_YOUTH_CONFIG,
      ),
      new UniversalProvider(
        'gun_violence_black_men_provider',
        GUN_DEATHS_BLACK_MEN_METRIC_IDS,
        GUN_DEATHS_BLACK_MEN_CONFIG,
      ),
      new UniversalProvider(
        'hiv_black_women_provider',
        BLACK_WOMEN_METRICS,
        HIV_BLACK_WOMEN_CONFIG,
      ),
      new UniversalProvider('hiv_provider', HIV_METRICS, HIV_CONFIG),
      new UniversalProvider(
        'incarceration_provider',
        INCARCERATION_METRIC_IDS,
        INCARCERATION_CONFIG,
      ),
      new UniversalProvider('phrma_provider', PHRMA_METRICS, PHRMA_CONFIG),
      new UniversalProvider(
        'phrma_brfss_provider',
        PHRMA_BRFSS_METRICS,
        PHRMA_BRFSS_CONFIG,
      ),
      new UniversalProvider(
        'vaccine_provider',
        VACCINE_METRICS,
        VACCINE_CONFIG,
      ),
      new UniversalProvider(
        'maternal_mortality_provider',
        MATERNAL_MORTALITY_METRIC_IDS,
        MATERNAL_MORTALITY_CONFIG,
      ),
    ]
    this.providersById = this.getProvidersById()
    this.metricsToProviderIds = this.getMetricsToProviderIdsMap()
  }

  private getProvidersById(): Record<ProviderId, VariableProvider> {
    const providersById: Partial<Record<ProviderId, VariableProvider>> =
      Object.fromEntries(this.providers.map((p) => [p.providerId, p]))
    return providersById as Record<ProviderId, VariableProvider>
  }

  private getMetricsToProviderIdsMap(): Record<MetricId, ProviderId> {
    const metricsToProviderIds: Partial<Record<MetricId, ProviderId>> = {}
    this.providers.forEach((provider) => {
      provider.providesMetrics.forEach((varId) => {
        metricsToProviderIds[varId] = provider.providerId
      })
    })
    return metricsToProviderIds as Record<MetricId, ProviderId>
  }

  getUniqueProviders(metricIds: MetricId[]): VariableProvider[] {
    const providerIds = metricIds.map((id) => {
      const providerId = this.metricsToProviderIds[id]
      if (!providerId) {
        throw new Error('No provider configured for metric id: ' + id)
      }
      return providerId
    })
    const dedupedIds = Array.from(new Set(providerIds))
    return dedupedIds.map((id) => this.providersById[id])
  }

  // For tests
  getProviderById(id: ProviderId): VariableProvider {
    return this.providersById[id]
  }
}
