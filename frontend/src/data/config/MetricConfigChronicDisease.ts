import { defaultHigherIsWorseMapConfig } from '../../charts/mapGlobals'
import type { DataTypeConfig } from './MetricConfig'
import {
  populationPctShortLabel,
  populationPctTitle,
} from './MetricConfigUtils'

export const CHRONIC_DISEASE_CATEGORY_DROPDOWNIDS = [
  'asthma',
  'cardiovascular_diseases',
  'chronic_kidney_disease',
  'copd',
  'diabetes',
] as const

export type ChronicDiseaseDataTypeId =
  (typeof CHRONIC_DISEASE_CATEGORY_DROPDOWNIDS)[number]

export type ChronicDiseaseMetricId =
  | 'ahr_population_pct'
  | 'asthma_pct_share'
  | 'asthma_per_100k'
  | 'asthma_estimated_total'
  | 'cardiovascular_diseases_pct_share'
  | 'cardiovascular_diseases_per_100k'
  | 'cardiovascular_diseases_estimated_total'
  | 'chronic_kidney_disease_pct_share'
  | 'chronic_kidney_disease_per_100k'
  | 'chronic_kidney_disease_estimated_total'
  | 'copd_pct_share'
  | 'copd_per_100k'
  | 'copd_estimated_total'
  | 'diabetes_pct_share'
  | 'diabetes_per_100k'
  | 'diabetes_estimated_total'

export const ASTHMA_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'chronic-disease',
    dataTypeId: 'asthma',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Asthma',
    fullDisplayName: 'Asthma cases',
    fullDisplayNameInline: 'asthma cases',
    surveyCollectedData: true,
    dataTableTitle: 'Summary for asthma cases',
    definition: {
      text: `Adults who reported being told by a health professional that they currently have asthma.`,
    },
    description: {
      text: `Asthma is a chronic condition that affects the airways. It can cause wheezing, coughing, shortness of breath, and chest tightness. Asthma disproportionately affects women, multiracial, Indigenous, and Black adults, individuals with lower household incomes, those residing in non-metropolitan areas, and individuals with a disability experiencing difficulty with self-care. Studying asthma in regard to health equity can help us to understand why these disparities exist and how to improve the health of people with asthma.`,
      citations: [
        {
          url: 'https://www.americashealthrankings.org/explore/measures/Asthma_a',
          shortLabel: 'AHR',
          longerTitle: "America's Health Rankings",
        },
      ],
    },
    ageSubPopulationLabel: 'Ages 18+',
    metrics: {
      per100k: {
        metricId: 'asthma_per_100k',
        chartTitle: 'Asthma',
        columnTitleHeader: 'Asthma cases per 100k adults',
        shortLabel: 'asthma per 100k adults',
        type: 'per100k',
        rateNumeratorMetric: {
          metricId: 'asthma_estimated_total',
          shortLabel: 'asthma',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'ahr_population_18plus',
          chartTitle: '',
          shortLabel: 'Total pop. 18+',
          type: 'count',
        },
      },
      pct_share: {
        chartTitle: 'Share of all adult asthma cases',
        metricId: 'asthma_pct_share',
        columnTitleHeader: 'Share of all adult asthma cases',
        shortLabel: '% of cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle: 'Population vs. distribution of total adult asthma cases',
          metricId: 'ahr_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
    },
  },
]

export const CARDIOVASCULAR_DISEASES_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'chronic-disease',
    dataTypeId: 'cardiovascular_diseases',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Cardiovascular diseases',
    fullDisplayName: 'Cases of cardiovascular diseases',
    fullDisplayNameInline: 'cases of cardiovascular diseases',
    surveyCollectedData: true,
    dataTableTitle: 'Summary for cardiovascular disease',
    definition: {
      text: `Adults who reported being told by a health professional that they had angina or coronary heart disease; a heart attack or myocardial infarction; or a stroke.`,
    },
    description: {
      text: `Cardiovascular diseases are a leading cause of death in the United States. Cardiovascular diseases exhibit higher prevalence among men, older adults aged 65 and above, American Indian/Alaska Native individuals, those with lower education levels and household incomes, residents of non-metropolitan areas, individuals with disabilities experiencing difficulty with self-care, and veterans. Studying cardiovascular diseases can help us understand why these disparities exist and how to address them.`,
      citations: [
        {
          url: 'https://www.americashealthrankings.org/explore/measures/CVD',
          shortLabel: 'AHR',
          longerTitle: "America's Health Rankings",
        },
      ],
    },
    ageSubPopulationLabel: 'Ages 18+',
    metrics: {
      per100k: {
        metricId: 'cardiovascular_diseases_per_100k',
        chartTitle: 'Cardiovascular diseases',
        columnTitleHeader: 'Cases of cardiovascular diseases per 100k adults',
        shortLabel: 'cases per 100k adults',
        type: 'per100k',
        rateNumeratorMetric: {
          metricId: 'cardiovascular_diseases_estimated_total',
          shortLabel: 'cases',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'ahr_population_18plus',
          chartTitle: '',
          shortLabel: 'Total pop. 18+',
          type: 'count',
        },
      },
      pct_share: {
        chartTitle: 'Share of all cases of cardiovascular diseases',
        metricId: 'cardiovascular_diseases_pct_share',
        columnTitleHeader:
          'Share of all adult cases of cardiovascular diseases',
        shortLabel: '% of cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total adult cases of cardiovascular diseases',
          metricId: 'ahr_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
    },
  },
]

export const CHRONIC_KIDNEY_DISEASE_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'chronic-disease',
    dataTypeId: 'chronic_kidney_disease',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Chronic kidney disease',
    surveyCollectedData: true,
    fullDisplayName: 'Cases of chronic kidney disease',
    fullDisplayNameInline: 'cases of chronic kidney disease',
    definition: {
      text: `Adults who reported being told by a health professional that they have kidney disease not including kidney stones, bladder infection or incontinence.`,
    },
    description: {
      text: `Chronic kidney disease is a serious condition that can lead to kidney failure. Chronic kidney disease exhibits a higher prevalence among women, adults aged 65 and older, American Indian/Alaska Native and Black individuals, those with lower educational attainment and household income, residents of non-metropolitan areas, individuals with disabilities experiencing difficulty with self-care, and veterans. Studying chronic kidney disease can help us understand why these disparities exist and how to address them.`,
      citations: [
        {
          url: 'https://www.americashealthrankings.org/explore/measures/CKD',
          shortLabel: 'AHR',
          longerTitle: "America's Health Rankings",
        },
      ],
    },
    dataTableTitle: 'Summary for cases of chronic kidney disease',
    ageSubPopulationLabel: 'Ages 18+',
    metrics: {
      per100k: {
        metricId: 'chronic_kidney_disease_per_100k',
        chartTitle: 'Chronic kidney disease',
        columnTitleHeader: 'Chronic kidney disease per 100k adults',
        shortLabel: 'cases per 100k adults',
        type: 'per100k',
        rateNumeratorMetric: {
          metricId: 'chronic_kidney_disease_estimated_total',
          shortLabel: 'cases',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'ahr_population_18plus',
          chartTitle: '',
          shortLabel: 'Total pop. 18+',
          type: 'count',
        },
      },
      pct_share: {
        chartTitle: 'Share of all chronic kidney disease cases',
        metricId: 'chronic_kidney_disease_pct_share',
        columnTitleHeader: 'Share of all adult chronic kidney disease cases',
        shortLabel: '% of cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total adult cases of chronic kidney disease',
          metricId: 'ahr_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
    },
  },
]

export const DIABETES_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'chronic-disease',
    dataTypeId: 'diabetes',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Cases',
    fullDisplayName: 'Diabetes',
    fullDisplayNameInline: 'diabetes',
    definition: {
      text: `Adults who reported being told by a health professional that they have diabetes (excluding prediabetes and gestational diabetes).`,
    },
    description: {
      text: `Diabetes is a chronic condition that affects the way the body uses sugar. It is more common in people of color and people with low incomes. Studying diabetes can help us understand why these disparities exist and how to address them.`,
    },
    surveyCollectedData: true,
    dataTableTitle: 'Summary for diabetes',
    ageSubPopulationLabel: 'Ages 18+',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total adult diabetes cases',
        metricId: 'diabetes_pct_share',
        columnTitleHeader: 'Share of total adult diabetes cases',
        shortLabel: '% of cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total adult diabetes cases',
          metricId: 'ahr_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      per100k: {
        metricId: 'diabetes_per_100k',
        chartTitle: 'Diabetes',
        columnTitleHeader: 'Diabetes cases per 100k adults',
        shortLabel: 'cases per 100k adults',
        type: 'per100k',
        rateNumeratorMetric: {
          metricId: 'diabetes_estimated_total',
          shortLabel: 'cases',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'ahr_population_18plus',
          chartTitle: '',
          shortLabel: 'Total pop. 18+',
          type: 'count',
        },
      },
    },
  },
]

export const COPD_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'chronic-disease',
    dataTypeId: 'copd',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Cases',
    fullDisplayName: 'COPD',
    definition: {
      text: `Adults who reported being told by a health professional that they have chronic obstructive pulmonary disease, emphysema or chronic bronchitis.`,
    },
    description: {
      text: `COPD is a lung disease that makes it difficult to breathe. Populations with a higher prevalence of COPD include women, adults aged 65 and older, American Indian/Alaska Native and multiracial individuals, those with lower educational attainment and household income, residents of non-metropolitan areas, individuals with disabilities experiencing difficulty with self-care, and veterans. Studying COPD can help us understand why these disparities exist and how to address them.`,
      citations: [
        {
          url: 'https://www.americashealthrankings.org/explore/measures/COPD',
          shortLabel: 'AHR',
          longerTitle: "America's Health Rankings",
        },
      ],
    },
    surveyCollectedData: true,
    dataTableTitle: 'Summary for COPD',
    ageSubPopulationLabel: 'Ages 18+',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total adult COPD cases',
        metricId: 'copd_pct_share',
        columnTitleHeader: 'Share of total adult COPD cases',
        shortLabel: '% of cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle: 'Population vs. distribution of total adult COPD cases',
          metricId: 'ahr_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      per100k: {
        metricId: 'copd_per_100k',
        chartTitle: 'COPD',
        columnTitleHeader: 'COPD cases per 100k adults',
        shortLabel: 'cases per 100k adults',
        type: 'per100k',
        rateNumeratorMetric: {
          metricId: 'copd_estimated_total',
          shortLabel: 'cases',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'ahr_population_18plus',
          chartTitle: '',
          shortLabel: 'Total pop. 18+',
          type: 'count',
        },
      },
    },
  },
]
