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
import type { Fips } from '../data/utils/Fips'
import { het } from '../styles/DesignTokens'
import ClickableLegendHeader from './ClickableLegendHeader'
import { createColorScale } from './choroplethMap/colorSchemes'
import { formatMetricValue } from './choroplethMap/tooltipUtils'

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
  isPhrma?: boolean
  fips: Fips
  isMulti?: boolean
  legendTitle: string
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
    const margin = { top: 10, right: 10, bottom: 10, left: 100 }
    const width = 300
    const itemHeight = 25
    const symbolSize = EQUAL_DOT_SIZE
    const labelOffset = 5

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
        const colorScale = createColorScale({
          data: props.data,
          metricId: props.metric.metricId,
          colorScheme: props.mapConfig.scheme,
          isUnknown: false,
          fips: props.fips,
          reverse: !props.mapConfig.higherIsBetter,
          isPhrma: false, // TODO: handle phrma
        }) as d3.ScaleQuantile<string, number>

        // Get the quantile thresholds (actual breakpoints)
        const thresholds = colorScale.quantiles()

        function labelFormat(value: number) {
          return formatMetricValue(value, props.metric, true)
        }

        // Create legend items using actual thresholds but formatted nicely
        if (thresholds.length > 0) {
          legendItems.push({
            color: colorScale(thresholds[0] - 1) as string,
            // label: `< ${thresholdFormat(thresholds[0])}${isPct ? '%' : ''}`,
            label: `< ${labelFormat(thresholds[0])}`,
            value: thresholds[0] - 1,
          })

          for (let i = 0; i < thresholds.length - 1; i++) {
            legendItems.push({
              color: colorScale(thresholds[i]) as string,
              label: `${labelFormat(thresholds[i])} – ${labelFormat(thresholds[i + 1])}`,
              value: thresholds[i],
            })
          }

          legendItems.push({
            color: colorScale(thresholds[thresholds.length - 1]) as string,
            label: `≥ ${labelFormat(thresholds[thresholds.length - 1])}`,
            value: thresholds[thresholds.length - 1],
          })
        }
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

  return (
    <section className='mx-4 flex flex-col items-center text-left'>
      <ClickableLegendHeader
        legendTitle={props.legendTitle}
        dataTypeConfig={props.dataTypeConfig}
      />
      <svg ref={svgRef} />
    </section>
  )
}
