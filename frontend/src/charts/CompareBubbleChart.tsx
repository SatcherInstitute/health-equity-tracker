import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { het } from '../styles/DesignTokens'
import { useResponsiveWidth } from '../utils/hooks/useResponsiveWidth'
import { useIsBreakpointAndUp } from '../utils/hooks/useIsBreakpointAndUp'
import { GROUP_COLOR_MAP } from './trendsChart/constants'
import type { MetricConfig } from '../data/config/MetricConfigTypes'
import type { HetRow } from '../data/utils/DatasetTypes'
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

  return [
    [
      d3.min(data, (d) => d.x) || 0,
      slope * (d3.min(data, (d) => d.x) || 0) + intercept,
    ],
    [
      d3.max(data, (d) => d.x) || 0,
      slope * (d3.max(data, (d) => d.x) || 0) + intercept,
    ],
  ]
}

interface TooltipProps {
  content: {
    fipsName: string
    raceAndEthnicity: string
    xLabel: string
    xValue: number
    yLabel: string
    yValue: number
    population: number
  } | null
  position: { x: number; y: number }
}

const Tooltip: React.FC<TooltipProps> = ({ content, position }) => {
  if (!content) return null

  return (
    <div
      className={`absolute border border-altGrey bg-white p-3 rounded-sm  max-w-sm z-top text-left`}
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <p className='m-0'>
        <strong>
          {content.fipsName}, {content.raceAndEthnicity}
        </strong>
      </p>
      <p className='m-0'>
        {content.xLabel}: {content.xValue}
      </p>
      <p className='m-0'>
        {content.yLabel}: {content.yValue}
      </p>
      <p className='m-0'>Population: {content.population}</p>
    </div>
  )
}

const CompareBubbleChart: React.FC<CompareBubbleChartProps> = (props) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const isMd = useIsBreakpointAndUp('md')
  const xRate = props.xMetricConfig.metricId
  const yRate = props.yMetricConfig.metricId

  const [resizeCardRef, width] = useResponsiveWidth()
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltipContent, setTooltipContent] =
    useState<TooltipProps['content']>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const height = Math.min(
    isMd ? width * HEIGHT_WIDTH_RATIO : width / HEIGHT_WIDTH_RATIO,
    window.innerHeight * HEIGHT_WIDTH_RATIO,
  )

  useEffect(() => {
    if (!props.xData || !props.yData || !props.radiusData) {
      console.error('Invalid or mismatched data')
      return
    }

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 40, right: 80, bottom: 40, left: 80 }

    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(props.xData, (d) => d[xRate] as number) || 0])
      .range([0, innerWidth])

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(props.yData, (d) => d[yRate] as number) || 0])
      .range([innerHeight, 0])

    const radiusScale = d3
      .scaleSqrt()
      .domain([
        0,
        d3.max(
          props.radiusData,
          (d) => d[props.radiusMetricConfig?.metricId || ''] as number,
        ) || 4,
      ])
      .range([4, Math.sqrt(window.innerWidth) / 1.5]) //

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const formatTickK = d3.format('.2~s')

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(isMd ? X_AXIS_MAX_TICKS : X_AXIS_MAX_TICKS_SKINNY)
          .tickFormat((d) => formatTickK(d as number)),
      )
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 40)
      .attr('fill', het.altBlack)
      .text(props.xMetricConfig.shortLabel)

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat((d) => formatTickK(d as number)))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -innerHeight / 2)
      .attr('fill', het.altBlack)
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
            d.race_and_ethnicity.replace(
              ' (NH)',
              '',
            ) as keyof typeof GROUP_COLOR_MAP
          ] || het.altBlack
        )
      })
      .attr('opacity', 0.7)

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
        updateTooltipPosition(event)
        d3.select(this).attr('fill', het.timeYellow).attr('opacity', 1)
        if (this.parentNode) {
          this.parentNode.appendChild(this)
        }
      })
      .on('mousemove', updateTooltipPosition)
      .on('mouseout', function () {
        setTooltipContent(null)
        d3.select(this)
          .attr('fill', (d: any) => {
            return (
              GROUP_COLOR_MAP[
                d.race_and_ethnicity.replace(
                  ' (NH)',
                  '',
                ) as keyof typeof GROUP_COLOR_MAP
              ] || het.altBlack
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
      .attr('stroke', het.altDark)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr(
        'd',
        d3
          .line<[number, number]>()
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

  const updateTooltipPosition = (event: MouseEvent) => {
    if (chartRef.current) {
      const chartRect = chartRef.current.getBoundingClientRect()
      const xPosition = event.clientX - chartRect.left
      const yPosition = event.clientY - chartRect.top
      setTooltipPosition({ x: xPosition, y: yPosition })
    }
  }

  return (
    <div ref={chartRef} style={{ position: 'relative' }}>
      <div ref={resizeCardRef} style={{ position: 'relative' }}>
        <svg ref={svgRef} width={width} height={height}>
          <title>Bubble chart with Weighted Trend Line</title>
        </svg>
        <Tooltip content={tooltipContent} position={tooltipPosition} />
      </div>
    </div>
  )
}

export default CompareBubbleChart
