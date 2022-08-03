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
import { TrendsData, XScale, YScale, AxisConfig } from "./types";

/* Helpers */

/* Define type interface */
export interface AxesProps {
  data: TrendsData;
  xScale: XScale;
  yScale: YScale;
  width: number;
  marginBottom: number;
  marginLeft: number;
  axisConfig: AxisConfig;
  isMobile: boolean;
}

/* Render component */
export function Axes({
  data,
  xScale,
  yScale,
  width,
  marginBottom,
  marginLeft,
  axisConfig,
  isMobile,
}: AxesProps) {
  /* Config */
  const { HEIGHT, MARGIN, TICK_PADDING, Y_AXIS_LABEL_PADDING, MOBILE } = CONFIG;
  const { type, yAxisLabel = "" } = axisConfig || {};
  const yAxisLabelPadding = isMobile
    ? MOBILE.Y_AXIS_LABEL_PADDING
    : Y_AXIS_LABEL_PADDING;
  // handles difference between per100k and percent_share charts
  const Y_AXIS_CONFIG = {
    [TYPES.HUNDRED_K]: {
      topLabel: yAxisLabel + " →", // reference to shortLabel from metricConfig
      bottomLabel: "",
      formatter: (d: string | number) => `${d}${isMobile ? "" : " per 100k"}`,
    },
    [TYPES.PERCENT_SHARE]: {
      topLabel: "Over-represented →",
      bottomLabel: "← Under-represented",
      formatter: (d: string | number) => `${d}%`,
    },
  };

  /* Refs */
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);

  /* Axes */
  const xAxis = axisBottom(xScale)
    .tickSize(0)
    .ticks(isMobile ? 4 : null)
    // @ts-ignore
    .tickFormat(timeFormat("%m/%y"))
    .tickPadding(TICK_PADDING);

  const yAxis = axisLeft(yScale)
    .tickSizeOuter(0)
    .tickSizeInner(-width + MARGIN.right + marginLeft)
    // @ts-ignore
    .tickFormat(Y_AXIS_CONFIG[type]?.formatter)
    .tickPadding(TICK_PADDING / 2);

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
          transform={`translate(0, ${HEIGHT - marginBottom})`}
        />
        {/* Y-Axis */}
        <g
          className={styles.yAxis}
          ref={yAxisRef}
          transform={`translate(${marginLeft}, 0)`}
        />
      </g>
      {/* Zero Line Indicator */}
      <g>
        <line
          x1={marginLeft}
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
            HEIGHT - marginBottom + TICK_PADDING
          })`}
        >
          <text textAnchor="end" dy="8px">
            Time {"→"}
          </text>
        </g>
        {/* Top Y-Axis Label */}
        <g transform={`translate(${yAxisLabelPadding}, 0)rotate(-90)`}>
          <text textAnchor="end">{Y_AXIS_CONFIG[type]?.topLabel}</text>
        </g>
        {/* Bottom Y-Axis Label */}
        <g
          transform={`translate(${yAxisLabelPadding}, ${
            HEIGHT - marginBottom
          })rotate(-90)`}
        >
          <text textAnchor="start">{Y_AXIS_CONFIG[type]?.bottomLabel}</text>
        </g>
      </g>
    </g>
  );
}
