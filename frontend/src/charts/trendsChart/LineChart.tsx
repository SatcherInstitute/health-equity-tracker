/**
 * A Line Chart that visualizes data trends over time
 * Uses d3.js to apply data transformations and draw the lines on an SVG
 * returns jsx of an svg group containing paths

/* External Imports */
import React from "react";
import { line, curveMonotoneX, curveLinear } from "d3";

/* Local Imports */

/* Styles */
import styles from "./Trends.module.scss";

/* Constants */
import { TrendsData, XScale, YScale, ColorScale } from "./types";
import { COLORS as C } from "./constants";

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
    // should prevent interpolation when date or delta is undefined
    .defined(
      ([date, delta]) =>
        date !== null &&
        date !== undefined &&
        delta !== undefined &&
        delta !== null
    )
    // assigns x-value
    .x(([date]) => xScale(new Date(date)) || 0)
    // assigns y-value
    .y(([_, delta]) => yScale(delta) || 0)
    // applies curve generator
    .curve(curveMonotoneX);

  return (
    <g>
      {data &&
        //@ts-ignore : TODO revisit with real data when date is actually a Date type
        data.map(([group, d]: [string, [Date, number][]]) => (
          <path
            className={styles.TrendLine}
            key={`group-${group}`}
            //@ts-ignore : TODO revisit with real data when date is actually a Date type
            d={lineGen(d) || ""}
            stroke={C(group)}
          />
        ))}
    </g>
  );
}
