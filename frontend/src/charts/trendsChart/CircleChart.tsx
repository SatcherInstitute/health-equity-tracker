/**
 * A Circle Chart that visualizes data trends over time
 * Uses d3.js to apply data transformations and draw circles on an SVG
 * returns jsx of an svg group parent of many circle children distributed along an x-axis
 */

/* External Imports */
import React from "react";
import { ScaleTime } from "d3";

/* Local Imports */

/* Components */

/* Constants */

/* Helpers */

/* Define type interface */
export interface CircleChartProps {
  data: {}[];
  xScale: ScaleTime<number, void, void>;
}

/* Render component */
export function CircleChart(props: CircleChartProps) {
  return <div>CirclesChart</div>;
}
