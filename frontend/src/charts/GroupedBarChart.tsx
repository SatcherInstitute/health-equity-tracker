import React from "react";
import { Vega, VisualizationSpec } from "react-vega";
import { Row } from "../data/DatasetTypes";

type BarOrientation = "horizontal" | "vertical";

function getSpec(
  data: Record<string, any>[],
  dim1: string,
  dim2: string,
  measure: string,
  bars: BarOrientation
): VisualizationSpec {
  const axisWithMeasure = {
    aggregate: "sum",
    field: measure,
    axis: { grid: false, title: "", ticks: false },
  };
  const axisWithDimension2 = {
    field: dim2,
    axis: { title: "", labels: false },
  };

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v4.json",
    data: { values: data },
    width: { step: 12 },
    mark: "bar",
    encoding: {
      column: {
        field: dim1,
        type: "ordinal",
        spacing: 10,
        title: "",
      },
      y: bars === "horizontal" ? axisWithDimension2 : axisWithMeasure,
      x: bars === "horizontal" ? axisWithMeasure : axisWithDimension2,
      color: {
        field: dim2,
        type: "nominal",
        scale: { scheme: "tableau10" },
        legend: { title: "" },
      },
    },
    config: {
      view: { stroke: "transparent" },
      axis: { domainWidth: 1 },
    },
  };
}
export interface GroupedBarChartProps {
  data: Row[];
  measure: string;
  dimension1: string;
  dimension2: string;
  bars: BarOrientation;
}
export function GroupedBarChart(props: GroupedBarChartProps) {
  return (
    <Vega
      spec={getSpec(
        props.data,
        props.dimension1,
        props.dimension2,
        props.measure,
        props.bars
      )}
    />
  );
}
