import React from "react";
import { Vega } from "react-vega";
import { Row } from "../data/utils/DatasetTypes";

export interface PieChartProps {
  data: Row[];
  categoryField: string;
  valueField: string;
}

export function PieChart(props: PieChartProps) {
  const spec: any = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    description: "A basic pie chart example.",
    width: 430,
    height: 200,
    autosize: "none",

    data: [
      {
        name: "table",
        values: props.data,
        transform: [
          {
            type: "pie",
            field: props.valueField,
            startAngle: 0,
            endAngle: 6.29,
            sort: true,
          },
        ],
      },
    ],
    legends: [
      {
        orient: "top-right",
        stroke: "color",
        title: "Ethnicity and Race",
        encode: {
          symbols: {
            update: {
              fill: { value: "" },
              strokeWidth: { value: 2 },
              size: { value: 64 },
            },
          },
        },
      },
    ],
    scales: [
      {
        name: "color",
        type: "ordinal",
        domain: { data: "table", field: props.categoryField },
        range: { scheme: "tableau10" },
      },
    ],
    marks: [
      {
        type: "arc",
        from: { data: "table" },
        encode: {
          enter: {
            fill: { scale: "color", field: props.categoryField },
            x: { signal: "height / 2" },
            y: { signal: "height / 2" },
            tooltip: {
              signal:
                "datum." +
                props.categoryField +
                " + ' : ' + datum." +
                props.valueField +
                " + '%'",
            },
          },
          update: {
            startAngle: { field: "startAngle" },
            endAngle: { field: "endAngle" },
            padAngle: 0,
            innerRadius: 0,
            outerRadius: { signal: "height / 2" },
            cornerRadius: 0,
          },
        },
      },
    ],
  };

  return <Vega spec={spec} />;
}
