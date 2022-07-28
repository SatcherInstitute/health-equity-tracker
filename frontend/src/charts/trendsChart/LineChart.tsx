/**
 * A Line Chart that visualizes data trends over time
 * Uses d3.js to apply data transformations and draw the lines on an SVG
 * returns jsx of an svg group containing paths

/* External Imports */
import React, { Key } from "react";
import { ScaleTime, ScaleLinear, ScaleOrdinal, line, curveMonotoneX } from "d3";

/* Local Imports */

/* Styles */

/* Constants */

/* Helpers */

/* Define type interface */
export interface LineChartProps {
  data: any[];
  xScale: ScaleTime<number, number | undefined>;
  yScale: ScaleLinear<number, number | undefined>;
  colors: ScaleOrdinal<string | Key[][], string, void>;
}

/* Render component */
export function LineChart({ data, xScale, yScale, colors }: LineChartProps) {
  // Generate line path
  // @ts-ignore
  const lineGen = line()
    .x(([date]) => xScale(new Date(date)))
    .y(([_, delta]) => yScale(delta))
    .curve(curveMonotoneX);

  return (
    <g>
      {data &&
        data.map(([group, d]: [string, {}[]]) => (
          //@ts-ignore
          <path
            key={`group-${group}`}
            //@ts-ignore
            d={lineGen(d)}
            fill="none"
            strokeWidth={2}
            //@ts-ignore
            stroke={colors(group)}
          />
        ))}
    </g>
  );
}
