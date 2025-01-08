import { scaleBand, scaleLinear } from 'd3'
import { useMemo } from 'react'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import {
  type DemographicType,
  hasSkinnyGroupLabels,
} from '../../data/query/Breakdowns'
import { sortForVegaByIncome } from '../../data/sorting/IncomeSorterStrategy'
import type { HetRow } from '../../data/utils/DatasetTypes'
import type { Fips } from '../../data/utils/Fips'
import { het } from '../../styles/DesignTokens'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { useResponsiveWidth } from '../../utils/hooks/useResponsiveWidth'
import VerticalGridlines from '../rateBarChart/VerticalGridlines'
import XAxis from '../rateBarChart/XAxis'
import YAxis from '../rateBarChart/YAxis'
import {
  MAX_LABEL_WIDTH_BIG,
  MAX_LABEL_WIDTH_SMALL,
  NORMAL_MARGIN_HEIGHT,
  Y_AXIS_LABEL_HEIGHT,
} from '../rateBarChart/constants'
import StackedBarLegend from './StackedBarLegend'
import StackedBarsWithLabels from './StackedBarsWithLabels'
import { StackedSharesBarChartTooltip } from './StackedSharesBarChartTooltip'
import { useStackedSharesBarChartTooltip } from './useStackedSharesBarChartTooltip'

export const STACKED_BAR_MARGIN = { top: 40, right: 30, bottom: 50, left: 200 }
const BAR_HEIGHT = 22
const BAR_PADDING = 0.5
const PAIR_GAP = 3
const SET_GAP = 20
export const STACKED_BAR_COLORS = {
  population: het.barChartLight,
  distribution: het.barChartDark,
}
const BORDER_RADIUS = 4
const LEGEND_HEIGHT = 10

interface StackedBarChartProps {
  data: HetRow[]
  lightMetric: MetricConfig
  darkMetric: MetricConfig
  fips: Fips
  demographicType: DemographicType
  metricDisplayName: string
  filename?: string
}

export function StackedBarChart(props: StackedBarChartProps) {
  const isSmAndUp = useIsBreakpointAndUp('sm')
  const [containerRef, width] = useResponsiveWidth()
  const { tooltipData, handleTooltip, closeTooltip, handleContainerTouch } =
    useStackedSharesBarChartTooltip()

  const maxLabelWidth = hasSkinnyGroupLabels(props.demographicType)
    ? MAX_LABEL_WIDTH_SMALL
    : MAX_LABEL_WIDTH_BIG
  STACKED_BAR_MARGIN.left = maxLabelWidth + NORMAL_MARGIN_HEIGHT
  if (isSmAndUp) STACKED_BAR_MARGIN.left += Y_AXIS_LABEL_HEIGHT

  const processedData =
    props.demographicType === 'income'
      ? sortForVegaByIncome(props.data)
      : props.data

  const innerWidth = width - STACKED_BAR_MARGIN.left - STACKED_BAR_MARGIN.right
  const innerHeight =
    processedData.length * (BAR_HEIGHT * 2 + PAIR_GAP + SET_GAP)
  const height =
    innerHeight +
    STACKED_BAR_MARGIN.top +
    STACKED_BAR_MARGIN.bottom +
    LEGEND_HEIGHT

  const xScale = useMemo(() => {
    const maxValue = Math.max(
      ...processedData.flatMap((d) => [
        d[props.lightMetric.metricId] || 0,
        d[props.darkMetric.metricId] || 0,
      ]),
    )
    return scaleLinear().domain([0, maxValue]).range([0, innerWidth])
  }, [processedData, innerWidth])

  const yScale = useMemo(() => {
    return scaleBand()
      .domain(processedData.map((d) => d[props.demographicType]))
      .range([0, innerHeight])
      .padding(BAR_PADDING)
  }, [processedData, innerHeight])

  const getYPosition = (_index: number, demographicValue: string) => {
    return yScale(demographicValue) || 0
  }

  return (
    <div
      ref={containerRef}
      onTouchStart={handleContainerTouch}
      className='relative'
    >
      <StackedSharesBarChartTooltip
        data={tooltipData}
        darkMetric={props.darkMetric}
        lightMetric={props.lightMetric}
        demographicType={props.demographicType}
      />
      <svg
        width={width}
        height={height}
        aria-label={`Stacked Bar Chart Showing ${props.filename || 'Data'}`}
      >
        <g
          transform={`translate(${STACKED_BAR_MARGIN.left},${STACKED_BAR_MARGIN.top})`}
        >
          <StackedBarLegend metricDisplayName={props.metricDisplayName} />
          <VerticalGridlines
            width={width}
            height={innerHeight}
            xScale={xScale}
          />

          <StackedBarsWithLabels
            data={processedData}
            lightMetric={props.lightMetric}
            darkMetric={props.darkMetric}
            xScale={xScale}
            yScale={yScale}
            colors={STACKED_BAR_COLORS}
            barHeight={BAR_HEIGHT}
            pairGap={PAIR_GAP}
            borderRadius={BORDER_RADIUS}
            demographicType={props.demographicType}
            onTooltip={handleTooltip}
            onCloseTooltip={closeTooltip}
          />

          <XAxis
            metricConfig={props.darkMetric}
            secondaryMetricConfig={props.lightMetric}
            xScale={xScale}
            width={innerWidth}
            height={innerHeight}
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
        </g>
      </svg>
    </div>
  )
}
