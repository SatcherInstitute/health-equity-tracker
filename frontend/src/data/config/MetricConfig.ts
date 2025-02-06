// TODO: integrate strings from Category / Madlib into the Metric Config
// so ALL related topic data is contained in a single object

import type { DropdownVarId } from './DropDownIds'
import {
  DEPRESSION_METRICS,
  EXCESSIVE_DRINKING_METRICS,
  FREQUENT_MENTAL_DISTRESS_METRICS,
  SUBSTANCE_MISUSE_METRICS,
  SUICIDE_METRICS,
} from './MetricConfigBehavioralHealth'
import { CDC_CANCER_INCIDENCE_METRICS } from './MetricConfigCancer'
import {
  ASTHMA_METRICS,
  CARDIOVASCULAR_DISEASES_METRICS,
  CHRONIC_KIDNEY_DISEASE_METRICS,
  COPD_METRICS,
  DIABETES_METRICS,
} from './MetricConfigChronicDisease'
import {
  GUN_DEATHS_BLACK_MEN_METRICS,
  GUN_VIOLENCE_METRICS,
  GUN_VIOLENCE_YOUTH_METRICS,
} from './MetricConfigCommunitySafety'
import {
  COVID_DISEASE_METRICS,
  COVID_VACCINATION_METRICS,
} from './MetricConfigCovidCategory'
import {
  HIV_BW_DISEASE_METRICS,
  HIV_CARE_METRICS,
  HIV_DISEASE_METRICS,
  HIV_PREP_METRICS,
  HIV_STIGMA_METRICS,
} from './MetricConfigHivCategory'
import { MATERNAL_HEALTH_METRICS } from './MetricConfigMaternalHealth'
import {
  INCARCERATION_METRICS,
  VOTER_PARTICIPATION_METRICS,
  WOMEN_IN_GOV_METRICS,
} from './MetricConfigPDOH'
import {
  PHRMA_CARDIOVASCULAR_METRICS,
  PHRMA_HIV_METRICS,
  PHRMA_MENTAL_HEALTH_METRICS,
} from './MetricConfigPhrma'
import { PHRMA_BRFSS_CANCER_SCREENING_METRICS } from './MetricConfigPhrmaBrfss'
import {
  CARE_AVOIDANCE_METRICS,
  POVERTY_METRICS,
  PREVENTABLE_HOSP_METRICS,
  UNINSURANCE_METRICS,
} from './MetricConfigSDOH'
import type { DataTypeConfig } from './MetricConfigTypes'

// TODO: count and pct_share metric types should require populationComparisonMetric
// Note: metrics must be declared in a consistent order because the UI relies
// on this to build data type toggles.
// TODO: make the UI consistent regardless of metric config order.
export const METRIC_CONFIG: Record<DropdownVarId, DataTypeConfig[]> = {
  hiv: HIV_DISEASE_METRICS,
  hiv_black_women: HIV_BW_DISEASE_METRICS,
  hiv_prep: HIV_PREP_METRICS,
  hiv_stigma: HIV_STIGMA_METRICS,
  hiv_care: HIV_CARE_METRICS,
  covid: COVID_DISEASE_METRICS,
  covid_vaccinations: COVID_VACCINATION_METRICS,
  depression: DEPRESSION_METRICS,
  excessive_drinking: EXCESSIVE_DRINKING_METRICS,
  frequent_mental_distress: FREQUENT_MENTAL_DISTRESS_METRICS,
  gun_violence: GUN_VIOLENCE_METRICS,
  gun_violence_youth: GUN_VIOLENCE_YOUTH_METRICS,
  gun_deaths_black_men: GUN_DEATHS_BLACK_MEN_METRICS,
  substance: SUBSTANCE_MISUSE_METRICS,
  suicide: SUICIDE_METRICS,
  diabetes: DIABETES_METRICS,
  copd: COPD_METRICS,
  health_insurance: UNINSURANCE_METRICS,
  poverty: POVERTY_METRICS,
  preventable_hospitalizations: PREVENTABLE_HOSP_METRICS,
  avoided_care: CARE_AVOIDANCE_METRICS,
  asthma: ASTHMA_METRICS,
  cardiovascular_diseases: CARDIOVASCULAR_DISEASES_METRICS,
  chronic_kidney_disease: CHRONIC_KIDNEY_DISEASE_METRICS,
  voter_participation: VOTER_PARTICIPATION_METRICS,
  women_in_gov: WOMEN_IN_GOV_METRICS,
  incarceration: INCARCERATION_METRICS,
  medicare_cardiovascular: PHRMA_CARDIOVASCULAR_METRICS,
  medicare_hiv: PHRMA_HIV_METRICS,
  medicare_mental_health: PHRMA_MENTAL_HEALTH_METRICS,
  maternal_mortality: MATERNAL_HEALTH_METRICS,
  cancer_screening: PHRMA_BRFSS_CANCER_SCREENING_METRICS,
  cancer_incidence: CDC_CANCER_INCIDENCE_METRICS,
}
