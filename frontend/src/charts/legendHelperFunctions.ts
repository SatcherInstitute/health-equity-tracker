import type { MetricId } from '../data/config/MetricConfigTypes'
import {
  COLOR_SCALE,
  DATASET_VALUES,
  DOT_SIZE_SCALE,
  LEGEND_SYMBOL_TYPE,
  NON_ZERO_DATASET_VALUES,
  PHRMA_ADHERENCE_BREAKPOINTS,
  SUMMARY_SCALE,
  type StackingDirection,
  ZERO_DOT_SCALE,
  ZERO_SCALE,
} from './mapGlobals'

export function setupZeroLegend(
  legendBucketLabel: string,
  isSummaryLegend?: boolean,
) {
  return {
    fill: isSummaryLegend ? COLOR_SCALE : ZERO_SCALE,
    symbolType: LEGEND_SYMBOL_TYPE,
    size: isSummaryLegend ? SUMMARY_SCALE : ZERO_DOT_SCALE,
    orient: 'left',
    encode: {
      labels: {
        update: {
          text: {
            signal: legendBucketLabel,
          },
        },
      },
    },
  }
}

const formatterMap: Record<LegendNumberFormat, string> = {
  truncateWithK: ',.2s', // simplify large 100k legend breakpoints: e.g. 8,123 -> 8.1k
  preventM: ',.2r', // ensure values well below 1 dont render with m like 100m - 200m
  pct: 'd', // pct style
}

export type LegendNumberFormat = 'truncateWithK' | 'preventM' | 'pct'
/* To make the discrete style legend where each color bucket is its own distinct shape */
export function setupNonZeroDiscreteLegend(
  legendBucketLabel: string,
  legendNumberFormat: LegendNumberFormat,
  stackingDirection: StackingDirection,
  columns: number,
) {
  return {
    fill: COLOR_SCALE,
    symbolType: LEGEND_SYMBOL_TYPE,
    size: DOT_SIZE_SCALE,
    format: formatterMap[legendNumberFormat],
    direction: stackingDirection,
    columns,
    columnPadding: 20,
    encode: {
      labels: {
        update: {
          text: {
            signal: `if (datum.label != null, ${legendBucketLabel}, '')`,
          },
        },
      },
    },
  }
}

/* To make the continuous style legend used for pct_rates like phrma adherence */
export function setupNonZeroContinuousPctLegend(
  legendBucketLabel: string,
  hasMissingData: boolean,
  stackingDirection: StackingDirection,
) {
  return {
    fill: COLOR_SCALE,
    gradientLength:
      stackingDirection === 'horizontal' && !hasMissingData ? 300 : 200,
    format: 'd',
    labelOffset: 8,
    gradientThickness: 20,
    direction: stackingDirection,
    columns: 1,
    encode: {
      labels: {
        update: {
          text: {
            signal: `if (datum.label != null, ${legendBucketLabel}, '')`,
          },
        },
      },
    },
  }
}

export function setupStandardColorScaleSpec(
  scaleType: any,
  metricId: MetricId,
  mapScheme: string,
  legendColorCount: number,
  isSummaryLegend?: boolean,
  reverse?: boolean,
) {
  const standardColorScaleSpec = {
    name: COLOR_SCALE,
    type: scaleType,
    domain: {
      data: isSummaryLegend ? DATASET_VALUES : NON_ZERO_DATASET_VALUES,
      field: metricId,
    },
    range: {
      scheme: mapScheme,
      count: isSummaryLegend ? 1 : legendColorCount,
    },
    reverse,
  }
  return standardColorScaleSpec
}

export function setupPhrmaAdherenceLegendScaleSpec(dotRange: number[]) {
  return {
    name: DOT_SIZE_SCALE,
    type: 'threshold',
    domain: PHRMA_ADHERENCE_BREAKPOINTS,
    range: dotRange,
  }
}

export function setupLegendScaleSpec(
  dotRange: number[],
  metricId: MetricId,
  scaleType: any,
  isSummaryLegend?: boolean,
) {
  return {
    name: DOT_SIZE_SCALE,
    type: scaleType,
    domain: {
      data: isSummaryLegend ? DATASET_VALUES : NON_ZERO_DATASET_VALUES,
      field: metricId,
    },
    range: dotRange,
  }
}
