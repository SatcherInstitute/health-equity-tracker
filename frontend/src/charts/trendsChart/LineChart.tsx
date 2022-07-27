/**
 * A Line Chart that visualizes data trends over time
 * Uses d3.js to apply data transformations and draw the lines on an SVG
 * returns jsx of an svg group containing paths

/* External Imports */
import React from "react";
import { ScaleTime } from "d3";

/* Local Imports */

/* Components */

/* Constants */

/* Helpers */

/* Define type interface */
export interface LineChartProps {
  data: {}[];
  xScale: ScaleTime<number, void, void>;
}

/* Render component */
export function LineChart(props: LineChartProps) {
  return <div>LineChartChart</div>;
}
