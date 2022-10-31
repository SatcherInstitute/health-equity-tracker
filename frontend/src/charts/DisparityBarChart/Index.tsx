import React from "react";
import { Vega, VisualizationSpec } from "react-vega";
import { useResponsiveWidth } from "../../utils/hooks/useResponsiveWidth";
import { useFontSize } from "../../utils/hooks/useFontSize";
import { DisparityBarChartCardProps } from "./types";
import { ACTIONS, BACKGROUND_COLOR } from "./constants";
import { getTitle, Scales } from "./helpers";
import { Axes } from "./Axes";
import { Legends } from "./Legends";
import { getSignals } from "../DisparityBarChart/helpers";
import { Marks } from "./Marks";
import { MetricId } from "../../data/config/MetricConfig";

export function DisparityBarChart(props: DisparityBarChartCardProps) {
  const downloadFileName = `${props.filename} - Health Equity Tracker`;
  const dataset = [{ name: "DATASET", values: props.data }];
  const altText = `Comparison bar chart showing ${props.filename}`;
  const fontSize = useFontSize();
  const title = getTitle({ chartTitle: props.chartTitle, fontSize });

  /* default width during initialization */
  const [ref, width] = useResponsiveWidth(100);
  let hasAltPop = false;
  const chartIsSmall = width < 350;

  const lightMeasureDisplayName = props.lightMetric.shortLabel;
  const darkMeasureDisplayName = props.darkMetric.shortLabel;

  const axisTitle = [lightMeasureDisplayName, "vs.", darkMeasureDisplayName];
  const { axes } = Axes(width, axisTitle, props.stacked);
  const { marks } = Marks({
    data: props.data,
    breakdownVar: props.breakdownVar,
    lightMetric: props.lightMetric,
    darkMetric: props.darkMetric,
    hasAltPop,
    stacked: props.stacked,
    chartIsSmall,
    metricDisplayName: props.metricDisplayName,
  });
  const legends = Legends(chartIsSmall);
  const signals = getSignals(props.stacked);

  function maxValueInField(field: MetricId) {
    return Math.max(
      ...props.data
        .map((row) => row[field])
        .filter((value: number | undefined) => value !== undefined)
    );
  }

  let measureWithLargerDomain =
    maxValueInField(props.lightMetric.metricId) >
    maxValueInField(props.darkMetric.metricId)
      ? props.lightMetric.metricId
      : props.darkMetric.metricId;

  const LEGEND_DOMAINS = [lightMeasureDisplayName, darkMeasureDisplayName];

  const scales = Scales(
    measureWithLargerDomain,
    props.breakdownVar,
    LEGEND_DOMAINS
  );

  function getSpec() {
    return {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      axes: [axes.verticalTickBars, axes.axisTicks, axes.yScale],
      background: BACKGROUND_COLOR,
      data: dataset,
      description: altText,
      legends: legends,
      marks: [
        marks.altTextLabels,
        marks.lightMeasureBars,
        marks.darkMeasureBars,
        marks.darkMeasureTextLabels,
      ],
      scales: scales,
      signals: signals,
      style: "cell",
      title: title,
      width: width - 30,
    };
  }

  return (
    <div ref={ref}>
      <Vega
        actions={ACTIONS}
        downloadFileName={downloadFileName}
        renderer="svg"
        spec={getSpec() as unknown as VisualizationSpec}
      />
    </div>
  );
}
