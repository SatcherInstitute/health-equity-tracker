/**
 * A Line Chart that visualizes data trends over time
 * Uses d3.js to apply data transformations and draw the lines on an SVG
 * returns jsx of an svg group containing paths

/* External Imports */
import React from "react";
import { line, curveMonotoneX } from "d3";

/* Local Imports */

/* Styles */

/* Constants */
import { TrendsData, XScale, YScale, ColorScale } from "./types";
/* Helpers */

/* Define type interface */
export interface LineChartProps {
  data: TrendsData;
  xScale: XScale;
  yScale: YScale;
  colors: ColorScale;
}

/* Render component */
export function LineChart({ data, xScale, yScale, colors }: LineChartProps) {
  // Generate line path
  const lineGen = line()
    //TODO: remove date creation when date is actually Date type
    .x(([date]) => xScale(new Date(date)) || 0)
    .y(([_, delta]) => yScale(delta) || 0)
    .curve(curveMonotoneX);

  return (
    <g>
      {data &&
        //@ts-ignore : TODO revisit with real data when date is actually a Date type
        data.map(([group, d]: [string, [Date, number][]]) => (
          <path
            key={`group-${group}`}
            //@ts-ignore : TODO revisit with real data when date is actually a Date type
            d={lineGen(d) || ""}
            fill="none"
            strokeWidth={2}
            stroke={colors(group)}
          />
        ))}
    </g>
  );
}
