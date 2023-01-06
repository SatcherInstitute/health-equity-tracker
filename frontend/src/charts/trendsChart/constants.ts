import { format, utcFormat, scaleOrdinal } from "d3";
import { MetricType } from "../../data/config/MetricConfig";
import sass from "../../styles/variables.module.scss";
import {
  AAPI_W,
  AIANNH_W,
  AIAN_API_W,
  AIAN_NH,
  ALL_W,
  ASIAN_NH,
  BLACK_NH,
  BLACK_W,
  DemographicGroup,
  HISPANIC,
  HISP_W,
  MENA_W,
  MULTI_OR_OTHER_STANDARD_NH,
  MULTI_W,
  NHPI_NH,
  OTHER_W,
  UNKNOWN_W,
  WHITE_NH,
  WHITE_W,
} from "../../data/utils/Constants";

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
} = sass;

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
  // sex
  Female: timeCyanBlue,
  Male: timePurple,
  Other: timeYellow,
  // age
  "0-9": timeCyanBlue,
  "10-19": timePastelGreen,
  "20-29": darkBlue,
  "30-39": timePurple,
  "40-49": timePink,
  "50-59": timeDarkRed,
  "60-69": redOrange,
  "70-79": timeYellow,
  "80+": mapLight,
};

// domain for color scale
const COLOR_DOMAIN = Object.keys(GROUP_COLOR_MAP) as DemographicGroup[];
// range of colors for groups
const COLOR_RANGE = Object.values(GROUP_COLOR_MAP);
// color scale
const COLORS = scaleOrdinal(COLOR_DOMAIN, COLOR_RANGE);
// color range for unknowns
const UNKNOWN_GROUP_COLOR_EXTENT = [unknownMapLeast, unknownMapMost];

/* Config */
const CONFIG = {
  HEIGHT: 506,
  STARTING_WIDTH: 980,
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
};

// line chart type dictionary
const TYPES: { [key: string]: MetricType } = {
  HUNDRED_K: "per100k",
  PERCENT_SHARE: "pct_share",
  PERCENT_RELATIVE_INEQUITY: "pct_relative_inequity",
};

const FORMATTERS = {
  pct: (d: number) => `${format(".1~f")(d)}%`, // have to treat percent as truncated number and then interpolate % b/c they are received as integers
  dateShort: utcFormat("%m/%y"),
  dateYear: utcFormat("%Y"),
  dateFromString_YYYY: (str: string) => str && utcFormat("%Y")(new Date(str)),
  dateFromString_MM_YYYY: (str: string) =>
    str && utcFormat("%B %Y")(new Date(str)),
  num: format(".1~f"),
  plusNum: (d: number) => `${d > 0 ? "+" : ""}${format(".1~f")(d)}`, // add "+" only to positive numbers (not 0)
  capitalize: (d: string) => (d ? d[0]?.toUpperCase() + d.slice(1) : ""),
};

export {
  COLOR_RANGE,
  UNKNOWN_GROUP_COLOR_EXTENT,
  CONFIG,
  TYPES,
  FORMATTERS,
  COLORS,
};
