import React, { useReducer, useState } from "react";
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
import { AutoSize, Legend, Scale } from "vega";
import { useMediaQuery } from "@material-ui/core";
import { useChartDimensions } from "../../utils/hooks/useChartDimensions";

export function DisparityBarChart(props: DisparityBarChartCardProps) {
  const [ref, width] = useResponsiveWidth(100);
  const [chartDimensions] = useChartDimensions(width);
  console.log(chartDimensions);
  const [hasAltPop, setHasAltPop] = useState(false);

  const pageIsTiny = useMediaQuery("(max-width:400px)");
  const fontSize = useFontSize();

  let dataFromProps = props.data;
  const { showAltPopCompare } = props;

  const downloadFileName = `${props.filename} - Health Equity Tracker`;
  const dataset = [{ name: "DATASET", values: props.data }];
  const altText = `Comparison bar chart showing ${props.filename}`;
  const lightMeasureDisplayName = props.lightMetric.shortLabel;
  const darkMeasureDisplayName = props.darkMetric.shortLabel;

  const chartTitle = getTitle({ chartTitle: props.chartTitle, fontSize });
  const axisTitleArray = [
    lightMeasureDisplayName,
    "vs.",
    darkMeasureDisplayName,
  ];
  const axisTitle = width < 350 ? axisTitleArray : axisTitleArray.join(" ");

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

  const chartIsSmall = width < 350;

  const marks = Marks({
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
      axes: Axes(axisTitle, chartDimensions),
      background: BACKGROUND_COLOR,
      data: dataset,
      description: altText,
      legends: legends as Legend[],
      marks: marks,
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
