import type {
  MapConfig,
  MetricConfig,
} from '../../data/config/MetricConfigTypes'
import type { GeographicBreakdown } from '../../data/query/Breakdowns'
import { TERRITORY_CODES } from '../../data/utils/ConstantsGeography'
import type { Fips } from '../../data/utils/Fips'
import { colors } from '../../styles/tokens/colors'
import { DATA_SUPPRESSED, NO_DATA_MESSAGE } from '../mapGlobals'
import {
  createLabelFormatter,
  createLegendForSmallDataset,
  createPhrmaAdherenceLegend,
  createQuantileLegend,
  type LegendItemData,
} from './mapLegendUtils'
import { type ColorScale, isQuantileScale } from './types'

export interface ProcessLegendDataParams {
  data?: Array<Record<string, any>>
  metricConfig: MetricConfig
  mapConfig: MapConfig
  colorScale: ColorScale
  isPhrmaAdherence?: boolean
  isSummaryLegend?: boolean
  isExtremesMode?: boolean
  fipsTypeDisplayName?: GeographicBreakdown
  fips?: Fips
}

export interface ProcessedLegendData {
  regularItems: LegendItemData[]
  specialItems: LegendItemData[]
}

/**
 * Processes raw data and returns structured legend items
 */
export function processLegendData(
  params: ProcessLegendDataParams,
): ProcessedLegendData {
  if (!params.data) {
    return {
      regularItems: [],
      specialItems: [],
    }
  }

  const {
    data,
    metricConfig,
    mapConfig,
    colorScale,
    isPhrmaAdherence,
    isSummaryLegend,
    isExtremesMode,
    fipsTypeDisplayName,
    fips,
  } = params

  const labelFormat = createLabelFormatter(metricConfig)

  // Separate data by type
  const zeroData = data.filter((row) => row[metricConfig.metricId] === 0)
  const nonZeroData = data.filter((row) => row[metricConfig.metricId] > 0)
  const missingData = data.filter((row) => row[metricConfig.metricId] == null)

  const suppressionFlag = metricConfig.suppressionFlagMetricId
  const suppressedData = suppressionFlag
    ? missingData.filter((row) => row[suppressionFlag] === true)
    : []
  const unexplainedMissingData = missingData.filter(
    (row) => !suppressedData.includes(row),
  )

  // A national map draws a circle for every territory whether or not the
  // dataset carries a row for it, so a territory the source omits entirely
  // renders white while never appearing in `data`. Without this the map shows
  // a swatch the legend has no key for.
  // Extremes mode is a filter, so every shape outside the selection is drawn
  // white as background context. Absence swatches would relabel that white as
  // missing data and describe geographies the map is deliberately not showing.
  const hasAbsentTerritory =
    !isExtremesMode &&
    fips?.isUsa() === true &&
    Object.keys(TERRITORY_CODES).some(
      (code) => !data.some((row) => row.fips === code),
    )

  const uniqueNonZeroValues = Array.from(
    new Set(nonZeroData.map((row) => row[metricConfig.metricId])),
  ).sort((a, b) => a - b)

  const hasZeroData = zeroData.length > 0

  const regularItems: LegendItemData[] = []
  const specialItems: LegendItemData[] = []

  // Create regular legend items
  if (uniqueNonZeroValues.length > 1 && !isSummaryLegend) {
    if (isPhrmaAdherence) {
      regularItems.push(...createPhrmaAdherenceLegend(colorScale, labelFormat))
    } else if (uniqueNonZeroValues.length <= 4) {
      regularItems.push(
        ...createLegendForSmallDataset(
          uniqueNonZeroValues,
          colorScale,
          labelFormat,
        ),
      )
    } else if (isQuantileScale(colorScale)) {
      regularItems.push(
        ...createQuantileLegend(
          colorScale as ColorScale & { quantiles(): number[] },
          labelFormat,
        ),
      )
    } else {
      // Fallback for other scale types - treat as discrete values
      regularItems.push(
        ...createLegendForSmallDataset(
          uniqueNonZeroValues,
          colorScale,
          labelFormat,
        ),
      )
    }
  }

  // Handle summary legend case. A summary map can be a single geography whose
  // only rate is absent, in which case there is no value to summarize and the
  // special items below carry the whole story.
  if ((isSummaryLegend || uniqueNonZeroValues.length === 1) && nonZeroData[0]) {
    const summaryValue = nonZeroData[0][metricConfig.metricId]
    regularItems.push({
      value: summaryValue,
      label: `${labelFormat(summaryValue)} (${fipsTypeDisplayName} overall)`,
      color: colorScale(summaryValue),
    })
  }

  // A map can hold both kinds of absence at once, so they get separate swatches
  // rather than one label standing in for whichever kind happens to dominate
  if (unexplainedMissingData.length > 0 || hasAbsentTerritory) {
    specialItems.push({
      color: colors.altWhite,
      borderColor: colors.altGray,
      label: NO_DATA_MESSAGE,
      value: null,
    })
  }

  if (suppressedData.length > 0) {
    specialItems.push({
      color: colors.altGray,
      borderColor: colors.altBlack,
      label: DATA_SUPPRESSED,
      value: null,
    })
  }

  if (hasZeroData) {
    specialItems.push({
      color: mapConfig.zero || colors.mapLightest,
      label: labelFormat(0),
      value: 0,
    })
  }

  return {
    regularItems,
    specialItems,
  }
}
