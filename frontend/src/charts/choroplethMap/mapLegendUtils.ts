import type { Selection } from 'd3'
import { scaleLinear } from 'd3'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { colors } from '../../styles/tokens/colors'
import { PHRMA_ADHERENCE_BREAKPOINTS } from '../mapGlobals'
import { formatMetricValue } from './mapHelpers'
import type { ColorScale } from './types'

export function createUnknownLegend(
  legendGroup: Selection<SVGGElement, unknown, null, undefined>,
  options: {
    width: number
    colorScale: ColorScale
  },
) {
  const { width, colorScale } = options
  const gradientLength = width * 0.35
  const legendHeight = 15
  const [legendLowerBound, legendUpperBound] = colorScale.domain()
  const range = legendUpperBound - legendLowerBound

  // Skip gradient when all values are identical (no meaningful range to display)
  if (range === 0) return

  const tickCount = 2
  const ticks = scaleLinear()
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

  // Use 10 evenly-spaced stops so multi-hue scales (greenblue, viridis, etc.)
  // render all intermediate hues, not just a linear RGB blend of the endpoints.
  const stopCount = 10
  const stops = Array.from({ length: stopCount }, (_, i) => {
    const t = i / (stopCount - 1)
    return {
      offset: `${t * 100}%`,
      color: colorScale(legendLowerBound + t * range),
    }
  })

  gradient
    .selectAll('stop')
    .data(stops)
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
    .style('fill', colors.altGray)

  legendContainer
    .append('text')
    .attr('x', 50 + gradientLength + 50)
    .attr('y', 12)
    .style('font', '10px sans-serif')
    .text('no data')

  const labelGroup = legendContainer
    .append('g')
    .attr('transform', `translate(50, ${legendHeight + 10})`)

  const formatLabel = (val: number) =>
    Number.isInteger(val) ? val.toString() : val.toFixed(1)

  // Always label the actual min/max bounds; add any intermediate nice ticks
  // that are far enough from the boundaries to avoid overlapping labels.
  const middleTicks = ticks.filter(
    (tick) =>
      tick > legendLowerBound + range * 0.2 &&
      tick < legendUpperBound - range * 0.2,
  )
  const constrainedTicks = [
    { label: formatLabel(legendLowerBound), position: 0 },
    ...middleTicks.map((label) => ({
      label: formatLabel(label),
      position: ((label - legendLowerBound) / range) * gradientLength,
    })),
    { label: formatLabel(legendUpperBound), position: gradientLength },
  ]

  constrainedTicks.forEach(({ label, position }) => {
    labelGroup
      .append('text')
      .attr('x', position)
      .attr('text-anchor', 'middle')
      .style('font', '10px sans-serif')
      .text(`${label}%`)
  })
}

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
