import { MULTILINE_LABEL, AXIS_LABEL_Y_DELTA } from "../utils";
import { BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE } from "../../data/query/Breakdowns";
import { BAR_HEIGHT, Z_MIDDLE } from "./constants";
import { Axis } from "vega";
import { ChartDimensionProps } from "../../utils/hooks/useChartDimensions";

export function Axes(
  axisTitle: string | string[],
  chartDimensions: ChartDimensionProps
) {
  const verticalTickBars = {
    scale: "x",
    orient: "bottom",
    gridScale: "y",
    grid: true,
    tickCount: { signal: `ceil(width/${BAR_HEIGHT})` },
    tickMinStep: chartDimensions.verticalTickMinStep,
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
    title: axisTitle,
    titleX: chartDimensions.axisTitleX,
    titleAlign: chartDimensions.axisTitleAlign,
    labelFlush: true,
    labelOverlap: true,
    tickCount: { signal: `ceil(width/${BAR_HEIGHT})` },
    tickMinStep: chartDimensions.axisTickMinStep,
    zindex: Z_MIDDLE,
    titleLimit: { signal: "width - 10" },
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
