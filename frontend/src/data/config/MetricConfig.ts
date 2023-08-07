//  IDs for the selectable conditions in the madlib
// NOTE: these strings are displayed to the user if the data type toggle is enabled.
// Underscores become spaces, and all letters are capitalized
// TODO: integrate strings from Category / Madlib into the Metric Config
// so ALL related topic data is contained in a single object

import { LESS_THAN_1 } from '../utils/Constants'

const dropdownVarIds = [
  'asthma',
  'avoided_care',
  'cardiovascular_diseases',
  'chronic_kidney_disease',
  'copd',
  'covid_vaccinations',
  'covid',
  'depression',
  'diabetes',
  'excessive_drinking',
  'frequent_mental_distress',
  'health_insurance',
  'hiv_black_women',
  'hiv_care',
  'hiv_prep',
  'hiv_stigma',
  'hiv',
  'incarceration',
  'phrma_cardiovascular',
  'phrma_hiv',
  'poverty',
  'preventable_hospitalizations',
  'substance',
  'suicide',
  'voter_participation',
  'women_in_gov',
] as const

export type DropdownVarId = (typeof dropdownVarIds)[number]

export function isDropdownVarId(str: string): str is DropdownVarId {
  return !!dropdownVarIds.find((dropdown) => str === dropdown)
}

export type AgeAdjustedDataTypeId =
  | 'covid_deaths'
  | 'covid_hospitalizations'
  | 'hiv_deaths'

// IDs for the sub-data types (if any) for theDropDownId
export type DataTypeId =
  | DropdownVarId
  | AgeAdjustedDataTypeId
  | 'ami'
  | 'arv_adherence'
  | 'beta_blockers_adherence'
  | 'covid_cases'
  | 'covid_deaths'
  | 'covid_hospitalizations'
  | 'covid_vaccinations'
  | 'hiv_deaths_black_women'
  | 'hiv_deaths'
  | 'hiv_diagnoses_black_women'
  | 'hiv_diagnoses'
  | 'hiv_prevalence_black_women'
  | 'hiv_prevalence'
  | 'jail'
  | 'non_medical_drug_use'
  | 'poverty'
  | 'prison'
  | 'rasa_adherence'
  | 'statins_adherence'
  | 'ccb_adherence'
  | 'doac_adherence'
  | 'nqf_adherence'
  | 'women_in_state_legislature'
  | 'women_in_us_congress'
  | 'prison'
  | 'women_in_state_legislature'
  | 'women_in_us_congress'

export type MetricId =
  | 'acs_vaccinated_pop_pct'
  | 'ahr_population_pct'
  | 'ami_pct_share'
  | 'ami_per_100k'
  | 'arv_adherence_pct_rate'
  | 'arv_adherence_pct_share'
  | 'arv_population_pct_share'
  | 'asthma_pct_share'
  | 'asthma_per_100k'
  | 'avoided_care_pct_rate'
  | 'avoided_care_pct_share'
  | 'beta_blockers_adherence_pct_rate'
  | 'beta_blockers_adherence_pct_share'
  | 'beta_blockers_population_pct_share'
  | 'black_women_population_pct'
  | 'cardiovascular_diseases_pct_share'
  | 'cardiovascular_diseases_per_100k'
  | 'cases_ratio_age_adjusted'
  | 'cawp_population_pct'
  | 'ccb_adherence_pct_rate'
  | 'ccb_adherence_pct_share'
  | 'ccb_population_pct_share'
  | 'chronic_kidney_disease_pct_share'
  | 'chronic_kidney_disease_per_100k'
  | 'copd_pct_share'
  | 'copd_per_100k'
  | 'covid_cases_pct_relative_inequity'
  | 'covid_cases_per_100k'
  | 'covid_cases_reporting_population_pct'
  | 'covid_cases_reporting_population'
  | 'covid_cases_share_of_known'
  | 'covid_cases_share'
  | 'covid_cases'
  | 'covid_deaths_pct_relative_inequity'
  | 'covid_deaths_per_100k'
  | 'covid_deaths_reporting_population_pct'
  | 'covid_deaths_reporting_population'
  | 'covid_deaths_share_of_known'
  | 'covid_deaths_share'
  | 'covid_deaths'
  | 'covid_hosp_pct_relative_inequity'
  | 'covid_hosp_per_100k'
  | 'covid_hosp_reporting_population_pct'
  | 'covid_hosp_reporting_population'
  | 'covid_hosp_share_of_known'
  | 'covid_hosp_share'
  | 'covid_hosp'
  | 'covid_population_pct'
  | 'death_ratio_age_adjusted'
  | 'depression_pct_share'
  | 'depression_per_100k'
  | 'diabetes_pct_share'
  | 'diabetes_per_100k'
  | 'doac_adherence_pct_rate'
  | 'doac_adherence_pct_share'
  | 'doac_population_pct_share'
  | 'excessive_drinking_pct_share'
  | 'excessive_drinking_per_100k'
  | 'frequent_mental_distress_pct_share'
  | 'frequent_mental_distress_per_100k'
  | 'geo_context'
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
  | 'hosp_ratio_age_adjusted'
  | 'incarceration_population_pct'
  | 'jail_pct_relative_inequity'
  | 'jail_pct_share'
  | 'jail_per_100k'
  | 'non_medical_drug_use_pct_share'
  | 'non_medical_drug_use_per_100k'
  | 'nqf_adherence_pct_rate'
  | 'nqf_adherence_pct_share'
  | 'nqf_population_pct_share'
  | 'pct_share_of_state_leg'
  | 'pct_share_of_us_congress'
  | 'pct_share_of_women_state_leg'
  | 'pct_share_of_women_us_congress'
  | 'phrma_hiv_pct_share'
  | 'phrma_hiv_per_100k'
  | 'phrma_population_pct_share'
  | 'population_decia'
  | 'population_pct_decia'
  | 'population_pct'
  | 'population'
  | 'poverty_count'
  | 'poverty_pct_share'
  | 'poverty_pct_rate'
  | 'poverty_population_pct'
  | 'poverty_pct_relative_inequity'
  | 'preventable_hospitalizations_pct_share'
  | 'preventable_hospitalizations_per_100k'
  | 'prison_pct_relative_inequity'
  | 'prison_pct_share'
  | 'prison_per_100k'
  | 'rasa_adherence_pct_rate'
  | 'rasa_adherence_pct_share'
  | 'rasa_population_pct_share'
  | 'statins_adherence_pct_rate'
  | 'statins_adherence_pct_share'
  | 'statins_population_pct_share'
  | 'suicide_pct_share'
  | 'suicide_per_100k'
  | 'svi'
  | 'total_confined_children'
  | 'total_state_leg_count'
  | 'total_us_congress_count'
  | 'total_us_congress_names'
  | 'uninsured_pct_share'
  | 'uninsured_pct_rate'
  | 'uninsured_population_pct'
  | 'uninsured_pct_relative_inequity'
  | 'vaccinated_pct_share'
  | 'vaccinated_per_100k'
  | 'vaccinated_pop_pct'
  | 'vaccinated_share_of_known'
  | 'voter_participation_pct_rate'
  | 'voter_participation_pct_share'
  | 'women_state_leg_pct_relative_inequity'
  | 'women_this_race_state_leg_count'
  | 'women_this_race_us_congress_count'
  | 'women_this_race_us_congress_names'
  | 'women_us_congress_pct_relative_inequity'
  | 'women_us_congress_ratio_age_adjusted'
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

// The type of metric indicates where and how this a MetricConfig is represented in the frontend:
// What chart types are applicable, what metrics are shown together, display names, etc.
export type MetricType =
  | 'count'
  | 'pct_share'
  | 'per100k'
  | 'pct_relative_inequity'
  | 'pct_rate'
  | 'index'
  | 'ratio'
  | 'age_adjusted_ratio'

export interface MetricConfig {
  metricId: MetricId
  columnTitleHeader?: string
  trendsCardTitleName?: string
  chartTitle: string
  shortLabel: string
  unknownsVegaLabel?: string
  type: MetricType
  populationComparisonMetric?: MetricConfig
  ageAdjusted?: boolean
  isMonthly?: boolean

  // This metric is one where the denominator only includes records where
  // demographics are known. For example, for "share of covid cases" in the US
  // for the "Asian" demographic, this metric would be equal to
  // (# of Asian covid cases in the US) divided by
  // (# of covid cases in the US excluding those with unknown race/ethnicity).
  knownBreakdownComparisonMetric?: MetricConfig
  secondaryPopulationComparisonMetric?: MetricConfig
}

export interface DataTypeConfig {
  dataTypeId: DataTypeId
  dataTypeShortLabel: string
  fullDisplayName: string
  fullDisplayNameInline?: string
  dataTypeDefinition?: string
  metrics: {
    count?: MetricConfig
    pct_share: MetricConfig
    per100k?: MetricConfig
    pct_relative_inequity?: MetricConfig
    pct_rate?: MetricConfig
    index?: MetricConfig
    ratio?: MetricConfig
    age_adjusted_ratio?: MetricConfig
  }
  surveyCollectedData?: boolean
  timeSeriesData?: boolean
  dataTableTitle?: string
}

const populationPctTitle = 'Population share'
const populationPctShortLabel = '% of population'

export const SYMBOL_TYPE_LOOKUP: Record<MetricType, string> = {
  per100k: 'per 100k',
  pct_share: '% share',
  count: 'people',
  index: '',
  ratio: '×',
  age_adjusted_ratio: '×',
  pct_relative_inequity: '%',
  pct_rate: '%',
}

export function isPctType(metricType: MetricType) {
  return ['pct_share', 'pct_relative_inequity', 'pct_rate'].includes(metricType)
}

/**
 * @param metricType The type of the metric to format.
 * @param value The value to format.
 * @param omitPctSymbol Whether to omit the % symbol if the metric is a %. This
 *     can be used for example if the % symbol is part of the description.
 * @returns A formatted version of a field value based on the type specified by
 *     the field name
 */
export function formatFieldValue(
  metricType: MetricType,
  value: any,
  omitPctSymbol: boolean = false
): string {
  if (value === null || value === undefined) {
    return ''
  }

  // if values are numeric but rounded down to 0, instead replace with "less than 1"
  const RATES: MetricType[] = ['pct_rate', 'per100k']
  if (value === 0 && RATES.includes(metricType)) return LESS_THAN_1

  const isRatio = metricType.includes('ratio')
  const formatOptions =
    metricType === 'pct_share' ? { minimumFractionDigits: 1 } : {}
  const formattedValue: string =
    typeof value === 'number'
      ? value.toLocaleString('en', formatOptions)
      : value
  const percentSuffix = isPctType(metricType) && !omitPctSymbol ? '%' : ''
  const ratioSuffix = isRatio ? '×' : ''
  return `${formattedValue}${percentSuffix}${ratioSuffix}`
}

export function getRateAndPctShareMetrics(
  dataTypeConfig: DataTypeConfig
): MetricConfig[] {
  const tableFields: MetricConfig[] = []
  if (dataTypeConfig) {
    if (dataTypeConfig.metrics?.per100k) {
      tableFields.push(dataTypeConfig.metrics.per100k)
    }
    if (dataTypeConfig.metrics?.pct_rate) {
      tableFields.push(dataTypeConfig.metrics.pct_rate)
    }
    if (dataTypeConfig.metrics?.index) {
      tableFields.push(dataTypeConfig.metrics.index)
    }
    if (dataTypeConfig.metrics.pct_share) {
      tableFields.push(dataTypeConfig.metrics.pct_share)
      if (dataTypeConfig.metrics.pct_share.populationComparisonMetric) {
        tableFields.push(
          dataTypeConfig.metrics.pct_share.populationComparisonMetric
        )
      }
    }
  }
  return tableFields
}

export function getAgeAdjustedRatioMetric(
  dataTypeConfig: DataTypeConfig
): MetricConfig[] {
  const tableFields: MetricConfig[] = []
  if (dataTypeConfig) {
    if (
      dataTypeConfig.metrics.age_adjusted_ratio &&
      dataTypeConfig.metrics.pct_share
    ) {
      // Ratios for Table
      tableFields.push(dataTypeConfig.metrics.age_adjusted_ratio)
      // pct_share for Unknowns Alert
      tableFields.push(dataTypeConfig.metrics.pct_share)
    }
  }
  return tableFields
}

// TODO: count and pct_share metric types should require populationComparisonMetric
// Note: metrics must be declared in a consistent order because the UI relies
// on this to build data type toggles.
// TODO: make the UI consistent regardless of metric config order.
export const METRIC_CONFIG: Record<DropdownVarId, DataTypeConfig[]> = {
  covid: [
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
  ],
  covid_vaccinations: [
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
  ],
  hiv_care: [
    {
      dataTypeId: 'hiv_care',
      dataTypeShortLabel: 'Linkage to HIV care',
      fullDisplayName: 'Linkage to HIV care',
      fullDisplayNameInline: 'linkage to HIV care',
      dataTypeDefinition: `Individuals ages 13+ with linkage to HIV care in a particular year (single-year charts use data from 2019).`,
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
        per100k: {
          metricId: 'hiv_care_linkage',
          chartTitle: 'Linkage to HIV care',
          trendsCardTitleName: 'Rates of linkage to HIV care over time',
          columnTitleHeader: 'Linkage to HIV care',
          shortLabel: '% linkage',
          type: 'pct_share',
        },
        pct_relative_inequity: {
          chartTitle: 'Historical relative inequity in linkage to HIV care',
          metricId: 'hiv_care_pct_relative_inequity',
          shortLabel: '% relative inequity',
          type: 'pct_relative_inequity',
        },
      },
    },
  ],
  hiv: [
    {
      dataTypeId: 'hiv_prevalence',
      dataTypeShortLabel: 'Prevalence',
      fullDisplayName: 'HIV prevalence',
      dataTypeDefinition: `Individuals ages 13+ living with HIV (diagnosed & undiagnosed) in a particular year (single-year charts use data from 2019).`,
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
      dataTypeDefinition: `Individuals ages 13+ diagnosed with HIV in a particular year (single-year charts use data from 2019).`,
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
      dataTypeDefinition: `Individuals ages 13+ who died from HIV or AIDS in a particular year (single-year charts use data from 2019).`,
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
  ],
  hiv_stigma: [
    {
      dataTypeId: 'hiv_stigma',
      dataTypeShortLabel: 'Stigma',
      fullDisplayName: 'HIV stigma',
      dataTypeDefinition: `Self-reported stigma scores ranging from 0 (no stigma) to 100 (high stigma) for HIV-diagnosed individuals ages 18+ in a particular year (single-year charts use data from 2019).`,
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
  ],
  hiv_black_women: [
    {
      dataTypeId: 'hiv_prevalence_black_women',
      dataTypeShortLabel: 'Prevalence for Black Women',
      fullDisplayName: 'HIV prevalence for Black women',
      dataTypeDefinition: `Black or African-American (NH) women ages 13+ living with HIV (diagnosed & undiagnosed) in a particular year (single-year charts use data from 2019).`,
      timeSeriesData: true,
      dataTableTitle:
        'Breakdown summary for HIV prevalence for Black (NH) women',
      metrics: {
        pct_share: {
          chartTitle: 'Share of total HIV prevalence for Black (NH) women',
          metricId: 'hiv_prevalence_pct_share',
          columnTitleHeader:
            'Share of total HIV prevalence for Black (NH) women',
          trendsCardTitleName:
            'Inequitable share of HIV prevalence for Black (NH) women over time',
          shortLabel: '% of HIV prevalence (Black women)',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Population vs. distribution of total HIV prevalence for Black (NH) women',
            metricId: 'hiv_population_pct',
            columnTitleHeader: 'Population share (ages 13+)', // populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: 'pct_share',
          },
        },
        per100k: {
          metricId: 'hiv_prevalence_per_100k',
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
          metricId: 'hiv_prevalence_pct_relative_inequity',
          shortLabel: '% relative inequity',
          type: 'pct_relative_inequity',
        },
      },
    },
    {
      dataTypeId: 'hiv_diagnoses_black_women',
      dataTypeShortLabel: 'New Diagnoses for Black Women',
      fullDisplayName: 'New HIV diagnoses for Black women',
      fullDisplayNameInline: 'new HIV diagnoses for Black women',
      dataTypeDefinition: `Black or African-American (NH) women ages 13+ diagnosed with HIV in a particular year (single-year charts use data from 2019).`,
      timeSeriesData: true,
      dataTableTitle:
        'Breakdown summary for new HIV diagnoses for Black (NH) women',
      metrics: {
        pct_share: {
          chartTitle: 'Share of total new HIV diagnoses for Black (NH) women',
          metricId: 'hiv_diagnoses_pct_share',
          columnTitleHeader:
            'Share of total new HIV diagnoses for Black (NH) women',
          trendsCardTitleName:
            'Inequitable share of new HIV diagnoses for Black (NH) women over time',
          shortLabel: '% of new HIV diagnoses (Black women)',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Population vs. distribution of total new HIV diagnoses for Black (NH) women',
            metricId: 'hiv_population_pct',
            columnTitleHeader: 'Population share (ages 13+)', // populationPctTitle,
            shortLabel: '% of population (Black women)',
            type: 'pct_share',
          },
        },
        per100k: {
          metricId: 'hiv_diagnoses_per_100k',
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
          metricId: 'hiv_diagnoses_pct_relative_inequity',
          shortLabel: '% relative inequity',
          type: 'pct_relative_inequity',
        },
      },
    },
    {
      dataTypeId: 'hiv_deaths_black_women',
      dataTypeShortLabel: 'Deaths for Black women',
      fullDisplayName: 'HIV deaths for Black women',
      dataTypeDefinition: `Black or African-American (NH) women ages 13+ who died from HIV or AIDS in a particular year (single-year charts use data from 2019).`,
      timeSeriesData: true,
      dataTableTitle:
        'Breakdown summary for HIV prevalence for Black (NH) women',
      metrics: {
        pct_share: {
          chartTitle: 'Share of total HIV deaths for Black (NH) Women',
          metricId: 'hiv_deaths_pct_share',
          columnTitleHeader: 'Share of total HIV deaths for Black women',
          trendsCardTitleName:
            'Inequitable share of HIV prevalence for Black (NH) women over time',
          shortLabel: '% of HIV prevalence (Black women)',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Population vs. distribution of total HIV deaths for Black (NH) women',
            metricId: 'hiv_population_pct',
            columnTitleHeader: 'Population share (ages 13+)', // populationPctTitle,
            shortLabel: '% of population (Black women)',
            type: 'pct_share',
          },
        },
        per100k: {
          metricId: 'hiv_deaths_per_100k',
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
          metricId: 'hiv_deaths_pct_relative_inequity',
          shortLabel: '% relative inequity',
          type: 'pct_relative_inequity',
        },
      },
    },
  ],
  hiv_prep: [
    {
      dataTypeId: 'hiv_prep',
      dataTypeShortLabel: 'PrEP coverage',
      fullDisplayName: 'PrEP coverage',
      dataTypeDefinition: `Individuals ages 16+ prescribed PrEP medication in a particular year (single-year charts use data from 2019).`,
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
              'PrEP-eligible population vs. distribution of total PrEP prescriptions',
            metricId: 'hiv_prep_population_pct',
            columnTitleHeader: 'PrEP-eligible population share (ages 16+)', // populationPctTitle,
            shortLabel: '% of PrEP-eligible population',
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
  ],
  suicide: [
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
  ],
  depression: [
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
  ],
  excessive_drinking: [
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
  ],
  substance: [
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
  ],

  frequent_mental_distress: [
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
  ],
  diabetes: [
    {
      dataTypeId: 'diabetes',
      dataTypeShortLabel: 'Cases',
      fullDisplayName: 'Diabetes',
      fullDisplayNameInline: 'diabetes',
      dataTypeDefinition: `Adults who reported being told by a health professional that they have diabetes (excluding prediabetes and gestational diabetes).`,
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
  ],
  copd: [
    {
      dataTypeId: 'copd',
      dataTypeShortLabel: 'Cases',
      fullDisplayName: 'COPD',
      dataTypeDefinition: `Adults who reported being told by a health professional that they have chronic obstructive pulmonary disease, emphysema or chronic bronchitis.`,
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
  ],

  health_insurance: [
    {
      dataTypeId: 'health_insurance',
      dataTypeShortLabel: 'Uninsured people',
      fullDisplayName: 'Uninsured people',
      fullDisplayNameInline: 'uninsured people',
      dataTypeDefinition: `Health insurance coverage in the ACS and other Census Bureau surveys define coverage to
        include plans and programs that provide comprehensive health coverage. Plans that provide
        insurance only for specific conditions or situations such as cancer and long-term care policies
        are not considered comprehensive health coverage. Likewise, other types of insurance like
        dental, vision, life, and disability insurance are not considered comprehensive health
        insurance coverage.`,
      dataTableTitle: 'Breakdown summary for uninsured people',
      timeSeriesData: true,
      metrics: {
        pct_rate: {
          metricId: 'uninsured_pct_rate',
          chartTitle: 'Uninsured people',
          trendsCardTitleName: 'Rates of uninsurance over time',
          columnTitleHeader: 'Uninsured people',
          shortLabel: '% uninsured',
          type: 'pct_rate',
        },
        pct_share: {
          chartTitle: 'Share of uninsured people',
          metricId: 'uninsured_pct_share',
          columnTitleHeader: 'Share of uninsured people',
          shortLabel: '% of uninsured',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle: 'Population vs. distribution of total uninsured people',
            metricId: 'uninsured_population_pct',
            columnTitleHeader: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: 'pct_share',
          },
        },
        pct_relative_inequity: {
          chartTitle: 'Relative inequity for uninsurance',
          metricId: 'uninsured_pct_relative_inequity',
          shortLabel: '% relative inequity',
          type: 'pct_relative_inequity',
        },
      },
    },
  ],
  poverty: [
    {
      dataTypeId: 'poverty',
      dataTypeShortLabel: 'Poverty',
      fullDisplayName: 'People below the poverty line',
      fullDisplayNameInline: 'people below the poverty line',
      dataTypeDefinition: `Following the Office of Management and Budget's (OMB) Statistical Policy Directive 14, the Census Bureau uses a set of money income thresholds that vary by family size and composition to determine who is in poverty. If a family's total income is less than the family's threshold, then that family and every individual in it is considered in poverty. The official poverty thresholds do not vary geographically, but they are updated for inflation using the Consumer Price Index (CPI-U). The official poverty definition uses money income before taxes and does not include capital gains or noncash benefits (such as public housing, Medicaid, and food stamps).`,
      dataTableTitle: 'Breakdown summary for people below the poverty line',
      timeSeriesData: true,
      metrics: {
        pct_rate: {
          metricId: 'poverty_pct_rate',
          chartTitle: 'People below the poverty line',
          trendsCardTitleName: 'Rates of poverty over time',
          columnTitleHeader: 'People below the poverty line',
          shortLabel: '% in poverty',
          type: 'pct_rate',
        },
        pct_share: {
          chartTitle: 'Share of poverty',
          metricId: 'poverty_pct_share',
          columnTitleHeader: 'Share of poverty',
          shortLabel: '% of impoverished',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Population vs. distribution of total people below the poverty line',
            metricId: 'poverty_population_pct',
            columnTitleHeader: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: 'pct_share',
          },
        },
        pct_relative_inequity: {
          chartTitle: 'Relative inequity for poverty',
          metricId: 'poverty_pct_relative_inequity',
          shortLabel: '% relative inequity',
          type: 'pct_relative_inequity',
        },
      },
    },
  ],
  preventable_hospitalizations: [
    {
      dataTypeId: 'preventable_hospitalizations',
      dataTypeShortLabel: 'Preventable hospitalizations',
      fullDisplayName: 'Preventable hospitalizations',
      fullDisplayNameInline: 'preventable hospitalizations',
      dataTypeDefinition: `Discharges following hospitalization for diabetes with short- or long-term complications, uncontrolled diabetes without complications, diabetes with lower-extremity amputation, chronic obstructive pulmonary disease, angina without a procedure, asthma, hypertension, heart failure, dehydration, bacterial pneumonia or urinary tract infection per 100,000 Medicare beneficiaries ages 18 and older continuously enrolled in Medicare fee-for-service Part A.`,
      dataTableTitle: 'Breakdown summary for preventable hospitalizations',
      metrics: {
        per100k: {
          metricId: 'preventable_hospitalizations_per_100k',
          chartTitle: 'Preventable hospitalizations',
          columnTitleHeader:
            'Preventable hospitalizations per 100k adult Medicare enrollees',
          shortLabel: 'cases per 100k',
          type: 'per100k',
        },
        pct_share: {
          chartTitle: 'Share of all preventable hospitalizations',
          metricId: 'preventable_hospitalizations_pct_share',
          columnTitleHeader: 'Share of all preventable hospitalizations',
          shortLabel: '% of hospitalizations',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Population vs. distribution of total preventable hospitalizations',
            metricId: 'ahr_population_pct',
            columnTitleHeader: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: 'pct_share',
          },
        },
      },
    },
  ],
  avoided_care: [
    {
      dataTypeId: 'avoided_care',
      dataTypeShortLabel: 'Avoided Care',
      fullDisplayName: 'Care avoidance due to cost',
      fullDisplayNameInline: 'care avoidance due to cost',
      dataTypeDefinition: `Adults who reported a time in the past 12 months when they needed to see a doctor but could not because of cost.`,
      surveyCollectedData: true,
      dataTableTitle: 'Breakdown summary for care avoidance due to cost',
      metrics: {
        pct_rate: {
          metricId: 'avoided_care_pct_rate',
          chartTitle: 'Care avoidance due to cost',
          columnTitleHeader: 'Care avoidance due to cost',
          shortLabel: '% avoided care',
          type: 'pct_rate',
        },
        pct_share: {
          chartTitle: 'Share of all care avoidance due to cost',
          metricId: 'avoided_care_pct_share',
          columnTitleHeader: 'Share of all care avoidance due to cost',
          shortLabel: '% of avoidances',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Population vs. distribution of total care avoidance due to cost',
            metricId: 'ahr_population_pct',
            columnTitleHeader: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: 'pct_share',
          },
        },
      },
    },
  ],
  asthma: [
    {
      dataTypeId: 'asthma',
      dataTypeShortLabel: 'Asthma',
      fullDisplayName: 'Asthma cases',
      fullDisplayNameInline: 'asthma cases',
      surveyCollectedData: true,
      dataTableTitle: 'Breakdown summary for asthma cases',
      dataTypeDefinition: `Adults who reported being told by a health professional that they currently have asthma.`,
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
  ],
  cardiovascular_diseases: [
    {
      dataTypeId: 'cardiovascular_diseases',
      dataTypeShortLabel: 'Cardiovascular diseases',
      fullDisplayName: 'Cases of cardiovascular diseases',
      fullDisplayNameInline: 'cases of cardiovascular diseases',
      surveyCollectedData: true,
      dataTableTitle: 'Breakdown summary for cases of cardiovascular diseases',
      dataTypeDefinition: `Adults who reported being told by a health professional that they had angina or coronary heart disease; a heart attack or myocardial infarction; or a stroke.`,
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
  ],
  chronic_kidney_disease: [
    {
      dataTypeId: 'chronic_kidney_disease',
      dataTypeShortLabel: 'Chronic kidney disease',
      surveyCollectedData: true,
      fullDisplayName: 'Cases of chronic kidney disease',
      fullDisplayNameInline: 'cases of chronic kidney disease',
      dataTypeDefinition: `Adults who reported being told by a health professional that they have kidney disease not including kidney stones, bladder infection or incontinence.`,
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
  ],
  voter_participation: [
    {
      dataTypeId: 'voter_participation',
      dataTypeShortLabel: 'Voter participation',
      fullDisplayName: 'Voter participation',
      fullDisplayNameInline: 'voter participation',
      surveyCollectedData: true,
      dataTableTitle: 'Breakdown summary for voter participation',
      dataTypeDefinition: `U.S. citizens ages 18 and older who voted in the last presidential election.`,
      metrics: {
        pct_rate: {
          metricId: 'voter_participation_pct_rate',
          columnTitleHeader: 'Voter Participation',
          chartTitle: 'Voter participation',
          shortLabel: '% voter participation',
          type: 'pct_rate',
        },
        pct_share: {
          chartTitle: 'Share of all voter participation',
          metricId: 'voter_participation_pct_share',
          columnTitleHeader: 'Share of all voter participation',
          shortLabel: '% of voters',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Population vs. distribution of total voter participation',
            metricId: 'ahr_population_pct',
            columnTitleHeader: populationPctTitle,
            shortLabel: populationPctShortLabel,
            type: 'pct_share',
          },
        },
      },
    },
  ],
  women_in_gov: [
    {
      dataTypeId: 'women_in_us_congress',
      dataTypeShortLabel: 'US Congress',
      fullDisplayName: 'Women in US Congress',
      surveyCollectedData: true,
      timeSeriesData: true,
      dataTypeDefinition: `Individuals identifying as women who have served in the Congress of the United States, including members of the U.S. Senate and members, territorial delegates, and resident commissioners of the U.S. House of Representatives. Women who self-identify as more than one race/ethnicity are included in the rates for each group with which they identify.`,
      dataTableTitle: 'Breakdown summary for Women in US Congress',
      metrics: {
        per100k: {
          metricId: 'pct_share_of_us_congress',
          trendsCardTitleName:
            'Yearly rates of US Congress members identifying as women',
          columnTitleHeader: 'Share of Congress for women of each race',
          chartTitle:
            'Current rates of US Congress members identifying as women',
          shortLabel: '% women in Congress',
          type: 'pct_share',
        },
        pct_share: {
          chartTitle: 'Percent share of women US Congress members',
          metricId: 'pct_share_of_women_us_congress',
          trendsCardTitleName:
            'Inequitable share of women in U.S. Congress over time',
          columnTitleHeader: 'Percent share of women US Congress members',
          shortLabel: '% of women members',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Population vs. distribution of total women in US congress',
            metricId: 'cawp_population_pct',
            columnTitleHeader: 'Total population share (all genders)',
            shortLabel: `${populationPctShortLabel} (all genders)`,
            type: 'pct_share',
          },
        },
        pct_relative_inequity: {
          chartTitle:
            'Relative racial inequity of women in US Congress over time',
          metricId: 'women_us_congress_pct_relative_inequity',
          shortLabel: '% relative inequity',
          type: 'pct_relative_inequity',
        },
      },
    },
    {
      dataTypeId: 'women_in_state_legislature',
      dataTypeShortLabel: 'State legislatures', // DATA TOGGLE
      fullDisplayName: 'Women in state legislatures', // TABLE TITLE,
      surveyCollectedData: true,
      timeSeriesData: true,
      dataTypeDefinition: `Individuals identifying as women currently serving in their state or territory’s legislature. Women who self-identify as more than one race/ethnicity are included in the rates for each group with which they identify.
      `,
      dataTableTitle: 'Breakdown summary for Women in state legislatures',
      metrics: {
        per100k: {
          metricId: 'pct_share_of_state_leg',
          chartTitle: 'Percentage of state legislators identifying as women',
          // MAP CARD HEADING, SIMPLE BAR TITLE, MAP INFO ALERT, TABLE COL HEADER, HI/LOW DROPDOWN FOOTNOTE
          trendsCardTitleName: 'Rates of women in state legislatures over time',
          columnTitleHeader: 'Percentage of women state legislators',
          shortLabel: '% women in state legislature', // SIMPLE BAR LEGEND, MAP LEGEND, INFO BOX IN MAP CARD
          type: 'pct_share',
        },
        pct_share: {
          chartTitle: 'Percent share of women state legislators', // UNKNOWNS MAP TITLE, DISPARITY BAR TITLE
          metricId: 'pct_share_of_women_state_leg',
          trendsCardTitleName:
            'Inequitable share of women in state legislatures over time',
          columnTitleHeader: 'Percent share of women state legislators',
          shortLabel: '% of women legislators', // DISPARITY BAR LEGEND
          unknownsVegaLabel: '% unknown race',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Population vs. distribution of total women in state legislatures',
            metricId: 'cawp_population_pct',
            columnTitleHeader: 'Total population share (all genders)', // TABLE COLUMN HEADER
            shortLabel: `${populationPctShortLabel} (all genders)`, // DISPARITY BAR LEGEND/AXIS
            type: 'pct_share',
          },
        },
        pct_relative_inequity: {
          chartTitle:
            'Relative racial inequity of women state legislators over time',
          metricId: 'women_state_leg_pct_relative_inequity',
          shortLabel: '% relative inequity',
          type: 'pct_relative_inequity',
        },
      },
    },
  ],
  incarceration: [
    {
      dataTypeId: 'prison',
      dataTypeShortLabel: 'Prison',
      fullDisplayName: 'People in prison',
      fullDisplayNameInline: 'people in prison',
      surveyCollectedData: true,
      timeSeriesData: true,
      dataTypeDefinition: `Individuals of any age, including children, under the jurisdiction of an adult prison facility. ‘Age’ reports at the national level include only the subset of this jurisdictional population who have been sentenced to one year or more, which accounted for 97% of the total U.S. prison population in 2020. For all national reports, this rate includes both state and federal prisons. For state and territory level reports, only the prisoners under the jurisdiction of that geography are included. For county level reports, Vera reports the
      number of people incarcerated under the jurisdiction of a state prison system on charges arising from a criminal case in that specific county, which are not available in every state. The county of court commitment is generally where a person was convicted; it is not necessarily the person’s county of residence, and may not even be the county where the crime was committed, but nevertheless is likely to be both.  AK, CT, DE, HI, RI, and VT each operate an integrated system that combines prisons and jails; in accordance with the data sources we include those facilities as adult prisons but not as local jails. Prisons are longer-term facilities run by the state or the federal government that typically hold felons and persons with sentences of more than one year. Definitions may vary by state.`,
      dataTableTitle: 'Breakdown summary for people in prison',
      metrics: {
        per100k: {
          metricId: 'prison_per_100k',
          chartTitle: 'Prison incarceration',
          trendsCardTitleName: 'Rates of prison incarceration over time',
          columnTitleHeader: 'People in prison per 100k',
          shortLabel: 'prison per 100k',
          type: 'per100k',
        },
        pct_share: {
          chartTitle: 'Percent share of total prison population',
          metricId: 'prison_pct_share',
          trendsCardTitleName:
            'Inequitable share of prison incarceration over time',
          columnTitleHeader: 'Percent share of total prison population',
          shortLabel: '% of prison pop.',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle: 'Population vs. distribution of total people in prison',
            metricId: 'incarceration_population_pct',
            columnTitleHeader: 'Total population share',
            shortLabel: populationPctShortLabel,
            type: 'pct_share',
          },
          knownBreakdownComparisonMetric: {
            chartTitle: '',
            metricId: 'prison_pct_share',
            columnTitleHeader: 'Percent share of total prison population',
            shortLabel: '% of total prison population',
            type: 'pct_share',
          },
        },
        pct_relative_inequity: {
          chartTitle: 'Relative inequity of prison incarceration over time',
          metricId: 'prison_pct_relative_inequity',
          shortLabel: '% relative inequity',
          type: 'pct_relative_inequity',
        },
      },
    },
    {
      dataTypeId: 'jail',
      dataTypeShortLabel: 'Jail',
      fullDisplayName: 'People in jail',
      fullDisplayNameInline: 'people in jail',
      surveyCollectedData: true,
      timeSeriesData: true,
      dataTypeDefinition: `Individuals of any age, including children, confined in a local, adult jail facility. AK, CT, DE, HI, RI, and VT each operate an integrated system that combines prisons and jails; in accordance with the data sources we include those facilities as adult prisons but not as local jails. Jails are locally operated short-term facilities that hold inmates awaiting trial or sentencing or both, and inmates sentenced to a term of less than one year, typically misdemeanants. Definitions may vary by state.`,
      dataTableTitle: 'Breakdown summary for people in jail',
      metrics: {
        per100k: {
          metricId: 'jail_per_100k',
          chartTitle: 'Jail incarceration',
          trendsCardTitleName: 'Rates of jail incarceration over time',
          columnTitleHeader: 'People in jail per 100k',
          shortLabel: 'jail per 100k',
          type: 'per100k',
        },
        pct_share: {
          chartTitle: 'Percent share of total jail population',
          metricId: 'jail_pct_share',
          trendsCardTitleName:
            'Inequitable share of jail incarceration over time',
          columnTitleHeader: 'Percent share of total jail population',
          shortLabel: '% of total jail population',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle: 'Population vs. distribution of total people in jail',
            metricId: 'incarceration_population_pct',
            columnTitleHeader: 'Total population share',
            shortLabel: populationPctShortLabel,
            type: 'pct_share',
          },
          knownBreakdownComparisonMetric: {
            chartTitle: '',
            metricId: 'jail_pct_share',
            columnTitleHeader: 'Percent share of total jail population',
            shortLabel: '% of total jail population',
            type: 'pct_share',
          },
        },
        pct_relative_inequity: {
          chartTitle: 'Relative inequity of jail incarceration over time',
          metricId: 'jail_pct_relative_inequity',
          shortLabel: '% relative inequity',
          type: 'pct_relative_inequity',
        },
      },
    },
  ],

  phrma_cardiovascular: [
    {
      dataTypeId: 'statins_adherence',
      dataTypeShortLabel: 'Adherence to Statins',
      fullDisplayName: 'Adherence to statins',
      surveyCollectedData: true,
      dataTypeDefinition: `Statins are medications that help lower cholesterol levels in the blood to reduce the risk of heart disease and stroke. “Adherence to statins” is measured as the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for statins during the measurement year.`,
      metrics: {
        pct_rate: {
          metricId: 'statins_adherence_pct_rate',
          chartTitle: 'Adherence to statins',
          shortLabel: '% adherent',
          type: 'pct_rate',
        },
        pct_share: {
          chartTitle: 'Percent share of total statins adherence',
          metricId: 'statins_adherence_pct_share',
          columnTitleHeader: 'Percent share of total statins adherence',
          shortLabel: '% of total adherence',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Share of statins beneficiary population vs. share of total adherence',
            metricId: 'statins_population_pct_share',
            columnTitleHeader: 'Share of all Medicare statins beneficiaries',
            shortLabel: '% of prescribed pop.',
            type: 'pct_share',
          },
        },
      },
    },
    {
      dataTypeId: 'beta_blockers_adherence',
      dataTypeShortLabel: 'Adherence to Beta-Blockers',
      fullDisplayName: 'Adherence to beta-blockers',
      surveyCollectedData: true,
      dataTypeDefinition: `Beta-blockers are medications that block the effects of adrenaline and help lower blood pressure, reduce heart rate, and manage conditions like hypertension and heart-related issues. “Adherence to beta-blockers” is measured as the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for beta-blockers during the measurement year.`,
      metrics: {
        pct_rate: {
          metricId: 'beta_blockers_adherence_pct_rate',
          chartTitle: 'Adherence to beta-blockers',
          shortLabel: '% adherent',
          type: 'pct_rate',
        },
        pct_share: {
          chartTitle: 'Percent share of total beta-blockers adherence',
          metricId: 'beta_blockers_adherence_pct_share',
          columnTitleHeader: 'Percent share of total beta-blockers adherence',
          shortLabel: '% of total adherence',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Share of beta-blockers beneficiary population vs. share of total adherence',
            metricId: 'beta_blockers_population_pct_share',
            columnTitleHeader:
              'Share of all Medicare beta-blockers beneficiaries',
            shortLabel: '% of prescribed pop.',
            type: 'pct_share',
          },
        },
      },
    },
    {
      dataTypeId: 'nqf_adherence',
      dataTypeShortLabel: 'Adherence to Beta-Blockers Post-Heart Attack',
      fullDisplayName:
        'Persistence of Beta-Blocker Treatment After a Heart Attack',
      surveyCollectedData: true,
      dataTypeDefinition: `Beta-blockers are medications that are used after an acute myocardial infarction (heart attack) to reduce the workload on the heart, lower blood pressure, and improve heart function by blocking the effects of adrenaline and stress hormones. Adherence on this report is measured as the percentage of Medicare fee-for-service beneficiaries 18 years of age and older during the measurement year who were hospitalized and discharged with a diagnosis of acute myocardial infarction (AMI) and who received persistent beta-blocker treatment for six months after discharge.`,
      metrics: {
        pct_rate: {
          metricId: 'nqf_adherence_pct_rate',
          chartTitle:
            'Persistence of Beta-Blocker Treatment After a Heart Attack',
          shortLabel: '% adherent',
          type: 'pct_rate',
        },
        pct_share: {
          chartTitle: 'Percent share of total adherence',
          metricId: 'nqf_adherence_pct_share',
          columnTitleHeader: 'Percent share of total adherence',
          shortLabel: '% of total adherence',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Share of beneficiary population vs. share of total adherence',
            metricId: 'nqf_population_pct_share',
            columnTitleHeader: 'Share of all Medicare beneficiaries',
            shortLabel: '% of prescribed pop.',
            type: 'pct_share',
          },
        },
      },
    },
    {
      dataTypeId: 'rasa_adherence',
      dataTypeShortLabel: 'Adherence to RAS-Antagonists',
      fullDisplayName: 'Adherence to RAS antagonists',
      surveyCollectedData: true,
      dataTypeDefinition: `
      Renin angiotensin system antagonists are medications that block the actions of certain hormones to regulate blood pressure and fluid balance in the body. “Adherence to RAS antagonists” is measured as percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for renin angiotensin system antagonists (RASA) during the measurement year.`,
      metrics: {
        pct_rate: {
          metricId: 'rasa_adherence_pct_rate',
          chartTitle: 'Adherence to RAS antagonists',
          shortLabel: '% adherent',
          type: 'pct_rate',
        },
        pct_share: {
          chartTitle: 'Percent share of total RAS antagonists adherence',
          metricId: 'rasa_adherence_pct_share',
          columnTitleHeader: 'Percent share of total RAS antagonists adherence',
          shortLabel: '% of total adherence',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Share of RASA beneficiary population vs. share of total adherence',
            metricId: 'rasa_population_pct_share',
            columnTitleHeader:
              'Share of all Medicare RAS antagonists beneficiaries',
            shortLabel: '% of prescribed pop.',
            type: 'pct_share',
          },
        },
      },
    },
    {
      dataTypeId: 'ccb_adherence',
      dataTypeShortLabel: 'Adherence to Calcium Channel Blockers',
      fullDisplayName: 'Adherence to calcium channel blockers',
      surveyCollectedData: true,
      dataTypeDefinition: `Calcium channel blockers are medications that relax and widen blood vessels, making it easier for the heart to pump blood and reducing blood pressure. “Adherence to calcium channel blockers” is measured as the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% for calcium channel blockers during the measurement year.`,
      metrics: {
        pct_rate: {
          metricId: 'ccb_adherence_pct_rate',
          chartTitle: 'Adherence to calcium channel blockers',
          shortLabel: '% adherent',
          type: 'pct_rate',
        },
        pct_share: {
          chartTitle:
            'Percent share of total calcium channel blockers adherence',
          metricId: 'ccb_adherence_pct_share',
          columnTitleHeader:
            'Percent share of total calcium channel blockers adherence',
          shortLabel: '% of total adherence',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Share of calcium channel blockers beneficiary population vs. share of total adherence',
            metricId: 'ccb_population_pct_share',
            columnTitleHeader:
              'Share of all Medicare calcium channel blockers beneficiaries',
            shortLabel: '% of prescribed pop.',
            type: 'pct_share',
          },
        },
      },
    },
    {
      dataTypeId: 'doac_adherence',
      dataTypeShortLabel: 'Adherence to Direct Oral Anticoagulants',
      fullDisplayName: 'Direct Oral Anticoagulants',
      surveyCollectedData: true,
      dataTypeDefinition: `Direct oral anticoagulants are medications that help prevent blood clot formation by inhibiting specific clotting factors, reducing the risk of stroke and blood clots in conditions such as atrial fibrillation and deep vein thrombosis. “Adherence to direct oral anticoagulants” is measured as the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80% during the measurement period for direct-acting oral anticoagulants.`,
      metrics: {
        pct_rate: {
          metricId: 'doac_adherence_pct_rate',
          chartTitle: 'Direct Oral Anticoagulants Adherence',
          shortLabel: '% adherent',
          type: 'pct_rate',
        },
        pct_share: {
          chartTitle:
            'Percent share of total Direct Oral Anticoagulants adherence',
          metricId: 'doac_adherence_pct_share',
          columnTitleHeader:
            'Percent share of total Direct Oral Anticoagulants adherence',
          shortLabel: '% of total adherence',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Share of Direct Oral Anticoagulants beneficiary population vs. share of total adherence',
            metricId: 'doac_population_pct_share',
            columnTitleHeader:
              'Share of all Medicare Direct Oral Anticoagulants beneficiaries',
            shortLabel: '% of prescribed pop.',
            type: 'pct_share',
          },
        },
      },
    },
    {
      dataTypeId: 'ami',
      dataTypeShortLabel: 'Heart Attacks (Acute MI)',
      fullDisplayName: 'Acute Myocardial Infarctions (Heart Attacks)',
      surveyCollectedData: true,
      dataTypeDefinition: `Acute myocardial infarctions, commonly known as heart attacks, occur when the blood flow to the heart muscle is severely blocked, leading to damage or death of the heart tissue. “Acute MI per 100k” is measured as the number of Medicare fee-for-service beneficiaries with a diagnosis of acute myocardial infarction (AMI) per 100K during the measurement period.`,
      metrics: {
        per100k: {
          metricId: 'ami_per_100k',
          chartTitle: 'Rates of Acute MI',
          shortLabel: 'Acute MI per 100k',
          type: 'per100k',
        },
        pct_share: {
          chartTitle: 'Percent share of total Acute MI',
          metricId: 'ami_pct_share',
          columnTitleHeader: 'Percent share of total Acute MI',
          shortLabel: '% of total Acute MI',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Share of beneficiary population vs. share of total Acute MI',
            metricId: 'phrma_population_pct_share',
            columnTitleHeader: 'Share of all beneficiaries',
            shortLabel: '% of beneficiary pop.',
            type: 'pct_share',
          },
        },
      },
    },
  ],
  phrma_hiv: [
    {
      dataTypeId: 'arv_adherence',
      dataTypeShortLabel: 'Medication Adherence (Antiretrovirals)',
      fullDisplayName: 'Adherence to antiretrovirals',
      surveyCollectedData: true,
      dataTypeDefinition: `HIV antiretrovirals are medications that help control the HIV virus by interfering with its replication process, reducing viral load, and improving the immune system's ability to fight the infection. “Adherence to antiretrovirals” is measured as the percentage of Medicare fee-for-service beneficiaries 18 years and older who met the Proportion of Days Covered (PDC) threshold of 90% for ≥3 antiretroviral medications during the measurement year.`,
      metrics: {
        pct_rate: {
          metricId: 'arv_adherence_pct_rate',
          chartTitle: 'Adherence to antiretrovirals',
          shortLabel: '% adherent',
          type: 'pct_rate',
        },
        pct_share: {
          chartTitle: 'Percent share of total antiretrovirals adherence',
          metricId: 'arv_adherence_pct_share',
          columnTitleHeader: 'Percent share of total antiretrovirals adherence',
          shortLabel: '% of total adherence',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Share of antiretrovirals beneficiary population vs. share of total adherence',
            metricId: 'arv_population_pct_share',
            columnTitleHeader:
              'Share of all Medicare antiretrovirals beneficiaries',
            shortLabel: '% of beneficiary pop.',
            type: 'pct_share',
          },
        },
      },
    },
    {
      dataTypeId: 'phrma_hiv',
      dataTypeShortLabel: 'Cases',
      fullDisplayName: 'HIV cases',
      surveyCollectedData: true,
      dataTypeDefinition: `The number of Medicare fee-for-service beneficiaries per 100K with a diagnosis of HIV during the measurement period.`,
      metrics: {
        per100k: {
          metricId: 'phrma_hiv_per_100k',
          chartTitle: 'Rates of HIV cases',
          shortLabel: 'cases per 100k',
          type: 'per100k',
        },
        pct_share: {
          chartTitle: 'Percent share of total HIV cases',
          metricId: 'phrma_hiv_pct_share',
          columnTitleHeader: 'Percent share of total HIV cases',
          shortLabel: '% of total HIV cases',
          type: 'pct_share',
          populationComparisonMetric: {
            chartTitle:
              'Share of beneficiary population vs. share of total HIV cases',
            metricId: 'phrma_population_pct_share',
            columnTitleHeader: 'Share of all beneficiaries',
            shortLabel: '% of beneficiary pop.',
            type: 'pct_share',
          },
        },
      },
    },
  ],
}
