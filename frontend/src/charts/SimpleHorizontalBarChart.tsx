import React from "react";
import { Vega } from "react-vega";
import { Row } from "../data/utils/DatasetTypes";
import { useResponsiveWidth } from "../utils/useResponsiveWidth";
import {
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import { MetricConfig } from "../data/config/MetricConfig";
import {
  addLineBreakDelimitersToField,
  MULTILINE_LABEL,
  AXIS_LABEL_Y_DELTA,
  oneLineLabel,
} from "./utils";

function getSpec(
  data: Record<string, any>[],
  width: number,
  breakdownVar: string,
  breakdownVarDisplayName: string,
  measure: string,
  measureDisplayName: string,
  showLegend: boolean
): any {
  const BAR_HEIGHT = 40;
  const BAR_PADDING = 0.1;
  const MEASURE_COLOR = "#0B5240";
  const DATASET = "DATASET";
  const WIDTH_PADDING_FOR_SNOWMAN_MENU = 50;

  const legends = showLegend
    ? [
        {
          fill: "variables",
          orient: "top",
          padding: 4,
        },
      ]
    : [];
  return {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    background: "white",
    padding: 5,
    autosize: { resize: true, type: "fit-x" },
    width: width - WIDTH_PADDING_FOR_SNOWMAN_MENU,
    style: "cell",
    data: [
      {
        name: DATASET,
        values: data,
      },
    ],
    signals: [
      { name: "y_step", value: BAR_HEIGHT },
      {
        name: "height",
        update: "bandspace(domain('y').length, 0.1, 0.05) * y_step",
      },
    ],
    marks: [
      {
        name: "measure_bars",
        type: "rect",
        style: ["bar"],
        from: { data: DATASET },
        encode: {
          enter: {
            tooltip: {
              signal: `${oneLineLabel(
                breakdownVar
              )} + ', ${measureDisplayName}: ' + format(datum["${measure}"], ",")`,
            },
          },
          update: {
            fill: { value: MEASURE_COLOR },
            ariaRoleDescription: { value: "bar" },
            x: { scale: "x", field: measure },
            x2: { scale: "x", value: 0 },
            y: { scale: "y", field: breakdownVar },
            height: { scale: "y", band: 1 },
          },
        },
      },
      {
        name: "measure_text_labels",
        type: "text",
        style: ["text"],
        from: { data: DATASET },
        encode: {
          update: {
            align: { value: "left" },
            baseline: { value: "middle" },
            dx: { value: 3 },
            fill: { value: "black" },
            x: { scale: "x", field: measure },
            y: { scale: "y", field: breakdownVar, band: 0.8 },
            text: {
              signal: `isValid(datum["${measure}"]) ? format(datum["${measure}"], ",") : "" `,
            },
          },
        },
      },
    ],
    scales: [
      {
        name: "x",
        type: "linear",
        domain: { data: DATASET, field: measure },
        range: [0, { signal: "width" }],
        nice: true,
        zero: true,
      },
      {
        name: "y",
        type: "band",
        domain: {
          data: DATASET,
          field: breakdownVar,
        },
        range: { step: { signal: "y_step" } },
        paddingInner: BAR_PADDING,
      },
      {
        name: "variables",
        type: "ordinal",
        domain: [measureDisplayName],
        range: [MEASURE_COLOR],
      },
    ],
    axes: [
      {
        scale: "x",
        orient: "bottom",
        gridScale: "y",
        grid: true,
        tickCount: { signal: "ceil(width/40)" },
        domain: false,
        labels: false,
        aria: false,
        maxExtent: 0,
        minExtent: 0,
        ticks: false,
        zindex: 0,
      },
      {
        scale: "x",
        orient: "bottom",
        grid: false,
        title: measureDisplayName,
        labelFlush: true,
        labelOverlap: true,
        tickCount: { signal: "ceil(width/40)" },
        zindex: 0,
      },
      {
        scale: "y",
        orient: "left",
        grid: false,
        title: breakdownVarDisplayName,
        zindex: 0,
        encode: {
          labels: {
            update: {
              text: { signal: MULTILINE_LABEL },
              baseline: { value: "bottom" },
              // Limit at which line is truncated with an ellipsis
              limit: { value: 90 },
              dy: { signal: AXIS_LABEL_Y_DELTA },
            },
          },
        },
      },
    ],
    legends: legends,
  };
}

export interface SimpleHorizontalBarChartProps {
  data: Row[];
  metric: MetricConfig;
  breakdownVar: BreakdownVar;
  showLegend: boolean;
  hideActions?: boolean;
}

export function SimpleHorizontalBarChart(props: SimpleHorizontalBarChartProps) {
  const [ref, width] = useResponsiveWidth(
    100 /* default width during intialization */
  );

  let dataWithLineBreakDelimiter = addLineBreakDelimitersToField(
    props.data,
    props.breakdownVar
  );
  dataWithLineBreakDelimiter.sort((a, b) =>
    a[props.breakdownVar].localeCompare(b[props.breakdownVar])
  );

  return (
    <div ref={ref}>
      <Vega
        spec={getSpec(
          dataWithLineBreakDelimiter,
          width,
          props.breakdownVar,
          BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar],
          props.metric.metricId,
          props.metric.shortVegaLabel,
          props.showLegend
        )}
        actions={props.hideActions ? false : true}
      />
    </div>
  );
}
