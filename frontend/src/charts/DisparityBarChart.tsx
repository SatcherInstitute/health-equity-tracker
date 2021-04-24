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
  lightMeasure: string,
  lightMeasureDisplayName: string,
  darkMeasure: string,
  darkMeasureDisplayName: string,
  metricDisplayName: string,
  stacked?: boolean
): any {
  const BAR_HEIGHT = stacked ? 40 : 10;
  const BAR_PADDING = 0.1;
  const DARK_MEASURE_COLOR = "#0B5420";
  const LIGHT_MEASURE_COLOR = "#91C684";
  const DATASET = "DATASET";
  const WIDTH_PADDING_FOR_SNOWMAN_MENU = 50;

  const THIN_RATIO = 0.3;
  const STACKED_BAND_HEIGHT = BAR_HEIGHT - BAR_HEIGHT * BAR_PADDING;

  const SIDE_BY_SIDE_ONE_BAR_RATIO = 0.4;
  const SIDE_BY_SIDE_FULL_BAR_RATIO = 5;
  const SIDE_BY_SIDE_BAND_HEIGHT =
    SIDE_BY_SIDE_FULL_BAR_RATIO * BAR_HEIGHT -
    SIDE_BY_SIDE_FULL_BAR_RATIO * BAR_HEIGHT * BAR_PADDING;
  const MIDDLE_OF_BAND = SIDE_BY_SIDE_BAND_HEIGHT / 2;
  const SIDE_BY_SIDE_OFFSET =
    BAR_HEIGHT * SIDE_BY_SIDE_ONE_BAR_RATIO * (SIDE_BY_SIDE_FULL_BAR_RATIO / 2);

  function maxValueInField(field: string) {
    return Math.max(
      ...data
        .map((row) => row[field])
        .filter((value: number | undefined) => value !== undefined)
    );
  }

  const measureWithLargerDomain =
    maxValueInField(lightMeasure) > maxValueInField(darkMeasure)
      ? lightMeasure
      : darkMeasure;

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
        name: "lightMeasure_bars",
        type: "rect",
        style: ["bar"],
        from: { data: DATASET },
        encode: {
          enter: {
            tooltip: {
              signal: `${oneLineLabel(
                breakdownVar
              )} + ', ${lightMeasureDisplayName}: ' + datum. ${lightMeasure}+'%'`,
            },
          },
          update: {
            fill: { value: LIGHT_MEASURE_COLOR },
            ariaRoleDescription: { value: "bar" },
            x: { scale: "x", field: lightMeasure },
            x2: { scale: "x", value: 0 },
            y: { scale: "y", field: breakdownVar },
            yc: {
              scale: "y",
              field: breakdownVar,
              offset: stacked
                ? STACKED_BAND_HEIGHT / 2
                : MIDDLE_OF_BAND - SIDE_BY_SIDE_OFFSET,
            },
            height: {
              scale: "y",
              band: stacked ? 1 : SIDE_BY_SIDE_ONE_BAR_RATIO,
            },
          },
        },
      },
      {
        name: "darkMeasure_bars",
        type: "rect",
        style: ["bar"],
        from: { data: DATASET },
        encode: {
          enter: {
            tooltip: {
              signal: `${oneLineLabel(
                breakdownVar
              )} + ', ${darkMeasureDisplayName}: ' + datum. ${darkMeasure}+'%'`,
            },
          },
          update: {
            fill: { value: DARK_MEASURE_COLOR },
            ariaRoleDescription: { value: "bar" },
            x: { scale: "x", field: darkMeasure },
            x2: { scale: "x", value: 0 },
            yc: {
              scale: "y",
              field: breakdownVar,
              offset: stacked
                ? STACKED_BAND_HEIGHT / 2
                : MIDDLE_OF_BAND + SIDE_BY_SIDE_OFFSET,
            },
            height: {
              scale: "y",
              band: stacked ? THIN_RATIO : SIDE_BY_SIDE_ONE_BAR_RATIO,
            },
          },
        },
      },
      {
        name: "darkMeasure_text_labels",
        type: "text",
        style: ["text"],
        from: { data: DATASET },
        encode: {
          update: {
            align: { value: "left" },
            baseline: { value: "middle" },
            dx: { value: 3 },
            fill: { value: "black" },
            x: { scale: "x", field: darkMeasure },
            y: { scale: "y", field: breakdownVar, band: 0.5 },
            yc: {
              scale: "y",
              field: breakdownVar,
              offset: stacked
                ? STACKED_BAND_HEIGHT / 2
                : MIDDLE_OF_BAND + BAR_HEIGHT,
            },
            text: {
              signal: `isValid(datum["${darkMeasure}"]) ? datum["${darkMeasure}"] + "${metricDisplayName}" : "" `,
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
        domain: [lightMeasureDisplayName, darkMeasureDisplayName],
        range: [LIGHT_MEASURE_COLOR, DARK_MEASURE_COLOR],
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
        title: `${lightMeasureDisplayName} vs. ${darkMeasureDisplayName} `,
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
              limit: { value: 100 },
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
  lightMetric: MetricConfig;
  darkMetric: MetricConfig;
  breakdownVar: BreakdownVar;
  metricDisplayName: string;
  // Stacked will render one dark bar on top of a lighter bar
  // Not stacked will show two equally sized bars side by side
  stacked?: boolean;
}

export function DisparityBarChart(props: DisparityBarChartProps) {
  const [ref, width] = useResponsiveWidth(
    100 /* default width during intialization */
  );

  const dataWithLineBreakDelimiter = addLineBreakDelimitersToField(
    props.data,
    props.breakdownVar
  );

  return (
    <div ref={ref}>
      <Vega
        spec={getSpec(
          dataWithLineBreakDelimiter,
          width,
          props.breakdownVar,
          BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar],
          props.lightMetric.metricId,
          props.lightMetric.shortVegaLabel,
          props.darkMetric.metricId,
          props.darkMetric.shortVegaLabel,
          props.metricDisplayName,
          props.stacked
        )}
      />
    </div>
  );
}
