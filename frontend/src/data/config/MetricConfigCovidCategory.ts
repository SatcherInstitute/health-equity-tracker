import {
  defaultHigherIsBetterMapConfig,
  defaultHigherIsWorseMapConfig,
} from '../../charts/mapGlobals'
import type { DataTypeConfig } from './MetricConfigTypes'
import {
  populationPctShortLabel,
  populationPctTitle,
} from './MetricConfigUtils'

export const COVID_CATEGORY_DROPDOWNIDS = [
  'covid_vaccinations',
  'covid',
] as const

export type CovidCategoryDataTypeId =
  | 'covid_cases'
  | 'covid_deaths'
  | 'covid_hospitalizations'

export type CovidCategoryMetricId =
  | 'acs_vaccinated_pop_pct'
  | 'covid_cases_pct_relative_inequity'
  | 'covid_cases_per_100k'
  | 'covid_cases_reporting_population_pct'
  | 'covid_cases_reporting_population'
  | 'covid_cases_share_of_known'
  | 'covid_cases_share'
  | 'covid_cases'
  | 'cases_ratio_age_adjusted'
  | 'covid_deaths_pct_relative_inequity'
  | 'covid_deaths_per_100k'
  | 'covid_deaths_reporting_population_pct'
  | 'covid_deaths_reporting_population'
  | 'covid_deaths_share_of_known'
  | 'covid_deaths_share'
  | 'covid_deaths'
  | 'hosp_ratio_age_adjusted'
  | 'covid_hosp_pct_relative_inequity'
  | 'covid_hosp_per_100k'
  | 'covid_hosp_reporting_population_pct'
  | 'covid_hosp_reporting_population'
  | 'covid_hosp_share_of_known'
  | 'covid_hosp_share'
  | 'covid_hosp'
  | 'covid_population_pct'
  | 'death_ratio_age_adjusted'
  | 'vaccinated_pct_share'
  | 'vaccinated_pct_rate'
  | 'vaccinated_pop_pct'
  | 'vaccinated_share_of_known'
  | 'vaccinated_estimated_total'

export const COVID_DISEASE_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'covid',
    dataTypeId: 'covid_cases',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Cases',
    fullDisplayName: 'COVID-19 cases',
    definition: {
      text: `A COVID-19 case is an individual who has been determined to have COVID-19 using a set of criteria known as a “case definition”. Cases can be classified as suspect, probable, or confirmed. CDC counts include probable and confirmed cases and deaths. Suspect cases and deaths are excluded.`,
    },
    description: {
      text: 'COVID-19 has had a disproportionate impact on certain populations, including older adults, people of color, people with disabilities, and people living in poverty. Studying COVID-19 in regard to health equity can help us to understand why these disparities exist and how to address them.',
    },
    dataTableTitle: 'Summary for COVID-19 cases',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total COVID-19 cases',
        metricId: 'covid_cases_share',
        columnTitleHeader: 'Share of total COVID-19 cases',
        unknownsLabel: '% unknown',
        shortLabel: '% of COVID-19 cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total COVID-19 cases (Cumulative Jan 2020 - May 2024)',
          metricId: 'covid_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      pct_relative_inequity: {
        chartTitle: 'Relative inequity for COVID-19 cases',
        metricId: 'covid_cases_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
        timeSeriesCadence: 'monthly',
      },
      per100k: {
        metricId: 'covid_cases_per_100k',
        chartTitle: 'Rates of COVID-19 cases (Cumulative Jan 2020 - May 2024)',
        trendsCardTitleName: 'Monthly COVID-19 cases per 100k',
        columnTitleHeader: 'Rates of COVID-19 cases',
        shortLabel: 'cases per 100k',
        type: 'per100k',
        timeSeriesCadence: 'monthly',
      },
    },
  },
  {
    categoryId: 'covid',
    dataTypeId: 'covid_deaths',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Deaths',
    fullDisplayName: 'COVID-19 deaths',
    definition: {
      text: `The number of people who died due to COVID-19.`,
    },
    description: {
      text: 'COVID-19 has had a disproportionate impact on certain populations, including older adults, people of color, people with disabilities, and people living in poverty. Studying COVID-19 in regard to health equity can help us to understand why these disparities exist and how to address them.',
    },
    dataTableTitle: 'Summary for COVID-19 deaths',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total COVID-19 deaths',
        metricId: 'covid_deaths_share',
        columnTitleHeader: 'Share of total COVID-19 deaths',
        shortLabel: '% of COVID-19 deaths',
        unknownsLabel: '% unknown',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total COVID-19 deaths (Cumulative Jan 2020 - May 2024)',
          metricId: 'covid_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      per100k: {
        metricId: 'covid_deaths_per_100k',
        chartTitle: 'Rates of COVID-19 deaths (Cumulative Jan 2020 - May 2024)',
        columnTitleHeader: 'Rates of COVID-19 deaths',
        trendsCardTitleName: 'Monthly COVID-19 deaths per 100k',
        shortLabel: 'deaths per 100k',
        type: 'per100k',
        timeSeriesCadence: 'monthly',
      },
      pct_relative_inequity: {
        chartTitle: 'Relative inequity for COVID-19 deaths',
        metricId: 'covid_deaths_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
        timeSeriesCadence: 'monthly',
      },
      age_adjusted_ratio: {
        metricId: 'death_ratio_age_adjusted',
        chartTitle: 'Age-adjusted COVID-19 deaths compared to White (NH)',
        shortLabel: 'Ratio compared to White (NH)', // table header-row label
        type: 'age_adjusted_ratio',
      },
    },
  },
  {
    categoryId: 'covid',
    dataTypeId: 'covid_hospitalizations',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Hospitalizations',
    fullDisplayName: 'COVID-19 hospitalizations',
    definition: {
      text: `The number of people hospitalized at any point while ill with COVID-19.`,
    },
    description: {
      text: 'COVID-19 has had a disproportionate impact on certain populations, including older adults, people of color, people with disabilities, and people living in poverty. Studying COVID-19 in regard to health equity can help us to understand why these disparities exist and how to address them.',
    },
    dataTableTitle: 'Summary for COVID-19 hospitalizations',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total COVID-19 hospitalizations',
        metricId: 'covid_hosp_share',
        columnTitleHeader: 'Share of total COVID-19 hospitalizations',
        shortLabel: '% of COVID-19 hospitalizations',
        unknownsLabel: '% unknown',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total COVID-19 hospitalizations (Cumulative Jan 2020 - May 2024)',

          metricId: 'covid_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      pct_relative_inequity: {
        chartTitle: 'Relative inequity for COVID-19 hospitalizations',
        metricId: 'covid_hosp_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
        timeSeriesCadence: 'monthly',
      },
      per100k: {
        metricId: 'covid_hosp_per_100k',
        chartTitle:
          'Rates of COVID-19 hospitalizations (Cumulative Jan 2020 - May 2024)',
        columnTitleHeader: 'Rates of COVID-19 hospitalizations',
        trendsCardTitleName: 'Monthly COVID-19 hospitalizations per 100k',
        shortLabel: 'hospitalizations per 100k',
        type: 'per100k',
        timeSeriesCadence: 'monthly',
      },
      age_adjusted_ratio: {
        metricId: 'hosp_ratio_age_adjusted',
        chartTitle:
          'Age-adjusted COVID-19 hospitalizations compared to White (NH)',
        shortLabel: 'Ratio compared to White (NH)', // Table header-row label
        type: 'age_adjusted_ratio',
      },
    },
  },
]

export const COVID_VACCINATION_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'covid',
    dataTypeId: 'covid_vaccinations',
    mapConfig: defaultHigherIsBetterMapConfig,
    dataTypeShortLabel: 'Vaccinations',
    fullDisplayName: 'COVID-19 vaccinations',
    definition: {
      text: `For the national and county levels, and for most states, this indicates people who have received at least one dose of a COVID-19 vaccine.`,
    },
    description: {
      text: 'COVID-19 vaccinations are an important tool for preventing the spread of the virus and protecting people from serious illness. However, vaccination rates vary significantly across different populations. Studying COVID-19 vaccinations in regard to health equity can help us to understand why these disparities exist and how to increase vaccination rates among all populations.',
    },
    dataTableTitle: 'Summary for COVID-19 vaccinations',
    metrics: {
      pct_rate: {
        metricId: 'vaccinated_pct_rate',
        chartTitle: 'COVID-19 vaccination rates',
        columnTitleHeader: 'COVID-19 vaccination rates',
        trendsCardTitleName: 'Rates of COVID-19 vaccination over time',
        shortLabel: '% vaccinated (at least one dose)',
        type: 'pct_rate',
        rateNumeratorMetric: {
          metricId: 'vaccinated_estimated_total',
          shortLabel: 'vaccinated',
          chartTitle: '',
          type: 'count',
        },
      },
      pct_share: {
        chartTitle: 'Share of total COVID-19 vaccinations',
        metricId: 'vaccinated_pct_share',
        columnTitleHeader: 'Share of total COVID-19 vaccinations',
        unknownsLabel: '% unknown',
        shortLabel: '% of all vaccinations',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total COVID-19 vaccinations',
          metricId: 'vaccinated_pop_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
        knownBreakdownComparisonMetric: {
          chartTitle: '',
          metricId: 'vaccinated_pct_share',
          columnTitleHeader: 'Share of total COVID-19 vaccinations',
          shortLabel: '% of all vaccinations',
          type: 'pct_share',
        },
        secondaryPopulationComparisonMetric: {
          chartTitle: '',
          metricId: 'acs_vaccinated_pop_pct',
          columnTitleHeader: 'Population percentage according to ACS',
          shortLabel: 'pop. % according to acs',
          type: 'pct_share',
        },
      },
    },
  },
]
