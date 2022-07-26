/**
 * A parent component with a Filter, Line Chart and optional Circle Chart that visualizes data trends over time
 * Uses d3.js to apply data transformations and draw the lines and circles on an SVG
 * returns jsx of a div encapsulating a div containing legend items which can be used to filter and and svg with data visualization
 */

/* External Imports */
import React from "react";

/* Local Imports */

/* Data */
// temporary: todo - get from props
import data from "../../../public/tmp/trends.json";
/* Components */

/* Constants */

/* Helpers */

/* Define type interface */
export interface TrendsChartProps {
  data: {}[];
  unknown: {}[];
  type: string;
}

/* Render component */
export default function TrendsChart(props: TrendsChartProps) {}
