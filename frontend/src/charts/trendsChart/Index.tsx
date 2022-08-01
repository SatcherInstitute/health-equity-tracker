/**
 * A parent component with a Filter, Line Chart and optional Circle Chart that visualizes data trends over time
 * Uses d3.js to apply data transformations and draw the lines and circles on an SVG
 * returns jsx of a div encapsulating a div containing legend items which can be used to filter and and svg with data visualization
 */

/* External Imports */
import React, { useState, useMemo, useRef, useEffect } from "react";
import { scaleOrdinal, scaleTime, scaleLinear, extent, min, max } from "d3";

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
import { UnknownData, TrendsData, AxisConfig } from "./types";

/* Helpers */
import { filterDataByGroup } from "./helpers";

/* Define type interface */
export interface TrendsChartProps {
  data: TrendsData;
  unknown: UnknownData;
  axisConfig: AxisConfig;
}

/* Render component */
export function TrendsChart({
  data = [],
  unknown,
  axisConfig,
}: TrendsChartProps) {
  /* Config */
  const { STARTING_WIDTH, HEIGHT, MARGIN } = CONFIG;

  /* Refs */
  // parent container ref - used for setting svg width
  const containerRef = useRef(null);

  /* State Management */
  // Manages which group filters user has applied
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  // svg width
  const [width, setWidth] = useState<number>(STARTING_WIDTH);

  /* Effects */
  // resets svg width on window resize, only sets listener after first render (so ref is defined)
  useEffect(() => {
    function setDimensions() {
      // @ts-ignore
      setWidth(containerRef.current.getBoundingClientRect().width);
    }
    setDimensions();
    window.addEventListener("resize", setDimensions);
    return () => window.removeEventListener("resize", setDimensions);
  }, []);

  /* Memoized constants */

  // Data filtered by user selected
  const filteredData = useMemo(
    () =>
      selectedGroups.length ? filterDataByGroup(data, selectedGroups) : data,
    [selectedGroups]
  );

  // Display unknowns or not - affects margin below line chart
  const showUnknowns = useMemo(
    () => unknown && unknown.find(([, percent]) => percent > 0),
    [unknown]
  );

  // Margin below line chart - create space for unknown circles
  const marginBottom = useMemo(
    () => (showUnknowns ? MARGIN.bottom_with_unknowns : MARGIN.bottom),
    [unknown]
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
  const yValues =
    filteredData && filteredData.length
      ? filteredData.flatMap(([_, d]) =>
          d ? d.map(([_, amount]: [Date, number]) => amount || 0) : [0]
        )
      : [0];

  // @ts-ignore
  const yMin = min(yValues) < 0 ? min(yValues) : 0; // if numbers are all positive, y domain min should be 0
  const yMax = max(yValues) ? max(yValues) : 0;
  const yExtent: [number, number] = [yMin as number, yMax as number];

  const xScale = scaleTime(xExtent as [Date, Date], [
    MARGIN.left,
    (width as number) - MARGIN.right,
  ]);

  const yScale = scaleLinear(yExtent as [number, number], [
    HEIGHT - marginBottom,
    MARGIN.top,
  ]);

  /* Event Handlers */
  function handleClick(selectedGroup: string | null) {
    // Toggle selected group
    const newSelectedGroups =
      selectedGroup === null
        ? [] // if selectedGroup has null value, clear selected group array to remove filter
        : selectedGroups.includes(selectedGroup) // otherwise update the array with newly selected or removed group
        ? selectedGroups.filter((group) => group !== selectedGroup)
        : [...selectedGroups, selectedGroup];
    // Set new array of selected groups to state
    setSelectedGroups(newSelectedGroups);
  }

  return (
    // Container
    <div className={styles.TrendsChart} ref={containerRef}>
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
          width={width as number}
          role="img"
          // TODO link accompanying table here for accesibility
          // aria-describedby={}
        >
          {/* Chart Axes */}
          <Axes
            data={filteredData}
            xScale={xScale}
            yScale={yScale}
            width={width as number}
            marginBottom={marginBottom}
            axisConfig={axisConfig}
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
          {showUnknowns && (
            <CircleChart data={unknown} xScale={xScale} width={width} />
          )}
        </svg>
      )}
    </div>
  );
}
