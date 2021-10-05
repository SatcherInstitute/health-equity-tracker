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
const CIRCLE_PROJECTION = "CIRCLE_PROJECTION";

const VAR_DATASET = "VAR_DATASET";
const LEGEND_DATASET = "LEGEND_DATASET";
// TODO - consider moving standardized column names, like fips, to variables shared between here and VariableProvider
const VAR_FIPS = "fips";

export interface ChoroplethMapProps {
  // Data used to create the map
  data: Record<string, any>[];
  // Geography data, in topojson format. Must include both states and counties.
  // If not provided, defaults to directly loading /tmp/geographies.json
  geoData?: Record<string, any>;
  // Metric within the data that we are visualizing
  metric: MetricConfig;
  // The geography that this map is showing
  fips: Fips;
  // If true, maps will render counties, otherwise it will render states/territories
  showCounties: boolean;
  // legendData is the dataset for which to calculate legend. Used to have a common legend between two maps.
  legendData?: Record<string, any>[];
  // Whether or not the legend is present
  hideLegend?: boolean;
  // If legend is present, what is the title
  legendTitle: string;
  // Max/min of the data range- if present it will set the color scale at these boundaries
  fieldRange?: FieldRange;
  // Hide the action bar in the corner of a vega chart
  hideActions?: boolean;
  // How the color scale is computed mathematically
  scaleType: ScaleType;
  // Colors to use for the color scale. Default is yellowgreen
  scaleColorScheme?: string;
  // If true, the geography will be rendered as a circle. Used to display territories at national level.
  overrideShapeWithCircle?: boolean;
  // Instead of missing data saying "no data" use a "sample size too small" message. Used for surveyed data.
  useSmallSampleMessage: boolean;
  // Do not show a tooltip when there is no data.
  hideMissingDataTooltip?: boolean;
  // Callbacks set up so map interactions can update the React UI
  signalListeners: any;
  // use the constructed string from the Card Wrapper Title in the export as PNG filename
  filename?: string;
}

export function ChoroplethMap(props: ChoroplethMapProps) {
  // We render the Vega map asynchronously because it can be performance
  // intensive. Loading a page with many maps on it can cause the UI to lag if
  // done synchronously.
  const [shouldRenderMap, setShouldRenderMap] = useState(false);

  const [ref, width] = useResponsiveWidth(
    100 /* default width during initialization */
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
    if (props.overrideShapeWithCircle) {
      geoTransformers.push({
        type: "formula",
        as: "centroid",
        expr: `geoCentroid('${CIRCLE_PROJECTION}', datum.fips)`,
      });
    }
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

    /* SET UP COLOR SCALE */
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

    /* SET UP PROJECTION USED TO CREATE MARKS ON THE UI */
    let projection = props.overrideShapeWithCircle
      ? {
          name: CIRCLE_PROJECTION,
          type: "albersUsa",
          scale: 1100,
          translate: [{ signal: "width / 2" }, { signal: "height / 2" }],
        }
      : {
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
        };

    /* DEFINE HOW TO CREATE A MARK ON THE UI */
    /** 
    Function creating the Vega marks that appear on the chart (geographies or circles).
    * datasetName: name of the dataset the marks should correspond to
    * fillColor: schema defining how marks are filled - either a scale or static value.
    * hoverColor: single color that should appear on hover
    * tooltipExpression: expression defining how to render the contents of the hover tooltip 
    */
    const createShapeMarks = (
      datasetName: string,
      fillColor: any,
      hoverColor: string,
      tooltipExpression: string
    ) => {
      let encodeEnter: any = {};
      if (props.overrideShapeWithCircle) {
        encodeEnter = {
          size: { value: "1000" },
          fill: fillColor,
          stroke: { value: "white" },
          strokeWidth: { value: 1.5 },
          x: { field: "centroid[0]" },
          y: { field: "centroid[1]" },
        };
      }
      if (!props.hideMissingDataTooltip || datasetName !== MISSING_DATASET) {
        encodeEnter["tooltip"] = {
          signal: tooltipExpression,
        };
      }
      let marks: any = {
        name: datasetName + "_MARK",
        type: props.overrideShapeWithCircle ? "symbol" : "shape",
        from: { data: datasetName },
        encode: {
          enter: encodeEnter,
          update: { fill: fillColor },
          hover: { fill: { value: hoverColor } },
        },
      };
      if (!props.overrideShapeWithCircle) {
        marks["transform"] = [{ type: "geoshape", projection: US_PROJECTION }];
      }
      return marks;
    };
    const createCircleTextMark = (datasetName: string) => {
      return {
        type: "text",
        interactive: false,
        from: { data: datasetName + "_MARK" },
        encode: {
          enter: {
            align: { value: "center" },
            baseline: { value: "middle" },
            fontSize: { value: 13 },
            text: { field: "datum.properties.abbreviation" },
          },
          update: {
            x: { field: "x" },
            y: { field: "y" },
          },
        },
      };
    };
    let marks = [
      createShapeMarks(
        /*datasetName=*/ MISSING_DATASET,
        /*fillColor=*/ { value: UNKNOWN_GREY },
        /*hoverColor=*/ RED_ORANGE,
        /*tooltipExpression=*/ missingDataTooltipValue
      ),
      createShapeMarks(
        /*datasetName=*/ VALID_DATASET,
        /*fillColor=*/ [{ scale: COLOR_SCALE, field: props.metric.metricId }],
        /*hoverColor=*/ DARK_BLUE,
        /*tooltipExpression=*/ tooltipValue
      ),
    ];
    if (props.overrideShapeWithCircle) {
      marks.push(createCircleTextMark(VALID_DATASET));
      marks.push(createCircleTextMark(MISSING_DATASET));
    }

    setSpec({
      $schema: "https://vega.github.io/schema/vega/v5.json",
      background: "white",
      description: props.legendTitle,
      data: [
        {
          name: VAR_DATASET,
          values: props.data,
        },
        {
          name: LEGEND_DATASET,
          values: legendData,
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
      projections: [projection],
      scales: [colorScale],
      legends: legendList,
      marks: marks,
      signals: [
        {
          name: "click",
          value: 0,
          on: [{ events: "click", update: "datum" }],
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
    props.overrideShapeWithCircle,
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
          // custom 3-dot options for states, hidden on territories
          actions={
            !props.hideActions && {
              export: { png: true, svg: true },
              source: false,
              compiled: false,
              editor: false,
            }
          }
          downloadFileName={`${props.filename} - Health Equity Tracker`}
          signalListeners={props.signalListeners}
        />
      )}
    </div>
  );
}
