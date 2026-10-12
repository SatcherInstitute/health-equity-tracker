import type {
  DatasetId,
  DatasetIdWithStateFIPSCode,
} from '../config/DatasetMetadata'
import {
  GEOGRAPHIES_COUNTIES_DATASET_ID,
  GEOGRAPHIES_STATES_DATASET_ID,
} from '../config/MetadataMap'
import {
  AHR_API_NH_METRICS,
  AHR_DECADE_PLUS_5_AGE_METRICS,
  AHR_METRICS,
  AHR_VOTER_AGE_METRICS,
  ALL_AHR_METRICS,
} from '../config/MetricConfigBehavioralHealth'
import type {
  DataTypeConfig,
  DataTypeId,
  MetricConfig,
  MetricId,
} from '../config/MetricConfigTypes'
import type { Breakdowns, DemographicType } from '../query/Breakdowns'
import {
  type MetricQuery,
  type MetricQueryResponse,
  resolveDatasetId,
} from '../query/MetricQuery'
import {
  AGE,
  AGE_BUCKETS,
  ALL,
  ALL_W,
  API_NH,
  ASIAN_NH,
  BROAD_AGE_BUCKETS,
  DECADE_PLUS_5_AGE_BUCKETS,
  type DemographicGroup,
  NHPI_NH,
  NON_HISPANIC,
  RACE,
  UNKNOWN,
  UNKNOWN_ETHNICITY,
  UNKNOWN_RACE,
  UNKNOWN_W,
  VOTER_AGE_BUCKETS,
} from './Constants'
import type { HetRow } from './DatasetTypes'
import type { Fips } from './Fips'
import type { StateFipsCode } from './FipsData'

/*
Returns the lowest `listSize` & highest `listSize` values, unless there are ties for first and/or last in which case the only the tied values are returned. If there is overlap, it is removed from the highest values.
*/
export function getExtremeValues(
  data: HetRow[],
  fieldName: MetricId,
  listSize: number,
) {
  // cleanup and sort the data
  let sortedData = data
    .filter(
      (row: HetRow) => !Number.isNaN(row[fieldName]) && row[fieldName] != null,
    )
    .sort((rowA: HetRow, rowB: HetRow) => rowA[fieldName] - rowB[fieldName]) // ascending order

  // callers may hand over rows that have no rate at all, so emptiness has to be
  // checked after the filter rather than against the raw input
  if (sortedData.length === 0) return { lowestValues: [], highestValues: [] }

  listSize = listSize > sortedData.length ? sortedData.length : listSize

  const lowestValue = sortedData[0][fieldName]
  const valuesTiedAtLowest = sortedData.filter(
    (row) => row[fieldName] === lowestValue,
  )

  const lowestValuesAreTied = valuesTiedAtLowest.length > 1

  const lowestValues = lowestValuesAreTied
    ? valuesTiedAtLowest
    : sortedData.slice(0, listSize)

  sortedData = sortedData.reverse()

  const highestValue = sortedData[0][fieldName]
  const valuesTiedAtHighest = sortedData.filter(
    (row) => row[fieldName] === highestValue,
  )
  const highestValuesAreTied = valuesTiedAtHighest.length > 1
  const highestValuesPotentialOverlap: HetRow[] = highestValuesAreTied
    ? valuesTiedAtHighest
    : sortedData.slice(0, listSize)

  const highestValues = highestValuesPotentialOverlap.filter(
    (value) => !lowestValues.includes(value),
  )

  return { lowestValues, highestValues }
}

/*
Analyzes state and determines if the 2nd population source should be used
*/
interface ShouldShowAltPopCompareI {
  fips: { isState: () => boolean }
  demographicType: DemographicType
  dataTypeConfig: { dataTypeId: DataTypeId }
}

export function shouldShowAltPopCompare(fromProps: ShouldShowAltPopCompareI) {
  return (
    fromProps.fips.isState() &&
    fromProps.demographicType === RACE &&
    fromProps.dataTypeConfig.dataTypeId === 'covid_vaccinations'
  )
}

/*
Conditionally hide some of the extra buckets from the table card, which generally should be showing only 1 complete set of buckets that show the entire population's comparison values.
*/
const includeAllsGroupsIds: DataTypeId[] = [
  'women_in_state_legislature',
  'women_in_us_congress',
  'prison',
  'jail',
  'hiv_deaths',
  'hiv_care',
  'hiv_diagnoses',
  'hiv_prevalence',
]

// Resolve a topic's own excludedDemographicGroups config for the active
// demographic and geography. A flat array applies to every geography; a
// geography-keyed map narrows by county vs state/national.
function resolveConfiguredExclusions(
  excluded: DataTypeConfig['excludedDemographicGroups'],
  demographicType: DemographicType,
  currentFips: Fips,
): DemographicGroup[] {
  const entry = excluded?.[demographicType]
  if (!entry) return []
  if (Array.isArray(entry)) return entry
  const geoKey = currentFips.isCounty()
    ? 'county'
    : currentFips.isUsa()
      ? 'national'
      : 'state'
  return entry[geoKey] ?? []
}

// AHR exclusions are a single rule shared across ~30 determinants, keyed on the
// rate's metric (not its dataTypeId), so they stay centralized rather than being
// copied onto every AHR config: race drops the combined vs split API group, age
// drops every bucket the determinant does not report.
function getAhrExclusions(
  currentRate: MetricId,
  demographicType: DemographicType,
): DemographicGroup[] {
  if (!ALL_AHR_METRICS.includes(currentRate)) return []

  if (demographicType === RACE) {
    return AHR_API_NH_METRICS.includes(currentRate)
      ? [ASIAN_NH, NHPI_NH]
      : [API_NH]
  }

  if (demographicType === AGE) {
    let determinantBuckets: readonly string[] = []
    if (AHR_DECADE_PLUS_5_AGE_METRICS.includes(currentRate)) {
      determinantBuckets = DECADE_PLUS_5_AGE_BUCKETS
    } else if (AHR_VOTER_AGE_METRICS.includes(currentRate)) {
      determinantBuckets = VOTER_AGE_BUCKETS
    } else if (AHR_METRICS.includes(currentRate)) {
      determinantBuckets = BROAD_AGE_BUCKETS
    }
    return AGE_BUCKETS.filter((bucket) => !determinantBuckets.includes(bucket))
  }

  return []
}

export function getExclusionList(
  currentDataType: DataTypeConfig,
  demographicType: DemographicType,
  currentFips: Fips,
): DemographicGroup[] {
  const currentRate =
    currentDataType.metrics?.per100k?.metricId ??
    currentDataType.metrics?.pct_rate?.metricId ??
    currentDataType.metrics?.index?.metricId

  if (!currentRate) return []

  const exclusionList: DemographicGroup[] = [
    UNKNOWN,
    UNKNOWN_ETHNICITY,
    UNKNOWN_RACE,
  ]

  if (!includeAllsGroupsIds.includes(currentDataType.dataTypeId)) {
    exclusionList.push(ALL)
  }

  if (demographicType === RACE) {
    exclusionList.push(NON_HISPANIC)
  }

  exclusionList.push(
    ...resolveConfiguredExclusions(
      currentDataType.excludedDemographicGroups,
      demographicType,
      currentFips,
    ),
  )

  exclusionList.push(...getAhrExclusions(currentRate, demographicType))

  return exclusionList
}

export function splitIntoKnownsAndUnknowns(
  data: HetRow[] | undefined,
  demographicType: DemographicType,
): HetRow[][] {
  const knowns: HetRow[] = []
  const unknowns: HetRow[] = []

  data?.forEach((row: HetRow) => {
    if (
      [UNKNOWN, UNKNOWN_RACE, UNKNOWN_ETHNICITY, UNKNOWN_W].includes(
        row[demographicType],
      )
    ) {
      unknowns.push(row)
    } else knowns.push(row)
  })

  return [knowns, unknowns]
}

export function appendFipsIfNeeded(
  baseId: DatasetId,
  breakdowns: Breakdowns,
): DatasetId | DatasetIdWithStateFIPSCode {
  // if there is a parent fips, append it as needed (for county-level files)
  if (breakdowns.geography !== 'county') return baseId

  const isCountyQueryFromStateLevelMap =
    breakdowns.geography === 'county' &&
    breakdowns.filterFips?.isStateOrTerritory()

  const fipsToAppend: StateFipsCode | undefined = isCountyQueryFromStateLevelMap
    ? breakdowns.filterFips?.code
    : breakdowns?.filterFips?.getParentFips()?.code

  return fipsToAppend ? `${baseId}-${fipsToAppend}` : baseId
}

// National maps render states/territories; state and county level maps render
// counties, so they load only the relevant state's county topology. State
// outlines are derived at render time by merging that state's counties.
export function getGeographiesDatasetId(
  fips: Fips,
): DatasetId | DatasetIdWithStateFIPSCode {
  return fips.isUsa()
    ? GEOGRAPHIES_STATES_DATASET_ID
    : (`${GEOGRAPHIES_COUNTIES_DATASET_ID}-${fips.getStateFipsCode()}` as DatasetIdWithStateFIPSCode)
}

export function addAcsIdToConsumed(
  metricQuery: MetricQuery,
  consumedDatasetIds: DatasetId[],
) {
  const { datasetId } = resolveDatasetId('acs_population', '', metricQuery)

  if (datasetId) {
    consumedDatasetIds.push(datasetId)
  }
}

export function groupIsAll(group: DemographicGroup) {
  return group === ALL || group === ALL_W
}

// Whether every gap on a map is explained by suppression. Only for consumers that
// must render a single verdict for the whole map, such as MissingDataAlert's
// "due to small population sizes" copy. Anything drawn per geography should read
// the row's own flag instead of collapsing the map to one answer.
export function allMissingValuesAreSuppressed(
  data: MetricQueryResponse['data'],
  metricConfig: MetricConfig,
) {
  const suppressionFlag = metricConfig.suppressionFlagMetricId
  if (!suppressionFlag) return false
  const rowsWithMissingRates = data.filter(
    (row) => row[metricConfig.metricId] == null,
  )
  // an empty array would vacuously satisfy .every(), reporting suppression on a
  // map that is missing nothing at all
  if (rowsWithMissingRates.length === 0) return false
  return rowsWithMissingRates.every((row) => row[suppressionFlag] === true)
}
