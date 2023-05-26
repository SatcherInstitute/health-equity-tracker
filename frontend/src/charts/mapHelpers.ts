import { type MetricId, type MetricType } from '../data/config/MetricConfig'
import { type Fips } from '../data/utils/Fips'
import {
  CAWP_CONGRESS_COUNTS,
  getWomenRaceLabel,
} from '../data/variables/CawpProvider'

import {
  GREY_DOT_SCALE,
  LEGEND_SYMBOL_TYPE,
  LEGEND_TEXT_FONT,
  UNKNOWN_SCALE,
  DEFAULT_LEGEND_COLOR_COUNT,
  MISSING_PLACEHOLDER_VALUES,
  EQUAL_DOT_SIZE,
  ZERO_DOT_SCALE,
} from './Legend'
import { type FieldRange, type Row } from '../data/utils/DatasetTypes'
import { ORDINAL } from './utils'
import sass from '../styles/variables.module.scss'
import { LESS_THAN_1, raceNameToCodeMap } from '../data/utils/Constants'
import { BLACK_WOMEN_METRICS } from '../data/variables/HivProvider'
import { type Legend } from 'vega'

export const MISSING_DATASET = 'MISSING_DATASET'
export const US_PROJECTION = 'US_PROJECTION'
export const CIRCLE_PROJECTION = 'CIRCLE_PROJECTION'
export const GEO_DATASET = 'GEO_DATASET'
export const VAR_DATASET = 'VAR_DATASET'
export const ZERO_VAR_DATASET = 'ZERO_VAR_DATASET'

export const VALID_DATASET = 'VALID_DATASET'
export const ZERO_DATASET = 'ZERO_DATASET'

export const COLOR_SCALE = 'COLOR_SCALE'
export const ZERO_SCALE = 'ZERO_SCALE'

export const LEGEND_DATASET = 'LEGEND_DATASET'

export type ScaleType = 'quantize' | 'quantile' | 'symlog'

export const RATE_MAP_SCALE: ScaleType = 'quantile'
export const UNKNOWNS_MAP_SCALE: ScaleType = 'symlog'

export const MAP_SCHEME = 'darkgreen'
export const UNKNOWNS_MAP_SCHEME = 'greenblue'
export const MAP_BW_SCHEME = 'plasma'

export const UNKNOWN_SCALE_SPEC: any = {
  name: UNKNOWN_SCALE,
  type: ORDINAL,
  domain: { data: MISSING_PLACEHOLDER_VALUES, field: 'missing' },
  range: [sass.unknownGrey],
}

export const GREY_DOT_SCALE_SPEC: any = {
  name: GREY_DOT_SCALE,
  type: ORDINAL,
  domain: { data: 'missing_data', field: 'missing' },
  range: [EQUAL_DOT_SIZE],
}

export const ZERO_DOT_SCALE_SPEC: any = {
  name: ZERO_DOT_SCALE,
  type: ORDINAL,
  domain: [0, 0],
  range: [EQUAL_DOT_SIZE],
}

export const ZERO_YELLOW_SCALE = {
  name: ZERO_SCALE,
  type: 'ordinal',
  domain: [0],
  range: [sass.mapMin],
}

/*
Vega requires a type of json to create the tooltip, where the key value pairs appear as new lines on the tooltip and render with a ":" in the middle.
Vega will render incoming strings AS CODE, meaning anything you want to appear as a literal string and not a vega function call / vega variable needs to be double quoted.
*/
export function buildTooltipTemplate(
  tooltipPairs: Record<string, string>,
  title?: string,
  includeSvi?: boolean
) {
  let template = `{`
  if (title) template += `title: ${title},`
  for (const [key, value] of Object.entries(tooltipPairs)) {
    template += `"${key}": ${value},`
  }
  if (includeSvi) template += `"County SVI": datum.rating`
  return (template += '}')
}

export function getCountyAddOn(fips: Fips, showCounties: boolean) {
  if (showCounties) {
    if (fips.code.startsWith('02')) {
      // Alaska
      return '(County Equivalent)'
    } else if (fips.code.startsWith('22')) {
      // Louisina
      return 'Parish (County Equivalent)'
    } else if (fips.isTerritory() || fips.getParentFips().isTerritory()) {
      return '(County Equivalent)'
    } else return 'County'
  }
  return ''
}

/*
Takes an existing VEGA formatted JSON string for the tooltip template and appends two rows for # TOTAL CONGRESS and # WOMEN THIS RACE IN CONGRESS
*/
export function addCAWPTooltipInfo(
  tooltipPairs: Record<string, string>,
  subTitle: string,
  countCols: MetricId[]
) {
  const raceName = subTitle ? getWomenRaceLabel(subTitle) : ''
  const members = CAWP_CONGRESS_COUNTS.includes(countCols[0])
    ? 'members'
    : 'legislators'

  const raceCode: string | undefined = raceName
    ? raceNameToCodeMap?.[raceName]
    : ''

  const numLines = Object.keys(countCols).length

  if (numLines > 0) {
    tooltipPairs[
      `# ${raceCode ?? ''} women ${members}`
    ] = `datum.${countCols[0]}`
  }

  if (numLines > 1) {
    tooltipPairs[`# total ${members}`] = `datum.${countCols[1]}`
  }

  return tooltipPairs
}

/*
 formatted tooltip hover 100k values above zero should display as less than 1, otherwise should get pretty commas
*/
export function formatPreventZero100k(
  metricType: MetricType,
  metricId: MetricId
) {
  return metricType === 'per100k'
    ? `if (datum.${metricId} > 0, format(datum.${metricId}, ','), '${LESS_THAN_1}')`
    : `format(datum.${metricId}, ',')`
}

/*
Get either the normal "insufficient data" legend item with a grey box,
or optionally the "0" item with a light yellow green box for CAWP congress or
any other datatype where we expect and want to highlight zeros
*/
export type HelperLegendType = 'insufficient' | 'zero'
export function getHelperLegend(
  yOffset: number,
  xOffset: number,
  overrideGrayMissingWithZeroYellow?: boolean
): Legend {
  return {
    fill: overrideGrayMissingWithZeroYellow ? ZERO_SCALE : UNKNOWN_SCALE,
    symbolType: LEGEND_SYMBOL_TYPE,
    orient: overrideGrayMissingWithZeroYellow ? undefined : 'none',
    titleFont: LEGEND_TEXT_FONT,
    labelFont: LEGEND_TEXT_FONT,
    legendY: yOffset,
    legendX: xOffset,
    size: overrideGrayMissingWithZeroYellow ? ZERO_DOT_SCALE : GREY_DOT_SCALE,
  }
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
  let encodeEnter: any = {}
  if (overrideShapeWithCircle) {
    encodeEnter = {
      size: { value: '1000' },
      fill: fillColor,
      stroke: { value: 'white' },
      strokeWidth: { value: 1.5 },
      x: { field: 'centroid[0]' },
      y: { field: 'centroid[1]' },
    }
  }
  if (!hideMissingDataTooltip || datasetName !== MISSING_DATASET) {
    encodeEnter.tooltip = {
      signal: tooltipExpression,
    }
  }
  const marks: any = {
    name: datasetName + '_MARK',
    aria: false,
    type: overrideShapeWithCircle ? 'symbol' : 'shape',
    from: { data: datasetName },
    encode: {
      enter: encodeEnter,
      update: {
        fill: fillColor,
        opacity: {
          signal: '1',
        },
      },
      hover: {
        fill: { value: hoverColor },
        cursor: { value: 'pointer' },
      },
    },
  }
  if (!overrideShapeWithCircle) {
    marks.transform = [{ type: 'geoshape', projection: US_PROJECTION }]
  }
  return marks
}

/* ALT MARKS: verbose, invisible text for screen readers showing valid data (incl territories) */
export function createInvisibleAltMarks(
  tooltipDatum: string,
  tooltipLabel: string
) {
  return {
    name: 'alt_text_labels',
    type: 'text',
    style: ['text'],
    role: 'list-item',
    from: { data: VAR_DATASET },
    encode: {
      update: {
        opacity: {
          signal: '0',
        },
        fontSize: { value: 0 },
        text: {
          signal: `datum.fips_name + ': ' + ${tooltipDatum} + ' ' + '${tooltipLabel}'`,
        },
      },
    },
  }
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
    : `Map showing ${filename}`

  if (!fips.isCounty() && !overrideShapeWithCircle) {
    altText += `: including data from ${
      data.length
    } ${fips.getPluralChildFipsTypeDisplayName()}`
  }

  return altText
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
        type: 'albersUsa',
        scale: 1100,
        translate: [{ signal: 'width / 2' }, { signal: 'height / 2' }],
      }
    : {
        name: US_PROJECTION,
        type:
          fips.isTerritory() || fips.getParentFips().isTerritory()
            ? 'albers'
            : 'albersUsa',
        fit: { signal: "data('" + GEO_DATASET + "')" },
        size: {
          signal: '[' + width + ', ' + width * heightWidthRatio + ']',
        },
      }
}

/*
Calculate the min and max value for the given metricId
*/
export function getLegendDataBounds(data: Row[], metricId: MetricId) {
  const legendLowerBound = Math.min(...data.map((row) => row[metricId]))
  const legendUpperBound = Math.max(...data.map((row) => row[metricId]))

  return [legendLowerBound, legendUpperBound]
}

/* Figure out if a reduced number of legend color buckets is needed */
export function calculateLegendColorCount(
  legendData: Row[],
  metricId: MetricId
) {
  const nonZeroData = legendData?.filter((row) => row[metricId] > 0)
  const uniqueNonZeroValueCount = new Set(
    nonZeroData?.map((row) => row[metricId])
  ).size
  return Math.min(DEFAULT_LEGEND_COLOR_COUNT, uniqueNonZeroValueCount)
}

/* SET UP COLOR SCALE */
export function setupColorScale(
  legendData: Row[],
  metricId: MetricId,
  scaleType: ScaleType,
  fieldRange?: FieldRange,
  scaleColorScheme?: string,
  isTerritoryCircle?: boolean
) {
  const legendColorCount = calculateLegendColorCount(legendData, metricId)

  const colorScale: any = {
    name: COLOR_SCALE,
    type: scaleType,
    // CONDITIONALLY AVOID BUGS: VALID_ makes territories with non-zero data always the darkest color while VAR_ caused non-territory non-zero county colors to not match legend scale
    domain: {
      data: isTerritoryCircle ? VAR_DATASET : VALID_DATASET,
      field: metricId,
    },
    range: {
      scheme: scaleColorScheme ?? MAP_SCHEME,
      count: legendColorCount,
    },
  }
  if (fieldRange) {
    colorScale.domainMax = fieldRange.max
    colorScale.domainMin = fieldRange.min
  }

  const [legendLowerBound, legendUpperBound] = getLegendDataBounds(
    /* data */ legendData,
    /* metridId */ metricId
  )

  if (legendLowerBound < legendUpperBound || isNaN(legendLowerBound)) {
    // if there is a range, adjust slope of the linear behavior of symlog around 0.
    if (scaleType === 'symlog') colorScale.constant = 0.01
  } else {
    // if there is no range, use a dot instead of a gradient bar
    colorScale.type = 'ordinal'
  }

  return colorScale
}

interface GetMapSchemeProps {
  metricId: MetricId
  isUnknownsMap?: boolean
  isSummaryLegend?: boolean
}

export function getMapScheme({
  metricId,
  isSummaryLegend,
  isUnknownsMap,
}: GetMapSchemeProps) {
  let mapScheme = MAP_SCHEME
  let mapMin = isSummaryLegend ? sass.mapMid : sass.mapMin

  if (isUnknownsMap) {
    mapScheme = UNKNOWNS_MAP_SCHEME
    mapMin = sass.unknownMapMin
  }
  if (BLACK_WOMEN_METRICS.includes(metricId)) {
    mapScheme = MAP_BW_SCHEME
    mapMin = isSummaryLegend ? sass.mapBwMid : sass.mapBwMin
  }

  return [mapScheme, mapMin]
}
