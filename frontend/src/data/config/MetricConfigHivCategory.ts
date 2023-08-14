import { type DataTypeConfig } from './MetricConfig'
import { populationPctShortLabel } from './MetricConfigUtils'

export const HIV_CATEGORY_DROPDOWNIDS = [
  'hiv_black_women',
  'hiv_care',
  'hiv_prep',
  'hiv_stigma',
  'hiv',
]

export type HivCategoryDataTypeId =
  | 'hiv_deaths_black_women'
  | 'hiv_deaths'
  | 'hiv_diagnoses_black_women'
  | 'hiv_diagnoses'
  | 'hiv_prevalence_black_women'
  | 'hiv_prevalence'

export type HivCategoryMetricId =
  | 'black_women_population_pct'
  | 'hiv_care_linkage'
  | 'hiv_care_pct_relative_inequity'
  | 'hiv_care_pct_share'
  | 'hiv_care_population_pct'
  | 'hiv_deaths_black_women_pct_relative_inequity'
  | 'hiv_deaths_black_women_pct_share'
  | 'hiv_deaths_black_women_per_100k'
  | 'hiv_deaths_pct_relative_inequity'
  | 'hiv_deaths_pct_share'
  | 'hiv_deaths_per_100k'
  | 'hiv_deaths_ratio_age_adjusted'
  | 'hiv_diagnoses_black_women_pct_relative_inequity'
  | 'hiv_diagnoses_black_women_pct_share'
  | 'hiv_diagnoses_black_women_per_100k'
  | 'hiv_diagnoses_pct_relative_inequity'
  | 'hiv_diagnoses_pct_share'
  | 'hiv_diagnoses_per_100k'
  | 'hiv_population_pct'
  | 'hiv_prep_coverage'
  | 'hiv_prep_pct_relative_inequity'
  | 'hiv_prep_pct_share'
  | 'hiv_prep_population_pct'
  | 'hiv_prevalence_black_women_pct_relative_inequity'
  | 'hiv_prevalence_black_women_pct_share'
  | 'hiv_prevalence_black_women_per_100k'
  | 'hiv_prevalence_pct_relative_inequity'
  | 'hiv_prevalence_pct_share'
  | 'hiv_prevalence_per_100k'
  | 'hiv_prevalence_ratio_age_adjusted'
  | 'hiv_stigma_index'
  | 'hiv_stigma_pct_share'
  | 'hiv_care_total_additional_gender'
  | 'hiv_care_total_trans_men'
  | 'hiv_care_total_trans_women'
  | 'hiv_deaths_total_additional_gender'
  | 'hiv_deaths_total_trans_men'
  | 'hiv_deaths_total_trans_women'
  | 'hiv_diagnoses_total_additional_gender'
  | 'hiv_diagnoses_total_trans_men'
  | 'hiv_diagnoses_total_trans_women'
  | 'hiv_prevalence_total_additional_gender'
  | 'hiv_prevalence_total_trans_men'
  | 'hiv_prevalence_total_trans_women'

export const HIV_CARE_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'hiv_care',
    dataTypeShortLabel: 'Linkage to HIV care',
    fullDisplayName: 'Linkage to HIV care',
    fullDisplayNameInline: 'linkage to HIV care',
    dataTypeDefinition: `Individuals ages 13+ with linkage to HIV care in a particular year.`,
    timeSeriesData: true,
    dataTableTitle: 'Breakdown summary for linkage to HIV care',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total linkage to HIV care',
        metricId: 'hiv_care_pct_share',
        columnTitleHeader: 'Share of total linkage to HIV care',
        trendsCardTitleName:
          'Inequitable share of linkage to HIV care over time',
        shortLabel: '% linkage',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Diagnosed population vs. distribution of linkage to HIV care',
          metricId: 'hiv_care_population_pct',
          columnTitleHeader: 'Diagnosed population share (ages 13+)', // populationPctTitle,
          shortLabel: '% of diagnosed population',
          type: 'pct_share',
        },
      },
      pct_rate: {
        metricId: 'hiv_care_linkage',
        chartTitle: 'Linkage to HIV care',
        trendsCardTitleName: 'Rates of linkage to HIV care over time',
        columnTitleHeader: 'Linkage to HIV care',
        shortLabel: '% linkage',
        type: 'pct_rate',
      },
      pct_relative_inequity: {
        chartTitle: 'Historical relative inequity in linkage to HIV care',
        metricId: 'hiv_care_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
    },
  },
]

export const HIV_DISEASE_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'hiv_prevalence',
    dataTypeShortLabel: 'Prevalence',
    fullDisplayName: 'HIV prevalence',
    dataTypeDefinition: `Individuals ages 13+ living with HIV (diagnosed & undiagnosed) in a particular year.`,
    timeSeriesData: true,
    dataTableTitle: 'Breakdown summary for HIV prevalence',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total HIV prevalence',
        metricId: 'hiv_prevalence_pct_share',
        columnTitleHeader: 'Share of total HIV prevalence',
        trendsCardTitleName: 'Inequitable share of HIV prevalence over time',
        shortLabel: '% of HIV prevalence',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle: 'Population vs. distribution of total HIV prevalence',
          metricId: 'hiv_population_pct',
          columnTitleHeader: 'Population share (ages 13+)', // populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      per100k: {
        metricId: 'hiv_prevalence_per_100k',
        chartTitle: 'HIV prevalence',
        trendsCardTitleName: 'HIV prevalence over time',
        columnTitleHeader: 'HIV prevalence per 100k people',
        shortLabel: 'HIV prevalence per 100k',
        type: 'per100k',
      },
      pct_relative_inequity: {
        chartTitle: 'Historical relative inequity for HIV prevalence',
        metricId: 'hiv_prevalence_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
    },
  },
  {
    dataTypeId: 'hiv_diagnoses',
    dataTypeShortLabel: 'New diagnoses',
    fullDisplayName: 'New HIV diagnoses',
    fullDisplayNameInline: 'new HIV diagnoses',
    dataTypeDefinition: `Individuals ages 13+ diagnosed with HIV in a particular year.`,
    timeSeriesData: true,
    dataTableTitle: 'Breakdown summary for HIV diagnoses',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total HIV diagnoses',
        metricId: 'hiv_prevalence_pct_share',
        columnTitleHeader: 'Share of total HIV diagnoses',
        trendsCardTitleName: 'Inequitable share of HIV diagnoses over time',
        shortLabel: '% of HIV diagnoses',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle: 'Population vs. distribution of total HIV diagnoses',
          metricId: 'hiv_population_pct',
          columnTitleHeader: 'Population share (ages 13+)', // populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      per100k: {
        metricId: 'hiv_prevalence_per_100k',
        chartTitle: 'HIV diagnoses',
        trendsCardTitleName: 'HIV diagnoses over time',
        columnTitleHeader: 'HIV diagnoses per 100k people',
        shortLabel: 'HIV diagnoses per 100k',
        type: 'per100k',
      },
      pct_relative_inequity: {
        chartTitle: 'Historical relative inequity for new HIV diagnoses',
        metricId: 'hiv_diagnoses_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
    },
  },
  {
    dataTypeId: 'hiv_deaths',
    dataTypeShortLabel: 'Deaths',
    fullDisplayName: 'HIV deaths',
    dataTypeDefinition: `Individuals ages 13+ who died from HIV or AIDS in a particular year.`,
    timeSeriesData: true,
    dataTableTitle: 'Breakdown summary for HIV deaths',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total HIV deaths',
        metricId: 'hiv_deaths_pct_share',
        columnTitleHeader: 'Share of total HIV deaths',
        trendsCardTitleName: 'Inequitable share of HIV deaths over time',
        shortLabel: '% of HIV deaths',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle: 'Population vs. distribution of total HIV deaths',

          metricId: 'hiv_population_pct',
          columnTitleHeader: 'Population share (ages 13+)', // populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      per100k: {
        metricId: 'hiv_deaths_per_100k',
        chartTitle: 'HIV deaths',
        trendsCardTitleName: 'Rates of HIV deaths over time',
        columnTitleHeader: 'HIV deaths per 100k people',
        shortLabel: 'deaths per 100k',
        type: 'per100k',
      },
      pct_relative_inequity: {
        chartTitle: 'Historical relative inequity for HIV deaths',
        metricId: 'hiv_deaths_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
      age_adjusted_ratio: {
        metricId: 'hiv_deaths_ratio_age_adjusted',
        chartTitle: 'Age-adjusted HIV deaths compared to White (NH)',
        shortLabel: 'Ratio compared to White (NH)',
        type: 'age_adjusted_ratio',
        ageAdjusted: true,
      },
    },
  },
]

export const HIV_STIGMA_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'hiv_stigma',
    dataTypeShortLabel: 'Stigma',
    fullDisplayName: 'HIV stigma',
    dataTypeDefinition: `Self-reported stigma scores ranging from 0 (no stigma) to 100 (high stigma) for HIV-diagnosed individuals ages 18+ in a particular year.`,
    timeSeriesData: true,
    dataTableTitle: 'Breakdown summary for HIV stigma',
    metrics: {
      index: {
        metricId: 'hiv_stigma_index',
        chartTitle: 'HIV stigma',
        trendsCardTitleName: 'Rates of HIV stigma over time',
        columnTitleHeader: 'HIV stigma',
        shortLabel: 'stigma score out of 100',
        type: 'index',
      },
      pct_share: {
        chartTitle: 'Stigma scores', // needed for Unknowns Map Card Title
        metricId: 'hiv_stigma_pct_share',
        shortLabel: '% of HIV stigma',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle: 'Population vs. distribution of total HIV stigma',
          metricId: 'hiv_population_pct',
          columnTitleHeader: 'Population share (ages 18+)', // populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
    },
  },
]

export const HIV_BW_DISEASE_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'hiv_prevalence_black_women',
    dataTypeShortLabel: 'Prevalence for Black Women',
    fullDisplayName: 'HIV prevalence for Black women',
    dataTypeDefinition: `Black or African-American (NH) women ages 13+ living with HIV (diagnosed & undiagnosed) in a particular year.`,
    timeSeriesData: true,
    dataTableTitle: 'Breakdown summary for HIV prevalence for Black (NH) women',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total HIV prevalence for Black (NH) women',
        metricId: 'hiv_prevalence_black_women_pct_share',
        columnTitleHeader: 'Share of total HIV prevalence for Black (NH) women',
        trendsCardTitleName:
          'Inequitable share of HIV prevalence for Black (NH) women over time',
        shortLabel: '% of HIV prevalence (Black women)',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total HIV prevalence for Black (NH) women',
          metricId: 'black_women_population_pct',
          columnTitleHeader: 'Population share (ages 13+)', // populationPctTitle,
          shortLabel: '% of population (Black women)',
          type: 'pct_share',
        },
      },
      per100k: {
        metricId: 'hiv_prevalence_black_women_per_100k',
        chartTitle: 'HIV prevalence for Black (NH) women',
        trendsCardTitleName: 'HIV prevalence for Black (NH) women over time',
        columnTitleHeader:
          'HIV prevalence for Black (NH) women per 100k people',
        shortLabel: 'prevalence per 100k',
        type: 'per100k',
      },
      pct_relative_inequity: {
        chartTitle:
          'Historical relative inequity of HIV prevalence for Black (NH) women',
        metricId: 'hiv_prevalence_black_women_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
    },
  },
  {
    dataTypeId: 'hiv_diagnoses_black_women',
    dataTypeShortLabel: 'New Diagnoses for Black Women',
    fullDisplayName: 'New HIV diagnoses for Black women',
    dataTypeDefinition: `Black or African-American (NH) women ages 13+ diagnosed with HIV in a particular year.`,
    timeSeriesData: true,
    dataTableTitle:
      'Breakdown summary for new HIV diagnoses for Black (NH) women',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total new HIV diagnoses for Black (NH) women',
        metricId: 'hiv_diagnoses_black_women_pct_share',
        columnTitleHeader:
          'Share of total new HIV diagnoses for Black (NH) women',
        trendsCardTitleName:
          'Inequitable share of new HIV diagnoses for Black (NH) women over time',
        shortLabel: '% of new HIV diagnoses (Black women)',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total new HIV diagnoses for Black (NH) women',
          metricId: 'black_women_population_pct',
          columnTitleHeader: 'Population share (ages 13+)', // populationPctTitle,
          shortLabel: '% of population (Black women)',
          type: 'pct_share',
        },
      },
      per100k: {
        metricId: 'hiv_diagnoses_black_women_per_100k',
        chartTitle: 'New HIV diagnoses for Black (NH) women',
        trendsCardTitleName:
          'Rates of new HIV diagnoses for Black (NH) women over time',
        columnTitleHeader: 'New HIV diagnoses for Black (NH) women per 100k',
        shortLabel: 'diagnoses per 100k',
        type: 'per100k',
      },
      pct_relative_inequity: {
        chartTitle:
          'Historical relative inequity of new HIV diagnoses for Black (NH) women',
        metricId: 'hiv_diagnoses_black_women_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
    },
  },
  {
    dataTypeId: 'hiv_deaths_black_women',
    dataTypeShortLabel: 'Deaths for Black women',
    fullDisplayName: 'HIV deaths for Black women',
    dataTypeDefinition: `Black or African-American (NH) women ages 13+ who died from HIV or AIDS in a particular year.`,
    timeSeriesData: true,
    dataTableTitle: 'Breakdown summary for HIV deaths for Black (NH) women',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total HIV deaths for Black (NH) Women',
        metricId: 'hiv_deaths_black_women_pct_share',
        columnTitleHeader: 'Share of total HIV deaths for Black women',
        trendsCardTitleName:
          'Inequitable share of HIV deaths for Black (NH) women over time',
        shortLabel: '% of HIV deaths (Black women)',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total HIV deaths for Black (NH) women',
          metricId: 'black_women_population_pct',
          columnTitleHeader: 'Population share (ages 13+)', // populationPctTitle,
          shortLabel: '% of population (Black women)',
          type: 'pct_share',
        },
      },
      per100k: {
        metricId: 'hiv_deaths_black_women_per_100k',
        chartTitle: 'HIV deaths for Black (NH) women',
        trendsCardTitleName:
          'Rates of HIV deaths for Black (NH) women over time',
        columnTitleHeader: 'HIV deaths for Black (NH) women per 100k people',
        shortLabel: 'deaths per 100k',
        type: 'per100k',
      },
      pct_relative_inequity: {
        chartTitle:
          'Historical relative inequity of HIV deaths for Black (NH) women',
        metricId: 'hiv_deaths_black_women_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
    },
  },
]

export const HIV_PREP_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'hiv_prep',
    dataTypeShortLabel: 'PrEP coverage',
    fullDisplayName: 'PrEP coverage',
    dataTypeDefinition: `Individuals ages 16+ prescribed PrEP medication in a particular year.`,
    timeSeriesData: true,
    dataTableTitle: 'Breakdown summary for PrEP coverage',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total PrEP prescriptions',
        metricId: 'hiv_prep_pct_share',
        columnTitleHeader: 'Share of total PrEP prescriptions',
        trendsCardTitleName:
          'Inequitable share of PrEP prescriptions over time',
        shortLabel: '% of PrEP prescriptions',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'PrEP-eligible population vs. distribution of total PrEP prescriptions',
          metricId: 'hiv_prep_population_pct',
          columnTitleHeader: 'PrEP-eligible population share (ages 16+)', // populationPctTitle,
          shortLabel: '% of PrEP-eligible population',
          type: 'pct_share',
        },
      },
      pct_rate: {
        metricId: 'hiv_prep_coverage',
        chartTitle: 'PrEP coverage',
        trendsCardTitleName: 'Rates of PrEP coverage over time',
        columnTitleHeader: 'PrEP coverage',
        shortLabel: '% PrEP coverage',
        type: 'pct_rate',
      },
      pct_relative_inequity: {
        chartTitle: 'Historical relative inequity for PrEP coverage',
        metricId: 'hiv_prep_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
    },
  },
]
