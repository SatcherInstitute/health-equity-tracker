import { medicareAdherenceHigherIsBetterMapConfig } from '../../charts/mapGlobals'
import type { DataTypeConfig } from './MetricConfigTypes'

export const CANCER_SCREENING_CATEGORY_DROPDOWNIDS = [
  'cancer_screening',
] as const

export type PhrmaBrfssDataTypeId =
  | 'breast_cancer_screening'
  | 'cervical_cancer_screening'
  | 'colorectal_cancer_screening'
  | 'lung_cancer_screening'
  | 'prostate_cancer_screening'

export type PhrmaBrfssMetricId =
  | 'breast_screened_estimated_total'
  | 'breast_screening_eligible_estimated_total'
  | 'breast_screened_pct_rate'
  | 'breast_screened_pct_share'
  | 'breast_screening_eligible_population_pct'
  | 'breast_screened_ratio_age_adjusted'
  | 'cervical_screened_estimated_total'
  | 'cervical_screening_eligible_estimated_total'
  | 'cervical_screened_pct_rate'
  | 'cervical_screened_pct_share'
  | 'cervical_screening_eligible_population_pct'
  | 'cervical_screened_ratio_age_adjusted'
  | 'colorectal_screened_estimated_total'
  | 'colorectal_screening_eligible_estimated_total'
  | 'colorectal_screened_pct_rate'
  | 'colorectal_screened_pct_share'
  | 'colorectal_screening_eligible_population_pct'
  | 'colorectal_screened_ratio_age_adjusted'
  | 'lung_screened_estimated_total'
  | 'lung_screening_eligible_estimated_total'
  | 'lung_screened_pct_rate'
  | 'lung_screened_pct_share'
  | 'lung_screening_eligible_population_pct'
  | 'lung_screened_ratio_age_adjusted'
  | 'prostate_screened_estimated_total'
  | 'prostate_screening_eligible_estimated_total'
  | 'prostate_screened_pct_rate'
  | 'prostate_screened_pct_share'
  | 'prostate_screening_eligible_population_pct'
  | 'prostate_screened_ratio_age_adjusted'

export const PHRMA_BRFSS_CANCER_SCREENING_METRICS: DataTypeConfig[] = [
  // Breast Cancer Screening
  {
    categoryId: 'cancer',
    dataTypeId: 'breast_cancer_screening',
    dataTableTitle: 'Summary for breast cancer screening',
    mapConfig: medicareAdherenceHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Breast cancer',
    fullDisplayName: 'Breast cancer screening',
    surveyCollectedData: true,
    definition: {
      text: `The percentage of women ages 50-74 who report having received a mammogram within the recommended timeframe, based on survey responses.`,
      citations: [
        {
          shortLabel: '',
          longerTitle: '',
          url: '',
        },
      ],
    },
    description: {
      text: `Regular breast cancer screening through mammography can detect cancer early when it is most treatable. Monitoring screening rates helps identify populations that may face barriers to preventive care and enables targeted interventions to improve early detection and reduce breast cancer mortality.`,
      citations: [
        {
          shortLabel: '',
          longerTitle: '',
          url: '',
        },
      ],
    },
    otherSubPopulationLabel: 'Surveyed Females',
    ageSubPopulationLabel: 'Ages 50-74',
    metrics: {
      pct_rate: {
        rateNumeratorMetric: {
          metricId: 'breast_screened_estimated_total',
          shortLabel: 'screenings',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'breast_screening_eligible_estimated_total',
          shortLabel: 'Total eligible',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'breast_screened_pct_rate',
        chartTitle: 'Breast Cancer Screening Adherence',
        shortLabel: '% screened',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'breast_screened_pct_share',
        shortLabel: '% share of screened pop.',
        type: 'pct_share',
      },
      pct_share: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'breast_screened_pct_share',
        shortLabel: '% share of screened pop.',
        type: 'pct_share',

        populationComparisonMetric: {
          chartTitle: 'Eligibility vs. distribution of screenings',
          metricId: 'breast_screening_eligible_population_pct',
          shortLabel: '% share of eligible pop.',
          type: 'pct_share',
        },
      },
      age_adjusted_ratio: {
        metricId: 'breast_screened_ratio_age_adjusted',
        chartTitle:
          'Age-adjusted breast cancer screening rate compared to White (NH)',
        shortLabel: 'Ratio compared to White (NH)',
        type: 'age_adjusted_ratio',
      },
    },
  },

  // Prostate Cancer Screening
  {
    categoryId: 'cancer',
    dataTypeId: 'prostate_cancer_screening',
    dataTableTitle: 'Summary for prostate cancer screening',
    mapConfig: medicareAdherenceHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Prostate cancer',
    fullDisplayName: 'Prostate cancer screening',
    surveyCollectedData: true,
    definition: {
      text: `The percentage of men ages 55-69 who report having received prostate cancer screening (such as PSA testing or digital rectal exam) within the recommended timeframe, based on survey responses.`,
      citations: [
        {
          shortLabel: '',
          longerTitle: '',
          url: '',
        },
      ],
    },
    description: {
      text: `Prostate cancer screening can help detect cancer early in high-risk populations. Understanding screening patterns across different communities helps identify disparities in access to preventive services and supports efforts to ensure informed decision-making about prostate cancer screening.`,
      citations: [
        {
          shortLabel: '',
          longerTitle: '',
          url: '',
        },
      ],
    },
    otherSubPopulationLabel: 'Surveyed Males',
    ageSubPopulationLabel: 'Ages 55-69',
    metrics: {
      pct_rate: {
        rateNumeratorMetric: {
          metricId: 'prostate_screened_estimated_total',
          shortLabel: 'screenings',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'prostate_screening_eligible_estimated_total',
          shortLabel: 'Total eligible',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'prostate_screened_pct_rate',
        chartTitle: 'Prostate Cancer Screening Adherence',
        shortLabel: '% screened',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'prostate_screened_pct_share',
        shortLabel: '% share of screened pop.',
        type: 'pct_share',
      },
      pct_share: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'prostate_screened_pct_share',
        shortLabel: '% share of screened pop.',
        type: 'pct_share',

        populationComparisonMetric: {
          chartTitle: 'Eligibility vs. distribution of screenings',
          metricId: 'prostate_screening_eligible_population_pct',
          shortLabel: '% share of eligible pop.',
          type: 'pct_share',
        },
      },
      age_adjusted_ratio: {
        metricId: 'prostate_screened_ratio_age_adjusted',
        chartTitle:
          'Age-adjusted prostate cancer screening rate compared to White (NH)',
        shortLabel: 'Ratio compared to White (NH)',
        type: 'age_adjusted_ratio',
      },
    },
  },

  // Colorectal Cancer Screening
  {
    categoryId: 'cancer',
    dataTypeId: 'colorectal_cancer_screening',
    dataTableTitle: 'Summary for colorectal cancer screening',
    mapConfig: medicareAdherenceHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Colorectal cancer',
    fullDisplayName: 'Colorectal cancer screening',
    surveyCollectedData: true,
    definition: {
      text: `The percentage of people ages 45-74 who report having received colorectal cancer screening (such as colonoscopy, sigmoidoscopy, or stool-based tests) within the recommended timeframe, based on survey responses.`,
      citations: [
        {
          shortLabel: '',
          longerTitle: '',
          url: '',
        },
      ],
    },
    description: {
      text: `Colorectal cancer screening is highly effective at detecting cancer early and identifying precancerous polyps that can be removed before they become cancerous. Tracking screening rates helps identify gaps in preventive care and supports initiatives to increase screening adherence and reduce colorectal cancer mortality.`,
      citations: [
        {
          shortLabel: '',
          longerTitle: '',
          url: '',
        },
      ],
    },
    otherSubPopulationLabel: '',
    ageSubPopulationLabel: 'Ages 45-75',
    metrics: {
      pct_rate: {
        rateNumeratorMetric: {
          metricId: 'colorectal_screened_estimated_total',
          shortLabel: 'screenings',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'colorectal_screening_eligible_estimated_total',
          shortLabel: 'Total eligible',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'colorectal_screened_pct_rate',
        chartTitle: 'Colorectal Cancer Screening Adherence',
        shortLabel: '% screened',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'colorectal_screened_pct_share',
        shortLabel: '% share of screened pop.',
        type: 'pct_share',
      },
      pct_share: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'colorectal_screened_pct_share',
        shortLabel: '% share of screened pop.',
        type: 'pct_share',

        populationComparisonMetric: {
          chartTitle: 'Eligibility vs. distribution of screenings',
          metricId: 'colorectal_screening_eligible_population_pct',
          shortLabel: '% share of eligible pop.',
          type: 'pct_share',
        },
      },
      age_adjusted_ratio: {
        metricId: 'colorectal_screened_ratio_age_adjusted',
        chartTitle:
          'Age-adjusted colorectal cancer screening rate compared to White (NH)',
        shortLabel: 'Ratio compared to White (NH)',
        type: 'age_adjusted_ratio',
      },
    },
  },

  // Cervical Cancer Screening
  {
    categoryId: 'cancer',
    dataTypeId: 'cervical_cancer_screening',
    dataTableTitle: 'Summary for cervical cancer screening',
    mapConfig: medicareAdherenceHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Cervical cancer',
    fullDisplayName: 'Cervical cancer screening',
    surveyCollectedData: true,
    definition: {
      text: `The percentage of women ages 21-65 who report having received cervical cancer screening (such as Pap test or HPV test) within the recommended timeframe, based on survey responses.`,
      citations: [
        {
          shortLabel: '',
          longerTitle: '',
          url: '',
        },
      ],
    },
    description: {
      text: `Cervical cancer screening is one of the most effective cancer prevention tools, capable of detecting precancerous changes before they develop into cancer. Monitoring screening rates helps identify populations that may lack access to preventive care and informs strategies to reduce cervical cancer incidence and mortality.`,
      citations: [
        {
          shortLabel: '',
          longerTitle: '',
          url: '',
        },
      ],
    },
    otherSubPopulationLabel: 'Surveyed Females',
    ageSubPopulationLabel: 'Ages 21-65',
    metrics: {
      pct_rate: {
        rateNumeratorMetric: {
          metricId: 'cervical_screened_estimated_total',
          shortLabel: 'screenings',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'cervical_screening_eligible_estimated_total',
          shortLabel: 'Total eligible',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'cervical_screened_pct_rate',
        chartTitle: 'Cervical Cancer Screening Adherence',
        shortLabel: '% screened',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'cervical_screened_pct_share',
        shortLabel: '% share of screened pop.',
        type: 'pct_share',
      },
      pct_share: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'cervical_screened_pct_share',
        shortLabel: '% share of screened pop.',
        type: 'pct_share',

        populationComparisonMetric: {
          chartTitle: 'Eligibility vs. distribution of screenings',
          metricId: 'cervical_screening_eligible_population_pct',
          shortLabel: '% share of eligible pop.',
          type: 'pct_share',
        },
      },
      age_adjusted_ratio: {
        metricId: 'cervical_screened_ratio_age_adjusted',
        chartTitle:
          'Age-adjusted cervical cancer screening rate compared to White (NH)',
        shortLabel: 'Ratio compared to White (NH)',
        type: 'age_adjusted_ratio',
      },
    },
  },

  {
    categoryId: 'cancer',
    dataTypeId: 'lung_cancer_screening',
    dataTableTitle: 'Summary for lung cancer screening',
    mapConfig: medicareAdherenceHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Lung cancer',
    fullDisplayName: 'Lung cancer screening',
    surveyCollectedData: true,
    definition: {
      text: `The percentage of people ages 50-79 with a significant smoking history who report having received low-dose CT screening for lung cancer within the recommended timeframe, based on survey responses.`,
      citations: [
        {
          shortLabel: '',
          longerTitle: '',
          url: '',
        },
      ],
    },
    description: {
      text: `Lung cancer screening with low-dose CT scans can detect lung cancer at earlier, more treatable stages among high-risk individuals with smoking history. Tracking screening rates in eligible populations helps identify gaps in preventive care delivery and supports efforts to reduce lung cancer mortality through early detection.`,
      citations: [
        {
          shortLabel: '',
          longerTitle: '',
          url: '',
        },
      ],
    },
    otherSubPopulationLabel: 'Surveyed Smokers',
    ageSubPopulationLabel: 'Ages 50-80',
    metrics: {
      pct_rate: {
        rateNumeratorMetric: {
          metricId: 'lung_screened_estimated_total',
          shortLabel: 'screenings',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'lung_screening_eligible_estimated_total',
          shortLabel: 'Total eligible',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'lung_screened_pct_rate',
        chartTitle: 'Lung Cancer Screening Adherence',
        shortLabel: '% screened',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'lung_screened_pct_share',
        shortLabel: '% share of screened pop.',
        type: 'pct_share',
      },
      pct_share: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'lung_screened_pct_share',
        shortLabel: '% share of screened pop.',
        type: 'pct_share',

        populationComparisonMetric: {
          chartTitle: 'Eligibility vs. distribution of screenings',
          metricId: 'lung_screening_eligible_population_pct',
          shortLabel: '% share of eligible pop.',
          type: 'pct_share',
        },
      },
      age_adjusted_ratio: {
        metricId: 'lung_screened_ratio_age_adjusted',
        chartTitle:
          'Age-adjusted lung cancer screening rate compared to White (NH)',
        shortLabel: 'Ratio compared to White (NH)',
        type: 'age_adjusted_ratio',
      },
    },
  },
]
