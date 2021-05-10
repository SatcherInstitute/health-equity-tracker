import React, { useState, useEffect } from "react";
import { Vega } from "react-vega";
import { useResponsiveWidth } from "../utils/useResponsiveWidth";
import { Fips } from "../data/utils/Fips";
import { MetricConfig } from "../data/config/MetricConfig";
import { FieldRange } from "../data/utils/DatasetTypes";

type NumberFormat = "raw" | "percentage";
export type ScaleType = "quantize" | "quantile";

const UNKNOWN_GREY = "#BDC1C6";
const DARK_RED = "#A93038";
const DARK_BLUE = "#255792";
const HEIGHT_WIDTH_RATIO = 0.5;

const MISSING_DATASET = "MISSING_DATASET";
const VALID_DATASET = "VALID_DATASET";
const GEO_DATASET = "GEO_DATASET";
const GEO_ID = "id";
const COLOR_SCALE = "COLOR_SCALE";
const US_PROJECTION = "US_PROJECTION";

const VAR_DATASET = "VAR_DATASET";
const LEGEND_DATASET = "LEGEND_DATASET";
// TODO - consider moving standardized column names, like fips, to variables shared between here and VariableProvider
const VAR_FIPS = "fips";

export interface ChoroplethMapProps {
  data: Record<string, any>[];
  // legendData is the dataset for which to calculate legend. Used to have a common legend between two maps.
  legendData?: Record<string, any>[];
  useSmallSampleMessage: boolean;
  metric: MetricConfig;
  legendTitle: string;
  signalListeners: any;
  fips: Fips;
  numberFormat?: NumberFormat;
  hideLegend?: boolean;
  fieldRange?: FieldRange;
  showCounties: boolean;
  hideActions?: boolean;
  scaleType: ScaleType;
  scaleColorScheme?: string;
}

export function ChoroplethMap(props: ChoroplethMapProps) {
  const [ref, width] = useResponsiveWidth(
    100 /* default width during intialization */
  );

  // Initial spec state is set in useEffect
  const [spec, setSpec] = useState({});

  const LEGEND_WIDTH = props.hideLegend ? 0 : 100;

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
    const noDataText = props.useSmallSampleMessage
      ? "Sample size too small"
      : "No data";
    const geographyName = props.showCounties ? "County" : "State";
    const tooltipDatum =
      props.numberFormat === "percentage"
        ? `format(datum.${props.metric.metricId}, '0.1%')`
        : `format(datum.${props.metric.metricId}, ',')`;
    const tooltipValue = `{"${geographyName}": datum.properties.name, "${props.metric.shortVegaLabel}": ${tooltipDatum} }`;
    const missingDataTooltipValue = `{"${geographyName}": datum.properties.name, "${props.metric.shortVegaLabel}": "${noDataText}" }`;

    /* SET UP LEGEND */
    // TODO - Legends should be scaled exactly the same the across compared charts. Looks misleading otherwise.
    let legendList = [];
    let legend: any = {
      fill: COLOR_SCALE,
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

    let colorScale: any = {
      name: COLOR_SCALE,
      type: props.scaleType,
      domain: { data: LEGEND_DATASET, field: props.metric.metricId },
      range: { scheme: props.scaleColorScheme || "yellowgreen", count: 7 },
    };
    if (props.fieldRange) {
      colorScale["domainMax"] = props.fieldRange.max;
      colorScale["domainMin"] = props.fieldRange.min;
    }

    setSpec({
      $schema: "https://vega.github.io/schema/vega/v5.json",
      description: "A choropleth map.",
      data: [
        {
          name: VAR_DATASET,
          values: props.data,
        },
        {
          name: LEGEND_DATASET,
          values: props.legendData || props.data,
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
          name: US_PROJECTION,
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
      scales: [colorScale],
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
            hover: { fill: { value: DARK_RED } },
          },
          transform: [{ type: "geoshape", projection: US_PROJECTION }],
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
              fill: [{ scale: COLOR_SCALE, field: props.metric.metricId }],
            },
            hover: { fill: { value: DARK_BLUE } },
          },
          transform: [{ type: "geoshape", projection: US_PROJECTION }],
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
    props.fieldRange,
    props.scaleType,
    props.legendData,
    props.scaleColorScheme,
    props.useSmallSampleMessage,
    LEGEND_WIDTH,
  ]);

  return (
    <div
      ref={ref}
      style={{
        width: "90%",
        margin: "auto",
      }}
    >
      <Vega
        spec={spec}
        width={width}
        actions={!props.hideActions}
        signalListeners={props.signalListeners}
      />
    </div>
  );
}
