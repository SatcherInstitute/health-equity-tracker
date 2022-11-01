import React, { useReducer, useState } from "react";
import { Vega } from "react-vega";
import { useResponsiveWidth } from "../../utils/hooks/useResponsiveWidth";
import { useFontSize } from "../../utils/hooks/useFontSize";
import { DisparityBarChartCardProps } from "./types";
import { ACTIONS, BACKGROUND_COLOR, SCHEMA } from "./constants";
import { getLargerMeasure, getTitle } from "./helpers";
import { Axes } from "./Axes";
import { Legends } from "./Legends";
import { getSignals } from "../DisparityBarChart/helpers";
import { Marks } from "./Marks";
import { AIAN, NHPI, RACE } from "../../data/utils/Constants";
import { AutoSize } from "vega";
import { useChartDimensions } from "../../utils/hooks/useChartDimensions";
import { BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE } from "../../data/query/Breakdowns";
import { Scales } from "./Scales";

export function DisparityBarChart(props: DisparityBarChartCardProps) {
  const [ref, width] = useResponsiveWidth(100);
  const [chartDimensions] = useChartDimensions(width);
  const [hasAltPop, setHasAltPop] = useState(false);
  const fontSize = useFontSize();

  let { data } = props;
  const { showAltPopCompare, lightMetric, darkMetric, breakdownVar } = props;
  const lightMeasureName = lightMetric.shortLabel;
  const darkMeasureName = darkMetric.shortLabel;
  const LEGEND_DOMAINS = [lightMeasureName, darkMeasureName];

  const largerMeasure = getLargerMeasure(
    data,
    lightMetric.metricId,
    darkMetric.metricId
  );

  const downloadFileName = `${props.filename} - Health Equity Tracker`;
  const dataset = [{ name: "DATASET", values: data }];
  const altText = `Comparison bar chart showing ${props.filename}`;

  const chartTitle = getTitle({ chartTitle: props.chartTitle, fontSize });
  const axisTitleArray = [lightMeasureName, "vs.", darkMeasureName];
  const xAxisTitle = width < 350 ? axisTitleArray : axisTitleArray.join(" ");
  const yAxisTitle = BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar];

  if (showAltPopCompare) {
    data = props.data.map((item) => {
      if (
        // AIAN, NHPI (with and without Hispanic) require use of alternate population source
        item[RACE].includes(AIAN) ||
        item[RACE].includes(NHPI)
      ) {
        setHasAltPop(true);
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

  const chartIsSmall = width < 350;

  const marks = Marks({
    data: data,
    breakdownVar: props.breakdownVar,
    lightMetric: props.lightMetric,
    darkMetric: props.darkMetric,
    hasAltPop,
    stacked: props.stacked,
    chartIsSmall,
    metricDisplayName: props.metricDisplayName,
  });

  const axes = Axes(xAxisTitle, yAxisTitle, chartDimensions);
  const legends = Legends(chartDimensions);
  const signals = getSignals();
  const scales = Scales(largerMeasure, breakdownVar, LEGEND_DOMAINS);

  function getSpec() {
    return {
      $schema: SCHEMA,
      autosize: { resize: true, type: "fit-x" } as AutoSize,
      axes: axes,
      background: BACKGROUND_COLOR,
      data: dataset,
      description: altText,
      legends: legends,
      marks: marks,
      scales: scales,
      signals: signals,
      style: "cell",
      title: chartTitle,
      width: width - 30,
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
