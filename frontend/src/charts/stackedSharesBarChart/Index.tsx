import { scaleBand, scaleLinear } from 'd3'
import { useMemo } from 'react'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import { sortForVegaByIncome } from '../../data/sorting/IncomeSorterStrategy'
import type { HetRow } from '../../data/utils/DatasetTypes'
import { het } from '../../styles/DesignTokens'
import { useResponsiveWidth } from '../../utils/hooks/useResponsiveWidth'
import { StackedSharesBarChartTooltip } from './StackedSharesBarChartTooltip'
import { useStackedSharesBarChartTooltip } from './useStackedSharesBarChartTooltip'

const MARGIN = { top: 20, right: 30, bottom: 40, left: 200 }
const BAR_HEIGHT = 22
const BAR_PADDING = 0.5
const PAIR_GAP = 3
const SET_GAP = 10
const COLORS = {
  population: het.barChartLight,
  distribution: het.barChartDark,
}
const BORDER_RADIUS = 4

interface StackedBarChartProps {
  data: HetRow[]
  lightMetric: MetricConfig
  darkMetric: MetricConfig
  demographicType: DemographicType
  metricDisplayName: string
  filename?: string
}

export function StackedBarChart(props: StackedBarChartProps) {
  const [containerRef, width] = useResponsiveWidth()
  const { tooltipData, handleTooltip, closeTooltip, handleContainerTouch } =
    useStackedSharesBarChartTooltip()

  const processedData = useMemo(() => {
    const data =
      props.demographicType === 'income'
        ? sortForVegaByIncome(props.data)
        : props.data

    return data.map((row) => ({
      demographic: row[props.demographicType],
      population: row[props.lightMetric.metricId],
      distribution: row[props.darkMetric.metricId],
    }))
  }, [
    props.data,
    props.demographicType,
    props.lightMetric.metricId,
    props.darkMetric.metricId,
  ])

  const innerWidth = width - MARGIN.left - MARGIN.right
  const innerHeight =
    processedData.length * (BAR_HEIGHT * 2 + PAIR_GAP + SET_GAP)
  const height = innerHeight + MARGIN.top + MARGIN.bottom

  const xScale = useMemo(() => {
    const maxValue = Math.max(
      ...processedData.flatMap((d) => [d.population || 0, d.distribution || 0]),
    )
    return scaleLinear().domain([0, maxValue]).range([0, innerWidth])
  }, [processedData, innerWidth])

  const yScale = useMemo(() => {
    return scaleBand()
      .domain(processedData.map((d) => d.demographic))
      .range([0, innerHeight])
      .padding(BAR_PADDING)
  }, [processedData, innerHeight])

  return (
    <div
      ref={containerRef}
      onTouchStart={handleContainerTouch}
      className='relative'
    >
      <StackedSharesBarChartTooltip data={tooltipData} />
      <svg
        width={width}
        height={height}
        aria-label={`Stacked Bar Chart Showing ${props.filename || 'Data'}`}
      >
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {xScale.ticks(20).map((tick) => (
            <line
              key={tick}
              x1={xScale(tick)}
              x2={xScale(tick)}
              y1={0}
              y2={innerHeight}
              stroke={het.greyGridColorDarker}
            />
          ))}

          {processedData.map((d) => {
            const y = yScale(d.demographic) || 0

            return (
              <g key={d.demographic}>
                <path
                  d={`
                    M 0,${y}
                    L ${xScale(d.population || 0) - BORDER_RADIUS},${y}
                    Q ${xScale(d.population || 0)},${y} ${xScale(d.population || 0)},${y + BORDER_RADIUS}
                    L ${xScale(d.population || 0)},${y + BAR_HEIGHT - BORDER_RADIUS}
                    Q ${xScale(d.population || 0)},${y + BAR_HEIGHT} ${xScale(d.population || 0) - BORDER_RADIUS},${y + BAR_HEIGHT}
                    L 0,${y + BAR_HEIGHT}
                    Z
                  `}
                  fill={COLORS.population}
                  onMouseEnter={(e) =>
                    handleTooltip({
                      type: 'population',
                      value: d.population,
                      demographic: d.demographic,
                      event: e,
                    })
                  }
                  onMouseLeave={closeTooltip}
                />

                <path
                  d={`
                    M 0,${y + BAR_HEIGHT + PAIR_GAP}
                    L ${xScale(d.distribution || 0) - BORDER_RADIUS},${y + BAR_HEIGHT + PAIR_GAP}
                    Q ${xScale(d.distribution || 0)},${y + BAR_HEIGHT + PAIR_GAP} ${xScale(d.distribution || 0)},${y + BAR_HEIGHT + PAIR_GAP + BORDER_RADIUS}
                    L ${xScale(d.distribution || 0)},${y + BAR_HEIGHT * 2 + PAIR_GAP - BORDER_RADIUS}
                    Q ${xScale(d.distribution || 0)},${y + BAR_HEIGHT * 2 + PAIR_GAP} ${xScale(d.distribution || 0) - BORDER_RADIUS},${y + BAR_HEIGHT * 2 + PAIR_GAP}
                    L 0,${y + BAR_HEIGHT * 2 + PAIR_GAP}
                    Z
                  `}
                  fill={COLORS.distribution}
                  onMouseEnter={(e) =>
                    handleTooltip({
                      type: 'distribution',
                      value: d.distribution,
                      demographic: d.demographic,
                      event: e,
                    })
                  }
                  onMouseLeave={closeTooltip}
                />

                <text
                  x={-10}
                  y={y + BAR_HEIGHT + PAIR_GAP / 2}
                  textAnchor='end'
                  dominantBaseline='middle'
                  fontSize={12}
                >
                  {d.demographic}
                </text>

                <text
                  x={Math.max(xScale(d.population || 0) + 5, 5)}
                  y={y + BAR_HEIGHT / 2}
                  dominantBaseline='middle'
                  fontSize={12}
                >
                  {`${d.population?.toFixed(1)}%`}
                </text>
                <text
                  x={Math.max(xScale(d.distribution || 0) + 5, 5)}
                  y={y + BAR_HEIGHT * 1.5 + PAIR_GAP}
                  dominantBaseline='middle'
                  fontSize={12}
                >
                  {`${d.distribution?.toFixed(1)}%`}
                </text>
              </g>
            )
          })}

          <g transform={`translate(0,${innerHeight})`}>
            {xScale.ticks(10).map((tick) => (
              <text
                key={tick}
                x={xScale(tick)}
                y={20}
                textAnchor='middle'
                fontSize={12}
              >
                {tick}%
              </text>
            ))}
          </g>

          <g transform={`translate(${innerWidth - 150},-10)`}>
            <rect width={12} height={12} fill={COLORS.population} />
            <text x={16} y={10} fontSize={12}>
              % of population
            </text>
            <rect x={100} width={12} height={12} fill={COLORS.distribution} />
            <text x={116} y={10} fontSize={12}>
              % of {props.metricDisplayName}
            </text>
          </g>
        </g>
      </svg>
    </div>
  )
}
