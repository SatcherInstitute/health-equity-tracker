import React from "react";
import { Vega } from "react-vega";
import { useResponsiveWidth } from "../../utils/hooks/useResponsiveWidth";
import { useFontSize } from "../../utils/hooks/useFontSize";
import sass from "../styles/variables.module.scss";
import { DisparityBarChartCardProps, Spec } from "./types";
import { ACTIONS } from "./constants";
import { getTitle } from "./helpers";
import { Axes } from "./Axes";

export function DisparityBarChart(props: DisparityBarChartCardProps) {
  /* default width during initialization */
  const [ref, width] = useResponsiveWidth(100);
  const fontSize = useFontSize();
  const title = getTitle({ chartTitle: props.chartTitle || "", fontSize });
  const downloadFileName = `${props.filename} - Health Equity Tracker`;
  const data = props.data;
  const filename = `Comparison bar chart showing`;
  const { axes } = Axes(props.stacked, width);

  function getSpec(props: Spec) {
    return {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      axes: [axes.verticalTickBars, axes.axisTicks, axes.yScale],
      background: sass.white,
      data: [{ name: "DATASET", values: props.data }],
      description: "",
      legends: [],
      marks: [],
      scales: [],
      signals: [],
      style: "cell",
      title: props.title,
      width: props.width - 30,
    };
  }

  return (
    <div ref={ref}>
      <Vega
        actions={ACTIONS}
        downloadFileName={downloadFileName}
        renderer="svg"
        spec={getSpec({ data, width, filename, fontSize, title })}
      />
    </div>
  );
}
