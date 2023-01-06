import React, { useState, useEffect } from "react";
import { Vega } from "react-vega";
import { useResponsiveWidth } from "../utils/hooks/useResponsiveWidth";
import { MetricConfig } from "../data/config/MetricConfig";
import { FieldRange } from "../data/utils/DatasetTypes";
import sass from "../styles/variables.module.scss";
import { ORDINAL } from "./utils";
import { ScaleType } from "./mapHelpers";
import { CAWP_DETERMINANTS } from "../data/variables/CawpProvider";
const COLOR_SCALE = "color_scale";
const DOT_SIZE_SCALE = "dot_size_scale";
export const UNKNOWN_SCALE = "unknown_scale";
export const GREY_DOT_SCALE = "grey_dot_scale";
export const ZERO_DOT_SCALE = "zero_dot_scale";
const RAW_VALUES = "raw_values";
const DATASET_VALUES = "dataset_values";
export const MISSING_PLACEHOLDER_VALUES = "missing_data";
export const LEGEND_SYMBOL_TYPE = "square";
export const LEGEND_TEXT_FONT = "inter";
export const NO_DATA_MESSAGE = "insufficient data";
export const EQUAL_DOT_SIZE = 200;
export const LEGEND_COLOR_COUNT = 7;

/*
   Legend renders a vega chart that just contains a legend.
*/
export interface LegendProps {
  // Data for which to create a legend.
  legendData?: Record<string, any>[]; // Dataset for which to calculate legend.
  // Metric in the data for which to create a legend.
  metric: MetricConfig;
  legendTitle: string;
  // May be used if standardizing legends across charts
  fieldRange?: FieldRange;
  // Quantile or quantize scale.
  scaleType: ScaleType;
  // Whether the dots all be the same size or increase in size.
  // Size does not correlate to the range size.
  sameDotSize?: boolean;
  // Alt text
  description: string;
  // Whether legend entries stack vertical or horizontal (allows responsive design)
  direction: "horizontal" | "vertical";
}

export function Legend(props: LegendProps) {
  const isCawp = CAWP_DETERMINANTS.includes(props.metric.metricId);

  const [ref, width] = useResponsiveWidth(
    100 /* default width during initialization */
  );

  // Initial spec state is set in useEffect
  const [spec, setSpec] = useState({});

  useEffect(() => {
    let colorScale: any = {
      name: COLOR_SCALE,
      type: props.scaleType,
      domain: { data: DATASET_VALUES, field: props.metric.metricId },
      range: { scheme: "yellowgreen", count: LEGEND_COLOR_COUNT },
    };
    if (props.fieldRange) {
      colorScale["domainMax"] = props.fieldRange.max;
      colorScale["domainMin"] = props.fieldRange.min;
    }

    const dotRange = props.sameDotSize
      ? Array(LEGEND_COLOR_COUNT).fill(EQUAL_DOT_SIZE)
      : [70, 120, 170, 220, 270, 320, 370];

    const legendList = [
      {
        fill: COLOR_SCALE,
        labelOverlap: "greedy",
        symbolType: LEGEND_SYMBOL_TYPE,
        size: DOT_SIZE_SCALE,
        format: "d",
        font: LEGEND_TEXT_FONT,
        labelFont: LEGEND_TEXT_FONT,
        direction: props.direction,
        orient: "left",
      },
      {
        fill: UNKNOWN_SCALE,
        symbolType: LEGEND_SYMBOL_TYPE,
        size: GREY_DOT_SCALE,
        font: LEGEND_TEXT_FONT,
        labelFont: LEGEND_TEXT_FONT,
        orient: props.direction === "vertical" ? "left" : "right",
      },
    ];

    // 0 should appear first, then numbers, then "insufficient"
    if (isCawp) legendList.reverse();

    setSpec({
      $schema: "https://vega.github.io/schema/vega/v5.json",
      description: props.description,
      background: sass.white,
      padding: 5,
      data: [
        {
          name: RAW_VALUES,
          values: props.legendData,
        },
        {
          name: DATASET_VALUES,
          source: RAW_VALUES,
          transform: [
            {
              type: "filter",
              expr: `isValid(datum["${props.metric.metricId}"]) && isFinite(+datum["${props.metric.metricId}"])`,
            },
          ],
        },
        {
          name: MISSING_PLACEHOLDER_VALUES,
          values: [{ missing: isCawp ? "0" : NO_DATA_MESSAGE }],
        },
      ],
      layout: { padding: 20, bounds: "full", align: "each" },
      marks: [
        {
          type: "group",
          name: "mark_group",
          legends: legendList,
        },
      ],
      scales: [
        {
          name: COLOR_SCALE,
          type: props.scaleType,
          domain: { data: DATASET_VALUES, field: props.metric.metricId },
          range: { scheme: "yellowgreen", count: LEGEND_COLOR_COUNT },
        },
        {
          name: DOT_SIZE_SCALE,
          type: props.scaleType,
          domain: { data: DATASET_VALUES, field: props.metric.metricId },
          range: dotRange,
        },
        {
          name: UNKNOWN_SCALE,
          type: ORDINAL,
          domain: { data: MISSING_PLACEHOLDER_VALUES, field: "missing" },
          range: [isCawp ? sass.mapMin : sass.unknownGrey],
        },
        {
          name: GREY_DOT_SCALE,
          type: ORDINAL,
          domain: { data: "missing_data", field: "missing" },
          range: [EQUAL_DOT_SIZE],
        },
      ],
    });
  }, [
    width,
    props.metric,
    props.legendTitle,
    props.scaleType,
    props.fieldRange,
    props.legendData,
    props.sameDotSize,
    props,
    isCawp,
  ]);

  return (
    <div ref={ref}>
      <Vega renderer="svg" spec={spec} width={width} actions={false} />
    </div>
  );
}
