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

const CompareBubbleChart: React.FC<CompareBubbleChartProps> = (props) => {
  const isMd = useIsBreakpointAndUp('md')
  const xRate = props.xMetricConfig.metricId
  const yRate = props.yMetricConfig.metricId

  const [resizeCardRef, width] = useResponsiveWidth()
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltipContent, setTooltipContent] = useState<string | null>(null)

  const height = isMd
    ? width * HEIGHT_WIDTH_RATIO
    : Math.min(
        width / HEIGHT_WIDTH_RATIO,
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
      .range([4, 40])

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
      .attr('fill', 'black')
      .text(props.xMetricConfig.shortLabel)

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat((d) => formatTickK(d as number)))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -innerHeight / 2)
      .attr('fill', 'black')
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
          ] || 'black'
        )
      })
      .attr('opacity', 0.7)
      .on('mouseover', function (event, d) {
        const yDataPoint = props.yData.find(
          (y) =>
            y.fips === d.fips && y.race_and_ethnicity === d.race_and_ethnicity,
        )
        const radiusDataPoint = props.radiusData.find(
          (r) =>
            r.fips === d.fips && r.race_and_ethnicity === d.race_and_ethnicity,
        )
        const content = `${d.fips_name}, ${d.race_and_ethnicity}<br>${props.xMetricConfig.shortLabel}: ${d[xRate]}<br>${props.yMetricConfig.shortLabel}: ${yDataPoint ? yDataPoint[yRate] : 'N/A'}<br>Population: ${radiusDataPoint ? radiusDataPoint[props.radiusMetricConfig?.metricId || ''] : 'N/A'}`
        setTooltipContent(content)
        d3.select(this).attr('fill', het.timeYellow).attr('opacity', 1)
        if (this.parentNode) {
          // make hovered bubble rise to the top
          this.parentNode.appendChild(this)
        }
      })
      .on('mouseout', function (event, d) {
        setTooltipContent(null)
        d3.select(this).attr('fill', (d: any) => {
          return (
            GROUP_COLOR_MAP[
              d.race_and_ethnicity.replace(
                ' (NH)',
                '',
              ) as keyof typeof GROUP_COLOR_MAP
            ] || 'black'
          )
        })
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

  return (
    <div ref={resizeCardRef}>
      <svg ref={svgRef} width={width} height={height}>
        <title>Bubble chart with Weighted Trend Line</title>
      </svg>
      {tooltipContent && (
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            top: 200,
            right: 200,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '10px',
            borderRadius: '5px',
            pointerEvents: 'none',
            opacity: 0.9,
            maxWidth: '400px',
            zIndex: 1000,
          }}
          dangerouslySetInnerHTML={{ __html: tooltipContent }}
        />
      )}
    </div>
  )
}

export default CompareBubbleChart
