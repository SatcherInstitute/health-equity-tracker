import { type IDataFrame } from 'data-forge'
import {
  type MetricId,
  type DataTypeConfig,
  type DataTypeId,
} from '../config/MetricConfig'
import {
  type Breakdowns,
  type BreakdownVar,
  type GeographicBreakdown,
} from '../query/Breakdowns'
import {
  AHR_API_NH_DETERMINANTS,
  AHR_DECADE_PLUS_5_AGE_DETERMINANTS,
  AHR_DETERMINANTS,
  AHR_VOTER_AGE_DETERMINANTS,
  ALL_AHR_DETERMINANTS,
} from '../providers/AhrProvider'
import { DATATYPES_NEEDING_13PLUS } from '../providers/HivProvider'
import {
  RACE,
  ALL,
  BROAD_AGE_BUCKETS,
  DECADE_PLUS_5_AGE_BUCKETS,
  VOTER_AGE_BUCKETS,
  AGE_BUCKETS,
  AIAN_NH,
  ASIAN_NH,
  NHPI_NH,
  MULTI_NH,
  OTHER_NONSTANDARD_NH,
  API_NH,
  NON_STANDARD_RACES,
  MULTI_OR_OTHER_STANDARD,
  MULTI_OR_OTHER_STANDARD_NH,
  type AgeBucket,
  NON_HISPANIC,
  UNKNOWN,
  UNKNOWN_ETHNICITY,
  UNKNOWN_RACE,
  AGE,
  BJS_NATIONAL_AGE_BUCKETS,
  BJS_JAIL_AGE_BUCKETS,
  type DemographicGroup,
  UNKNOWN_W,
} from './Constants'
import { type Row } from './DatasetTypes'
import { type Fips } from './Fips'

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
  cols: BreakdownVar[],
  joinType: JoinType = 'inner'
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
  data: Row[],
  fieldName: MetricId,
  listSize: number
) {
  if (data.length === 0) return { lowestValues: [], highestValues: [] }

  listSize = listSize > data.length ? data.length : listSize

  // cleanup and sort the data
  let sortedData = data
    .filter((row: Row) => !isNaN(row[fieldName]) && row[fieldName] != null)
    .sort((rowA: Row, rowB: Row) => rowA[fieldName] - rowB[fieldName]) // ascending order

  const lowestValue = sortedData[0][fieldName]
  const valuesTiedAtLowest = sortedData.filter(
    (row) => row[fieldName] === lowestValue
  )

  const lowestValuesAreTied = valuesTiedAtLowest.length > 1

  const lowestValues = lowestValuesAreTied
    ? valuesTiedAtLowest
    : sortedData.slice(0, listSize)

  sortedData = sortedData.reverse()

  const highestValue = sortedData[0][fieldName]
  const valuesTiedAtHighest = sortedData.filter(
    (row) => row[fieldName] === highestValue
  )
  const highestValuesAreTied = valuesTiedAtHighest.length > 1
  const highestValuesPotentialOverlap: Row[] = highestValuesAreTied
    ? valuesTiedAtHighest
    : sortedData.slice(0, listSize)

  const highestValues = highestValuesPotentialOverlap.filter(
    (value) => !lowestValues.includes(value)
  )

  return { lowestValues, highestValues }
}

/*
Analyzes state and determines if the 2nd population source should be used
*/
export interface ShouldShowAltPopCompareI {
  fips: { isState: () => boolean }
  breakdownVar: BreakdownVar
  dataTypeConfig: { dataTypeId: DataTypeId }
}

export function shouldShowAltPopCompare(fromProps: ShouldShowAltPopCompareI) {
  return (
    fromProps.fips.isState() &&
    fromProps.breakdownVar === RACE &&
    fromProps.dataTypeConfig.dataTypeId === 'covid_vaccinations'
  )
}

/*
There are many gaps in the data, and not every variable contains info at each demographic breakdown by each geographic level.
This nested dictionary keeps track of known gaps, and is utilized by the UI (e.g. disable demographic toggle options)
*/
const missingAgeAllGeos: DataTypeId[] = [
  'non_medical_drug_use',
  'preventable_hospitalizations',
  'women_in_state_legislature',
  'women_in_us_congress',
]

const missingSexAllGeos: DataTypeId[] = [
  'women_in_state_legislature',
  'women_in_us_congress',
]

export const DATA_GAPS: Partial<
  Record<GeographicBreakdown, Partial<Record<BreakdownVar, DataTypeId[]>>>
> = {
  national: {
    age: [...missingAgeAllGeos],
    sex: [...missingSexAllGeos],
  },
  state: {
    age: [...missingAgeAllGeos, 'covid_vaccinations', 'prison'],
    sex: [...missingSexAllGeos, 'covid_vaccinations'],
  },
  territory: {
    age: [...missingAgeAllGeos, 'covid_vaccinations'],
    sex: [...missingSexAllGeos, 'covid_vaccinations'],
  },
  county: {
    age: [...missingAgeAllGeos, 'covid_vaccinations', 'prison', 'jail'],
    sex: [...missingSexAllGeos, 'covid_vaccinations'],
    race_and_ethnicity: ['covid_vaccinations'],
  },
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
  currentBreakdown: BreakdownVar,
  currentFips: Fips
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

  if (currentBreakdown === RACE) {
    exclusionList.push(NON_HISPANIC)
  }

  // HIV
  if (currentDataTypeId === 'hiv_prep') {
    if (currentBreakdown === RACE) {
      exclusionList.push(
        ...NON_STANDARD_AND_MULTI,
        AIAN_NH,
        ASIAN_NH,
        NHPI_NH,
        MULTI_NH
      )
    }
    if (currentBreakdown === AGE) {
      exclusionList.push(
        ...AGE_BUCKETS.filter(
          (bucket) => bucket === '13-24' || bucket === '18-24'
        )
      )
    }
  }
  if (DATATYPES_NEEDING_13PLUS.includes(currentDataTypeId)) {
    if (currentBreakdown === RACE) {
      exclusionList.push(...NON_STANDARD_AND_MULTI, OTHER_NONSTANDARD_NH)
    }
    if (currentBreakdown === AGE) {
      exclusionList.push(
        ...AGE_BUCKETS.filter(
          (bucket) => bucket === '16-24' || bucket === '18-24'
        )
      )
    }
  }

  if (currentDataTypeId === 'hiv_stigma') {
    if (currentBreakdown === RACE) {
      exclusionList.push(...NON_STANDARD_AND_MULTI, OTHER_NONSTANDARD_NH)
    }
    if (currentBreakdown === AGE) {
      exclusionList.push(
        ...AGE_BUCKETS.filter(
          (bucket) => bucket === '13-24' || bucket === '16-24'
        )
      )
    }
  }

  // Incarceration
  if (currentDataTypeId === 'prison') {
    if (currentBreakdown === RACE) {
      currentFips.isCounty()
        ? exclusionList.push(...NON_STANDARD_AND_MULTI, ASIAN_NH, NHPI_NH)
        : exclusionList.push(...NON_STANDARD_AND_MULTI, API_NH)
    }

    if (currentBreakdown === AGE) {
      currentFips.isUsa() &&
        exclusionList.push(
          ...AGE_BUCKETS.filter(
            (bucket: AgeBucket) =>
              !BJS_NATIONAL_AGE_BUCKETS.includes(bucket as any)
          )
        )

      currentFips.isState() &&
        exclusionList.push(
          // No demographic breakdowns so exclude ALL age buckets
          ...AGE_BUCKETS
        )
    }
  }
  if (currentDataTypeId === 'jail') {
    if (currentBreakdown === RACE) {
      currentFips.isCounty()
        ? exclusionList.push(...NON_STANDARD_AND_MULTI, ASIAN_NH, NHPI_NH)
        : exclusionList.push(...NON_STANDARD_AND_MULTI, API_NH)
    }

    if (currentBreakdown === AGE) {
      exclusionList.push(
        ...AGE_BUCKETS.filter(
          (bucket: AgeBucket) => !BJS_JAIL_AGE_BUCKETS.includes(bucket as any)
        )
      )
    }
  }

  // AHR
  if (ALL_AHR_DETERMINANTS.includes(currentRate) && currentBreakdown === RACE) {
    AHR_API_NH_DETERMINANTS.includes(currentRate)
      ? exclusionList.push(ASIAN_NH, NHPI_NH)
      : exclusionList.push(API_NH)
  }

  if (ALL_AHR_DETERMINANTS.includes(currentRate) && currentBreakdown === AGE) {
    // get correct age buckets for this determinant
    const determinantBuckets: any[] = []
    if (AHR_DECADE_PLUS_5_AGE_DETERMINANTS.includes(currentRate)) {
      determinantBuckets.push(...DECADE_PLUS_5_AGE_BUCKETS)
    } else if (AHR_VOTER_AGE_DETERMINANTS.includes(currentRate)) {
      determinantBuckets.push(...VOTER_AGE_BUCKETS)
    } else if (AHR_DETERMINANTS.includes(currentRate)) {
      determinantBuckets.push(...BROAD_AGE_BUCKETS)
    }

    // remove all of the other age groups
    const irrelevantAgeBuckets = AGE_BUCKETS.filter(
      (bucket) => !determinantBuckets.includes(bucket)
    )
    exclusionList.push(...irrelevantAgeBuckets)
  }

  return exclusionList
}

export function splitIntoKnownsAndUnknowns(
  data: Row[],
  breakdownVar: BreakdownVar
): Row[][] {
  const knowns: Row[] = []
  const unknowns: Row[] = []

  data.forEach((row: Row) => {
    if (
      [UNKNOWN, UNKNOWN_RACE, UNKNOWN_ETHNICITY, UNKNOWN_W].includes(
        row[breakdownVar]
      )
    ) {
      unknowns.push(row)
    } else knowns.push(row)
  })

  return [knowns, unknowns]
}

export function appendFipsIfNeeded(
  baseId: string,
  breakdowns: Breakdowns
): string {
  // if there is a parent fips, append it as needed (for county-level files)
  if (breakdowns.geography !== 'county') return baseId

  const isCountyQueryFromStateLevelMap =
    breakdowns.geography === 'county' &&
    breakdowns.filterFips?.isStateOrTerritory()

  const fipsToAppend = isCountyQueryFromStateLevelMap
    ? breakdowns.filterFips?.code
    : breakdowns?.filterFips?.getParentFips()?.code

  const fipsTag = fipsToAppend ? `-${fipsToAppend}` : ''
  return `${baseId}${fipsTag}`
}
