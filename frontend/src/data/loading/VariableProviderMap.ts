import AcsConditionProvider from '../providers/AcsConditionProvider'
import AcsPopulationProvider from '../providers/AcsPopulationProvider'
import type VariableProvider from '../providers/VariableProvider'
import CdcCovidProvider from '../providers/CdcCovidProvider'
import HivProvider from '../providers/HivProvider'
import AhrProvider from '../providers/AhrProvider'
import CawpProvider from '../providers/CawpProvider'
import IncarcerationProvider from '../providers/IncarcerationProvider'
import type { MetricId } from '../config/MetricConfig'
import VaccineProvider from '../providers/VaccineProvider'
import PhrmaProvider from '../providers/PhrmaProvider'
import GeoContextProvider from '../providers/GeoContextProvider'
import GunViolenceProvider from '../providers/GunViolenceProvider'
import GunViolenceYouthProvider from '../providers/GunViolenceYouthProvider'
import GunViolenceBlackMenProvider from '../providers/GunDeathsBlackMenProvider'
import MaternalMortalityProvider from '../providers/MaternalMortalityProvider'
import PhrmaBrfssProvider from '../providers/PhrmaBrfssProvider'

export type ProviderId =
  | 'acs_condition_provider'
  | 'acs_pop_provider'
  | 'ahr_provider'
  | 'cawp_provider'
  | 'cdc_covid_provider'
  | 'covid_provider'
  | 'geo_context_provider'
  | 'gun_violence_provider'
  | 'gun_violence_youth_provider'
  | 'gun_violence_black_men_provider'
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
    const acsProvider = new AcsPopulationProvider()
    this.providers = [
      acsProvider,
      new AcsConditionProvider(),
      new AhrProvider(),
      new CawpProvider(),
      new CdcCovidProvider(acsProvider),
      new GeoContextProvider(),
      new GunViolenceProvider(),
      new GunViolenceYouthProvider(),
      new GunViolenceBlackMenProvider(),
      new HivProvider(),
      new IncarcerationProvider(),
      new PhrmaProvider(),
      new PhrmaBrfssProvider(),
      new VaccineProvider(),
      new MaternalMortalityProvider(),
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

  /**
   * Returns a list of all VariableProviders required to get the specified
   * variables.
   */
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
}
