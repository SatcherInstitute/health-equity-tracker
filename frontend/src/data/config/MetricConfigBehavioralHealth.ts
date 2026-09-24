import { defaultHigherIsWorseMapConfig } from '../../charts/mapGlobals'
import {
  adultPopulationPctShortLabel,
  adultPopulationPctTitle,
  populationPctShortLabel,
  populationPctTitle,
} from './MetricConfigConstants'
import type { DataTypeConfig, DataTypeId, MetricId } from './MetricConfigTypes'

export const CHR_DATATYPE_IDS: DataTypeId[] = [
  'diabetes',
  'excessive_drinking',
  'frequent_mental_distress',
  'voter_participation',
  'preventable_hospitalizations',
  'suicide',
]

export const AHR_DATATYPES_WITH_MISSING_AGE_DEMO: DataTypeId[] = [
  'non_medical_drug_use',
  'preventable_hospitalizations',
]

export const AHR_CONDITIONS = [
  'asthma',
  'avoided_care',
  'cardiovascular_diseases',
  'chronic_kidney_disease',
  'copd',
  'depression',
  'diabetes',
  'excessive_drinking',
  'frequent_mental_distress',
  'preventable_hospitalizations',
  'severe_maternal_morbidity',
  'substance',
  'suicide',
  'voter_participation',
]

export const AHR_METRICS: MetricId[] = [
  'ahr_population_pct',
  'ahr_population_estimated_total',
  'ahr_18plus_population_estimated_total',
  'ahr_18plus_population_pct',
  'asthma_pct_share',
  'asthma_per_100k',
  'asthma_estimated_total',
  'avoided_care_pct_share',
  'avoided_care_pct_rate',
  'avoided_care_estimated_total',
  'cardiovascular_diseases_pct_share',
  'cardiovascular_diseases_per_100k',
  'cardiovascular_diseases_estimated_total',
  'chronic_kidney_disease_pct_share',
  'chronic_kidney_disease_per_100k',
  'chronic_kidney_disease_estimated_total',
  'copd_pct_share',
  'copd_per_100k',
  'copd_estimated_total',
  'depression_pct_share',
  'depression_per_100k',
  'depression_estimated_total',
  'diabetes_pct_share',
  'diabetes_per_100k',
  'diabetes_estimated_total',
  'excessive_drinking_pct_share',
  'excessive_drinking_pct_rate',
  'excessive_drinking_estimated_total',
  'frequent_mental_distress_pct_share',
  'frequent_mental_distress_per_100k',
  'frequent_mental_distress_estimated_total',
  'non_medical_drug_use_pct_share',
  'non_medical_drug_use_per_100k',
  'non_medical_drug_use_estimated_total',
  'preventable_hospitalizations_per_100k',
  'severe_maternal_morbidity_per_100k',
]

export const AHR_VOTER_AGE_METRICS: MetricId[] = [
  'voter_participation_pct_rate',
]

export const AHR_DECADE_PLUS_5_AGE_METRICS: MetricId[] = [
  'suicide_pct_share',
  'suicide_per_100k',
  'suicide_estimated_total',
]

export const AHR_API_NH_METRICS: MetricId[] = [
  'preventable_hospitalizations_per_100k',
]

export const ALL_AHR_METRICS: MetricId[] = [
  ...AHR_VOTER_AGE_METRICS,
  ...AHR_DECADE_PLUS_5_AGE_METRICS,
  ...AHR_METRICS,
]

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
  | 'ahr_18plus_population_pct'
  | 'depression_pct_share'
  | 'depression_per_100k'
  | 'depression_estimated_total'
  | 'excessive_drinking_pct_share'
  | 'excessive_drinking_pct_rate'
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
            'Adult population vs. distribution of total adult depression cases',
          metricId: 'ahr_18plus_population_pct',
          columnTitleHeader: adultPopulationPctTitle,
          shortLabel: adultPopulationPctShortLabel,
          type: 'pct_share',
        },
      },
      per100k: {
        timeSeriesCadence: 'yearly',
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
          metricId: 'ahr_18plus_population_estimated_total',
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
            'Adult population vs. distribution of total adult excessive drinking cases',
          metricId: 'ahr_18plus_population_pct',
          columnTitleHeader: adultPopulationPctTitle,
          shortLabel: adultPopulationPctShortLabel,
          type: 'pct_share',
        },
      },
      pct_rate: {
        timeSeriesCadence: 'yearly',
        metricId: 'excessive_drinking_pct_rate',
        columnTitleHeader: 'Excessive drinking rate',
        chartTitle: 'Excessive drinking cases',
        shortLabel: '% of adults',
        type: 'pct_rate',
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
            'Adult population vs. distribution of total adult non-medical drug use',
          metricId: 'ahr_18plus_population_pct',
          columnTitleHeader: adultPopulationPctTitle,
          shortLabel: adultPopulationPctShortLabel,
          type: 'pct_share',
        },
      },
      per100k: {
        timeSeriesCadence: 'yearly',
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
          metricId: 'ahr_18plus_population_estimated_total',
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
            'Adult population vs. distribution of total adult frequent mental distress cases',
          metricId: 'ahr_18plus_population_pct',
          columnTitleHeader: adultPopulationPctTitle,
          shortLabel: adultPopulationPctShortLabel,
          type: 'pct_share',
        },
      },
      per100k: {
        timeSeriesCadence: 'yearly',
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
          metricId: 'ahr_18plus_population_estimated_total',
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
        timeSeriesCadence: 'yearly',
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

export const AHR_PROVIDER_METRICS: MetricId[] = [
  'ahr_population_pct',
  ...AHR_METRICS,
  ...AHR_VOTER_AGE_METRICS,
  ...AHR_DECADE_PLUS_5_AGE_METRICS,
  'chr_population_pct',
]
