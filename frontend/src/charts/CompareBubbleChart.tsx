import type React from 'react'
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { regressionLinear } from 'd3-regression'
import type { HetRow } from '../data/utils/DatasetTypes'
import type { MetricConfig } from '../data/config/MetricConfigTypes'
import { het } from '../styles/DesignTokens'

interface CompareBubbleChartProps {
  xData: HetRow[]
  xMetricConfig: MetricConfig
  yData: HetRow[]
  yMetricConfig: MetricConfig
  radiusData: HetRow[]
  width?: number
  height?: number
}

const CompareBubbleChart: React.FC<CompareBubbleChartProps> = (props) => {
  const xRate = props.xMetricConfig.metricId
  const yRate = props.yMetricConfig.metricId

  const { width = 1400, height = 800 } = props

  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (
      !props.xData ||
      !props.yData ||
      !props.radiusData ||
      props.xData.length !== props.yData.length ||
      props.xData.length !== props.radiusData.length
    ) {
      console.error('Invalid or mismatched data')
      return
    }

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 40, right: 40, bottom: 60, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const xScale = d3
      .scaleLinear<number>()
      .domain([0, d3.max(props.xData, (d) => d[xRate]) || 0])
      .range([0, innerWidth])

    const yScale = d3
      .scaleLinear<number>()
      .domain([0, d3.max(props.yData, (d) => d[yRate]) || 0])
      .range([innerHeight, 0])

    const radiusScale = d3
      .scaleSqrt<number>()
      .domain([0, d3.max(props.radiusData, (d) => d[xRate]) || 0])
      .range([2, 20])

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 40)
      .attr('fill', 'black')
      .text(props.xMetricConfig.shortLabel)

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
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
      .attr('cx', (d) => xScale(d[xRate]))
      .attr('cy', (d) => {
        const yDataPoint = props.yData.find(
          (y) =>
            y.fips === d.fips && y.race_and_ethnicity === d.race_and_ethnicity,
        )
        return yScale(yDataPoint ? yDataPoint[yRate] : 0)
      })
      .attr('r', (d) => {
        const radiusDataPoint = props.radiusData.find(
          (r) =>
            r.fips === d.fips && r.race_and_ethnicity === d.race_and_ethnicity,
        )
        return radiusScale(radiusDataPoint ? radiusDataPoint[xRate] : 0)
      })
      .attr('fill', het.barChartLight)
      .attr('opacity', 0.7)
      .append('title')
      .text((d) => {
        const yDataPoint = props.yData.find(
          (y) =>
            y.fips === d.fips && y.race_and_ethnicity === d.race_and_ethnicity,
        )
        const radiusDataPoint = props.radiusData.find(
          (r) =>
            r.fips === d.fips && r.race_and_ethnicity === d.race_and_ethnicity,
        )
        return `FIPS: ${d.fips}, Race: ${d.race_and_ethnicity}, X: ${
          d[xRate]
        }, Y: ${yDataPoint ? yDataPoint[yRate] : 'N/A'}, Radius: ${
          radiusDataPoint ? radiusDataPoint[xRate] : 'N/A'
        }`
      })

    // Prepare data for regression (only non-null points)
    const validData = props.xData
      .map((d) => {
        const yDataPoint = props.yData.find(
          (y) =>
            y.fips === d.fips && y.race_and_ethnicity === d.race_and_ethnicity,
        )
        return {
          x: d[xRate],
          y: yDataPoint ? yDataPoint[yRate] : null,
        }
      })
      .filter((d) => d.x !== null && d.y !== null)

    // Calculate the linear regression
    const linearRegression = regressionLinear()
      .x((d: HetRow) => d.x)
      .y((d: HetRow) => d.y)

    const trendlineData = linearRegression(validData)

    // Add trend line
    g.append('path')
      .datum(trendlineData)
      .attr('fill', 'none')
      .attr('stroke', het.altGreen)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr(
        'd',
        d3
          .line()
          .x((d) => xScale(d[0]))
          .y((d) => yScale(d[1])),
      )
  }, [props.xData, props.yData, props.radiusData, width, height])

  return (
    <svg ref={svgRef} width={width} height={height}>
      <title>Bubble chart with Trend Line</title>
    </svg>
  )
}

export default CompareBubbleChart
