import { ALL, DemographicGroup } from "../utils/Constants";

/**
 * Specifies a set of filters to apply to a breakdown. When `include` is true,
 * filters the results so that only the specified values are included. When
 * `include` is false, removes the specified values and leaves the rest.
 */
export default interface BreakdownFilter {
  readonly values: Readonly<string[]>;
  readonly include: boolean;
}

const STANDARD_RACES = [
  "American Indian and Alaska Native (Non-Hispanic)",
  "Asian (Non-Hispanic)",
  "Black or African American (Non-Hispanic)",
  "Hispanic or Latino",
  "Native Hawaiian and Pacific Islander (Non-Hispanic)",
  "Unrepresented race (Non-Hispanic)",
  "Two or more races (Non-Hispanic)",
  "White (Non-Hispanic)",
  ALL,
];

const DECADE_AGE_BRACKETS = [
  "0-9",
  "10-19",
  "20-29",
  "30-39",
  "40-49",
  "50-59",
  "60-69",
  "70-79",
  "80+",
];

export function exclude(
  ...valuesToExclude: DemographicGroup[]
): BreakdownFilter {
  return { include: false, values: [...valuesToExclude] };
}

export function onlyInclude(
  ...valuesToInclude: DemographicGroup[]
): BreakdownFilter {
  return { include: true, values: [...valuesToInclude] };
}

export function onlyIncludeStandardRaces(): BreakdownFilter {
  return onlyInclude(...STANDARD_RACES);
}

export function onlyIncludeDecadeAgeBrackets(): BreakdownFilter {
  return onlyInclude(...DECADE_AGE_BRACKETS);
}

export function excludeAll(): BreakdownFilter {
  return exclude(ALL);
}
