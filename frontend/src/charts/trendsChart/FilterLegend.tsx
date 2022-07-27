/**
 * A Filter component styled as a legend which allows user to filter data
 * @param {object[]} data array of data objects whose group should be displayed in legend
 * @param {string[]} selectedGroups array of strings which correspond to groups that have been selected by user
 * @param {*} handleClick function that handles user button click
 * @param {*} colors function that uses d3 scales to interpolate color values for each group
 * returns jsx of a div of divs
 */

/* External Imports */
import React, { Key } from "react";

/* Local Imports */
import { ScaleOrdinal } from "d3";

/* Styles */
import styles from "./Trends.module.scss";

/* Components */

/* Constants */

/* Helpers */

/* Define type interface */
export interface FilterLegendProps {
  data: any[]; // TODO: stricter typing
  selectedGroups: string[];
  handleClick: (group: string) => void;
  colors: ScaleOrdinal<string | Key[][], string, void>;
}

/* Render component */
export function FilterLegend({
  data,
  selectedGroups,
  handleClick,
  colors,
}: FilterLegendProps) {
  return (
    // Legend Wrapper
    <div className={styles.FilterLegend}>
      {/* Legend Title */}
      <div className={styles.LegendTitle}>Select Group to Filter</div>
      {/* Legend Items Wrapper */}
      <div className={styles.LegendItems}>
        {/* Map over groups and create Legend Item for each */}
        {data &&
          data.map(([group]) => (
            // TODO: possibly need to extend key to be more unique
            // Legend Item Filter Button
            <button
              key={`legendItem-${group}`}
              aria-label={`Filter by ${group}`}
              className={styles.LegendItem}
              onClick={() => handleClick(group)} // send group name to parent on click
              // TODO: bring in CN library to handle this in CSS with toggling "selected" class
              // If there are selected groups, and the group is not selected, fade out, otherwise full opacity
              style={{
                opacity:
                  !selectedGroups.length || selectedGroups.includes(group)
                    ? 1
                    : 0.2,
              }}
            >
              {/* Legend Item color swatch */}
              {/* TODO: type background-color property */}
              <div
                className={styles.swatch}
                aria-hidden={true}
                style={{
                  /* @ts-ignore */
                  backgroundColor: colors(group),
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
