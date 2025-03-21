import * as d3 from 'd3'
import { useEffect, useRef } from 'react'
import { INVISIBLE_PRELOAD_WIDTH } from '../../charts/mapGlobals'
import type {
  DataTypeConfig,
  MapConfig,
  MetricConfig,
} from '../../data/config/MetricConfigTypes'
import type { GeographicBreakdown } from '../../data/query/Breakdowns'
import type { FieldRange } from '../../data/utils/DatasetTypes'
import type { Fips } from '../../data/utils/Fips'
import { het } from '../../styles/DesignTokens'
import { getTailwindBreakpointValue } from '../../utils/hooks/useIsBreakpointAndUp'
import { useResponsiveWidth } from '../../utils/hooks/useResponsiveWidth'
import ClickableLegendHeader from '../ClickableLegendHeader'
import { NO_DATA_MESSAGE, PHRMA_ADHERENCE_BREAKPOINTS } from '../mapGlobals'
import { createColorScale } from './colorSchemes'
import { useGetLegendColumnCount } from './mapLegendUtils'
import { formatMetricValue } from './tooltipUtils'

interface RateMapLegendProps {
  dataTypeConfig: DataTypeConfig
  data?: Array<Record<string, any>> // Dataset for which to calculate legend
  metricConfig: MetricConfig
  fieldRange?: FieldRange // May be used if standardizing legends across charts
  description: string
  fipsTypeDisplayName?: GeographicBreakdown
  mapConfig: MapConfig
  isPhrmaAdherence: boolean
  isSummaryLegend?: boolean
  fips: Fips
  isMulti?: boolean
  legendTitle: string
}

export default function RateMapLegend(props: RateMapLegendProps) {
  function labelFormat(value: number) {
    return formatMetricValue(value, props.metricConfig, true)
  }

  // Get dynamic column count based on screen size
  const regularColsCount = useGetLegendColumnCount(props.isMulti)
  const [containerRef, containerWidth] = useResponsiveWidth()

  const svgRef = useRef<SVGSVGElement>(null)

  // Single useEffect for all rendering logic
  useEffect(() => {
    if (
      !svgRef.current ||
      !props.data ||
      containerWidth === INVISIBLE_PRELOAD_WIDTH
    ) {
      return
    }

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Clear previous legend

    // Process data - separate zero, non-zero, and missing data
    const zeroData = props.data.filter(
      (row) => row[props.metricConfig.metricId] === 0,
    )
    const nonZeroData = props.data.filter(
      (row) => row[props.metricConfig.metricId] > 0,
    )
    const uniqueNonZeroValues = Array.from(
      new Set(nonZeroData.map((row) => row[props.metricConfig.metricId])),
    ).sort((a, b) => a - b)
    const missingData = props.data.filter(
      (row) => row[props.metricConfig.metricId] == null,
    )

    const hasMissingData = missingData.length > 0
    const hasZeroData = zeroData.length > 0

    // Setup constants for legend layout
    const margin = { top: 10, right: 20, bottom: 10, left: 20 }
    const legendRowHeight = 20
    const symbolSize = 15
    const labelOffset = 5

    // Separate regular legend items from special items
    const regularLegendItems: { color: string; label: string; value: any }[] =
      []
    const specialLegendItems: { color: string; label: string; value: any }[] =
      []

    if (uniqueNonZeroValues.length > 0 && !props.isSummaryLegend) {
      const colorScale = createColorScale({
        data: props.data,
        metricId: props.metricConfig.metricId,
        colorScheme: props.mapConfig.scheme,
        isUnknown: false,
        fips: props.fips,
        reverse: !props.mapConfig.higherIsBetter,
        isPhrmaAdherence: props.isPhrmaAdherence,
        isSummaryLegend: props.isSummaryLegend,
        mapConfig: props.mapConfig,
      }) as d3.ScaleQuantile<string, number>

      const thresholds = props.isPhrmaAdherence
        ? PHRMA_ADHERENCE_BREAKPOINTS
        : colorScale.quantiles()
      if (thresholds.length > 0) {
        const firstThreshold = thresholds[0]
        const lastThreshold = thresholds[thresholds.length - 1]

        regularLegendItems.push(
          {
            value: firstThreshold - 1,
            label: `< ${labelFormat(firstThreshold)}`,
            color: colorScale(firstThreshold - 1) as string,
          },

          ...thresholds.slice(0, -1).map((threshold, i) => ({
            value: threshold,
            label: `${labelFormat(threshold)} – ${labelFormat(thresholds[i + 1])}`,
            color: colorScale(threshold) as string,
          })),

          {
            value: lastThreshold,
            label: `≥ ${labelFormat(lastThreshold)}`,
            color: colorScale(lastThreshold) as string,
          },
        )
      }
    }

    if (props.isSummaryLegend) {
      const summaryValue = nonZeroData[0][props.metricConfig.metricId]

      regularLegendItems.push({
        value: summaryValue,
        label: `${labelFormat(summaryValue)} ${props.fipsTypeDisplayName} overall`,
        color: props.mapConfig.mid,
      })
    }

    // Items with value of 0
    if (hasZeroData) {
      specialLegendItems.push({
        color: props.mapConfig.zero || het.mapLightest,
        label: labelFormat(0),
        value: 0,
      })
    }

    // Add missing data item to special items
    if (hasMissingData) {
      specialLegendItems.push({
        color: het.howToColor,
        label: NO_DATA_MESSAGE,
        value: null,
      })
    }

    // Calculate layout with responsive adjustments
    // Adjust columns based on available width
    let adjustedColumnCount = regularColsCount
    const smBreakpoint = getTailwindBreakpointValue('sm')
    if (containerWidth < smBreakpoint && regularLegendItems.length > 0) {
      adjustedColumnCount = Math.max(1, regularColsCount - 1)
    }

    const hasSpecialColumn = specialLegendItems.length > 0
    const totalColumns = hasSpecialColumn
      ? adjustedColumnCount + 1
      : adjustedColumnCount

    // Calculate how many items should be in each column
    const itemsPerRegularColumn = Math.ceil(
      regularLegendItems.length / adjustedColumnCount,
    )
    const maxItemsInAnyColumn = Math.max(
      itemsPerRegularColumn,
      specialLegendItems.length,
    )

    const height =
      maxItemsInAnyColumn * legendRowHeight + margin.top + margin.bottom

    // Set SVG dimensions with responsive width
    svg
      .attr('width', containerWidth)
      .attr('height', height)
      .attr('aria-label', props.description)
      .style('background', 'transparent')
      .style('font-family', 'sans-serif')
      .style('font-size', '12px')

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    // Calculate available width for columns (accounting for margins)
    const availableWidth = containerWidth - margin.left - margin.right

    // Create properly sized columns based on available width
    const columnWidth = availableWidth / totalColumns

    // Render special items in the first column if they exist
    if (hasSpecialColumn) {
      specialLegendItems.forEach((item, i) => {
        const y = i * legendRowHeight

        // Add colored square
        g.append('rect')
          .attr('x', 0)
          .attr('y', y)
          .attr('width', symbolSize)
          .attr('height', symbolSize)
          .attr('fill', item.color)

        // Add text label
        g.append('text')
          .attr('x', symbolSize + labelOffset)
          .attr('y', y + symbolSize / 2 + 4) // Center text vertically with square
          .text(item.label)
      })
    }

    // Render regular legend items after the special column
    regularLegendItems.forEach((item, i) => {
      const col = Math.floor(i / itemsPerRegularColumn)

      // Calculate x position with responsive adjustments
      const xOffset = hasSpecialColumn ? columnWidth : 0
      const x = xOffset + col * columnWidth
      const row = i % itemsPerRegularColumn
      const y = row * legendRowHeight

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
        .append('title')
        .text(item.label) // Add title for tooltip on hover
    })
  }, [
    props.data,
    props.metricConfig,
    props.mapConfig,
    props.description,
    containerWidth,
    regularColsCount,
    props.fips,
    props.isMulti,
    props.fipsTypeDisplayName,
    props.isPhrmaAdherence,
    props.isSummaryLegend,
  ])

  return (
    <section
      className='mx-4 flex flex-col items-center text-left w-full'
      ref={containerRef}
    >
      <ClickableLegendHeader
        legendTitle={props.legendTitle}
        dataTypeConfig={props.dataTypeConfig}
      />
      <svg ref={svgRef} className='w-full' />
    </section>
  )
}
