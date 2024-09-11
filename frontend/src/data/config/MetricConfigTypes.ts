import type { ColorScheme } from 'vega'
import type { CategoryTypeId } from '../../utils/MadLibs'
import type {
  BehavioralHealthDataTypeId,
  BehavioralHealthMetricId,
} from './MetricConfigBehavioralHealth'
import type {
  ChronicDiseaseDataTypeId,
  ChronicDiseaseMetricId,
} from './MetricConfigChronicDisease'
import type {
  CommunitySafetyDataTypeId,
  CommunitySafetyMetricId,
} from './MetricConfigCommunitySafety'
import type {
  CovidCategoryDataTypeId,
  CovidCategoryMetricId,
} from './MetricConfigCovidCategory'
import type {
  HivCategoryDataTypeId,
  HivCategoryMetricId,
} from './MetricConfigHivCategory'
import type { MaternalHealthMetricId } from './MetricConfigMaternalHealth'
import type { PDOHDataTypeId, PDOHMetricId } from './MetricConfigPDOH'
import type { PhrmaDataTypeId, PhrmaMetricId } from './MetricConfigPhrma'
import type {
  PhrmaBrfssDataTypeId,
  PhrmaBrfssMetricId,
} from './MetricConfigPhrmaBrfss'
import type { SDOHDataTypeId, SDOHMetricId } from './MetricConfigSDOH'
import type { DropdownVarId } from './DropDownIds'

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
