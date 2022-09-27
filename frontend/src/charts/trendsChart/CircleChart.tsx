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
}

/* Render component */
export function CircleChart({
  data,
  xScale,
  width,
  groupLabel,
  isSkinny,
  selectedDate,
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
      maxPercent && minPercent ? minPercent + (maxPercent - minPercent) / 2 : 0;
    return [minPercent, midPercent, maxPercent];
  }

  const unknownCircleLegendText = `Legend: unknown ${groupLabel.toLowerCase()}`;

  return (
    <g>
      <g
        tabIndex={0}
        role="list"
        aria-label={unknownCircleLegendText + " per month"}
        transform={`translate(0, ${
          HEIGHT - MARGIN.bottom_with_unknowns + 5 * MAX_RADIUS
        })`}
      >
        {data &&
          data.map(([date, percent]: [string, number], i: number) => {
            const isEveryOtherBubble = i % 2 === 0;
            const thisBubbleIsHovered = selectedDate === date;
            const nothingIsHovered = !selectedDate;

            return (
              <g
                role="listitem"
                key={`dataCircleGroup-${i}`}
                transform={`translate(${xScale(new Date(date))}, 0)`}
                className={styles.UnknownCircles}
              >
                {/* return a circle for every data point on desktop, limited to every other on mobile (to create more space) and showing only the currently hovered bubble when hover state is active */}
                {(!isSkinny ||
                  (isSkinny && isEveryOtherBubble) ||
                  thisBubbleIsHovered) && (
                  <>
                    {(thisBubbleIsHovered || nothingIsHovered) && (
                      <circle
                        r={rScale(percent)}
                        fill={colors(percent)}
                        role="img"
                        aria-label={date}
                      />
                    )}
                    {/* show percent % annotation on hover */}
                    <text
                      id={`circleText-${i}`}
                      className={selectedDate === date ? "" : styles.invisible}
                      textAnchor={"middle"}
                      dy="26px"
                    >
                      {percent && F.pct(percent)} unknown
                    </text>
                  </>
                )}
              </g>
            );
          })}
      </g>
      {/* Circle Legend */}
      <g
        className={styles.CircleLegend}
        // Translate into position (dynamic based on width & height alloted)
        transform={`translate(${legendXPlacement}, ${
          HEIGHT - 5.25 * MAX_RADIUS
        })`}
      >
        <g
          role="list"
          aria-label="Legend for Unknown Demographic Bubbles"
          tabIndex={0}
        >
          {/* Display circle for min, mid, and max values */}
          {getLegendValues().map((percent = 0, i) => {
            let legendHelper = "";

            if (i === 0) legendHelper = "lowest ";
            if (i === 1) legendHelper = "middle ";
            if (i === 2) legendHelper = "highest ";

            return (
              <g
                key={`legendCircle-${i}`}
                transform={`translate(${(i - 1) * 6 * MAX_RADIUS}, 0)`}
                role="listitem"
              >
                {/* Legend circle */}
                <circle
                  r={rScale(percent)}
                  fill={colors(percent)}
                  role="presentational"
                />
                {/* Circle label annotation (percent represented by circle) */}
                <text
                  textAnchor="middle"
                  dy="28px"
                  id={`circleLegendText-${i}`}
                  aria-label={`${legendHelper} reported unknown value`}
                >
                  {F.pct(percent)}
                </text>
              </g>
            );
          })}
        </g>

        {/* Legend Title */}
        <text
          textAnchor="middle"
          dy="50px"
          className={styles.title}
          id="unknown-circle-legend-title"
        >
          {unknownCircleLegendText}
        </text>
      </g>
    </g>
  );
}
