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
import type { DataSourceConfig } from '../providers/UniversalProvider'
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

const PROVIDER_KEYS = [
  'acs_condition_provider',
  'ahr_provider',
  'cawp_provider',
  'cdc_cancer_provider',
  'cdc_covid_provider',
  'geo_context_provider',
  'gun_violence_provider',
  'gun_violence_youth_provider',
  'gun_violence_black_men_provider',
  'hiv_black_women_provider',
  'hiv_provider',
  'incarceration_provider',
  'maternal_mortality_provider',
  'phrma_provider',
  'phrma_brfss_provider',
  'vaccine_provider',
] as const

export type ProviderId = (typeof PROVIDER_KEYS)[number]

type ProviderEntry = [ProviderId, MetricId[], DataSourceConfig]

// Add new health topics here and in their MetricConfig file — no subclass needed.
const PROVIDER_REGISTRATIONS: ProviderEntry[] = [
  ['acs_condition_provider', ACS_CONDITION_METRICS, ACS_CONDITION_CONFIG],
  ['ahr_provider', AHR_PROVIDER_METRICS, AHR_CONFIG],
  ['cawp_provider', CAWP_METRICS, CAWP_CONFIG],
  ['cdc_cancer_provider', CDC_CANCER_METRICS, CDC_CANCER_CONFIG],
  ['cdc_covid_provider', CDC_COVID_METRICS, CDC_COVID_CONFIG],
  ['geo_context_provider', ['svi', 'population'], GEO_CONTEXT_CONFIG],
  ['gun_violence_provider', GUN_VIOLENCE_METRIC_IDS, GUN_VIOLENCE_CONFIG],
  [
    'gun_violence_youth_provider',
    GUN_VIOLENCE_YOUTH_METRIC_IDS,
    GUN_VIOLENCE_YOUTH_CONFIG,
  ],
  [
    'gun_violence_black_men_provider',
    GUN_DEATHS_BLACK_MEN_METRIC_IDS,
    GUN_DEATHS_BLACK_MEN_CONFIG,
  ],
  ['hiv_black_women_provider', BLACK_WOMEN_METRICS, HIV_BLACK_WOMEN_CONFIG],
  ['hiv_provider', HIV_METRICS, HIV_CONFIG],
  ['incarceration_provider', INCARCERATION_METRIC_IDS, INCARCERATION_CONFIG],
  [
    'maternal_mortality_provider',
    MATERNAL_MORTALITY_METRIC_IDS,
    MATERNAL_MORTALITY_CONFIG,
  ],
  ['phrma_provider', PHRMA_METRICS, PHRMA_CONFIG],
  ['phrma_brfss_provider', PHRMA_BRFSS_METRICS, PHRMA_BRFSS_CONFIG],
  ['vaccine_provider', VACCINE_METRICS, VACCINE_CONFIG],
]

export default class VariableProviderMap {
  private readonly providers: VariableProvider[]
  private readonly providersById: Record<ProviderId, VariableProvider>
  private readonly metricsToProviderIds: Record<MetricId, ProviderId>

  constructor() {
    this.providers = PROVIDER_REGISTRATIONS.map(
      ([id, metrics, config]) => new UniversalProvider(id, metrics, config),
    )
    this.providersById = this.getProvidersById()
    this.metricsToProviderIds = this.getMetricsToProviderIdsMap()
  }

  private getProvidersById(): Record<ProviderId, VariableProvider> {
    return Object.fromEntries(
      this.providers.map((p) => [p.providerId, p]),
    ) as Record<ProviderId, VariableProvider>
  }

  private getMetricsToProviderIdsMap(): Record<MetricId, ProviderId> {
    const map: Record<string, ProviderId> = {}
    const duplicates: string[] = []
    this.providers.forEach((provider) => {
      provider.providesMetrics.forEach((varId) => {
        if (import.meta.env.DEV && map[varId]) {
          duplicates.push(
            `"${varId}" claimed by "${map[varId]}" and "${provider.providerId}"`,
          )
        }
        map[varId] = provider.providerId
      })
    })
    if (import.meta.env.DEV && duplicates.length > 0) {
      throw new Error(
        `Duplicate MetricId registrations:\n${duplicates.join('\n')}`,
      )
    }
    return map as Record<MetricId, ProviderId>
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
