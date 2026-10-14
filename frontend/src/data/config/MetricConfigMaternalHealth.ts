import { womenHigherIsWorseMapConfig } from '../../charts/mapGlobals'
import {
  AIAN_NH,
  ASIAN_NH,
  FEMALE,
  MALE,
  MULTI_NH,
  NHPI_NH,
  OTHER_NONSTANDARD_NH,
  RACE,
  SEX,
} from '../utils/Constants'
import type { DataTypeConfig } from './MetricConfigTypes'

export const MATERNAL_HEALTH_CATEGORY_DROPDOWNIDS = [
  'maternal_mortality',
  'severe_maternal_morbidity',
  'infant_mortality',
  'low_birthweight',
  'low_risk_cesarean',
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
  // Birth outcomes (AHR-sourced, from CDC natality and linked birth/infant death
  // files). Rate-only for the same reason: no live-birth denominator by race.
  | 'infant_mortality_per_100k'
  | 'low_birthweight_pct_rate'
  | 'low_risk_cesarean_pct_rate'

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
      text: `Significant, life-threatening complications during delivery — the unexpected outcomes of labor and delivery that result in serious short- or long-term consequences to women and birthing people's health. Identified from delivery hospitalization records using the CDC's set of indicators (e.g., eclampsia, hysterectomy, sepsis, acute renal failure). Often described as "near misses," these are the non-fatal counterpart to maternal mortality and are roughly 100 times more common.`,
      citations: [
        {
          url: 'https://www.americashealthrankings.org/explore/measures/severe_maternal_morbidity',
          shortLabel: 'AHR',
          longerTitle: "America's Health Rankings",
        },
      ],
    },
    dataTableTitle: 'Summary for severe maternal morbidity',
    // No ageSubPopulationLabel on purpose. AHR bounds this measure by the
    // delivery hospitalization, not by age, and its own age buckets are open at
    // both ends (<20 through 35+), so any "Ages X-Y" here would be invented.
    // The sibling maternal_mortality label is real: that source models ages 10-54.
    otherSubPopulationLabel: 'Birthing People',
    // AHR reports a combined Asian/Pacific Islander group (hidden centrally via
    // AHR_API_NH_METRICS) and no multiracial group for this measure. Sex is only
    // reachable in compare mode, where the shared sex file would show empty rows.
    excludedDemographicGroups: { [RACE]: [MULTI_NH], [SEX]: [FEMALE, MALE] },
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

// The three birth-outcome topics below come from AHR and share its rate-only,
// state-and-national shape with severe maternal morbidity. Their race and age
// groups describe the person giving birth, not the infant, so the definitions
// say so. None sets ageSubPopulationLabel: the overall rate covers every live
// birth, while the age groups only span 15-44.

export const INFANT_MORTALITY_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'maternal-health',
    dataTypeId: 'infant_mortality',
    mapConfig: womenHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Infant mortality',
    fullDisplayName: 'Infant mortality',
    fullDisplayNameInline: 'infant mortality',
    definition: {
      text: `Deaths of infants before their first birthday per 100,000 live births. AHR reports this rate per 1,000 live births and pools two years of data, so each year shown is the second year of a two-year window (for example, 2022 covers 2021-2022). Race, ethnicity, and age groups describe the person giving birth; sex is the infant's sex.`,
      citations: [
        {
          url: 'https://www.americashealthrankings.org/explore/measures/IMR_MCH',
          shortLabel: 'AHR',
          longerTitle: "America's Health Rankings",
        },
      ],
    },
    dataTableTitle: 'Summary for infant mortality',
    otherSubPopulationLabel: 'Live Births',
    // AHR reports split Asian and Native Hawaiian/Pacific Islander groups and no
    // "other race" group for this measure.
    excludedDemographicGroups: { [RACE]: [OTHER_NONSTANDARD_NH] },
    metrics: {
      per100k: {
        timeSeriesCadence: 'yearly',
        metricId: 'infant_mortality_per_100k',
        chartTitle: 'Infant mortality',
        trendsCardTitleName: 'Rates of infant mortality over time',
        columnTitleHeader: 'Infant mortality',
        shortLabel: 'deaths per 100k live births',
        type: 'per100k',
      },
    },
  },
]

export const LOW_BIRTHWEIGHT_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'maternal-health',
    dataTypeId: 'low_birthweight',
    mapConfig: womenHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Low birthweight',
    fullDisplayName: 'Low birthweight',
    fullDisplayNameInline: 'low birthweight',
    definition: {
      text: `Live births weighing less than 2,500 grams (about 5.5 pounds), as a percentage of all live births. Race, ethnicity, and age groups describe the person giving birth.`,
      citations: [
        {
          url: 'https://www.americashealthrankings.org/explore/measures/birthweight',
          shortLabel: 'AHR',
          longerTitle: "America's Health Rankings",
        },
      ],
    },
    dataTableTitle: 'Summary for low birthweight',
    otherSubPopulationLabel: 'Live Births',
    excludedDemographicGroups: {
      [RACE]: [OTHER_NONSTANDARD_NH],
      [SEX]: [FEMALE, MALE],
    },
    metrics: {
      pct_rate: {
        timeSeriesCadence: 'yearly',
        metricId: 'low_birthweight_pct_rate',
        chartTitle: 'Low birthweight',
        trendsCardTitleName: 'Rates of low birthweight over time',
        columnTitleHeader: 'Low birthweight',
        shortLabel: '% of live births',
        type: 'pct_rate',
      },
    },
  },
]

export const LOW_RISK_CESAREAN_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'maternal-health',
    dataTypeId: 'low_risk_cesarean',
    mapConfig: womenHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Low-risk cesarean delivery',
    fullDisplayName: 'Low-risk cesarean delivery',
    fullDisplayNameInline: 'low-risk cesarean delivery',
    definition: {
      text: `Cesarean deliveries among low-risk first births, as a percentage of those births. A low-risk first birth is a single baby, born at term (37 or more completed weeks) in the head-first position, to someone giving birth for the first time. Because these births carry little medical risk, this rate is a common measure of potentially unnecessary cesareans.`,
      citations: [
        {
          url: 'https://www.americashealthrankings.org/explore/measures/low_risk_cesarean',
          shortLabel: 'AHR',
          longerTitle: "America's Health Rankings",
        },
      ],
    },
    dataTableTitle: 'Summary for low-risk cesarean delivery',
    otherSubPopulationLabel: 'Low-Risk First Births',
    // AHR reports this measure for Black, Hispanic, and white births only.
    excludedDemographicGroups: {
      [RACE]: [AIAN_NH, ASIAN_NH, NHPI_NH, MULTI_NH, OTHER_NONSTANDARD_NH],
      [SEX]: [FEMALE, MALE],
    },
    metrics: {
      pct_rate: {
        timeSeriesCadence: 'yearly',
        metricId: 'low_risk_cesarean_pct_rate',
        chartTitle: 'Low-risk cesarean delivery',
        trendsCardTitleName: 'Rates of low-risk cesarean delivery over time',
        columnTitleHeader: 'Low-risk cesarean delivery',
        shortLabel: '% of low-risk first births',
        type: 'pct_rate',
      },
    },
  },
]
