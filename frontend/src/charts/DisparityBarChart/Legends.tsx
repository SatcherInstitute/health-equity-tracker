import { Legend } from "vega";
import { ChartDimensionProps } from "../../utils/hooks/useChartDimensions";
import { LEGEND_TEXT_FONT } from "../Legend";

export const Legends = (chartDimensions: ChartDimensionProps) => {
  return [
    {
      fill: "variables",
      orient: chartDimensions.legendOrient,
      // legendX and legendY are ignored when orient isn't "none"
      legendX: -100,
      legendY: -35,
      labelFont: LEGEND_TEXT_FONT,
      labelLimit: 500,
    },
  ] as Legend[];
};
