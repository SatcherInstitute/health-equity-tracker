import React, { useState } from "react";
import { Vega } from "react-vega";
import { useResponsiveWidth } from "../../utils/hooks/useResponsiveWidth";
import { useFontSize } from "../../utils/hooks/useFontSize";
import { DisparityBarChartCardProps } from "./types";
import { ACTIONS, BACKGROUND_COLOR, SCHEMA } from "./constants";
import { getTitle, Scales } from "./helpers";
import { Axes } from "./Axes";
import { Legends } from "./Legends";
import { getSignals } from "../DisparityBarChart/helpers";
import { Marks } from "./Marks";
import { MetricId } from "../../data/config/MetricConfig";
import { AIAN, NHPI, RACE } from "../../data/utils/Constants";
import { AutoSize, Legend, Scale, TrailMark } from "vega";

export function DisparityBarChart(props: DisparityBarChartCardProps) {
  const downloadFileName = `${props.filename} - Health Equity Tracker`;
  const dataset = [{ name: "DATASET", values: props.data }];
  const altText = `Comparison bar chart showing ${props.filename}`;
  const fontSize = useFontSize();
  const chartTitle = getTitle({ chartTitle: props.chartTitle, fontSize });

  const [ref, width] = useResponsiveWidth(100);
  const [hasAltPop, setHasAltPop] = useState(false);

  const { showAltPopCompare } = props;
  let dataFromProps = props.data;

  if (showAltPopCompare) {
    dataFromProps = props.data.map((item) => {
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

  /* default width during initialization */

  const chartIsSmall = width < 350;
  console.log("checking");

  const lightMeasureDisplayName = props.lightMetric.shortLabel;
  const darkMeasureDisplayName = props.darkMetric.shortLabel;

  const axisTitle = [lightMeasureDisplayName, "vs.", darkMeasureDisplayName];
  const axes = Axes(width, axisTitle, props.stacked);
  const { marks } = Marks({
    data: dataFromProps,
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
      $schema: SCHEMA,
      autosize: { resize: true, type: "fit-x" } as AutoSize,
      axes,
      background: BACKGROUND_COLOR,
      data: dataset,
      description: altText,
      legends: legends as Legend[],
      marks: [
        marks.altTextLabels,
        marks.lightMeasureBars,
        marks.darkMeasureBars,
        marks.darkMeasureTextLabels,
      ] as TrailMark[],
      scales: scales as Scale[],
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
