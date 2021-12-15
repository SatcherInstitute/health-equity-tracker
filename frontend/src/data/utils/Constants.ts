// Constant strings to be used in tests and elsewhere

// TODO add values for the other categories. Maybe convert to an enum.
export const ALL = "All";
export const TOTAL = "Total";
export const RACE = "race_and_ethnicity";
export const WHITE_NH = "White (Non-Hispanic)";
export const WHITE = "White";
export const ASIAN_NH = "Asian (Non-Hispanic)";
export const HISPANIC = "Hispanic or Latino";
export const NON_HISPANIC = "Not Hispanic or Latino";
export const TWO_OR_MORE = "Two or more races";

export const AGE = "age";
export const FORTY_TO_FORTY_NINE = "40-49";

export const SEX = "sex";
export const MALE = "Male";
export const FEMALE = "Female";
export const UNKNOWN = "Unknown";
export const UNKNOWN_RACE = "Unknown race";
export const UNKNOWN_HL = "Unknown Hispanic or Latino";
export const UNKNOWN_ETHNICITY = "Unknown ethnicity";

export const ABOVE_POVERTY_COL = "above_poverty_line";
export const BELOW_POVERTY_COL = "below_poverty_line";

export const STANDARD_RACES = [
  "American Indian and Alaska Native (Non-Hispanic)",
  "Asian (Non-Hispanic)",
  "Black or African American (Non-Hispanic)",
  "Hispanic or Latino",
  "Native Hawaiian and Pacific Islander (Non-Hispanic)",
  "Some other race (Non-Hispanic)",
  "Two or more races (Non-Hispanic)",
  "White (Non-Hispanic)",
  ALL,
];

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
];

export const DECADE_PLUS_5_AGE_BUCKETS = [
  "15-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65-74",
  "75-84",
  "85+",
];

export const BROAD_AGE_BUCKETS = ["18-44", "45-64", "65+"];

export const AGE_BUCKETS = [
  "All",
  ...DECADE_AGE_BUCKETS,
  ...DECADE_PLUS_5_AGE_BUCKETS,
  ...BROAD_AGE_BUCKETS,
];

export type AgeBucket = typeof AGE_BUCKETS[number];
