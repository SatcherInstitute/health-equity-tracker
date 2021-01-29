import React, { useState, useEffect } from "react";
import { Vega } from "react-vega";
import { useResponsiveWidth } from "../utils/useResponsiveWidth";
import { Fips } from "../data/utils/Fips";
import { MetricConfig } from "../data/config/MetricConfig";

type NumberFormat = "raw" | "percentage";

const UNKNOWN_GREY = "#BDC1C6";
const HEIGHT_WIDTH_RATIO = 0.5;
const LEGEND_WIDTH = 100;

const MISSING_DATASET = "MISSING_DATASET";
const VALID_DATASET = "VALID_DATASET";
const GEO_DATASET = "GEO_DATASET";
const GEO_ID = "id";

const VAR_DATASET = "VAR_DATASET";
// TODO - consider moving standardized column names, like fips, to variables shared between here and VariableProvider
const VAR_FIPS = "fips";

export interface ChoroplethMapProps {
  data: Record<string, any>[];
  metric: MetricConfig;
  legendTitle: string;
  signalListeners: any;
  fips: Fips;
  numberFormat?: NumberFormat;
  hideLegend?: boolean;
  showCounties: boolean;
}

export function ChoroplethMap(props: ChoroplethMapProps) {
  const [ref, width] = useResponsiveWidth(
    100 /* default width during intialization */
  );

  // Initial spec state is set in useEffect
  const [spec, setSpec] = useState({});

  useEffect(() => {
    /* SET UP GEO DATSET */
    // Transform geo dataset by adding varField from VAR_DATASET
    let geoTransformers: any[] = [
      {
        type: "lookup",
        from: VAR_DATASET,
        key: VAR_FIPS,
        fields: [GEO_ID],
        values: [props.metric.metricId],
      },
    ];
    if (props.fips.isState()) {
      // The first two characters of a county FIPS are the state FIPS
      let stateFipsVar = `slice(datum.id,0,2) == '${props.fips.code}'`;
      geoTransformers.push({
        type: "filter",
        expr: stateFipsVar,
      });
    }
    if (props.fips.isCounty()) {
      geoTransformers.push({
        type: "filter",
        expr: `datum.id === "${props.fips.code}"`,
      });
    }

    /* SET UP TOOLTIP */
    const tooltipDatum =
      props.numberFormat === "percentage"
        ? `format(datum.${props.metric.metricId}, '0.1%')`
        : `format(datum.${props.metric.metricId}, ',')`;
    const tooltipValue = `{"State": datum.properties.name, "${props.metric.shortVegaLabel}": ${tooltipDatum} }`;
    const missingDataTooltipValue = `{"State": datum.properties.name, "${props.metric.shortVegaLabel}": "No data" }`;

    /* SET UP LEGEND */
    // TODO - Legends should be scaled exactly the same the across compared charts. Looks misleading otherwise.
    let legendList = [];
    let legend: any = {
      fill: "colorScale",
      direction: "horizontal",
      orient: "bottom-left",
      title: props.legendTitle,
      font: "monospace",
      labelFont: "monospace",
      offset: 10,
    };
    if (props.numberFormat === "percentage") {
      legend["format"] = "0.1%";
    }
    if (!props.hideLegend) {
      legendList.push(legend);
    }

    setSpec({
      $schema: "https://vega.github.io/schema/vega/v5.json",
      description:
        "A choropleth map depicting U.S. diabetesloyment temp_maxs by county in 2009.",
      data: [
        {
          name: VAR_DATASET,
          values: props.data,
        },
        {
          name: GEO_DATASET,
          transform: geoTransformers,
          url: "/counties-10m.json",
          format: {
            type: "topojson",
            feature: props.showCounties ? "counties" : "states",
          },
        },
        {
          name: VALID_DATASET,
          transform: [
            {
              type: "filter",
              expr: `isValid(datum.${props.metric.metricId})`,
            },
          ],
          source: GEO_DATASET,
          format: {
            type: "topojson",
            feature: props.showCounties ? "counties" : "states",
          },
        },
        {
          name: MISSING_DATASET,
          transform: [
            {
              type: "filter",
              expr: `!isValid(datum.${props.metric.metricId})`,
            },
          ],
          source: GEO_DATASET,
          format: {
            type: "topojson",
            feature: props.showCounties ? "counties" : "states",
          },
        },
      ],
      projections: [
        {
          name: "usProjection",
          type: "albersUsa",
          fit: { signal: "data('" + GEO_DATASET + "')" },
          size: {
            signal:
              "[" +
              (width! - LEGEND_WIDTH) +
              ", " +
              width! * HEIGHT_WIDTH_RATIO +
              "]",
          },
        },
      ],
      scales: [
        {
          name: "colorScale",
          type: "quantize",
          domain: { data: VALID_DATASET, field: props.metric.metricId },
          range: { scheme: "yellowgreenblue", count: 7 },
        },
      ],
      legends: legendList,
      marks: [
        {
          type: "shape",
          from: { data: MISSING_DATASET },
          encode: {
            enter: {
              tooltip: {
                signal: missingDataTooltipValue,
              },
            },
            update: {
              fill: { value: UNKNOWN_GREY },
            },
          },
          transform: [{ type: "geoshape", projection: "usProjection" }],
        },
        {
          type: "shape",
          from: { data: VALID_DATASET },
          encode: {
            enter: {
              tooltip: {
                signal: tooltipValue,
              },
            },
            update: {
              fill: [{ scale: "colorScale", field: props.metric.metricId }],
            },
            hover: { fill: { value: "red" } },
          },
          transform: [{ type: "geoshape", projection: "usProjection" }],
        },
      ],
      signals: [
        {
          name: "click",
          value: 0,
          on: [{ events: "*:mousedown", update: "datum" }],
        },
      ],
    });
  }, [
    width,
    props.metric,
    props.legendTitle,
    props.numberFormat,
    props.data,
    props.fips,
    props.hideLegend,
    props.showCounties,
  ]);

  return (
    <div
      ref={ref}
      style={{
        width: "80%",
        margin: "auto",
      }}
    >
      <Vega spec={spec} width={width} signalListeners={props.signalListeners} />
    </div>
  );
}
