import * as d3 from 'd3'
import type {
  MapConfig,
  MetricConfig,
  MetricId,
} from '../../data/config/MetricConfigTypes'
import { isPctType } from '../../data/config/MetricConfigUtils'
import { het } from '../../styles/DesignTokens'
import { calculateLegendColorCount } from '../mapHelperFunctions'
import { D3_MAP_SCHEMES, getFillColor } from './colorSchemes'
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
    extremesMode?: boolean
    zeroColor?: string
    countyColor?: string
    mapConfig?: MapConfig
  },
) => {
  const {
    width,
    colorScale,
    title,
    isPct,
    isMobile,
    extremesMode = false,
    zeroColor = '#FFFFFF',
    countyColor = '#000000',
  } = props

  const [legendLowerBound, legendUpperBound] = colorScale.domain()
  const tickCount = calculateLegendColorCount(
    props.dataWithHighestLowest,
    props.metricId,
  )

  const legendX = width - 100
  const legendY = 70

  // Create discrete ticks and value ranges
  const ticks = d3
    .scaleLinear()
    .domain([legendLowerBound, legendUpperBound])
    .nice(tickCount)
    .ticks(tickCount)
    .filter((tick) => tick >= legendLowerBound && tick <= legendUpperBound)

  // Create value ranges
  const ranges = []
  for (let i = 0; i < ticks.length - 1; i++) {
    ranges.push({
      min: ticks[i],
      max: ticks[i + 1],
      value: (ticks[i] + ticks[i + 1]) / 2, // Midpoint for color calculation
      id: `range-${i}`, // Unique ID for the dataMap
    })
  }

  // Add the highest range
  if (ticks.length >= 2) {
    const lastTick = ticks[ticks.length - 1]
    const secondLastTick = ticks[ticks.length - 2]
    const step = lastTick - secondLastTick
    ranges.push({
      min: lastTick,
      max: lastTick + step,
      value: lastTick + step / 2, // Midpoint for color calculation
      id: `range-${ticks.length - 1}`, // Unique ID for the dataMap
    })
  }

  // Create a mock dataMap for getFillColor function
  const dataMap = new Map<string, { value: number }>()
  ranges.forEach((range) => {
    dataMap.set(range.id, { value: range.value })
  })

  const squareSize = 12
  const legendSpacing = 20
  const legendContainer = legendGroup
    .append('g')
    .attr('class', 'rate-map-legend')

  // Add title
  legendContainer
    .append('text')
    .attr('x', legendX)
    .attr('y', legendY - 10)
    .attr('text-anchor', 'start')
    .style('font', 'bold 10px sans-serif')
    .text(title)

  // Add color squares with value ranges
  const legendItems = legendContainer
    .selectAll('.legend-item')
    .data(ranges)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr(
      'transform',
      (d, i) => `translate(${legendX}, ${i * legendSpacing + legendY})`,
    )

  const legendColorScheme = d3
    .scaleSequential()
    .domain([legendLowerBound, legendUpperBound])
    .interpolator(D3_MAP_SCHEMES[props.mapConfig?.scheme || 'darkgreen'] as any)

  // Add color squares using getFillColor
  legendItems
    .append('rect')
    .attr('width', squareSize)
    .attr('height', squareSize)
    .style('fill', (d) => legendColorScheme(d.value))

  // Add value range labels
  legendItems
    .append('text')
    .attr('x', squareSize + 10)
    .attr('y', squareSize / 2)
    .attr('dy', '0.35em')
    .style('font', '10px sans-serif')
    .text((d) => {
      const minFormatted = formatLegendTickValue(
        d.min,
        props.metricConfig,
        !isMobile,
      )
      const maxFormatted = formatLegendTickValue(
        d.max,
        props.metricConfig,
        !isMobile,
      )
      return `${minFormatted} - ${maxFormatted}`
    })

  // Add "no data" item
  const noDataY = ranges.length * legendSpacing

  legendContainer
    .append('rect')
    .attr('x', legendX)
    .attr('y', noDataY)
    .attr('width', squareSize)
    .attr('height', squareSize)
    .style(
      'fill',
      getFillColor({
        d: {
          id: 'no-data',
          type: 'Feature',
          geometry: null as any,
          properties: null,
        },
        dataMap: new Map(), // Empty map for no data
        colorScale,
        extremesMode,
        zeroColor,
        countyColor,
      }),
    )

  legendContainer
    .append('text')
    .attr('x', legendX + squareSize + 10)
    .attr('y', noDataY + squareSize / 2)
    .attr('dy', '0.35em')
    .style('font', '10px sans-serif')
    .text('no data')
}

function formatLegendTickValue(
  value: number,
  metricConfig: MetricConfig,
  isTinyAndUp?: boolean,
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
