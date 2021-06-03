import React, { useState, useEffect } from "react";
import { Vega } from "react-vega";
import { useResponsiveWidth } from "../utils/useResponsiveWidth";
import { Fips } from "../data/utils/Fips";
import { MetricConfig } from "../data/config/MetricConfig";
import { FieldRange } from "../data/utils/DatasetTypes";
import { GEOGRAPHIES_DATASET_ID } from "../data/config/MetadataMap";

export type ScaleType = "quantize" | "quantile" | "symlog";

const UNKNOWN_GREY = "#BDC1C6";
const RED_ORANGE = "#ED573F";
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
  hideMissingDataTooltip?: boolean;
  metric: MetricConfig;
  legendTitle: string;
  signalListeners: any;
  fips: Fips;
  hideLegend?: boolean;
  fieldRange?: FieldRange;
  showCounties: boolean;
  hideActions?: boolean;
  scaleType: ScaleType;
  scaleColorScheme?: string;
  // Geography data, in topojson format. Must include both states and counties.
  // If not provided, defaults to directly loading /tmp/geographies.json
  geoData?: Record<string, any>;
}

export function ChoroplethMap(props: ChoroplethMapProps) {
  // We render the Vega map asynchronously because it can be performance
  // intensive. Loading a page with many maps on it can cause the UI to lag if
  // done synchronously.
  const [shouldRenderMap, setShouldRenderMap] = useState(false);

  const [ref, width] = useResponsiveWidth(
    100 /* default width during intialization */
  );

  // Initial spec state is set in useEffect
  const [spec, setSpec] = useState({});

  const LEGEND_WIDTH = props.hideLegend ? 0 : 100;

  // Dataset to use for computing the legend
  const legendData = props.legendData || props.data;

  useEffect(() => {
    const geoData = props.geoData
      ? { values: props.geoData }
      : { url: `/tmp/${GEOGRAPHIES_DATASET_ID}.json` };

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
    if (props.fips.isStateOrTerritory()) {
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
    const tooltipDatum = `format(datum.${props.metric.metricId}, ',')`;
    // TODO: would be nice to use addMetricDisplayColumn for the tooltips here
    // so that data formatting is consistent.
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
      titleLimit: 0,
      font: "monospace",
      labelFont: "monospace",
      labelOverlap: "greedy",
      labelSeparation: 10,
      offset: 10,
      format: "d",
    };
    if (props.metric.type === "pct_share") {
      legend["encode"] = {
        labels: {
          update: {
            text: {
              signal: `format(datum.label, '0.1r') + '%'`,
            },
          },
        },
      };
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
    if (props.scaleType === "symlog") {
      // Controls the slope of the linear behavior of symlog around 0.
      colorScale["constant"] = 0.01;
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
          // The current national-level Vega projection does not support
          // territories, so we remove them from the legend.
          // TODO - remove this when projection supports territories.
          values: props.fips.isUsa()
            ? legendData.filter((row) => !new Fips(row[VAR_FIPS]).isTerritory())
            : legendData,
        },
        {
          name: GEO_DATASET,
          transform: geoTransformers,
          ...geoData,
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
          type:
            props.fips.isTerritory() || props.fips.getParentFips().isTerritory()
              ? "albers"
              : "albersUsa",
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
            enter:
              props.hideMissingDataTooltip === true
                ? {}
                : {
                    tooltip: {
                      signal: missingDataTooltipValue,
                    },
                  },
            update: {
              fill: { value: UNKNOWN_GREY },
            },
            hover: { fill: { value: RED_ORANGE } },
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

    // Render the Vega map asynchronously, allowing the UI to respond to user
    // interaction before Vega maps render.
    setTimeout(() => {
      setShouldRenderMap(true);
    }, 0);
  }, [
    width,
    props.metric,
    props.legendTitle,
    props.data,
    props.fips,
    props.hideLegend,
    props.showCounties,
    props.fieldRange,
    props.scaleType,
    props.scaleColorScheme,
    props.useSmallSampleMessage,
    props.hideMissingDataTooltip,
    props.geoData,
    LEGEND_WIDTH,
    legendData,
  ]);

  return (
    <div
      ref={ref}
      style={{
        width: "90%",
        margin: "auto",
      }}
    >
      {shouldRenderMap && (
        <Vega
          spec={spec}
          width={width}
          actions={!props.hideActions}
          signalListeners={props.signalListeners}
        />
      )}
    </div>
  );
}
