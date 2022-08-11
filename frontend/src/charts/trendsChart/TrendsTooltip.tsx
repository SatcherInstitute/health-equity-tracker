/**
 * Tooltip for the charts that track trends over time
 * @param {object[]} data array of timeseries data objects
 * @param {string} selectedDate the date that is currently hovered
 * @param {object} axisConfig an object containing the configuration for axes - type and labels
 * @param {boolean} isMobile a flag to determine whether user is viewing app below the mobile breakpoint
 * returns jsx of a div with a grid of names, bar chart viz, and amounts


/* External Imports */
import React, { Fragment } from "react";

/* Local Imports */

/* Styles */
import styles from "./Trends.module.scss";

/* Components */

/* Constants */
import { TrendsData, GroupData, GroupValues, AxisConfig } from "./types";
import { TYPES, FORMATTERS as F, COLORS as C } from "./constants";

/* Helpers */
import {
  getAmountsByDate,
  sortDataDescending,
  translateXPctShare,
  getWidthPctShare,
  getWidthHundredK,
} from "./helpers";

/* Define type interface */
export interface TrendsTooltipProps {
  data: TrendsData;
  selectedDate: string | null;
  axisConfig: AxisConfig;
  isMobile: boolean;
}

/* Render component */
export function TrendsTooltip({
  data,
  selectedDate,
  axisConfig,
  isMobile,
}: TrendsTooltipProps) {
  const { type, yAxisLabel = "" } = axisConfig || {};

  // temp
  const codeDictionary = {
    "Native Hawaiian and Pacific Islander NH": "NHPI NH",
    "Hispanic or Latino": "Hisp/Lat",
    All: "All",
    "American Indian and Alaska Native NH": "AI/AN NH",
    "Black or African American NH": "Black NH",
    "Two or more races & Unrepresented race NH": "2/Unr NH",
    "White NH": "White NH",
    "Asian NH": "Asian NH",
  };

  const TYPE_CONFIG = {
    [TYPES.HUNDRED_K]: {
      UNIT: isMobile ? "" : " per 100k",
      width: getWidthHundredK,
      translate_x: (d: GroupValues) => 0,
      formatter: F.num,
    },
    [TYPES.PERCENT_SHARE]: {
      UNIT: " %",
      width: getWidthPctShare,
      translate_x: translateXPctShare,
      formatter: F.num,
    },
  };

  return (
    <div className={styles.Tooltip} role="tooltip">
      {/* Date title */}
      <div className={styles.title}>
        <div>{F.dateFromString(selectedDate || "")}</div>
        {/* if per 100k chart and on mobile, add subtitle with units */}
        {isMobile && type === TYPES.HUNDRED_K && (
          <div className={styles.subtitle}>{F.capitalize(yAxisLabel)}</div>
        )}
      </div>
      <div className={styles.grid}>
        {data &&
          sortDataDescending(data, selectedDate || "").map(
            ([group, d]: GroupData) => (
              <Fragment key={`tooltipRow-${group}`}>
                {/* TODO: update to use backend dictionary */}
                {/* group label - get from dictionary, if it doesn't exist, append group as label */}
                {/* @ts-ignore */}
                <div>{codeDictionary[group] || group}</div>
                {/* rectangle indicator */}
                <div
                  style={{
                    backgroundColor: C(group),
                    width: TYPE_CONFIG[type]?.width(d, selectedDate, data),
                    transform: `translateX(${TYPE_CONFIG[type]?.translate_x(
                      d,
                      selectedDate,
                      data
                    )}px)`,
                  }}
                  className={styles.bar}
                />
                {/* amount */}
                <div className={styles.label}>
                  {/* // TODO: update way rounding number */}
                  {TYPE_CONFIG[type]?.formatter(
                    getAmountsByDate(d, selectedDate)
                  )}
                  <span>{TYPE_CONFIG[type]?.UNIT}</span>
                </div>
              </Fragment>
            )
          )}
      </div>
    </div>
  );
}
