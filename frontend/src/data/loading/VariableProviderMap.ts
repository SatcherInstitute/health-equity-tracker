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
import UniversalProvider from '../providers/UniversalProvider'
import type VariableProvider from '../providers/VariableProvider'
import type { GeographicBreakdown } from '../query/Breakdowns'
import type { MetricQuery } from '../query/MetricQuery'
import { dropRecentPartialMonth } from '../utils/DatasetTimeUtils'
import type { HetRow } from '../utils/DatasetTypes'
import { addAcsIdToConsumed } from '../utils/datasetutils'

export type ProviderId =
  | 'acs_condition_provider'
  | 'acs_pop_provider'
  | 'ahr_provider'
  | 'cawp_provider'
  | 'cdc_cancer_provider'
  | 'cdc_covid_provider'
  | 'covid_provider'
  | 'geo_context_provider'
  | 'gun_violence_provider'
  | 'gun_violence_youth_provider'
  | 'gun_violence_black_men_provider'
  | 'hiv_black_women_provider'
  | 'hiv_provider'
  | 'incarceration_provider'
  | 'maternal_mortality_provider'
  | 'phrma_provider'
  | 'phrma_brfss_provider'
  | 'vaccine_provider'

// ── ACS Condition ────────────────────────────────────────────────────────────

const ACS_CONDITION_METRICS: MetricId[] = [
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

const ACS_CONDITION_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'acs_condition' }),
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns) =>
    ['county', 'state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

// ── AHR / CHR ─────────────────────────────────────────────────────────────────

const CHR_METRICS: MetricId[] = [
  'suicide_per_100k',
  'voter_participation_pct_rate',
  'diabetes_per_100k',
  'excessive_drinking_pct_rate',
  'frequent_mental_distress_per_100k',
  'preventable_hospitalizations_per_100k',
  'chr_population_pct',
]

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

const AHR_CONFIG: DataSourceConfig = {
  getDatasetDetails: (metricQuery) => {
    const { isChr, categoryPrefix } = getAhrDatasetDetails(metricQuery)
    return {
      datasetName: isChr ? 'chr_data' : 'graphql_ahr_data',
      tablePrefix: isChr ? '' : categoryPrefix,
    }
  },
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns, metricIds) => {
    const isValidCountyRequest =
      breakdowns.geography === 'county' &&
      metricIds?.some((id) => CHR_METRICS.includes(id))
    return (
      (isValidCountyRequest ||
        breakdowns.geography === 'state' ||
        breakdowns.geography === 'national') &&
      breakdowns.hasExactlyOneDemographic()
    )
  },
}

// ── CAWP ─────────────────────────────────────────────────────────────────────

const CAWP_CONGRESS_METRICS: MetricId[] = [
  'cawp_population_pct',
  'congressional_districts',
  'pct_share_of_us_congress',
  'pct_share_of_women_us_congress',
  'women_us_congress_pct_relative_inequity',
  'women_this_race_us_congress_count',
  'total_us_congress_count',
]

const CAWP_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'cawp_data' }),
  getConsumedDatasetIds: (mainId, metricQuery, breakdowns) => {
    const consumedDatasetIds: DatasetId[] = [mainId]
    const { timeView } = metricQuery
    if (
      metricQuery.metricIds.includes('cawp_population_pct') ||
      metricQuery.metricIds.includes(
        'women_us_congress_pct_relative_inequity',
      ) ||
      metricQuery.metricIds.includes('women_state_leg_pct_relative_inequity')
    ) {
      if (breakdowns.filterFips?.isIslandArea()) {
        consumedDatasetIds.push(
          'decia_2020_territory_population-race_and_ethnicity_state_current',
        )
        if (timeView === 'historical') {
          consumedDatasetIds.push(
            'decia_2010_territory_population-race_and_ethnicity_state_current',
          )
        }
      } else {
        addAcsIdToConsumed(metricQuery, consumedDatasetIds)
      }
    }
    if (metricQuery.metricIds.includes('pct_share_of_us_congress')) {
      consumedDatasetIds.push('the_unitedstates_project')
    }
    return consumedDatasetIds
  },
  allowsBreakdowns: (breakdowns, metricIds) => {
    const isValidCountyRequest =
      breakdowns.geography === 'county' &&
      (!metricIds ||
        metricIds.every((id) => CAWP_CONGRESS_METRICS.includes(id)))
    return (
      (isValidCountyRequest ||
        breakdowns.geography === 'state' ||
        breakdowns.geography === 'national') &&
      breakdowns.hasExactlyOneDemographic()
    )
  },
}

// ── CDC Cancer ────────────────────────────────────────────────────────────────

const CDC_CANCER_METRICS: MetricId[] = [
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

const CDC_CANCER_CONFIG: DataSourceConfig = {
  getDatasetDetails: ({ breakdowns }) => ({
    datasetName:
      breakdowns.geography === 'county' ? 'nci_cancer' : 'cdc_wonder_data',
  }),
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns) =>
    ['county', 'state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
  skipFipsAppend: true,
}

// ── CDC Covid ────────────────────────────────────────────────────────────────

const CDC_COVID_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'cdc_restricted_data' }),
  getConsumedDatasetIds: (mainId, metricQuery, breakdowns) => {
    const consumedDatasetIds: DatasetId[] = [mainId]
    const isIslandArea = breakdowns.filterFips?.isIslandArea()
    if (isIslandArea) {
      if (breakdowns.hasOnlyRace()) {
        if (breakdowns.geography === 'state')
          consumedDatasetIds.push(
            'decia_2020_territory_population-race_and_ethnicity_state_current',
          )
        if (breakdowns.geography === 'county')
          consumedDatasetIds.push(
            'decia_2020_territory_population-race_and_ethnicity_county_current',
          )
      }
      if (breakdowns.hasOnlySex()) {
        if (breakdowns.geography === 'state')
          consumedDatasetIds.push(
            'decia_2020_territory_population-sex_state_current',
          )
        if (breakdowns.geography === 'county')
          consumedDatasetIds.push(
            'decia_2020_territory_population-sex_county_current',
          )
      }
      if (breakdowns.hasOnlyAge()) {
        if (breakdowns.geography === 'state')
          consumedDatasetIds.push(
            'decia_2020_territory_population-age_state_current',
          )
        if (breakdowns.geography === 'county')
          consumedDatasetIds.push(
            'decia_2020_territory_population-age_county_current',
          )
      }
    } else {
      addAcsIdToConsumed(metricQuery, consumedDatasetIds)
    }
    return consumedDatasetIds
  },
  allowsBreakdowns: (breakdowns) => breakdowns.hasExactlyOneDemographic(),
  transformRows: (rows, metricQuery) =>
    metricQuery.timeView === 'historical'
      ? dropRecentPartialMonth(rows)
      : (rows as HetRow[]),
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

const GEO_CONTEXT_CONFIG: DataSourceConfig = {
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
const GUN_VIOLENCE_METRIC_IDS: MetricId[] = [
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

const GUN_VIOLENCE_CONFIG: DataSourceConfig = {
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
  getConsumedDatasetIds: (mainId) => [mainId],
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
const GUN_VIOLENCE_YOUTH_METRIC_IDS: MetricId[] = [
  ...GUN_DEATHS_YOUTH_METRIC_IDS,
  ...GUN_DEATHS_YOUNG_ADULTS_METRIC_IDS,
]

const GUN_VIOLENCE_YOUTH_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({
    datasetName: 'cdc_wisqars_youth_data',
    tablePrefix: 'youth_by_',
  }),
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns) =>
    ['state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

// ── Gun Deaths Black Men ──────────────────────────────────────────────────────

const GUN_DEATHS_BLACK_MEN_METRIC_IDS: MetricId[] = [
  'gun_homicides_black_men_estimated_total',
  'gun_homicides_black_men_pct_relative_inequity',
  'gun_homicides_black_men_pct_share',
  'gun_homicides_black_men_per_100k',
  'gun_homicides_black_men_per_100k_is_suppressed',
  'gun_homicides_black_men_population_estimated_total',
  'gun_homicides_black_men_population_pct',
]

const GUN_DEATHS_BLACK_MEN_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({
    datasetName: 'cdc_wisqars_black_men_data',
    tablePrefix: 'black_men_by_',
  }),
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns) =>
    ['state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

// ── HIV Black Women ───────────────────────────────────────────────────────────

const HIV_BLACK_WOMEN_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({
    datasetName: 'cdc_hiv_data',
    tablePrefix: 'black_women_by_',
  }),
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns) =>
    ['state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

// ── HIV ───────────────────────────────────────────────────────────────────────

const HIV_DEATHS_METRICS: MetricId[] = [
  'hiv_deaths_pct_relative_inequity',
  'hiv_deaths_pct_share',
  'hiv_deaths_per_100k',
  'hiv_deaths_per_100k_is_suppressed',
  'hiv_deaths_ratio_age_adjusted',
  'hiv_deaths',
]

const HIV_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'cdc_hiv_data' }),
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns, metricIds = []) => {
    const hasNoCountyData = metricIds.some((id) =>
      HIV_DEATHS_METRICS.includes(id),
    )
    return hasNoCountyData
      ? ['state', 'national'].includes(breakdowns.geography) &&
          breakdowns.hasExactlyOneDemographic()
      : ['county', 'state', 'national'].includes(breakdowns.geography) &&
          breakdowns.hasExactlyOneDemographic()
  },
}

// ── Incarceration ─────────────────────────────────────────────────────────────

const INCARCERATION_METRIC_IDS: MetricId[] = [
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

const INCARCERATION_CONFIG: DataSourceConfig = {
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
    if (breakdowns.geography === 'state' && !breakdowns.filterFips) {
      consumedDatasetIds.push(
        'decia_2020_territory_population-sex_state_current',
      )
    }
    if (breakdowns.filterFips?.isIslandArea()) {
      consumedDatasetIds.push(
        'decia_2020_territory_population-sex_state_current',
      )
      if (metricQuery.timeView === 'historical') {
        consumedDatasetIds.push(
          'decia_2010_territory_population-sex_state_current',
        )
      }
    }
    return consumedDatasetIds
  },
  allowsBreakdowns: (breakdowns) =>
    ['national', 'state', 'county'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

// ── Maternal Mortality ────────────────────────────────────────────────────────

const MATERNAL_MORTALITY_METRIC_IDS: MetricId[] = [
  'maternal_mortality_per_100k',
  'maternal_mortality_pct_share',
  'maternal_mortality_population_pct',
  'maternal_deaths_estimated_total',
  'live_births_estimated_total',
]

const MATERNAL_MORTALITY_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'maternal_mortality_data' }),
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns) =>
    ['state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

// ── Phrma BRFSS ───────────────────────────────────────────────────────────────

const PHRMA_BRFSS_METRICS: MetricId[] = [
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

const PHRMA_BRFSS_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'phrma_brfss_data' }),
  getConsumedDatasetIds: (mainId) => [mainId],
  allowsBreakdowns: (breakdowns) =>
    ['state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

// ── Phrma ─────────────────────────────────────────────────────────────────────

const PHRMA_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'phrma_data' }),
  getConsumedDatasetIds: (mainId) => [mainId],
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

const VACCINE_CONFIG: DataSourceConfig = {
  getDatasetDetails: ({ breakdowns }) => ({
    datasetName: vaccineDatasetNameMappings[breakdowns.geography],
  }),
  getConsumedDatasetIds: (mainId, metricQuery, breakdowns) => {
    const consumedDatasetIds: DatasetId[] = [mainId]
    addAcsIdToConsumed(metricQuery, consumedDatasetIds)
    if (breakdowns.geography === 'state') {
      if (
        breakdowns.filterFips === undefined ||
        breakdowns.filterFips?.isIslandArea()
      ) {
        consumedDatasetIds.push(
          'decia_2020_territory_population-race_and_ethnicity_state_current',
        )
      }
    }
    return consumedDatasetIds
  },
  allowsBreakdowns: (breakdowns) =>
    ['national', 'state', 'county'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

// ── VariableProviderMap ───────────────────────────────────────────────────────

export default class VariableProviderMap {
  private readonly providers: VariableProvider[]
  private readonly providersById: Record<ProviderId, VariableProvider>
  private readonly metricsToProviderIds: Record<MetricId, ProviderId>

  constructor() {
    this.providers = [
      new UniversalProvider(
        'acs_condition_provider',
        ACS_CONDITION_METRICS,
        ACS_CONDITION_CONFIG,
      ),
      new UniversalProvider(
        'ahr_provider',
        [
          'ahr_population_pct',
          ...AHR_METRICS,
          ...AHR_VOTER_AGE_METRICS,
          ...AHR_DECADE_PLUS_5_AGE_METRICS,
          ...CHR_METRICS,
        ],
        AHR_CONFIG,
      ),
      new UniversalProvider('cawp_provider', CAWP_METRICS, CAWP_CONFIG),
      new UniversalProvider(
        'cdc_cancer_provider',
        CDC_CANCER_METRICS,
        CDC_CANCER_CONFIG,
      ),
      new UniversalProvider(
        'cdc_covid_provider',
        [
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
        ],
        CDC_COVID_CONFIG,
      ),
      new UniversalProvider(
        'geo_context_provider',
        ['svi', 'population'],
        GEO_CONTEXT_CONFIG,
      ),
      new UniversalProvider(
        'gun_violence_provider',
        GUN_VIOLENCE_METRIC_IDS,
        GUN_VIOLENCE_CONFIG,
      ),
      new UniversalProvider(
        'gun_violence_youth_provider',
        GUN_VIOLENCE_YOUTH_METRIC_IDS,
        GUN_VIOLENCE_YOUTH_CONFIG,
      ),
      new UniversalProvider(
        'gun_violence_black_men_provider',
        GUN_DEATHS_BLACK_MEN_METRIC_IDS,
        GUN_DEATHS_BLACK_MEN_CONFIG,
      ),
      new UniversalProvider(
        'hiv_black_women_provider',
        BLACK_WOMEN_METRICS,
        HIV_BLACK_WOMEN_CONFIG,
      ),
      new UniversalProvider('hiv_provider', HIV_METRICS, HIV_CONFIG),
      new UniversalProvider(
        'incarceration_provider',
        INCARCERATION_METRIC_IDS,
        INCARCERATION_CONFIG,
      ),
      new UniversalProvider('phrma_provider', PHRMA_METRICS, PHRMA_CONFIG),
      new UniversalProvider(
        'phrma_brfss_provider',
        PHRMA_BRFSS_METRICS,
        PHRMA_BRFSS_CONFIG,
      ),
      new UniversalProvider(
        'vaccine_provider',
        [
          'acs_vaccinated_pop_pct',
          'vaccinated_pct_share',
          'vaccinated_pct_rate',
          'vaccinated_pop_pct',
          'vaccinated_estimated_total',
        ],
        VACCINE_CONFIG,
      ),
      new UniversalProvider(
        'maternal_mortality_provider',
        MATERNAL_MORTALITY_METRIC_IDS,
        MATERNAL_MORTALITY_CONFIG,
      ),
    ]
    this.providersById = this.getProvidersById()
    this.metricsToProviderIds = this.getMetricsToProviderIdsMap()
  }

  private getProvidersById(): Record<ProviderId, VariableProvider> {
    const providersById: Partial<Record<ProviderId, VariableProvider>> =
      Object.fromEntries(this.providers.map((p) => [p.providerId, p]))
    return providersById as Record<ProviderId, VariableProvider>
  }

  private getMetricsToProviderIdsMap(): Record<MetricId, ProviderId> {
    const metricsToProviderIds: Partial<Record<MetricId, ProviderId>> = {}
    this.providers.forEach((provider) => {
      provider.providesMetrics.forEach((varId) => {
        metricsToProviderIds[varId] = provider.providerId
      })
    })
    return metricsToProviderIds as Record<MetricId, ProviderId>
  }

  getUniqueProviders(metricIds: MetricId[]): VariableProvider[] {
    const providerIds = metricIds.map((id) => {
      const providerId = this.metricsToProviderIds[id]
      if (!providerId) {
        throw new Error('No provider configured for metric id: ' + id)
      }
      return providerId
    })
    const dedupedIds = Array.from(new Set(providerIds))
    return dedupedIds.map((id) => this.providersById[id])
  }

  // For tests
  getProviderById(id: ProviderId): VariableProvider {
    return this.providersById[id]
  }
}
