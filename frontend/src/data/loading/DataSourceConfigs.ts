import { getParentDropdownFromDataTypeId } from '../../utils/MadLibs'
import type { DatasetId } from '../config/DatasetMetadata'
import {
  AHR_DECADE_PLUS_5_AGE_METRICS,
  AHR_METRICS,
  AHR_VOTER_AGE_METRICS,
  BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS,
  CHR_DATATYPE_IDS,
} from '../config/MetricConfigBehavioralHealth'
import {
  BLACK_WOMEN_METRICS,
  HIV_METRICS,
} from '../config/MetricConfigHivCategory'
import { CAWP_METRICS } from '../config/MetricConfigPDOH'
import { PHRMA_METRICS } from '../config/MetricConfigPhrma'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import type { DataSourceConfig } from '../providers/UniversalProvider'
import type { GeographicBreakdown } from '../query/Breakdowns'
import type { MetricQuery } from '../query/MetricQuery'
import type { HetRow } from '../utils/DatasetTypes'
import { addAcsIdToConsumed } from '../utils/datasetutils'

// ── ACS Condition ────────────────────────────────────────────────────────────

export const ACS_CONDITION_METRICS: MetricId[] = [
  'uninsured_population_pct',
  'uninsured_pct_rate',
  'uninsured_pct_share',
  'uninsured_pct_relative_inequity',
  'poverty_population_pct',
  'poverty_pct_rate',
  'poverty_pct_share',
  'poverty_pct_relative_inequity',
  'uninsured_estimated_total',
  'uninsured_pop_estimated_total',
  'poverty_estimated_total',
  'poverty_pop_estimated_total',
]

export const ACS_CONDITION_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'acs_condition' }),

  allowsBreakdowns: (breakdowns) =>
    ['county', 'state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

// ── AHR / CHR ─────────────────────────────────────────────────────────────────

function getAhrDatasetDetails(metricQuery: MetricQuery) {
  const { dataTypeId, breakdowns } = metricQuery
  if (
    dataTypeId &&
    CHR_DATATYPE_IDS.includes(dataTypeId) &&
    breakdowns.geography === 'county'
  )
    return { isChr: true, categoryPrefix: '' }
  const currentDropdown =
    dataTypeId && getParentDropdownFromDataTypeId(dataTypeId)
  const isBehavioralHealth =
    currentDropdown &&
    BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS.includes(currentDropdown as any)
  return {
    isChr: false,
    categoryPrefix: isBehavioralHealth
      ? 'behavioral_health_'
      : 'non-behavioral_health_',
  }
}

export const AHR_PROVIDER_METRICS: MetricId[] = [
  'ahr_population_pct',
  ...AHR_METRICS,
  ...AHR_VOTER_AGE_METRICS,
  ...AHR_DECADE_PLUS_5_AGE_METRICS,
  'chr_population_pct',
]

export const AHR_CONFIG: DataSourceConfig = {
  getDatasetDetails: (metricQuery) => {
    const { isChr, categoryPrefix } = getAhrDatasetDetails(metricQuery)
    return {
      datasetName: isChr ? 'chr_data' : 'graphql_ahr_data',
      tablePrefix: isChr ? '' : categoryPrefix,
    }
  },

  allowsBreakdowns: (breakdowns, dataTypeId) => {
    const isValidCountyRequest =
      breakdowns.geography === 'county' &&
      !!dataTypeId &&
      CHR_DATATYPE_IDS.includes(dataTypeId)
    return (
      (isValidCountyRequest ||
        breakdowns.geography === 'state' ||
        breakdowns.geography === 'national') &&
      breakdowns.hasExactlyOneDemographic()
    )
  },
}

// ── CAWP ─────────────────────────────────────────────────────────────────────

export { CAWP_METRICS }

export const CAWP_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'cawp_data' }),
  getConsumedDatasetIds: (mainId, metricQuery, breakdowns) => {
    const consumedDatasetIds: DatasetId[] = [mainId]
    if (
      (metricQuery.metricIds.includes('cawp_population_pct') ||
        metricQuery.metricIds.includes(
          'women_us_congress_pct_relative_inequity',
        ) ||
        metricQuery.metricIds.includes(
          'women_state_leg_pct_relative_inequity',
        )) &&
      !breakdowns.filterFips?.isIslandArea()
    ) {
      addAcsIdToConsumed(metricQuery, consumedDatasetIds)
    }
    if (metricQuery.metricIds.includes('pct_share_of_us_congress')) {
      consumedDatasetIds.push('the_unitedstates_project')
    }
    return consumedDatasetIds
  },
  allowsBreakdowns: (breakdowns, dataTypeId) => {
    const isValidCountyRequest =
      breakdowns.geography === 'county' && dataTypeId === 'women_in_us_congress'
    return (
      (isValidCountyRequest ||
        breakdowns.geography === 'state' ||
        breakdowns.geography === 'national') &&
      breakdowns.hasExactlyOneDemographic()
    )
  },
  islandAreaPopulation: {
    demographic: 'race_and_ethnicity',
    geography: 'state',
    includeHistorical: true,
  },
}

// ── CDC Cancer ────────────────────────────────────────────────────────────────

export const CDC_CANCER_METRICS: MetricId[] = [
  'breast_per_100k',
  'breast_per_100k_is_suppressed',
  'breast_estimated_total',
  'breast_population_pct',
  'breast_population_estimated_total',
  'breast_pct_share',
  'breast_pct_relative_inequity',
  'cervical_per_100k',
  'cervical_per_100k_is_suppressed',
  'cervical_estimated_total',
  'cervical_population_pct',
  'cervical_population_estimated_total',
  'cervical_pct_share',
  'cervical_pct_relative_inequity',
  'prostate_per_100k',
  'prostate_per_100k_is_suppressed',
  'prostate_estimated_total',
  'prostate_population_pct',
  'prostate_population_estimated_total',
  'prostate_pct_share',
  'prostate_pct_relative_inequity',
  'colorectal_per_100k',
  'colorectal_per_100k_is_suppressed',
  'colorectal_estimated_total',
  'colorectal_population_pct',
  'colorectal_population_estimated_total',
  'colorectal_pct_share',
  'colorectal_pct_relative_inequity',
  'lung_per_100k',
  'lung_per_100k_is_suppressed',
  'lung_estimated_total',
  'lung_population_pct',
  'lung_population_estimated_total',
  'lung_pct_share',
  'lung_pct_relative_inequity',
]

export const CDC_CANCER_CONFIG: DataSourceConfig = {
  getDatasetDetails: ({ breakdowns }) => ({
    datasetName:
      breakdowns.geography === 'county' ? 'nci_cancer' : 'cdc_wonder_data',
  }),

  allowsBreakdowns: (breakdowns) =>
    ['county', 'state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
  skipFipsAppend: true,
}

// ── CDC Covid ────────────────────────────────────────────────────────────────

export const CDC_COVID_METRICS: MetricId[] = [
  'covid_cases',
  'covid_deaths',
  'covid_hosp',
  'covid_cases_share',
  'covid_deaths_share',
  'covid_hosp_share',
  'covid_cases_share_of_known',
  'covid_deaths_share_of_known',
  'covid_hosp_share_of_known',
  'covid_deaths_per_100k',
  'covid_cases_per_100k',
  'covid_hosp_per_100k',
  'death_ratio_age_adjusted',
  'hosp_ratio_age_adjusted',
  'cases_ratio_age_adjusted',
  'covid_population_pct',
  'covid_cases_pct_relative_inequity',
  'covid_deaths_pct_relative_inequity',
  'covid_hosp_pct_relative_inequity',
]

export const CDC_COVID_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'cdc_restricted_data' }),
  getConsumedDatasetIds: (mainId, metricQuery, breakdowns) => {
    const consumedDatasetIds: DatasetId[] = [mainId]
    if (!breakdowns.filterFips?.isIslandArea()) {
      addAcsIdToConsumed(metricQuery, consumedDatasetIds)
    }
    return consumedDatasetIds
  },
  allowsBreakdowns: (breakdowns) => breakdowns.hasExactlyOneDemographic(),
  islandAreaPopulation: { demographic: 'by_query', geography: 'by_query' },
}

// ── Geo Context ───────────────────────────────────────────────────────────────

const acsDatasetMap: Partial<Record<GeographicBreakdown, DatasetId>> = {
  county: 'acs_population-sex_county_current',
  state: 'acs_population-sex_state_current',
  national: 'acs_population-sex_national_current',
}

const decia2020DatasetMap: Partial<Record<GeographicBreakdown, DatasetId>> = {
  county: 'decia_2020_territory_population-sex_county_current',
  state: 'decia_2020_territory_population-sex_state_current',
  national: 'acs_population-sex_national_current',
}

// GEO_CONTEXT_CONFIG intentionally does not use islandAreaPopulation: it needs
// per-metric dataset selection (population vs SVI) and national-level handling
// that the shared helper doesn't cover.
export const GEO_CONTEXT_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'geo_context' }),
  getConsumedDatasetIds: (mainId, metricQuery, breakdowns) => {
    const consumedDatasetIds: DatasetId[] = []
    if (breakdowns.geography === 'county') consumedDatasetIds.push(mainId)
    if (metricQuery.metricIds.includes('population')) {
      const datasetMap = breakdowns.filterFips?.isIslandArea()
        ? decia2020DatasetMap
        : acsDatasetMap
      const populationId = datasetMap[breakdowns.geography]
      if (populationId) consumedDatasetIds.push(populationId)
    }
    return consumedDatasetIds
  },
  allowsBreakdowns: (breakdowns) =>
    ['county', 'state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasNoDemographicBreakdown(),
}

// ── Gun Violence ──────────────────────────────────────────────────────────────

const GUN_HOMICIDE_METRIC_IDS: MetricId[] = [
  'gun_violence_homicide_estimated_total',
  'gun_violence_homicide_pct_relative_inequity',
  'gun_violence_homicide_pct_share',
  'gun_violence_homicide_per_100k',
  'gun_violence_homicide_per_100k_is_suppressed',
]
const GUN_SUICIDE_METRIC_IDS: MetricId[] = [
  'gun_violence_suicide_estimated_total',
  'gun_violence_suicide_pct_relative_inequity',
  'gun_violence_suicide_pct_share',
  'gun_violence_suicide_per_100k',
  'gun_violence_suicide_per_100k_is_suppressed',
]
const GUN_DEATHS_METRIC_IDS: MetricId[] = [
  'gun_deaths_estimated_total',
  'gun_deaths_pct_relative_inequity',
  'gun_deaths_pct_share',
  'gun_deaths_per_100k',
  'gun_deaths_per_100k_is_suppressed',
]
const POPULATION_METRIC_IDS: MetricId[] = [
  'fatal_population_pct',
  'fatal_population',
]
export const GUN_VIOLENCE_METRIC_IDS: MetricId[] = [
  ...GUN_HOMICIDE_METRIC_IDS,
  ...GUN_SUICIDE_METRIC_IDS,
  ...GUN_DEATHS_METRIC_IDS,
  ...POPULATION_METRIC_IDS,
  'gun_violence_legal_intervention_estimated_total',
]

function isChrGunRequest(metricQuery: {
  dataTypeId?: DataTypeId
  breakdowns: { geography: string }
}) {
  return (
    metricQuery.dataTypeId === 'gun_deaths' &&
    metricQuery.breakdowns.geography === 'county'
  )
}

export const GUN_VIOLENCE_CONFIG: DataSourceConfig = {
  getDatasetDetails: (metricQuery) => {
    const isMiovd =
      (metricQuery.dataTypeId === 'gun_violence_homicide' ||
        metricQuery.dataTypeId === 'gun_violence_suicide') &&
      metricQuery.breakdowns.geography === 'county'
    const datasetName = isMiovd
      ? 'cdc_miovd_data'
      : isChrGunRequest(metricQuery)
        ? 'chr_data'
        : 'cdc_wisqars_data'
    return { datasetName }
  },

  allowsBreakdowns: (breakdowns) =>
    ['county', 'state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
  transformRows: (rows, metricQuery) => {
    if (!isChrGunRequest(metricQuery)) return rows as HetRow[]
    return rows.map(
      ({ chr_population_pct, chr_population_estimated_total, ...rest }) => ({
        ...rest,
        fatal_population_pct: chr_population_pct,
        fatal_population: chr_population_estimated_total,
      }),
    )
  },
}

// ── Gun Violence Youth ────────────────────────────────────────────────────────

const GUN_DEATHS_YOUTH_METRIC_IDS: MetricId[] = [
  'gun_deaths_youth_estimated_total',
  'gun_deaths_youth_pct_relative_inequity',
  'gun_deaths_youth_pct_share',
  'gun_deaths_youth_per_100k',
  'gun_deaths_youth_per_100k_is_suppressed',
  'gun_deaths_youth_population',
  'gun_deaths_youth_population_pct',
]
const GUN_DEATHS_YOUNG_ADULTS_METRIC_IDS: MetricId[] = [
  'gun_deaths_young_adults_estimated_total',
  'gun_deaths_young_adults_pct_relative_inequity',
  'gun_deaths_young_adults_pct_share',
  'gun_deaths_young_adults_per_100k',
  'gun_deaths_young_adults_per_100k_is_suppressed',
  'gun_deaths_young_adults_population',
  'gun_deaths_young_adults_population_pct',
]
export const GUN_VIOLENCE_YOUTH_METRIC_IDS: MetricId[] = [
  ...GUN_DEATHS_YOUTH_METRIC_IDS,
  ...GUN_DEATHS_YOUNG_ADULTS_METRIC_IDS,
]

export const GUN_VIOLENCE_YOUTH_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({
    datasetName: 'cdc_wisqars_youth_data',
    tablePrefix: 'youth_by_',
  }),

  allowsBreakdowns: (breakdowns) =>
    ['state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

// ── Gun Deaths Black Men ──────────────────────────────────────────────────────

export const GUN_DEATHS_BLACK_MEN_METRIC_IDS: MetricId[] = [
  'gun_homicides_black_men_estimated_total',
  'gun_homicides_black_men_pct_relative_inequity',
  'gun_homicides_black_men_pct_share',
  'gun_homicides_black_men_per_100k',
  'gun_homicides_black_men_per_100k_is_suppressed',
  'gun_homicides_black_men_population_estimated_total',
  'gun_homicides_black_men_population_pct',
]

export const GUN_DEATHS_BLACK_MEN_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({
    datasetName: 'cdc_wisqars_black_men_data',
    tablePrefix: 'black_men_by_',
  }),

  allowsBreakdowns: (breakdowns) =>
    ['state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

// ── HIV Black Women ───────────────────────────────────────────────────────────

export { BLACK_WOMEN_METRICS }

export const HIV_BLACK_WOMEN_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({
    datasetName: 'cdc_hiv_data',
    tablePrefix: 'black_women_by_',
  }),

  allowsBreakdowns: (breakdowns) =>
    ['state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

// ── HIV ───────────────────────────────────────────────────────────────────────

export { HIV_METRICS }

export const HIV_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'cdc_hiv_data' }),

  allowsBreakdowns: (breakdowns, dataTypeId) => {
    const hasNoCountyData = dataTypeId === 'hiv_deaths'
    return hasNoCountyData
      ? ['state', 'national'].includes(breakdowns.geography) &&
          breakdowns.hasExactlyOneDemographic()
      : ['county', 'state', 'national'].includes(breakdowns.geography) &&
          breakdowns.hasExactlyOneDemographic()
  },
}

// ── Incarceration ─────────────────────────────────────────────────────────────

export const INCARCERATION_METRIC_IDS: MetricId[] = [
  'jail_pct_share',
  'jail_estimated_total',
  'jail_per_100k',
  'jail_pct_relative_inequity',
  'prison_pct_share',
  'prison_estimated_total',
  'prison_per_100k',
  'prison_pct_relative_inequity',
  'confined_children_estimated_total',
  'incarceration_population_pct',
  'incarceration_population_estimated_total',
]

export const INCARCERATION_CONFIG: DataSourceConfig = {
  getDatasetDetails: ({ breakdowns }) => ({
    datasetName:
      breakdowns.geography === 'county'
        ? 'vera_incarceration_county'
        : 'bjs_incarceration_data',
  }),
  getConsumedDatasetIds: (mainId, metricQuery, breakdowns) => {
    const consumedDatasetIds: DatasetId[] = [mainId]
    if (
      breakdowns.geography !== 'county' &&
      !breakdowns.filterFips?.isIslandArea()
    ) {
      addAcsIdToConsumed(metricQuery, consumedDatasetIds)
    }
    return consumedDatasetIds
  },
  allowsBreakdowns: (breakdowns) =>
    ['national', 'state', 'county'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
  islandAreaPopulation: {
    demographic: 'sex',
    geography: 'state',
    includeAllStatesView: true,
    includeHistorical: true,
  },
}

// ── Maternal Mortality ────────────────────────────────────────────────────────

export const MATERNAL_MORTALITY_METRIC_IDS: MetricId[] = [
  'maternal_mortality_per_100k',
  'maternal_mortality_pct_share',
  'maternal_mortality_population_pct',
  'maternal_deaths_estimated_total',
  'live_births_estimated_total',
]

export const MATERNAL_MORTALITY_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'maternal_mortality_data' }),

  allowsBreakdowns: (breakdowns) =>
    ['state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

// ── Phrma BRFSS ───────────────────────────────────────────────────────────────

export const PHRMA_BRFSS_METRICS: MetricId[] = [
  'breast_screened_estimated_total',
  'breast_screening_eligible_estimated_total',
  'breast_screened_pct_rate',
  'breast_screened_pct_share',
  'breast_screening_eligible_population_pct',
  'breast_screened_ratio_age_adjusted',
  'cervical_screened_estimated_total',
  'cervical_screening_eligible_estimated_total',
  'cervical_screened_pct_rate',
  'cervical_screened_pct_share',
  'cervical_screening_eligible_population_pct',
  'cervical_screened_ratio_age_adjusted',
  'colorectal_screened_estimated_total',
  'colorectal_screening_eligible_estimated_total',
  'colorectal_screened_pct_rate',
  'colorectal_screened_pct_share',
  'colorectal_screening_eligible_population_pct',
  'colorectal_screened_ratio_age_adjusted',
  'lung_screened_estimated_total',
  'lung_screening_eligible_estimated_total',
  'lung_screened_pct_rate',
  'lung_screened_pct_share',
  'lung_screening_eligible_population_pct',
  'lung_screened_ratio_age_adjusted',
  'prostate_screened_estimated_total',
  'prostate_screening_eligible_estimated_total',
  'prostate_screened_pct_rate',
  'prostate_screened_pct_share',
  'prostate_screening_eligible_population_pct',
  'prostate_screened_ratio_age_adjusted',
]

export const PHRMA_BRFSS_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'phrma_brfss_data' }),

  allowsBreakdowns: (breakdowns) =>
    ['state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

// ── Phrma ─────────────────────────────────────────────────────────────────────

export { PHRMA_METRICS }

export const PHRMA_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'phrma_data' }),

  allowsBreakdowns: (breakdowns) =>
    ['county', 'state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

// ── Vaccine ───────────────────────────────────────────────────────────────────

const vaccineDatasetNameMappings: Record<GeographicBreakdown, string> = {
  national: 'cdc_vaccination_national',
  state: 'kff_vaccination',
  territory: 'kff_vaccination',
  'state/territory': 'kff_vaccination',
  county: 'cdc_vaccination_county',
}

export const VACCINE_METRICS: MetricId[] = [
  'acs_vaccinated_pop_pct',
  'vaccinated_pct_share',
  'vaccinated_pct_rate',
  'vaccinated_pop_pct',
  'vaccinated_estimated_total',
]

export const VACCINE_CONFIG: DataSourceConfig = {
  getDatasetDetails: ({ breakdowns }) => ({
    datasetName: vaccineDatasetNameMappings[breakdowns.geography],
  }),
  getConsumedDatasetIds: (mainId, metricQuery) => {
    const consumedDatasetIds: DatasetId[] = [mainId]
    addAcsIdToConsumed(metricQuery, consumedDatasetIds)
    return consumedDatasetIds
  },
  allowsBreakdowns: (breakdowns) =>
    ['national', 'state', 'county'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
  islandAreaPopulation: {
    demographic: 'race_and_ethnicity',
    geography: 'state',
    includeAllStatesView: true,
  },
}
