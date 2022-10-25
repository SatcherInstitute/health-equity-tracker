/**
 * Axes for the charts that track trends over time
 * Uses d3.js to apply generate and draw axes on an SVG
 * @param {object[]} data array of timeseries data objects
 * @param {*} xScale a d3 time series scale function
 * @param {*} yScale a d3 linear scale function
 * @param {number} width the width of the svg
 * @param {number} marginBottom the margin below the line chart (dynamic for mobile & desktop)
 * @param {number} marginLeft the margin to the left of the line chart
 * @param {number} marginRight the margin to the right of the line chart
 * @param {object} axisConfig an object containing the configuration for axes - type and labels
 * @param {boolean} isSkinny a flag to determine whether user is viewing app below the mobile breakpoint or with resulting card column in compare mode below mobile breakpoint
 * returns jsx of an svg group containing groups of axes and axis labels
 **/

/* External Imports */
import React, { useRef, useEffect } from "react";
import { axisLeft, axisBottom, select } from "d3";

/* Local Imports */

/* Styles */
import styles from "./Trends.module.scss";

/* Constants */
import { CONFIG, TYPES, FORMATTERS as F } from "./constants";
import { TrendsData, XScale, YScale, AxisConfig } from "./types";

/* Helpers */
import { getMinNumber, getMaxNumber, getDates } from "./helpers";
import { getPrettyDate } from "../../data/utils/DatasetTimeUtils";

/* Define type interface */
export interface AxesProps {
  data: TrendsData;
  xScale: XScale;
  yScale: YScale;
  width: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  axisConfig: AxisConfig;
  isSkinny: boolean;
}

/* Render component */
export function Axes({
  data,
  xScale,
  yScale,
  width,
  marginBottom,
  marginLeft,
  marginRight,
  axisConfig,
  isSkinny,
}: AxesProps) {
  /* Config */
  const { HEIGHT, TICK_PADDING, Y_AXIS_LABEL_PADDING, MOBILE } = CONFIG;
  const { type, yAxisLabel = "" } = axisConfig || {};
  const yAxisLabelPadding = isSkinny
    ? MOBILE.Y_AXIS_LABEL_PADDING
    : Y_AXIS_LABEL_PADDING;
  // handles difference between per100k and percent_share charts
  const Y_AXIS_CONFIG = {
    [TYPES.HUNDRED_K]: {
      topLabel: yAxisLabel + " →", // reference to shortLabel from metricConfig
      bottomLabel: "",
      formatter: (d: string | number) => d, // per 100k could be interpolated here
    },
    [TYPES.PERCENT_RELATIVE_INEQUITY]: {
      topLabel:
        (getMaxNumber(data) || 0) <= 0 ? "" : "disproportionately high  →", // if there are positive numbers, append positive direction label
      bottomLabel:
        (getMinNumber(data) || 0) >= 0 ? "" : "← disproportionately low", // if there are negative numbers, append negative direction label
      formatter: (d: number) => (d === 0 ? "" : F.pct(d)), // if tick is 0, hide it, otherwise format as percent
    },
  };

  /* Refs */
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);

  /* Axes */
  const xAxis = axisBottom(xScale)
    .tickSize(0)
    .ticks(isSkinny ? 4 : null) // limits number of ticks on mobile
    // @ts-ignore
    .tickFormat(F.dateShort)
    .tickPadding(TICK_PADDING);

  const yAxis = axisLeft(yScale)
    .tickSizeOuter(0)
    .tickSizeInner(-width + marginRight + marginLeft) // creates grid lines
    // @ts-ignore
    .tickFormat(Y_AXIS_CONFIG[type]?.formatter)
    .tickPadding(TICK_PADDING / 2);

  /* Effects */

  /* Inject axes using d3 */
  useEffect(() => {
    if (xAxisRef.current && yAxisRef.current) {
      select(xAxisRef.current)
        .transition()
        // @ts-ignore
        .call(xAxis);

      select(yAxisRef.current)
        .transition()
        // @ts-ignore
        .call(yAxis)
        // styles the y grid lines after render (we think)
        .call((g) =>
          g
            .selectAll(".tick line")
            .attr("opacity", 0.2)
            .attr("stroke-dasharray", 5)
        );
    }
  }, [data, xScale, yScale, xAxis, yAxis]);

  const dates = getDates(data);
  const startDate = getPrettyDate(dates[0]);
  const endDate = getPrettyDate(dates[dates.length - 1]);

  const optionalPct = !yAxisLabel ? "%" : "";

  return (
    <g>
      {/* Axes */}
      <g className={styles.Axes}>
        {/* X-Axis */}
        <g
          className={styles.xAxis}
          ref={xAxisRef}
          transform={`translate(0, ${HEIGHT - marginBottom})`}
          aria-label={`x axis as months ranging from ${startDate} through ${endDate}`}
          role="group"
          tabIndex={0}
        />
        {/* Y-Axis */}
        <g
          className={styles.yAxis}
          ref={yAxisRef}
          transform={`translate(${marginLeft}, 0)`}
          aria-label={`y axis as ${
            yAxisLabel || " percent disproportionately high or low"
          } ranging from ${getMinNumber(data)}${optionalPct} to ${getMaxNumber(
            data
          )}${optionalPct}`}
          role="group"
          tabIndex={0}
        />
      </g>
      {/* Zero Line Indicator */}
      <g>
        <line
          x1={marginLeft}
          y1={yScale(0)}
          x2={width - marginRight}
          y2={yScale(0)}
          stroke="black" // handle in CSS?
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
          {/* only display x-axis label on desktop */}
          <text textAnchor="end" dy="8px" aria-hidden={true}>
            {isSkinny ? "" : "time →"}
          </text>
        </g>
        {/* Top Y-Axis Label */}
        <g
          aria-hidden={true}
          transform={`translate(${yAxisLabelPadding}, 0)rotate(-90)`}
        >
          <text textAnchor="end">{Y_AXIS_CONFIG[type]?.topLabel}</text>
        </g>
        {/* Bottom Y-Axis Label */}
        <g
          aria-hidden={true}
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
