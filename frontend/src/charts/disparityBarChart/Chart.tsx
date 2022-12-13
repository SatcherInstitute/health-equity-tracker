import React from "react";
import { Vega } from "react-vega";
import { useResponsiveWidth } from "../../utils/hooks/useResponsiveWidth";
import { useFontSize } from "../../utils/hooks/useFontSize";
import { DisparityBarChartProps } from "./types";
import {
  ACTIONS,
  BACKGROUND_COLOR,
  LABEL_SWAP_CUTOFF_PERCENT,
  SCHEMA,
} from "./constants";
import { getLargerMeasure, getTitle } from "./helpers";
import { Axes } from "./Axes";
import { Legends } from "./Legends";
import { getSignals } from "./helpers";
import { Marks } from "./Marks";
import { AIAN, NHPI, RACE } from "../../data/utils/Constants";
import { AutoSize } from "vega";
import { useChartDimensions } from "../../utils/hooks/useChartDimensions";
import { Scales } from "./Scales";
import {
  addLineBreakDelimitersToField,
  addMetricDisplayColumn,
  PADDING_FOR_ACTIONS_MENU,
} from "../utils";
import { MetricConfig } from "../../data/config/MetricConfig";
import { BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE } from "../../data/query/Breakdowns";

export const altLightMetric: MetricConfig = {
  chartTitleLines: ["Population Share (ACS)"],
  metricId: "acs_vaccine_population_pct",
  shortLabel: "% of population (ACS)",
  type: "pct_share",
};

export function DisparityBarChart(props: DisparityBarChartProps) {
  /* default width during initialization */
  const [ref, width] = useResponsiveWidth(100);
  const fontSize = useFontSize();
  // some states don't have any NHPI AIAN won't need alt light on vega even if they fit criteria

  const [chartDimensions] = useChartDimensions(width);

  let hasAltPop = false;

  // move AIAN and NHPI into their own properties for STATE/RACE/VACCINE (since KFF doesnt provide pop compare metrics)
  let dataFromProps = props.data;
  const {
    chartTitle,
    showAltPopCompare,
    metricDisplayName,
    lightMetric,
    darkMetric,
    breakdownVar,
  } = props;

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
    breakdownVar
  );

  // omit the % symbol because it's included in shortLabel
  const [dataWithLightMetric, lightMetricDisplayColumnName] =
    addMetricDisplayColumn(lightMetric, dataWithLineBreakDelimiter, true);
  const [dataWithDarkMetric, darkMetricDisplayColumnName] =
    addMetricDisplayColumn(darkMetric, dataWithLightMetric, true);
  // only some maps need alt light
  const [data, altLightMetricDisplayColumnName] = hasAltPop
    ? addMetricDisplayColumn(altLightMetric, dataWithDarkMetric, true)
    : [dataWithDarkMetric, ""];

  const barLabelBreakpoint =
    Math.max(...dataFromProps.map((row) => row[darkMetric.metricId])) *
    (LABEL_SWAP_CUTOFF_PERCENT / 100);

  const lightMeasureDisplayName = lightMetric.shortLabel;
  const darkMeasureDisplayName = darkMetric.shortLabel;
  const altLightMeasureDisplayName = hasAltPop ? altLightMetric.shortLabel : "";

  const lightMeasure = lightMetric.metricId;
  const darkMeasure = darkMetric.metricId;
  const altLightMeasure = altLightMetric.metricId;

  const LEGEND_DOMAINS = [lightMeasureDisplayName, darkMeasureDisplayName];
  const xAxisTitleArray = [
    lightMeasureDisplayName,
    "vs.",
    darkMeasureDisplayName,
  ];
  const xAxisTitle = width < 350 ? xAxisTitleArray : xAxisTitleArray.join(" ");
  const yAxisTitle = BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[breakdownVar];
  const darkMeasureText = width < 350 ? "%" : metricDisplayName;

  const downloadFileName = `${props.filename} - Health Equity Tracker`;

  const largerMeasure = getLargerMeasure(
    dataFromProps,
    lightMetric.metricId,
    darkMetric.metricId
  );

  const markProps = {
    barLabelBreakpoint,
    breakdownVar,
    data,
    hasAltPop,
    altLightMeasure,
    altLightMeasureDisplayName,
    altLightMetricDisplayColumnName,
    darkMeasure,
    darkMeasureDisplayName,
    darkMetricDisplayColumnName,
    lightMeasure,
    lightMeasureDisplayName,
    lightMetricDisplayColumnName,
    LEGEND_DOMAINS,
    darkMeasureText,
  };

  const chartWidth = width - PADDING_FOR_ACTIONS_MENU;
  const autosize: AutoSize = { resize: true, type: "fit-x" };
  const altText = `Comparison bar chart showing ${props.filename}`;
  const dataset = [{ name: "DATASET", values: data }];
  const axes = Axes({ chartDimensions, xAxisTitle, yAxisTitle });
  const legends = Legends({ chartDimensions });
  const scales = Scales({ largerMeasure, breakdownVar, LEGEND_DOMAINS });
  const signals = getSignals();
  const title = getTitle({ chartTitle, fontSize });
  const marks = Marks(markProps);

  function getSpec() {
    return {
      $schema: SCHEMA,
      autosize,
      axes,
      background: BACKGROUND_COLOR,
      data: dataset,
      description: altText,
      legends,
      marks,
      scales,
      signals,
      style: "cell",
      title,
      width: chartWidth,
    };
  }

  return (
    <div ref={ref}>
      <Vega
        actions={ACTIONS}
        downloadFileName={downloadFileName}
        renderer="svg"
        spec={getSpec()}
      />
    </div>
  );
}
