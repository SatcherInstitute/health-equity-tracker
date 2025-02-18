import {
  ALL,
  type AgeBucket,
  type DemographicGroup,
  type RaceAndEthnicityGroup,
} from '../utils/Constants'

/**
 * Specifies a set of filters to apply to a breakdown. When `include` is true,
 * filters the results so that only the specified values are included. When
 * `include` is false, removes the specified values and leaves the rest.
 */
export default interface BreakdownFilter {
  readonly values: Readonly<string[]>
  readonly include: boolean
}

const STANDARD_RACES: RaceAndEthnicityGroup[] = [
  'Indigenous (NH)',
  'Asian (NH)',
  'Black or African American (NH)',
  'Hispanic or Latino',
  'Native Hawaiian and Pacific Islander (NH)',
  'Unrepresented race (NH)',
  'Two or more races (NH)',
  'White (NH)',
  ALL,
]

const DECADE_AGE_BRACKETS: AgeBucket[] = [
  '0-9',
  '10-19',
  '20-29',
  '30-39',
  '40-49',
  '50-59',
  '60-69',
  '70-79',
  '80+',
]

export function exclude(
  ...valuesToExclude: DemographicGroup[]
): BreakdownFilter {
  return { include: false, values: [...valuesToExclude] }
}

function onlyInclude(...valuesToInclude: DemographicGroup[]): BreakdownFilter {
  return { include: true, values: [...valuesToInclude] }
}

function onlyIncludeStandardRaces(): BreakdownFilter {
  return onlyInclude(...STANDARD_RACES)
}

function onlyIncludeDecadeAgeBrackets(): BreakdownFilter {
  return onlyInclude(...DECADE_AGE_BRACKETS)
}

export function excludeAll(): BreakdownFilter {
  return exclude(ALL)
}
