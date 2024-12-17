import { defaultHigherIsWorseMapConfig } from '../../charts/mapGlobals'
import type { DataTypeConfig } from './MetricConfigTypes'

export const CDC_CANCER_CATEGORY_DROPDOWNIDS = ['cancer_incidence'] as const

export type CancerCategoryDataTypeId =
  | 'breast_cancer'
  | 'cervical_cancer'
  | 'colorectal_cancer'
  | 'lung_cancer'
  | 'prostate_cancer'

export type CancerCategoryMetricId =
  | 'breast_count_estimated_total'
  | 'breast_pct_relative_inequity'
  | 'breast_pct_share'
  | 'breast_per_100k'
  | 'breast_population_estimated_total'
  | 'breast_population_pct'
  | 'cervical_count_estimated_total'
  | 'cervical_pct_relative_inequity'
  | 'cervical_pct_share'
  | 'cervical_per_100k'
  | 'cervical_population_estimated_total'
  | 'cervical_population_pct'
  | 'colorectal_count_estimated_total'
  | 'colorectal_pct_relative_inequity'
  | 'colorectal_pct_share'
  | 'colorectal_per_100k'
  | 'colorectal_population_estimated_total'
  | 'colorectal_population_pct'
  | 'lung_count_estimated_total'
  | 'lung_pct_relative_inequity'
  | 'lung_pct_share'
  | 'lung_per_100k'
  | 'lung_population_estimated_total'
  | 'lung_population_pct'
  | 'prostate_count_estimated_total'
  | 'prostate_pct_relative_inequity'
  | 'prostate_pct_share'
  | 'prostate_per_100k'
  | 'prostate_population_estimated_total'
  | 'prostate_population_pct'

export const CDC_CANCER_INCIDENCE_METRICS: DataTypeConfig[] = [
  {
    ageSubPopulationLabel: 'Ages 50-74',
    categoryId: 'cancer',
    dataTableTitle: 'Summary for breast cancer cases',
    dataTypeId: 'breast_cancer_incidence',
    dataTypeShortLabel: 'Breast cancer',
    definition: {
      text: 'The number of new cases of breast cancer diagnosed among women ages 50-74 within a specific time period.',
    },
    description: {
      text: 'Breast cancer is one of the most common cancers affecting women. Understanding the patterns of breast cancer cases across different populations can help identify disparities in early detection and access to care, and inform strategies to reduce these disparities.',
    },
    fullDisplayName: 'Breast cancer cases',
    fullDisplayNameInline: 'breast cancer cases',
    mapConfig: defaultHigherIsWorseMapConfig,
    metrics: {
      pct_relative_inequity: {
        chartTitle: 'Historical relative inequity of breast cancer cases',
        metricId: 'breast_pct_relative_inequity',
        shortLabel: '% relative inequity',
        timeSeriesCadence: 'yearly',
        type: 'pct_relative_inequity',
      },
      pct_share: {
        chartTitle: 'Share of total breast cancer cases',
        columnTitleHeader: 'Share of total breast cancer cases',
        metricId: 'breast_pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total breast cancer cases',
          columnTitleHeader: 'Population share (ages 50-74)',
          metricId: 'breast_population_pct',
          shortLabel: '% of population',
          timeSeriesCadence: 'yearly',
          type: 'pct_share',
        },
        shortLabel: '% of breast cancer cases',
        trendsCardTitleName:
          'Inequitable share of breast cancer cases over time',
        type: 'pct_share',
      },
      per100k: {
        chartTitle: 'Breast cancer cases for women',
        columnTitleHeader: 'Breast cancer cases for women per 100k people',
        metricId: 'breast_per_100k',
        rateDenominatorMetric: {
          chartTitle: '',
          metricId: 'breast_population_estimated_total',
          shortLabel: 'Total women',
          type: 'count',
        },
        rateNumeratorMetric: {
          chartTitle: '',
          metricId: 'breast_count_estimated_total',
          shortLabel: 'Breast cancer cases',
          type: 'count',
        },
        shortLabel: 'cases per 100k',
        timeSeriesCadence: 'yearly',
        trendsCardTitleName: 'Rates of breast cancer cases for women over time',
        type: 'per100k',
      },
    },
    otherSubPopulationLabel: 'Surveyed Females',
  },
  {
    ageSubPopulationLabel: 'Ages 20-64',
    categoryId: 'cancer',
    dataTableTitle: 'Summary for cervical cancer cases',
    dataTypeId: 'cervical_cancer_incidence',
    dataTypeShortLabel: 'Cervical cancer',
    definition: {
      text: 'The number of new cases of cervical cancer diagnosed among women ages 20-64 within a specific time period.',
    },
    description: {
      text: 'Cervical cancer is a type of cancer that occurs in the cells of the cervix. Understanding the patterns of cervical cancer cases across different populations can help identify disparities in early detection and access to care, and inform strategies to reduce these disparities.',
    },
    fullDisplayName: 'Cervical cancer cases',
    fullDisplayNameInline: 'cervical cancer cases',
    mapConfig: defaultHigherIsWorseMapConfig,
    metrics: {
      pct_relative_inequity: {
        chartTitle: 'Historical relative inequity of cervical cancer cases',
        metricId: 'cervical_pct_relative_inequity',
        shortLabel: '% relative inequity',
        timeSeriesCadence: 'yearly',
        type: 'pct_relative_inequity',
      },
      pct_share: {
        chartTitle: 'Share of total cervical cancer cases',
        columnTitleHeader: 'Share of total cervical cancer cases',
        metricId: 'cervical_pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total cervical cancer cases',
          columnTitleHeader: 'Population share (ages 20-64)',
          metricId: 'cervical_population_pct',
          shortLabel: '% of population',
          type: 'pct_share',
        },
        shortLabel: '% of cervical cancer cases',
        trendsCardTitleName:
          'Inequitable share of cervical cancer cases over time',
        type: 'pct_share',
      },
      per100k: {
        chartTitle: 'Cervical cancer cases for women',
        columnTitleHeader: 'Cervical cancer cases for women per 100k people',
        metricId: 'cervical_per_100k',
        rateDenominatorMetric: {
          chartTitle: '',
          metricId: 'cervical_population_estimated_total',
          shortLabel: 'Total women',
          type: 'count',
        },
        rateNumeratorMetric: {
          chartTitle: '',
          metricId: 'cervical_count_estimated_total',
          shortLabel: 'Cervical cancer cases',
          type: 'count',
        },
        shortLabel: 'cases per 100k',
        timeSeriesCadence: 'yearly',
        trendsCardTitleName:
          'Rates of cervical cancer cases for women over time',
        type: 'per100k',
      },
    },
    otherSubPopulationLabel: 'Surveyed Females',
  },
  {
    ageSubPopulationLabel: 'Ages 45-74',
    categoryId: 'cancer',
    dataTableTitle: 'Summary for colorectal cancer cases',
    dataTypeId: 'colorectal_cancer_incidence',
    dataTypeShortLabel: 'Colorectal cancer',
    definition: {
      text: 'The number of new cases of colorectal cancer diagnosed among people ages 45-74 within a specific time period.',
    },
    description: {
      text: 'Colorectal cancer is one of the most common types of cancer. Understanding the patterns of colorectal cancer cases across different populations can help identify disparities in early detection and access to care, and inform strategies to reduce these disparities.',
    },
    fullDisplayName: 'Colorectal cancer cases',
    fullDisplayNameInline: 'colorectal cancer cases',
    mapConfig: defaultHigherIsWorseMapConfig,
    metrics: {
      pct_relative_inequity: {
        chartTitle: 'Historical relative inequity of colorectal cancer cases',
        metricId: 'colorectal_pct_relative_inequity',
        shortLabel: '% relative inequity',
        timeSeriesCadence: 'yearly',
        type: 'pct_relative_inequity',
      },
      pct_share: {
        chartTitle: 'Share of total colorectal cancer cases',
        columnTitleHeader: 'Share of total colorectal cancer cases',
        metricId: 'colorectal_pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total colorectal cancer cases',
          columnTitleHeader: 'Population share (ages 45-74)',
          metricId: 'colorectal_population_pct',
          shortLabel: '% of population',
          type: 'pct_share',
        },
        shortLabel: '% of colorectal cancer cases',
        trendsCardTitleName:
          'Inequitable share of colorectal cancer cases over time',
        type: 'pct_share',
      },
      per100k: {
        chartTitle: 'Colorectal cancer cases',
        columnTitleHeader: 'Colorectal cancer cases per 100k people',
        metricId: 'colorectal_per_100k',
        rateDenominatorMetric: {
          chartTitle: '',
          metricId: 'colorectal_population_estimated_total',
          shortLabel: 'Total population',
          type: 'count',
        },
        rateNumeratorMetric: {
          chartTitle: '',
          metricId: 'colorectal_count_estimated_total',
          shortLabel: 'Colorectal cancer cases',
          type: 'count',
        },
        shortLabel: 'cases per 100k',
        timeSeriesCadence: 'yearly',
        trendsCardTitleName: 'Rates of colorectal cancer cases over time',
        type: 'per100k',
      },
    },
    otherSubPopulationLabel: 'Surveyed Population',
  },
  {
    ageSubPopulationLabel: 'Ages 50-79',
    categoryId: 'cancer',
    dataTableTitle: 'Summary for lung cancer cases',
    dataTypeId: 'lung_cancer_incidence',
    dataTypeShortLabel: 'Lung cancer',
    definition: {
      text: 'The number of new cases of lung cancer diagnosed among people ages 50-79 within a specific time period.',
    },
    description: {
      text: 'Lung cancer is one of the most common types of cancer. Understanding the patterns of lung cancer cases across different populations can help identify disparities in early detection and access to care, and inform strategies to reduce these disparities.',
    },
    fullDisplayName: 'Lung cancer cases',
    fullDisplayNameInline: 'lung cancer cases',
    mapConfig: defaultHigherIsWorseMapConfig,
    metrics: {
      pct_relative_inequity: {
        chartTitle: 'Historical relative inequity of lung cancer cases',
        metricId: 'lung_pct_relative_inequity',
        shortLabel: '% relative inequity',
        timeSeriesCadence: 'yearly',
        type: 'pct_relative_inequity',
      },
      pct_share: {
        chartTitle: 'Share of total lung cancer cases',
        columnTitleHeader: 'Share of total lung cancer cases',
        metricId: 'lung_pct_share',
        populationComparisonMetric: {
          chartTitle: 'Population vs. distribution of total lung cancer cases',
          columnTitleHeader: 'Population share (ages 50-79)',
          metricId: 'lung_population_pct',
          shortLabel: '% of population',
          type: 'pct_share',
        },
        shortLabel: '% of lung cancer cases',
        trendsCardTitleName: 'Inequitable share of lung cancer cases over time',
        type: 'pct_share',
      },
      per100k: {
        chartTitle: 'Lung cancer cases',
        columnTitleHeader: 'Lung cancer cases per 100k people',
        metricId: 'lung_per_100k',
        rateDenominatorMetric: {
          chartTitle: '',
          metricId: 'lung_population_estimated_total',
          shortLabel: 'Total population',
          type: 'count',
        },
        rateNumeratorMetric: {
          chartTitle: '',
          metricId: 'lung_count_estimated_total',
          shortLabel: 'Lung cancer cases',
          type: 'count',
        },
        shortLabel: 'cases per 100k',
        timeSeriesCadence: 'yearly',
        trendsCardTitleName: 'Rates of lung cancer cases over time',
        type: 'per100k',
      },
    },
    otherSubPopulationLabel: 'Surveyed Population',
  },
  {
    ageSubPopulationLabel: 'Ages 55-69',
    categoryId: 'cancer',
    dataTableTitle: 'Summary for prostate cancer cases',
    dataTypeId: 'prostate_cancer_incidence',
    dataTypeShortLabel: 'Prostate cancer',
    definition: {
      text: 'The number of new cases of prostate cancer diagnosed among men ages 55-69 within a specific time period.',
    },
    description: {
      text: 'Prostate cancer is one of the most common cancers affecting men. Understanding the patterns of prostate cancer cases across different populations can help identify disparities in early detection and access to care, and inform strategies to reduce these disparities.',
    },
    fullDisplayName: 'Prostate cancer cases',
    fullDisplayNameInline: 'prostate cancer cases',
    mapConfig: defaultHigherIsWorseMapConfig,
    metrics: {
      pct_relative_inequity: {
        chartTitle: 'Historical relative inequity of prostate cancer cases',
        metricId: 'prostate_pct_relative_inequity',
        shortLabel: '% relative inequity',
        timeSeriesCadence: 'yearly',
        type: 'pct_relative_inequity',
      },
      pct_share: {
        chartTitle: 'Share of total prostate cancer cases',
        columnTitleHeader: 'Share of total prostate cancer cases',
        metricId: 'prostate_pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total prostate cancer cases',
          columnTitleHeader: 'Population share (ages 55-69)',
          metricId: 'prostate_population_pct',
          shortLabel: '% of population',
          type: 'pct_share',
        },
        shortLabel: '% of prostate cancer cases',
        trendsCardTitleName:
          'Inequitable share of prostate cancer cases over time',
        type: 'pct_share',
      },
      per100k: {
        chartTitle: 'Prostate cancer cases for men',
        columnTitleHeader: 'Prostate cancer cases for men per 100k people',
        metricId: 'prostate_per_100k',
        rateDenominatorMetric: {
          chartTitle: '',
          metricId: 'prostate_population_estimated_total',
          shortLabel: 'Total men',
          type: 'count',
        },
        rateNumeratorMetric: {
          chartTitle: '',
          metricId: 'prostate_count_estimated_total',
          shortLabel: 'Prostate cancer cases',
          type: 'count',
        },
        shortLabel: 'cases per 100k',
        timeSeriesCadence: 'yearly',
        trendsCardTitleName: 'Rates of prostate cancer cases for men over time',
        type: 'per100k',
      },
    },
    otherSubPopulationLabel: 'Surveyed Males',
  },
]
