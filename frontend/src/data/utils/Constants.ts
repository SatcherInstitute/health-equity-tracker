// MULTIUSE TERMS
export const ALL = "All";
export const TOTAL = "Total";
export const UNKNOWN = "Unknown";

// RACE AND ETHNICITY DEMOGRAPHIC TERMS
export const RACE = "race_and_ethnicity";

// select, specific vars
export const WHITE_NH = "White (Non-Hispanic)";
export const WHITE = "White";
export const ASIAN_NH = "Asian (Non-Hispanic)";
export const HISPANIC = "Hispanic or Latino";
export const NON_HISPANIC = "Not Hispanic or Latino";
export const TWO_OR_MORE = "Two or more races";
export const UNKNOWN_RACE = "Unknown race";
export const UNKNOWN_HL = "Unknown Hispanic or Latino";
export const UNKNOWN_ETHNICITY = "Unknown ethnicity";

// GROUPED RACE DEMOGRAPHICS
export const STANDARD_RACES = [
  "American Indian and Alaska Native (Non-Hispanic)",
  ASIAN_NH,
  "Black or African American (Non-Hispanic)",
  HISPANIC,
  "Native Hawaiian and Pacific Islander (Non-Hispanic)",
  "Some other race (Non-Hispanic)",
  "Two or more races (Non-Hispanic)",
  WHITE_NH,
  ALL,
] as const;

export const NON_STANDARD_RACES = [
  "American Indian and Alaska Native",
  "Asian",
  "Black or African American",
  "Native Hawaiian and Pacific Islander",
  "Some other race",
  TWO_OR_MORE,
  WHITE,
] as const;

export const COMBINED_RACES = [
  // combinations of other categories
  // Currently only used in state level vaccination data
  "Asian, Native Hawaiian, and Pacific Islander",
  "Indigenous",
  "Two or more races & Some other race",
];

export const RACE_GROUPS = [
  ...STANDARD_RACES,
  ...NON_STANDARD_RACES,
  UNKNOWN_RACE,
  UNKNOWN_HL,
  UNKNOWN_ETHNICITY,
  UNKNOWN,
  WHITE,
  NON_HISPANIC,
  TWO_OR_MORE,
] as const;

type RaceAndEthnicityGroup = typeof RACE_GROUPS[number];

// AGE DEMOGRAPHIC TERMS
export const AGE = "age";
export const FORTY_TO_FORTY_NINE = "40-49"; // for tests

export const DECADE_AGE_BUCKETS = [
  "0-9",
  "10-19",
  "20-29",
  "30-39",
  "40-49",
  "50-59",
  "60-69",
  "70-79",
  "80+",
] as const;

export const DECADE_PLUS_5_AGE_BUCKETS = [
  "15-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65-74",
  "75-84",
  "85+",
] as const;

export const BROAD_AGE_BUCKETS = ["18-44", "45-64", "65+"] as const;

export const CDC_AGE_BUCKETS = [
  "5-11",
  "12-17",
  "18-24",
  "25-39",
  "40-49",
  "50-64",
  "65-74",
  "75+",
  "Unknown",
  "Total",
];

export const AGE_BUCKETS = [
  "All",
  ...DECADE_AGE_BUCKETS,
  ...DECADE_PLUS_5_AGE_BUCKETS,
  ...BROAD_AGE_BUCKETS,
  ...CDC_AGE_BUCKETS,
] as const;

type AgeBucket = typeof AGE_BUCKETS[number];

// SEX DEMOGRAPHIC TERMS
export const SEX = "sex";
export const MALE = "Male";
export const FEMALE = "Female";

export const SEX_GROUPS = [MALE, FEMALE, UNKNOWN, ALL] as const;

type SexGroup = typeof SEX_GROUPS[number];

export type DemographicGroup = AgeBucket | SexGroup | RaceAndEthnicityGroup;

/* DETERMINANT SPECIFIC CONSTANTS */

export const ABOVE_POVERTY_COL = "above_poverty_line";
export const BELOW_POVERTY_COL = "below_poverty_line";
