/* External Imports */
import React, { Fragment } from "react";
import { timeFormat } from "d3";

/* Local Imports */

/* Styles */
import styles from "./Trends.module.scss";

/* Components */

/* Constants */
import { TrendsData, ColorScale, GroupData, GroupValues } from "./types";
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
  colors: ColorScale;
  type: string;
}

/* Render component */
export function TrendsTooltip({
  data,
  selectedDate,
  colors,
  type,
}: TrendsTooltipProps) {
  // temp
  const codeDictionary = {
    "Native Hawaiian and Pacific Islander NH)": "NHPI",
    "Hispanic or Latino": "HISP",
    All: "ALL",
    "American Indian and Alaska Native NH)": "AIAN",
    "Black or African American NH)": "BLACK",
    "Two or more races & Unrepresented race NH)": "MORE",
    "White NH)": "WHITE",
    "Asian NH)": "ASIAN",
  };

  const TYPE_CONFIG = {
    [TYPES.HUNDRED_K]: {
      UNIT: " per 100k",
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
    <div className={styles.Tooltip}>
      {/* Date title */}
      <div className={styles.title}>{F.dateFromString(selectedDate || "")}</div>
      <div className={styles.grid}>
        {data &&
          sortDataDescending(data, selectedDate || "").map(
            ([group, d]: GroupData) => (
              <Fragment key={`tooltipRow-${group}`}>
                {/* TODO: update to use backend dictionary */}
                {/* group label */}
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
