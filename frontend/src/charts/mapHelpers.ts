import { MetricId, MetricType } from "../data/config/MetricConfig";
import { Fips } from "../data/utils/Fips";

import {
  GREY_DOT_SCALE,
  LEGEND_SYMBOL_TYPE,
  LEGEND_TEXT_FONT,
  UNKNOWN_SCALE,
  LEGEND_COLOR_COUNT,
  MISSING_PLACEHOLDER_VALUES,
  EQUAL_DOT_SIZE,
  ZERO_DOT_SCALE,
} from "./Legend";
import { FieldRange, Row } from "../data/utils/DatasetTypes";
import { ORDINAL } from "./utils";
import sass from "../styles/variables.module.scss";

export const MISSING_DATASET = "MISSING_DATASET";
export const US_PROJECTION = "US_PROJECTION";
export const CIRCLE_PROJECTION = "CIRCLE_PROJECTION";
export const GEO_DATASET = "GEO_DATASET";
export const VAR_DATASET = "VAR_DATASET";
export const ZERO_VAR_DATASET = "ZERO_VAR_DATASET";

export const COLOR_SCALE = "COLOR_SCALE";
export const ZERO_SCALE = "ZERO_SCALE";

export const LEGEND_DATASET = "LEGEND_DATASET";

export type ScaleType = "quantize" | "quantile" | "symlog";

export const UNKNOWN_SCALE_SPEC: any = {
  name: UNKNOWN_SCALE,
  type: ORDINAL,
  domain: { data: MISSING_PLACEHOLDER_VALUES, field: "missing" },
  range: [sass.unknownGrey],
};

export const GREY_DOT_SCALE_SPEC: any = {
  name: GREY_DOT_SCALE,
  type: ORDINAL,
  domain: { data: "missing_data", field: "missing" },
  range: [EQUAL_DOT_SIZE],
};

export const ZERO_DOT_SCALE_SPEC: any = {
  name: ZERO_DOT_SCALE,
  type: ORDINAL,
  domain: [0, 0],
  range: [EQUAL_DOT_SIZE],
};

/*
Vega requires a type of json to create the tooltip, where the key value pairs appear as new lines on the tooltip and render with a ":" in the middle.
Vega will render incoming strings AS CODE, meaning anything you want to appear as a literal string and not a vega function call / vega variable needs to be double quoted.
*/
export function buildTooltipTemplate(
  tooltipPairs: Record<string, string>,
  title?: string,
  includeSvi?: boolean
) {
  let template = `{`;
  if (title) template += `title: ${title},`;
  for (const [key, value] of Object.entries(tooltipPairs)) {
    template += `"${key}": ${value},`;
  }
  if (includeSvi) template += `"County SVI": datum.rating`;
  return (template += "}");
}

export function getCountyAddOn(fips: Fips, showCounties: Boolean) {
  if (showCounties) {
    if (fips.code === "02" || fips.getParentFips().code === "02")
      return "(County Equivalent)"; // Alaska
    else if (fips.code === "22" || fips.getParentFips().code === "22")
      return "Parish (County Equivalent)"; // Louisina
    else if (fips.isTerritory() || fips.getParentFips().isTerritory())
      return "(County Equivalent)";
    else return "County";
  }
  return "";
}

/* 
 formatted tooltip hover 100k values above zero should display as less than 1, otherwise should get pretty commas
*/
export function formatPreventZero100k(
  metricType: MetricType,
  metricId: MetricId
) {
  return metricType === "per100k"
    ? `if (datum.${metricId} > 0, format(datum.${metricId}, ','), '<1')`
    : `format(datum.${metricId}, ',')`;
}

/* 

*/
export function getNoDataLegend(yOffset: number, xOffset: number) {
  return {
    fill: UNKNOWN_SCALE,
    symbolType: LEGEND_SYMBOL_TYPE,
    orient: "none",
    font: LEGEND_TEXT_FONT,
    labelFont: LEGEND_TEXT_FONT,
    legendY: yOffset,
    legendX: xOffset,
    size: GREY_DOT_SCALE,
  };
}

/* DEFINE HOW TO CREATE A MARK ON THE UI */
/**
Function creating the Vega marks that appear on the chart (geographies or circles).
* datasetName: name of the dataset the marks should correspond to
* fillColor: schema defining how marks are filled - either a scale or static value.
* hoverColor: single color that should appear on hover
* tooltipExpression: expression defining how to render the contents of the hover tooltip
*/
export function createShapeMarks(
  datasetName: string,
  fillColor: any,
  hoverColor: string,
  tooltipExpression: string,
  overrideShapeWithCircle?: boolean,
  hideMissingDataTooltip?: boolean
) {
  let encodeEnter: any = {};
  if (overrideShapeWithCircle) {
    encodeEnter = {
      size: { value: "1000" },
      fill: fillColor,
      stroke: { value: "white" },
      strokeWidth: { value: 1.5 },
      x: { field: "centroid[0]" },
      y: { field: "centroid[1]" },
    };
  }
  if (!hideMissingDataTooltip || datasetName !== MISSING_DATASET) {
    encodeEnter["tooltip"] = {
      signal: tooltipExpression,
    };
  }
  let marks: any = {
    name: datasetName + "_MARK",
    aria: false,
    type: overrideShapeWithCircle ? "symbol" : "shape",
    from: { data: datasetName },
    encode: {
      enter: encodeEnter,
      update: {
        fill: fillColor,
        opacity: {
          signal: "1",
        },
      },
      hover: {
        fill: { value: hoverColor },
        cursor: { value: "pointer" },
      },
    },
  };
  if (!overrideShapeWithCircle) {
    marks["transform"] = [{ type: "geoshape", projection: US_PROJECTION }];
  }
  return marks;
}

export function createCircleTextMark(datasetName: string) {
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
}

/* ALT MARKS: verbose, invisible text for screen readers showing valid data (incl territories) */
export function createInvisibleAltMarks(
  tooltipDatum: string,
  tooltipLabel: string
) {
  return {
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
  };
}

/* 
Generate meaningful alt text
*/
export function makeAltText(
  data: Row[],
  filename: string,
  fips: Fips,
  overrideShapeWithCircle?: boolean
) {
  let altText = overrideShapeWithCircle
    ? fips.getDisplayName()
    : `Map showing ${filename}`;

  if (!fips.isCounty() && !overrideShapeWithCircle)
    altText += `: including data from ${
      data.length
    } ${fips.getPluralChildFipsTypeDisplayName()}`;

  return altText;
}

/* SET UP PROJECTION USED TO CREATE MARKS ON THE UI */
export function getProjection(
  fips: Fips,
  width: number,
  heightWidthRatio: number,
  overrideShapeWithCircle?: boolean
) {
  return overrideShapeWithCircle
    ? {
        name: CIRCLE_PROJECTION,
        type: "albersUsa",
        scale: 1100,
        translate: [{ signal: "width / 2" }, { signal: "height / 2" }],
      }
    : {
        name: US_PROJECTION,
        type:
          fips.isTerritory() || fips.getParentFips().isTerritory()
            ? "albers"
            : "albersUsa",
        fit: { signal: "data('" + GEO_DATASET + "')" },
        size: {
          signal: "[" + width! + ", " + width! * heightWidthRatio + "]",
        },
      };
}

/* 
Calculate the min and max value for the given metricId
*/
export function getLegendDataBounds(data: Row[], metricId: MetricId) {
  const legendLowerBound = Math.min(...data.map((row) => row[metricId]));
  const legendUpperBound = Math.max(...data.map((row) => row[metricId]));

  return [legendLowerBound, legendUpperBound];
}

/* SET UP COLOR SCALE */
export function setupColorScale(
  legendData: Row[],
  metricId: MetricId,
  scaleType: ScaleType,
  fieldRange?: FieldRange,
  scaleColorScheme?: string
) {
  const isCongressCAWP = metricId === "women_us_congress_pct";
  const colorScale: any = {
    name: COLOR_SCALE,
    type: isCongressCAWP ? "quantile" : "quantize",
    domain: isCongressCAWP
      ? [1, 20, 40, 60, 80, 99]
      : { data: LEGEND_DATASET, field: metricId },
    range: {
      scheme: scaleColorScheme || "yellowgreen",
      count: LEGEND_COLOR_COUNT,
    },
  };
  if (fieldRange) {
    colorScale["domainMax"] = fieldRange.max;
    colorScale["domainMin"] = fieldRange.min;
  }

  const [legendLowerBound, legendUpperBound] = getLegendDataBounds(
    /* data */ legendData,
    /* metridId */ metricId
  );

  if (legendLowerBound < legendUpperBound || isNaN(legendLowerBound)) {
    // if there is a range, adjust slope of the linear behavior of symlog around 0.
    if (scaleType === "symlog") colorScale["constant"] = 0.01;
  } else {
    // if there is no range, use a dot instead of a gradient bar
    colorScale["type"] = "ordinal";
  }

  return colorScale;
}
