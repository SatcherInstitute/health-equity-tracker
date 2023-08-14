import { type DataTypeConfig } from './MetricConfig'
import {
  populationPctShortLabel,
  populationPctTitle,
} from './MetricConfigUtils'

export const COVID_CATEGORY_DROPDOWNIDS = ['covid_vaccinations', 'covid']

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
  | 'vaccinated_per_100k'
  | 'vaccinated_pop_pct'
  | 'vaccinated_share_of_known'

export const COVID_DISEASE_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'covid_cases',
    dataTypeShortLabel: 'Cases',
    fullDisplayName: 'COVID-19 cases',
    dataTypeDefinition: `A COVID-19 case is an individual who has been determined to have COVID-19 using a set of criteria known as a “case definition”. Cases can be classified as suspect, probable, or confirmed. CDC counts include probable and confirmed cases and deaths. Suspect cases and deaths are excluded.`,
    timeSeriesData: true,
    dataTableTitle: 'Breakdown summary for COVID-19 cases',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total COVID-19 cases',
        metricId: 'covid_cases_share',
        columnTitleHeader: 'Share of total COVID-19 cases',
        unknownsVegaLabel: '% unknown',
        shortLabel: '% of COVID-19 cases',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total COVID-19 cases since Jan 2020',
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
        isMonthly: true,
      },
      per100k: {
        metricId: 'covid_cases_per_100k',
        chartTitle: 'Rates of COVID-19 cases since Jan 2020',
        trendsCardTitleName: 'Monthly COVID-19 cases per 100k',
        columnTitleHeader: 'Rates of COVID-19 cases',
        shortLabel: 'cases per 100k',
        type: 'per100k',
        isMonthly: true,
      },
    },
  },
  {
    dataTypeId: 'covid_deaths',
    dataTypeShortLabel: 'Deaths',
    fullDisplayName: 'COVID-19 deaths',
    dataTypeDefinition: `The number of people who died due to COVID-19.`,
    timeSeriesData: true,
    dataTableTitle: 'Breakdown summary for COVID-19 deaths',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total COVID-19 deaths',
        metricId: 'covid_deaths_share',
        columnTitleHeader: 'Share of total COVID-19 deaths',
        shortLabel: '% of COVID-19 deaths',
        unknownsVegaLabel: '% unknown',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total COVID-19 deaths since Jan 2020',
          metricId: 'covid_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      per100k: {
        metricId: 'covid_deaths_per_100k',
        chartTitle: 'Rates of COVID-19 deaths since Jan 2020',
        columnTitleHeader: 'Rates of COVID-19 deaths',
        trendsCardTitleName: 'Monthly COVID-19 deaths per 100k',
        shortLabel: 'deaths per 100k',
        type: 'per100k',
        isMonthly: true,
      },
      pct_relative_inequity: {
        chartTitle: 'Relative inequity for COVID-19 deaths',
        metricId: 'covid_deaths_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
        isMonthly: true,
      },
      age_adjusted_ratio: {
        metricId: 'death_ratio_age_adjusted',
        chartTitle: 'Age-adjusted COVID-19 deaths compared to White (NH)',
        shortLabel: 'Ratio compared to White (NH)', // table header-row label
        type: 'age_adjusted_ratio',
        ageAdjusted: true,
      },
    },
  },
  {
    dataTypeId: 'covid_hospitalizations',
    dataTypeShortLabel: 'Hospitalizations',
    fullDisplayName: 'COVID-19 hospitalizations',
    dataTypeDefinition: `The number of people hospitalized at any point while ill with COVID-19.`,
    timeSeriesData: true,
    dataTableTitle: 'Breakdown summary for COVID-19 hospitalizations',
    metrics: {
      pct_share: {
        chartTitle: 'Share of total COVID-19 hospitalizations',
        metricId: 'covid_hosp_share',
        columnTitleHeader: 'Share of total COVID-19 hospitalizations',
        shortLabel: '% of COVID-19 hospitalizations',
        unknownsVegaLabel: '% unknown',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total COVID-19 hospitalizations since Jan 2020',

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
        isMonthly: true,
      },
      per100k: {
        metricId: 'covid_hosp_per_100k',
        chartTitle: 'Rates of COVID-19 hospitalizations since Jan 2020',
        columnTitleHeader: 'Rates of COVID-19 hospitalizations',
        trendsCardTitleName: 'Monthly COVID-19 hospitalizations per 100k',
        shortLabel: 'hospitalizations per 100k',
        type: 'per100k',
        isMonthly: true,
      },
      age_adjusted_ratio: {
        metricId: 'hosp_ratio_age_adjusted',
        chartTitle:
          'Age-adjusted COVID-19 hospitalizations compared to White (NH)',
        shortLabel: 'age-adjusted', // Table header-row label
        type: 'age_adjusted_ratio',
        ageAdjusted: true,
      },
    },
  },
]

export const COVID_VACCINATION_METRICS: DataTypeConfig[] = [
  {
    dataTypeId: 'covid_vaccinations',
    dataTypeShortLabel: 'Vaccinations',
    fullDisplayName: 'COVID-19 vaccinations',
    dataTypeDefinition: `For the national level and most states this indicates people who have received at least one dose of a COVID-19 vaccine.`,
    dataTableTitle: 'Breakdown summary for COVID-19 vaccinations',
    metrics: {
      per100k: {
        metricId: 'vaccinated_per_100k',
        chartTitle: 'COVID-19 vaccinations per 100k people',
        columnTitleHeader: 'COVID-19 vaccinations per 100k people',
        shortLabel: 'COVID-19 vaccinations per 100k',
        type: 'per100k',
      },
      pct_share: {
        chartTitle: 'Share of total COVID-19 vaccinations',
        metricId: 'vaccinated_pct_share',
        columnTitleHeader: 'Share of total COVID-19 vaccinations',
        unknownsVegaLabel: '% unknown',
        shortLabel: '% of vaccinations',
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
          shortLabel: '% of vaccinations',
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
