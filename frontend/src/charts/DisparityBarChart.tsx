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
  // TESTING place AIAL NHPI pop compare in different color columns due to ACS not KFF
  altLightMeasure?: string,
  altLightMeasureDisplayName?: string,
  altLightMetricDisplayColumnName?: string,
  showAltPopCompare?: boolean
): any {
  const BAR_HEIGHT = stacked ? 40 : 10;
  const BAR_PADDING = 0.1;
  const DARK_MEASURE_COLOR = "#0B5420";
  const LIGHT_MEASURE_COLOR = "#91C684";
  const ALT_LIGHT_MEASURE_COLOR = "#89d5cc";
  const ALT_LIGHT_MEASURE_OPACITY = 0.6;
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

  // when needed, add ALT_LIGHT MEASURE to the VEGA SPEC
  if (showAltPopCompare) {
    LEGEND_COLORS.unshift(ALT_LIGHT_MEASURE_COLOR);
    LEGEND_DOMAINS.unshift(altLightMeasureDisplayName!);
    ALL_MARKS.push({
      name: "altLightMeasure_bars",
      type: "rect",
      style: ["bar"],
      from: { data: DATASET },
      encode: {
        enter: {
          tooltip: {
            signal: `${oneLineLabel(
              breakdownVar
            )} + ', ${altLightMeasureDisplayName}: ' + datum.${altLightMetricDisplayColumnName}`,
          },
        },
        update: {
          // @ts-ignore
          // stroke: { value: DARK_MEASURE_COLOR },
          // strokeWidth: {
          // value: ALT_LIGHT_MEASURE_OUTLINE_WIDTH
          // },
          fill: { value: ALT_LIGHT_MEASURE_COLOR },
          // @ts-ignore
          fillOpacity: { value: ALT_LIGHT_MEASURE_OPACITY },
          ariaRoleDescription: { value: "bar" },
          x: { scale: "x", field: altLightMeasure! },
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
  showAltPopCompare?: boolean;
}

export function DisparityBarChart(props: DisparityBarChartProps) {
  const [ref, width] = useResponsiveWidth(
    100 /* default width during intialization */
  );

  let dataFromProps = props.data;

  // move AIAN and NHPI into their own properties for STATE/RACE/VACCINE (since KFF doesnt provide pop compare metrics)
  const { showAltPopCompare } = props;

  if (showAltPopCompare) {
    dataFromProps = props.data.map((item) => {
      if (
        item["race_and_ethnicity"] ===
          "American Indian and Alaska Native (Non-Hispanic)" ||
        item["race_and_ethnicity"] ===
          "Native Hawaiian and Pacific Islander (Non-Hispanic)"
      ) {
        const popPct = item.vaccine_population_pct;
        const itemWithAltPopCompare = { ...item };
        itemWithAltPopCompare.acs_vaccine_population_pct = popPct;
        delete itemWithAltPopCompare.vaccine_population_pct;
        return itemWithAltPopCompare;
      }
      return item;
    });
  }

  console.log("data after swaps", dataFromProps);

  // add *~* for line breaks in column axis labels
  const dataWithLineBreakDelimiter = addLineBreakDelimitersToField(
    dataFromProps,
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

  const altLightMetric: MetricConfig = {
    fullCardTitleName: "Population Share (ACS)",
    metricId: "acs_vaccine_population_pct",
    shortVegaLabel: "% of population (ACS)",
    type: "pct_share",
  };

  // only integrate alt light if showing alt population compare
  const [data, altLightMetricDisplayColumnName] = showAltPopCompare
    ? addMetricDisplayColumn(
        altLightMetric,
        dataWithDarkMetric,
        /* omitPctSymbol= */ true
      )
    : [dataWithDarkMetric, ""];

  return (
    <div ref={ref}>
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
          showAltPopCompare ? altLightMetric.metricId : "",
          showAltPopCompare ? altLightMetric.shortVegaLabel : "",
          showAltPopCompare ? altLightMetricDisplayColumnName : "",
          showAltPopCompare
        )}
      />
    </div>
  );
}
