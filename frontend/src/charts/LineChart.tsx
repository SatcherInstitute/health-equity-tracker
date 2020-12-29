import React from "react";
import { Vega } from "react-vega";
import { Row } from "../data/DatasetTypes";

function LineChart(props: {
  data: Row[];
  breakdownVar: string; // for instance, race
  variable: string; // for instance, rate
  timeVariable: string; // for instance, rate
}) {
  const tooltipValues = Array.from(
    new Set(props.data.map((row: any) => row[props.breakdownVar]))
  ).map((breakdown) => ({ field: breakdown, type: "quantitative" }));
  tooltipValues.push({ field: props.timeVariable, type: "temporal" });

  const liteSpec: any = {
    $schema: "https://vega.github.io/schema/vega-lite/v4.json",
    data: {
      values: props.data,
    },
    width: 400,
    height: 300,
    encoding: {
      x: {
        field: props.timeVariable,
        type: "temporal",
      },
    },
    layer: [
      {
        encoding: {
          color: {
            field: props.breakdownVar,
            type: "nominal",
          },
          y: {
            field: props.variable,
            type: "quantitative",
          },
        },
        layer: [
          {
            mark: "line",
          },
          {
            transform: [
              {
                filter: {
                  selection: "hover",
                },
              },
            ],
            mark: "point",
          },
        ],
      },
      {
        transform: [
          {
            pivot: props.breakdownVar,
            value: props.variable,
            groupby: [props.timeVariable],
          },
        ],
        mark: "rule",
        encoding: {
          opacity: {
            condition: {
              value: 0.3,
              selection: "hover",
            },
            value: 0,
          },
          tooltip: tooltipValues,
        },
        selection: {
          hover: {
            type: "single",
            fields: [props.timeVariable],
            nearest: true,
            on: "mouseover",
            empty: "none",
            clear: "mouseout",
          },
        },
      },
    ],
  };

  return <Vega spec={liteSpec} />;
}

export default LineChart;
