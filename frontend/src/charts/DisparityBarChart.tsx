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
  thickMeasure: string,
  thickMeasureDisplayName: string,
  thinMeasure: string,
  thinMeasureDisplayName: string,
  metricDisplayName: string,
  stacked?: boolean
): any {
  const BAR_HEIGHT = stacked ? 40 : 10;
  const BAR_PADDING = 0.1;
  const THIN_RATIO = 0.3;
  const SIDE_BY_SIDE_ONE_BAR_RATIO = 0.4;
  const SIDE_BY_SIDE_FULL_BAR_RATIO = 4;
  const THIN_MEASURE_COLOR = "#0B5420";
  const THICK_MEASURE_COLOR = "#9ACFC0";
  const DATASET = "DATASET";
  const WIDTH_PADDING_FOR_SNOWMAN_MENU = 50;

  function maxValueInField(field: string) {
    return Math.max(
      ...data
        .map((row) => row[field])
        .filter((value: number | undefined) => value !== undefined)
    );
  }

  const measureWithLargerDomain =
    maxValueInField(thickMeasure) > maxValueInField(thinMeasure)
      ? thickMeasure
      : thinMeasure;

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
      {
        name: "y_step",
        value: stacked ? BAR_HEIGHT : BAR_HEIGHT * SIDE_BY_SIDE_FULL_BAR_RATIO,
      },
      {
        name: "height",
        update: "bandspace(domain('y').length, 0.1, 0.05) * y_step",
      },
    ],
    marks: [
      {
        name: "thickMeasure_bars",
        type: "rect",
        style: ["bar"],
        from: { data: DATASET },
        encode: {
          enter: {
            tooltip: {
              signal: `${oneLineLabel(
                breakdownVar
              )} + ', ${thickMeasureDisplayName}: ' + datum. ${thickMeasure}+'%'`,
            },
          },
          update: {
            fill: { value: THICK_MEASURE_COLOR },
            ariaRoleDescription: { value: "bar" },
            x: { scale: "x", field: thickMeasure },
            x2: { scale: "x", value: 0 },
            y: { scale: "y", field: breakdownVar },
            yc: {
              scale: "y",
              field: breakdownVar,
              offset: stacked
                ? (BAR_HEIGHT - BAR_HEIGHT * BAR_PADDING) / 2
                : ((BAR_HEIGHT - BAR_HEIGHT * BAR_PADDING) *
                    SIDE_BY_SIDE_FULL_BAR_RATIO) /
                    2 -
                  BAR_HEIGHT * SIDE_BY_SIDE_ONE_BAR_RATIO * 2,
            },
            height: {
              scale: "y",
              band: stacked ? 1 : SIDE_BY_SIDE_ONE_BAR_RATIO,
            },
          },
        },
      },
      {
        name: "thinMeasure_bars",
        type: "rect",
        style: ["bar"],
        from: { data: DATASET },
        encode: {
          enter: {
            tooltip: {
              signal: `${oneLineLabel(
                breakdownVar
              )} + ', ${thinMeasureDisplayName}: ' + datum. ${thinMeasure}+'%'`,
            },
          },
          update: {
            fill: { value: THIN_MEASURE_COLOR },
            ariaRoleDescription: { value: "bar" },
            x: { scale: "x", field: thinMeasure },
            x2: { scale: "x", value: 0 },
            yc: {
              scale: "y",
              field: breakdownVar,
              offset: stacked
                ? (BAR_HEIGHT - BAR_HEIGHT * BAR_PADDING) / 2
                : ((BAR_HEIGHT - BAR_HEIGHT * BAR_PADDING) *
                    SIDE_BY_SIDE_FULL_BAR_RATIO) /
                    2 +
                  BAR_HEIGHT * SIDE_BY_SIDE_ONE_BAR_RATIO * 2,
            },
            height: {
              scale: "y",
              band: stacked ? THIN_RATIO : SIDE_BY_SIDE_ONE_BAR_RATIO,
            },
          },
        },
      },
      {
        name: "thinMeasure_text_labels",
        type: "text",
        style: ["text"],
        from: { data: DATASET },
        encode: {
          update: {
            align: { value: "left" },
            baseline: { value: "middle" },
            dx: { value: 3 },
            fill: { value: "black" },
            x: { scale: "x", field: thinMeasure },
            y: { scale: "y", field: breakdownVar, band: 0.5 },
            yc: {
              scale: "y",
              field: breakdownVar,
              offset: stacked
                ? (BAR_HEIGHT - BAR_HEIGHT * BAR_PADDING) / 2
                : ((BAR_HEIGHT - BAR_HEIGHT * BAR_PADDING) * 4) / 2 +
                  BAR_HEIGHT,
            },
            text: {
              signal: `isValid(datum["${thinMeasure}"]) ? datum["${thinMeasure}"] + "${metricDisplayName}" : "" `,
            },
          },
        },
      },
    ],
    scales: [
      {
        name: "x",
        type: "linear",
        domain: { data: DATASET, field: measureWithLargerDomain },
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
        domain: [thickMeasureDisplayName, thinMeasureDisplayName],
        range: [THICK_MEASURE_COLOR, THIN_MEASURE_COLOR],
      },
    ],
    axes: [
      {
        scale: "x",
        orient: "bottom",
        gridScale: "y",
        grid: true,
        tickCount: { signal: `ceil(width/${BAR_HEIGHT})` },
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
        title: `${thickMeasureDisplayName} vs. ${thinMeasureDisplayName} `,
        labelFlush: true,
        labelOverlap: true,
        tickCount: { signal: `ceil(width/${BAR_HEIGHT})` },
        zindex: 0,
      },
      {
        scale: "y",
        orient: "left",
        grid: false,
        title: breakdownVarDisplayName,
        zindex: 0,
        tickSize: 5,
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
    legends: [
      {
        fill: "variables",
        orient: "top",
        padding: 4,
      },
    ],
  };
}
export interface DisparityBarChartProps {
  data: Row[];
  thickMetric: MetricConfig;
  thinMetric: MetricConfig;
  breakdownVar: BreakdownVar;
  metricDisplayName: string;
  // Stacked will render one thin bar on top of a thicker bar
  // Not stacked will show two equally sized bars side by side
  stacked?: boolean;
}

export function DisparityBarChart(props: DisparityBarChartProps) {
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
          props.thickMetric.metricId,
          props.thickMetric.shortVegaLabel,
          props.thinMetric.metricId,
          props.thinMetric.shortVegaLabel,
          props.metricDisplayName,
          props.stacked
        )}
      />
    </div>
  );
}
