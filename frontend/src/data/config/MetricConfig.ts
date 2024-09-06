// TODO: integrate strings from Category / Madlib into the Metric Config
// so ALL related topic data is contained in a single object

import type { ColorScheme } from 'vega'
import { LESS_THAN_POINT_1 } from '../utils/Constants'
import {
  DEPRESSION_METRICS,
  type BehavioralHealthMetricId,
  EXCESSIVE_DRINKING_METRICS,
  SUBSTANCE_MISUSE_METRICS,
  FREQUENT_MENTAL_DISTRESS_METRICS,
  SUICIDE_METRICS,
  type BehavioralHealthDataTypeId,
  BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS,
} from './MetricConfigBehavioralHealth'
import {
  ASTHMA_METRICS,
  CARDIOVASCULAR_DISEASES_METRICS,
  CHRONIC_KIDNEY_DISEASE_METRICS,
  DIABETES_METRICS,
  type ChronicDiseaseMetricId,
  COPD_METRICS,
  CHRONIC_DISEASE_CATEGORY_DROPDOWNIDS,
  type ChronicDiseaseDataTypeId,
} from './MetricConfigChronicDisease'
import {
  COVID_CATEGORY_DROPDOWNIDS,
  COVID_DISEASE_METRICS,
  COVID_VACCINATION_METRICS,
  type CovidCategoryDataTypeId,
  type CovidCategoryMetricId,
} from './MetricConfigCovidCategory'
import {
  HIV_BW_DISEASE_METRICS,
  HIV_CARE_METRICS,
  HIV_CATEGORY_DROPDOWNIDS,
  HIV_DISEASE_METRICS,
  HIV_PREP_METRICS,
  HIV_STIGMA_METRICS,
  type HivCategoryDataTypeId,
  type HivCategoryMetricId,
} from './MetricConfigHivCategory'
import {
  VOTER_PARTICIPATION_METRICS,
  type PDOHDataTypeId,
  type PDOHMetricId,
  WOMEN_IN_GOV_METRICS,
  INCARCERATION_METRICS,
  PDOH_CATEGORY_DROPDOWNIDS,
} from './MetricConfigPDOH'
import {
  MEDICARE_CATEGORY_DROPDOWNIDS,
  PHRMA_CARDIOVASCULAR_METRICS,
  PHRMA_HIV_METRICS,
  PHRMA_MENTAL_HEALTH_METRICS,
  type PhrmaDataTypeId,
  type PhrmaMetricId,
} from './MetricConfigPhrma'
import {
  CANCER_CATEGORY_DROPDOWNIDS,
  PHRMA_BRFSS_CANCER_SCREENING_METRICS,
  type PhrmaBrfssDataTypeId,
  type PhrmaBrfssMetricId,
} from './MetricConfigPhrmaBrfss'
import {
  UNINSURANCE_METRICS,
  type SDOHDataTypeId,
  type SDOHMetricId,
  POVERTY_METRICS,
  CARE_AVOIDANCE_METRICS,
  PREVENTABLE_HOSP_METRICS,
  SDOH_CATEGORY_DROPDOWNIDS,
} from './MetricConfigSDOH'
import { DROPDOWN_TOPIC_MAP, type CategoryTypeId } from '../../utils/MadLibs'
import { getFormatterPer100k } from '../../charts/utils'
import {
  COMMUNITY_SAFETY_DROPDOWNIDS,
  type CommunitySafetyDataTypeId,
  type CommunitySafetyMetricId,
  GUN_DEATHS_BLACK_MEN_METRICS,
  GUN_VIOLENCE_METRICS,
  GUN_VIOLENCE_YOUTH_METRICS,
} from './MetricConfigCommunitySafety'
import {
  MATERNAL_HEALTH_CATEGORY_DROPDOWNIDS,
  MATERNAL_HEALTH_METRICS,
  type MaternalHealthMetricId,
} from './MetricConfigMaternalHealth'
import { isPctType } from './MetricConfigUtils'

const dropdownVarIds = [
  ...CHRONIC_DISEASE_CATEGORY_DROPDOWNIDS,
  ...PDOH_CATEGORY_DROPDOWNIDS,
  ...SDOH_CATEGORY_DROPDOWNIDS,
  ...BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS,
  ...HIV_CATEGORY_DROPDOWNIDS,
  ...COVID_CATEGORY_DROPDOWNIDS,
  ...MEDICARE_CATEGORY_DROPDOWNIDS,
  ...COMMUNITY_SAFETY_DROPDOWNIDS,
  ...MATERNAL_HEALTH_CATEGORY_DROPDOWNIDS,
  ...CANCER_CATEGORY_DROPDOWNIDS,
] as const

export type DropdownVarId = (typeof dropdownVarIds)[number]

export function isDropdownVarId(str: string): str is DropdownVarId {
  return !!dropdownVarIds.find((dropdown) => str === dropdown)
}

// IDs for the sub-data types (if any) for theDropDownId
export type DataTypeId =
  | DropdownVarId
  | ChronicDiseaseDataTypeId
  | CovidCategoryDataTypeId
  | HivCategoryDataTypeId
  | BehavioralHealthDataTypeId
  | PhrmaDataTypeId
  | PhrmaBrfssDataTypeId
  | PDOHDataTypeId
  | SDOHDataTypeId
  | CommunitySafetyDataTypeId

export type MetricId =
  | CovidCategoryMetricId
  | HivCategoryMetricId
  | BehavioralHealthMetricId
  | PhrmaMetricId
  | PhrmaBrfssMetricId
  | PDOHMetricId
  | SDOHMetricId
  | ChronicDiseaseMetricId
  | CommunitySafetyMetricId
  | MaternalHealthMetricId
  | 'geo_context'
  | 'population_pct'
  | 'population'
  | 'svi'
  | 'ahr_population_estimated_total'
  | 'ahr_population_18plus'

// The type of metric indicates where and how this a MetricConfig is represented in the frontend:
// What chart types are applicable, what metrics are shown together, display names, etc.
export type MetricType =
  | 'count'
  | 'pct_share'
  | 'per100k'
  | 'pct_relative_inequity'
  | 'pct_rate'
  | 'index'
  | 'age_adjusted_ratio'

export interface MetricConfig {
  metricId: MetricId
  columnTitleHeader?: string
  trendsCardTitleName?: string
  chartTitle: string
  shortLabel: string
  unknownsVegaLabel?: string
  type: MetricType
  populationComparisonMetric?: MetricConfig
  rateNumeratorMetric?: MetricConfig
  rateDenominatorMetric?: MetricConfig
  timeSeriesCadence?: 'yearly' | 'monthly'

  // This metric is one where the denominator only includes records where
  // demographics are known. For example, for "share of covid cases" in the US
  // for the "Asian" demographic, this metric would be equal to
  // (# of Asian covid cases in the US) divided by
  // (# of covid cases in the US excluding those with unknown race/ethnicity).
  knownBreakdownComparisonMetric?: MetricConfig
  secondaryPopulationComparisonMetric?: MetricConfig
}

export interface MapConfig {
  scheme: ColorScheme
  min: string
  mid: string
  higherIsBetter?: boolean
}

export interface Citation {
  shortLabel: string
  longerTitle: string
  url: string
}
export interface InfoWithCitations {
  text: string
  citations?: Citation[]
}

export interface DataTypeConfig {
  dataTypeId: DataTypeId
  dataTypeShortLabel: string
  fullDisplayName: string
  fullDisplayNameInline?: string
  definition?: InfoWithCitations
  description?: InfoWithCitations
  metrics: {
    count?: MetricConfig
    pct_share?: MetricConfig
    pct_share_unknown?: MetricConfig
    per100k?: MetricConfig
    pct_relative_inequity?: MetricConfig
    pct_rate?: MetricConfig
    index?: MetricConfig
    ratio?: MetricConfig
    age_adjusted_ratio?: MetricConfig
  }
  surveyCollectedData?: boolean
  dataTableTitle: string
  mapConfig: MapConfig
  categoryId: CategoryTypeId
  ageSubPopulationLabel?: string
  otherSubPopulationLabel?: string
}

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
}
