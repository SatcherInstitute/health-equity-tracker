import type {
  MapConfig,
  MetricConfig,
} from '../../data/config/MetricConfigTypes'
import type { GeographicBreakdown } from '../../data/query/Breakdowns'
import { het } from '../../styles/DesignTokens'
import { NO_DATA_MESSAGE } from '../mapGlobals'
import {
  type LegendItemData,
  createLabelFormatter,
  createLegendForSmallDataset,
  createPhrmaAdherenceLegend,
  createQuantileLegend,
} from './mapLegendUtils'
import { type ColorScale, isQuantileScale } from './types'

export interface ProcessLegendDataParams {
  data: Array<Record<string, any>>
  metricConfig: MetricConfig
  mapConfig: MapConfig
  colorScale: ColorScale
  isPhrmaAdherence: boolean
  isSummaryLegend: boolean
  fipsTypeDisplayName?: GeographicBreakdown
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
  const {
    data,
    metricConfig,
    mapConfig,
    colorScale,
    isPhrmaAdherence,
    isSummaryLegend,
    fipsTypeDisplayName,
  } = params

  const labelFormat = createLabelFormatter(metricConfig)

  // Separate data by type
  const zeroData = data.filter((row) => row[metricConfig.metricId] === 0)
  const nonZeroData = data.filter((row) => row[metricConfig.metricId] > 0)
  const missingData = data.filter((row) => row[metricConfig.metricId] == null)

  const uniqueNonZeroValues = Array.from(
    new Set(nonZeroData.map((row) => row[metricConfig.metricId])),
  ).sort((a, b) => a - b)

  const hasMissingData = missingData.length > 0
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

  // Handle summary legend case
  if (isSummaryLegend || uniqueNonZeroValues.length === 1) {
    const summaryValue = nonZeroData[0][metricConfig.metricId]
    regularItems.push({
      value: summaryValue,
      label: `${labelFormat(summaryValue)} (${fipsTypeDisplayName} overall)`,
      color: mapConfig.mid,
    })
  }

  // Create special legend items (missing data, zero data)
  if (hasMissingData) {
    specialItems.push({
      color: het.howToColor,
      label: NO_DATA_MESSAGE,
      value: null,
    })
  }

  if (hasZeroData) {
    specialItems.push({
      color: mapConfig.zero || het.mapLightest,
      label: labelFormat(0),
      value: 0,
    })
  }

  return {
    regularItems,
    specialItems,
  }
}
