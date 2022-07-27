/**
 * A Filter component styled as a legend which allows user to filter data
 * returns jsx of a div of divs
 */

/* External Imports */
import React, { Key } from "react";

/* Local Imports */
import { ScaleOrdinal, style } from "d3";

import styles from "./Trends.module.scss";
/* Components */

/* Constants */

/* Helpers */

/* Define type interface */
export interface FilterLegendProps {
  data: any[]; // TODO: stricter typing
  onClick: () => void;
  colors: ScaleOrdinal<string | Key[][], string, void>;
}

/* Render component */
export function FilterLegend({ data, onClick, colors }: FilterLegendProps) {
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
              onClick={onClick}
            >
              {/* Legend Item color swatch */}
              {/* TODO: type background-color property */}
              {/* @ts-ignore */}
              <div
                className={styles.swatch}
                style={{ backgroundColor: colors(group) }}
              />
              {/* Legend Item Label */}
              <div>{group}</div>
            </button>
          ))}
      </div>
    </div>
  );
}
