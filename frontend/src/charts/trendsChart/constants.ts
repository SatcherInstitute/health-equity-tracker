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

// Helper to keep the mapping clean
const COLORS_VARS = {
  black: 'var(--color-black)',
  darkBlue: 'var(--color-dark-blue)',
  timeCyanBlue: 'var(--color-time-cyan-blue)',
  timePastelGreen: 'var(--color-time-pastel-green)',
  mapLight: 'var(--color-group-green)',
  timePurple: 'var(--color-time-purple)',
  timePink: 'var(--color-time-pink)',
  timeDarkRed: 'var(--color-time-dark-red)',
  redOrange: 'var(--color-red-orange)',
  timeYellow: 'var(--color-time-yellow)',
  mapLighter: 'var(--color-group-yellow-green)',
  unknownMapLeast: 'var(--color-unknown-map-least)',
  unknownMapMost: 'var(--color-unknown-map-most)',
}

export const GROUP_COLOR_MAP: Partial<Record<DemographicGroup, string>> = {
  All: COLORS_VARS.black,
  Unknown: COLORS_VARS.darkBlue,
  // race and ethnicity (NH)
  [AIAN_NH]: COLORS_VARS.timeCyanBlue,
  [ASIAN_NH]: COLORS_VARS.timePastelGreen,
  [BLACK_NH]: COLORS_VARS.mapLight,
  [HISPANIC]: COLORS_VARS.timePurple,
  [NHPI_NH]: COLORS_VARS.timePink,
  [MULTI_OR_OTHER_STANDARD_NH]: COLORS_VARS.timeDarkRed,
  [WHITE_NH]: COLORS_VARS.redOrange,
  // race and ethnicity (not NH)
  [AIAN]: COLORS_VARS.timeCyanBlue,
  [ASIAN]: COLORS_VARS.timePastelGreen,
  [BLACK]: COLORS_VARS.mapLight,
  [NHPI]: COLORS_VARS.timePink,
  [MULTI_OR_OTHER_STANDARD]: COLORS_VARS.timeDarkRed,
  [OTHER_STANDARD]: COLORS_VARS.darkBlue,
  [MULTI]: COLORS_VARS.timeDarkRed,
  [WHITE]: COLORS_VARS.redOrange,
  // race and ethnicity for CAWP
  [ALL_W]: COLORS_VARS.black,
  [AIANNH_W]: COLORS_VARS.timeCyanBlue,
  [AAPI_W]: COLORS_VARS.timePastelGreen,
  [AIAN_API_W]: COLORS_VARS.timePastelGreen,
  [BLACK_W]: COLORS_VARS.mapLight,
  [HISP_W]: COLORS_VARS.timePurple,
  [MENA_W]: COLORS_VARS.timeYellow,
  [OTHER_W]: COLORS_VARS.timePink,
  [WHITE_W]: COLORS_VARS.redOrange,
  [UNKNOWN_W]: COLORS_VARS.darkBlue,
  [MULTI_W]: COLORS_VARS.timeDarkRed,
  // race and ethnicity for HIV
  [MULTI_NH]: COLORS_VARS.timeDarkRed,
  [OTHER_NONSTANDARD_NH]: COLORS_VARS.darkBlue,
  // race and ethnicity for INCARCERATION
  [API_NH]: COLORS_VARS.timePink,
  // sex
  Female: COLORS_VARS.timeCyanBlue,
  Male: COLORS_VARS.timePurple,
  Other: COLORS_VARS.timeYellow,
  // age
  '0-9': COLORS_VARS.timeCyanBlue,
  '10-19': COLORS_VARS.timePastelGreen,
  '20-29': COLORS_VARS.darkBlue,
  '30-39': COLORS_VARS.timePurple,
  '40-49': COLORS_VARS.timePink,
  '50-59': COLORS_VARS.timeDarkRed,
  '60-69': COLORS_VARS.redOrange,
  '70-79': COLORS_VARS.timeYellow,
  '80+': COLORS_VARS.mapLight,
  // age for HIV + ACS CONDITION
  '0-5': COLORS_VARS.timeCyanBlue,
  '6-11': COLORS_VARS.timePastelGreen,
  '6-17': COLORS_VARS.timePastelGreen,
  '6-18': COLORS_VARS.timePastelGreen,
  '12-17': COLORS_VARS.darkBlue,
  '13-24': COLORS_VARS.darkBlue,
  '16-24': COLORS_VARS.darkBlue,
  '18-24': COLORS_VARS.timePurple,
  '19-25': COLORS_VARS.timePurple,
  '17-24': COLORS_VARS.timePurple,
  '25-34': COLORS_VARS.timePink,
  '26-34': COLORS_VARS.timePink,
  '35-44': COLORS_VARS.timeDarkRed,
  '45-54': COLORS_VARS.redOrange,
  '55+': COLORS_VARS.timeYellow,
  '55-64': COLORS_VARS.timeYellow,
  '65-74': COLORS_VARS.mapLight,
  '75+': COLORS_VARS.mapLighter,
  // added age buckeds for WISQARS
  '0-14': COLORS_VARS.timeCyanBlue,
  '15-19': COLORS_VARS.timePurple,
  '20-24': COLORS_VARS.timePink,
  '25-29': COLORS_VARS.timePastelGreen,
  '30-34': COLORS_VARS.redOrange,
  // age for AHR
  '15-24': COLORS_VARS.timeCyanBlue,
  '18-44': COLORS_VARS.timeCyanBlue,
  '24-34': COLORS_VARS.timePink,
  '45-64': COLORS_VARS.mapLight,
  '65+': COLORS_VARS.timeYellow,
  '75-84': COLORS_VARS.mapLighter,
  // urbanicity / City Size
  Metro: COLORS_VARS.timePurple,
  'Non-Metro': COLORS_VARS.timeYellow,
}

const COLOR_DOMAIN = Object.keys(GROUP_COLOR_MAP)
const COLOR_RANGE = Object.values(GROUP_COLOR_MAP)
const COLORS = scaleOrdinal(COLOR_DOMAIN, COLOR_RANGE)
const UNKNOWN_GROUP_COLOR_EXTENT = [
  COLORS_VARS.unknownMapLeast,
  COLORS_VARS.unknownMapMost,
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
  pct: (d: number) => `${format('.1~f')(d)}%`, // have to treat percent as truncated number and then interpolate % b/c they are received as integers
  dateShort: utcFormat('%m/%y'),
  dateYear: utcFormat('%Y'),
  dateFromString_YYYY: (str: string) => str && utcFormat('%Y')(new Date(str)),
  dateFromString_MM_YYYY: (str: string) =>
    str && utcFormat('%B %Y')(new Date(str)),
  num: format('.2~f'),
  num100k: (d: number) => (d < 10 ? format('.1~f')(d) : format('.0~f')(d)), // show single decimal if less than 10, remove trailling zeros
  plusNum: (d: number) => `${d > 0 ? '+' : ''}${format('.1~f')(d)}`, // add "+" only to positive numbers (not 0)
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
