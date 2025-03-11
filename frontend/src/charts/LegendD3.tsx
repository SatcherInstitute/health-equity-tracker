import * as d3 from 'd3'
import { useEffect, useRef } from 'react'
import type {
  DataTypeConfig,
  MapConfig,
  MetricConfig,
} from '../data/config/MetricConfigTypes'
import { isPctType } from '../data/config/MetricConfigUtils'
import type { GeographicBreakdown } from '../data/query/Breakdowns'
import { LESS_THAN_POINT_1 } from '../data/utils/Constants'
import type { FieldRange } from '../data/utils/DatasetTypes'
import { het } from '../styles/DesignTokens'

export type ScaleType = 'quantile' | 'quantize' | 'threshold' | 'ordinal'
export type StackingDirection = 'horizontal' | 'vertical'

// Constants from mapGlobals
const NO_DATA_MESSAGE = 'No Data Available'
const EQUAL_DOT_SIZE = 15 // Size for dots in the legend
const DEFAULT_LEGEND_COLOR_COUNT = 5 // Default number of color buckets in legend

interface LegendD3Props {
  dataTypeConfig: DataTypeConfig
  data?: Array<Record<string, any>> // Dataset for which to calculate legend
  metric: MetricConfig
  fieldRange?: FieldRange // May be used if standardizing legends across charts
  scaleType: ScaleType
  description: string
  fipsTypeDisplayName?: GeographicBreakdown
  mapConfig: MapConfig
  columns: number
  stackingDirection: StackingDirection
}

export default function LegendD3(props: LegendD3Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !props.data) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Clear previous legend

    const isPct = isPctType(props.metric.type)

    // Process data - separate zero, non-zero, and missing data
    const zeroData = props.data.filter(
      (row) => row[props.metric.metricId] === 0,
    )
    const nonZeroData = props.data.filter(
      (row) => row[props.metric.metricId] > 0,
    )
    const uniqueNonZeroValues = Array.from(
      new Set(nonZeroData.map((row) => row[props.metric.metricId])),
    ).sort((a, b) => a - b)
    const missingData = props.data.filter(
      (row) => row[props.metric.metricId] == null,
    )

    const hasMissingData = missingData.length > 0
    const hasZeroData = zeroData.length > 0

    // Setup constants for legend layout
    const margin = { top: 10, right: 10, bottom: 10, left: 10 }
    const width = 300
    const itemHeight = 25
    const symbolSize = EQUAL_DOT_SIZE
    const labelOffset = 5

    // Create color scale based on the map config
    const colorPalette = generateColorRange(
      props.mapConfig.scheme,
      DEFAULT_LEGEND_COLOR_COUNT,
      Boolean(props.mapConfig.higherIsBetter),
    )

    // Determine the number of buckets to use
    const bucketCount = Math.min(
      DEFAULT_LEGEND_COLOR_COUNT,
      uniqueNonZeroValues.length || 1,
    )

    // Create the legend items
    const legendItems: { color: string; label: string; value: any }[] = []

    if (uniqueNonZeroValues.length > 0) {
      // Create appropriate scale based on scaleType
      if (props.scaleType === 'quantile') {
        // Create quantile scale for the color mapping
        const values = nonZeroData.map((row) => row[props.metric.metricId])

        const colorScale = d3
          .scaleQuantile<string>()
          .domain(values)
          .range(colorPalette.slice(0, bucketCount))

        // Get the quantile thresholds (actual breakpoints)
        const thresholds = colorScale.quantiles()

        // Create a nice tick formatter with appropriate precision
        const tickFormat = d3
          .scaleLinear()
          .domain(d3.extent(values) as [number, number])
          .tickFormat(5, ',.0f')

        // Create legend items using actual thresholds but formatted nicely
        if (thresholds.length > 0) {
          legendItems.push({
            color: colorScale(thresholds[0] - 1),
            label: `< ${tickFormat(thresholds[0])}${isPct ? '%' : ''}`,
            value: thresholds[0] - 1,
          })

          for (let i = 0; i < thresholds.length - 1; i++) {
            legendItems.push({
              color: colorScale(thresholds[i]),
              label: `${tickFormat(thresholds[i])}${isPct ? '%' : ''} – ${tickFormat(thresholds[i + 1])}${isPct ? '%' : ''}`,
              value: thresholds[i],
            })
          }

          legendItems.push({
            color: colorScale(thresholds[thresholds.length - 1]),
            label: `≥ ${tickFormat(thresholds[thresholds.length - 1])}${isPct ? '%' : ''}`,
            value: thresholds[thresholds.length - 1],
          })
        }
      }
      if (props.scaleType === 'threshold') {
        // Create threshold scale
        const min = uniqueNonZeroValues[0]
        const max = uniqueNonZeroValues[uniqueNonZeroValues.length - 1]
        const step = (max - min) / (bucketCount - 1)

        // Create thresholds
        const thresholds = []
        for (let i = 1; i < bucketCount; i++) {
          thresholds.push(min + step * i)
        }

        // Create scale
        const colorScale = d3
          .scaleThreshold<number, string>()
          .domain(thresholds)
          .range(colorPalette.slice(0, bucketCount + 1))

        // Create legend items
        legendItems.push({
          color: colorScale(min - 1), // First color
          label: `< ${formatLegendRangeValue(thresholds[0], isPct)}`,
          value: min,
        })

        for (let i = 0; i < thresholds.length - 1; i++) {
          legendItems.push({
            color: colorScale(thresholds[i]),
            label: `${formatLegendRangeValue(thresholds[i], isPct)} - ${formatLegendRangeValue(thresholds[i + 1], isPct)}`,
            value: thresholds[i],
          })
        }

        legendItems.push({
          color: colorScale(thresholds[thresholds.length - 1]), // Last color
          label: `≥ ${formatLegendRangeValue(thresholds[thresholds.length - 1], isPct)}`,
          value: max,
        })
      }
    }

    // Add zero item if needed
    if (hasZeroData) {
      legendItems.push({
        color: props.mapConfig.min || het.mapLightest,
        label: `${LESS_THAN_POINT_1}${isPct ? '%' : ''}`,
        value: 0,
      })
    }

    // Add missing data item if needed
    if (hasMissingData) {
      legendItems.push({
        color: het.howToColor || '#cccccc',
        label: NO_DATA_MESSAGE,
        value: null,
      })
    }

    // Calculate layout
    const columns = props.columns || 1
    const itemsPerColumn = Math.ceil(legendItems.length / columns)
    const height = itemsPerColumn * itemHeight + margin.top + margin.bottom

    // Set SVG dimensions
    svg
      .attr('width', width)
      .attr('height', height)
      .attr('aria-label', props.description)
      .style('background', 'transparent')
      .style('font-family', 'sans-serif')
      .style('font-size', '12px')

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    // Render legend items
    const columnWidth = (width - margin.left - margin.right) / columns

    legendItems.forEach((item, i) => {
      const col = Math.floor(i / itemsPerColumn)
      const row = i % itemsPerColumn

      const x = col * columnWidth
      const y = row * itemHeight

      // Add colored square
      g.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', symbolSize)
        .attr('height', symbolSize)
        .attr('fill', item.color)

      // Add text label
      g.append('text')
        .attr('x', x + symbolSize + labelOffset)
        .attr('y', y + symbolSize / 2 + 4) // Center text vertically with square
        .text(item.label)
    })
  }, [
    props.data,
    props.metric,
    props.scaleType,
    props.mapConfig,
    props.columns,
    props.stackingDirection,
    props.description,
  ])

  // Helper function to format values based on metric type
  function formatLegendRangeValue(value: number, isPct: boolean): string {
    if (isPct) {
      return `${value.toFixed(1)}%`
    }

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`
    }

    return value.toFixed(1)
  }

  // Helper function to generate a color range based on the map scheme
  function generateColorRange(
    scheme: string,
    count: number,
    reverse: boolean,
  ): string[] {
    // Map your color schemes to actual color arrays
    let colors: string[] = []

    switch (scheme) {
      case 'greens':
        colors = [
          het.mapLightest,
          het.mapLighter,
          het.mapLight,
          het.mapMid,
          het.mapDark,
          het.mapDarker,
          het.mapDarkest,
        ]
        break
      case 'blues':
        colors = [
          het.unknownMapLeast,
          het.unknownMapLesser,
          het.unknownMapLess,
          het.unknownMapMid,
          het.unknownMapMore,
          het.unknownMapEvenMore,
          het.unknownMapMost,
        ]
        break
      default:
        // Default to greens
        colors = [
          het.mapLightest,
          het.mapLighter,
          het.mapLight,
          het.mapMid,
          het.mapDark,
          het.mapDarker,
          het.mapDarkest,
        ]
    }

    // Select subset of colors to match count
    if (colors.length > count) {
      const indices = []
      for (let i = 0; i < count; i++) {
        indices.push(Math.floor((i * (colors.length - 1)) / (count - 1)))
      }
      colors = indices.map((i) => colors[i])
    }

    return reverse ? colors.slice().reverse() : colors
  }

  return (
    <section className='mx-4 flex flex-col items-center text-left'>
      <svg ref={svgRef} />
    </section>
  )
}
