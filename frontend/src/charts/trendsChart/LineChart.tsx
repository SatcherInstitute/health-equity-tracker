/**
 * A Line Chart that visualizes data trends over time
 * Uses d3.js to apply data transformations and draw the lines on an SVG
 * returns jsx of an svg group containing paths

/* External Imports */
import React, { useRef, Key, useEffect } from "react";
import {
  ScaleTime,
  ScaleLinear,
  ScaleOrdinal,
  line,
  curveMonotoneX,
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
import { TEXT } from "vega-lite/build/src/mark";

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

  /* Helper Functions */

  // Generate line path
  // @ts-ignore
  const lineGen = line()
    .x(([date]) => xScale(new Date(date)))
    .y(([_, delta]) => yScale(delta))
    .curve(curveMonotoneX);

  return (
    <g>
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
          <text textAnchor="end">Cases per 100K {"->"}</text>
        </g>
      </g>
    </g>
  );
}
