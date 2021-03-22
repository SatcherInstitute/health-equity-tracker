import React, { useState, useEffect } from "react";
import { Vega } from "react-vega";
import { useResponsiveWidth } from "../utils/useResponsiveWidth";
import { MetricConfig } from "../data/config/MetricConfig";
import { FieldRange } from "../data/utils/DatasetTypes";
import { ScaleType } from "./ChoroplethMap";

const COLOR_SCALE = "color_scale";
const DOT_SIZE_SCALE = "dot_size_scale";

const RAW_VALUES = "raw_values";
const DATASET_VALUES = "dataset_values";

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
  // Size does not corrolate to the range size.
  sameDotSize?: boolean;
}

export function Legend(props: LegendProps) {
  const [ref, width] = useResponsiveWidth(
    100 /* default width during intialization */
  );

  // Initial spec state is set in useEffect
  const [spec, setSpec] = useState({});

  useEffect(() => {
    let colorScale: any = {
      name: COLOR_SCALE,
      type: props.scaleType,
      domain: { data: DATASET_VALUES, field: props.metric.metricId },
      range: { scheme: "yellowgreen", count: 7 },
    };
    if (props.fieldRange) {
      colorScale["domainMax"] = props.fieldRange.max;
      colorScale["domainMin"] = props.fieldRange.min;
    }

    const dotRange = props.sameDotSize
      ? [200, 200, 200, 200, 200, 200, 200]
      : [70, 120, 170, 220, 270, 320, 370];

    setSpec({
      $schema: "https://vega.github.io/schema/vega/v5.json",
      background: "white",
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
      ],
      layout: { padding: 20, bounds: "full", align: "each" },
      marks: [
        {
          type: "group",
          name: "mark_group",
          legends: [
            {
              fill: COLOR_SCALE,
              labelOverlap: "greedy",
              symbolType: "circle",
              size: DOT_SIZE_SCALE,
            },
          ],
        },
      ],
      scales: [
        {
          name: COLOR_SCALE,
          type: props.scaleType,
          domain: { data: DATASET_VALUES, field: props.metric.metricId },
          range: { scheme: "yellowgreen", count: 7 },
        },
        {
          name: DOT_SIZE_SCALE,
          type: props.scaleType,

          domain: { data: DATASET_VALUES, field: props.metric.metricId },
          range: dotRange,
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
  ]);

  return (
    <div ref={ref}>
      <Vega spec={spec} width={width} actions={false} />
    </div>
  );
}
