/**
 * Tooltip for the charts that track trends over time
 * @param {object[]} data array of timeseries data objects
 * @param {string} selectedDate the date that is currently hovered
 * @param {object} axisConfig an object containing the configuration for axes - type and labels
 * @param {boolean} isSkinny a flag to determine whether user is viewing app below the mobile breakpoint or with resulting card column in compare mode below mobile breakpoint
 * returns jsx of a div with a grid of names, bar chart viz, and amounts


/* External Imports */
import React, { Fragment } from "react";

/* Local Imports */

/* Styles */
import styles from "./Trends.module.scss";

/* Components */

/* Constants */
import { TrendsData, GroupData, TimeSeries, AxisConfig } from "./types";
import { TYPES, FORMATTERS as F, COLORS as C } from "./constants";

/* Helpers */
import {
  getAmountsByDate,
  sortDataDescending,
  translateXPctShare,
  getWidthPctShare,
  getWidthHundredK,
} from "./helpers";

// temp
const codeDictionary = {
  // race and ethnicity NH
  "Native Hawaiian and Pacific Islander (NH)": "NHPI (NH)",
  "Hispanic or Latino": "Hisp/Lat",
  All: "All",
  "American Indian and Alaska Native (NH)": "AI/AN (NH)",
  "Black or African American (NH)": "Black (NH)",
  "Two or more races & Unrepresented race (NH)": "2/Unr (NH)",
  "White (NH)": "White (NH)",
  "Asian (NH)": "Asian (NH)",
  //  race and ethnicity CAWP
  "All Women": "All",
  "Asian American & Pacific Islander Women": "AAPI",
  "Middle Eastern & North African Women": "MENA",
  "Native American, Alaska Native, & Native Hawaiian Women": "AI/AN/NH",
  "Latinas and Hispanic Women": "Hisp/Lat",
  "Women of an Unrepresented Race": "Unrepr.",
  "Black or African American Women": "Black",
  "White Women": "White",
};

/* Define type interface */
export interface TrendsTooltipProps {
  data: TrendsData;
  selectedDate: string | null;
  axisConfig: AxisConfig;
  isSkinny: boolean;
}

/* Render component */
export function TrendsTooltip({
  data,
  selectedDate,
  axisConfig,
  isSkinny,
}: TrendsTooltipProps) {
  const { type, yAxisLabel = "" } = axisConfig || {};

  const TYPE_CONFIG = {
    [TYPES.HUNDRED_K]: {
      UNIT: isSkinny ? "" : " per 100k",
      width: getWidthHundredK,
      translate_x: (d: TimeSeries) => 0,
      formatter: F.num,
    },
    [TYPES.PERCENT_SHARE]: {
      UNIT: "",
      width: getWidthHundredK,
      translate_x: (d: TimeSeries) => 0,
      formatter: F.pct,
    },
    [TYPES.PERCENT_RELATIVE_INEQUITY]: {
      UNIT: " %",
      width: getWidthPctShare,
      translate_x: translateXPctShare,
      formatter: F.plusNum,
    },
  };

  return (
    <div className={styles.Tooltip} role="tooltip">
      {/* Date title */}
      <div className={styles.title}>
        <div>{F.dateFromString(selectedDate || "")}</div>
        {/* if per 100k chart and on mobile, add subtitle with units */}
        {isSkinny && type === TYPES.HUNDRED_K && (
          <div className={styles.subtitle}>{F.capitalize(yAxisLabel)}</div>
        )}
      </div>
      <div className={styles.grid}>
        {data &&
          sortDataDescending(data, selectedDate || "").map(
            ([group, d]: GroupData) => {
              // get value or "<1" to prevent potentially misleading "0 per 100k" on rates

              let value = TYPE_CONFIG[type]?.formatter(
                getAmountsByDate(d, selectedDate)
              );
              if (value === "0" && axisConfig.type === "per100k") value = "<1";

              return (
                <Fragment key={`tooltipRow-${group}`}>
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
                    <span>{value}</span>
                    <span>{TYPE_CONFIG[type]?.UNIT}</span>
                  </div>
                </Fragment>
              );
            }
          )}
      </div>
    </div>
  );
}
