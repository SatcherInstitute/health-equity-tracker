import { format, utcFormat, scaleOrdinal } from "d3";
import sass from "../../styles/variables.module.scss";

// get colors from css variables
const {
  unknownMapLeast,
  unknownMapMost,
  altGreen,
  darkBlue,
  redOrange,
  altGrey,
} = sass;
// domain for color scale
const COLOR_DOMAIN = [
  "All",
  "American Indian and Alaska Native NH)",
  "Asian NH)",
  "Black or African American NH)",
  "Hispanic or Latino",
  "Native Hawaiian and Pacific Islander NH)",
  "Two or more races & Unrepresented race NH)",
  "White NH)",
  "Female",
  "Male",
  "Unknown",
];
// range of colors for groups
const COLOR_RANGE = [
  altGrey,
  "#9AC4C0",
  altGreen,
  darkBlue,
  "#ADBBDE",
  "#F2D6E7",
  "#A93038",
  redOrange,
  "#9AC4C0",
  "#ADBBDE",
  "#FCB431",
];
// color scale
const COLORS = scaleOrdinal(COLOR_DOMAIN, COLOR_RANGE);
// color range for unknowns
const UNKNOWN_GROUP_COLOR_EXTENT = [unknownMapLeast, unknownMapMost];

/* Config */
const CONFIG = {
  HEIGHT: 500,
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
    },
    Y_AXIS_LABEL_PADDING: 8,
    RADIUS_EXTENT: [3, 8],
  },
};

// line chart type dictionary
const TYPES = {
  HUNDRED_K: "per100k",
  PERCENT_SHARE: "pct_share",
};

const FORMATTERS = {
  pct: (d: number) => `${format(".1~f")(d)}%`, // have to treat percent as truncated number and then interpolate % b/c they are received as integers
  dateShort: utcFormat("%m/%y"),
  dateFromString: (str: string) => str && utcFormat("%B %Y")(new Date(str)),
  num: format(".1~f"),
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
