/**
 * Axes for the charts that track trends over time
 * Uses d3.js to apply generate and draw axes on an SVG
 * returns jsx of an svg group containing groups of axes and axis labels

/* External Imports */
import React, { useRef, useEffect } from "react";
import { axisLeft, axisBottom, timeFormat, select } from "d3";

/* Local Imports */

/* Styles */
import styles from "./Trends.module.scss";

/* Constants */
import { CONFIG, TYPES } from "./constants";
import { TrendsData, XScale, YScale } from "./types";

/* Helpers */

/* Define type interface */
export interface AxesProps {
  data: TrendsData;
  xScale: XScale;
  yScale: YScale;
  width: number;
  type: string;
  yAxisLabel: string;
}

/* Render component */
export function Axes({
  data,
  xScale,
  yScale,
  width,
  type,
  yAxisLabel,
}: AxesProps) {
  /* Config */
  const { HEIGHT, MARGIN, TICK_PADDING } = CONFIG;
  // TODO: move to constants
  const Y_AXIS_CONFIG = {
    [TYPES.HUNDRED_K]: {
      topLabel: yAxisLabel + " ->", // should be dynamic based on metric id - reference shortLabel from metricConfig
      bottomLabel: "",
      formatter: (d: string | number) => d,
    },
    [TYPES.PERCENT_SHARE]: {
      topLabel: "Over-represented ->",
      bottomLabel: "<- Under-represented",
      formatter: (d: string | number) => `${d}%`,
    },
  };

  /* Refs */
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);

  /* Axes */
  const xAxis = axisBottom(xScale)
    .tickSize(0)
    // @ts-ignore
    .tickFormat(timeFormat("%m/%y"))
    .tickPadding(TICK_PADDING);

  const yAxis = axisLeft(yScale)
    .tickSizeOuter(0)
    .tickSizeInner(-width + MARGIN.right + MARGIN.left)
    // @ts-ignore
    .tickFormat(Y_AXIS_CONFIG[type]?.formatter)
    .tickPadding(TICK_PADDING);

  /* Effects */

  useEffect(() => {
    if (xAxisRef.current && yAxisRef.current) {
      // @ts-ignore
      select(xAxisRef.current)
        .transition()
        // @ts-ignore
        .call(xAxis);

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
          className={styles.xAxis}
          ref={xAxisRef}
          transform={`translate(0, ${HEIGHT - MARGIN.bottom})`}
        />
        {/* Y-Axis */}
        <g ref={yAxisRef} transform={`translate(${MARGIN.left}, 0)`} />
      </g>
      {/* Zero Line Indicator */}
      <g>
        <line
          x1={MARGIN.left}
          y1={yScale(0)}
          x2={width - MARGIN.right}
          y2={yScale(0)}
          stroke="black"
        />
      </g>
      {/* Axis Labels */}
      <g className={styles.AxesLabels}>
        {/* X-Axis Label */}
        <g
          transform={`translate(${width}, ${
            HEIGHT - MARGIN.bottom + TICK_PADDING
          })`}
        >
          <text textAnchor="end" dy="8px">
            Time {"->"}
          </text>
        </g>
        {/* Top Y-Axis Label */}
        <g transform={`translate(${TICK_PADDING}, 0)rotate(-90)`}>
          <text textAnchor="end">{Y_AXIS_CONFIG[type]?.topLabel}</text>
        </g>
        {/* Bottom Y-Axis Label */}
        <g
          transform={`translate(${TICK_PADDING}, ${
            HEIGHT - MARGIN.bottom
          })rotate(-90)`}
        >
          <text textAnchor="start">{Y_AXIS_CONFIG[type]?.bottomLabel}</text>
        </g>
      </g>
    </g>
  );
}
