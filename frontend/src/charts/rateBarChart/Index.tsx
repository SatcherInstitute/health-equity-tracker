import { max, scaleBand, scaleLinear } from 'd3'
import { useCallback, useMemo, useState } from 'react'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../../data/query/Breakdowns'
import { sortForVegaByIncome } from '../../data/sorting/IncomeSorterStrategy'
import type { HetRow } from '../../data/utils/DatasetTypes'
import type { Fips } from '../../data/utils/Fips'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { useResponsiveWidth } from '../../utils/hooks/useResponsiveWidth'
import type { BarChartTooltipData } from './BarChartTooltip'
import BarChartTooltip from './BarChartTooltip'
import {
  BAR_HEIGHT,
  BAR_PADDING,
  EXTRA_SPACE_AFTER_ALL,
  LABEL_SWAP_CUTOFF_PERCENT,
  MARGIN,
  MAX_LABEL_WIDTH_BIG,
  MAX_LABEL_WIDTH_SMALL,
  NORMAL_MARGIN_HEIGHT,
  Y_AXIS_LABEL_HEIGHT,
} from './constants'
import {
  buildRoundedBarString,
  formatValue,
  getComparisonAllSubGroupLines,
  getNumTicks,
  wrapLabel,
} from './helpers'

interface RateBarChartProps {
  data: HetRow[]
  metricConfig: MetricConfig
  demographicType: DemographicType
  fips: Fips
  filename?: string
  usePercentSuffix?: boolean
  className?: string
  useIntersectionalComparisonAlls?: boolean
  comparisonAllSubGroup?: string
}

export function RateBarChart(props: RateBarChartProps) {
  const smallerDemographicLabelTypes: DemographicType[] = [
    'sex',
    'age',
    'insurance_status',
  ]

  const isSmAndUp = useIsBreakpointAndUp('sm')
  const [tooltipData, setTooltipData] = useState<BarChartTooltipData | null>(
    null,
  )
  const [containerRef, width] = useResponsiveWidth()
  const numTicks = getNumTicks(width)

  const maxLabelWidth = smallerDemographicLabelTypes.includes(
    props.demographicType,
  )
    ? MAX_LABEL_WIDTH_SMALL
    : MAX_LABEL_WIDTH_BIG
  MARGIN.left = maxLabelWidth + NORMAL_MARGIN_HEIGHT
  if (isSmAndUp) MARGIN.left += Y_AXIS_LABEL_HEIGHT

  const processedData: HetRow[] =
    props.demographicType === 'income'
      ? sortForVegaByIncome(props.data)
      : props.data

  const wrappedLabels = useMemo(() => {
    return processedData.map((d) => ({
      original: d[props.demographicType],
      lines: wrapLabel(d[props.demographicType], maxLabelWidth),
    }))
  }, [processedData, props.demographicType])

  const allIndex = processedData.findIndex(
    (d) => d[props.demographicType] === 'All',
  )
  const totalExtraSpace = allIndex !== -1 ? EXTRA_SPACE_AFTER_ALL : 0
  const height = processedData.length * (BAR_HEIGHT + 10) + totalExtraSpace
  const innerWidth = width - MARGIN.left - MARGIN.right
  const innerHeight = height - MARGIN.top - MARGIN.bottom

  // Scales
  const xScale = useMemo(() => {
    const maxValue =
      max(processedData, (d) => d[props.metricConfig.metricId]) || 0
    return scaleLinear().domain([0, maxValue]).range([0, innerWidth])
  }, [processedData, innerWidth, props.metricConfig.metricId])

  const yScale = useMemo(() => {
    return scaleBand()
      .domain(processedData.map((d) => d[props.demographicType]))
      .range([0, innerHeight - totalExtraSpace]) // Adjust range to account for extra space
      .padding(BAR_PADDING)
  }, [processedData, innerHeight, totalExtraSpace])

  const getYPosition = (index: number, demographicValue: string) => {
    let position = yScale(demographicValue) || 0
    if (allIndex !== -1 && index > allIndex) {
      position += EXTRA_SPACE_AFTER_ALL
    }
    return position
  }

  const barLabelBreakpoint = useMemo(() => {
    const maxValue =
      max(processedData, (d) => d[props.metricConfig.metricId]) || 0
    return maxValue * (LABEL_SWAP_CUTOFF_PERCENT / 100)
  }, [processedData, props.metricConfig.metricId])

  const handleTooltip = useCallback(
    (
      event: React.MouseEvent | React.TouchEvent,
      d: HetRow,
      isTouchEvent: boolean,
    ) => {
      const svgRect = containerRef.current?.getBoundingClientRect()
      if (!svgRect) return

      let clientX: number
      let clientY: number

      if (isTouchEvent) {
        const touchEvent = event as React.TouchEvent
        const touch = touchEvent.touches[0]
        clientX = touch.clientX
        clientY = touch.clientY
      } else {
        const mouseEvent = event as React.MouseEvent
        clientX = mouseEvent.clientX
        clientY = mouseEvent.clientY
      }

      const tooltipContent = `${d[props.demographicType]}: ${formatValue(d[props.metricConfig.metricId], props.metricConfig)}`

      setTooltipData({
        x: clientX - svgRect.left,
        y: clientY - svgRect.top,
        content: tooltipContent,
      })
    },
    [props.demographicType, props.metricConfig],
  )

  const closeTooltip = useCallback(() => {
    setTooltipData(null)
  }, [])

  // Add touch event handler to the container to close tooltip when tapping elsewhere
  const handleContainerTouch = useCallback(
    (event: React.TouchEvent) => {
      const target = event.target as SVGElement
      if (target.tagName !== 'path') {
        closeTooltip()
      }
    },
    [closeTooltip],
  )

  return (
    <div
      ref={containerRef}
      onTouchStart={handleContainerTouch}
      className='relative'
    >
      <BarChartTooltip data={tooltipData} />
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
      <svg width={width} height={height}>
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {/* Vertical Gridlines */}
          <g className='gridlines'>
            {xScale.ticks(numTicks).map((tick, index) => (
              <line
                key={`gridline-${index}`}
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={0}
                y2={innerHeight}
                className='stroke-timberwolf'
              />
            ))}
          </g>
          {/* Y-axis DemographicType label */}
          {isSmAndUp && (
            <text
              transform={`translate(${-MARGIN.left + Y_AXIS_LABEL_HEIGHT},${innerHeight / 2}) rotate(-90)`}
              textAnchor='middle'
              className='text-smallest font-semibold p-0 m-0'
            >
              {DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]}
            </text>
          )}
          {/* Y Axis */}
          <g className='y-axis'>
            {wrappedLabels.map((label, index) => {
              if (
                label.original === 'All' &&
                props.useIntersectionalComparisonAlls
              ) {
                label.lines = getComparisonAllSubGroupLines(
                  props.fips,
                  props.comparisonAllSubGroup,
                )
              }
              const yPosition = getYPosition(index, label.original)
              return (
                <g key={label.original} transform={`translate(0,${yPosition})`}>
                  {label.lines.map((line, lineIndex) => (
                    <text
                      key={lineIndex}
                      x={-5}
                      y={
                        yScale.bandwidth() / 2 -
                        (label.lines.length - 1) * 8 +
                        lineIndex * 12
                      }
                      dy='.32em'
                      textAnchor='end'
                      className='text-smallest'
                    >
                      {line}
                    </text>
                  ))}
                </g>
              )
            })}
          </g>

          {/* Bars */}
          {processedData.map((d, index) => {
            const barWidth = xScale(d[props.metricConfig.metricId]) || 0
            const shouldLabelBeInside =
              d[props.metricConfig.metricId] > barLabelBreakpoint
            const yPosition = getYPosition(index, d[props.demographicType])

            const barLabelColor =
              shouldLabelBeInside && d[props.demographicType] !== 'All'
                ? 'fill-white'
                : 'fill-current'

            const roundedBarString = buildRoundedBarString(barWidth, yScale)

            if (!roundedBarString) return <></>

            return (
              <g
                key={index}
                transform={`translate(0,${yPosition})`}
                onMouseMove={(e) => handleTooltip(e, d, false)}
                onMouseLeave={closeTooltip}
                onTouchStart={(e) => {
                  handleTooltip(e, d, true)
                }}
              >
                <path
                  d={roundedBarString}
                  className={
                    d[props.demographicType] === 'All'
                      ? 'fill-timeYellow'
                      : 'fill-altGreen'
                  }
                />
                {/* Bar Values (right side) */}
                <text
                  x={shouldLabelBeInside ? barWidth - 5 : barWidth + 5}
                  y={yScale.bandwidth() / 2}
                  dy='1.3em'
                  textAnchor={shouldLabelBeInside ? 'end' : 'start'}
                  className={`text-smallest ${barLabelColor}`}
                >
                  {formatValue(
                    d[props.metricConfig.metricId],
                    props.metricConfig,
                  )}
                </text>
              </g>
            )
          })}

          {/* X-axis label */}
          <text
            transform={`translate(${innerWidth / 2},${innerHeight + 40})`}
            textAnchor='middle'
            className='text-smallest font-semibold'
          >
            {props.metricConfig.shortLabel}
          </text>
          {/* X Axis */}
          <g className='x-axis' transform={`translate(0,${innerHeight})`}>
            <line x1={0} x2={innerWidth} y1={0} y2={0} stroke='currentColor' />
            {xScale.ticks(5).map((tick, index) => (
              <g key={index} transform={`translate(${xScale(tick)},0)`}>
                <line y2={6} stroke='currentColor' />
                <text
                  y={9}
                  dy='.71em'
                  textAnchor='middle'
                  className='text-smallest fill-current'
                >
                  {tick}
                </text>
              </g>
            ))}
          </g>
        </g>
      </svg>
    </div>
  )
}
