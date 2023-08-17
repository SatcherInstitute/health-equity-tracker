// TODO: integrate strings from Category / Madlib into the Metric Config
// so ALL related topic data is contained in a single object

import { LESS_THAN_1 } from '../utils/Constants'
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
  type PhrmaDataTypeId,
  type PhrmaMetricId,
} from './MetricConfigPhrma'
import {
  UNINSURANCE_METRICS,
  type SDOHMetricId,
  POVERTY_METRICS,
  CARE_AVOIDANCE_METRICS,
  PREVENTABLE_HOSP_METRICS,
  SDOH_CATEGORY_DROPDOWNIDS,
} from './MetricConfigSDOH'

const dropdownVarIds = [
  ...CHRONIC_DISEASE_CATEGORY_DROPDOWNIDS,
  ...PDOH_CATEGORY_DROPDOWNIDS,
  ...SDOH_CATEGORY_DROPDOWNIDS,
  ...BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS,
  ...HIV_CATEGORY_DROPDOWNIDS,
  ...COVID_CATEGORY_DROPDOWNIDS,
  ...MEDICARE_CATEGORY_DROPDOWNIDS,
] as const

export type DropdownVarId = (typeof dropdownVarIds)[number]

export function isDropdownVarId(str: string): str is DropdownVarId {
  return !!dropdownVarIds.find((dropdown) => str === dropdown)
}

export type AgeAdjustedDataTypeId =
  | 'covid_deaths'
  | 'covid_hospitalizations'
  | 'hiv_deaths'

// IDs for the sub-data types (if any) for theDropDownId
export type DataTypeId =
  | DropdownVarId
  | CovidCategoryDataTypeId
  | HivCategoryDataTypeId
  | BehavioralHealthDataTypeId
  | PhrmaDataTypeId
  | PDOHDataTypeId

export type MetricId =
  | CovidCategoryMetricId
  | HivCategoryMetricId
  | BehavioralHealthMetricId
  | PhrmaMetricId
  | PDOHMetricId
  | SDOHMetricId
  | ChronicDiseaseMetricId
  | 'geo_context'
  | 'population_pct'
  | 'population'
  | 'svi'

// The type of metric indicates where and how this a MetricConfig is represented in the frontend:
// What chart types are applicable, what metrics are shown together, display names, etc.
export type MetricType =
  | 'count'
  | 'pct_share'
  | 'per100k'
  | 'pct_relative_inequity'
  | 'pct_rate'
  | 'index'
  | 'ratio'
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
  ageAdjusted?: boolean
  isMonthly?: boolean

  // This metric is one where the denominator only includes records where
  // demographics are known. For example, for "share of covid cases" in the US
  // for the "Asian" demographic, this metric would be equal to
  // (# of Asian covid cases in the US) divided by
  // (# of covid cases in the US excluding those with unknown race/ethnicity).
  knownBreakdownComparisonMetric?: MetricConfig
  secondaryPopulationComparisonMetric?: MetricConfig
}

export interface DataTypeConfig {
  dataTypeId: DataTypeId
  dataTypeShortLabel: string
  fullDisplayName: string
  fullDisplayNameInline?: string
  dataTypeDefinition?: string
  metrics: {
    count?: MetricConfig
    pct_share: MetricConfig
    per100k?: MetricConfig
    pct_relative_inequity?: MetricConfig
    pct_rate?: MetricConfig
    index?: MetricConfig
    ratio?: MetricConfig
    age_adjusted_ratio?: MetricConfig
  }
  surveyCollectedData?: boolean
  timeSeriesData?: boolean
  dataTableTitle?: string
}

export const SYMBOL_TYPE_LOOKUP: Record<MetricType, string> = {
  per100k: 'per 100k',
  pct_share: '% share',
  count: 'people',
  index: '',
  ratio: '×',
  age_adjusted_ratio: '×',
  pct_relative_inequity: '%',
  pct_rate: '%',
}

export function isPctType(metricType: MetricType) {
  return ['pct_share', 'pct_relative_inequity', 'pct_rate'].includes(metricType)
}

/**
 * @param metricType The type of the metric to format.
 * @param value The value to format.
 * @param omitPctSymbol Whether to omit the % symbol if the metric is a %. This
 *     can be used for example if the % symbol is part of the description.
 * @returns A formatted version of a field value based on the type specified by
 *     the field name
 */
export function formatFieldValue(
  metricType: MetricType,
  value: any,
  omitPctSymbol: boolean = false
): string {
  if (value === null || value === undefined) {
    return ''
  }

  // if values are numeric but rounded down to 0, instead replace with "less than 1"
  const RATES: MetricType[] = ['pct_rate', 'per100k']
  if (value === 0 && RATES.includes(metricType)) return LESS_THAN_1

  const isRatio = metricType.includes('ratio')
  const formatOptions =
    metricType === 'pct_share' ? { minimumFractionDigits: 1 } : {}
  const formattedValue: string =
    typeof value === 'number'
      ? value.toLocaleString('en', formatOptions)
      : value
  const percentSuffix = isPctType(metricType) && !omitPctSymbol ? '%' : ''
  const ratioSuffix = isRatio ? '×' : ''
  return `${formattedValue}${percentSuffix}${ratioSuffix}`
}

export function getRateAndPctShareMetrics(
  dataTypeConfig: DataTypeConfig
): MetricConfig[] {
  const tableFields: MetricConfig[] = []
  if (dataTypeConfig) {
    if (dataTypeConfig.metrics?.per100k) {
      tableFields.push(dataTypeConfig.metrics.per100k)
    }
    if (dataTypeConfig.metrics?.pct_rate) {
      tableFields.push(dataTypeConfig.metrics.pct_rate)
    }
    if (dataTypeConfig.metrics?.index) {
      tableFields.push(dataTypeConfig.metrics.index)
    }
    if (dataTypeConfig.metrics.pct_share) {
      tableFields.push(dataTypeConfig.metrics.pct_share)
      if (dataTypeConfig.metrics.pct_share.populationComparisonMetric) {
        tableFields.push(
          dataTypeConfig.metrics.pct_share.populationComparisonMetric
        )
      }
    }
  }
  return tableFields
}

export function getAgeAdjustedRatioMetric(
  dataTypeConfig: DataTypeConfig
): MetricConfig[] {
  const tableFields: MetricConfig[] = []
  if (dataTypeConfig) {
    if (
      dataTypeConfig.metrics.age_adjusted_ratio &&
      dataTypeConfig.metrics.pct_share
    ) {
      // Ratios for Table
      tableFields.push(dataTypeConfig.metrics.age_adjusted_ratio)
      // pct_share for Unknowns Alert
      tableFields.push(dataTypeConfig.metrics.pct_share)
    }
  }
  return tableFields
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
  phrma_cardiovascular: PHRMA_CARDIOVASCULAR_METRICS,
  phrma_hiv: PHRMA_HIV_METRICS,
}
