import { defaultHigherIsWorseMapConfig } from '../../charts/mapGlobals'
import type { DataTypeConfig } from './MetricConfigTypes'

export const CANCER_CATEGORY_DROPDOWNIDS = [
  'breast_cancer',
  'cervical_cancer',
  'prostate_cancer',
  'colorectal_cancer',
  'lung_cancer',
] as const

export type CancerCategoryDataTypeId =
  | 'breast_cancer'
  | 'cervical_cancer'
  | 'prostate_cancer'
  | 'colorectal_cancer'
  | 'lung_cancer'

export type CancerCategoryMetricId =
  | 'breast_per_100k'
  | 'breast_count_estimated_total'
  | 'breast_population_pct'
  | 'breast_population_estimated_total'
  | 'breast_pct_share'
  | 'breast_pct_relative_inequity'
  | 'cervical_per_100k'
  | 'cervical_count_estimated_total'
  | 'cervical_population_pct'
  | 'cervical_population_estimated_total'
  | 'cervical_pct_share'
  | 'cervical_pct_relative_inequity'
  | 'prostate_per_100k'
  | 'prostate_count_estimated_total'
  | 'prostate_population_pct'
  | 'prostate_population_estimated_total'
  | 'prostate_pct_share'
  | 'prostate_pct_relative_inequity'
  | 'colorectal_per_100k'
  | 'colorectal_count_estimated_total'
  | 'colorectal_population_pct'
  | 'colorectal_population_estimated_total'
  | 'colorectal_pct_share'
  | 'colorectal_pct_relative_inequity'
  | 'lung_per_100k'
  | 'lung_count_estimated_total'
  | 'lung_population_pct'
  | 'lung_population_estimated_total'
  | 'lung_pct_share'
  | 'lung_pct_relative_inequity'

export const BREAST_CANCER_METRICS: DataTypeConfig[] = [
  {
    ageSubPopulationLabel: 'Ages 50-74',
    categoryId: 'cancer',
    dataTableTitle: 'Summary for breast cancer incidence',
    dataTypeId: 'breast_cancer',
    dataTypeShortLabel: 'Breast Cancer',
    definition: {
      text: 'The number of new cases of breast cancer diagnosed among women ages 50-74 within a specific time period.',
    },
    description: {
      text: 'Breast cancer is one of the most common cancers affecting women. Understanding the patterns of breast cancer incidence across different populations can help identify disparities in early detection and access to care, and inform strategies to reduce these disparities.',
    },
    fullDisplayName: 'Breast cancer incidence',
    fullDisplayNameInline: 'breast cancer incidence',
    mapConfig: defaultHigherIsWorseMapConfig,
    metrics: {},
    otherSubPopulationLabel: 'Surveyed Females',
  },
]
export const CERVICAL_CANCER_METRICS: DataTypeConfig[] = []
export const PROSTATE_CANCER_METRICS: DataTypeConfig[] = []
export const COLORECTAL_CANCER_METRICS: DataTypeConfig[] = []
export const LUNG_CANCER_METRICS: DataTypeConfig[] = []
