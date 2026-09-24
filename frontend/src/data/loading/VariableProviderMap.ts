import { AHR_PROVIDER_METRICS } from '../config/MetricConfigBehavioralHealth'
import { CDC_CANCER_METRICS } from '../config/MetricConfigCancer'
import {
  GUN_DEATHS_BLACK_MEN_METRIC_IDS,
  GUN_VIOLENCE_METRIC_IDS,
  GUN_VIOLENCE_YOUTH_METRIC_IDS,
} from '../config/MetricConfigCommunitySafety'
import {
  CDC_COVID_METRICS,
  VACCINE_METRICS,
} from '../config/MetricConfigCovidCategory'
import {
  BLACK_WOMEN_METRICS,
  HIV_METRICS,
} from '../config/MetricConfigHivCategory'
import { MATERNAL_MORTALITY_METRIC_IDS } from '../config/MetricConfigMaternalHealth'
import {
  CAWP_METRICS,
  INCARCERATION_METRIC_IDS,
} from '../config/MetricConfigPDOH'
import { PHRMA_METRICS } from '../config/MetricConfigPhrma'
import { PHRMA_BRFSS_METRICS } from '../config/MetricConfigPhrmaBrfss'
import { ACS_CONDITION_METRICS } from '../config/MetricConfigSDOH'
import type { MetricId } from '../config/MetricConfigTypes'
import UniversalProvider from '../providers/UniversalProvider'
import type VariableProvider from '../providers/VariableProvider'
import {
  ACS_CONDITION_CONFIG,
  AHR_CONFIG,
  CAWP_CONFIG,
  CDC_CANCER_CONFIG,
  CDC_COVID_CONFIG,
  GEO_CONTEXT_CONFIG,
  GUN_DEATHS_BLACK_MEN_CONFIG,
  GUN_VIOLENCE_CONFIG,
  GUN_VIOLENCE_YOUTH_CONFIG,
  HIV_BLACK_WOMEN_CONFIG,
  HIV_CONFIG,
  INCARCERATION_CONFIG,
  MATERNAL_MORTALITY_CONFIG,
  PHRMA_BRFSS_CONFIG,
  PHRMA_CONFIG,
  VACCINE_CONFIG,
} from './DataSourceConfigs'

export type ProviderId =
  | 'acs_condition_provider'
  | 'ahr_provider'
  | 'cawp_provider'
  | 'cdc_cancer_provider'
  | 'cdc_covid_provider'
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
        if (import.meta.env.DEV && metricsToProviderIds[varId]) {
          throw new Error(
            `Duplicate MetricId "${varId}" claimed by "${metricsToProviderIds[varId]}" and "${provider.providerId}"`,
          )
        }
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
