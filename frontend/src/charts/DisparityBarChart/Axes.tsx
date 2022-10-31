import React from "react";
import {
  BAR_HEIGHT,
  STACKED_BAR_HEIGHT,
  MIN_TICK_BAR_STEP,
  SMALL_MIN_TICK_BAR_STEP,
  Z_MIDDLE,
} from "./constants";

export function Axes(stacked: boolean, width: number) {
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
    title: pageIsTiny
      ? [`${lightMeasureDisplayName}`, `vs.`, `${darkMeasureDisplayName}`]
      : `${lightMeasureDisplayName} vs. ${darkMeasureDisplayName}`,
    labelFlush: true,
    labelOverlap: true,
    tickCount: { signal: `ceil(width/${BAR_HEIGHT})` },
    tickMinStep: MIN_TICK_STEP,
    zindex: sass.zMiddle,
  };

  const yScale = {
    scale: "y",
    orient: "left",
    grid: false,
    title: breakdownVarDisplayName,
    zindex: sass.zMiddle,
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
  const axes = { verticalTickBars, axisTicks, yScale };
  return { axes };
}
