/**
 * A group of circles that appear on hover
 * Uses d3.js to apply data transformations and draw circles on an SVG
 * returns jsx of an svg group parent of many circle children distributed along an y-axis
 */

/* External Imports */
import React from "react";

/* Local Imports */

/* Components */

/* Styles */
import styles from "./Trends.module.scss";

/* Constants */
import { getAmountsByDate } from "./helpers";

import { TrendsData, XScale, ColorScale, YScale } from "./types";

/* Helpers */

/* Define type interface */
export interface HoverCirclesProps {
  data: TrendsData;
  xScale: XScale;
  yScale: YScale;
  colors: ColorScale;
  selectedDate: string | null;
}

/* Render component */
export function HoverCircles({
  data,
  xScale,
  yScale,
  selectedDate,
  colors,
}: HoverCirclesProps) {
  return (
    <g>
      {/* iterate over data and draw circle for each group */}
      {data &&
        data.map(([group, d]: [string, [string, number][]], i) => (
          <g key={`hoverCircleGroup-${i}`}>
            <circle
              className={styles.HoverCircle}
              r={4}
              // use transform instead of cy to apply css transitions
              // note - x positioning is handled by parent
              transform={`translate(0,${yScale(
                getAmountsByDate(d, selectedDate)
              )})`}
              fill={colors(group)}
            />
          </g>
        ))}
    </g>
  );
}
