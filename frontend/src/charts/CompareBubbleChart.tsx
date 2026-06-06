import type { Selection } from 'd3'
import {
  axisBottom,
  axisLeft,
  format,
  line,
  max,
  min,
  scaleLinear,
  scaleSqrt,
  select,
} from 'd3'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import type { MetricConfig } from '../data/config/MetricConfigTypes'
import type { HetRow } from '../data/utils/DatasetTypes'
import { colors } from '../styles/tokens/colors'
import { useIsBreakpointAndUp } from '../utils/hooks/useIsBreakpointAndUp'
import { useResponsiveWidth } from '../utils/hooks/useResponsiveWidth'
import { HetChartHoverTooltip } from './HetChartHoverTooltip'
import { GROUP_COLOR_MAP } from './trendsChart/constants'
import {
  HEIGHT_WIDTH_RATIO,
  X_AXIS_MAX_TICKS,
  X_AXIS_MAX_TICKS_SKINNY,
} from './utils'

interface CompareBubbleChartProps {
  xData: HetRow[]
  xMetricConfig: MetricConfig
  yData: HetRow[]
  yMetricConfig: MetricConfig
  radiusData: HetRow[]
  radiusMetricConfig?: MetricConfig
  width?: number
  height?: number
}

interface WeightedDataPoint {
  x: number
  y: number
  weight: number
}

function weightedRegression(data: WeightedDataPoint[]): [number, number][] {
  if (data.length === 0) return []

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0
  let sumW = 0

  for (const point of data) {
    sumX += point.x * point.weight
    sumY += point.y * point.weight
    sumXY += point.x * point.y * point.weight
    sumX2 += point.x * point.x * point.weight
    sumW += point.weight
  }

  const meanX = sumX / sumW
  const meanY = sumY / sumW

  const slope = (sumXY - sumX * meanY) / (sumX2 - sumX * meanX)
  const intercept = meanY - slope * meanX

  const minX = min(data, (d) => d.x) ?? 0
  const maxX = max(data, (d) => d.x) ?? 0

  return [
    [minX, slope * minX + intercept],
    [maxX, slope * maxX + intercept],
  ]
}

interface BubbleTooltipContent {
  fipsName: string
  raceAndEthnicity: string
  xLabel: string
  xValue: number
  yLabel: string
  yValue: number
  population: number
}

function BubbleTooltip({ content }: { content: BubbleTooltipContent }) {
  return (
    <>
      <div className='font-semibold'>
        {content.fipsName}, {content.raceAndEthnicity}
      </div>
      <div className='font-normal'>
        {content.xLabel}: {content.xValue}
      </div>
      <div className='font-normal'>
        {content.yLabel}: {content.yValue}
      </div>
      <div className='font-normal'>
        Population: {content.population.toLocaleString()}
      </div>
    </>
  )
}

const CompareBubbleChart: React.FC<CompareBubbleChartProps> = (props) => {
  const isMd = useIsBreakpointAndUp('md')
  const xRate = props.xMetricConfig.metricId
  const yRate = props.yMetricConfig.metricId

  const [resizeCardRef, width] = useResponsiveWidth()
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltipContent, setTooltipContent] =
    useState<BubbleTooltipContent | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number
    y: number
  } | null>(null)

  const height = Math.min(
    isMd ? width * HEIGHT_WIDTH_RATIO : width / HEIGHT_WIDTH_RATIO,
    window.innerHeight * HEIGHT_WIDTH_RATIO,
  )

  useEffect(() => {
    if (!props.xData || !props.yData || !props.radiusData) {
      console.error('Invalid or mismatched data')
      return
    }

    const svg = select(svgRef.current) as Selection<
      SVGSVGElement,
      unknown,
      null,
      undefined
    >
    svg.selectAll('*').remove()

    const margin = { top: 40, right: 80, bottom: 40, left: 80 }

    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const xScale = scaleLinear()
      .domain([0, max(props.xData, (d) => d[xRate] as number) || 0])
      .range([0, innerWidth])

    const yScale = scaleLinear()
      .domain([0, max(props.yData, (d) => d[yRate] as number) || 0])
      .range([innerHeight, 0])

    const radiusScale = scaleSqrt()
      .domain([
        0,
        max(
          props.radiusData,
          (d) => d[props.radiusMetricConfig?.metricId || ''] as number,
        ) || 4,
      ])
      .range([4, Math.sqrt(window.innerWidth) / 1.5]) //

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const formatTickK = format('.2~s')

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        axisBottom(xScale)
          .ticks(isMd ? X_AXIS_MAX_TICKS : X_AXIS_MAX_TICKS_SKINNY)
          .tickFormat((d) => formatTickK(d as number)),
      )
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 40)
      .attr('fill', colors.altBlack)
      .text(props.xMetricConfig.shortLabel)

    // Add Y axis
    g.append('g')
      .call(axisLeft(yScale).tickFormat((d) => formatTickK(d as number)))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -innerHeight / 2)
      .attr('fill', colors.altBlack)
      .attr('text-anchor', 'middle')
      .text(props.yMetricConfig.shortLabel)

    // Add bubbles
    g.selectAll('circle')
      .data(props.xData)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d[xRate] as number))
      .attr('cy', (d) => {
        const yDataPoint = props.yData.find(
          (y) =>
            y.fips === d.fips && y.race_and_ethnicity === d.race_and_ethnicity,
        )
        return yScale(yDataPoint ? (yDataPoint[yRate] as number) : 0)
      })
      .attr('r', (d) => {
        const radiusDataPoint = props.radiusData.find(
          (r) =>
            r.fips === d.fips && r.race_and_ethnicity === d.race_and_ethnicity,
        )
        return radiusScale(
          radiusDataPoint
            ? (radiusDataPoint[
                props.radiusMetricConfig?.metricId || ''
              ] as number)
            : 0,
        )
      })
      .attr('fill', (d) => {
        return (
          GROUP_COLOR_MAP[
            d.race_and_ethnicity?.replace(
              ' (NH)',
              '',
            ) as keyof typeof GROUP_COLOR_MAP
          ] || colors.altBlack
        )
      })
      .attr('opacity', 0.7)
      .attr('role', 'img')
      .attr('tabindex', '-1')
      .attr('aria-label', (d: HetRow) => {
        const yDataPoint = props.yData.find(
          (y) =>
            y.fips === d.fips && y.race_and_ethnicity === d.race_and_ethnicity,
        )
        const radiusDataPoint = props.radiusData.find(
          (r) =>
            r.fips === d.fips && r.race_and_ethnicity === d.race_and_ethnicity,
        )
        const yVal = (yDataPoint?.[yRate] as number) ?? 0
        const pop =
          (radiusDataPoint?.[
            props.radiusMetricConfig?.metricId || ''
          ] as number) ?? 0
        return `${d.fips_name}, ${d.race_and_ethnicity}: ${props.xMetricConfig.shortLabel} ${d[xRate] ?? 0}, ${props.yMetricConfig.shortLabel} ${yVal}, population ${pop.toLocaleString()}`
      })

      .on('mouseover', function (event: MouseEvent, d: HetRow) {
        const yDataPoint = props.yData.find(
          (y) =>
            y.fips === d.fips && y.race_and_ethnicity === d.race_and_ethnicity,
        )
        const radiusDataPoint = props.radiusData.find(
          (r) =>
            r.fips === d.fips && r.race_and_ethnicity === d.race_and_ethnicity,
        )
        setTooltipContent({
          fipsName: d.fips_name,
          raceAndEthnicity: d.race_and_ethnicity,
          xLabel: props.xMetricConfig.shortLabel,
          xValue: d[xRate] as number,
          yLabel: props.yMetricConfig.shortLabel,
          yValue: yDataPoint ? (yDataPoint[yRate] as number) : 0,
          population: radiusDataPoint
            ? (radiusDataPoint[
                props.radiusMetricConfig?.metricId || ''
              ] as number)
            : 0,
        })
        setTooltipPosition({ x: event.clientX, y: event.clientY })
        select(this).attr('fill', colors.timeYellow).attr('opacity', 1)
        if (this.parentNode) {
          this.parentNode.appendChild(this)
        }
      })
      .on('mouseout', function () {
        setTooltipContent(null)
        setTooltipPosition(null)
        select(this)
          .attr('fill', (d: any) => {
            return (
              GROUP_COLOR_MAP[
                d.race_and_ethnicity?.replace(
                  ' (NH)',
                  '',
                ) as keyof typeof GROUP_COLOR_MAP
              ] || colors.altBlack
            )
          })
          .attr('opacity', 0.7)
      })

    // Prepare data for weighted regression
    const weightedData: WeightedDataPoint[] = props.xData
      .map((d) => {
        const yDataPoint = props.yData.find(
          (y) =>
            y.fips === d.fips && y.race_and_ethnicity === d.race_and_ethnicity,
        )
        const radiusDataPoint = props.radiusData.find(
          (r) =>
            r.fips === d.fips && r.race_and_ethnicity === d.race_and_ethnicity,
        )
        return {
          x: d[xRate] as number,
          y: yDataPoint ? (yDataPoint[yRate] as number) : 0,
          weight: radiusDataPoint
            ? (radiusDataPoint[
                props.radiusMetricConfig?.metricId || ''
              ] as number)
            : 0,
        }
      })
      .filter(
        (d): d is WeightedDataPoint =>
          d.x !== null && d.y !== null && d.weight !== null,
      )

    // Calculate the weighted regression
    const weightedTrendlineData = weightedRegression(weightedData)

    // Add weighted trend line
    g.append('path')
      .datum(weightedTrendlineData)
      .attr('fill', 'none')
      .attr('stroke', colors.altDark)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr(
        'd',
        line<[number, number]>()
          .x((d) => xScale(d[0]))
          .y((d) => yScale(d[1])),
      )
  }, [
    props.xData,
    props.yData,
    props.radiusData,
    width,
    height,
    xRate,
    yRate,
    props.xMetricConfig.shortLabel,
    props.yMetricConfig.shortLabel,
    props.radiusMetricConfig?.metricId,
  ])

  return (
    <div ref={resizeCardRef} style={{ position: 'relative' }}>
      <svg ref={svgRef} width={width} height={height}>
        <title>Bubble chart with Weighted Trend Line</title>
      </svg>
      <HetChartHoverTooltip
        x={tooltipContent && tooltipPosition ? tooltipPosition.x : null}
        y={tooltipContent && tooltipPosition ? tooltipPosition.y : null}
      >
        {tooltipContent && <BubbleTooltip content={tooltipContent} />}
      </HetChartHoverTooltip>
    </div>
  )
}

export default CompareBubbleChart
