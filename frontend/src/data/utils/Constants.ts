/*
Constant terms for demographic breakdowns and group options
Arrays to sort through distinct groupings
Converts to types for TS checking
*/

// DEMOGRAPHIC BREAKDOWN CATEGORY TERMS
export const RACE = 'race_and_ethnicity'
export const AGE = 'age'
export const SEX = 'sex'

// MULTIUSE TERMS
export const ALL = 'All'
export const UNKNOWN = 'Unknown'

// ETHNICITY
export const NON_HISPANIC = 'Not Hispanic or Latino'

// UNKNOWNS
export const UNKNOWN_RACE = 'Unknown race'
export const UNKNOWN_HL = 'Unknown Hispanic or Latino'
export const UNKNOWN_ETHNICITY = 'Unknown ethnicity'

export const UNKNOWN_LABELS = [
  UNKNOWN,
  UNKNOWN_RACE,
  UNKNOWN_HL,
  UNKNOWN_ETHNICITY,
]

// STANDARD RACE GROUPS AND ARRAY
export const AIAN_NH = 'Indigenous (NH)'
export const ASIAN_NH = 'Asian (NH)'
export const BLACK_NH = 'Black or African American (NH)'
export const HISPANIC = 'Hispanic or Latino'
export const NHPI_NH = 'Native Hawaiian and Pacific Islander (NH)'
const OTHER_STANDARD_NH = 'Unrepresented race (NH)'
export const MULTI_NH = 'Two or more races (NH)'
export const WHITE_NH = 'White (NH)'

const STANDARD_RACES = [
  AIAN_NH,
  ASIAN_NH,
  BLACK_NH,
  HISPANIC,
  NHPI_NH,
  OTHER_STANDARD_NH,
  MULTI_NH,
  WHITE_NH,
  ALL,
] as const

// NON-STANDARD RACE GROUPS AND ARRAY
export const AIAN = 'Indigenous'
export const ASIAN = 'Asian'
export const BLACK = 'Black or African American'
export const NHPI = 'Native Hawaiian and Pacific Islander'
export const MULTI = 'Two or more races'
export const WHITE = 'White'
export const OTHER_STANDARD = 'Unrepresented race'

export const NON_STANDARD_RACES = [
  AIAN,
  ASIAN,
  BLACK,
  NHPI,
  MULTI,
  WHITE,
  OTHER_STANDARD,
] as const

// CAWP RACE GROUPS AND ARRAY

export const ALL_W = 'All women'
export const AAPI_W = 'Asian American & Pacific Islander women'
export const MENA_W = 'Middle Eastern & North African women'
export const AIANNH_W = 'Indigenous women'
export const AIAN_API_W = 'Indigenous, Asian & Pacific Islander women'
export const HISP_W = 'Latinas and Hispanic women'
export const BLACK_W = 'Black or African American women'
export const WHITE_W = 'White women'
export const UNKNOWN_W = 'Women with unknown race'
export const MULTI_W = 'Women of two or more races'
export const OTHER_W = 'Women of an unrepresented race'

const CAWP_RACES = [
  ALL_W,
  AAPI_W,
  MENA_W,
  AIANNH_W,
  AIAN_API_W,
  HISP_W,
  BLACK_W,
  WHITE_W,
  UNKNOWN_W,
  MULTI_W,
  OTHER_W,
] as const

// HIV RACE GROUPS AND ARRAY

export const OTHER_NONSTANDARD_NH = 'Unrepresented race (NH)'

const HIV_RACES = [OTHER_NONSTANDARD_NH]

// COMBINATION RACE GROUPS AND (UNUSED) ARRAY
export const AIAN_API =
  'American Indian, Alaska Native, Asian & Pacific Islander'
const API = 'Asian, Native Hawaiian, and Pacific Islander'
export const API_NH = 'Asian, Native Hawaiian, and Pacific Islander (NH)'
const INDIGENOUS = 'Indigenous' // Combines AIAN and NHPI
const INDIGENOUS_NH = 'Indigenous (NH)'
export const MULTI_OR_OTHER_STANDARD = 'Two or more races & Unrepresented race'
export const MULTI_OR_OTHER_STANDARD_NH =
  'Two or more races & Unrepresented race (NH)'
export const UNREPRESENTED = 'Unrepresented race'

const COMBINATION_RACES = [
  AIAN_API,
  API,
  API_NH,
  INDIGENOUS,
  INDIGENOUS_NH,
  MULTI_OR_OTHER_STANDARD,
  MULTI_OR_OTHER_STANDARD_NH,
] as const

// COLLECT ALL RACE/ETH DEMOGRAPHIC GROUP OPTIONS INTO SINGLE ARRAY
const RACE_GROUPS = [
  ...STANDARD_RACES,
  ...NON_STANDARD_RACES,
  ...CAWP_RACES,
  ...COMBINATION_RACES,
  ...HIV_RACES,
  UNKNOWN_RACE,
  UNKNOWN_HL,
  UNKNOWN_ETHNICITY,
  UNKNOWN,
  NON_HISPANIC,
] as const

// ENUMERATE THOSE PROPERTIES TO CREATE A RACE-GROUP TYPE
export type RaceAndEthnicityGroup = (typeof RACE_GROUPS)[number]

export const raceNameToCodeMap: Record<RaceAndEthnicityGroup, string> = {
  // race and ethnicity NH CDC COVID
  All: 'All',
  [NHPI_NH]: 'NHPI (NH)',
  [HISPANIC]: 'Hisp/Lat',
  [AIAN_NH]: 'Indigenous (NH)',
  [BLACK_NH]: 'Black (NH)',
  [MULTI_OR_OTHER_STANDARD_NH]: '2/Unr (NH)',
  [WHITE_NH]: 'White (NH)',
  [ASIAN_NH]: 'Asian (NH)',
  // CDC HIV
  [MULTI_NH]: 'Two+ (NH)',
  [OTHER_NONSTANDARD_NH]: 'Unrepr. (NH)',
  // Incarceration
  [API_NH]: 'A/NHPI (NH)',
  //  race and ethnicity CAWP
  [ALL_W]: 'All W',
  [AAPI_W]: 'AAPI W',
  [MENA_W]: 'MENA W',
  [AIANNH_W]: 'Indig. W',
  [AIAN_API_W]: 'Indig./API W',
  [HISP_W]: 'Hisp/Lat W',
  [MULTI_W]: 'Two+ W',
  [BLACK_W]: 'Black W',
  [WHITE_W]: 'White W',
  [UNKNOWN_W]: 'Unknown W',
  [OTHER_W]: 'Unrepr. W',
  // Hispanic-Inclusive Races (Poverty/Uninsurance)
  [NHPI]: 'NHPI',
  [AIAN]: 'Indigenous',
  [BLACK]: 'Black',
  [MULTI_OR_OTHER_STANDARD]: '2/Unr',
  [MULTI]: 'Two+',
  [OTHER_STANDARD]: 'Unrepr.',
  [WHITE]: 'White',
  [ASIAN]: 'Asian',
}

// AGE DEMOGRAPHIC  GROUP OPTIONS
const DECADE_AGE_BUCKETS = [
  '0-9',
  '10-19',
  '20-29',
  '30-39',
  '40-49',
  '50-59',
  '60-69',
  '70-79',
  '80+',
] as const

export const DECADE_PLUS_5_AGE_BUCKETS = [
  '0-14',
  '15-24',
  '25-34',
  '35-44',
  '45-54',
  '55-64',
  '65-74',
  '75-84',
  '85+',
] as const

export const BROAD_AGE_BUCKETS = ['0-17', '18-44', '45-64', '65+'] as const

export const VOTER_AGE_BUCKETS = [
  '0-17',
  '18-24',
  '25-34',
  '35-44',
  '45-64',
  '65+',
] as const

const CDC_AGE_BUCKETS = [
  '5-11',
  '12-17',
  '18-24',
  '25-39',
  '40-49',
  '50-64',
  '65-74',
  '75+',
  'Unknown',
  'Total',
] as const

export const BJS_NATIONAL_AGE_BUCKETS = [
  ALL,
  '18-19',
  '20-24',
  '25-29',
  '30-34',
  '35-39',
  '40-44',
  '45-49',
  '50-54',
  '55-59',
  '60-64',
  '65+',
] as const

export const BJS_JAIL_AGE_BUCKETS = [ALL, '0-17', '18+'] as const

const CDC_HIV_AGE_BUCKETS = [
  ALL,
  '13-24',
  '16-24',
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55+',
]

export const ACS_POVERTY_AGE_BUCKETS = [
  '0-5',
  '6-11',
  '12-17',
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55-64',
  '65-74',
  '75+',
]

const ACS_UNINSURANCE_PRE2020_AGE_BUCKETS = [
  '0-5',
  '6-17',
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55-64',
  '65-74',
  '75+',
]

// NOTE: these buckets are used pre-2020 and are slightly different from above
export const ACS_UNINSURANCE_CURRENT_AGE_BUCKETS = [
  '0-5',
  '6-18',
  '19-25',
  '26-34',
  '35-44',
  '45-54',
  '55-64',
  '65-74',
  '75+',
]

// buckets that have been calculated in the BigQuery table but are not used in current code
// still need to be defined here to explicitly exclude from the TABLE
const UNUSED_BUCKETS = ['15-17', '65-69', '70-74', '75-79', '80-84'] as const

// COMBINE ALL AGE GROUP OPTIONS INTO A SINGLE ARRAY
export const AGE_BUCKETS = [
  ALL,
  ...DECADE_AGE_BUCKETS,
  ...DECADE_PLUS_5_AGE_BUCKETS,
  ...BROAD_AGE_BUCKETS,
  ...CDC_AGE_BUCKETS,
  ...BJS_NATIONAL_AGE_BUCKETS,
  ...BJS_JAIL_AGE_BUCKETS,
  ...CDC_HIV_AGE_BUCKETS,
  ...ACS_POVERTY_AGE_BUCKETS,
  ...ACS_UNINSURANCE_PRE2020_AGE_BUCKETS,
  ...ACS_UNINSURANCE_CURRENT_AGE_BUCKETS,
  ...UNUSED_BUCKETS,
] as const

// ENUMERATE THOSE PROPERTIES TO CREATE AN AGE-GROUP TYPE
export type AgeBucket = (typeof AGE_BUCKETS)[number]

// SEX DEMOGRAPHIC TERMS
const MALE = 'Male'
const FEMALE = 'Female'
const OTHER = 'Other'
const SEX_GROUPS = [MALE, FEMALE, OTHER, UNKNOWN, ALL] as const
// CREATE SEX-GROUP TYPE
type SexGroup = (typeof SEX_GROUPS)[number]

// CREATE A DEMOGRAPHIC GROUP TYPE INCL ALL SEX/AGE/RACE OPTIONS
export type DemographicGroup = AgeBucket | SexGroup | RaceAndEthnicityGroup

// TIME SERIES CONSTANTS

export const TIME_PERIOD = 'time_period'
export const TIME_PERIOD_LABEL = 'Time period'
