import React, { useState, useEffect } from "react";
import { Vega } from "react-vega";
import { useResponsiveWidth } from "../utils/useResponsiveWidth";
import { Fips } from "../data/utils/Fips";
import { MetricConfig } from "../data/config/MetricConfig";
import { FieldRange } from "../data/utils/DatasetTypes";
import { GEOGRAPHIES_DATASET_ID } from "../data/config/MetadataMap";
import sass from "../styles/variables.module.scss";
import {
  EQUAL_DOT_SIZE,
  GREY_DOT_SCALE,
  LEGEND_COLOR_COUNT,
  LEGEND_SYMBOL_TYPE,
  LEGEND_TEXT_FONT,
  MISSING_PLACEHOLDER_VALUES,
  NO_DATA_MESSAGE,
  UNKNOWN_SCALE,
} from "./Legend";
import { useMediaQuery } from "@material-ui/core";
import { ORDINAL, PADDING_FOR_ACTIONS_MENU } from "./utils";

export type ScaleType = "quantize" | "quantile" | "symlog";

const {
  unknownGrey: UNKNOWN_GREY,
  redOrange: RED_ORANGE,
  darkBlue: DARK_BLUE,
} = sass;

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
  // Use different labels for legend and tooltip if it's the unknowns map
  isUnknownsMap?: boolean;
  // If true, maps will render counties, otherwise it will render states/territories
  showCounties: boolean;
  // legendData is the dataset for which to calculate legend. Used to have a common legend between two maps.
  legendData?: Record<string, any>[];
  // Whether or not the legend is present
  hideLegend?: boolean;
  // If legend is present, what is the title
  legendTitle: string | string[];
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
    90 /* default width during initialization */
  );

  // calculate page size to determine if tiny mobile or not
  const pageIsTiny = useMediaQuery("(max-width:400px)");

  const yOffsetNoDataLegend = pageIsTiny ? -15 : -43;
  const xOffsetNoDataLegend = pageIsTiny ? 15 : 230;
  const heightWidthRatio = pageIsTiny ? 1 : 0.5;

  // Initial spec state is set in useEffect
  const [spec, setSpec] = useState({});

  const LEGEND_WIDTH = props.hideLegend ? 0 : 100;

  // Dataset to use for computing the legend
  const legendData = props.legendData || props.data;

  const legendLowerBound = Math.min(
    ...legendData.map((row) => row[props.metric.metricId])
  );
  const legendUpperBound = Math.max(
    ...legendData.map((row) => row[props.metric.metricId])
  );

  // Generate meaningful alt text
  const altText = `Map showing ${props.filename}${
    !props.fips.isCounty()
      ? ` across ${props.fips.getPluralChildFipsTypeDisplayName()}`
      : ""
  }`;

  useEffect(() => {
    const geoData = props.geoData
      ? { values: props.geoData }
      : { url: `/tmp/${GEOGRAPHIES_DATASET_ID}.json` };

    /* SET UP GEO DATASET */
    // Transform geo dataset by adding varField from VAR_DATASET
    let geoTransformers: any[] = [
      {
        type: "lookup",
        from: VAR_DATASET,
        key: VAR_FIPS,
        fields: [GEO_ID],
        values: [props.metric.metricId, "rating"],
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

    /* PROPERLY LABEL THE HOVERED GEO REGION IF TERRITORY */
    const countyOrEquivalent =
      props.fips.isTerritory() || props.fips.getParentFips().isTerritory()
        ? "County Equivalent"
        : "County";
    const stateOrTerritory = props.overrideShapeWithCircle
      ? "Territory"
      : "State";
    const geographyName = props.showCounties
      ? countyOrEquivalent
      : stateOrTerritory;
    const tooltipDatum = `format(datum.${props.metric.metricId}, ',')`;
    // TODO: would be nice to use addMetricDisplayColumn for the tooltips here so that data formatting is consistent.
    const tooltipLabel =
      props.isUnknownsMap && props.metric.unknownsVegaLabel
        ? props.metric.unknownsVegaLabel
        : props.metric.shortLabel;

    const tooltipValue = () => {
      if (props.fips.isCounty() || props.fips.isState()) {
        return `{"${geographyName}": datum.properties.name, "${tooltipLabel}": ${tooltipDatum}, "County SVI": datum.rating}`;
      }
      return `{"${geographyName}": datum.properties.name, "${tooltipLabel}": ${tooltipDatum},}`;
    };

    const missingDataTooltipValue = `{"${geographyName}": datum.properties.name, "${tooltipLabel}": "${NO_DATA_MESSAGE}", "County SVI": datum }`;
    /* SET UP LEGEND */
    let legendList = [];

    const unknownScale: any = {
      name: UNKNOWN_SCALE,
      type: ORDINAL,
      domain: { data: MISSING_PLACEHOLDER_VALUES, field: "missing" },
      range: [sass.unknownGrey],
    };

    const greyDotScale: any = {
      name: GREY_DOT_SCALE,
      type: ORDINAL,
      domain: { data: "missing_data", field: "missing" },
      range: [EQUAL_DOT_SIZE],
    };

    const legend: any = {
      fill: COLOR_SCALE,
      direction: "horizontal",
      title: props.legendTitle,
      titleLimit: 0,
      font: LEGEND_TEXT_FONT,
      labelFont: LEGEND_TEXT_FONT,
      labelOverlap: "greedy",
      labelSeparation: 10,
      orient: "bottom-left",
      offset: 15,
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

    const noDataLegend: any = {
      fill: UNKNOWN_SCALE,
      symbolType: LEGEND_SYMBOL_TYPE,
      orient: "none",
      font: LEGEND_TEXT_FONT,
      labelFont: LEGEND_TEXT_FONT,
      legendY: yOffsetNoDataLegend,
      legendX: xOffsetNoDataLegend,
      size: GREY_DOT_SCALE,
    };
    if (!props.hideLegend) {
      legendList.push(legend, noDataLegend);
    }

    /* SET UP COLOR SCALE */
    const colorScale: any = {
      name: COLOR_SCALE,
      type: props.scaleType,
      domain: { data: LEGEND_DATASET, field: props.metric.metricId },
      range: {
        scheme: props.scaleColorScheme || "yellowgreen",
        count: LEGEND_COLOR_COUNT,
      },
    };
    if (props.fieldRange) {
      colorScale["domainMax"] = props.fieldRange.max;
      colorScale["domainMin"] = props.fieldRange.min;
    }
    if (props.scaleType === "symlog") {
      // Controls the slope of the linear behavior of symlog around 0.
      colorScale["constant"] = 0.01;
    }

    // if there is no range, use a dot instead of a gradient bar for legend to prevent weirdness
    if (legendLowerBound === legendUpperBound) {
      colorScale["type"] = "ordinal";
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
            signal: "[" + width! + ", " + width! * heightWidthRatio + "]",
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
        aria: false,
        type: props.overrideShapeWithCircle ? "symbol" : "shape",
        from: { data: datasetName },
        encode: {
          enter: encodeEnter,
          update: { fill: fillColor },
          hover: {
            fill: { value: hoverColor },
            cursor: { value: "pointer" },
          },
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
        aria: false,
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
        /*tooltipExpression=*/ tooltipValue()
      ),
    ];

    if (props.overrideShapeWithCircle) {
      // Visible Territory Abbreviations
      marks.push(createCircleTextMark(VALID_DATASET));
      marks.push(createCircleTextMark(MISSING_DATASET));
    } else {
      // ALT TEXT: verbose, invisible text for screen readers showing valid data (incl territories)
      marks.push({
        name: "alt_text_labels",
        type: "text",
        style: ["text"],
        role: "list-item",
        from: { data: VAR_DATASET },
        encode: {
          update: {
            opacity: {
              signal: "0",
            },
            fontSize: { value: 0 },
            text: {
              signal: `
              datum.fips_name
              +
              ': '
              +
              ${tooltipDatum}
              +
              ' '
              +
              '${tooltipLabel}'
                  `,
            },
          },
        },
      });
    }

    let altText = props.overrideShapeWithCircle
      ? props.fips.getDisplayName()
      : `Map showing ${props.filename}`;

    if (!props.fips.isCounty() && !props.overrideShapeWithCircle)
      altText += `: including data from ${
        props.data.length
      } ${props.fips.getPluralChildFipsTypeDisplayName()}`;

    setSpec({
      $schema: "https://vega.github.io/schema/vega/v5.json",
      background: sass.white,
      description: props.overrideShapeWithCircle
        ? `Territory: ${props.fips.getDisplayName()}`
        : altText,
      data: [
        {
          name: MISSING_PLACEHOLDER_VALUES,
          values: [{ missing: NO_DATA_MESSAGE }],
        },
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
      scales: [colorScale, greyDotScale, unknownScale],
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

    // Render the Vega map asynchronously, allowing the UI to respond to user interaction before Vega maps render.
    // TODO! I'm not sure this is really working... the UI is definitely not responsive while state covid data is loading
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
    props.hideMissingDataTooltip,
    props.overrideShapeWithCircle,
    props.geoData,
    LEGEND_WIDTH,
    legendData,
    props.isUnknownsMap,
    yOffsetNoDataLegend,
    xOffsetNoDataLegend,
    props,
    heightWidthRatio,
    altText,
    legendLowerBound,
    legendUpperBound,
  ]);

  const mapStyle = pageIsTiny
    ? {
        width: "90%",
        marginRight: PADDING_FOR_ACTIONS_MENU,
      }
    : {
        width: "75%",
        margin: "auto",
      };

  return (
    <div ref={ref} style={mapStyle}>
      {shouldRenderMap && (
        <Vega
          renderer="svg"
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
