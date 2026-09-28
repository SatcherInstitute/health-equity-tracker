import type { DataTypeId } from '../config/MetricConfigTypes'
import UniversalProvider from '../providers/UniversalProvider'
import type VariableProvider from '../providers/VariableProvider'
import type { MetricQuery } from '../query/MetricQuery'
import type { DataSourceConfig } from './DataSourceConfigs'
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

// A query is "this topic, at this geography", and that pair names exactly one
// dataset file. So a provider is selected by the topic it serves, and its
// DataSourceConfig resolves the geography. Add new health topics here and in
// their MetricConfig file — no subclass needed.
const PROVIDER_REGISTRATIONS = [
  [
    'acs_condition_provider',
    ['health_insurance', 'poverty'],
    ACS_CONDITION_CONFIG,
  ],
  [
    'ahr_provider',
    [
      'asthma',
      'avoided_care',
      'cardiovascular_diseases',
      'chronic_kidney_disease',
      'copd',
      'depression',
      'diabetes',
      'excessive_drinking',
      'frequent_mental_distress',
      'non_medical_drug_use',
      'preventable_hospitalizations',
      'severe_maternal_morbidity',
      'suicide',
      'voter_participation',
    ],
    AHR_CONFIG,
  ],
  [
    'cawp_provider',
    ['women_in_state_legislature', 'women_in_us_congress'],
    CAWP_CONFIG,
  ],
  [
    'cdc_cancer_provider',
    [
      'breast_cancer_incidence',
      'cervical_cancer_incidence',
      'colorectal_cancer_incidence',
      'lung_cancer_incidence',
      'prostate_cancer_incidence',
    ],
    CDC_CANCER_CONFIG,
  ],
  [
    'cdc_covid_provider',
    ['covid_cases', 'covid_deaths', 'covid_hospitalizations'],
    CDC_COVID_CONFIG,
  ],
  // Population and SVI are geography context rather than a health topic, so
  // this provider serves queries that carry no dataTypeId at all.
  ['geo_context_provider', [], GEO_CONTEXT_CONFIG],
  [
    'gun_violence_provider',
    ['gun_deaths', 'gun_violence_homicide', 'gun_violence_suicide'],
    GUN_VIOLENCE_CONFIG,
  ],
  [
    'gun_violence_youth_provider',
    ['gun_deaths_young_adults', 'gun_deaths_youth'],
    GUN_VIOLENCE_YOUTH_CONFIG,
  ],
  [
    'gun_violence_black_men_provider',
    ['gun_deaths_black_men'],
    GUN_DEATHS_BLACK_MEN_CONFIG,
  ],
  [
    'hiv_black_women_provider',
    [
      'hiv_deaths_black_women',
      'hiv_diagnoses_black_women',
      'hiv_prevalence_black_women',
    ],
    HIV_BLACK_WOMEN_CONFIG,
  ],
  [
    'hiv_provider',
    [
      'hiv_care',
      'hiv_deaths',
      'hiv_diagnoses',
      'hiv_prep',
      'hiv_prevalence',
      'hiv_stigma',
    ],
    HIV_CONFIG,
  ],
  ['incarceration_provider', ['jail', 'prison'], INCARCERATION_CONFIG],
  [
    'maternal_mortality_provider',
    ['maternal_mortality'],
    MATERNAL_MORTALITY_CONFIG,
  ],
  [
    'phrma_provider',
    [
      'anti_psychotics_adherence',
      'arv_adherence',
      'bb_ami_adherence',
      'beta_blockers_adherence',
      'ccb_adherence',
      'doac_adherence',
      'medicare_ami',
      'medicare_hiv',
      'medicare_schizophrenia',
      'ras_antagonists_adherence',
      'statins_adherence',
    ],
    PHRMA_CONFIG,
  ],
  [
    'phrma_brfss_provider',
    [
      'breast_cancer_screening',
      'cervical_cancer_screening',
      'colorectal_cancer_screening',
      'lung_cancer_screening',
      'prostate_cancer_screening',
    ],
    PHRMA_BRFSS_CONFIG,
  ],
  ['vaccine_provider', ['covid_vaccinations'], VACCINE_CONFIG],
] as const satisfies ReadonlyArray<
  readonly [string, readonly DataTypeId[], DataSourceConfig]
>

export type ProviderId = (typeof PROVIDER_REGISTRATIONS)[number][0]

const TOPICLESS_PROVIDER_ID: ProviderId = 'geo_context_provider'

export default class VariableProviderMap {
  private readonly providers: VariableProvider[]
  private readonly providersById: Record<ProviderId, VariableProvider>
  private readonly providersByDataTypeId: Record<DataTypeId, VariableProvider>

  constructor() {
    this.providers = PROVIDER_REGISTRATIONS.map(
      ([id, _dataTypeIds, config]) => new UniversalProvider(id, config),
    )
    this.providersById = this.getProvidersById()
    this.providersByDataTypeId = this.getProvidersByDataTypeId()
  }

  private getProvidersById(): Record<ProviderId, VariableProvider> {
    return Object.fromEntries(
      this.providers.map((p) => [p.providerId, p]),
    ) as Record<ProviderId, VariableProvider>
  }

  private getProvidersByDataTypeId(): Record<DataTypeId, VariableProvider> {
    const map: Record<string, VariableProvider> = {}
    const duplicates: string[] = []
    PROVIDER_REGISTRATIONS.forEach(([providerId, dataTypeIds]) => {
      dataTypeIds.forEach((dataTypeId) => {
        if (import.meta.env.DEV && map[dataTypeId]) {
          duplicates.push(
            `"${dataTypeId}" claimed by "${map[dataTypeId].providerId}" and "${providerId}"`,
          )
        }
        map[dataTypeId] = this.providersById[providerId]
      })
    })
    if (import.meta.env.DEV && duplicates.length > 0) {
      throw new Error(
        `Duplicate DataTypeId registrations:\n${duplicates.join('\n')}`,
      )
    }
    return map as Record<DataTypeId, VariableProvider>
  }

  getProvider(query: MetricQuery): VariableProvider {
    if (!query.dataTypeId) return this.providersById[TOPICLESS_PROVIDER_ID]
    const provider = this.providersByDataTypeId[query.dataTypeId]
    if (!provider) {
      throw new Error(
        'No provider configured for data type: ' + query.dataTypeId,
      )
    }
    return provider
  }

  // For tests
  getProviderById(id: ProviderId): VariableProvider {
    return this.providersById[id]
  }
}
