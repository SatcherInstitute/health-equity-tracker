import { format, scaleOrdinal, utcFormat } from 'd3'
import type { MetricType } from '../../data/config/MetricConfigTypes'

import {
  AAPI_W,
  AIAN,
  AIAN_API_W,
  AIAN_NH,
  AIANNH_W,
  ALL_BLACK_MEN_LABEL,
  ALL_BLACK_WOMEN_13PLUS_LABEL,
  ALL_W,
  API_NH,
  ASIAN,
  ASIAN_NH,
  BLACK,
  BLACK_NH,
  BLACK_W,
  type DemographicGroup,
  HISP_W,
  HISPANIC,
  MENA_W,
  MULTI,
  MULTI_NH,
  MULTI_OR_OTHER_STANDARD,
  MULTI_OR_OTHER_STANDARD_NH,
  MULTI_W,
  NHPI,
  NHPI_NH,
  OTHER_NONSTANDARD_NH,
  OTHER_STANDARD,
  OTHER_W,
  UNKNOWN_W,
  WHITE,
  WHITE_NH,
  WHITE_W,
} from '../../data/utils/Constants'

import { colors } from '../../styles/tokens/colors'

export const GROUP_COLOR_MAP: Partial<Record<DemographicGroup, string>> = {
  // For intersectional topics the trend chart shows exactly two lines:
  //   "All" = reference overall population (yellow, matching the rate bar chart)
  //   shortLabel = subgroup overall rate (black)
  All: colors.timeYellow,
  [ALL_BLACK_WOMEN_13PLUS_LABEL]: colors.altGreen,
  [ALL_BLACK_MEN_LABEL]: colors.altGreen,
  Unknown: colors.darkBlue,

  // race and ethnicity (NH)
  [AIAN_NH]: colors.timeCyanBlue,
  [ASIAN_NH]: colors.timePastelGreen,
  [BLACK_NH]: colors.mapLight,
  [HISPANIC]: colors.timePurple,
  [NHPI_NH]: colors.timePink,
  [MULTI_OR_OTHER_STANDARD_NH]: colors.timeDarkRed,
  [WHITE_NH]: colors.redOrange,

  // race and ethnicity (not NH)
  [AIAN]: colors.timeCyanBlue,
  [ASIAN]: colors.timePastelGreen,
  [BLACK]: colors.mapLight,
  [NHPI]: colors.timePink,
  [MULTI_OR_OTHER_STANDARD]: colors.timeDarkRed,
  [OTHER_STANDARD]: colors.darkBlue,
  [MULTI]: colors.timeDarkRed,
  [WHITE]: colors.redOrange,

  // race and ethnicity for CAWP
  [ALL_W]: colors.altGreen,
  [AIANNH_W]: colors.timeCyanBlue,
  [AAPI_W]: colors.timePastelGreen,
  [AIAN_API_W]: colors.timePastelGreen,
  [BLACK_W]: colors.mapLight,
  [HISP_W]: colors.timePurple,
  [MENA_W]: colors.altBlack,
  [OTHER_W]: colors.timePink,
  [WHITE_W]: colors.redOrange,
  [UNKNOWN_W]: colors.darkBlue,
  [MULTI_W]: colors.timeDarkRed,

  // race and ethnicity for HIV
  [MULTI_NH]: colors.timeDarkRed,
  [OTHER_NONSTANDARD_NH]: colors.darkBlue,

  // race and ethnicity for INCARCERATION
  [API_NH]: colors.timePink,

  // sex
  Female: colors.timeCyanBlue,
  Male: colors.timePurple,
  Other: colors.altBlack,

  // age
  '0-9': colors.timeCyanBlue,
  '10-19': colors.timePastelGreen,
  '20-29': colors.darkBlue,
  '30-39': colors.timePurple,
  '40-49': colors.timePink,
  '50-59': colors.timeDarkRed,
  '60-69': colors.redOrange,
  '70-79': colors.altBlack,
  '80+': colors.mapLight,

  // age for HIV + ACS CONDITION
  '0-5': colors.timeCyanBlue,
  '6-11': colors.timePastelGreen,
  '6-17': colors.timePastelGreen,
  '6-18': colors.timePastelGreen,
  '12-17': colors.darkBlue,
  '13-24': colors.darkBlue,
  '16-24': colors.darkBlue,
  '18-24': colors.timePurple,
  '19-25': colors.timePurple,
  '17-24': colors.timePurple,
  '25-34': colors.timePink,
  '26-34': colors.timePink,
  '35-44': colors.timeDarkRed,
  '45-54': colors.redOrange,
  '55+': colors.altBlack,
  '55-64': colors.altBlack,
  '65-74': colors.mapLight,
  '75+': colors.mapLighter,

  // added age buckets for WISQARS
  '0-14': colors.timeCyanBlue,
  '15-19': colors.timePurple,
  '20-24': colors.timePink,
  '25-29': colors.timePastelGreen,
  '30-34': colors.redOrange,

  // age for AHR
  '15-24': colors.timeCyanBlue,
  '18-44': colors.timeCyanBlue,
  '24-34': colors.timePink,
  '45-64': colors.mapLight,
  '65+': colors.altBlack,
  '75-84': colors.mapLighter,

  // urbanicity / City Size
  Metro: colors.timePurple,
  'Non-Metro': colors.altBlack,
}

const COLOR_DOMAIN = Object.keys(GROUP_COLOR_MAP)
const COLOR_RANGE = Object.values(GROUP_COLOR_MAP)

const COLORS = scaleOrdinal(COLOR_DOMAIN, COLOR_RANGE)

const UNKNOWN_GROUP_COLOR_EXTENT: [string, string] = [
  colors.unknownMapLeast,
  colors.unknownMapMost,
]

/* Config */
const CONFIG = {
  HEIGHT: 506,

  MARGIN: {
    top: 10,
    right: 55,
    bottom: 30,
    bottom_with_unknowns: 144,
    left: 80,
  },

  TICK_PADDING: 18,

  Y_AXIS_LABEL_PADDING: 18,

  RADIUS_EXTENT: [4, 10],

  // special spacing rules for mobile
  MOBILE: {
    MARGIN: {
      left: 60,
      right: 20,
    },

    Y_AXIS_LABEL_PADDING: 10,

    RADIUS_EXTENT: [3, 8],
  },

  // width of tooltip bars
  BAR_WIDTH: 100,
}

// line chart type dictionary
const TYPES: Record<string, MetricType> = {
  HUNDRED_K: 'per100k',
  PCT_RATE: 'pct_rate',
  PERCENT_SHARE: 'pct_share',
  PERCENT_RELATIVE_INEQUITY: 'pct_relative_inequity',
  INDEX: 'index',
}

const FORMATTERS = {
  pct: (d: number) => `${format('.1~f')(d)}%`,

  // have to treat percent as truncated number and then interpolate %
  // because they are received as integers

  dateShort: utcFormat('%m/%y'),

  dateYear: utcFormat('%Y'),

  dateFromString_YYYY: (str: string) => str && utcFormat('%Y')(new Date(str)),

  dateFromString_MM_YYYY: (str: string) =>
    str && utcFormat('%B %Y')(new Date(str)),

  num: format('.2~f'),

  num100k: (d: number) => (d < 10 ? format('.1~f')(d) : format('.0~f')(d)),

  // show single decimal if less than 10, remove trailing zeros

  plusNum: (d: number) => `${d > 0 ? '+' : ''}${format('.1~f')(d)}`,

  // add "+" only to positive numbers (not 0)

  capitalize: (d: string) => (d ? d[0]?.toUpperCase() + d.slice(1) : ''),
}

const BASELINE_THRESHOLD_Y_AXIS_ZERO = 5

export {
  BASELINE_THRESHOLD_Y_AXIS_ZERO,
  COLORS,
  CONFIG,
  FORMATTERS,
  TYPES,
  UNKNOWN_GROUP_COLOR_EXTENT,
}
