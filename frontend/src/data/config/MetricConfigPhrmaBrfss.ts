import { medicareHigherIsBetterMapConfig } from '../../charts/mapGlobals'
import type { DataTypeConfig } from './MetricConfig'

export const CANCER_CATEGORY_DROPDOWNIDS = ['cancer_screening']

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
    dataTableTitle: 'Breakdown summary for breast cancer screening',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Breast cancer',
    fullDisplayName: 'Breast cancer screening',
    surveyCollectedData: true,
    definition: {
      text: ``,
      citations: [
        {
          shortLabel: '',
          longerTitle: '',
          url: '',
        },
      ],
    },
    description: {
      text: ``,
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
          'Age-adjusted breast cancering screening rate compared to White (NH)',
        shortLabel: 'Ratio compared to White (NH)',
        type: 'age_adjusted_ratio',
        ageAdjusted: true,
      },
    },
  },

  // Prostate Cancer Screening
  {
    categoryId: 'cancer',
    dataTypeId: 'prostate_cancer_screening',
    dataTableTitle: 'Breakdown summary for prostate cancer screening',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Prostate cancer',
    fullDisplayName: 'prostate cancer screening',
    surveyCollectedData: true,
    definition: {
      text: ``,
      citations: [
        {
          shortLabel: '',
          longerTitle: '',
          url: '',
        },
      ],
    },
    description: {
      text: ``,
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
        ageAdjusted: true,
      },
    },
  },

  // Colorectal Cancer Screening
  {
    categoryId: 'cancer',
    dataTypeId: 'colorectal_cancer_screening',
    dataTableTitle: 'Breakdown summary for colorectal cancer screening',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Colorectal cancer',
    fullDisplayName: 'colorectal cancer screening',
    surveyCollectedData: true,
    definition: {
      text: ``,
      citations: [
        {
          shortLabel: '',
          longerTitle: '',
          url: '',
        },
      ],
    },
    description: {
      text: ``,
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
        ageAdjusted: true,
      },
    },
  },

  // Cervical Cancer Screening
  {
    categoryId: 'cancer',
    dataTypeId: 'cervical_cancer_screening',
    dataTableTitle: 'Breakdown summary for cervical cancer screening',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Cervical cancer',
    fullDisplayName: 'cervical cancer screening',
    surveyCollectedData: true,
    definition: {
      text: ``,
      citations: [
        {
          shortLabel: '',
          longerTitle: '',
          url: '',
        },
      ],
    },
    description: {
      text: ``,
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
        ageAdjusted: true,
      },
    },
  },

  {
    categoryId: 'cancer',
    dataTypeId: 'lung_cancer_screening',
    dataTableTitle: 'Breakdown summary for lung cancer screening',
    mapConfig: medicareHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Lung cancer',
    fullDisplayName: 'lung cancer screening',
    surveyCollectedData: true,
    definition: {
      text: ``,
      citations: [
        {
          shortLabel: '',
          longerTitle: '',
          url: '',
        },
      ],
    },
    description: {
      text: ``,
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
        ageAdjusted: true,
      },
    },
  },
]
