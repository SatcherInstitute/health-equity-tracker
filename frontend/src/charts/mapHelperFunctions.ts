import type { DataTypeConfig, MetricId } from '../data/config/MetricConfigTypes'
import { getWomenRaceLabel } from '../data/providers/CawpProvider'
import type { DemographicType } from '../data/query/Breakdowns'
import {
  AGE,
  ALL,
  type DemographicGroup,
  RACE,
  raceNameToCodeMap,
} from '../data/utils/Constants'
import type { HetRow } from '../data/utils/DatasetTypes'
import type { Fips } from '../data/utils/Fips'
import {
  type CountColsMap,
  DEFAULT_LEGEND_COLOR_COUNT,
  type HighestLowest,
} from './mapGlobals'
import { generateSubtitle } from './utils'

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
