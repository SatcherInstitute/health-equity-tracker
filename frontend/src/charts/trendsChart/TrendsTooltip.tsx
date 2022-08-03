/* External Imports */
import React, { Fragment } from "react";
import { timeFormat, descending, max } from "d3";

/* Local Imports */

/* Styles */
import styles from "./Trends.module.scss";

/* Components */

/* Constants */
import { TrendsData, ColorScale, GroupData, GroupValues } from "./types";
import { TYPES } from "./constants";

/* Helpers */
import { getAmountsByDate, sortDataDescending, getMaxNumber } from "./helpers";

/* Define type interface */
export interface TrendsTooltipProps {
  data: TrendsData;
  selectedDate: string | null;
  selectedGroups: string[];
  colors: ColorScale;
  type: string;
}

/* Render component */
export function TrendsTooltip({
  data,
  selectedDate,
  selectedGroups,
  colors,
  type,
}: TrendsTooltipProps) {
  // temp
  const codeDictionary = {
    "Native Hawaiian and Pacific Islander (Non-Hispanic)": "NHPI",
    "Hispanic or Latino": "HISP",
    All: "ALL",
    "American Indian and Alaska Native (Non-Hispanic)": "AIAN",
    "Black or African American (Non-Hispanic)": "BLACK",
    "Two or more races & Unrepresented race (Non-Hispanic)": "MORE",
    "White (Non-Hispanic)": "WHITE",
    "Asian (Non-Hispanic)": "ASIAN",
  };

  const TYPE_CONFIG = {
    [TYPES.HUNDRED_K]: {
      UNIT: " per 100k",
      width: (d: GroupValues) =>
        (getAmountsByDate(d, selectedDate) / (getMaxNumber(data) || 1)) * 50,
      translate_x: (d: GroupValues) => 0,
    },
    [TYPES.PERCENT_SHARE]: {
      UNIT: " %",
      width: (d: GroupValues) =>
        (Math.abs(getAmountsByDate(d, selectedDate)) /
          (getMaxNumber(data) || 1)) *
        25,
      translate_x: (d: GroupValues) =>
        getAmountsByDate(d, selectedDate) > 0
          ? 25
          : 25 +
            (getAmountsByDate(d, selectedDate) / (getMaxNumber(data) || 1)) *
              25,
    },
  };

  return (
    <div className={styles.Tooltip}>
      {/* Date title */}
      <div className={styles.title}>
        {timeFormat("%B %e, %Y")(new Date(selectedDate || ""))}
      </div>
      <div className={styles.grid}>
        {data &&
          sortDataDescending(data, selectedDate || "").map(
            ([group, d]: GroupData) => (
              <Fragment key={`tooltipRow-${group}`}>
                {/* TODO: update to use backend dictionary */}
                {/* @ts-ignore */}
                <div>{codeDictionary[group]}</div>
                <div
                  style={{
                    backgroundColor: colors(group),
                    width: TYPE_CONFIG[type]?.width(d),
                    transform: `translateX(${TYPE_CONFIG[type]?.translate_x(
                      d
                    )}px)`,
                  }}
                  className={styles.bar}
                />
                <div className={styles.label}>
                  {getAmountsByDate(d, selectedDate)?.toFixed(0)}
                  <span>{TYPE_CONFIG[type]?.UNIT}</span>
                </div>
              </Fragment>
            )
          )}
      </div>
    </div>
  );
}
