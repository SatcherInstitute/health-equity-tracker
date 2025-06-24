import * as d3 from 'd3'
import { het } from '../../styles/DesignTokens'
import type { ColorScale } from './types'

const { altGrey } = het

export function createUnknownLegend(
  legendGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  options: {
    width: number
    colorScale: ColorScale
  },
) {
  const { width, colorScale } = options
  const gradientLength = width * 0.35
  const legendHeight = 15
  const [legendLowerBound, legendUpperBound] = colorScale.domain()
  const tickCount = 2
  const ticks = d3
    .scaleLinear()
    .domain([legendLowerBound, legendUpperBound])
    .nice(tickCount)
    .ticks(tickCount)

  const legendContainer = legendGroup
    .append('g')
    .attr('class', 'unknowns-legend')

  const gradient = legendContainer
    .append('defs')
    .append('linearGradient')
    .attr('id', 'unknowns-legend-gradient')
    .attr('x1', '0%')
    .attr('x2', '100%')

  gradient
    .selectAll('stop')
    .data(
      ticks.map((value) => ({
        offset: `${
          ((value - legendLowerBound) / (legendUpperBound - legendLowerBound)) *
          100
        }%`,
        color: colorScale(value),
      })),
    )
    .join('stop')
    .attr('offset', (d) => d.offset)
    .attr('stop-color', (d) => d.color)

  legendContainer
    .append('rect')
    .attr('x', 50)
    .attr('y', 0)
    .attr('width', gradientLength)
    .attr('height', legendHeight)
    .style('fill', 'url(#unknowns-legend-gradient)')

  legendContainer
    .append('rect')
    .attr('x', 50 + gradientLength + 20)
    .attr('y', 0)
    .attr('width', 20)
    .attr('height', legendHeight)
    .style('fill', altGrey)

  legendContainer
    .append('text')
    .attr('x', 50 + gradientLength + 50)
    .attr('y', 12)
    .style('font', '10px sans-serif')
    .text('no data')

  const labelGroup = legendContainer
    .append('g')
    .attr('transform', `translate(50, ${legendHeight + 10})`) // Align to gradient start

  const constrainedTicks = ticks.map((label) => {
    // Constrain the positions of ticks to the gradient length
    const position =
      ((label - legendLowerBound) / (legendUpperBound - legendLowerBound)) *
      gradientLength

    // Clamp positions to the gradient bounds
    const clampedPosition = Math.min(Math.max(position, 10), gradientLength)
    return { label, position: clampedPosition }
  })

  // Add labels
  constrainedTicks.forEach(({ label, position }) => {
    labelGroup
      .append('text')
      .attr('x', position) // Correctly aligned within gradient bounds
      .attr('text-anchor', 'middle')
      .style('font', '10px sans-serif')
      .text(`${label}%`)
  })
}

import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { PHRMA_ADHERENCE_BREAKPOINTS } from '../mapGlobals'
import { formatMetricValue } from './tooltipUtils'

export interface LegendItemData {
  color: string
  label: string
  value: any
}

/**
 * Formats a metric value for display in legend labels
 */
export function createLabelFormatter(metricConfig: MetricConfig) {
  return (value: number) => formatMetricValue(value, metricConfig, true)
}

/**
 * Creates legend items for datasets with 1-4 unique values
 */
export function createLegendForSmallDataset(
  uniqueValues: number[],
  colorScale: ColorScale,
  labelFormat: (value: number) => string,
): LegendItemData[] {
  if (uniqueValues.length === 1) {
    // Single value - just show that value
    return [
      {
        value: uniqueValues[0],
        label: labelFormat(uniqueValues[0]),
        color: colorScale(uniqueValues[0]) as string,
      },
    ]
  }

  if (uniqueValues.length === 2) {
    // Two values - show both as discrete items
    return uniqueValues.map((value) => ({
      value,
      label: labelFormat(value),
      color: colorScale(value) as string,
    }))
  }

  // 3-4 unique values - show as discrete ranges
  return uniqueValues.map((value, index) => {
    if (index === uniqueValues.length - 1) {
      return {
        value,
        label: `≥ ${labelFormat(value)}`,
        color: colorScale(value) as string,
      }
    }

    const nextValue = uniqueValues[index + 1]
    return {
      value,
      label: `${labelFormat(value)} – ${labelFormat(nextValue - 0.01)}`, // Slight adjustment to avoid overlap
      color: colorScale(value) as string,
    }
  })
}

/**
 * Creates legend items for PHRMA adherence data using predefined breakpoints
 */
export function createPhrmaAdherenceLegend(
  colorScale: ColorScale,
  labelFormat: (value: number) => string,
): LegendItemData[] {
  const thresholds = PHRMA_ADHERENCE_BREAKPOINTS
  const firstThreshold = thresholds[0]
  const lastThreshold = thresholds[thresholds.length - 1]

  return [
    {
      value: firstThreshold - 1,
      label: `< ${labelFormat(firstThreshold)}`,
      color: colorScale(firstThreshold - 1) as string,
    },
    ...thresholds.slice(0, -1).map((threshold: number, i: number) => ({
      value: threshold,
      label: `${labelFormat(threshold)} – ${labelFormat(thresholds[i + 1])}`,
      color: colorScale(threshold) as string,
    })),
    {
      value: lastThreshold,
      label: `≥ ${labelFormat(lastThreshold)}`,
      color: colorScale(lastThreshold) as string,
    },
  ]
}

/**
 * Creates legend items for quantile scale data
 */
export function createQuantileLegend(
  colorScale: ColorScale & { quantiles(): number[] },
  labelFormat: (value: number) => string,
): LegendItemData[] {
  const thresholds = colorScale.quantiles()

  if (thresholds.length <= 1) {
    return []
  }

  const firstThreshold = thresholds[0]
  const lastThreshold = thresholds[thresholds.length - 1]

  return [
    {
      value: firstThreshold - 1,
      label: `< ${labelFormat(firstThreshold)}`,
      color: colorScale(firstThreshold - 1) as string,
    },
    ...thresholds.slice(0, -1).map((threshold: number, i: number) => ({
      value: threshold,
      label: `${labelFormat(threshold)} – ${labelFormat(thresholds[i + 1])}`,
      color: colorScale(threshold) as string,
    })),
    {
      value: lastThreshold,
      label: `≥ ${labelFormat(lastThreshold)}`,
      color: colorScale(lastThreshold) as string,
    },
  ]
}
