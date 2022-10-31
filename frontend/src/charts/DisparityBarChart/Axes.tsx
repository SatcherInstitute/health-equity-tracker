import { MULTILINE_LABEL, AXIS_LABEL_Y_DELTA } from "../utils";
import { BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE } from "../../data/query/Breakdowns";
import {
  BAR_HEIGHT,
  STACKED_BAR_HEIGHT,
  SMALL_MIN_TICK_BAR_STEP,
  Z_MIDDLE,
} from "./constants";
import { Axis } from "vega";
import { useChartDimensions } from "../../utils/hooks/useChartDimensions";

export function Axes(width: number, axisTitle: string[], stacked?: boolean) {
  const chartIsSmall = width < 350;

  const { minTick, minTickBarStep } = useChartDimensions(width);
  console.log(minTick);

  let MIN_TICK_STEP = 5;
  if (width > 800) MIN_TICK_STEP = 2;
  let MIN_TICK_BAR_STEP = 10;
  if (width > 500 && width < 800) MIN_TICK_BAR_STEP = 5;
  else if (width >= 800) MIN_TICK_BAR_STEP = 2;

  const verticalTickBars = {
    scale: "x",
    orient: "bottom",
    gridScale: "y",
    grid: true,
    tickCount: {
      signal: `ceil(width/${stacked ? STACKED_BAR_HEIGHT : BAR_HEIGHT})`,
    },
    tickMinStep:
      width > 500 && width < 800 ? SMALL_MIN_TICK_BAR_STEP : MIN_TICK_BAR_STEP,
    domain: false,
    labels: false,
    aria: false,
    maxExtent: 0,
    minExtent: 0,
    ticks: false,
    zindex: Z_MIDDLE,
  };
  const axisTicks = {
    scale: "x",
    orient: "bottom",
    grid: false,
    title: chartIsSmall ? axisTitle : axisTitle.join(" "),
    titleX: chartIsSmall ? 0 : undefined,
    titleAlign: chartIsSmall ? "left" : "center",
    labelFlush: true,
    labelOverlap: true,
    tickCount: {
      signal: `ceil(width/${stacked ? STACKED_BAR_HEIGHT : BAR_HEIGHT})`,
    },
    tickMinStep: MIN_TICK_STEP,
    zindex: Z_MIDDLE,
    titleLimit: { signal: "width - 10 " },
  };

  const yScale = {
    scale: "y",
    orient: "left",
    grid: false,
    title: BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE["race_and_ethnicity"],
    zindex: Z_MIDDLE,
    tickSize: 5,
    encode: {
      labels: {
        update: {
          text: { signal: MULTILINE_LABEL },
          baseline: { value: "bottom" },
          // Limit at which line is truncated with an ellipsis
          limit: { value: 100 },
          dy: { signal: AXIS_LABEL_Y_DELTA },
        },
      },
    },
  };
  const axes = [verticalTickBars, axisTicks, yScale];
  return axes as Axis[];
}
