import sass from "../../styles/variables.module.scss";

const ACTIONS = {
  export: { png: true, svg: true },
  source: false,
  compiled: false,
  editor: false,
};

const ALT_LIGHT_MEASURE_OPACITY = 0.8;
const BAR_PADDING = 0.1;
const BAR_HEIGHT = 12;
const STACKED_BAR_HEIGHT = 40;
const LABEL_SWAP_CUTOFF_PERCENT = 66;
const MIN_TICK_BAR_STEP = 10;
const SMALL_MIN_TICK_BAR_STEP = 5;
const SIDE_BY_SIDE_ONE_BAR_RATIO = 0.4;
const SIDE_BY_SIDE_FULL_BAR_RATIO = 5;
const THIN_RATIO = 0.3;

//Colors
const BACKGROUND_COLOR = sass.white;
const DARK_MEASURE_COLOR = sass.barChartDark;
const LIGHT_MEASURE_COLOR = sass.barChartLight;
const LEGEND_COLORS = [LIGHT_MEASURE_COLOR, DARK_MEASURE_COLOR];
const ALT_LIGHT_MEASURE_COLOR = sass.unknownMapMid;
const Z_MIDDLE = sass.zMiddle;

export {
  ACTIONS,
  BACKGROUND_COLOR,
  BAR_HEIGHT,
  BAR_PADDING,
  DARK_MEASURE_COLOR,
  STACKED_BAR_HEIGHT,
  LABEL_SWAP_CUTOFF_PERCENT,
  LEGEND_COLORS,
  LIGHT_MEASURE_COLOR,
  MIN_TICK_BAR_STEP,
  SMALL_MIN_TICK_BAR_STEP,
  SIDE_BY_SIDE_FULL_BAR_RATIO,
  SIDE_BY_SIDE_ONE_BAR_RATIO,
  THIN_RATIO,
  Z_MIDDLE,
};
