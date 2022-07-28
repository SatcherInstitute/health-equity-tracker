/**
 * Axes for the charts that track trends over time
 * Uses d3.js to apply generate and draw axes on an SVG
 * returns jsx of an svg group containing groups of axes and axis labels

/* External Imports */
import React, { useRef, useEffect } from "react";
import {
  ScaleTime,
  ScaleLinear,
  axisLeft,
  axisBottom,
  timeFormat,
  select,
} from "d3";

/* Local Imports */

/* Styles */
import styles from "./Trends.module.scss";

/* Constants */
import { CONFIG } from "./constants";

/* Helpers */

/* Define type interface */
export interface AxesProps {
  data: any[];
  xScale: ScaleTime<number, number | undefined>;
  yScale: ScaleLinear<number, number | undefined>;
  yAxisLabel: string;
}

/* Render component */
export function Axes({ data, xScale, yScale, yAxisLabel }: AxesProps) {
  /* Config */
  const { WIDTH, HEIGHT, MARGIN, TICK_PADDING } = CONFIG;

  /* Refs */
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);

  /* Axes */
  const xAxis = axisBottom(xScale)
    .tickSize(0)
    // @ts-ignore
    .tickFormat(timeFormat("%m/%y"))
    .tickPadding(MARGIN.bottom - TICK_PADDING);

  const yAxis = axisLeft(yScale)
    .tickSizeOuter(0)
    .tickSizeInner(-WIDTH + MARGIN.right + MARGIN.left)
    .tickPadding(TICK_PADDING);

  /* Effects */

  useEffect(() => {
    if (xAxisRef.current && yAxisRef.current) {
      // @ts-ignore
      select(xAxisRef.current).transition().call(xAxis);
      select(yAxisRef.current)
        .transition()
        // @ts-ignore
        .call(yAxis)
        .call((g) =>
          g
            .selectAll(".tick line")
            .attr("opacity", 0.2)
            .attr("stroke-dasharray", 5)
        );
    }
  }, [data, xScale, yScale]);

  return (
    <g>
      {/* Axes */}
      <g className={styles.Axes}>
        {/* X-Axis */}
        <g
          ref={xAxisRef}
          transform={`translate(0, ${HEIGHT - MARGIN.bottom})`}
        />
        {/* Y-Axis */}
        <g ref={yAxisRef} transform={`translate(${MARGIN.left}, 0)`} />
      </g>
      {/* Axis Labels */}
      <g className={styles.AxesLabels}>
        {/* X-Axis Label */}
        <g transform={`translate(${WIDTH - MARGIN.right}, ${HEIGHT})`}>
          <text textAnchor="end" dy={"-1.5px"}>
            Time {"->"}
          </text>
        </g>
        {/* Y-Axis Label */}
        <g transform={`translate(${TICK_PADDING + 5}, 0)rotate(-90)`}>
          <text textAnchor="end">
            {yAxisLabel} {"->"}
          </text>
        </g>
      </g>
    </g>
  );
}
