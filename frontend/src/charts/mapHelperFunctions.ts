import type {
  DataTypeConfig,
  MetricId,
  MetricType,
} from '../data/config/MetricConfigTypes'
import { isPctType } from '../data/config/MetricConfigUtils'
import { getWomenRaceLabel } from '../data/providers/CawpProvider'
import type { DemographicType } from '../data/query/Breakdowns'
import {
  AGE,
  ALL,
  type DemographicGroup,
  LESS_THAN_POINT_1,
  RACE,
  raceNameToCodeMap,
} from '../data/utils/Constants'
import type { HetRow } from '../data/utils/DatasetTypes'
import type { Fips } from '../data/utils/Fips'
import { type LegendNumberFormat, formatterMap } from './legendHelperFunctions'
import {
  type CountColsMap,
  DEFAULT_LEGEND_COLOR_COUNT,
  type HighestLowest,
} from './mapGlobals'
import { generateSubtitle } from './utils'

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
Calculate the min and max value for the given metricId
*/
export function getLegendDataBounds(
  data: HetRow[],
  metricId: MetricId,
): [number, number] {
  const values = data
    .map((row) => row[metricId])
    .filter((value) => value != null && !isNaN(value))

  if (values.length === 0) {
    console.warn(
      'No valid data points for legend bounds. Using fallback bounds [0, 1].',
    )
    return [0, 1]
  }

  const legendLowerBound = Math.min(...values)
  const legendUpperBound = Math.max(...values)

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
