import { max, scaleBand, scaleLinear } from 'd3'
import { useMemo } from 'react'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import {
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
  MARGIN,
  MAX_LABEL_WIDTH_BIG,
  MAX_LABEL_WIDTH_SMALL,
  NORMAL_MARGIN_HEIGHT,
  Y_AXIS_LABEL_HEIGHT,
} from './constants'
import RoundedBarsWithLabels from './RoundedBarsWithLabels'
import { useRateChartTooltip } from './useRateChartTooltip'
import VerticalGridlines from './VerticalGridlines'
import XAxis from './XAxis'
import YAxis from './YAxis'

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
    useRateChartTooltip(
      containerRef,
      props.metricConfig,
      props.demographicType,
      isTinyAndUp,
    )

  const maxLabelWidth = hasSkinnyGroupLabels(props.demographicType)
    ? MAX_LABEL_WIDTH_SMALL
    : MAX_LABEL_WIDTH_BIG
  MARGIN.left = maxLabelWidth + NORMAL_MARGIN_HEIGHT
  if (isSmAndUp) MARGIN.left += Y_AXIS_LABEL_HEIGHT

  const processedData: HetRow[] =
    props.demographicType === 'income'
      ? sortForVegaByIncome(props.data)
      : props.data

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

  return (
    <div
      ref={containerRef}
      onTouchStart={handleContainerTouch}
      className='relative'
    >
      <BarChartTooltip data={tooltipData} />
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: we use aria-label instead, so screen reader has accessible text but browser tooltips don't interfere with custom tooltip */}
      <svg
        width={width}
        height={height}
        aria-label={`Bar Chart Showing ${props?.filename || 'Data'}`}
      >
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          <VerticalGridlines
            width={width}
            height={innerHeight}
            xScale={xScale}
          />
          <RoundedBarsWithLabels
            {...props}
            processedData={processedData}
            metricConfig={props.metricConfig}
            demographicType={props.demographicType}
            xScale={xScale}
            yScale={yScale}
            getYPosition={getYPosition}
            isTinyAndUp={isTinyAndUp}
            handleTooltip={handleTooltip}
            closeTooltip={closeTooltip}
          />
          <YAxis
            yScale={yScale}
            demographicType={props.demographicType}
            isSmAndUp={isSmAndUp}
            processedData={processedData}
            maxLabelWidth={maxLabelWidth}
            getYPosition={getYPosition}
            fips={props.fips}
            innerHeight={innerHeight}
          />
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
