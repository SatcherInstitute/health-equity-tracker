import { getParentDropdownFromDataTypeId } from '../../utils/MadLibs'
import type { DatasetId } from '../config/DatasetMetadata'
import type { DropdownVarId } from '../config/DropDownIds'
import {
  BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS,
  CHR_DATATYPE_IDS,
} from '../config/MetricConfigBehavioralHealth'
import type { DataTypeId } from '../config/MetricConfigTypes'
import type { DataSourceConfig } from '../providers/UniversalProvider'
import type { Breakdowns, GeographicBreakdown } from '../query/Breakdowns'
import type { MetricQuery } from '../query/MetricQuery'
import type { HetRow } from '../utils/DatasetTypes'
import { addAcsIdToConsumed } from '../utils/datasetutils'

// Shorthand for the most common allowsBreakdowns pattern: a fixed geo allowlist
// plus exactly one demographic. Configs with conditional logic (AHR, CAWP, HIV)
// use a custom function instead.
function oneOfGeoWithSingleDemo(
  geographies: GeographicBreakdown[],
): DataSourceConfig['allowsBreakdowns'] {
  return (breakdowns: Breakdowns) =>
    geographies.includes(breakdowns.geography) &&
    breakdowns.hasExactlyOneDemographic()
}

// Declarative dataset routing: geo keys override the default; a nested
// Record<DataTypeId, string> value overrides further by data type.
interface DatasetRoute {
  default: string
  county?: string | Partial<Record<DataTypeId, string>>
  state?: string | Partial<Record<DataTypeId, string>>
  national?: string | Partial<Record<DataTypeId, string>>
  territory?: string | Partial<Record<DataTypeId, string>>
  'state/territory'?: string | Partial<Record<DataTypeId, string>>
}

function resolveDataset(
  route: DatasetRoute,
): DataSourceConfig['getDatasetDetails'] {
  return ({ breakdowns, dataTypeId }) => {
    const geoEntry = route[breakdowns.geography as keyof DatasetRoute]
    if (geoEntry === undefined || geoEntry === route.default) {
      return { datasetName: route.default }
    }
    if (typeof geoEntry === 'string') {
      return { datasetName: geoEntry }
    }
    const datasetName = (dataTypeId && geoEntry[dataTypeId]) || route.default
    return { datasetName }
  }
}

// ── ACS Condition ────────────────────────────────────────────────────────────

export const ACS_CONDITION_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'acs_condition' }),
  allowsBreakdowns: oneOfGeoWithSingleDemo(['county', 'state', 'national']),
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
    (
      BEHAVIORAL_HEALTH_CATEGORY_DROPDOWNIDS as readonly DropdownVarId[]
    ).includes(currentDropdown)
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
  getDatasetDetails: resolveDataset({
    default: 'cdc_wonder_data',
    county: 'nci_cancer',
  }),
  allowsBreakdowns: oneOfGeoWithSingleDemo(['county', 'state', 'national']),
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
  // DECIA has no national dataset; fall back to ACS national for national-scope queries.
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
  getDatasetDetails: resolveDataset({
    default: 'cdc_wisqars_data',
    county: {
      gun_violence_homicide: 'cdc_miovd_data',
      gun_violence_suicide: 'cdc_miovd_data',
      gun_deaths: 'chr_data',
    },
  }),
  allowsBreakdowns: oneOfGeoWithSingleDemo(['county', 'state', 'national']),
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
  allowsBreakdowns: oneOfGeoWithSingleDemo(['state', 'national']),
}

// ── Gun Deaths Black Men ──────────────────────────────────────────────────────

export const GUN_DEATHS_BLACK_MEN_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({
    datasetName: 'cdc_wisqars_black_men_data',
    tablePrefix: 'black_men_by_',
  }),
  allowsBreakdowns: oneOfGeoWithSingleDemo(['state', 'national']),
}

// ── HIV Black Women ───────────────────────────────────────────────────────────

export const HIV_BLACK_WOMEN_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({
    datasetName: 'cdc_hiv_data',
    tablePrefix: 'black_women_by_',
  }),
  allowsBreakdowns: oneOfGeoWithSingleDemo(['state', 'national']),
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
  getDatasetDetails: resolveDataset({
    default: 'bjs_incarceration_data',
    county: 'vera_incarceration_county',
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
  allowsBreakdowns: oneOfGeoWithSingleDemo(['national', 'state', 'county']),
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
  allowsBreakdowns: oneOfGeoWithSingleDemo(['state', 'national']),
}

// ── Phrma BRFSS ───────────────────────────────────────────────────────────────

export const PHRMA_BRFSS_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'phrma_brfss_data' }),
  allowsBreakdowns: oneOfGeoWithSingleDemo(['state', 'national']),
}

// ── Phrma ─────────────────────────────────────────────────────────────────────

export const PHRMA_CONFIG: DataSourceConfig = {
  getDatasetDetails: () => ({ datasetName: 'phrma_data' }),
  allowsBreakdowns: oneOfGeoWithSingleDemo(['county', 'state', 'national']),
}

// ── Vaccine ───────────────────────────────────────────────────────────────────

export const VACCINE_CONFIG: DataSourceConfig = {
  getDatasetDetails: resolveDataset({
    default: 'kff_vaccination',
    national: 'cdc_vaccination_national',
    county: 'cdc_vaccination_county',
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
