import { TOTAL } from "../Constants";

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
  "Some other race (Non-Hispanic)",
  "Two or more races (Non-Hispanic)",
  "White (Non-Hispanic)",
  TOTAL,
];

export function exclude(...valuesToExclude: string[]): BreakdownFilter {
  return { include: false, values: [...valuesToExclude] };
}

export function onlyInclude(...valuesToInclude: string[]): BreakdownFilter {
  return { include: true, values: [...valuesToInclude] };
}

export function onlyIncludeStandardRaces(): BreakdownFilter {
  return onlyInclude(...STANDARD_RACES);
}

export function excludeTotal(): BreakdownFilter {
  return exclude(TOTAL);
}
