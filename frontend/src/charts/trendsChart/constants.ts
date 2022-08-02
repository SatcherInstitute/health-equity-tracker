import sass from "../../styles/variables.module.scss";

// get colors from css variables
const { unknownMapLeast, unknownMapMost, altGreen, darkBlue, redOrange } = sass;

// range of colors for groups
const COLOR_RANGE = [
  altGreen,
  "#9AC4C0",
  darkBlue,
  "#ADBBDE",
  "#F2D6E7",
  "#A93038",
  redOrange,
  "#FCB431",
];

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
    bottom_with_unknowns: 140,
    left: 85,
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

export { COLOR_RANGE, UNKNOWN_GROUP_COLOR_EXTENT, CONFIG, TYPES };
