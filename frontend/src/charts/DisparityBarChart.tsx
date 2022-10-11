import React from "react";
import { Vega } from "react-vega";
import { Row } from "../data/utils/DatasetTypes";
import { useResponsiveWidth } from "../utils/hooks/useResponsiveWidth";
import {
  BreakdownVar,
  BreakdownVarDisplayName,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
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
import { LEGEND_TEXT_FONT } from "./Legend";
import { useMediaQuery } from "@material-ui/core";
import { AIAN, NHPI, RACE } from "../data/utils/Constants";

const LABEL_SWAP_CUTOFF_PERCENT = 66; // bar labels will be outside if below this %, or inside bar if above

function getSpec(
  altText: string,
  data: Record<string, any>[],
  chartTitle: string | string[],
  width: number,
  breakdownVar: BreakdownVar,
  breakdownVarDisplayName: BreakdownVarDisplayName,
  lightMeasure: MetricId,
  lightMeasureDisplayName: string,
  darkMeasure: MetricId,
  darkMeasureDisplayName: string,
  metricDisplayName: string,
  // lightMetricDisplayColumnName and darkMetricDisplayColumnName are the column
  // names to use for the display value of the metrics. These columns contain
  // preformatted data as strings.
  lightMetricDisplayColumnName: string,
  darkMetricDisplayColumnName: string,
  barLabelBreakpoint: number,
  pageIsTiny: boolean,
  stacked?: boolean,
  // place AIAL NHPI pop compare in different color columns due to ACS not KFF
  altLightMeasure?: MetricId,
  altLightMeasureDisplayName?: string,
  altLightMetricDisplayColumnName?: string,
  hasAltPop?: boolean
): any {
  const BAR_HEIGHT = stacked ? 40 : 12;
  const BAR_PADDING = 0.1;
  const DARK_MEASURE_COLOR = sass.barChartDark;
  const LIGHT_MEASURE_COLOR = sass.barChartLight;
  const ALT_LIGHT_MEASURE_COLOR = sass.unknownMapMid;
  const ALT_LIGHT_MEASURE_OPACITY = 0.8;
  const DATASET = "DATASET";

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

  let MIN_TICK_STEP = 5;
  if (width > 800) MIN_TICK_STEP = 2;
  let MIN_TICK_BAR_STEP = 10;
  if (width > 500 && width < 800) MIN_TICK_BAR_STEP = 5;
  else if (width >= 800) MIN_TICK_BAR_STEP = 2;

  // defaults for most charts
  const LEGEND_COLORS = [LIGHT_MEASURE_COLOR, DARK_MEASURE_COLOR];
  const LEGEND_DOMAINS = [lightMeasureDisplayName, darkMeasureDisplayName];

  const ALL_MARKS = [
    {
      // ALT TEXT: verbose, invisible text for screen readers conveying "%"" vs "%pop"
      name: "alt_text_labels",
      type: "text",
      style: ["text"],
      from: { data: DATASET },
      description: `${data.length} items`,
      encode: {
        update: {
          y: { scale: "y", field: breakdownVar, band: 0.5 },
          opacity: {
            signal: "0",
          },
          fontSize: { value: 0 },
          text: {
            signal: !hasAltPop
              ? // NORMAL
                `${oneLineLabel(breakdownVar)}
              +
                ': '
                +
                datum.${lightMetricDisplayColumnName}
                +
                '${lightMeasureDisplayName}'
                +
                ' vs. '
                +
                datum.${darkMetricDisplayColumnName}
                +
                '${darkMeasureDisplayName}'
              `
              : // FOR GEOS WITH ALT POPULATIONS
                `
                ${oneLineLabel(breakdownVar)}
                +
                ': '
                +
                if(datum.${altLightMeasure} == null, datum.${lightMetricDisplayColumnName}, datum.${altLightMetricDisplayColumnName})
                +
                '${lightMeasureDisplayName}'
                +
                ' vs. '
                +
                datum.${darkMetricDisplayColumnName}
                +
                '${darkMeasureDisplayName}'
                `,
          },
        },
      },
    },
    {
      name: "lightMeasure_bars",
      aria: false,
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
      aria: false,
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
      aria: false, // this data accessible in alt_text_labels
      type: "text",
      style: ["text"],
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
          align: {
            signal: `if(datum.${darkMeasure} > ${barLabelBreakpoint}, "right", "left")`,
          },
          baseline: { value: "middle" },
          dx: {
            signal: `if(datum.${darkMeasure} > ${barLabelBreakpoint}, -3, 3)`,
          },
          fill: {
            signal: `if(datum.${darkMeasure} > ${barLabelBreakpoint}, "white", "black")`,
          },
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
  if (hasAltPop) {
    LEGEND_COLORS.splice(1, 0, ALT_LIGHT_MEASURE_COLOR);
    LEGEND_DOMAINS[0] = `${lightMeasureDisplayName} (KFF)`;
    LEGEND_DOMAINS.splice(1, 0, altLightMeasureDisplayName!);
    ALL_MARKS.push({
      name: "altLightMeasure_bars",
      aria: false, // this data accessible in alt_text_labels
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

  function maxValueInField(field: MetricId) {
    return Math.max(
      ...data
        .map((row) => row[field])
        .filter((value: number | undefined) => value !== undefined)
    );
  }

  let measureWithLargerDomain =
    maxValueInField(lightMeasure) > maxValueInField(darkMeasure)
      ? lightMeasure
      : darkMeasure;

  if (hasAltPop) {
    measureWithLargerDomain =
      maxValueInField(measureWithLargerDomain) >
      maxValueInField(altLightMeasure!)
        ? measureWithLargerDomain
        : altLightMeasure!;
  }

  return {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    title: {
      text: chartTitle,
      subtitle: " ",
      encode: {
        title: {
          enter: {
            fontSize: { value: pageIsTiny ? 11 : 14 },
            font: { value: "Inter, sans-serif" },
          },
        },
      },
    },
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
        domain: LEGEND_DOMAINS,
        range: LEGEND_COLORS,
      },
    ],
    axes: [
      // GRAY VERTICAL TICK BARS
      {
        scale: "x",
        orient: "bottom",
        gridScale: "y",
        grid: true,
        tickCount: { signal: `ceil(width/${BAR_HEIGHT})` },
        tickMinStep: MIN_TICK_BAR_STEP,
        domain: false,
        labels: false,
        aria: false,
        maxExtent: 0,
        minExtent: 0,
        ticks: false,
        zindex: 0,
      },
      //  AXIS TICKS
      {
        scale: "x",
        orient: "bottom",
        grid: false,
        title: pageIsTiny
          ? [`${lightMeasureDisplayName}`, `vs.`, `${darkMeasureDisplayName}`]
          : `${lightMeasureDisplayName} vs. ${darkMeasureDisplayName}`,
        labelFlush: true,
        labelOverlap: true,
        tickCount: { signal: `ceil(width/${BAR_HEIGHT})` },
        tickMinStep: MIN_TICK_STEP,
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
        orient: pageIsTiny ? "none" : "top",
        // legendX and legendY are ignored when orient isn't "none"
        legendX: -20,
        legendY: -35,
        font: LEGEND_TEXT_FONT,
        labelFont: LEGEND_TEXT_FONT,
        labelLimit: 500,
      },
    ],
  };
}
export interface DisparityBarChartProps {
  data: Row[];
  chartTitle?: string | string[];
  lightMetric: MetricConfig;
  darkMetric: MetricConfig;
  breakdownVar: BreakdownVar;
  metricDisplayName: string;
  filename: string;
  // Note: STACKED currently not used
  // Stacked will render one dark bar on top of a lighter bar
  // Not stacked will show two equally sized bars side by side
  stacked?: boolean;
  showAltPopCompare?: boolean;
}

export function DisparityBarChart(props: DisparityBarChartProps) {
  const [ref, width] = useResponsiveWidth(
    /* default width during initialization */ 100
  );

  // calculate page size to determine if tiny mobile or not
  const pageIsTiny = useMediaQuery("(max-width:400px)");

  // move AIAN and NHPI into their own properties for STATE/RACE/VACCINE (since KFF doesnt provide pop compare metrics)
  let dataFromProps = props.data;
  const { showAltPopCompare } = props;

  // some states don't have any NHPI AIAN won't need alt light on vega even if they fit criteria
  let hasAltPop = false;

  if (showAltPopCompare) {
    dataFromProps = props.data.map((item) => {
      if (
        // AIAN, NHPI (with and without Hispanic) require use of alternate population source
        item[RACE].includes(AIAN) ||
        item[RACE].includes(NHPI)
      ) {
        hasAltPop = true;
        // remove KFF value
        const { vaccine_population_pct, ...itemWithoutKFF } = item;
        return itemWithoutKFF;
      } else {
        // remove ACS value
        const { acs_vaccine_population_pct, ...itemWithoutACS } = item;
        return itemWithoutACS;
      }
    });
  }

  // add delimiter for line breaks in column axis labels
  const dataWithLineBreakDelimiter = addLineBreakDelimitersToField(
    dataFromProps,
    props.breakdownVar
  );

  // Omit the % symbol because it's included in shortLabel.
  const [dataWithLightMetric, lightMetricDisplayColumnName] =
    addMetricDisplayColumn(
      props.lightMetric,
      dataWithLineBreakDelimiter,
      /* omitPctSymbol= */ true
    );
  const [dataWithDarkMetric, darkMetricDisplayColumnName] =
    addMetricDisplayColumn(
      props.darkMetric,
      dataWithLightMetric,
      /* omitPctSymbol= */ true
    );

  const altLightMetric: MetricConfig = {
    fullCardTitleName: "Population Share (ACS)",
    metricId: "acs_vaccine_population_pct",
    shortLabel: "% of population (ACS)",
    type: "pct_share",
  };

  // only some maps need alt light
  const [data, altLightMetricDisplayColumnName] = hasAltPop
    ? addMetricDisplayColumn(
        altLightMetric,
        dataWithDarkMetric,
        /* omitPctSymbol= */ true
      )
    : [dataWithDarkMetric, ""];

  const barLabelBreakpoint =
    Math.max(...props.data.map((row) => row[props.darkMetric.metricId])) *
    (LABEL_SWAP_CUTOFF_PERCENT / 100);

  return (
    <div ref={ref}>
      <Vega
        renderer="svg"
        actions={{
          export: { png: true, svg: true },
          source: false,
          compiled: false,
          editor: false,
        }}
        downloadFileName={`${props.filename} - Health Equity Tracker`}
        spec={getSpec(
          /* altText  */ `Comparison bar chart showing ${props.filename}`,
          /* data  */ data,
          /* filename */ props.chartTitle || "",
          /* width */ width,
          /* breakdownVar */ props.breakdownVar,
          /* breakdownVarDisplayName */ BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[
            props.breakdownVar
          ],
          /* lightMeasure */ props.lightMetric.metricId,
          /* lightMeasureDisplayName */ props.lightMetric.shortLabel,
          /* darkMeasure */ props.darkMetric.metricId,
          /* darkMeasureDisplayName, */ props.darkMetric.shortLabel,
          /* metricDisplayName */ props.metricDisplayName,
          /* lightMetricDisplayColumnName, */ lightMetricDisplayColumnName,
          /* darkMetricDisplayColumnName, */ darkMetricDisplayColumnName,
          /* barLabelBreakpoint, */ barLabelBreakpoint,
          /* pageIsTiny, */ pageIsTiny,
          /* stacked?, */ props.stacked,
          /* altLightMeasure?, */ hasAltPop
            ? altLightMetric.metricId
            : undefined,
          /* altLightMeasureDisplayName?, */ hasAltPop
            ? altLightMetric.shortLabel
            : "",
          /* altLightMetricDisplayColumnName?: string, */ hasAltPop
            ? altLightMetricDisplayColumnName
            : "",
          /* hasAltPop?: boolean */ hasAltPop
        )}
      />
    </div>
  );
}
