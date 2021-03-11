import React, { useState, useEffect } from "react";
import { Vega } from "react-vega";
import { useResponsiveWidth } from "../utils/useResponsiveWidth";
import { MetricConfig } from "../data/config/MetricConfig";
import { FieldRange } from "../data/utils/DatasetTypes";
import { ScaleType } from "./ChoroplethMap";
import { Alert } from "@material-ui/lab";

type NumberFormat = "raw" | "percentage";

const COLOR_SCALE = "COLOR_SCALE";

const DATASET_VALUES = "DATASET_VALUES";
// TODO - consider moving standardized column names, like fips, to variables shared between here and VariableProvider

export interface LegendProps {
  legendData?: Record<string, any>[]; // Dataset for which to calculate legend
  metric: MetricConfig;
  legendTitle: string;
  numberFormat?: NumberFormat;
  hideLegend?: boolean;
  fieldRange?: FieldRange;
  scaleType: ScaleType;
  sameDotSize?: boolean;
}

export function Legend(props: LegendProps) {
  const [ref, width] = useResponsiveWidth(
    100 /* default width during intialization */
  );

  // Initial spec state is set in useEffect
  const [spec, setSpec] = useState({});

  useEffect(() => {
    /* SET UP LEGEND */
    // TODO - Legends should be scaled exactly the same the across compared charts. Looks misleading otherwise.
    let legendList = [];
    let legend: any = {
      fill: COLOR_SCALE,
      direction: "horizontal",
      orient: "bottom-left",
      title: props.legendTitle,
      font: "monospace",
      labelFont: "monospace",
      offset: 10,
    };
    if (props.numberFormat === "percentage") {
      legend["format"] = "0.1%";
    }
    if (!props.hideLegend) {
      legendList.push(legend);
    }

    let colorScale: any = {
      name: COLOR_SCALE,
      type: props.scaleType,
      domain: { data: DATASET_VALUES, field: props.metric.metricId },
      range: { scheme: "yellowgreenblue", count: 7 },
    };
    if (props.fieldRange) {
      colorScale["domainMax"] = props.fieldRange.max;
      colorScale["domainMin"] = props.fieldRange.min;
    }

    const dotRange = props.sameDotSize
      ? [200, 200, 200, 200, 200, 200, 200]
      : [70, 120, 170, 220, 270, 320, 370];

    const blah = {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      description:
        "Horizontally concatenated charts that show different types of discretizing scales.",
      background: "white",
      padding: 5,
      data: [
        {
          name: "source_0",
          values: props.legendData,
        },
        {
          name: DATASET_VALUES,
          source: "source_0",
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
          legends: [
            {
              fill: COLOR_SCALE,
              labelOverlap: "greedy",
              symbolType: "circle",
              size: "concat_0_size",
            },
          ],
        },
      ],
      scales: [
        {
          name: COLOR_SCALE,
          type: props.scaleType,
          domain: { data: DATASET_VALUES, field: props.metric.metricId },
          range: { scheme: "yellowgreenblue", count: 7 },
        },
        {
          name: "concat_0_size",
          type: props.scaleType,

          domain: { data: DATASET_VALUES, field: props.metric.metricId },
          range: dotRange,
        },
      ],
    };

    setSpec(blah);
  }, [
    width,
    props.metric,
    props.legendTitle,
    props.numberFormat,
    props.scaleType,
    props.hideLegend,
    props.fieldRange,
    props.legendData,
    props.sameDotSize,
  ]);

  return (
    <div
      ref={ref}
      style={{
        width: "80%",
        margin: "auto",
      }}
    >
      {!props.sameDotSize && (
        <Alert severity="info">
          This scale is optimized for visualizing this demographic. Use the
          “show full breakdown” button to compare demographics.
        </Alert>
      )}
      <Vega spec={spec} width={width} actions={false} />
    </div>
  );
}
