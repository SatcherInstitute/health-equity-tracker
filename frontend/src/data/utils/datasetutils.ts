import type { IDataFrame } from 'data-forge'
import type {
  DatasetId,
  DatasetIdWithStateFIPSCode,
} from '../config/DatasetMetadata'
import type {
  DataTypeConfig,
  DataTypeId,
  MetricId,
} from '../config/MetricConfigTypes'
import {
  AHR_API_NH_METRICS,
  AHR_DECADE_PLUS_5_AGE_METRICS,
  AHR_METRICS,
  AHR_VOTER_AGE_METRICS,
  ALL_AHR_METRICS,
} from '../providers/AhrProvider'
import { DATATYPES_NEEDING_13PLUS } from '../providers/HivProvider'
import type { Breakdowns, DemographicType } from '../query/Breakdowns'
import {
  ACS_POVERTY_AGE_BUCKETS,
  ACS_UNINSURANCE_CURRENT_AGE_BUCKETS,
  AGE,
  AGE_BUCKETS,
  AIAN_API,
  AIAN_NH,
  ALL,
  API,
  API_NH,
  ASIAN_NH,
  type AgeBucket,
  BJS_JAIL_AGE_BUCKETS,
  BJS_NATIONAL_AGE_BUCKETS,
  BROAD_AGE_BUCKETS,
  DECADE_PLUS_5_AGE_BUCKETS,
  type DemographicGroup,
  MULTI_NH,
  MULTI_OR_OTHER_STANDARD,
  MULTI_OR_OTHER_STANDARD_NH,
  NHPI_NH,
  NON_HISPANIC,
  NON_STANDARD_RACES,
  OTHER_NONSTANDARD_NH,
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

export type JoinType = 'inner' | 'left' | 'outer'

// TODO: consider finding different library for joins, or write our own. This
// library doesn't support multi-col joins naturally, so this uses a workaround.
// I've also seen occasional issues with the page hanging that have been
// difficult to consistently reproduce.
/**
 * Joins two data frames on the specified columns, keeping all the remaining
 * columns from both.
 */
export function joinOnCols(
  df1: IDataFrame,
  df2: IDataFrame,
  cols: DemographicType[],
  joinType: JoinType = 'inner',
): IDataFrame {
  const keySelector = (row: any) => {
    const keys = cols.map((col) => col + ': ' + row[col])
    return keys.join(',')
  }
  const aggFn = (row1: any, row2: any) => ({ ...row2, ...row1 })
  let joined
  switch (joinType) {
    case 'inner':
      joined = df1.join(df2, keySelector, keySelector, aggFn)
      break
    case 'left':
      joined = df1.joinOuterLeft(df2, keySelector, keySelector, aggFn)
      break
    case 'outer':
      joined = df1.joinOuter(df2, keySelector, keySelector, aggFn)
      break
  }
  return joined.resetIndex()
}

/*
Returns the lowest `listSize` & highest `listSize` values, unless there are ties for first and/or last in which case the only the tied values are returned. If there is overlap, it is removed from the highest values.
*/
export function getExtremeValues(
  data: HetRow[],
  fieldName: MetricId,
  listSize: number,
) {
  if (data.length === 0) return { lowestValues: [], highestValues: [] }

  listSize = listSize > data.length ? data.length : listSize

  // cleanup and sort the data
  let sortedData = data
    .filter(
      (row: HetRow) => !Number.isNaN(row[fieldName]) && row[fieldName] != null,
    )
    .sort((rowA: HetRow, rowB: HetRow) => rowA[fieldName] - rowB[fieldName]) // ascending order

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
export interface ShouldShowAltPopCompareI {
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

const NON_STANDARD_AND_MULTI: DemographicGroup[] = [
  ...NON_STANDARD_RACES,
  MULTI_OR_OTHER_STANDARD,
  MULTI_OR_OTHER_STANDARD_NH,
]
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

  const currentDataTypeId = currentDataType.dataTypeId
  const exclusionList: DemographicGroup[] = [
    UNKNOWN,
    UNKNOWN_ETHNICITY,
    UNKNOWN_RACE,
  ]

  if (!includeAllsGroupsIds.includes(currentDataTypeId)) {
    exclusionList.push(ALL)
  }

  if (demographicType === RACE) {
    exclusionList.push(NON_HISPANIC)
  }

  // ACS CONDITION
  if (currentDataTypeId === 'health_insurance') {
    exclusionList.push(
      ...AGE_BUCKETS.filter(
        (bucket: AgeBucket) =>
          !ACS_UNINSURANCE_CURRENT_AGE_BUCKETS.includes(bucket as any), // NOTE: table card only shows most recent year; this will mute older age buckets
      ),
    )
  }

  if (currentDataTypeId === 'poverty') {
    exclusionList.push(
      ...AGE_BUCKETS.filter(
        (bucket: AgeBucket) => !ACS_POVERTY_AGE_BUCKETS.includes(bucket as any),
      ),
    )
  }

  // HIV
  if (currentDataTypeId === 'hiv_prep') {
    if (demographicType === RACE) {
      exclusionList.push(
        ...NON_STANDARD_AND_MULTI,
        AIAN_NH,
        ASIAN_NH,
        NHPI_NH,
        MULTI_NH,
      )
    }
    if (demographicType === AGE) {
      exclusionList.push(
        ...AGE_BUCKETS.filter(
          (bucket) => bucket === '13-24' || bucket === '18-24',
        ),
      )
    }
  }
  if (DATATYPES_NEEDING_13PLUS.includes(currentDataTypeId)) {
    if (demographicType === RACE) {
      exclusionList.push(...NON_STANDARD_AND_MULTI, OTHER_NONSTANDARD_NH)
    }
    if (demographicType === AGE) {
      exclusionList.push(
        ...AGE_BUCKETS.filter(
          (bucket) => bucket === '16-24' || bucket === '18-24',
        ),
      )
    }
  }

  if (currentDataTypeId === 'hiv_stigma') {
    if (demographicType === RACE) {
      exclusionList.push(...NON_STANDARD_AND_MULTI, OTHER_NONSTANDARD_NH)
    }
    if (demographicType === AGE) {
      exclusionList.push(
        ...AGE_BUCKETS.filter(
          (bucket) => bucket === '13-24' || bucket === '16-24',
        ),
      )
    }
  }

  if (currentDataTypeId === 'gun_deaths_youth') {
    if (demographicType === RACE) {
      exclusionList.push(
        ...NON_STANDARD_AND_MULTI,
        OTHER_NONSTANDARD_NH,
        AIAN_API,
        API_NH,
        NHPI_NH,
      )
    }
  }

  if (currentDataTypeId === 'gun_deaths_young_adults') {
    if (demographicType === RACE) {
      exclusionList.push(
        ...NON_STANDARD_AND_MULTI,
        OTHER_NONSTANDARD_NH,
        AIAN_API,
        API_NH,
      )
    }
  }

  // Incarceration
  if (currentDataTypeId === 'prison') {
    if (demographicType === RACE) {
      currentFips.isCounty()
        ? exclusionList.push(...NON_STANDARD_AND_MULTI, ASIAN_NH, NHPI_NH)
        : exclusionList.push(...NON_STANDARD_AND_MULTI, API_NH)
    }

    if (demographicType === AGE) {
      currentFips.isUsa() &&
        exclusionList.push(
          ...AGE_BUCKETS.filter(
            (bucket: AgeBucket) =>
              !BJS_NATIONAL_AGE_BUCKETS.includes(bucket as any),
          ),
        )

      currentFips.isState() &&
        exclusionList.push(
          // No demographic breakdowns so exclude ALL age buckets
          ...AGE_BUCKETS,
        )
    }
  }
  if (currentDataTypeId === 'jail') {
    if (demographicType === RACE) {
      currentFips.isCounty()
        ? exclusionList.push(...NON_STANDARD_AND_MULTI, ASIAN_NH, NHPI_NH)
        : exclusionList.push(...NON_STANDARD_AND_MULTI, API_NH)
    }

    if (demographicType === AGE) {
      exclusionList.push(
        ...AGE_BUCKETS.filter(
          (bucket: AgeBucket) => !BJS_JAIL_AGE_BUCKETS.includes(bucket as any),
        ),
      )
    }
  }

  // AHR
  if (ALL_AHR_METRICS.includes(currentRate) && demographicType === RACE) {
    AHR_API_NH_METRICS.includes(currentRate)
      ? exclusionList.push(ASIAN_NH, NHPI_NH)
      : exclusionList.push(API_NH)
  }

  if (ALL_AHR_METRICS.includes(currentRate) && demographicType === AGE) {
    // get correct age buckets for this determinant
    const determinantBuckets: any[] = []
    if (AHR_DECADE_PLUS_5_AGE_METRICS.includes(currentRate)) {
      determinantBuckets.push(...DECADE_PLUS_5_AGE_BUCKETS)
    } else if (AHR_VOTER_AGE_METRICS.includes(currentRate)) {
      determinantBuckets.push(...VOTER_AGE_BUCKETS)
    } else if (AHR_METRICS.includes(currentRate)) {
      determinantBuckets.push(...BROAD_AGE_BUCKETS)
    }

    // remove all of the other age groups
    const irrelevantAgeBuckets = AGE_BUCKETS.filter(
      (bucket) => !determinantBuckets.includes(bucket),
    )
    exclusionList.push(...irrelevantAgeBuckets)
  }

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
