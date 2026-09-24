import { getParentDropdownFromDataTypeId } from '../../utils/MadLibs'
import type { DatasetId } from '../config/DatasetMetadata'
import {
  BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS,
  CHR_DATATYPE_IDS,
} from '../config/MetricConfigBehavioralHealth'
import type { DataTypeId } from '../config/MetricConfigTypes'
import type { DataSourceConfig } from '../providers/UniversalProvider'
import type { GeographicBreakdown } from '../query/Breakdowns'
import type { MetricQuery } from '../query/MetricQuery'
import type { HetRow } from '../utils/DatasetTypes'
import { addAcsIdToConsumed } from '../utils/datasetutils'

// ── ACS Condition ────────────────────────────────────────────────────────────

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

export const MATERNAL_MORTALITY_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'maternal_mortality_data' }),

  allowsBreakdowns: (breakdowns) =>
    ['state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

// ── Phrma BRFSS ───────────────────────────────────────────────────────────────

export const PHRMA_BRFSS_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'phrma_brfss_data' }),

  allowsBreakdowns: (breakdowns) =>
    ['state', 'national'].includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic(),
}

// ── Phrma ─────────────────────────────────────────────────────────────────────

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
