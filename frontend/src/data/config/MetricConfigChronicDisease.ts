import { defaultHigherIsWorseMapConfig } from '../../charts/mapGlobals'
import { type DataTypeConfig } from './MetricConfig'
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
]

export type ChronicDiseaseMetricId =
  | 'ahr_population_pct'
  | 'asthma_pct_share'
  | 'asthma_per_100k'
  | 'cardiovascular_diseases_pct_share'
  | 'cardiovascular_diseases_per_100k'
  | 'chronic_kidney_disease_pct_share'
  | 'chronic_kidney_disease_per_100k'
  | 'copd_pct_share'
  | 'copd_per_100k'
  | 'diabetes_pct_share'
  | 'diabetes_per_100k'

export const ASTHMA_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'chronic-disease',
    dataTypeId: 'asthma',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Asthma',
    fullDisplayName: 'Asthma cases',
    fullDisplayNameInline: 'asthma cases',
    surveyCollectedData: true,
    dataTableTitle: 'Breakdown summary for asthma cases',
    definition: {
      text: `Adults who reported being told by a health professional that they currently have asthma.`,
    },
    metrics: {
      per100k: {
        metricId: 'asthma_per_100k',
        chartTitle: 'Asthma',
        columnTitleHeader: 'Asthma cases per 100k adults',
        shortLabel: 'asthma per 100k adults',
        type: 'per100k',
      },
      pct_share: {
        chartTitle: 'Share of all asthma cases',
        metricId: 'asthma_pct_share',
        columnTitleHeader: 'Share of all asthma cases',
        shortLabel: '% of cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle: 'Population vs. distribution of total asthma cases',
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
    dataTableTitle: 'Breakdown summary for cases of cardiovascular diseases',
    definition: {
      text: `Adults who reported being told by a health professional that they had angina or coronary heart disease; a heart attack or myocardial infarction; or a stroke.`,
    },
    metrics: {
      per100k: {
        metricId: 'cardiovascular_diseases_per_100k',
        chartTitle: 'Cardiovascular diseases',
        columnTitleHeader: 'Cases of cardiovascular diseases per 100k adults',
        shortLabel: 'cases per 100k adults',
        type: 'per100k',
      },
      pct_share: {
        chartTitle: 'Share of all cases of cardiovascular diseases',
        metricId: 'cardiovascular_diseases_pct_share',
        columnTitleHeader: 'Share of all cases of cardiovascular diseases',
        shortLabel: '% of cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total cases of cardiovascular diseases',
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
    dataTableTitle: 'Breakdown summary for cases of chronic kidney disease',
    metrics: {
      per100k: {
        metricId: 'chronic_kidney_disease_per_100k',
        chartTitle: 'Chronic kidney disease',
        columnTitleHeader: 'Chronic kidney disease per 100k adults',
        shortLabel: 'cases per 100k adults',
        type: 'per100k',
      },
      pct_share: {
        chartTitle: 'Share of all chronic kidney disease cases',
        metricId: 'chronic_kidney_disease_pct_share',
        columnTitleHeader: 'Share of all chronic kidney disease cases',
        shortLabel: '% of cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total cases of chronic kidney disease',
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
    surveyCollectedData: true,
    dataTableTitle: 'Breakdown summary for diabetes',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total diabetes cases',
        metricId: 'diabetes_pct_share',
        columnTitleHeader: 'Share of total diabetes cases',
        shortLabel: '% of cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle: 'Population vs. distribution of total diabetes cases',
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
    surveyCollectedData: true,
    dataTableTitle: 'Breakdown summary for COPD',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total COPD cases',
        metricId: 'copd_pct_share',
        columnTitleHeader: 'Share of total COPD cases',
        shortLabel: '% of cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle: 'Population vs. distribution of total COPD cases',
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
      },
    },
  },
]
