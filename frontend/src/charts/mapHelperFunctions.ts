import type {
  DataTypeConfig,
  MetricId,
  MetricType,
} from '../data/config/MetricConfigTypes'
import type { Fips } from '../data/utils/Fips'
import type { FieldRange, HetRow } from '../data/utils/DatasetTypes'
import { generateSubtitle } from './utils'
import {
  type DemographicGroup,
  raceNameToCodeMap,
  ALL,
  RACE,
  AGE,
  LESS_THAN_POINT_1,
} from '../data/utils/Constants'
import type { ScaleType, Legend } from 'vega'
import type { DemographicType } from '../data/query/Breakdowns'
import { getWomenRaceLabel } from '../data/providers/CawpProvider'
import {
  CIRCLE_PROJECTION,
  COLOR_SCALE,
  GEO_DATASET,
  type HighestLowest,
  MISSING_DATASET,
  US_PROJECTION,
  VALID_DATASET,
  VAR_DATASET,
  LEGEND_SYMBOL_TYPE,
  DEFAULT_LEGEND_COLOR_COUNT,
  GREY_DOT_SCALE,
  LEGEND_TEXT_FONT,
  UNKNOWN_SCALE,
  MAP_SCHEMES,
  type CountColsMap,
} from './mapGlobals'
import { het } from '../styles/DesignTokens'
import { formatterMap, type LegendNumberFormat } from './legendHelperFunctions'
import { isPctType } from '../data/config/MetricConfigUtils'

/*

Vega requires a type of json to create the tooltip, where the key value pairs appear as new lines on the tooltip and render with a ":" in the middle.
Vega will render incoming strings AS CODE, meaning anything you want to appear as a literal string and not a vega function call / vega variable needs to be double quoted.

*/
export function buildTooltipTemplate(
  tooltipPairs: Record<string, string>,
  title?: string,
  includeSvi?: boolean,
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
    } else if (
      fips.isTerritory() ||
      fips.getParentFips().isTerritory() ||
      fips.isIndependentCity()
    ) {
      return '(County Equivalent)'
    } else return 'County'
  }
  return ''
}

/*
Takes an existing VEGA formatted JSON string for the tooltip template, and adds a row with numerator count and a row with denominator count
*/
export function addCountsTooltipInfo(
  demographicType: DemographicType,
  tooltipPairs: Record<string, string>,
  countColsMap: CountColsMap,
  activeDemographicGroup: DemographicGroup,
  isCawp?: boolean,
) {
  const numeratorPhrase = isCawp
    ? getCawpMapGroupNumeratorLabel(countColsMap, activeDemographicGroup)
    : getMapGroupLabel(
        demographicType,
        activeDemographicGroup,
        countColsMap?.numeratorConfig?.shortLabel ?? '',
      )
  const denominatorPhrase = isCawp
    ? getCawpMapGroupDenominatorLabel(countColsMap)
    : getMapGroupLabel(
        demographicType,
        activeDemographicGroup,
        countColsMap?.denominatorConfig?.shortLabel ?? '',
      )

  if (countColsMap?.numeratorConfig) {
    tooltipPairs[`# ${numeratorPhrase}`] =
      `datum.${countColsMap.numeratorConfig.metricId}`
  }

  if (countColsMap?.denominatorConfig) {
    tooltipPairs[`# ${denominatorPhrase}`] =
      `datum.${countColsMap.denominatorConfig.metricId}`
  }

  return tooltipPairs
}

/*
 formatted tooltip hover 100k values that round to zero should display as <1, otherwise should get pretty commas
 percent types get a single decimal place and the %
 every else gets passed through with commas for thousands
*/
export function formatPreventZero100k(
  metricType: MetricType,
  metricId: MetricId,
) {
  const isPct = isPctType(metricType)
  const legendFormatterType: LegendNumberFormat = isPct
    ? 'pct'
    : 'truncateWithK'
  const d3Format = formatterMap[legendFormatterType]

  if (metricType === 'per100k') {
    return `if (datum.${metricId} >= .1, format(datum.${metricId}, '${d3Format}'), '${LESS_THAN_POINT_1}') + ' per 100k'`
  }
  if (isPctType(metricType)) {
    return `format(datum.${metricId}, ',') + '%'`
  }
  return `format(datum.${metricId}, ',')`
}

/*
Get the  "no data" legend item with a grey box,

*/
export type HelperLegendType = 'insufficient' | 'zero'
export function getHelperLegend(yOffset: number, xOffset: number): Legend {
  return {
    fill: UNKNOWN_SCALE,
    symbolType: LEGEND_SYMBOL_TYPE,
    orient: 'none',
    titleFont: LEGEND_TEXT_FONT,
    labelFont: LEGEND_TEXT_FONT,
    legendY: yOffset,
    legendX: xOffset,
    size: GREY_DOT_SCALE,
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
  hideMissingDataTooltip?: boolean,
  outlineGeos?: boolean,
  isMulti?: boolean,
  isMobile?: boolean,
) {
  let territoryBubbleSize = isMulti ? 500 : 1000
  if (isMobile) territoryBubbleSize /= 3

  let encodeEnter: any = {}
  if (overrideShapeWithCircle) {
    encodeEnter = {
      size: { value: territoryBubbleSize },
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
        stroke: {
          value: outlineGeos ? het.altGrey : het.white,
          strokeWidth: { value: outlineGeos ? 1 : 0 },
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
  tooltipLabel: string,
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
  data: HetRow[],
  filename: string,
  fips: Fips,
  overrideShapeWithCircle?: boolean,
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
  overrideShapeWithCircle?: boolean,
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
export function getLegendDataBounds(data: HetRow[], metricId: MetricId) {
  const legendLowerBound = Math.min(...data.map((row) => row[metricId]))
  const legendUpperBound = Math.max(...data.map((row) => row[metricId]))

  return [legendLowerBound, legendUpperBound]
}

/* Figure out if a reduced number of legend color buckets is needed */
export function calculateLegendColorCount(
  legendData: HetRow[],
  metricId: MetricId,
) {
  const nonZeroData = legendData?.filter((row) => row[metricId] > 0)
  const uniqueNonZeroValueCount = new Set(
    nonZeroData?.map((row) => row[metricId]),
  ).size
  return Math.min(DEFAULT_LEGEND_COLOR_COUNT, uniqueNonZeroValueCount)
}

/* SET UP COLOR SCALE */
export function setupColorScale(
  legendData: HetRow[],
  metricId: MetricId,
  scaleType: ScaleType,
  fieldRange?: FieldRange,
  scaleColorScheme?: string,
  isTerritoryCircle?: boolean,
  reverse?: boolean,
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
      scheme: scaleColorScheme ?? MAP_SCHEMES.default,
      count: legendColorCount,
    },
    reverse,
  }
  if (fieldRange) {
    colorScale.domainMax = fieldRange.max
    colorScale.domainMin = fieldRange.min
  }

  const [legendLowerBound, legendUpperBound] = getLegendDataBounds(
    /* data */ legendData,
    /* metridId */ metricId,
  )

  if (legendLowerBound < legendUpperBound || Number.isNaN(legendLowerBound)) {
    // if there is a range, adjust slope of the linear behavior of symlog around 0.
    if (scaleType === 'symlog') colorScale.constant = 0.01
  } else {
    // if there is no range, use a dot instead of a gradient bar
    colorScale.type = 'ordinal'
  }

  return colorScale
}

export function getHighestLowestGroupsByFips(
  dataTypeConfig: DataTypeConfig,
  fullData?: HetRow[],
  demographicType?: DemographicType,
  metricId?: MetricId,
) {
  const fipsToGroup: Record<string, HighestLowest> = {}

  if (!fullData || !demographicType || !metricId) return fipsToGroup

  const fipsInData = new Set(fullData.map((row) => row.fips))
  for (const fips of fipsInData) {
    const dataForFips = fullData.filter(
      (row) =>
        row.fips === fips &&
        row[demographicType] !== ALL &&
        row[metricId] != null,
    )

    // handle places with limited groups / lots of zeros
    const validUniqueRates = Array.from(
      new Set(dataForFips.map((row) => row[metricId])),
    )
    if (validUniqueRates.length > 1) {
      const ascendingRows: HetRow[] = dataForFips.sort(
        (a, b) => a[metricId] - b[metricId],
      )
      const ascendingGroups: DemographicGroup[] = ascendingRows.map(
        (row) => row[demographicType],
      )

      fipsToGroup[fips] = {
        highest: generateSubtitle(
          /* activeDemographicGroup: */ ascendingGroups[
            ascendingGroups.length - 1
          ],
          /* demographicType:  */ demographicType,
          dataTypeConfig,
        ),
        lowest: generateSubtitle(
          /* activeDemographicGroup: */ ascendingGroups[0],
          /* demographicType:  */ demographicType,
          dataTypeConfig,
        ),
      }
      // TIE OVERRIDES
      if (ascendingRows[0][metricId] === ascendingRows[1][metricId])
        fipsToGroup[fips].lowest = 'Multiple groups'
      const size = ascendingRows.length
      if (
        ascendingRows[size - 1][metricId] === ascendingRows[size - 2][metricId]
      )
        fipsToGroup[fips].highest = 'Multiple groups'
    }
  }

  return fipsToGroup
}

export function embedHighestLowestGroups(
  data: any[],
  highestLowestGroupsByFips?: Record<string, HighestLowest>,
) {
  return data.map((row) => {
    row.highestGroup = highestLowestGroupsByFips?.[row.fips]?.highest
    row.lowestGroup = highestLowestGroupsByFips?.[row.fips]?.lowest
    return row
  })
}

export function getMapGroupLabel(
  demographicType: DemographicType,
  activeDemographicGroup: DemographicGroup,
  measureType: string,
) {
  if (activeDemographicGroup === ALL) return `${measureType} overall`

  let selectedGroup = activeDemographicGroup

  if (demographicType === RACE) {
    selectedGroup = ` — ${raceNameToCodeMap[activeDemographicGroup]}`
  } else if (demographicType === AGE) {
    selectedGroup = ` — Ages ${selectedGroup}`
  } else {
    selectedGroup = ` — ${activeDemographicGroup}`
  }
  return `${measureType}${selectedGroup}`
}

export function getCawpMapGroupNumeratorLabel(
  countColsMap: CountColsMap,
  activeDemographicGroup: DemographicGroup,
) {
  const cases = countColsMap?.numeratorConfig?.shortLabel ?? 'cases'
  if (activeDemographicGroup === ALL) return `Women ${cases} overall`
  return `${getWomenRaceLabel(activeDemographicGroup)} ${cases}`
}

export function getCawpMapGroupDenominatorLabel(countColsMap: CountColsMap) {
  return countColsMap?.denominatorConfig?.shortLabel ?? 'cases'
}

export function createBarLabel(
  chartIsSmall: boolean,
  measure: MetricId,
  tooltipMetricDisplayColumnName: string,
  usePercentSuffix: boolean,
) {
  const PER_100K = ' per 100k'
  const PERCENT = '%'

  const symbol = usePercentSuffix
    ? PERCENT
    : measure === 'hiv_stigma_index'
      ? ''
      : PER_100K
  const singleLineLabel = `datum.${tooltipMetricDisplayColumnName} + "${symbol}"`
  const multiLineLabel = `[datum.${tooltipMetricDisplayColumnName}, "${symbol}"]`

  if (chartIsSmall && !usePercentSuffix) {
    return multiLineLabel
  } else {
    return singleLineLabel
  }
}
