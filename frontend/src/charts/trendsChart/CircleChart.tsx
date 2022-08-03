/**
 * A Circle Chart that visualizes data trends over time
 * Uses d3.js to apply data transformations and draw circles on an SVG
 * returns jsx of an svg group parent of many circle children distributed along an x-axis
 */

/* External Imports */
import React, { useMemo } from "react";
import { scaleSqrt, scaleLinear, extent, min, max } from "d3";

/* Local Imports */

/* Components */

/* Styles */
import styles from "./Trends.module.scss";

/* Constants */
import { CONFIG, UNKNOWN_GROUP_COLOR_EXTENT } from "./constants";
import { UnknownData, XScale } from "./types";

/* Helpers */

/* Define type interface */
export interface CircleChartProps {
  data: UnknownData;
  xScale: XScale;
  width: number;
  marginLeft: number;
  isMobile: boolean;
}

/* Render component */
export function CircleChart({
  data,
  xScale,
  width,
  marginLeft,
  isMobile,
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
    isMobile ? MOBILE.RADIUS_EXTENT : RADIUS_EXTENT
  );
  // color interpolation scale
  const colors = scaleLinear(
    unknownGroupExtent as [number, number],
    UNKNOWN_GROUP_COLOR_EXTENT
  );

  /* Memoized Values */
  // Unknown Legend Placement
  const legendXPlacement = useMemo(
    () => (isMobile ? width / 2 : marginLeft + (width - MARGIN.right) / 2),
    [isMobile]
  );
  /* Helpers */
  function getLegendValues() {
    const maxPercent = max(percentDomain);
    const minPercent = min(percentDomain);
    const midPercent =
      maxPercent && minPercent ? maxPercent - minPercent / 2 : 0;
    return [minPercent, midPercent, maxPercent];
  }

  return (
    <g>
      <g
        transform={`translate(0, ${
          HEIGHT - MARGIN.bottom_with_unknowns + 5 * MAX_RADIUS
        })`}
      >
        {data &&
          data.map(([date, percent]: [string, number], i: number) => {
            // return a circle for every data point on desktop, or every other data point on mobile (to create more space)
            if (!isMobile || (isMobile && i % 2 === 0)) {
              return (
                <g key={`dataCircleGroup-${i}`}>
                  <circle
                    r={rScale(percent)}
                    cx={xScale(new Date(date))}
                    fill={colors(percent)}
                    role="img"
                    aria-describedby={`circleText-${i}`}
                  />
                  <text className={styles.hidden} id={`circleText-${i}`}>
                    {percent?.toFixed(0)} percent
                  </text>
                </g>
              );
            }
          })}
      </g>
      {/* Circle Legend */}
      <g
        className={styles.CircleLegend}
        // Translate into position (dynamic based on width & height alloted)
        transform={`translate(${legendXPlacement}, ${HEIGHT - 3 * MAX_RADIUS})`}
      >
        {/* Legend Title */}
        <text textAnchor="middle" dy="-22px" className={styles.title}>
          Percent Unknown Group (%)
        </text>
        {/* Display circle for min, mid, and max values */}
        {getLegendValues().map((percent = 0, i) => (
          <g
            key={`legendCircle-${i}`}
            transform={`translate(${(i - 1) * 3 * MAX_RADIUS}, 0)`}
          >
            {/* Legend circle */}
            <circle
              r={rScale(percent)}
              fill={colors(percent)}
              role="img"
              aria-describedby={`circleLegendText-${i}`}
            />
            {/* Circle label annotation (percent represented by circle) */}
            <text textAnchor="middle" dy="28px" id={`circleLegendText-${i}`}>
              {percent?.toFixed(0)}
            </text>
          </g>
        ))}
      </g>
    </g>
  );
}
