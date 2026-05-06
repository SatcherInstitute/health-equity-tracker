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

export const GROUP_COLOR_MAP: Partial<Record<DemographicGroup, string>> = {
  All: het.black,
  Unknown: het.darkBlue,
  // race and ethnicity (NH)
  [AIAN_NH]: het.timeCyanBlue,
  [ASIAN_NH]: het.timePastelGreen,
  [BLACK_NH]: het.mapLight,
  [HISPANIC]: het.timePurple,
  [NHPI_NH]: het.timePink,
  [MULTI_OR_OTHER_STANDARD_NH]: het.timeDarkRed,
  [WHITE_NH]: het.redOrange,
  // race and ethnicity (not NH)
  [AIAN]: het.timeCyanBlue,
  [ASIAN]: het.timePastelGreen,
  [BLACK]: het.mapLight,
  [NHPI]: het.timePink,
  [MULTI_OR_OTHER_STANDARD]: het.timeDarkRed,
  [OTHER_STANDARD]: het.darkBlue,
  [MULTI]: het.timeDarkRed,
  [WHITE]: het.redOrange,
  // race and ethnicity for CAWP
  [ALL_W]: het.black,
  [AIANNH_W]: het.timeCyanBlue,
  [AAPI_W]: het.timePastelGreen,
  [AIAN_API_W]: het.timePastelGreen,
  [BLACK_W]: het.mapLight,
  [HISP_W]: het.timePurple,
  [MENA_W]: het.timeYellow,
  [OTHER_W]: het.timePink,
  [WHITE_W]: het.redOrange,
  [UNKNOWN_W]: het.darkBlue,
  [MULTI_W]: het.timeDarkRed,
  // race and ethnicity for HIV
  [MULTI_NH]: het.timeDarkRed,
  [OTHER_NONSTANDARD_NH]: het.darkBlue,
  // race and ethnicity for INCARCERATION
  [API_NH]: het.timePink,
  // sex
  Female: het.timeCyanBlue,
  Male: het.timePurple,
  Other: het.timeYellow,
  // age
  '0-9': het.timeCyanBlue,
  '10-19': het.timePastelGreen,
  '20-29': het.darkBlue,
  '30-39': het.timePurple,
  '40-49': het.timePink,
  '50-59': het.timeDarkRed,
  '60-69': het.redOrange,
  '70-79': het.timeYellow,
  '80+': het.mapLight,
  // age for HIV + ACS CONDITION
  '0-5': het.timeCyanBlue,
  '6-11': het.timePastelGreen,
  '6-17': het.timePastelGreen,
  '6-18': het.timePastelGreen,
  '12-17': het.darkBlue,
  '13-24': het.darkBlue,
  '16-24': het.darkBlue,
  '18-24': het.timePurple,
  '19-25': het.timePurple,
  '17-24': het.timePurple,
  '25-34': het.timePink,
  '26-34': het.timePink,
  '35-44': het.timeDarkRed,
  '45-54': het.redOrange,
  '55+': het.timeYellow,
  '55-64': het.timeYellow,
  '65-74': het.mapLight,
  '75+': het.mapLighter,
  // added age buckeds for WISQARS
  '0-14': het.timeCyanBlue,
  '15-19': het.timePurple,
  '20-24': het.timePink,
  '25-29': het.timePastelGreen,
  '30-34': het.redOrange,
  // age for AHR
  '15-24': het.timeCyanBlue,
  '18-44': het.timeCyanBlue,
  '24-34': het.timePink,
  '45-64': het.mapLight,
  '65+': het.timeYellow,
  '75-84': het.mapLighter,
  // urbanicity / City Size
  Metro: het.timePurple,
  'Non-Metro': het.timeYellow,
}

const COLOR_DOMAIN = Object.keys(GROUP_COLOR_MAP)
const COLOR_RANGE = Object.values(GROUP_COLOR_MAP)
const COLORS = scaleOrdinal(COLOR_DOMAIN, COLOR_RANGE)
const UNKNOWN_GROUP_COLOR_EXTENT = [het.unknownMapLeast, het.unknownMapMost]
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
