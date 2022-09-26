/**
 * A Line Chart that visualizes data trends over time
 * Uses d3.js to apply data transformations and draw the lines on an SVG
 * @param {object[]} data array of timeseries data objects
 * @param {*} xScale a d3 time series scale function
 * @param {*} yScale a d3 linear scale function
 * returns jsx of an svg group containing paths
 **/

/* External Imports */
import React from "react";
import { line, curveMonotoneX } from "d3";

/* Local Imports */

/* Styles */
import styles from "./Trends.module.scss";

/* Constants */
import { TrendsData, XScale, YScale } from "./types";
import { COLORS as C } from "./constants";

/* Define type interface */
export interface LineChartProps {
  data: TrendsData;
  xScale: XScale;
  yScale: YScale;
}

/* Render component */
export function LineChart({ data, xScale, yScale }: LineChartProps) {
  // Generate line path
  const lineGen = line()
    // should prevent interpolation when date or delta is undefined
    .defined(
      ([date, amount]) =>
        date !== null &&
        date !== undefined &&
        amount !== undefined &&
        amount !== null
    )
    // assigns x-value
    .x(([date]) => xScale(new Date(date)) || 0)
    // assigns y-value
    .y(([_, amount]) => yScale(amount) || 0)
    // applies curve generator
    .curve(curveMonotoneX);

  return (
    <g>
      {data &&
        data.map(([group, d]: [string, [string, number][]]) => {
          return (
            <path
              // tabIndex={0}
              // aria-label={`${group} trend line displaying ${d.length} monthly values: ${d}`}
              aria-label={`${group} trend line displaying ${d.length} monthly values`}
              className={styles.TrendLine}
              key={`group-${group}`}
              // @ts-ignore
              d={lineGen(d) || ""}
              stroke={C(group)}
            />
          );
        })}
    </g>
  );
}
