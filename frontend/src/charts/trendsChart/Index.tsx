import { bisector, extent, max, min, scaleLinear, scaleTime } from 'd3'
import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import ChartTitle from '../../cards/ChartTitle'
import type { DemographicType } from '../../data/query/Breakdowns'
import { ALL, type DemographicGroup } from '../../data/utils/Constants'
import { getMinMaxGroups } from '../../data/utils/DatasetTimeUtils'
import useEscape from '../../utils/hooks/useEscape'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { useResponsiveWidth } from '../../utils/hooks/useResponsiveWidth'
import { HetChartHoverTooltip } from '../HetChartHoverTooltip'
import { useChartTooltip } from '../useChartTooltip'
import { X_AXIS_MAX_TICKS } from '../utils'
import { Axes } from './Axes'
import { CircleChart } from './CircleChart'
import { BASELINE_THRESHOLD_Y_AXIS_ZERO, CONFIG } from './constants'
import { FilterLegend } from './FilterLegend'
import { HoverCircles } from './HoverCircles'
import {
  filterDataByGroup,
  filterUnknownsByTimePeriod,
  getAmounts,
  getDates,
} from './helpers'
import { LineChart } from './LineChart'
import { TrendsTooltip } from './TrendsTooltip'
import type { AxisConfig, TrendsData, UnknownData } from './types'

interface TrendsChartProps {
  data: TrendsData
  unknown: UnknownData
  axisConfig: AxisConfig
  chartTitle: string
  chartSubTitle: string
  demographicType: DemographicType
  setSelectedTableGroups: (selectedTableGroups: any[]) => void
  isCompareCard: boolean
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  hasUnknowns: boolean
  keepOnlyElectionYears?: boolean
  chartTitleId?: string
}

export function TrendsChart({
  data = [],
  unknown,
  axisConfig,
  chartTitle,
  chartSubTitle,
  demographicType,
  setSelectedTableGroups,
  isCompareCard,
  expanded,
  hasUnknowns,
  keepOnlyElectionYears,
  chartTitleId: chartTitleIdProp,
}: TrendsChartProps) {
  const isSm = useIsBreakpointAndUp('sm')
  const { HEIGHT, MARGIN, MOBILE } = CONFIG
  const { groupLabel } = axisConfig ?? {}

  const allPossibleGroups = data.map(([group]) => group)

  const defaultGroups: DemographicGroup[] = []
  const [selectedTrendGroups, setSelectedTrendGroups] =
    useState<DemographicGroup[]>(defaultGroups)

  const [containerRef, width] = useResponsiveWidth()

  const isCompareMode = window.location.href.includes('compare')

  // treat medium screen compare mode like mobile
  const isSkinny = !isSm || isCompareMode || isCompareCard

  const {
    tooltipData: hoveredDate,
    tooltipPos,
    showTooltip,
    hideTooltip,
  } = useChartTooltip<string>()

  useEscape(hideTooltip)

  const filteredData = useMemo(
    () =>
      selectedTrendGroups?.length
        ? filterDataByGroup(data, selectedTrendGroups)
        : data,
    [selectedTrendGroups, data],
  )

  const showUnknowns = useMemo(
    () => expanded && hasUnknowns,
    [hasUnknowns, expanded],
  )

  const marginBottom = useMemo(
    () => (showUnknowns ? MARGIN.bottom_with_unknowns : MARGIN.bottom),
    [MARGIN.bottom_with_unknowns, MARGIN.bottom, showUnknowns],
  )

  const marginLeft = useMemo(
    () => (isSkinny ? MOBILE.MARGIN.left : MARGIN.left),
    [isSkinny, MARGIN.left, MOBILE.MARGIN.left],
  )

  const marginRight = useMemo(
    () => (isSkinny ? MOBILE.MARGIN.right : MARGIN.right),
    [isSkinny, MARGIN.right, MOBILE.MARGIN.right],
  )

  const dates = useMemo(() => getDates(filteredData), [filteredData])
  const parsedDates = useMemo(() => dates.map((d) => new Date(d)), [dates])
  const amounts = getAmounts(filteredData)

  const xExtent: [Date, Date] | [undefined, undefined] = extent(parsedDates)

  const minAmount = min(amounts)
  const maxAmount = max(amounts)
  let yMin = minAmount !== undefined && minAmount < 0 ? minAmount : 0
  const yMax = maxAmount !== undefined ? maxAmount : 0

  // keep y-axis near data when lowest value is well above baseline
  if (minAmount !== undefined && minAmount > BASELINE_THRESHOLD_Y_AXIS_ZERO) {
    const Y_MIN_BUFFER = 2
    yMin = minAmount - Y_MIN_BUFFER
  }

  const yExtent: [number, number] = [yMin, yMax]

  const xScale = scaleTime(xExtent as [Date, Date], [
    marginLeft,
    width - marginRight,
  ])
  axisConfig.xAxisMaxTicks =
    dates.length < X_AXIS_MAX_TICKS ? dates.length : null

  const yScale = scaleLinear(yExtent as [number, number], [
    HEIGHT - marginBottom,
    MARGIN.top,
  ])

  function handleClick(selectedGroup: DemographicGroup | null) {
    const newSelectedGroups =
      selectedGroup === null
        ? []
        : selectedTrendGroups.includes(selectedGroup)
          ? selectedTrendGroups.filter((group) => group !== selectedGroup)
          : [...selectedTrendGroups, selectedGroup]

    const allGroupsAreSelected =
      allPossibleGroups.length === newSelectedGroups.length
    setSelectedTrendGroups(allGroupsAreSelected ? [] : newSelectedGroups)
  }

  function handleMinMaxClick() {
    const minMaxGroups = getMinMaxGroups(data)
    setSelectedTrendGroups(minMaxGroups)
  }

  useEffect(() => {
    setSelectedTableGroups(selectedTrendGroups)
  }, [selectedTrendGroups, setSelectedTableGroups])

  const handleMousemove = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (dates.length === 0) return
      const svgRect = e.currentTarget.getBoundingClientRect()
      const invertedDate = xScale.invert(e.clientX - svgRect.left)
      const bisect = bisector((d: Date) => d)
      let idx = bisect.left(parsedDates, invertedDate)

      // Clamp to valid range
      if (idx >= dates.length) idx = dates.length - 1

      // Pick nearest neighbor (bisect.left returns the right boundary)
      if (idx > 0) {
        const d0 = parsedDates[idx - 1]
        const d1 = parsedDates[idx]
        if (
          invertedDate.getTime() - d0.getTime() <
          d1.getTime() - invertedDate.getTime()
        ) {
          idx -= 1
        }
      }

      const nearestDate = dates[idx]
      if (nearestDate) {
        showTooltip(
          nearestDate,
          svgRect.left + xScale(parsedDates[idx]),
          svgRect.top + MARGIN.top,
        )
      }
    },
    [dates, parsedDates, xScale, MARGIN.top, showTooltip],
  )

  const chartTitleId =
    chartTitleIdProp ??
    `chart-title-label-${axisConfig.type}-${isCompareCard ? '2' : '1'}`

  return (
    <figure className='m-0 font-normal font-sans-text' ref={containerRef}>
      <div className={isSkinny ? 'mb-5 ml-2' : 'mb-5 ml-12'}>
        {isSm && (
          <ChartTitle
            id={chartTitleId}
            title={chartTitle}
            subtitle={chartSubTitle}
          />
        )}
        {data && !(data.length === 1 && data[0][0] === ALL) && (
          <FilterLegend
            data={data}
            selectedGroups={selectedTrendGroups}
            handleClick={handleClick}
            handleMinMaxClick={handleMinMaxClick}
            groupLabel={groupLabel}
            isSkinny={isSkinny}
            chartWidth={width}
            demographicType={demographicType}
            legendId={`legend-filter-label-${axisConfig.type}-${
              isCompareCard ? '2' : '1'
            }`}
          />
        )}
        {!isSm && (
          <ChartTitle
            id={chartTitleId}
            title={chartTitle}
            subtitle={chartSubTitle}
          />
        )}
      </div>
      <HetChartHoverTooltip x={tooltipPos?.x ?? null} y={tooltipPos?.y ?? null}>
        {hoveredDate && (
          <TrendsTooltip
            data={filteredData}
            axisConfig={axisConfig}
            isSkinny={isSkinny}
            selectedDate={hoveredDate}
          />
        )}
      </HetChartHoverTooltip>
      {filteredData && xScale && yScale && (
        <svg
          height={CONFIG.HEIGHT}
          width={width}
          onMouseMove={handleMousemove}
          onMouseLeave={hideTooltip}
          aria-labelledby={chartTitleId}
        >
          <Axes
            data={filteredData}
            xScale={xScale}
            yScale={yScale}
            width={width}
            marginBottom={marginBottom}
            marginLeft={marginLeft}
            marginRight={marginRight}
            axisConfig={axisConfig}
            isSkinny={isSkinny}
            yMin={yMin}
          />
          <LineChart
            data={filteredData}
            xScale={xScale}
            yScale={yScale}
            valuesArePct={axisConfig.type === 'pct_share'}
            keepOnlyElectionYears={keepOnlyElectionYears}
          />
          <g
            className='transition-transform duration-300 ease-linear'
            style={{
              transform: `translateX(${xScale(new Date(hoveredDate ?? ''))}px)`,
              opacity: hoveredDate ? 1 : 0,
            }}
          >
            <line
              className='transition-opacity delay-300 duration-200 ease-linear'
              y1={HEIGHT - marginBottom}
              y2={MARGIN.top}
              x1={0}
              x2={0}
            />
            <HoverCircles
              data={filteredData}
              selectedDate={hoveredDate}
              yScale={yScale}
            />
          </g>
          {showUnknowns && (
            <CircleChart
              data={filterUnknownsByTimePeriod(unknown, dates)}
              xScale={xScale}
              width={width}
              isSkinny={isSkinny}
              groupLabel={groupLabel}
              selectedDate={hoveredDate}
              circleId={`${axisConfig.type}-${isCompareCard ? 'b' : 'a'}`}
            />
          )}
        </svg>
      )}
    </figure>
  )
}
