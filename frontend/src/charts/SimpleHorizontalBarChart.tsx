import React from "react";
import { Vega } from "react-vega";
import { Row } from "../data/utils/DatasetTypes";
import { useResponsiveWidth } from "../utils/useResponsiveWidth";
import {
  BreakdownVar,
  BreakdownVarDisplayName,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import { MetricConfig, MetricId } from "../data/config/MetricConfig";
import {
  addLineBreakDelimitersToField,
  MULTILINE_LABEL,
  AXIS_LABEL_Y_DELTA,
  oneLineLabel,
  addMetricDisplayColumn,
  PADDING_FOR_ACTIONS_MENU,
} from "./utils";
import sass from "../styles/variables.module.scss";
import { useMediaQuery } from "@material-ui/core";

// determine where (out of 100) to flip labels inside/outside the bar
const LABEL_SWAP_CUTOFF_PERCENT = 66;

// nested quotation mark format needed for Vega
const SINGLE_LINE_100K = ",' per 100k'";
const MULTI_LINE_100K = "+' per 100k'";
const SINGLE_LINE_PERCENT = "+'%'";

function getSpec(
  altText: string,
  data: Row[],
  width: number,
  breakdownVar: BreakdownVar,
  breakdownVarDisplayName: BreakdownVarDisplayName,
  measure: MetricId,
  measureDisplayName: string,
  // Column names to use for the display value of the metric. These columns
  // contains preformatted data as strings.
  barMetricDisplayColumnName: string,
  tooltipMetricDisplayColumnName: string,
  showLegend: boolean,
  barLabelBreakpoint: number,
  pageIsTiny: boolean,
  usePercentSuffix: boolean
): any {
  const MEASURE_COLOR = sass.altGreen;
  const BAR_HEIGHT = 60;
  const BAR_PADDING = 0.2;
  const DATASET = "DATASET";

  // create proper datum suffix, either % or single/multi line 100k
  const barLabelSuffix = usePercentSuffix
    ? SINGLE_LINE_PERCENT
    : pageIsTiny
    ? SINGLE_LINE_100K
    : MULTI_LINE_100K;

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
    description: altText,
    background: sass.white,
    autosize: { resize: true, type: "fit-x" },
    width: width - PADDING_FOR_ACTIONS_MENU,
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
        // chart bars
        name: "measure_bars",
        interactive: false,
        type: "rect",
        style: ["bar"],
        description: data.length + " items",
        from: { data: DATASET },
        encode: {
          enter: {
            tooltip: {
              signal: `${oneLineLabel(
                breakdownVar
              )} + ', ${measureDisplayName}: ' + datum.${tooltipMetricDisplayColumnName}`,
            },
          },
          update: {
            fill: { value: MEASURE_COLOR },
            x: { scale: "x", field: measure },
            x2: { scale: "x", value: 0 },
            y: { scale: "y", field: breakdownVar },
            height: { scale: "y", band: 1 },
          },
        },
      },
      {
        // ALT TEXT: invisible, verbose labels
        name: "measure_a11y_text_labels",
        type: "text",
        from: { data: DATASET },
        encode: {
          update: {
            y: { scale: "y", field: breakdownVar, band: 0.8 },
            opacity: {
              signal: "0",
            },
            fontSize: { value: 0 },
            text: {
              signal: `${oneLineLabel(
                breakdownVar
              )} + ': ' + datum.${tooltipMetricDisplayColumnName} + ' ${measureDisplayName}'`,
            },
          },
        },
      },
      {
        name: "measure_text_labels",
        type: "text",
        style: ["text"],
        from: { data: DATASET },
        aria: false, // this data accessible in alt_text_labels
        encode: {
          enter: {
            tooltip: {
              signal: `${oneLineLabel(
                breakdownVar
              )} + ', ${measureDisplayName}: ' + datum.${tooltipMetricDisplayColumnName}`,
            },
          },
          update: {
            align: {
              signal: `if(datum.${measure} > ${barLabelBreakpoint}, "right", "left")`,
            },
            baseline: { value: "middle" },
            dx: {
              signal: `if(datum.${measure} > ${barLabelBreakpoint}, -5, 5)`,
            },
            dy: {
              signal: pageIsTiny ? -20 : 0,
            },
            fill: {
              signal: `if(datum.${measure} > ${barLabelBreakpoint}, "white", "black")`,
            },
            x: { scale: "x", field: measure },
            y: { scale: "y", field: breakdownVar, band: 0.8 },
            text: {
              // on smallest screens send an array of strings to place on multiple lines
              signal: `[datum.${tooltipMetricDisplayColumnName}${barLabelSuffix}]`,
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
        nice: !pageIsTiny, //on desktop, extend x-axis to a "nice" value
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
        titleAnchor: pageIsTiny ? "end" : "null",
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
              limit: { value: 100 },
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
  filename?: string;
  usePercentSuffix?: boolean;
}

export function SimpleHorizontalBarChart(props: SimpleHorizontalBarChartProps) {
  const [ref, width] = useResponsiveWidth(
    100 /* default width during initialization */
  );

  // calculate page size to determine if tiny mobile or not
  const pageIsTiny = useMediaQuery("(max-width:400px)");

  const dataWithLineBreakDelimiter = addLineBreakDelimitersToField(
    props.data,
    props.breakdownVar
  );
  const [dataWithDisplayCol, barMetricDisplayColumnName] =
    addMetricDisplayColumn(props.metric, dataWithLineBreakDelimiter);
  // Omit the % symbol for the tooltip because it's included in shortVegaLabel.
  const [data, tooltipMetricDisplayColumnName] = addMetricDisplayColumn(
    props.metric,
    dataWithDisplayCol,
    /* omitPctSymbol= */ true
  );

  const barLabelBreakpoint =
    Math.max(...props.data.map((row) => row[props.metric.metricId])) *
    (LABEL_SWAP_CUTOFF_PERCENT / 100);

  return (
    <div ref={ref}>
      <Vega
        renderer="svg"
        downloadFileName={`${props.filename} - Health Equity Tracker`}
        spec={getSpec(
          /* altText  */ `Bar Chart showing ${props.filename}`,
          /* data  */ data,
          /* width  */ width,
          /* breakdownVar  */ props.breakdownVar,
          /* breakdownVarDisplayName  */ BREAKDOWN_VAR_DISPLAY_NAMES[
            props.breakdownVar
          ],
          /* measure  */ props.metric.metricId,
          /* measureDisplayName  */ props.metric.shortVegaLabel,
          /* barMetricDisplayColumnName  */ barMetricDisplayColumnName,
          /* tooltipMetricDisplayColumnName  */ tooltipMetricDisplayColumnName,
          /* showLegend  */ props.showLegend,
          /* barLabelBreakpoint  */ barLabelBreakpoint,
          /* pageIsTiny  */ pageIsTiny,
          /* usePercentSuffix  */ props.usePercentSuffix || false
        )}
        // custom 3-dot options menu
        actions={
          props.hideActions
            ? false
            : {
                export: { png: true, svg: true },
                source: false,
                compiled: false,
                editor: false,
              }
        }
      />
    </div>
  );
}
