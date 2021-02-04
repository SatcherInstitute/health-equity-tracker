import React from "react";
import { Vega, VisualizationSpec } from "react-vega";
import { BreakdownVar } from "../data/query/Breakdowns";
import { Row } from "../data/utils/DatasetTypes";

function getSpec(
  data: Record<string, any>[],
  dim1: BreakdownVar,
  dim2: BreakdownVar,
  measure: string
): VisualizationSpec {
  return {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    description: "A basic grouped bar chart example.",
    width: 300,
    height: 400,
    padding: 5,

    data: [
      {
        name: "table",
        values: data,
      },
    ],

    scales: [
      {
        name: "yscale",
        type: "band",
        domain: { data: "table", field: dim1 },
        range: "height",
        padding: 0.2,
      },
      {
        name: "xscale",
        type: "linear",
        domain: { data: "table", field: measure },
        range: "width",
        round: true,
        zero: true,
        nice: true,
      },
      {
        name: "color",
        type: "ordinal",
        domain: { data: "table", field: dim2 },
        range: { scheme: "tableau10" },
      },
    ],

    axes: [
      {
        orient: "left",
        scale: "yscale",
        tickSize: 0,
        labelPadding: 4,
        zindex: 1,
      },
      { orient: "bottom", scale: "xscale" },
    ],

    marks: [
      {
        type: "group",

        from: {
          facet: {
            data: "table",
            name: "facet",
            groupby: dim1,
          },
        },

        encode: {
          enter: {
            y: { scale: "yscale", field: dim1 },
          },
        },

        signals: [{ name: "height", update: "bandwidth('yscale')" }],

        scales: [
          {
            name: "pos",
            type: "band",
            range: "height",
            domain: { data: "facet", field: dim2 },
          },
        ],

        marks: [
          {
            name: "bars",
            from: { data: "facet" },
            type: "rect",
            encode: {
              enter: {
                y: { scale: "pos", field: dim2 },
                height: { scale: "pos", band: 1 },
                x: { scale: "xscale", field: measure },
                x2: { scale: "xscale", value: 0 },
                fill: { scale: "color", field: dim2 },
              },
            },
          },
          {
            type: "text",
            from: { data: "bars" },
            encode: {
              enter: {
                x: { field: "x2", offset: -5 },
                y: { field: "y", offset: { field: "height", mult: 0.5 } },
                fill: [
                  {
                    test:
                      "contrast('white', datum.fill) > contrast('black', datum.fill)",
                    value: "white",
                  },
                  { value: "black" },
                ],
                align: { value: "right" },
                baseline: { value: "middle" },
                text: { field: `datum.${measure}` },
              },
            },
          },
        ],
        legends: [
          {
            orient: "left",
            fill: "color",
          },
        ],
      },
    ],
  };
}

function HorizontalGroupedBarChart(props: { data: Row[]; measure: string }) {
  return (
    <Vega
      spec={getSpec(props.data, "fips", "race_and_ethnicity", props.measure)}
    />
  );
}

export default HorizontalGroupedBarChart;
