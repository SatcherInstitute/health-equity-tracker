import { type DataTypeConfig } from './MetricConfig'
import {
  populationPctShortLabel,
  populationPctTitle,
} from './MetricConfigUtils'

export type PhrmaDataTypeId =
  | 'ami'
  | 'arv_adherence'
  | 'beta_blockers_adherence'
  | 'rasa_adherence'
  | 'statins_adherence'
  | 'ccb_adherence'
  | 'doac_adherence'
  | 'nqf_adherence'

export type PhrmaMetricId =
  | 'ami_pct_share'
  | 'ami_per_100k'
  | 'arv_adherence_pct_rate'
  | 'arv_adherence_pct_share'
  | 'arv_population_pct_share'
  | 'beta_blockers_adherence_pct_rate'
  | 'beta_blockers_adherence_pct_share'
  | 'beta_blockers_population_pct_share'
  | 'ccb_adherence_pct_rate'
  | 'ccb_adherence_pct_share'
  | 'ccb_population_pct_share'
  | 'doac_adherence_pct_rate'
  | 'doac_adherence_pct_share'
  | 'doac_population_pct_share'
  | 'nqf_adherence_pct_rate'
  | 'nqf_adherence_pct_share'
  | 'nqf_population_pct_share'
  | 'rasa_adherence_pct_rate'
  | 'rasa_adherence_pct_share'
  | 'rasa_population_pct_share'
  | 'statins_adherence_pct_rate'
  | 'statins_adherence_pct_share'
  | 'statins_population_pct_share'
  | 'phrma_hiv_pct_share'
  | 'phrma_hiv_per_100k'

export const DEPRESSION_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'depression',
    dataTypeShortLabel: 'Cases',
    fullDisplayName: 'Depression cases',
    fullDisplayNameInline: 'depression cases',
    dataTypeDefinition: `Adults who reported being told by a health professional that they have a depressive disorder including depression, major depression, minor depression or dysthymia.`,
    surveyCollectedData: true,
    dataTableTitle: 'Breakdown summary for depression cases',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total depression cases',
        metricId: 'depression_pct_share',
        columnTitleHeader: 'Share of total depression cases',
        shortLabel: '% of cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle: 'Population vs. distribution of total depression cases',
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
      },
    },
  },
]

export const EXCESSIVE_DRINKING_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'excessive_drinking',
    dataTypeShortLabel: 'Cases',
    fullDisplayName: 'Excessive drinking cases',
    fullDisplayNameInline: 'excessive drinking cases',
    dataTypeDefinition: `Adults who reported binge drinking (four or more [females] or five or more [males] drinks on one occasion in the past 30 days) or heavy drinking (eight or more [females] or 15 or more [males] drinks per week).`,
    surveyCollectedData: true,
    dataTableTitle: 'Breakdown summary for excessive drinking cases',
    metrics: {
      pct_share: {
        chartTitle: 'Share of all excessive drinking cases',
        metricId: 'excessive_drinking_pct_share',
        columnTitleHeader: 'Share of all excessive drinking cases',
        shortLabel: '% of all cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total excessive drinking cases',
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
      },
    },
  },
]

export const SUBSTANCE_MISUSE_METRICS: DataTypeConfig[] = [
  {
    // parent data type
    dataTypeId: 'non_medical_drug_use',
    dataTypeShortLabel: 'Opioid and other non-medical drug use',
    fullDisplayName: 'Opioid and other non-medical drug use',
    fullDisplayNameInline: 'opioid and other non-medical drug use',
    dataTypeDefinition: `Adults who reported using prescription drugs non-medically (including pain relievers, stimulants, sedatives) or illicit drugs (excluding cannabis) in the last 12 months.`,
    surveyCollectedData: true,
    dataTableTitle:
      'Breakdown summary for opioid and other non-medical drug use',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total non-medical drug use',
        metricId: 'non_medical_drug_use_pct_share',
        columnTitleHeader: 'Share of total non-medical drug use',
        shortLabel: '% of cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total non-medical drug use',
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
      },
    },
  },
]

export const FREQUENT_MENTAL_DISTRESS_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'frequent_mental_distress',
    dataTypeShortLabel: 'Cases',
    fullDisplayName: 'Frequent mental distress cases',
    fullDisplayNameInline: 'frequent mental distress cases',
    dataTypeDefinition: `Adults who reported their mental health was not good 14 or more days in the past 30 days.`,
    surveyCollectedData: true,
    dataTableTitle: 'Breakdown summary for frequent mental distress cases',
    metrics: {
      pct_share: {
        chartTitle: 'Share of all frequent mental distress cases',
        metricId: 'frequent_mental_distress_pct_share',
        columnTitleHeader: 'Share of all frequent mental distress cases',
        shortLabel: '% of cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total frequent mental distress cases',
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
      },
    },
  },
]

export const SUICIDE_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'suicide',
    dataTypeShortLabel: 'Cases',
    fullDisplayName: 'Suicides',
    fullDisplayNameInline: 'suicides',
    dataTypeDefinition: `Deaths due to intentional self-harm.`,
    surveyCollectedData: true,
    dataTableTitle: 'Breakdown summary for suicides',
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
      },
    },
  },
]
