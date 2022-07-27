/**
 * A parent component with a Filter, Line Chart and optional Circle Chart that visualizes data trends over time
 * Uses d3.js to apply data transformations and draw the lines and circles on an SVG
 * returns jsx of a div encapsulating a div containing legend items which can be used to filter and and svg with data visualization
 */

/* External Imports */
import React, { useState, useMemo } from "react";
import { scaleOrdinal } from "d3";

/* Local Imports */

/* Data */
// temporary: todo - get from props
import data from "../../../public/tmp/trends.json";
/* Components */
import { FilterLegend } from "./FilterLegend";

/* Styles */
import styles from "./Trends.module.scss";

/* Constants */
import { colorRange } from "./constants";

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
    colorRange
  );

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
    <div className={styles.TrendsChart}>
      <FilterLegend
        data={data}
        selectedGroups={selectedGroups}
        colors={colors}
        handleClick={handleClick}
      />
    </div>
  );
}
