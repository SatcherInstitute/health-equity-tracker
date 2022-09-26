/**
 * A Filter component styled as a legend which allows user to filter data
 * @param {object[]} data array of timeseries data objects
 * @param {string[]} selectedGroups array of strings which correspond to groups that have been selected by user
 * @param {boolean} isSkinny a flag to determine whether user is viewing app below the mobile breakpoint or with resulting card column in compare mode below mobile breakpoint
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
import { BreakdownVar } from "../../data/query/Breakdowns";

/* Define type interface */
export interface FilterLegendProps {
  data: TrendsData; // TODO: stricter typing
  selectedGroups: string[];
  handleClick: (group: string | null) => void;
  groupLabel: string;
  isSkinny: boolean;
  chartWidth: number;
  breakdownVar: BreakdownVar;
}

/* Render component */
export function FilterLegend({
  data,
  selectedGroups,
  handleClick,
  groupLabel,
  isSkinny,
  chartWidth,
  breakdownVar,
}: FilterLegendProps) {
  const isComparing = window.location.href.includes("compare");
  const compareView = () => {
    if (isComparing) {
      if (chartWidth > 472 && chartWidth < 818) return "compare-view";
      if (chartWidth < 472) return "compare-view-small";
    }
    return "";
  };

  return (
    // Legend Wrapper
    <div className={styles.FilterLegend}>
      {/* Legend Title & Clear Button*/}
      <div className={styles.LegendTitle}>
        <label id="select-groups-label">Select groups to filter</label>
        <button
          aria-label={`Clear demographic filters`}
          aria-disabled={!selectedGroups?.length}
          className={!selectedGroups?.length ? styles.disabled : undefined} // disable button unless filters are applied
          onClick={() => handleClick(null)} // clear selected groups on click
        >
          {/* only display group in button name on desktop */}
          Clear {isSkinny ? "" : groupLabel} filter{" "}
          <span className={styles.CloseX}>✕</span>
        </button>
        {/* ✕×⨯✖× */}
      </div>
      {/* Legend Items Wrapper */}
      <menu
        aria-labelledby="select-groups-label"
        className={styles.LegendItems}
        id={isComparing ? compareView() : ""}
      >
        {/* Map over groups and create Legend Item for each */}
        {data &&
          data.map(([group]) => {
            const groupEnabled = selectedGroups.includes(group);

            // Legend Item Filter Button
            return (
              <button
                key={`legendItem-${group}`}
                aria-label={`Include ${group}`}
                aria-pressed={groupEnabled}
                className={styles.LegendItem}
                onClick={() => handleClick(group)} // send group name to parent on click
                // If there are selected groups, and the group is not selected, fade out, otherwise full opacity
                style={{
                  opacity: !selectedGroups?.length || groupEnabled ? 1 : 0.2, // failing a11y; need minimum opacity .55 ?
                }}
                name={isComparing ? compareView() : ""}
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
                <div>
                  {breakdownVar === "age" && group !== "All" && "Ages "}
                  {group}
                </div>
              </button>
            );
          })}
      </menu>
    </div>
  );
}
