import { type DataTypeConfig } from './MetricConfig'
import {
  populationPctShortLabel,
  populationPctTitle,
} from './MetricConfigUtils'

export const SDOH_CATEGORY_DROPDOWNIDS = [
  'avoided_care',
  'poverty',
  'health_insurance',
  'preventable_hospitalizations',
]

export type SDOHMetricId =
  | 'ahr_population_pct'
  | 'avoided_care_pct_rate'
  | 'avoided_care_pct_share'
  | 'poverty_count'
  | 'poverty_pct_share'
  | 'poverty_pct_rate'
  | 'poverty_population_pct'
  | 'poverty_pct_relative_inequity'
  | 'preventable_hospitalizations_pct_share'
  | 'preventable_hospitalizations_per_100k'
  | 'uninsured_pct_share'
  | 'uninsured_pct_rate'
  | 'uninsured_population_pct'
  | 'uninsured_pct_relative_inequity'

export const UNINSURANCE_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'health_insurance',
    dataTypeShortLabel: 'Uninsured people',
    fullDisplayName: 'Uninsured people',
    fullDisplayNameInline: 'uninsured people',
    dataTypeDefinition: `Health insurance coverage in the ACS and other Census Bureau surveys define coverage to
      include plans and programs that provide comprehensive health coverage. Plans that provide
      insurance only for specific conditions or situations such as cancer and long-term care policies
      are not considered comprehensive health coverage. Likewise, other types of insurance like
      dental, vision, life, and disability insurance are not considered comprehensive health
      insurance coverage.`,
    dataTableTitle: 'Breakdown summary for uninsured people',
    timeSeriesData: true,
    metrics: {
      pct_rate: {
        metricId: 'uninsured_pct_rate',
        chartTitle: 'Uninsured people',
        trendsCardTitleName: 'Rates of uninsurance over time',
        columnTitleHeader: 'Uninsured people',
        shortLabel: '% uninsured',
        type: 'pct_rate',
      },
      pct_share: {
        chartTitle: 'Share of uninsured people',
        metricId: 'uninsured_pct_share',
        columnTitleHeader: 'Share of uninsured people',
        shortLabel: '% of uninsured',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle: 'Population vs. distribution of total uninsured people',
          metricId: 'uninsured_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      pct_relative_inequity: {
        chartTitle: 'Relative inequity for uninsurance',
        metricId: 'uninsured_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
    },
  },
]

export const POVERTY_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'poverty',
    dataTypeShortLabel: 'Poverty',
    fullDisplayName: 'People below the poverty line',
    fullDisplayNameInline: 'people below the poverty line',
    dataTypeDefinition: `Following the Office of Management and Budget's (OMB) Statistical Policy Directive 14, the Census Bureau uses a set of money income thresholds that vary by family size and composition to determine who is in poverty. If a family's total income is less than the family's threshold, then that family and every individual in it is considered in poverty. The official poverty thresholds do not vary geographically, but they are updated for inflation using the Consumer Price Index (CPI-U). The official poverty definition uses money income before taxes and does not include capital gains or noncash benefits (such as public housing, Medicaid, and food stamps).`,
    dataTableTitle: 'Breakdown summary for people below the poverty line',
    timeSeriesData: true,
    metrics: {
      pct_rate: {
        metricId: 'poverty_pct_rate',
        chartTitle: 'People below the poverty line',
        trendsCardTitleName: 'Rates of poverty over time',
        columnTitleHeader: 'People below the poverty line',
        shortLabel: '% in poverty',
        type: 'pct_rate',
      },
      pct_share: {
        chartTitle: 'Share of poverty',
        metricId: 'poverty_pct_share',
        columnTitleHeader: 'Share of poverty',
        shortLabel: '% of impoverished',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total people below the poverty line',
          metricId: 'poverty_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      pct_relative_inequity: {
        chartTitle: 'Relative inequity for poverty',
        metricId: 'poverty_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
    },
  },
]

export const CARE_AVOIDANCE_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'avoided_care',
    dataTypeShortLabel: 'Avoided Care',
    fullDisplayName: 'Care avoidance due to cost',
    fullDisplayNameInline: 'care avoidance due to cost',
    dataTypeDefinition: `Adults who reported a time in the past 12 months when they needed to see a doctor but could not because of cost.`,
    surveyCollectedData: true,
    dataTableTitle: 'Breakdown summary for care avoidance due to cost',
    metrics: {
      pct_rate: {
        metricId: 'avoided_care_pct_rate',
        chartTitle: 'Care avoidance due to cost',
        columnTitleHeader: 'Care avoidance due to cost',
        shortLabel: '% avoided care',
        type: 'pct_rate',
      },
      pct_share: {
        chartTitle: 'Share of all care avoidance due to cost',
        metricId: 'avoided_care_pct_share',
        columnTitleHeader: 'Share of all care avoidance due to cost',
        shortLabel: '% of avoidances',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total care avoidance due to cost',
          metricId: 'ahr_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
    },
  },
]

export const PREVENTABLE_HOSP_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'preventable_hospitalizations',
    dataTypeShortLabel: 'Preventable hospitalizations',
    fullDisplayName: 'Preventable hospitalizations',
    fullDisplayNameInline: 'preventable hospitalizations',
    dataTypeDefinition: `Discharges following hospitalization for diabetes with short- or long-term complications, uncontrolled diabetes without complications, diabetes with lower-extremity amputation, chronic obstructive pulmonary disease, angina without a procedure, asthma, hypertension, heart failure, dehydration, bacterial pneumonia or urinary tract infection per 100,000 Medicare beneficiaries ages 18 and older continuously enrolled in Medicare fee-for-service Part A.`,
    dataTableTitle: 'Breakdown summary for preventable hospitalizations',
    metrics: {
      per100k: {
        metricId: 'preventable_hospitalizations_per_100k',
        chartTitle: 'Preventable hospitalizations',
        columnTitleHeader:
          'Preventable hospitalizations per 100k adult Medicare enrollees',
        shortLabel: 'cases per 100k',
        type: 'per100k',
      },
      pct_share: {
        chartTitle: 'Share of all preventable hospitalizations',
        metricId: 'preventable_hospitalizations_pct_share',
        columnTitleHeader: 'Share of all preventable hospitalizations',
        shortLabel: '% of hospitalizations',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total preventable hospitalizations',
          metricId: 'ahr_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
    },
  },
]
