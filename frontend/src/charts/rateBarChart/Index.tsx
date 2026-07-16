import { max, scaleBand, scaleLinear } from 'd3'
import { useId, useMemo } from 'react'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import {
  type DemographicType,
  hasSkinnyGroupLabels,
} from '../../data/query/Breakdowns'
import { sortByIncome } from '../../data/sorting/IncomeSorterStrategy'
import type { HetRow } from '../../data/utils/DatasetTypes'
import type { Fips } from '../../data/utils/Fips'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { useResponsiveWidth } from '../../utils/hooks/useResponsiveWidth'
import { HetChartHoverTooltip } from '../HetChartHoverTooltip'
import VerticalGridlines from '../sharedBarChartPieces/VerticalGridlines'
import XAxis from '../sharedBarChartPieces/XAxis'
import YAxis from '../sharedBarChartPieces/YAxis'
import { useChartTooltip } from '../useChartTooltip'
import { getRateBarA11ySummary } from './a11yUtils'
import type { BarChartTooltipData } from './BarChartTooltip'
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
  chartTitleId?: string
}

export function RateBarChart(props: RateBarChartProps) {
  const isTinyAndUp = useIsBreakpointAndUp('tiny')
  const isSmAndUp = useIsBreakpointAndUp('sm')

  const [containerRef, width] = useResponsiveWidth()

  const {
    tooltipData,
    tooltipPos,
    showTooltip,
    hideTooltip,
    hideTooltipDelayed,
  } = useChartTooltip<BarChartTooltipData>()

  const maxLabelWidth = hasSkinnyGroupLabels(props.demographicType)
    ? MAX_LABEL_WIDTH_SMALL
    : MAX_LABEL_WIDTH_BIG
  MARGIN.left = maxLabelWidth + NORMAL_MARGIN_HEIGHT
  if (isSmAndUp) MARGIN.left += Y_AXIS_LABEL_HEIGHT

  const processedData: HetRow[] =
    props.demographicType === 'income' ? sortByIncome(props.data) : props.data

  const allIndex = processedData.findIndex(
    (d) => d[props.demographicType] === 'All',
  )
  const totalExtraSpace = allIndex !== -1 ? EXTRA_SPACE_AFTER_ALL : 0
  // minimum height keeps innerHeight positive for single-row charts (e.g. ALLs fallback)
  const height = Math.max(
    processedData.length * (BAR_HEIGHT + 10) + totalExtraSpace,
    BAR_HEIGHT + MARGIN.top + MARGIN.bottom + totalExtraSpace,
  )
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

  const generatedSummaryId = useId()
  const a11ySummary = getRateBarA11ySummary(
    processedData,
    props.metricConfig,
    props.demographicType,
  )
  const a11ySummaryId = props.chartTitleId
    ? `${props.chartTitleId}-summary`
    : generatedSummaryId

  return (
    <div
      ref={containerRef}
      onTouchStart={(e) => {
        if (!(e.target as Element).closest('g[role="img"]')) hideTooltip()
      }}
      className='relative'
    >
      <HetChartHoverTooltip x={tooltipPos?.x ?? null} y={tooltipPos?.y ?? null}>
        {tooltipData && <BarChartTooltip {...tooltipData} />}
      </HetChartHoverTooltip>
      {a11ySummary && (
        <p id={a11ySummaryId} className='sr-only'>
          {a11ySummary}
        </p>
      )}
      <svg
        width={width}
        height={height}
        aria-labelledby={props.chartTitleId}
        aria-label={
          props.chartTitleId
            ? undefined
            : `Bar Chart Showing ${props?.filename || 'Data'}`
        }
        aria-describedby={a11ySummary ? a11ySummaryId : undefined}
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
            allIndex={allIndex}
            showTooltip={showTooltip}
            hideTooltipDelayed={hideTooltipDelayed}
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
