/**
 * A parent component with a Filter, Line Chart and optional Circle Chart that visualizes data trends over time
 * Uses d3.js to apply data transformations and draw the lines and circles on an SVG
 * @param {object[]} data array of timeseries data objects
 * @param {[]} unknown an array of data for unknown group
 * @param {object} axisConfig an object containing the configuration for axes - type and labels
 * returns jsx of a div encapsulating a div containing legend items which can be used to filter and and svg with data visualization
 */

/* External Imports */
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { scaleTime, scaleLinear, extent, min, max, bisector } from 'd3'

/* Local Imports */

/* Components */
import { FilterLegend } from './FilterLegend'
import { LineChart } from './LineChart'
import { Axes } from './Axes'
import { CircleChart } from './CircleChart'
import { TrendsTooltip } from './TrendsTooltip'
import { HoverCircles } from './HoverCircles'

/* Styles */
import styles from './Trends.module.scss'

/* Constants */
import { CONFIG, BASELINE_THRESHOLD_Y_AXIS_ZERO } from './constants'
import { type UnknownData, type TrendsData, type AxisConfig } from './types'

/* Helpers */
import {
  filterDataByGroup,
  getAmounts,
  getDates,
  filterUnknownsByTimePeriod,
} from './helpers'
import { MOBILE_BREAKPOINT } from '../../App'
import { type BreakdownVar } from '../../data/query/Breakdowns'
import useEscape from '../../utils/hooks/useEscape'
import { getMinMaxGroups } from '../../data/utils/DatasetTimeUtils'
import { type DemographicGroup } from '../../data/utils/Constants'
import ChartTitle from '../../cards/ChartTitle'

/* Define type interface */
export interface TrendsChartProps {
  data: TrendsData
  unknown: UnknownData
  axisConfig: AxisConfig
  chartTitle: string
  breakdownVar: BreakdownVar
  setSelectedTableGroups: (selectedTableGroups: any[]) => void
  isCompareCard: boolean
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  hasUnknowns: boolean
}

/* Render component */
export function TrendsChart({
  data = [],
  unknown,
  axisConfig,
  chartTitle,
  breakdownVar,
  setSelectedTableGroups,
  isCompareCard,
  expanded,
  setExpanded,
  hasUnknowns,
}: TrendsChartProps) {
  /* Config */
  const { STARTING_WIDTH, HEIGHT, MARGIN, MOBILE } = CONFIG
  const { groupLabel } = axisConfig ?? {}

  /* Refs */
  // parent container ref - used for setting svg width
  const containerRef = useRef(null)
  // tooltip wrapper ref
  const toolTipRef = useRef(null)

  /* State Management */
  const allPossibleGroups = data.map(([group]) => group)

  const isRelativeInequity = axisConfig.type === 'pct_relative_inequity'
  const isInequityWithManyGroups =
    isRelativeInequity && allPossibleGroups.length > 6

  // Manages which group filters user has applied
  const defaultGroups = isInequityWithManyGroups ? getMinMaxGroups(data) : []
  const [selectedTrendGroups, setSelectedTrendGroups] =
    useState<DemographicGroup[]>(defaultGroups)

  // manages dynamic svg width
  const [[width, isMobile], setWidth] = useState<[number, boolean]>([
    STARTING_WIDTH,
    false,
  ])

  const isCompareMode = window.location.href.includes('compare')

  // treat medium screen compare mode like mobile
  const isSkinny = isMobile || width < MOBILE_BREAKPOINT || isCompareMode

  // Stores date that user is currently hovering
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  function handleEscapeKey() {
    setHoveredDate(null)
  }

  useEscape(handleEscapeKey)

  // Stores width of tooltip to allow dynamic tooltip positioning
  const [tooltipWidth, setTooltipWidth] = useState<number>(0)

  /* Effects */
  // resets svg width on window resize, only sets listener after first render (so ref is defined)
  useEffect(() => {
    function setDimensions() {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT
      setWidth([
        // @ts-expect-error
        containerRef.current?.getBoundingClientRect().width,
        isMobile,
      ])
    }
    setDimensions()
    window.addEventListener('resize', setDimensions)
    return () => {
      window.removeEventListener('resize', setDimensions)
    }
  }, [])

  // resets tooltip parent width on data, filter, or hover change
  // allows to dynamically position tooltip to left of hover line
  useEffect(() => {
    // @ts-expect-error
    setTooltipWidth(toolTipRef?.current?.getBoundingClientRect()?.width)
  }, [data, selectedTrendGroups, hoveredDate])

  /* Memoized constants */

  // Data filtered by user selected
  const filteredData = useMemo(
    () =>
      selectedTrendGroups?.length
        ? filterDataByGroup(data, selectedTrendGroups)
        : data,
    [selectedTrendGroups, data]
  )

  // Display unknowns or not - affects margin below line chart
  const showUnknowns = useMemo(
    () => expanded && hasUnknowns,
    [hasUnknowns, expanded]
  )

  // Margin below line chart - create space for unknown circles
  const marginBottom = useMemo(
    () => (showUnknowns ? MARGIN.bottom_with_unknowns : MARGIN.bottom),
    [MARGIN.bottom_with_unknowns, MARGIN.bottom, showUnknowns]
  )

  // Margin to left of line chart - different on mobile & desktop
  const marginLeft = useMemo(
    () => (isSkinny ? MOBILE.MARGIN.left : MARGIN.left),
    [isSkinny, MARGIN.left, MOBILE.MARGIN.left]
  )

  // Margin to right of line chart - different on mobile & desktop
  const marginRight = useMemo(
    () => (isSkinny ? MOBILE.MARGIN.right : MARGIN.right),
    [isSkinny, MARGIN.right, MOBILE.MARGIN.right]
  )

  // TODO: look into using useCallback instead
  // Array of just dates (x values)
  const dates = getDates(filteredData)
  // Array of just amounts (y values)
  const amounts = getAmounts(filteredData)

  /* Scales */

  // define X and Y extents
  const xExtent: [Date, Date] | [undefined, undefined] = extent(
    dates.map((date) => new Date(date))
  )

  const minAmount = min(amounts)
  const maxAmount = max(amounts)
  // Ensure min/max are always a number
  let yMin = minAmount !== undefined && minAmount < 0 ? minAmount : 0
  const yMax = maxAmount !== undefined ? maxAmount : 0

  // For charts where the lowest value is far from baseline 0
  if (minAmount !== undefined && minAmount > BASELINE_THRESHOLD_Y_AXIS_ZERO) {
    const Y_MIN_BUFFER = 2
    yMin = minAmount - Y_MIN_BUFFER
  }

  const yExtent: [number, number] = [yMin, yMax]

  // X-Scale
  const xScale = scaleTime(xExtent as [Date, Date], [
    marginLeft,
    width - marginRight,
  ])
  axisConfig.xAxisMaxTicks = dates.length < 12 ? dates.length : null // d3 was adding duplicate time period ticks to sets with very few time periods

  // Y-Scale
  const yScale = scaleLinear(yExtent as [number, number], [
    HEIGHT - marginBottom,
    MARGIN.top,
  ])

  /* Event Handlers */
  function handleClick(selectedGroup: DemographicGroup | null) {
    // Toggle selected group
    const newSelectedGroups =
      selectedGroup === null
        ? [] // if selectedGroup has null value, clear selected group array to remove filter
        : selectedTrendGroups.includes(selectedGroup) // otherwise update the array with newly selected or removed group
        ? selectedTrendGroups.filter((group) => group !== selectedGroup)
        : [...selectedTrendGroups, selectedGroup]
    // Set new array of selected groups to state

    const allGroupsAreSelected =
      allPossibleGroups.length === newSelectedGroups.length
    setSelectedTrendGroups(allGroupsAreSelected ? [] : newSelectedGroups)
  }

  function handleMinMaxClick() {
    const minMaxGroups = getMinMaxGroups(data)

    // Set new array of selected groups to state
    setSelectedTrendGroups(minMaxGroups)
  }

  useEffect(() => {
    setSelectedTableGroups(selectedTrendGroups)
  }, [selectedTrendGroups, setSelectedTableGroups])

  const handleMousemove = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      const { clientX } = e
      // need to offset by how far the element is from edge of page
      const { x: parentX } =
        e.currentTarget?.parentElement?.getBoundingClientRect() ?? {}
      // using position, find date (using inverted xScale)
      const invertedDate = xScale.invert(clientX - (parentX ?? 0))
      // initialize bisector
      const bisect = bisector((d) => d)
      // get closest date index
      const closestIdx = bisect.left(
        dates.map((d) => new Date(d)),
        invertedDate
      )
      // set state to story hovered date
      setHoveredDate(dates[closestIdx])
    },
    [dates, xScale]
  )

  const chartTitleId = `chart-title-label-${axisConfig.type}-${
    isCompareCard ? '2' : '1'
  }`

  return (
    // Container
    <figure className={styles.TrendsChart} ref={containerRef}>
      <div
        className={
          isSkinny ? styles.FilterWrapperSkinny : styles.FilterWrapperWide
        }
      >
        {isMobile ? (
          <>
            {/* Filter */}
            {data && (
              <FilterLegend
                data={data}
                selectedGroups={selectedTrendGroups}
                handleClick={handleClick}
                handleMinMaxClick={handleMinMaxClick}
                groupLabel={groupLabel}
                isSkinny={isSkinny}
                chartWidth={width}
                breakdownVar={breakdownVar}
                legendId={`legend-filter-label-${axisConfig.type}-${
                  isCompareCard ? '2' : '1'
                }`}
              />
            )}
            {/* Chart Title MOBILE BELOW LEGEND */}
            <ChartTitle title={chartTitle} />
          </>
        ) : (
          <>
            {/* Chart Title DESKTOP ABOVE LEGEND */}
            <ChartTitle title={chartTitle} />
            {/* Filter */}
            {data && (
              <FilterLegend
                data={data}
                selectedGroups={selectedTrendGroups}
                handleClick={handleClick}
                handleMinMaxClick={handleMinMaxClick}
                groupLabel={groupLabel}
                isSkinny={isSkinny}
                chartWidth={width}
                breakdownVar={breakdownVar}
                legendId={`legend-filter-label-${axisConfig.type}-${
                  isCompareCard ? '2' : '1'
                }`}
              />
            )}
          </>
        )}
      </div>
      {/* Tooltip */}
      <div
        className={styles.TooltipWrapper}
        // Position tooltip to the right of the cursor until until cursor is half way across chart, then to left
        style={{
          transform: `translate(${xScale(new Date(hoveredDate ?? ''))}px, ${
            MARGIN.top
          }px)`,
          opacity: hoveredDate ? 1 : 0,
        }}
      >
        <div
          ref={toolTipRef}
          style={{
            transform: `translateX(${
              xScale(new Date(hoveredDate ?? '')) > width / 2
                ? -tooltipWidth - 10
                : 10
            }px)`,
          }}
        >
          <TrendsTooltip
            data={filteredData}
            axisConfig={axisConfig}
            isSkinny={isSkinny}
            selectedDate={hoveredDate}
          />
        </div>
      </div>
      {/* Chart */}
      {filteredData && xScale && yScale && (
        <>
          <svg
            height={CONFIG.HEIGHT}
            width={width}
            onMouseMove={handleMousemove}
            onMouseLeave={() => {
              setHoveredDate(null)
            }}
            role="group"
            aria-labelledby={chartTitleId}
          >
            {/* Chart Axes */}
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
            {/* Lines */}
            <LineChart
              data={filteredData}
              xScale={xScale}
              yScale={yScale}
              valuesArePct={axisConfig.type === 'pct_share'}
            />
            {/* Group for hover indicator line and circles */}
            <g
              className={styles.Indicators}
              // transform group to hovered x position
              style={{
                transform: `translateX(${xScale(
                  new Date(hoveredDate ?? '')
                )}px)`,
                opacity: hoveredDate ? 1 : 0,
              }}
            >
              <line y1={HEIGHT - marginBottom} y2={MARGIN.top} x1={0} x2={0} />
              <HoverCircles
                data={filteredData}
                selectedDate={hoveredDate}
                yScale={yScale}
              />
            </g>
            {/* Only render unknown group circles when there is data for which the group is unknown */}
            {showUnknowns && (
              <>
                <CircleChart
                  data={filterUnknownsByTimePeriod(unknown, dates)}
                  xScale={xScale}
                  width={width}
                  isSkinny={isSkinny}
                  groupLabel={groupLabel}
                  selectedDate={hoveredDate}
                  circleId={`${axisConfig.type}-${isCompareCard ? 'b' : 'a'}`}
                />
              </>
            )}
          </svg>
        </>
      )}
    </figure>
  )
}
