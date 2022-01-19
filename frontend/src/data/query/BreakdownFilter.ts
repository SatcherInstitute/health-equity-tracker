import {
  DemographicGroup,
  ALL,
  DECADE_AGE_BUCKETS,
  STANDARD_RACES,
} from "../utils/Constants";

/**
 * Specifies a set of filters to apply to a breakdown. When `include` is true,
 * filters the results so that only the specified values are included. When
 * `include` is false, removes the specified values and leaves the rest.
 */
export default interface BreakdownFilter {
  readonly values: Readonly<string[]>;
  readonly include: boolean;
}

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
  return onlyInclude(...DECADE_AGE_BUCKETS);
}

export function excludeAll(): BreakdownFilter {
  return exclude(ALL);
}
