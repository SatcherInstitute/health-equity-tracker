import { womenHigherIsWorseMapConfig } from '../../charts/mapGlobals'
import type { DataTypeConfig } from './MetricConfigTypes'

export const MATERNAL_HEALTH_CATEGORY_DROPDOWNIDS = [
  'maternal_mortality',
  'severe_maternal_morbidity',
] as const

export type MaternalHealthMetricId =
  | 'maternal_mortality_per_100k'
  | 'maternal_mortality_pct_share'
  | 'maternal_mortality_population_pct'
  | 'maternal_deaths_estimated_total'
  | 'live_births_estimated_total'
  // Severe maternal morbidity (AHR-sourced; served by AhrProvider).
  // Rate-only: AHR gives no delivery-count denominator by race, so there is no
  // valid pct_share / estimated_total for this measure.
  | 'severe_maternal_morbidity_per_100k'

export const MATERNAL_MORTALITY_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'maternal-health',
    dataTypeId: 'maternal_mortality',
    mapConfig: womenHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Maternal mortality',
    fullDisplayName: 'Maternal mortality',
    fullDisplayNameInline: 'maternal mortality',
    definition: {
      text: `Maternal deaths per 100,000 live births. Births were modeled using counts of live births among individuals aged 10 to 54 years between 1999 and 2019. Deaths were modeled from death certificate data for pregnant or recently pregnant individuals aged 10 to 54 years. Maternal deaths are coded as deaths that occurred up to 1 year after the end of pregnancy and were coded with the use of the US standard pregnancy question and/or a specific International Statistical Classification of Diseases and Related Health Problems codes.`,
    },
    dataTableTitle: 'Summary for maternal mortality',
    ageSubPopulationLabel: 'Ages 10-54',
    otherSubPopulationLabel: 'New Mothers',

    metrics: {
      per100k: {
        timeSeriesCadence: 'yearly',
        metricId: 'maternal_mortality_per_100k',
        chartTitle: 'Maternal mortality',
        trendsCardTitleName: 'Rates of maternal mortality over time',
        columnTitleHeader: 'Maternal mortality',
        shortLabel: 'deaths per 100k live births',
        type: 'per100k',
        rateNumeratorMetric: {
          metricId: 'maternal_deaths_estimated_total',
          shortLabel: 'Maternal deaths',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'live_births_estimated_total',
          shortLabel: 'Live births',
          chartTitle: '',
          type: 'count',
        },
      },
      pct_share: {
        chartTitle: 'Share of maternal mortality',
        metricId: 'maternal_mortality_pct_share',
        columnTitleHeader: 'Share of total maternal deaths',
        shortLabel: '% of maternal deaths',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle: 'Population vs. distribution of total maternal mortality',
          metricId: 'maternal_mortality_population_pct',
          columnTitleHeader: 'Share of live births population',
          shortLabel: '% of live births population',
          type: 'pct_share',
        },
      },
    },
  },
]

export const SEVERE_MATERNAL_MORBIDITY_METRICS: DataTypeConfig[] = [
  {
    // Severe maternal morbidity, sourced from AHR (measure 18022 + race/age
    // variants) and served by AhrProvider, not MaternalMortalityProvider.
    // Rate-only — see MaternalHealthMetricId note on the absent denominator.
    categoryId: 'maternal-health',
    dataTypeId: 'severe_maternal_morbidity',
    mapConfig: womenHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Severe maternal morbidity',
    fullDisplayName: 'Severe maternal morbidity',
    fullDisplayNameInline: 'severe maternal morbidity',
    surveyCollectedData: true,
    definition: {
      text: `Significant, life-threatening complications during delivery — the unexpected outcomes of labor and delivery that result in serious short- or long-term consequences to a woman's health. Identified from delivery hospitalization records using the CDC's set of indicators (e.g., eclampsia, hysterectomy, sepsis, acute renal failure). Often described as "near misses," these are the non-fatal counterpart to maternal mortality and are roughly 100 times more common. America's Health Rankings reports this measure per 10,000 delivery hospitalizations; it is shown here per 100,000 for consistency with other tracker rates.`,
      citations: [
        {
          url: 'https://www.americashealthrankings.org/explore/measures/maternal_morbidity',
          shortLabel: 'AHR',
          longerTitle: "America's Health Rankings",
        },
      ],
    },
    dataTableTitle: 'Summary for severe maternal morbidity',
    metrics: {
      per100k: {
        timeSeriesCadence: 'yearly',
        metricId: 'severe_maternal_morbidity_per_100k',
        chartTitle: 'Severe maternal morbidity',
        trendsCardTitleName: 'Rates of severe maternal morbidity over time',
        columnTitleHeader: 'Severe maternal morbidity',
        shortLabel: 'cases per 100k deliveries',
        type: 'per100k',
      },
    },
  },
]
