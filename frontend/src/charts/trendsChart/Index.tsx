/**
 * A parent component with a Filter, Line Chart and optional Circle Chart that visualizes data trends over time
 * Uses d3.js to apply data transformations and draw the lines and circles on an SVG
 * @param {object[]} data array of timeseries data objects
 * @param {[]} unknown an array of data for unknown group
 * @param {object} axisConfig an object containing the configuration for axes - type and labels
 * returns jsx of a div encapsulating a div containing legend items which can be used to filter and and svg with data visualization
 */

/* External Imports */
import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { scaleTime, scaleLinear, extent, min, max, bisector } from "d3";

/* Local Imports */

/* Components */
import { FilterLegend } from "./FilterLegend";
import { LineChart } from "./LineChart";
import { Axes } from "./Axes";
import { CircleChart } from "./CircleChart";
import { TrendsTooltip } from "./TrendsTooltip";
import { HoverCircles } from "./HoverCircles";

/* Styles */
import styles from "./Trends.module.scss";

/* Constants */
import { CONFIG } from "./constants";
import { UnknownData, TrendsData, AxisConfig } from "./types";

/* Helpers */
import {
  filterDataByGroup,
  getAmounts,
  getDates,
  filterUnknownsByTimePeriod,
} from "./helpers";

/* Define type interface */
export interface TrendsChartProps {
  data: TrendsData;
  unknown: UnknownData;
  axisConfig: AxisConfig;
}

/* Render component */
export function TrendsChart({
  data = [],
  unknown,
  axisConfig,
}: TrendsChartProps) {
  /* Config */
  const { STARTING_WIDTH, HEIGHT, MARGIN, MOBILE } = CONFIG;
  const { type, groupLabel } = axisConfig || {};

  /* Refs */
  // parent container ref - used for setting svg width
  const containerRef = useRef(null);
  // tooltip wrapper ref
  const toolTipRef = useRef(null);

  /* State Management */
  // Manages which group filters user has applied
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  // manages dynamic svg width
  const [[width, isMobile], setWidth] = useState<[number, boolean]>([
    STARTING_WIDTH,
    false,
  ]);
  // Stores date that user is currently hovering
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  // Stores width of tooltip to allow dynamic tooltip positioning
  const [tooltipWidth, setTooltipWidth] = useState<number>(0);

  /* Effects */
  // resets svg width on window resize, only sets listener after first render (so ref is defined)
  useEffect(() => {
    function setDimensions() {
      const isMobile = window.innerWidth < 600;
      // @ts-ignore
      setWidth([containerRef.current.getBoundingClientRect().width, isMobile]);
    }
    setDimensions();
    window.addEventListener("resize", setDimensions);
    return () => window.removeEventListener("resize", setDimensions);
  }, []);

  // resets tooltip parent width on data, filter, or hover change
  // allows to dynamically position tooltip to left of hover line
  useEffect(() => {
    // @ts-ignore
    setTooltipWidth(toolTipRef?.current?.getBoundingClientRect()?.width);
  }, [data, selectedGroups, hoveredDate]);

  /* Memoized constants */

  // Data filtered by user selected
  const filteredData = useMemo(
    () =>
      selectedGroups.length ? filterDataByGroup(data, selectedGroups) : data,
    [selectedGroups, data]
  );

  // Display unknowns or not - affects margin below line chart
  const showUnknowns = useMemo(
    () => unknown && unknown.find(([, percent]) => percent > 0),
    [unknown]
  );

  // Margin below line chart - create space for unknown circles
  const marginBottom = useMemo(
    () => (showUnknowns ? MARGIN.bottom_with_unknowns : MARGIN.bottom),
    [MARGIN.bottom_with_unknowns, MARGIN.bottom, showUnknowns]
  );

  // Margin to left of line chart - different on mobile & desktop
  const marginLeft = useMemo(
    () => (isMobile ? MOBILE.MARGIN.left : MARGIN.left),
    [isMobile, MARGIN.left, MOBILE.MARGIN.left]
  );

  // Margin to right of line chart - different on mobile & desktop
  const marginRight = useMemo(
    () => (isMobile ? MOBILE.MARGIN.right : MARGIN.right),
    [isMobile, MARGIN.right, MOBILE.MARGIN.right]
  );

  // TODO: look into using useCallback instead
  // Array of just dates (x values)
  const dates = getDates(filteredData);
  // Array of just amounts (y values)
  const amounts = getAmounts(filteredData);

  /* Scales */

  // define X and Y extents
  const xExtent: [Date, Date] | [undefined, undefined] = extent(
    dates.map((date) => new Date(date))
  );

  // @ts-ignore
  const yMin = min(amounts) < 0 ? min(amounts) : 0; // if numbers are all positive, y domain min should be 0
  const yMax = max(amounts) ? max(amounts) : 0;
  const yExtent: [number, number] = [yMin as number, yMax as number];

  // X-Scale
  const xScale = scaleTime(xExtent as [Date, Date], [
    marginLeft,
    (width as number) - marginRight,
  ]);

  // Y-Scale
  const yScale = scaleLinear(yExtent as [number, number], [
    HEIGHT - marginBottom,
    MARGIN.top,
  ]);

  /* Event Handlers */
  function handleClick(selectedGroup: string | null) {
    // Toggle selected group
    const newSelectedGroups =
      selectedGroup === null
        ? [] // if selectedGroup has null value, clear selected group array to remove filter
        : selectedGroups.includes(selectedGroup) // otherwise update the array with newly selected or removed group
        ? selectedGroups.filter((group) => group !== selectedGroup)
        : [...selectedGroups, selectedGroup];
    // Set new array of selected groups to state
    setSelectedGroups(newSelectedGroups);
  }

  const handleMousemove = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      const { clientX } = e;
      // need to offset by how far the element is from edge of page
      const { x: parentX } =
        e.currentTarget?.parentElement?.getBoundingClientRect() || {};
      // using position, find date (using inverted xScale)
      const invertedDate = xScale.invert(clientX - (parentX || 0));
      // initalize bisector
      const bisect = bisector((d) => d);
      // get closest date index
      const closestIdx = bisect.left(
        dates.map((d) => new Date(d)),
        invertedDate
      );
      // console.log(dates)
      // set state to story hovered date
      setHoveredDate(dates[closestIdx]);
    },
    [dates, xScale]
  );

  return (
    // Container
    <div className={styles.TrendsChart} ref={containerRef}>
      <div className={styles.FilterWrapper}>
        {/* Filter */}
        {data && (
          <FilterLegend
            data={data}
            selectedGroups={selectedGroups}
            handleClick={handleClick}
            groupLabel={groupLabel}
            isMobile={isMobile}
          />
        )}
      </div>
      {/* Tooltip */}
      <div
        className={styles.TooltipWrapper}
        style={{
          transform: `translate(${
            xScale(new Date(hoveredDate || "")) > width / 2
              ? xScale(new Date(hoveredDate || "")) - tooltipWidth - 10
              : xScale(new Date(hoveredDate || "")) + 10
          }px, ${MARGIN.top}px)`,
          opacity: hoveredDate ? 1 : 0,
        }}
      >
        <div ref={toolTipRef}>
          <TrendsTooltip
            data={filteredData}
            type={type}
            selectedDate={hoveredDate}
          />
        </div>
      </div>
      {/* Chart */}
      {filteredData && xScale && yScale && (
        <svg
          height={CONFIG.HEIGHT}
          width={width as number}
          role="img"
          onMouseMove={handleMousemove}
          onMouseLeave={() => setHoveredDate(null)}
          // TODO link accompanying table here for accesibility
          // aria-describedby={}
        >
          {/* Chart Axes */}
          <Axes
            data={filteredData}
            xScale={xScale}
            yScale={yScale}
            width={width as number}
            marginBottom={marginBottom}
            marginLeft={marginLeft}
            marginRight={marginRight}
            axisConfig={axisConfig}
            isMobile={isMobile}
          />
          {/* Lines */}
          <LineChart data={filteredData} xScale={xScale} yScale={yScale} />
          {/* Group for hover indicator line and circles */}
          <g
            className={styles.Indicators}
            // transform group to hovered x position
            style={{
              transform: `translateX(${xScale(new Date(hoveredDate || ""))}px)`,
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
            <CircleChart
              data={filterUnknownsByTimePeriod(unknown, dates)}
              xScale={xScale}
              width={width}
              isMobile={isMobile}
              groupLabel={groupLabel}
              selectedDate={hoveredDate}
            />
          )}
        </svg>
      )}
    </div>
  );
}
