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

import { hetColors } from '../../styles/theme/colorValues'

export const GROUP_COLOR_MAP: Partial<Record<DemographicGroup, string>> = {
  All: hetColors.altBlack,
  Unknown: hetColors.darkBlue,

  // race and ethnicity (NH)
  [AIAN_NH]: hetColors.timeCyanBlue,
  [ASIAN_NH]: hetColors.timePastelGreen,
  [BLACK_NH]: hetColors.mapLight,
  [HISPANIC]: hetColors.timePurple,
  [NHPI_NH]: hetColors.timePink,
  [MULTI_OR_OTHER_STANDARD_NH]: hetColors.timeDarkRed,
  [WHITE_NH]: hetColors.redOrange,

  // race and ethnicity (not NH)
  [AIAN]: hetColors.timeCyanBlue,
  [ASIAN]: hetColors.timePastelGreen,
  [BLACK]: hetColors.mapLight,
  [NHPI]: hetColors.timePink,
  [MULTI_OR_OTHER_STANDARD]: hetColors.timeDarkRed,
  [OTHER_STANDARD]: hetColors.darkBlue,
  [MULTI]: hetColors.timeDarkRed,
  [WHITE]: hetColors.redOrange,

  // race and ethnicity for CAWP
  [ALL_W]: hetColors.altBlack,
  [AIANNH_W]: hetColors.timeCyanBlue,
  [AAPI_W]: hetColors.timePastelGreen,
  [AIAN_API_W]: hetColors.timePastelGreen,
  [BLACK_W]: hetColors.mapLight,
  [HISP_W]: hetColors.timePurple,
  [MENA_W]: hetColors.timeYellow,
  [OTHER_W]: hetColors.timePink,
  [WHITE_W]: hetColors.redOrange,
  [UNKNOWN_W]: hetColors.darkBlue,
  [MULTI_W]: hetColors.timeDarkRed,

  // race and ethnicity for HIV
  [MULTI_NH]: hetColors.timeDarkRed,
  [OTHER_NONSTANDARD_NH]: hetColors.darkBlue,

  // race and ethnicity for INCARCERATION
  [API_NH]: hetColors.timePink,

  // sex
  Female: hetColors.timeCyanBlue,
  Male: hetColors.timePurple,
  Other: hetColors.timeYellow,

  // age
  '0-9': hetColors.timeCyanBlue,
  '10-19': hetColors.timePastelGreen,
  '20-29': hetColors.darkBlue,
  '30-39': hetColors.timePurple,
  '40-49': hetColors.timePink,
  '50-59': hetColors.timeDarkRed,
  '60-69': hetColors.redOrange,
  '70-79': hetColors.timeYellow,
  '80+': hetColors.mapLight,

  // age for HIV + ACS CONDITION
  '0-5': hetColors.timeCyanBlue,
  '6-11': hetColors.timePastelGreen,
  '6-17': hetColors.timePastelGreen,
  '6-18': hetColors.timePastelGreen,
  '12-17': hetColors.darkBlue,
  '13-24': hetColors.darkBlue,
  '16-24': hetColors.darkBlue,
  '18-24': hetColors.timePurple,
  '19-25': hetColors.timePurple,
  '17-24': hetColors.timePurple,
  '25-34': hetColors.timePink,
  '26-34': hetColors.timePink,
  '35-44': hetColors.timeDarkRed,
  '45-54': hetColors.redOrange,
  '55+': hetColors.timeYellow,
  '55-64': hetColors.timeYellow,
  '65-74': hetColors.mapLight,
  '75+': hetColors.mapLighter,

  // added age buckets for WISQARS
  '0-14': hetColors.timeCyanBlue,
  '15-19': hetColors.timePurple,
  '20-24': hetColors.timePink,
  '25-29': hetColors.timePastelGreen,
  '30-34': hetColors.redOrange,

  // age for AHR
  '15-24': hetColors.timeCyanBlue,
  '18-44': hetColors.timeCyanBlue,
  '24-34': hetColors.timePink,
  '45-64': hetColors.mapLight,
  '65+': hetColors.timeYellow,
  '75-84': hetColors.mapLighter,

  // urbanicity / City Size
  Metro: hetColors.timePurple,
  'Non-Metro': hetColors.timeYellow,
}

const COLOR_DOMAIN = Object.keys(GROUP_COLOR_MAP)
const COLOR_RANGE = Object.values(GROUP_COLOR_MAP)

const COLORS = scaleOrdinal(COLOR_DOMAIN, COLOR_RANGE)

const UNKNOWN_GROUP_COLOR_EXTENT: [string, string] = [
  hetColors.unknownMapLeast,
  hetColors.unknownMapMost,
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
