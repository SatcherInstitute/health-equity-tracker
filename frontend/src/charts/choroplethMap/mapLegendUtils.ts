import * as d3 from 'd3'
import type {
  MetricConfig,
  MetricId,
} from '../../data/config/MetricConfigTypes'
import { isPctType } from '../../data/config/MetricConfigUtils'
import { het } from '../../styles/DesignTokens'
import { calculateLegendColorCount } from '../mapHelperFunctions'
import type { ColorScale, DataPoint } from './types'

const { altGrey } = het

export const createUnknownLegend = (
  legendGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  props: {
    dataWithHighestLowest: DataPoint[]
    metricId: MetricId
    width: number
    colorScale: ColorScale
    title: string
    isMobile: boolean
    isPct?: boolean
  },
) => {
  const { width, colorScale, title, isPct, isMobile } = props
  const gradientLength = width * 0.35
  const legendHeight = 15
  const [legendLowerBound, legendUpperBound] = colorScale.domain()
  const tickCount = isMobile
    ? 3
    : calculateLegendColorCount(props.dataWithHighestLowest, props.metricId)

  const ticks = d3
    .scaleLinear()
    .domain([legendLowerBound, legendUpperBound])
    .nice(tickCount)
    .ticks(tickCount)
    .filter((tick) => tick >= legendLowerBound && tick <= legendUpperBound)

  const legendContainer = legendGroup
    .append('g')
    .attr('class', 'unknowns-legend')

  legendContainer
    .append('text')
    .attr('x', 50)
    .attr('y', -5)
    .attr('text-anchor', 'start')
    .style('font', 'bold 10px sans-serif')
    .text(title)

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
      .text(isPct ? `${label}%` : label.toFixed(1))
  })
}

export const createRateMapLegend = (
  legendGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  props: {
    dataWithHighestLowest: DataPoint[]
    metricId: MetricId
    metricConfig: MetricConfig
    width: number
    colorScale: ColorScale
    title: string
    isMobile: boolean
    isPct?: boolean
  },
) => {
  const { width, colorScale, title, isPct, isMobile } = props
  const gradientLength = width * 0.35
  const legendHeight = 15
  const [legendLowerBound, legendUpperBound] = colorScale.domain()
  const tickCount = isMobile
    ? 3
    : calculateLegendColorCount(props.dataWithHighestLowest, props.metricId)

  const ticks = d3
    .scaleLinear()
    .domain([legendLowerBound, legendUpperBound])
    .nice(tickCount)
    .ticks(tickCount)
    .filter((tick) => tick >= legendLowerBound && tick <= legendUpperBound)

  const legendContainer = legendGroup
    .append('g')
    .attr('class', 'rate-map-legend')

  legendContainer
    .append('text')
    .attr('x', 50)
    .attr('y', -5)
    .attr('text-anchor', 'start')
    .style('font', 'bold 10px sans-serif')
    .text(title)

  const gradient = legendContainer
    .append('defs')
    .append('linearGradient')
    .attr('id', 'rate-map-legend-gradient')
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
    .style('fill', 'url(#rate-map-legend-gradient)')

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
      .text(formatLegendTickValue(label, props.metricConfig, !isMobile))
  })
}

function formatLegendTickValue(
  value: number,
  metricConfig: MetricConfig,
  isTinyAndUp: boolean,
): string {
  const format100k = d3.format('.2s')

  if (metricConfig.type === 'per100k') {
    return format100k(value)
  }

  if (isPctType(metricConfig.type)) {
    return `${value}%`
  }

  return value.toLocaleString('en-US')
}
