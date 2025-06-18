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
import { het } from '../../styles/DesignTokens'

// get colors from css variables
const {
  unknownMapLeast,
  unknownMapMost,
  timePastelGreen,
  darkBlue,
  redOrange,
  black,
  timeCyanBlue,
  timePurple,
  timePink,
  timeDarkRed,
  timeYellow,
  mapLight,
  mapLighter,
} = het

export const GROUP_COLOR_MAP: Partial<Record<DemographicGroup, string>> = {
  // shared between breakdown types
  All: black,
  Unknown: darkBlue,
  // race and ethnicity (NH)
  [AIAN_NH]: timeCyanBlue,
  [ASIAN_NH]: timePastelGreen,
  [BLACK_NH]: mapLight,
  [HISPANIC]: timePurple,
  [NHPI_NH]: timePink,
  [MULTI_OR_OTHER_STANDARD_NH]: timeDarkRed,
  [WHITE_NH]: redOrange,
  // race and ethnicity (not NH)
  [AIAN]: timeCyanBlue,
  [ASIAN]: timePastelGreen,
  [BLACK]: mapLight,
  [NHPI]: timePink,
  [MULTI_OR_OTHER_STANDARD]: timeDarkRed,
  [OTHER_STANDARD]: darkBlue,
  [MULTI]: timeDarkRed,
  [WHITE]: redOrange,
  // race and ethnicity for CAWP
  [ALL_W]: black,
  [AIANNH_W]: timeCyanBlue,
  [AAPI_W]: timePastelGreen,
  [AIAN_API_W]: timePastelGreen,
  [BLACK_W]: mapLight,
  [HISP_W]: timePurple,
  [MENA_W]: timeYellow,
  [OTHER_W]: timePink,
  [WHITE_W]: redOrange,
  [UNKNOWN_W]: darkBlue,
  [MULTI_W]: timeDarkRed,
  // race and ethnicity for HIV
  [MULTI_NH]: timeDarkRed,
  [OTHER_NONSTANDARD_NH]: darkBlue,
  //  race and ethnicity for INCARCERATION
  [API_NH]: timePink,
  // sex
  Female: timeCyanBlue,
  Male: timePurple,
  Other: timeYellow,
  // age
  '0-9': timeCyanBlue,
  '10-19': timePastelGreen,
  '20-29': darkBlue,
  '30-39': timePurple,
  '40-49': timePink,
  '50-59': timeDarkRed,
  '60-69': redOrange,
  '70-79': timeYellow,
  '80+': mapLight,
  // age for HIV + ACS CONDITION
  '0-5': timeCyanBlue,
  '6-11': timePastelGreen,
  '6-17': timePastelGreen,
  '6-18': timePastelGreen,
  '12-17': darkBlue,
  '13-24': darkBlue,
  '16-24': darkBlue,
  '18-24': timePurple,
  '19-25': timePurple,
  '17-24': timePurple,
  '25-34': timePink,
  '26-34': timePink,
  '35-44': timeDarkRed,
  '45-54': redOrange,
  '55+': timeYellow,
  '55-64': timeYellow,
  '65-74': mapLight,
  '75+': mapLighter,
  // added age buckeds for WISQARS
  '0-14': timeCyanBlue,
  '15-19': timePurple,
  '20-24': timePink,
  '25-29': timePastelGreen,
  '30-34': redOrange,
  // age for AHR
  '15-24': timeCyanBlue,
  '18-44': timeCyanBlue,
  '24-34': timePink,
  '45-64': mapLight,
  '65+': timeYellow,
  '75-84': mapLighter,

  // urbanicity / City Size
  Metro: timePurple,
  'Non-Metro': timeYellow,
}

// domain for color scale
const COLOR_DOMAIN = Object.keys(GROUP_COLOR_MAP)
// range of colors for groups
const COLOR_RANGE = Object.values(GROUP_COLOR_MAP)
// color scale
const COLORS = scaleOrdinal(COLOR_DOMAIN, COLOR_RANGE)
// color range for unknowns
const UNKNOWN_GROUP_COLOR_EXTENT = [unknownMapLeast, unknownMapMost]

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
