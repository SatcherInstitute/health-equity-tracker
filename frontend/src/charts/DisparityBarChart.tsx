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
  addMetricDisplayColumn,
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
  // lightMetricDisplayColumnName and darkMetricDisplayColumnName are the column
  // names to use for the display value of the metrics. These columns contain
  // preformatted data as strings.
  lightMetricDisplayColumnName: string,
  darkMetricDisplayColumnName: string,
  stacked?: boolean,
  // thirdMetricDisplayColumnName is the name used when we display original ACS population
  // comparison metrics rather than the adjusted KFF number (because they aren't available)
  showThirdMeasure?: boolean,
  thirdMeasure?: string,
  thirdMeasureDisplayName?: string,
  thirdMetricDisplayColumnName?: string
): any {
  const BAR_HEIGHT = stacked ? 40 : 10;
  const BAR_PADDING = 0.1;
  const DARK_MEASURE_COLOR = "#0B5420";
  const LIGHT_MEASURE_COLOR = "#91C684";
  const THIRD_MEASURE_OUTLINE_COLOR = LIGHT_MEASURE_COLOR;
  const THIRD_MEASURE_OUTLINE_WIDTH = 2.5;
  const THIRD_MEASURE_OPACITY = 0.33;
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

  // defaults for most charts
  const LEGEND_COLORS = [LIGHT_MEASURE_COLOR, DARK_MEASURE_COLOR];
  const LEGEND_DOMAINS = [lightMeasureDisplayName, darkMeasureDisplayName];
  const ALL_MARKS = [
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
            )} + ', ${lightMeasureDisplayName}: ' + datum.${lightMetricDisplayColumnName}`,
          },
        },
        update: {
          fill: { value: LIGHT_MEASURE_COLOR },
          ariaRoleDescription: { value: "bar" },
          strokeWidth: { value: 0 },
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
            )} + ', ${darkMeasureDisplayName}: ' + datum.${darkMetricDisplayColumnName}`,
          },
        },
        update: {
          fill: { value: DARK_MEASURE_COLOR },
          strokeWidth: { value: 0 },
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
            signal: `datum.${darkMetricDisplayColumnName} + "${metricDisplayName}"`,
          },
        },
      },
    },
  ];

  // when needed, add THIRD MEASURE to the VEGA SPEC
  if (showThirdMeasure) {
    // LEGEND_COLORS.unshift(THIRD_MEASURE_OUTLINE_COLOR);
    // LEGEND_DOMAINS.unshift(thirdMeasureDisplayName!);
    ALL_MARKS.push({
      name: "thirdMeasure_bars",
      type: "rect",
      style: ["bar"],
      from: { data: DATASET },
      encode: {
        enter: {
          tooltip: {
            signal: `${oneLineLabel(
              breakdownVar
            )} + ', ${thirdMeasureDisplayName}: ' + datum.${thirdMetricDisplayColumnName}`,
          },
        },
        update: {
          // @ts-ignore
          stroke: { value: THIRD_MEASURE_OUTLINE_COLOR },
          strokeWidth: { value: THIRD_MEASURE_OUTLINE_WIDTH },
          fill: { value: LIGHT_MEASURE_COLOR },
          fillOpacity: { value: THIRD_MEASURE_OPACITY },
          ariaRoleDescription: { value: "bar" },
          x: { scale: "x", field: thirdMeasure! },
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
    });
  }

  function maxValueInField(field: string) {
    return Math.max(
      ...data
        .map((row) => row[field])
        .filter((value: number | undefined) => value !== undefined)
    );
  }

  const largerOfLightOrDark =
    maxValueInField(lightMeasure) > maxValueInField(darkMeasure)
      ? lightMeasure
      : darkMeasure;

  let measureWithLargerDomain;

  if (showThirdMeasure) {
    measureWithLargerDomain =
      maxValueInField(largerOfLightOrDark) >
      maxValueInField(thirdMeasure as string)
        ? largerOfLightOrDark
        : thirdMeasure;
  } else {
    measureWithLargerDomain = largerOfLightOrDark;
  }

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
    marks: ALL_MARKS,
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
        domain: LEGEND_DOMAINS,
        range: LEGEND_COLORS,
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
  filename?: string;
  show2ndPopulationCompare?: boolean;
  thirdMetric?: MetricConfig;
}

export function DisparityBarChart(props: DisparityBarChartProps) {
  console.log("third metric inside bar", props.thirdMetric);
  const [ref, width] = useResponsiveWidth(
    100 /* default width during initialization */
  );

  const dataWithLineBreakDelimiter = addLineBreakDelimitersToField(
    props.data,
    props.breakdownVar
  );
  // Omit the % symbol because it's included in shortVegaLabel.
  const [
    dataWithLightMetric,
    lightMetricDisplayColumnName,
  ] = addMetricDisplayColumn(
    props.lightMetric,
    dataWithLineBreakDelimiter,
    /* omitPctSymbol= */ true
  );
  const [
    dataWithDarkMetric,
    darkMetricDisplayColumnName,
  ] = addMetricDisplayColumn(
    props.darkMetric,
    dataWithLightMetric,
    /* omitPctSymbol= */ true
  );

  let dataDoublePop, thirdMetricDisplayColumnName;
  if (props.show2ndPopulationCompare) {
    // build a 3rd color to be used instead of lightMetric when data available
    [dataDoublePop, thirdMetricDisplayColumnName] = addMetricDisplayColumn(
      props.thirdMetric!,
      dataWithDarkMetric,
      /* omitPctSymbol= */ true
    );
  } else {
    dataDoublePop = dataWithDarkMetric;
  }

  // if using 2nd pop AND ACS and KFF both have a population comparison per item, use KFF.
  // Otherwise use ACS
  const data = props.show2ndPopulationCompare
    ? dataDoublePop.map((item: any) => {
        if (
          item.vaccine_population_pct > 0 &&
          item.acs_vaccination_population_pct > 0
        ) {
          item.acs_vaccination_population_pct = 0;
        }
        return item;
      })
    : dataDoublePop;

  return (
    <div ref={ref}>
      {console.log("data into vega", data)}
      <Vega
        // custom 3-dot options for states, hidden on territories
        actions={{
          export: { png: true, svg: true },
          source: false,
          compiled: false,
          editor: false,
        }}
        downloadFileName={`${props.filename} - Health Equity Tracker`}
        spec={getSpec(
          data,
          width,
          props.breakdownVar,
          BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar],
          props.lightMetric.metricId,
          props.lightMetric.shortVegaLabel,
          props.darkMetric.metricId,
          props.darkMetric.shortVegaLabel,
          props.metricDisplayName,
          lightMetricDisplayColumnName,
          darkMetricDisplayColumnName,
          props.stacked,
          props.show2ndPopulationCompare,
          props.thirdMetric?.metricId,
          props.thirdMetric?.shortVegaLabel,
          thirdMetricDisplayColumnName
        )}
      />
    </div>
  );
}
