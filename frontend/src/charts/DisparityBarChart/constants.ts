import sass from "../../styles/variables.module.scss";

//specs
const ACTIONS = {
  export: { png: true, svg: true },
  source: false,
  compiled: false,
  editor: false,
};
const DATASET = "DATASET";
const SCHEMA = "https://vega.github.io/schema/vega/v5.json";

//measurements
const ALT_LIGHT_MEASURE_OPACITY = 0.8;
const BAR_HEIGHT = 12;
const BAR_PADDING = 0.1;
const LABEL_SWAP_CUTOFF_PERCENT = 66;
const MIN_TICK_BAR_STEP = 10;
const SIDE_BY_SIDE_ONE_BAR_RATIO = 0.4;
const SIDE_BY_SIDE_FULL_BAR_RATIO = 5;
const SMALL_MIN_TICK_BAR_STEP = 5;
const THIN_RATIO = 0.3;
const Y_STEP = 60;
const Z_MIDDLE = 0;

//calculations
const SIDE_BY_SIDE_BAND_HEIGHT =
  SIDE_BY_SIDE_FULL_BAR_RATIO * BAR_HEIGHT -
  SIDE_BY_SIDE_FULL_BAR_RATIO * BAR_HEIGHT * BAR_PADDING;
const MIDDLE_OF_BAND = SIDE_BY_SIDE_BAND_HEIGHT / 2;
const SIDE_BY_SIDE_OFFSET =
  BAR_HEIGHT * SIDE_BY_SIDE_ONE_BAR_RATIO * (SIDE_BY_SIDE_FULL_BAR_RATIO / 2);

//labels
const ALT_TEXT_LABELS = "alt_text_labels";
const DARK_MEASURE_BARS = "darkMeasure_bars";
const DARK_MEASURE_TEXT_LABELS = "darkMeasure_text_labels";
const LIGHT_MEASURE_BARS = "lightMeasure_bars";

//colors
const ALT_LIGHT_MEASURE_COLOR = sass.unknownMapMid;
const BACKGROUND_COLOR = sass.white;
const DARK_MEASURE_COLOR = sass.barChartDark;
const LIGHT_MEASURE_COLOR = sass.barChartLight;
const LEGEND_COLORS = [LIGHT_MEASURE_COLOR, DARK_MEASURE_COLOR];

export {
  ACTIONS,
  DATASET,
  SCHEMA,
  ALT_LIGHT_MEASURE_OPACITY,
  BAR_HEIGHT,
  BAR_PADDING,
  LABEL_SWAP_CUTOFF_PERCENT,
  MIN_TICK_BAR_STEP,
  SIDE_BY_SIDE_ONE_BAR_RATIO,
  SIDE_BY_SIDE_FULL_BAR_RATIO,
  SMALL_MIN_TICK_BAR_STEP,
  THIN_RATIO,
  Y_STEP,
  Z_MIDDLE,
  MIDDLE_OF_BAND,
  SIDE_BY_SIDE_OFFSET,
  ALT_TEXT_LABELS,
  DARK_MEASURE_BARS,
  DARK_MEASURE_TEXT_LABELS,
  LIGHT_MEASURE_BARS,
  ALT_LIGHT_MEASURE_COLOR,
  BACKGROUND_COLOR,
  DARK_MEASURE_COLOR,
  LIGHT_MEASURE_COLOR,
  LEGEND_COLORS,
};
