/*
Constant terms for demographic breakdowns and group options
Arrays to sort through distinct groupings
Converts to types for TS checking
*/

import { TimeView } from "../query/Breakdowns";

// DEMOGRAPHIC BREAKDOWN CATEGORY TERMS
export const RACE = "race_and_ethnicity";
export const AGE = "age";
export const SEX = "sex";

// MULTIUSE TERMS
export const ALL = "All";
export const UNKNOWN = "Unknown";

// ETHNICITY
export const NON_HISPANIC = "Not Hispanic or Latino";

// UNKNOWNS
export const UNKNOWN_RACE = "Unknown race";
export const UNKNOWN_HL = "Unknown Hispanic or Latino";
export const UNKNOWN_ETHNICITY = "Unknown ethnicity";

export const UNKNOWN_LABELS = [
  UNKNOWN,
  UNKNOWN_RACE,
  UNKNOWN_HL,
  UNKNOWN_ETHNICITY,
];

// STANDARD RACE GROUPS AND ARRAY
export const AIAN_NH = "American Indian and Alaska Native (NH)";
export const ASIAN_NH = "Asian (NH)";
export const BLACK_NH = "Black or African American (NH)";
export const HISPANIC = "Hispanic or Latino";
export const NHPI_NH = "Native Hawaiian and Pacific Islander (NH)";
export const OTHER_STANDARD_NH = "Unrepresented race (NH)";
export const MULTI_NH = "Two or more races (NH)";
export const WHITE_NH = "White (NH)";

export const STANDARD_RACES = [
  AIAN_NH,
  ASIAN_NH,
  BLACK_NH,
  HISPANIC,
  NHPI_NH,
  OTHER_STANDARD_NH,
  MULTI_NH,
  WHITE_NH,
  ALL,
] as const;

// NON-STANDARD RACE GROUPS AND ARRAY
export const AIAN = "American Indian and Alaska Native";
export const ASIAN = "Asian";
export const BLACK = "Black or African American";
export const NHPI = "Native Hawaiian and Pacific Islander";
export const MULTI = "Two or more races";
export const WHITE = "White";
export const OTHER_STANDARD = "Unrepresented race";

export const NON_STANDARD_RACES = [
  AIAN,
  ASIAN,
  BLACK,
  NHPI,
  MULTI,
  WHITE,
  OTHER_STANDARD,
] as const;

// COMBINATION RACE GROUPS AND (UNUSED) ARRAY
export const API = "Asian, Native Hawaiian, and Pacific Islander";
export const API_NH = "Asian, Native Hawaiian, and Pacific Islander (NH)";
export const INDIGENOUS = "Indigenous"; // Combines AIAN and NHPI
export const INDIGENOUS_NH = "Indigenous (NH)";
export const MULTI_OR_OTHER_STANDARD = "Two or more races & Unrepresented race";
export const MULTI_OR_OTHER_STANDARD_NH =
  "Two or more races & Unrepresented race (NH)";

export const COMBINATION_RACES = [
  API,
  API_NH,
  INDIGENOUS,
  INDIGENOUS_NH,
  MULTI_OR_OTHER_STANDARD,
  MULTI_OR_OTHER_STANDARD_NH,
] as const;

// COLLECT ALL RACE/ETH DEMOGRAPHIC GROUP OPTIONS INTO SINGLE ARRAY
export const RACE_GROUPS = [
  ...STANDARD_RACES,
  ...NON_STANDARD_RACES,
  ...COMBINATION_RACES,
  UNKNOWN_RACE,
  UNKNOWN_HL,
  UNKNOWN_ETHNICITY,
  UNKNOWN,
  NON_HISPANIC,
] as const;

// ENUMERATE THOSE PROPERTIES TO CREATE A RACE-GROUP TYPE
export type RaceAndEthnicityGroup = typeof RACE_GROUPS[number];

// AGE DEMOGRAPHIC  GROUP OPTIONS
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

export const VOTER_AGE_BUCKETS = [
  "18-24",
  "25-34",
  "35-44",
  "45-64",
  "65+",
] as const;

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

export const BJS_NATIONAL_AGE_BUCKETS = [
  "All",
  "18-19",
  "20-24",
  "25-29",
  "30-34",
  "35-39",
  "40-44",
  "45-49",
  "50-54",
  "55-59",
  "60-64",
  "65+",
];

export const BJS_JAIL_AGE_BUCKETS = [ALL, "0-17", "18+"];

// buckets that have been calculated in the BigQuery table but are not used in current code
// still need to be defined here to explicitly exclude from the TABLE
export const UNUSED_BUCKETS = ["15-17", "65-69", "70-74", "75-79", "80-84"];

export const UNDER_18_PRISON = `Children in Adult Prison`;

// COMBINE ALL AGE GROUP OPTIONS INTO A SINGLE ARRAY
export const AGE_BUCKETS = [
  "All",
  ...DECADE_AGE_BUCKETS,
  ...DECADE_PLUS_5_AGE_BUCKETS,
  ...BROAD_AGE_BUCKETS,
  ...CDC_AGE_BUCKETS,
  ...BJS_NATIONAL_AGE_BUCKETS,
  ...BJS_JAIL_AGE_BUCKETS,
  ...UNUSED_BUCKETS,
] as const;

// ENUMERATE THOSE PROPERTIES TO CREATE AN AGE-GROUP TYPE
export type AgeBucket = typeof AGE_BUCKETS[number];

// SEX DEMOGRAPHIC TERMS
export const MALE = "Male";
export const FEMALE = "Female";
export const SEX_GROUPS = [MALE, FEMALE, UNKNOWN, ALL] as const;
// CREATE SEX-GROUP TYPE
export type SexGroup = typeof SEX_GROUPS[number];

// CREATE A DEMOGRAPHIC GROUP TYPE INCL ALL SEX/AGE/RACE OPTIONS
export type DemographicGroup = AgeBucket | SexGroup | RaceAndEthnicityGroup;

// TIME SERIES CONSTANTS

export const TIME_PERIOD = "time_period";
export const TIME_PERIOD_LABEL = "Time period";
export const CROSS_SECTIONAL: TimeView = "cross_sectional";
export const TIME_SERIES: TimeView = "time_series";
