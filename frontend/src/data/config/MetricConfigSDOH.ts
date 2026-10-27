import {
  defaultHigherIsWorseMapConfig,
  medicareHigherIsWorseMapConfig,
} from '../../charts/mapGlobals'
import {
  ACS_EMPLOYMENT_AGE_BUCKETS,
  ACS_POVERTY_AGE_BUCKETS,
  ACS_UNINSURANCE_CURRENT_AGE_BUCKETS,
  AGE,
  AGE_BUCKETS,
} from '../utils/Constants'
import {
  adultPopulationPctShortLabel,
  adultPopulationPctTitle,
  populationPctShortLabel,
  populationPctTitle,
} from './MetricConfigConstants'
import type { DataTypeConfig } from './MetricConfigTypes'

// The table card shows only the most recent year, so older age buckets the
// current ACS release no longer reports are dropped.
const UNINSURANCE_EXCLUDED_AGES = AGE_BUCKETS.filter(
  (bucket) => !ACS_UNINSURANCE_CURRENT_AGE_BUCKETS.includes(bucket as any),
)
const POVERTY_EXCLUDED_AGES = AGE_BUCKETS.filter(
  (bucket) => !ACS_POVERTY_AGE_BUCKETS.includes(bucket as any),
)
const EMPLOYMENT_EXCLUDED_AGES = AGE_BUCKETS.filter(
  (bucket) => !ACS_EMPLOYMENT_AGE_BUCKETS.includes(bucket as any),
)

export const SDOH_CATEGORY_DROPDOWNIDS = [
  'avoided_care',
  'health_insurance',
  'poverty',
  'preventable_hospitalizations',
  'unemployment',
] as const

export type SDOHDataTypeId =
  | 'poverty'
  | 'health_insurance'
  | 'preventable_hospitalizations'
  | 'avoided_care'
  | 'unemployment'

export type SDOHMetricId =
  | 'ahr_population_pct'
  | 'ahr_18plus_population_pct'
  | 'avoided_care_pct_rate'
  | 'avoided_care_pct_share'
  | 'avoided_care_estimated_total'
  | 'poverty_count'
  | 'poverty_estimated_total'
  | 'poverty_pct_rate'
  | 'poverty_pct_relative_inequity'
  | 'poverty_pct_share'
  | 'poverty_pop_estimated_total'
  | 'poverty_population_pct'
  | 'preventable_hospitalizations_per_100k'
  | 'unemployment_estimated_total'
  | 'unemployment_pct_rate'
  | 'unemployment_pct_relative_inequity'
  | 'unemployment_pct_share'
  | 'unemployment_pop_estimated_total'
  | 'unemployment_population_pct'
  | 'uninsured_estimated_total'
  | 'uninsured_pop_estimated_total'
  | 'uninsured_pct_rate'
  | 'uninsured_pct_relative_inequity'
  | 'uninsured_pct_share'
  | 'uninsured_population_pct'

export const UNINSURANCE_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'sdoh',
    dataTypeId: 'health_insurance',
    excludedDemographicGroups: { [AGE]: UNINSURANCE_EXCLUDED_AGES },
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Uninsured people',
    fullDisplayName: 'Uninsured people',
    fullDisplayNameInline: 'uninsured people',
    definition: {
      text: `Health insurance coverage in the ACS and other Census Bureau surveys define coverage to
      include plans and programs that provide comprehensive health coverage. Plans that provide
      insurance only for specific conditions or situations such as cancer and long-term care policies
      are not considered comprehensive health coverage. Likewise, other types of insurance like
      dental, vision, life, and disability insurance are not considered comprehensive health
      insurance coverage.`,
    },
    description: {
      text: 'Health insurance is important for ensuring that people have access to quality healthcare. People of color and people with low incomes are less likely to have health insurance. Studying health insurance can help us understand why these disparities exist and how to address them.',
    },
    dataTableTitle: 'Summary for uninsured people',
    metrics: {
      pct_rate: {
        timeSeriesCadence: 'yearly',
        metricId: 'uninsured_pct_rate',
        chartTitle: 'Uninsured people',
        trendsCardTitleName: 'Rates of uninsurance over time',
        columnTitleHeader: 'Uninsured people',
        shortLabel: '% uninsured',
        type: 'pct_rate',
        rateNumeratorMetric: {
          metricId: 'uninsured_estimated_total',
          shortLabel: 'Without insurance',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'uninsured_pop_estimated_total',
          shortLabel: 'Total population',
          chartTitle: '',
          type: 'count',
        },
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
        timeSeriesCadence: 'yearly',
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
    categoryId: 'sdoh',
    dataTypeId: 'poverty',
    excludedDemographicGroups: { [AGE]: POVERTY_EXCLUDED_AGES },
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Poverty',
    fullDisplayName: 'People below the poverty line',
    fullDisplayNameInline: 'people below the poverty line',
    definition: {
      text: `Following the Office of Management and Budget's (OMB) Statistical Policy Directive 14, the Census Bureau uses a set of money income thresholds that vary by family size and composition to determine who is in poverty. If a family's total income is less than the family's threshold, then that family and every individual in it is considered in poverty. The official poverty thresholds do not vary geographically, but they are updated for inflation using the Consumer Price Index (CPI-U). The official poverty definition uses money income before taxes and does not include capital gains or noncash benefits (such as public housing, Medicaid, and food stamps).`,
    },
    description: {
      text: 'Poverty is a major determinant of health. People who are poor are more likely to experience a number of health problems, including chronic diseases, mental illness, and substance use disorders. Studying poverty can help us understand why these disparities exist and how to address them.',
    },
    dataTableTitle: 'Summary for people below the poverty line',
    metrics: {
      pct_rate: {
        timeSeriesCadence: 'yearly',
        metricId: 'poverty_pct_rate',
        chartTitle: 'People below the poverty line',
        trendsCardTitleName: 'Rates of poverty over time',
        columnTitleHeader: 'People below the poverty line',
        shortLabel: '% in poverty',
        type: 'pct_rate',
        rateNumeratorMetric: {
          metricId: 'poverty_estimated_total',
          shortLabel: 'In poverty',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'poverty_pop_estimated_total',
          shortLabel: 'Total population',
          chartTitle: '',
          type: 'count',
        },
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
        timeSeriesCadence: 'yearly',
        chartTitle: 'Relative inequity for poverty',
        metricId: 'poverty_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
    },
  },
]

export const UNEMPLOYMENT_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'sdoh',
    dataTypeId: 'unemployment',
    excludedDemographicGroups: { [AGE]: EMPLOYMENT_EXCLUDED_AGES },
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Unemployment',
    fullDisplayName: 'Unemployed people',
    fullDisplayNameInline: 'unemployed people',
    definition: {
      text: `Following the Census Bureau's definition, the civilian labor force comprises
      employed and unemployed people ages 16 and over. People are classified as unemployed if
      they do not have a job, have actively looked for work in the prior four weeks, and are
      currently available for work. The unemployment rate is the share of the civilian labor
      force that is unemployed; people not in the labor force and members of the Armed Forces
      are excluded from both the numerator and the denominator.`,
    },
    description: {
      text: 'Unemployment affects health through several specific pathways. Losing a job often means losing employer-sponsored insurance, which delays preventive care and leaves chronic conditions unmanaged. The accompanying loss of income constrains housing, nutrition, and transportation to medical appointments, and prolonged job loss is associated with higher rates of depression, hypertension, and substance use. Tracking who is unemployed shows which communities carry these compounding risks.',
    },
    dataTableTitle: 'Summary for unemployed people',
    otherSubPopulationLabel: 'Civilian labor force',
    ageSubPopulationLabel: 'Ages 16+',
    metrics: {
      pct_rate: {
        timeSeriesCadence: 'yearly',
        metricId: 'unemployment_pct_rate',
        chartTitle: 'Unemployed people',
        trendsCardTitleName: 'Rates of unemployment over time',
        columnTitleHeader: 'Unemployed people',
        shortLabel: '% unemployed',
        type: 'pct_rate',
        rateNumeratorMetric: {
          metricId: 'unemployment_estimated_total',
          shortLabel: 'Unemployed',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'unemployment_pop_estimated_total',
          shortLabel: 'Civilian labor force',
          chartTitle: '',
          type: 'count',
        },
      },
      pct_share: {
        chartTitle: 'Share of unemployment',
        metricId: 'unemployment_pct_share',
        columnTitleHeader: 'Share of unemployment',
        shortLabel: '% of unemployed',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Civilian labor force vs. distribution of total unemployed people',
          metricId: 'unemployment_population_pct',
          // Not populationPctTitle: this share is of the civilian labor force,
          // roughly half of total population, so a generic label would read as
          // the same quantity as the ACS total in the map breadcrumbs.
          columnTitleHeader: 'Labor force share (ages 16+)',
          shortLabel: '% of labor force',
          type: 'pct_share',
        },
      },
      pct_relative_inequity: {
        timeSeriesCadence: 'yearly',
        chartTitle: 'Relative inequity for unemployment',
        metricId: 'unemployment_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
    },
  },
]

export const CARE_AVOIDANCE_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'sdoh',
    dataTypeId: 'avoided_care',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Avoided Care',
    fullDisplayName: 'Care avoidance due to cost',
    fullDisplayNameInline: 'care avoidance due to cost',
    definition: {
      text: `Adults who reported a time in the past 12 months when they needed to see a doctor but could not because of cost.`,
    },
    description: {
      text: 'Avoiding care can lead to worse health outcomes. Studying avoided care in regard to health equity can help us to understand why people avoid care and how to reduce these barriers.',
    },
    surveyCollectedData: true,
    dataTableTitle: 'Summary for care avoidance due to cost',
    ageSubPopulationLabel: 'Ages 18+',
    metrics: {
      pct_rate: {
        timeSeriesCadence: 'yearly',
        metricId: 'avoided_care_pct_rate',
        chartTitle: 'Care avoidance due to cost',
        columnTitleHeader: 'Care avoidance due to cost',
        shortLabel: '% avoided care',
        type: 'pct_rate',
        rateNumeratorMetric: {
          metricId: 'avoided_care_estimated_total',
          shortLabel: 'Avoided care',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'ahr_18plus_population_estimated_total',
          shortLabel: 'Total pop. 18+',
          chartTitle: '',
          type: 'count',
        },
      },
      pct_share: {
        chartTitle: 'Share of all care avoidance due to cost',
        metricId: 'avoided_care_pct_share',
        columnTitleHeader: 'Share of all care avoidance due to cost for adults',
        shortLabel: '% of avoidances',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Adult population vs. distribution of total care avoidance due to cost',
          metricId: 'ahr_18plus_population_pct',
          columnTitleHeader: adultPopulationPctTitle,
          shortLabel: adultPopulationPctShortLabel,
          type: 'pct_share',
        },
      },
    },
  },
]

export const PREVENTABLE_HOSP_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'sdoh',
    dataTypeId: 'preventable_hospitalizations',
    mapConfig: medicareHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Preventable hospitalizations',
    fullDisplayName: 'Preventable hospitalizations',
    fullDisplayNameInline: 'preventable hospitalizations',
    definition: {
      text: `Discharges following hospitalization for diabetes with short- or long-term complications, uncontrolled diabetes without complications, diabetes with lower-extremity amputation, chronic obstructive pulmonary disease, angina without a procedure, asthma, hypertension, heart failure, dehydration, bacterial pneumonia or urinary tract infection per 100,000 Medicare beneficiaries ages 18 and older continuously enrolled in Medicare fee-for-service Part A.`,
    },
    description: {
      text: 'Studying preventable hospitalizations can help us understand why these disparities exist and how to address them.',
    },
    dataTableTitle: 'Summary for preventable hospitalizations',
    otherSubPopulationLabel: 'Medicare beneficiaries, Ages 18+',
    metrics: {
      per100k: {
        timeSeriesCadence: 'yearly',
        metricId: 'preventable_hospitalizations_per_100k',
        chartTitle: 'Preventable hospitalizations',
        columnTitleHeader:
          'Preventable hospitalizations per 100k adult Medicare enrollees',
        shortLabel: 'cases per 100k',
        type: 'per100k',
        isGeneralPopulationComparison: true,
        populationComparisonMetric: {
          chartTitle: '',
          metricId: 'ahr_18plus_population_pct',
          columnTitleHeader: adultPopulationPctTitle,
          shortLabel: adultPopulationPctShortLabel,
          type: 'pct_share',
          generalPopulationLabel: 'all adults',
        },
      },
    },
    geoOverrides: {
      county: {
        metrics: {
          per100k: {
            // Spelled out in full: DeepPartial stops at optional properties, so
            // a nested MetricConfig override is not partial the way the
            // surrounding geoOverrides shape suggests.
            populationComparisonMetric: {
              chartTitle: '',
              metricId: 'chr_population_pct',
              columnTitleHeader: populationPctTitle,
              shortLabel: populationPctShortLabel,
              type: 'pct_share',
              generalPopulationLabel: 'everyone',
            },
          },
        },
      },
    },
  },
]
