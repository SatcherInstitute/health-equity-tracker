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
  | 'cervical_screened_estimated_total'
  | 'cervical_screening_eligible_estimated_total'
  | 'cervical_screened_pct_rate'
  | 'cervical_screened_pct_share'
  | 'cervical_screening_eligible_population_pct'
  | 'colorectal_screened_estimated_total'
  | 'colorectal_screening_eligible_estimated_total'
  | 'colorectal_screened_pct_rate'
  | 'colorectal_screened_pct_share'
  | 'colorectal_screening_eligible_population_pct'
  | 'lung_screened_estimated_total'
  | 'lung_screening_eligible_estimated_total'
  | 'lung_screened_pct_rate'
  | 'lung_screened_pct_share'
  | 'lung_screening_eligible_population_pct'
  | 'prostate_screened_estimated_total'
  | 'prostate_screening_eligible_estimated_total'
  | 'prostate_screened_pct_rate'
  | 'prostate_screened_pct_share'
  | 'prostate_screening_eligible_population_pct'

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
    otherSubPopulationLabel: 'Women',
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
          shortLabel: 'Total population recommended for screening',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'breast_screened_pct_rate',
        chartTitle: 'Population receiving breast cancer screening',
        shortLabel: '% screened',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'breast_screened_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',
      },
      pct_share: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'breast_screened_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',

        populationComparisonMetric: {
          chartTitle: '',
          metricId: 'breast_screening_eligible_population_pct',
          shortLabel: '',
          type: 'pct_share',
        },
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
    otherSubPopulationLabel: 'Men',
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
          shortLabel: 'Total population recommended for screening',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'prostate_screened_pct_rate',
        chartTitle: 'Population receiving prostate cancer screening',
        shortLabel: '% screened',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'prostate_screened_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',
      },
      pct_share: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'prostate_screened_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',

        populationComparisonMetric: {
          chartTitle: '',
          metricId: 'prostate_screening_eligible_population_pct',
          shortLabel: '',
          type: 'pct_share',
        },
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
          shortLabel: 'Total population recommended for screening',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'colorectal_screened_pct_rate',
        chartTitle: 'Population receiving colorectal cancer screening',
        shortLabel: '% screened',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'colorectal_screened_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',
      },
      pct_share: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'colorectal_screened_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',

        populationComparisonMetric: {
          chartTitle: '',
          metricId: 'colorectal_screening_eligible_population_pct',
          shortLabel: '',
          type: 'pct_share',
        },
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
    otherSubPopulationLabel: 'Women',
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
          shortLabel: 'Total population recommended for screening',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'cervical_screened_pct_rate',
        chartTitle: 'Population receiving cervical cancer screening',
        shortLabel: '% screened',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'cervical_screened_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',
      },
      pct_share: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'cervical_screened_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',

        populationComparisonMetric: {
          chartTitle: '',
          metricId: 'cervical_screening_eligible_population_pct',
          shortLabel: '',
          type: 'pct_share',
        },
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
    otherSubPopulationLabel: 'Smokers',
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
          shortLabel: 'Total population recommended for screening',
          chartTitle: '',
          type: 'count',
        },
        metricId: 'lung_screened_pct_rate',
        chartTitle: 'Population receiving lung cancer screening',
        shortLabel: '% screened',
        type: 'pct_rate',
      },
      pct_share_unknown: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'lung_screened_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',
      },
      pct_share: {
        chartTitle: 'Adherent beneficiary population ',
        metricId: 'lung_screened_pct_share',
        shortLabel: '% of adherent pop.',
        type: 'pct_share',

        populationComparisonMetric: {
          chartTitle: '',
          metricId: 'lung_screening_eligible_population_pct',
          shortLabel: '',
          type: 'pct_share',
        },
      },
    },
  },
]
