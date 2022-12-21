import { format, utcFormat, scaleOrdinal } from "d3";
import { MetricType } from "../../data/config/MetricConfig";
import sass from "../../styles/variables.module.scss";
import { DemographicGroup } from "../../data/utils/Constants";

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
  "American Indian and Alaska Native (NH)": timeCyanBlue,
  "Asian (NH)": timePastelGreen,
  "Black or African American (NH)": mapLight,
  "Hispanic or Latino": timePurple,
  "Native Hawaiian and Pacific Islander (NH)": timePink,
  "Two or more races & Unrepresented race (NH)": timeDarkRed,
  "White (NH)": redOrange,
  // race and ethnicity for CAWP
  "All Women": black,
  "Native American, Alaska Native, & Native Hawaiian Women": timeCyanBlue,
  "Asian American & Pacific Islander Women": timePastelGreen,
  "American Indian, Alaska Native, Asian & Pacific Islander Women":
    timePastelGreen,
  "Black or African American Women": mapLight,
  "Latinas and Hispanic Women": timePurple,
  "Middle Eastern & North African Women": timeYellow,
  "Women of an Unrepresented Race": timeDarkRed,
  "White Women": redOrange,
  "Women of Unknown Race": darkBlue,
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
