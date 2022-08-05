/**
 * A Filter component styled as a legend which allows user to filter data
 * @param {object[]} data array of timeseries data objects
 * @param {string[]} selectedGroups array of strings which correspond to groups that have been selected by user
 * @param {boolean} isMobile a flag to determine whether user is viewing app below the mobile breakpoint
 * @param {*} handleClick function that handles user button click
 * returns jsx of a div of divs
 */

/* External Imports */
import React from "react";

/* Styles */
import styles from "./Trends.module.scss";

/* Constants */
import { TrendsData } from "./types";
import { COLORS as C } from "./constants";

/* Define type interface */
export interface FilterLegendProps {
  data: TrendsData; // TODO: stricter typing
  selectedGroups: string[];
  handleClick: (group: string | null) => void;
  groupLabel: string;
  isMobile: boolean;
}

/* Render component */
export function FilterLegend({
  data,
  selectedGroups,
  handleClick,
  groupLabel,
  isMobile,
}: FilterLegendProps) {
  return (
    // Legend Wrapper
    <div className={styles.FilterLegend}>
      {/* Legend Title & Clear Button*/}
      <div className={styles.LegendTitle}>
        <div>Select Group to Filter</div>
        <button
          aria-label={`Clear filter`}
          className={!selectedGroups.length ? styles.disabled : undefined} // disable button unless filters are applied
          onClick={() => handleClick(null)} // clear selected groups on click
        >
          {/* only display group in button name on desktop */}
          Clear {isMobile ? "" : groupLabel} Filter x
        </button>
      </div>
      {/* Legend Items Wrapper */}
      <div className={styles.LegendItems}>
        {/* Map over groups and create Legend Item for each */}
        {data &&
          data.map(([group]) => (
            // Legend Item Filter Button
            <button
              key={`legendItem-${group}`}
              aria-label={`Filter by ${group}`}
              className={styles.LegendItem}
              onClick={() => handleClick(group)} // send group name to parent on click
              // If there are selected groups, and the group is not selected, fade out, otherwise full opacity
              style={{
                opacity:
                  !selectedGroups.length || selectedGroups.includes(group)
                    ? 1
                    : 0.2,
              }}
            >
              {/* Legend Item color swatch */}
              <div
                className={styles.swatch}
                aria-hidden={true}
                style={{
                  /* @ts-ignore */
                  backgroundColor: C(group),
                }}
              />
              {/* Legend Item Label */}
              <div>{group}</div>
            </button>
          ))}
      </div>
    </div>
  );
}
