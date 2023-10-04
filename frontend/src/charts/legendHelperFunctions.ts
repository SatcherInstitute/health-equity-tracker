import { type ScaleType, type Legend } from 'vega'
import {
  COLOR_SCALE,
  DATASET_VALUES,
  DOT_SIZE_SCALE,
  LEGEND_SYMBOL_TYPE,
  NON_ZERO_DATASET_VALUES,
  SUMMARY_SCALE,
  type StackingDirection,
  ZERO_DOT_SCALE,
  ZERO_SCALE,
} from './mapGlobals'
import { type MetricId } from '../data/config/MetricConfig'

export function setupZeroLegend(
  legendBucketLabel: string,
  isSummaryLegend?: boolean
): Legend {
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

/* To make the discrete style legend where each color bucket is its own distinct shape */
export function setupNonZeroDiscreteLegend(
  legendBucketLabel: string,
  isPct: boolean,
  stackingDirection: StackingDirection,
  columns: number
): Legend {
  return {
    fill: COLOR_SCALE,
    symbolType: LEGEND_SYMBOL_TYPE,
    size: DOT_SIZE_SCALE,
    format: isPct ? 'd' : ',.2r', // simplify large 100k legend breakpoints: e.g. 81,234 -> 81,0000
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
  stackingDirection: StackingDirection
): Legend {
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
  scaleType: ScaleType,
  metricId: MetricId,
  mapScheme: string,
  legendColorCount: number,
  isSummaryLegend?: boolean
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
  }
  return standardColorScaleSpec
}

export function setupPhrmaAdherenceLegendScaleSpec(dotRange: number[]) {
  return {
    name: DOT_SIZE_SCALE,
    type: 'threshold',
    domain: [60, 70, 75, 80, 85, 90],
    range: dotRange,
  }
}

export function setupLegendScaleSpec(
  dotRange: number[],
  metricId: MetricId,
  scaleType: ScaleType,
  isSummaryLegend?: boolean
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
