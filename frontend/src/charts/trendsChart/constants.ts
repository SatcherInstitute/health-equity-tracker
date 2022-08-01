const COLOR_RANGE = [
  "#0B5240",
  "#9AC4C0",
  "#255792",
  "#ADBBDE",
  "#F2D6E7",
  "#A93038",
  "#ED573F",
  "#FCB431",
];

const UNKNOWN_GROUP_COLOR_EXTENT = ["rgb(211, 238, 206)", "rgb(11, 96, 161)"];

/* Config */
const CONFIG = {
  WIDTH: 1000,
  HEIGHT: 500,
  STARTING_WIDTH: 980,
  MARGIN: {
    top: 10,
    right: 55,
    bottom: 140,
    left: 85,
  },
  TICK_PADDING: 14,
  RADIUS_EXTENT: [4, 10],
};

const TYPES = {
  HUNDRED_K: "per100k",
  PERCENT_SHARE: "pct_share",
};

export { COLOR_RANGE, UNKNOWN_GROUP_COLOR_EXTENT, CONFIG, TYPES };
