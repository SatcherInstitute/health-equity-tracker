import { format, scaleOrdinal, utcFormat } from 'd3'
import type { MetricType } from '../../data/config/MetricConfigTypes'

import {
  AAPI_W,
  AIAN,
  AIAN_API_W,
  AIAN_NH,
  AIANNH_W,
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

import { colorValues } from '../../styles/tokens/colors'

export const GROUP_COLOR_MAP: Partial<Record<DemographicGroup, string>> = {
  All: colorValues.altBlack,
  Unknown: colorValues.darkBlue,

  // race and ethnicity (NH)
  [AIAN_NH]: colorValues.timeCyanBlue,
  [ASIAN_NH]: colorValues.timePastelGreen,
  [BLACK_NH]: colorValues.mapLight,
  [HISPANIC]: colorValues.timePurple,
  [NHPI_NH]: colorValues.timePink,
  [MULTI_OR_OTHER_STANDARD_NH]: colorValues.timeDarkRed,
  [WHITE_NH]: colorValues.redOrange,

  // race and ethnicity (not NH)
  [AIAN]: colorValues.timeCyanBlue,
  [ASIAN]: colorValues.timePastelGreen,
  [BLACK]: colorValues.mapLight,
  [NHPI]: colorValues.timePink,
  [MULTI_OR_OTHER_STANDARD]: colorValues.timeDarkRed,
  [OTHER_STANDARD]: colorValues.darkBlue,
  [MULTI]: colorValues.timeDarkRed,
  [WHITE]: colorValues.redOrange,

  // race and ethnicity for CAWP
  [ALL_W]: colorValues.altBlack,
  [AIANNH_W]: colorValues.timeCyanBlue,
  [AAPI_W]: colorValues.timePastelGreen,
  [AIAN_API_W]: colorValues.timePastelGreen,
  [BLACK_W]: colorValues.mapLight,
  [HISP_W]: colorValues.timePurple,
  [MENA_W]: colorValues.timeYellow,
  [OTHER_W]: colorValues.timePink,
  [WHITE_W]: colorValues.redOrange,
  [UNKNOWN_W]: colorValues.darkBlue,
  [MULTI_W]: colorValues.timeDarkRed,

  // race and ethnicity for HIV
  [MULTI_NH]: colorValues.timeDarkRed,
  [OTHER_NONSTANDARD_NH]: colorValues.darkBlue,

  // race and ethnicity for INCARCERATION
  [API_NH]: colorValues.timePink,

  // sex
  Female: colorValues.timeCyanBlue,
  Male: colorValues.timePurple,
  Other: colorValues.timeYellow,

  // age
  '0-9': colorValues.timeCyanBlue,
  '10-19': colorValues.timePastelGreen,
  '20-29': colorValues.darkBlue,
  '30-39': colorValues.timePurple,
  '40-49': colorValues.timePink,
  '50-59': colorValues.timeDarkRed,
  '60-69': colorValues.redOrange,
  '70-79': colorValues.timeYellow,
  '80+': colorValues.mapLight,

  // age for HIV + ACS CONDITION
  '0-5': colorValues.timeCyanBlue,
  '6-11': colorValues.timePastelGreen,
  '6-17': colorValues.timePastelGreen,
  '6-18': colorValues.timePastelGreen,
  '12-17': colorValues.darkBlue,
  '13-24': colorValues.darkBlue,
  '16-24': colorValues.darkBlue,
  '18-24': colorValues.timePurple,
  '19-25': colorValues.timePurple,
  '17-24': colorValues.timePurple,
  '25-34': colorValues.timePink,
  '26-34': colorValues.timePink,
  '35-44': colorValues.timeDarkRed,
  '45-54': colorValues.redOrange,
  '55+': colorValues.timeYellow,
  '55-64': colorValues.timeYellow,
  '65-74': colorValues.mapLight,
  '75+': colorValues.mapLighter,

  // added age buckets for WISQARS
  '0-14': colorValues.timeCyanBlue,
  '15-19': colorValues.timePurple,
  '20-24': colorValues.timePink,
  '25-29': colorValues.timePastelGreen,
  '30-34': colorValues.redOrange,

  // age for AHR
  '15-24': colorValues.timeCyanBlue,
  '18-44': colorValues.timeCyanBlue,
  '24-34': colorValues.timePink,
  '45-64': colorValues.mapLight,
  '65+': colorValues.timeYellow,
  '75-84': colorValues.mapLighter,

  // urbanicity / City Size
  Metro: colorValues.timePurple,
  'Non-Metro': colorValues.timeYellow,
}

const COLOR_DOMAIN = Object.keys(GROUP_COLOR_MAP)
const COLOR_RANGE = Object.values(GROUP_COLOR_MAP)

const COLORS = scaleOrdinal(COLOR_DOMAIN, COLOR_RANGE)

const UNKNOWN_GROUP_COLOR_EXTENT: [string, string] = [
  colorValues.unknownMapLeast,
  colorValues.unknownMapMost,
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
