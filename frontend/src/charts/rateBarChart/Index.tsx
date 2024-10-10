import { max, scaleBand, scaleLinear } from 'd3'
import { useMemo } from 'react'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  hasSkinnyGroupLabels,
  type DemographicType,
} from '../../data/query/Breakdowns'
import { sortForVegaByIncome } from '../../data/sorting/IncomeSorterStrategy'
import type { HetRow } from '../../data/utils/DatasetTypes'
import type { Fips } from '../../data/utils/Fips'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { useResponsiveWidth } from '../../utils/hooks/useResponsiveWidth'
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
import EndOfBarLabel from './EndOfBarLabel'
import GroupLabelsYAxis from './GroupLabelsYAxis'
import { buildRoundedBarString, wrapLabel } from './helpers'
import { useRateChartTooltip } from './useRateChartTooltip'
import VerticalGridlines from './VerticalGridlines'
import XAxis from './XAxis'

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
  const isTinyAndUp = useIsBreakpointAndUp('tiny')
  const isSmAndUp = useIsBreakpointAndUp('sm')

  const [containerRef, width] = useResponsiveWidth()

  const { tooltipData, handleTooltip, closeTooltip, handleContainerTouch } =
    useRateChartTooltip(containerRef, props.metricConfig, props.demographicType)

  const maxLabelWidth = hasSkinnyGroupLabels(props.demographicType)
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
          <VerticalGridlines
            width={width}
            height={innerHeight}
            xScale={xScale}
          />
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

          <GroupLabelsYAxis
            {...props}
            wrappedLabels={wrappedLabels}
            yScale={yScale}
            getYPosition={getYPosition}
          />
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
                {isTinyAndUp && (
                  <EndOfBarLabel
                    {...props}
                    d={d}
                    shouldLabelBeInside={shouldLabelBeInside}
                    barWidth={barWidth}
                    yScale={yScale}
                    barLabelColor={barLabelColor}
                  />
                )}
              </g>
            )
          })}
          <XAxis
            metricConfig={props.metricConfig}
            xScale={xScale}
            width={innerWidth}
            height={innerHeight}
          />
        </g>
      </svg>
    </div>
  )
}
