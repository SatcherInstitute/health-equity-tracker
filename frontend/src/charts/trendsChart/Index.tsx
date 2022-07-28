/**
 * A parent component with a Filter, Line Chart and optional Circle Chart that visualizes data trends over time
 * Uses d3.js to apply data transformations and draw the lines and circles on an SVG
 * returns jsx of a div encapsulating a div containing legend items which can be used to filter and and svg with data visualization
 */

/* External Imports */
import React, { useState, useMemo } from "react";
import { scaleOrdinal, scaleTime, scaleLinear, extent, ScaleTime } from "d3";

/* Local Imports */

/* Components */
import { FilterLegend } from "./FilterLegend";
import { LineChart } from "./LineChart";

/* Styles */
import styles from "./Trends.module.scss";

/* Constants */
import { COLOR_RANGE, CONFIG } from "./constants";

/* Helpers */
import { filterDataByGroup } from "./helpers";

/* Define type interface */
export interface TrendsChartProps {
  data: any[]; // TODO: stricter typing
  unknown: {}[];
  type: string;
}

/* Render component */
export function TrendsChart({ data, unknown, type }: TrendsChartProps) {
  /* Config */
  const { WIDTH, HEIGHT, MARGIN } = CONFIG;

  /* State Management */
  // Manages which group filters user has applied
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // Data filtered by user selected
  const filteredData = useMemo(
    () =>
      selectedGroups.length ? filterDataByGroup(data, selectedGroups) : data,
    [selectedGroups]
  );

  /* Scales */
  const colors = scaleOrdinal(
    data.map(([cat]) => cat),
    COLOR_RANGE
  );

  // @ts-ignore
  // TODO: filter out undefineds
  const xExtent: [Date, Date] = extent(
    filteredData.flatMap(([_, d]) => d.map(([date]: [Date]) => new Date(date)))
  );

  // @ts-ignore
  // TODO: filter out undefineds
  const yExtent: [number, number] = extent(
    filteredData.flatMap(([_, d]) =>
      d.map(([_, amount]: [Date, number]) => amount)
    )
  );

  const xScale = scaleTime(xExtent, [MARGIN.left, WIDTH - MARGIN.right]);

  const yScale = scaleLinear(yExtent, [HEIGHT - MARGIN.bottom, MARGIN.top]);

  /* Event Handlers */
  function handleClick(selectedGroup: string) {
    // Toggle selection
    const newSelectedGroups = selectedGroups.includes(selectedGroup)
      ? selectedGroups.filter((group) => group !== selectedGroup)
      : [...selectedGroups, selectedGroup];
    // Set new array of selected groups to state
    setSelectedGroups(newSelectedGroups);
  }

  return (
    // Container
    <div className={styles.TrendsChart}>
      {/* Filter */}
      <FilterLegend
        data={data}
        selectedGroups={selectedGroups}
        colors={colors}
        handleClick={handleClick}
      />
      {/* Chart */}
      <svg height={CONFIG.HEIGHT} width={CONFIG.WIDTH}>
        <LineChart
          data={filteredData}
          xScale={xScale}
          yScale={yScale}
          colors={colors}
        />
      </svg>
    </div>
  );
}
