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
import { Axes } from "./Axes";
import { CircleChart } from "./CircleChart";

/* Styles */
import styles from "./Trends.module.scss";

/* Constants */
import { COLOR_RANGE, CONFIG } from "./constants";
import { UnknownData, TrendsData } from "./types";

/* Helpers */
import { filterDataByGroup } from "./helpers";

/* Define type interface */
export interface TrendsChartProps {
  data: TrendsData;
  unknown: UnknownData;
  type: string;
}

/* Render component */
export function TrendsChart({ data = [], unknown, type }: TrendsChartProps) {
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
    data.map(([group]) => group),
    COLOR_RANGE
  );

  // TODO: how to handle case when extent is made of undefined values
  // implement error boundary or error handling?
  const xExtent: [Date, Date] | [undefined, undefined] = extent(
    filteredData && filteredData.length
      ? filteredData.flatMap(([_, d]) =>
          d
            ? // @ts-ignore
              d.map(([date]: [Date]) =>
                typeof date === "string" ? new Date(date) : new Date()
              )
            : [new Date()]
        )
      : [new Date()]
  );

  const yExtent: [number, number] | [undefined, undefined] = extent(
    filteredData && filteredData.length
      ? filteredData.flatMap(([_, d]) =>
          d ? d.map(([_, amount]: [Date, number]) => amount || 0) : [0]
        )
      : [0]
  );

  const xScale = scaleTime(xExtent as [Date, Date], [
    MARGIN.left,
    WIDTH - MARGIN.right,
  ]);

  const yScale = scaleLinear(yExtent as [number, number], [
    HEIGHT - MARGIN.bottom,
    MARGIN.top,
  ]);

  /* Event Handlers */
  function handleClick(selectedGroup: string) {
    // Toggle selected group
    const newSelectedGroups = selectedGroups.includes(selectedGroup)
      ? selectedGroups.filter((group) => group !== selectedGroup)
      : [...selectedGroups, selectedGroup];
    // Set new array of selected groups to state
    setSelectedGroups(newSelectedGroups);
  }

  return (
    // Container
    <div className={styles.TrendsChart}>
      <div className={styles.FilterWrapper}>
        {/* Filter */}
        {data && colors && (
          <FilterLegend
            data={data}
            selectedGroups={selectedGroups}
            colors={colors}
            handleClick={handleClick}
          />
        )}
      </div>
      {/* Chart */}
      {filteredData && xScale && yScale && colors && (
        <svg
          height={CONFIG.HEIGHT}
          width={CONFIG.WIDTH}
          role="img"
          // TODO link accompanying table here for accesibility
          // aria-describedby={}
        >
          {/* Chart Axes */}
          <Axes
            data={filteredData}
            xScale={xScale}
            yScale={yScale}
            type={type}
            yAxisLabel="Cases per 100K"
          />
          {/* Lines */}
          <LineChart
            data={filteredData}
            xScale={xScale}
            yScale={yScale}
            colors={colors}
          />
          {/* // TODO: move this check up into parent component (only pass unknown if there is an unknown greater than 0) */}
          {/* Only render unknown group circles when there is data for which the group is unknown */}
          {unknown && unknown.find(([, percent]) => percent > 0) && (
            <CircleChart data={unknown} xScale={xScale} />
          )}
        </svg>
      )}
    </div>
  );
}
