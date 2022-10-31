/**
 * A Circle Chart that visualizes data trends over time
 * Uses d3.js to apply data transformations and draw circles on an SVG
 * @param {object[]} data array of timeseries data objects
 * @param {*} xScale a d3 time series scale function
 * @param {number} width the width of the svg
 * @param {string} groupLabel the label to apply to the legend title (e.g. 'race and ethnicity')
 * @param {boolean} isSkinny a flag to determine whether user is viewing app below the mobile breakpoint or with resulting card column in compare mode below mobile breakpoint
 * @param {string} selectedDate the date that is currently hovered
 * returns jsx of an svg group parent of many circle children distributed along an x-axis
 */

/* External Imports */
import React from "react";
import { scaleSqrt, scaleLinear, extent, min, max } from "d3";

/* Styles */
import styles from "./Trends.module.scss";

/* Constants */
import {
  CONFIG,
  UNKNOWN_GROUP_COLOR_EXTENT,
  FORMATTERS as F,
} from "./constants";
import { UnknownData, XScale } from "./types";

/* Define type interface */
export interface CircleChartProps {
  data: UnknownData;
  xScale: XScale;
  width: number;
  groupLabel: string;
  isSkinny: boolean;
  selectedDate: string | null;
  circleId: string;
}

/* Render component */
export function CircleChart({
  data,
  xScale,
  width,
  groupLabel,
  isSkinny,
  selectedDate,
  circleId,
}: CircleChartProps) {
  /* Config */
  const { HEIGHT, MARGIN, RADIUS_EXTENT, MOBILE } = CONFIG;
  const [, MAX_RADIUS] = RADIUS_EXTENT;

  /* Scales */
  const percentDomain =
    data && data.map(([_, percent]: [string, number]) => percent);
  const unknownGroupExtent: [number, number] | [undefined, undefined] =
    extent(percentDomain);

  // radius scale for circles
  const rScale = scaleSqrt(
    unknownGroupExtent as [number, number],
    isSkinny ? MOBILE.RADIUS_EXTENT : RADIUS_EXTENT
  );
  // color interpolation scale
  const colors = scaleLinear(
    unknownGroupExtent as [number, number],
    UNKNOWN_GROUP_COLOR_EXTENT
  );

  /* Memoized Values */
  const legendXPlacement = width / 2;

  /* Helpers */
  function getLegendValues() {
    const maxPercent = max(percentDomain);
    const minPercent = min(percentDomain);
    const midPercent =
      maxPercent != null && minPercent != null
        ? minPercent + (maxPercent - minPercent) / 2
        : 0;
    return [minPercent, midPercent, maxPercent];
  }

  const unknownCircleLegendText = `Legend: unknown ${groupLabel.toLowerCase()}`;

  return <div>testing</div>;
}
