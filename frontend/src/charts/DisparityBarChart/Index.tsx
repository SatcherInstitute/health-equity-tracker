import React from "react";
import { Vega, VisualizationSpec } from "react-vega";
import { useResponsiveWidth } from "../../utils/hooks/useResponsiveWidth";
import { useFontSize } from "../../utils/hooks/useFontSize";
import { DisparityBarChartCardProps } from "./types";
import { ACTIONS, BACKGROUND_COLOR } from "./constants";
import { getTitle } from "./helpers";
import { Axes } from "./Axes";
import { legends } from "./Legends";

export function DisparityBarChart(props: DisparityBarChartCardProps) {
  const downloadFileName = `${props.filename} - Health Equity Tracker`;
  const data = [{ name: "DATASET", values: props.data }];
  const altText = `Comparison bar chart showing ${props.filename}`;
  const fontSize = useFontSize();
  const title = getTitle({ chartTitle: props.chartTitle, fontSize });

  /* default width during initialization */
  const [ref, width] = useResponsiveWidth(100);
  const chartIsSmall = width < 350;

  const lightMeasureDisplayName = props.lightMetric.shortLabel;
  const darkMeasureDisplayName = props.darkMetric.shortLabel;
  const { axes } = Axes(
    width,
    lightMeasureDisplayName,
    darkMeasureDisplayName,
    props.stacked
  );

  function getSpec() {
    return {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      axes: [axes.verticalTickBars, axes.verticalTickBars, axes.yScale],
      background: BACKGROUND_COLOR,
      data: data,
      description: altText,
      legends: legends(chartIsSmall),
      marks: [],
      scales: [],
      signals: [],
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
