import {
  defaultHigherIsBetterMapConfig,
  defaultHigherIsWorseMapConfig,
  womenHigherIsWorseMapConfig,
} from '../../charts/mapGlobals'
import type { DataTypeConfig } from './MetricConfig'
import { populationPctShortLabel } from './MetricConfigUtils'

export const HIV_CATEGORY_DROPDOWNIDS = [
  'hiv',
  'hiv_black_women',
  'hiv_care',
  'hiv_prep',
  'hiv_stigma',
] as const

export type HivCategoryDataTypeId =
  | 'hiv_deaths_black_women'
  | 'hiv_deaths'
  | 'hiv_diagnoses_black_women'
  | 'hiv_diagnoses'
  | 'hiv_prevalence_black_women'
  | 'hiv_prevalence'

export type HivCategoryMetricId =
  | 'black_women_population_pct'
  | 'black_women_population_count'
  | 'hiv_care_linkage'
  | 'hiv_care_pct_relative_inequity'
  | 'hiv_care_pct_share'
  | 'hiv_care_population_pct'
  | 'hiv_care_population'
  | 'hiv_care'
  | 'hiv_deaths_black_women_pct_relative_inequity'
  | 'hiv_deaths_black_women_pct_share'
  | 'hiv_deaths_black_women_per_100k'
  | 'hiv_deaths_black_women'
  | 'hiv_deaths_pct_relative_inequity'
  | 'hiv_deaths_pct_share'
  | 'hiv_deaths_per_100k'
  | 'hiv_deaths_ratio_age_adjusted'
  | 'hiv_deaths'
  | 'hiv_diagnoses_black_women_pct_relative_inequity'
  | 'hiv_diagnoses_black_women_pct_share'
  | 'hiv_diagnoses_black_women_per_100k'
  | 'hiv_diagnoses_black_women'
  | 'hiv_diagnoses_pct_relative_inequity'
  | 'hiv_diagnoses_pct_share'
  | 'hiv_diagnoses_per_100k'
  | 'hiv_diagnoses'
  | 'hiv_population_pct'
  | 'hiv_population'
  | 'hiv_prep_coverage'
  | 'hiv_prep_pct_relative_inequity'
  | 'hiv_prep_pct_share'
  | 'hiv_prep_population_pct'
  | 'hiv_prep_population'
  | 'hiv_prep'
  | 'hiv_prevalence_black_women_pct_relative_inequity'
  | 'hiv_prevalence_black_women_pct_share'
  | 'hiv_prevalence_black_women_per_100k'
  | 'hiv_prevalence_black_women'
  | 'hiv_prevalence_pct_relative_inequity'
  | 'hiv_prevalence_pct_share'
  | 'hiv_prevalence_per_100k'
  | 'hiv_prevalence_ratio_age_adjusted'
  | 'hiv_prevalence'
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
    categoryId: 'hiv',
    dataTypeId: 'hiv_care',
    mapConfig: defaultHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Linkage to HIV care',
    fullDisplayName: 'Linkage to HIV care',
    fullDisplayNameInline: 'linkage to HIV care',
    definition: {
      text: `Individuals ages 13+ with linkage to HIV care in a particular year. The per 100k rate is the number with linkage to HIV care per 100,000 HIV diagnoses in a particular year.`,
    },
    description: {
      text: 'Access to quality HIV care is essential for ensuring that people living with HIV can live long and healthy lives. However, not everyone with HIV has access to quality care. Studying HIV care in regard to health equity can help us to understand why these disparities exist and how to improve access to quality care for all people living with HIV.',
    },
    dataTableTitle: 'Breakdown summary for linkage to HIV care',
    ageSubPopulationLabel: 'People diagnosed with HIV, Ages 13+',

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
        rateNumeratorMetric: {
          metricId: 'hiv_care',
          shortLabel: 'Individuals with linkage to HIV care',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'hiv_care_population',
          shortLabel: 'Total HIV diagnoses',
          chartTitle: '',
          type: 'count',
        },
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
    categoryId: 'hiv',
    dataTypeId: 'hiv_prevalence',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Prevalence',
    fullDisplayName: 'HIV prevalence',
    definition: {
      text: `Individuals ages 13+ living with HIV (diagnosed & undiagnosed) in a particular year.`,
    },
    description: {
      text: 'HIV is a serious and chronic disease that can be fatal if not treated. However, HIV is now a manageable condition thanks to effective antiretroviral therapy. Studying HIV in regard to health equity can help us to understand why certain populations are more likely to be diagnosed with HIV and why they are less likely to receive effective treatment.',
    },
    dataTableTitle: 'Breakdown summary for HIV prevalence',
    ageSubPopulationLabel: 'Ages 13+',

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
        rateNumeratorMetric: {
          metricId: 'hiv_prevalence',
          shortLabel: 'Individuals living with HIV',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'hiv_population',
          shortLabel: 'Total population',
          chartTitle: '',
          type: 'count',
        },
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
    categoryId: 'hiv',
    dataTypeId: 'hiv_diagnoses',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'New diagnoses',
    fullDisplayName: 'New HIV diagnoses',
    fullDisplayNameInline: 'new HIV diagnoses',
    definition: {
      text: `Individuals ages 13+ diagnosed with HIV in a particular year.`,
    },
    description: {
      text: 'HIV is a serious and chronic disease that can be fatal if not treated. However, HIV is now a manageable condition thanks to effective antiretroviral therapy. Studying HIV in regard to health equity can help us to understand why certain populations are more likely to be diagnosed with HIV and why they are less likely to receive effective treatment.',
    },
    dataTableTitle: 'Breakdown summary for HIV diagnoses',
    ageSubPopulationLabel: 'Ages 13+',

    metrics: {
      pct_share: {
        chartTitle: 'Share of total HIV diagnoses',
        metricId: 'hiv_diagnoses_pct_share',
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
        metricId: 'hiv_diagnoses_per_100k',
        chartTitle: 'HIV diagnoses',
        trendsCardTitleName: 'HIV diagnoses over time',
        columnTitleHeader: 'HIV diagnoses per 100k people',
        shortLabel: 'HIV diagnoses per 100k',
        type: 'per100k',
        rateNumeratorMetric: {
          metricId: 'hiv_diagnoses',
          shortLabel: 'HIV diagnoses',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'hiv_population',
          shortLabel: 'Total population',
          chartTitle: '',
          type: 'count',
        },
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
    categoryId: 'hiv',
    dataTypeId: 'hiv_deaths',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Deaths',
    fullDisplayName: 'HIV deaths',
    definition: {
      text: `Individuals ages 13+ who died from HIV or AIDS in a particular year.`,
    },
    description: {
      text: 'HIV is a serious and chronic disease that can be fatal if not treated. However, HIV is now a manageable condition thanks to effective antiretroviral therapy. Studying HIV in regard to health equity can help us to understand why certain populations are more likely to be diagnosed with HIV and why they are less likely to receive effective treatment.',
    },
    dataTableTitle: 'Breakdown summary for HIV deaths',
    ageSubPopulationLabel: 'Ages 13+',

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
        rateNumeratorMetric: {
          metricId: 'hiv_deaths',
          shortLabel: 'HIV deaths',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'hiv_population',
          shortLabel: 'Total population',
          chartTitle: '',
          type: 'count',
        },
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
    categoryId: 'hiv',
    dataTypeId: 'hiv_stigma',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Stigma',
    fullDisplayName: 'HIV stigma',
    definition: {
      text: `Self-reported stigma scores ranging from 0 (no stigma) to 100 (high stigma) for HIV-diagnosed individuals ages 18+ in a particular year.`,
    },
    description: {
      text: 'HIV stigma often intersects with other forms of stigma and discrimination, such as racism, homophobia, and sexism. Studying HIV stigma can shed light on broader issues of social injustice and inequality.',
    },
    dataTableTitle: 'Breakdown summary for HIV stigma',
    ageSubPopulationLabel: 'People living with HIV, Ages 18+',

    metrics: {
      index: {
        metricId: 'hiv_stigma_index',
        chartTitle: 'HIV stigma',
        trendsCardTitleName: 'Rates of HIV stigma over time',
        columnTitleHeader: 'HIV stigma',
        shortLabel: ' score out of 100',
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
    categoryId: 'hiv',
    dataTypeId: 'hiv_prevalence_black_women',
    mapConfig: womenHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Prevalence for Black Women',
    fullDisplayName: 'HIV prevalence for Black women',
    definition: {
      text: `Black or African-American (NH) women ages 13+ living with HIV (diagnosed & undiagnosed) in a particular year.`,
    },
    description: {
      text: 'Black women are disproportionately affected by HIV. In fact, Black women are six times more likely to be diagnosed with HIV than white women. Studying HIV among Black women in regard to health equity can help us to understand why this disparity exists and how to address it.',
    },
    dataTableTitle: 'Breakdown summary for HIV prevalence for Black (NH) women',

    ageSubPopulationLabel: 'Ages 13+',
    otherSubPopulationLabel: 'Black Women',
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
        rateNumeratorMetric: {
          metricId: 'hiv_prevalence_black_women',
          shortLabel: 'Black women living with HIV',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'black_women_population_count',
          shortLabel: 'Total Black women',
          chartTitle: '',
          type: 'count',
        },
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
    categoryId: 'hiv',
    dataTypeId: 'hiv_diagnoses_black_women',
    mapConfig: womenHigherIsWorseMapConfig,
    dataTypeShortLabel: 'New Diagnoses for Black Women',
    fullDisplayName: 'New HIV diagnoses for Black women',
    definition: {
      text: `Black or African-American (NH) women ages 13+ diagnosed with HIV in a particular year.`,
    },
    description: {
      text: 'Black women are disproportionately affected by HIV. In fact, Black women are six times more likely to be diagnosed with HIV than white women. Studying HIV among Black women in regard to health equity can help us to understand why this disparity exists and how to address it.',
    },
    dataTableTitle:
      'Breakdown summary for new HIV diagnoses for Black (NH) women',

    ageSubPopulationLabel: 'Ages 13+',
    otherSubPopulationLabel: 'Black Women',
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
        rateNumeratorMetric: {
          metricId: 'hiv_diagnoses_black_women',
          shortLabel: 'HIV diagnoses for Black women',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'black_women_population_count',
          shortLabel: 'Total Black women',
          chartTitle: '',
          type: 'count',
        },
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
    categoryId: 'hiv',
    dataTypeId: 'hiv_deaths_black_women',
    mapConfig: womenHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Deaths for Black women',
    fullDisplayName: 'HIV deaths for Black women',
    definition: {
      text: `Black or African-American (NH) women ages 13+ who died from HIV or AIDS in a particular year.`,
    },
    description: {
      text: 'Black women are disproportionately affected by HIV. In fact, Black women are six times more likely to be diagnosed with HIV than white women. Studying HIV among Black women in regard to health equity can help us to understand why this disparity exists and how to address it.',
    },
    dataTableTitle: 'Breakdown summary for HIV deaths for Black (NH) women',

    ageSubPopulationLabel: 'Ages 13+',
    otherSubPopulationLabel: 'Black Women',
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
        rateNumeratorMetric: {
          metricId: 'hiv_deaths_black_women',
          shortLabel: 'HIV deaths for Black women',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'black_women_population_count',
          shortLabel: 'Total Black women',
          chartTitle: '',
          type: 'count',
        },
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
    categoryId: 'hiv',
    dataTypeId: 'hiv_prep',
    mapConfig: defaultHigherIsBetterMapConfig,
    dataTypeShortLabel: 'PrEP coverage',
    fullDisplayName: 'PrEP coverage',
    definition: {
      text: `Individuals ages 16+ prescribed PrEP medication in a particular year. The rate percentage is calculated as the percentage of PrEP-eligible individuals who were prescribed PrEP.`,
    },
    description: {
      text: 'HIV PrEP is a medication that can help to prevent HIV infection. PrEP is highly effective when taken as prescribed. Studying HIV PrEP in regard to health equity can help us to understand why certain populations are more likely to use PrEP and why others are less likely to use it.',
    },
    dataTableTitle: 'Breakdown summary for PrEP coverage',
    ageSubPopulationLabel: 'PrEP-eligible population, Ages 16+',
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
        rateNumeratorMetric: {
          metricId: 'hiv_prep',
          shortLabel: 'PrEP prescriptions',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'hiv_prep_population',
          shortLabel: 'PrEP-eligible population',
          chartTitle: '',
          type: 'count',
        },
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
