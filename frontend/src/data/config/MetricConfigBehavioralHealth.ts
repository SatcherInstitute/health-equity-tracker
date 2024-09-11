import { defaultHigherIsWorseMapConfig } from '../../charts/mapGlobals'
import type { DataTypeConfig } from './MetricConfigTypes'
import {
  populationPctShortLabel,
  populationPctTitle,
} from './MetricConfigUtils'

export const BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS = [
  'depression',
  'excessive_drinking',
  'frequent_mental_distress',
  'suicide',
  'substance',
] as const

// TODO: this isn't really a sub-data type, just a different name than the parent dropdown. we should really use the parent dropdown here
export type BehavioralHealthDataTypeId = 'non_medical_drug_use'

export type BehavioralHealthMetricId =
  | 'ahr_population_pct'
  | 'depression_pct_share'
  | 'depression_per_100k'
  | 'depression_estimated_total'
  | 'excessive_drinking_pct_share'
  | 'excessive_drinking_per_100k'
  | 'excessive_drinking_estimated_total'
  | 'frequent_mental_distress_pct_share'
  | 'frequent_mental_distress_per_100k'
  | 'frequent_mental_distress_estimated_total'
  | 'non_medical_drug_use_pct_share'
  | 'non_medical_drug_use_per_100k'
  | 'non_medical_drug_use_estimated_total'
  | 'suicide_pct_share'
  | 'suicide_per_100k'
  | 'suicide_estimated_total'

export const DEPRESSION_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'behavioral-health',
    dataTypeId: 'depression',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Cases',
    fullDisplayName: 'Depression cases',
    fullDisplayNameInline: 'depression cases',
    definition: {
      text: `Adults who reported being told by a health professional that they have a depressive disorder including depression, major depression, minor depression or dysthymia.`,
    },
    description: {
      text: 'Depression is a mental illness that can cause a number of problems, including sadness, fatigue, and difficulty concentrating. Populations at a higher risk for depression include women, young adults, Indigenous and multiracial Americans, individuals with lower income, and non-heterosexual individuals. Studying depression can help us understand why these disparities exist and how to address them.',
      citations: [
        {
          url: 'https://www.americashealthrankings.org/explore/measures/Depression_a',
          shortLabel: 'AHR',
          longerTitle: "America's Health Rankings",
        },
      ],
    },
    surveyCollectedData: true,
    dataTableTitle: 'Summary for depression',
    ageSubPopulationLabel: 'Ages 18+',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total adult depression cases',
        metricId: 'depression_pct_share',
        columnTitleHeader: 'Share of total adult depression cases',
        shortLabel: '% of cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total adult depression cases',
          metricId: 'ahr_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      per100k: {
        metricId: 'depression_per_100k',
        chartTitle: 'Depression',
        columnTitleHeader: 'Cases of depression per 100k adults',
        shortLabel: 'cases per 100k adults',
        type: 'per100k',
        rateNumeratorMetric: {
          metricId: 'depression_estimated_total',
          chartTitle: 'Cases of depression',
          columnTitleHeader: 'Cases of depression',
          shortLabel: 'cases',
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

export const EXCESSIVE_DRINKING_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'behavioral-health',
    dataTypeId: 'excessive_drinking',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Cases',
    fullDisplayName: 'Excessive drinking cases',
    fullDisplayNameInline: 'excessive drinking cases',
    definition: {
      text: `Adults who reported binge drinking (four or more [females] or five or more [males] drinks on one occasion in the past 30 days) or heavy drinking (eight or more [females] or 15 or more [males] drinks per week).`,
    },
    description: {
      text: 'Excessive drinking is a major public health problem. It can lead to a number of health problems, including liver disease, heart disease, and cancer. It is more common in men, younger adults, and LGBTQ+ individuals. Studying excessive drinking can help us understand why these disparities exist and how to address them.',
      citations: [
        {
          url: 'https://www.americashealthrankings.org/explore/measures/ExcessDrink',
          shortLabel: 'AHR',
          longerTitle: "America's Health Rankings",
        },
      ],
    },
    surveyCollectedData: true,
    dataTableTitle: 'Summary for excessive drinking cases',
    ageSubPopulationLabel: 'Ages 18+',
    metrics: {
      pct_share: {
        chartTitle: 'Share of all adult excessive drinking cases',
        metricId: 'excessive_drinking_pct_share',
        columnTitleHeader: 'Share of all adult excessive drinking cases',
        shortLabel: '% of all cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total adult excessive drinking cases',
          metricId: 'ahr_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      per100k: {
        metricId: 'excessive_drinking_per_100k',
        columnTitleHeader: 'Excessive drinking cases per 100k adults',
        chartTitle: 'Excessive drinking cases',
        shortLabel: 'cases per 100k adults',
        type: 'per100k',
        rateNumeratorMetric: {
          metricId: 'excessive_drinking_estimated_total',
          chartTitle: 'Cases of excessive drinking',
          columnTitleHeader: 'Cases of excessive drinking',
          shortLabel: 'cases',
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

export const SUBSTANCE_MISUSE_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'behavioral-health',
    // parent data type
    dataTypeId: 'non_medical_drug_use',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Opioid and other non-medical drug use',
    fullDisplayName: 'Opioid and other non-medical drug use',
    fullDisplayNameInline: 'opioid and other non-medical drug use',
    definition: {
      text: `Adults who reported using prescription drugs non-medically (including pain relievers, stimulants, sedatives) or illicit drugs (excluding cannabis) in the last 12 months.`,
    },
    description: {
      text: 'Opioid and other non-medical drug use is a major public health problem. It can lead to a number of health problems, including overdose and death. It is more common in people with low incomes. Studying opioid and other non-medical drug use can help us understand why these disparities exist and how to address them.',
      citations: [
        {
          url: 'https://www.americashealthrankings.org/explore/measures/drug_use',
          shortLabel: 'AHR',
          longerTitle: "America's Health Rankings",
        },
      ],
    },
    surveyCollectedData: true,
    dataTableTitle: 'Summary for opioid and other non-medical drug use',
    ageSubPopulationLabel: 'Ages 18+',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total adult non-medical drug use',
        metricId: 'non_medical_drug_use_pct_share',
        columnTitleHeader: 'Share of total adult non-medical drug use',
        shortLabel: '% of cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total adult non-medical drug use',
          metricId: 'ahr_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      per100k: {
        metricId: 'non_medical_drug_use_per_100k',
        columnTitleHeader: 'Non-medical drug use per 100k adults',
        chartTitle: 'Non-medical drug use',
        shortLabel: 'cases per 100k adults',
        type: 'per100k',

        rateNumeratorMetric: {
          metricId: 'non_medical_drug_use_estimated_total',
          chartTitle: 'Cases of non medical drug use',
          columnTitleHeader: 'Cases of non medical drug use',
          shortLabel: 'cases',
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

export const FREQUENT_MENTAL_DISTRESS_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'behavioral-health',
    dataTypeId: 'frequent_mental_distress',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Cases',
    fullDisplayName: 'Frequent mental distress cases',
    fullDisplayNameInline: 'frequent mental distress cases',
    definition: {
      text: `Adults who reported their mental health was not good 14 or more days in the past 30 days.`,
    },
    description: {
      text: 'Frequent mental distress is a major public health problem. It can lead to a number of health problems, including heart disease, stroke, and cancer. Frequent mental distress disproportionately affects women, younger adults, individuals of multiracial, Indigenous, or Pacific Islander descent, those with lower education levels or household income, individuals experiencing cognitive difficulty disabilities, and non-heterosexual individuals. Studying frequent mental distress can help us understand why these disparities exist and how to address them.',
      citations: [
        {
          url: 'https://www.americashealthrankings.org/explore/measures/mental_distress',
          shortLabel: 'AHR',
          longerTitle: "America's Health Rankings",
        },
      ],
    },
    surveyCollectedData: true,
    dataTableTitle: 'Summary for frequent mental distress',
    ageSubPopulationLabel: 'Ages 18+',
    metrics: {
      pct_share: {
        chartTitle: 'Share of all adult frequent mental distress cases',
        metricId: 'frequent_mental_distress_pct_share',
        columnTitleHeader: 'Share of all adult frequent mental distress cases',
        shortLabel: '% of cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total adult frequent mental distress cases',
          metricId: 'ahr_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      per100k: {
        metricId: 'frequent_mental_distress_per_100k',
        chartTitle: 'Frequent mental distress',
        columnTitleHeader: 'Frequent mental distress cases per 100k adults',
        shortLabel: 'cases per 100k adults',
        type: 'per100k',

        rateNumeratorMetric: {
          metricId: 'frequent_mental_distress_estimated_total',
          chartTitle: 'Cases of frequent mental distress',
          columnTitleHeader: 'Cases of frequent mental distress',
          shortLabel: 'cases',
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

export const SUICIDE_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'behavioral-health',
    dataTypeId: 'suicide',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Cases',
    fullDisplayName: 'Suicides',
    fullDisplayNameInline: 'suicides',
    definition: {
      text: `Deaths due to intentional self-harm.`,
    },
    description: {
      text: 'Suicide is a leading cause of death in the United States. Indigenous Americans, people with low incomes, and older people are more likely to die by suicide. Studying suicide can help us understand why these disparities exist and how to address them.',
    },
    surveyCollectedData: true,
    dataTableTitle: 'Summary for suicides',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total suicides',
        metricId: 'suicide_pct_share',
        columnTitleHeader: 'Share of total suicides',
        shortLabel: '% of suicides',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle: 'Population vs. distribution of total suicide cases',
          metricId: 'ahr_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      per100k: {
        metricId: 'suicide_per_100k',
        chartTitle: 'Suicides',
        columnTitleHeader: 'Suicides per 100k people',
        shortLabel: 'suicides per 100k',
        type: 'per100k',

        rateNumeratorMetric: {
          metricId: 'suicide_estimated_total',
          chartTitle: '',
          columnTitleHeader: 'Deaths by suicide',
          shortLabel: 'deaths',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'ahr_population_estimated_total',
          chartTitle: '',
          shortLabel: 'Total population',
          type: 'count',
        },
      },
    },
  },
]
