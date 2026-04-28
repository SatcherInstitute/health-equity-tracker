import {
  defaultHigherIsWorseMapConfig,
  menHigherIsWorseMapConfig,
  womenHigherIsWorseMapConfig,
} from '../../charts/mapGlobals'
import type { DataTypeConfig } from './MetricConfigTypes'

export const CDC_CANCER_CATEGORY_DROPDOWNIDS = ['cancer_incidence'] as const

export type CancerCategoryDataTypeId =
  | 'breast_cancer_incidence'
  | 'cervical_cancer_incidence'
  | 'colorectal_cancer_incidence'
  | 'lung_cancer_incidence'
  | 'prostate_cancer_incidence'

export type CancerCategoryMetricId =
  | 'breast_estimated_total'
  | 'breast_pct_relative_inequity'
  | 'breast_pct_share'
  | 'breast_per_100k'
  | 'breast_population_estimated_total'
  | 'breast_population_pct'
  | 'cervical_estimated_total'
  | 'cervical_pct_relative_inequity'
  | 'cervical_pct_share'
  | 'cervical_per_100k'
  | 'cervical_per_100k_is_suppressed'
  | 'cervical_population_estimated_total'
  | 'cervical_population_pct'
  | 'colorectal_estimated_total'
  | 'colorectal_pct_relative_inequity'
  | 'colorectal_pct_share'
  | 'colorectal_per_100k'
  | 'colorectal_population_estimated_total'
  | 'colorectal_population_pct'
  | 'lung_estimated_total'
  | 'lung_pct_relative_inequity'
  | 'lung_pct_share'
  | 'lung_per_100k'
  | 'lung_population_estimated_total'
  | 'lung_population_pct'
  | 'prostate_estimated_total'
  | 'prostate_pct_relative_inequity'
  | 'prostate_pct_share'
  | 'prostate_per_100k'
  | 'prostate_population_estimated_total'
  | 'prostate_population_pct'

export const CDC_CANCER_INCIDENCE_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'cancer',
    dataTableTitle: 'Summary for breast cancer cases',
    dataTypeId: 'breast_cancer_incidence',
    dataTypeShortLabel: 'Breast cancer',
    definition: {
      text: 'The number of new cases of breast cancer diagnosed among female patients within a specific time period.',
    },
    description: {
      text: 'Breast cancer is one of the most common cancers in the United States, with incidence and outcomes varying significantly across racial, ethnic, and socioeconomic groups. Black women are more likely to be diagnosed at later stages and with more aggressive subtypes, contributing to higher mortality despite similar or lower overall incidence compared to white women. This data reflects sex as recorded in medical records at the time of diagnosis rather than gender identity. As a result, transgender men and nonbinary people with breast tissue may be miscategorized or excluded from surveillance, leading to undercounts that obscure their cancer risk and care needs. Gaps in gender-inclusive cancer surveillance are themselves a health equity issue.',
    },
    fullDisplayName: 'Breast cancer cases',
    fullDisplayNameInline: 'breast cancer cases',
    mapConfig: womenHigherIsWorseMapConfig,
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
          columnTitleHeader: 'Population share',
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
        chartTitle: 'Breast cancer cases per 100k',
        columnTitleHeader: 'Breast cancer cases per 100k',
        metricId: 'breast_per_100k',
        rateDenominatorMetric: {
          chartTitle: '',
          metricId: 'breast_population_estimated_total',
          shortLabel: 'Total female population',
          type: 'count',
        },
        rateNumeratorMetric: {
          chartTitle: '',
          metricId: 'breast_estimated_total',
          shortLabel: 'Breast cancer cases',
          type: 'count',
        },
        shortLabel: 'cases per 100k',
        timeSeriesCadence: 'yearly',
        trendsCardTitleName: 'Rates of breast cancer cases over time',
        type: 'per100k',
      },
    },
    otherSubPopulationLabel: 'Female population',
  },
  {
    categoryId: 'cancer',
    dataTableTitle: 'Summary for cervical cancer cases',
    dataTypeId: 'cervical_cancer_incidence',
    dataTypeShortLabel: 'Cervical cancer',
    definition: {
      text: 'The number of new cases of cervical cancer diagnosed among female patients within a specific time period. National- and state-level figures are from CDC WONDER and reflect crude rates that are not age-adjusted.',
    },
    description: {
      text: 'Cervical cancer is largely preventable through HPV vaccination, regular Pap and HPV screening, and timely follow-up care, yet diagnosis rates vary significantly by race, ethnicity, and geography, reflecting deeper inequities in access to these essential interventions. This data reflects sex as recorded in medical records at the time of diagnosis rather than gender identity. As a result, transgender men and nonbinary people with a cervix may be miscategorized or excluded from surveillance, leading to undercounts that obscure their cancer risk and care needs. Gaps in gender-inclusive cancer surveillance are themselves a health equity issue. Tracking these disparities at the national, state, and county level helps identify where systemic barriers persist and where targeted action is needed to advance health justice for the communities most affected.',
    },
    fullDisplayName: 'Cervical cancer cases',
    fullDisplayNameInline: 'cervical cancer cases',
    mapConfig: womenHigherIsWorseMapConfig,
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
          columnTitleHeader: 'Population share',
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
        chartTitle: 'Cervical cancer rates',
        columnTitleHeader: 'Cervical cancer cases per 100k',
        metricId: 'cervical_per_100k',
        rateDenominatorMetric: {
          chartTitle: '',
          metricId: 'cervical_population_estimated_total',
          shortLabel: 'Total female population',
          type: 'count',
        },
        rateNumeratorMetric: {
          chartTitle: '',
          metricId: 'cervical_estimated_total',
          shortLabel: 'Cervical cancer cases',
          type: 'count',
        },
        shortLabel: 'cases per 100k',
        timeSeriesCadence: 'yearly',
        trendsCardTitleName: 'Rates of cervical cancer over time',
        type: 'per100k',
      },
    },
    otherSubPopulationLabel: 'Female population',
    geoOverrides: {
      county: {
        ageSubPopulationLabel: 'All ages',
        otherSubPopulationLabel: 'Female population',
        definition: {
          text: 'The number of new cases of cervical cancer diagnosed among female patients of all ages within a specific time period. County-level figures are from NCI State Cancer Profiles and reflect age-adjusted rates to allow fairer comparisons across counties and demographic groups.',
        },
        metrics: {
          per100k: {
            trendsCardTitleName:
              'Age-adjusted rates of cervical cancer for female population over time',
          },
        },
      },
    },
  },
  {
    categoryId: 'cancer',
    dataTableTitle: 'Summary for colorectal cancer cases',
    dataTypeId: 'colorectal_cancer_incidence',
    dataTypeShortLabel: 'Colorectal cancer',
    definition: {
      text: 'The number of new cases of colorectal cancer diagnosed within a specific time period.',
    },
    description: {
      text: 'Colorectal cancer is largely preventable through timely screening, yet access to colonoscopies and follow-up care remains deeply unequal across race, income, and geography. Black Americans face higher incidence and mortality rates than white Americans, driven by disparities in screening rates, insurance coverage, and access to high-quality treatment. Indigenous and Alaska Native populations also carry a disproportionate burden. Tracking these patterns helps identify where structural barriers to prevention and early detection persist and where intervention is most urgently needed to advance health justice.',
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
          columnTitleHeader: 'Population share',
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
          metricId: 'colorectal_estimated_total',
          shortLabel: 'Colorectal cancer cases',
          type: 'count',
        },
        shortLabel: 'cases per 100k',
        timeSeriesCadence: 'yearly',
        trendsCardTitleName: 'Rates of colorectal cancer cases over time',
        type: 'per100k',
      },
    },
  },
  {
    categoryId: 'cancer',
    dataTableTitle: 'Summary for lung cancer cases',
    dataTypeId: 'lung_cancer_incidence',
    dataTypeShortLabel: 'Lung cancer',
    definition: {
      text: 'The number of new cases of lung cancer diagnosed within a specific time period.',
    },
    description: {
      text: 'Lung cancer remains the leading cause of cancer death in the United States, and its burden is shaped by more than individual behavior. Tobacco industry targeting of Black communities, Indigenous communities, and low-income populations has driven longstanding disparities in smoking rates and, consequently, in lung cancer incidence and mortality. Black men face higher incidence rates than white men despite similar or lower smoking rates, suggesting additional structural factors including occupational exposures and unequal access to screening and treatment. Low-dose CT screening is now recommended for high-risk individuals but remains underutilized in the communities that need it most.',
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
          columnTitleHeader: 'Population share',
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
          metricId: 'lung_estimated_total',
          shortLabel: 'Lung cancer cases',
          type: 'count',
        },
        shortLabel: 'cases per 100k',
        timeSeriesCadence: 'yearly',
        trendsCardTitleName: 'Rates of lung cancer cases over time',
        type: 'per100k',
      },
    },
  },
  {
    categoryId: 'cancer',
    dataTableTitle: 'Summary for prostate cancer cases',
    dataTypeId: 'prostate_cancer_incidence',
    dataTypeShortLabel: 'Prostate cancer',
    definition: {
      text: 'The number of new prostate cancer cases diagnosed among male patients within a specific time period.',
    },
    description: {
      text: 'Prostate cancer is one of the most common cancers diagnosed in the United States, with incidence and outcomes varying significantly across racial and socioeconomic groups. Black men face substantially higher incidence rates and are more likely to die from prostate cancer than any other group, reflecting longstanding disparities in screening access and clinical trial representation. This data reflects sex as recorded in medical records at the time of diagnosis rather than gender identity. As a result, transgender women and nonbinary people with a prostate may be miscategorized or excluded from surveillance, leading to undercounts that obscure their cancer risk and care needs. Gaps in gender-inclusive cancer surveillance are themselves a health equity issue.',
    },
    fullDisplayName: 'Prostate cancer cases',
    fullDisplayNameInline: 'prostate cancer cases',
    mapConfig: menHigherIsWorseMapConfig,
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
          columnTitleHeader: 'Population share',
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
        chartTitle: 'Prostate cancer cases per 100k',
        columnTitleHeader: 'Prostate cancer cases per 100k',
        metricId: 'prostate_per_100k',
        rateDenominatorMetric: {
          chartTitle: '',
          metricId: 'prostate_population_estimated_total',
          shortLabel: 'Total male population',
          type: 'count',
        },
        rateNumeratorMetric: {
          chartTitle: '',
          metricId: 'prostate_estimated_total',
          shortLabel: 'Prostate cancer cases',
          type: 'count',
        },
        shortLabel: 'cases per 100k',
        timeSeriesCadence: 'yearly',
        trendsCardTitleName: 'Rates of prostate cancer cases over time',
        type: 'per100k',
      },
    },
    otherSubPopulationLabel: 'Male population',
  },
]
