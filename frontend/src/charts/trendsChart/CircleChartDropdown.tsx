import React, { useState, useMemo, useRef } from "react";
import { BreakdownVar } from "../../data/query/Breakdowns";
import styles from "./../../cards/ui/AltTableView.module.scss";
import { CircleChart } from "./CircleChart";
import { UnknownData, AxisConfig, TrendsData } from "./types";
import { getMinMaxGroups } from "../../data/utils/DatasetTimeUtils";
import { CONFIG } from "./constants";
import { scaleTime, extent } from "d3";
import { MOBILE_BREAKPOINT } from "../../App";

import {
  filterUnknownsByTimePeriod,
  filterDataByGroup,
  getDates,
} from "./helpers";

interface CircleChartDropdownProps {
  expanded: boolean;
  setExpanded: Function;
  data: TrendsData;
  unknown: UnknownData;
  axisConfig: AxisConfig;
  chartTitle: string | string[];
  breakdownVar: BreakdownVar;
  setSelectedTableGroups: Function;
  isCompareCard: boolean;
}

export default function CircleChartDropdown(props: CircleChartDropdownProps) {
  const defaultGroups =
    props.axisConfig.type === "pct_relative_inequity"
      ? getMinMaxGroups(props.data)
      : [];
  const [selectedTrendGroups, setSelectedTrendGroups] =
    useState<string[]>(defaultGroups);

  // Data filtered by user selected
  const filteredData = useMemo(
    () =>
      selectedTrendGroups?.length
        ? filterDataByGroup(props.data, selectedTrendGroups)
        : props.data,
    [selectedTrendGroups, props.data]
  );

  const dates = getDates(filteredData);

  const { HEIGHT, STARTING_WIDTH, MARGIN, RADIUS_EXTENT, MOBILE } = CONFIG;
  const [, MAX_RADIUS] = RADIUS_EXTENT;

  // manages dynamic svg width
  const [[width, isMobile], setWidth] = useState<[number, boolean]>([
    STARTING_WIDTH,
    false,
  ]);

  const containerRef = useRef(null);

  // treat medium screen compare mode like mobile
  const isSkinny = isMobile || width < MOBILE_BREAKPOINT;

  // define X and Y extents
  const xExtent: [Date, Date] | [undefined, undefined] = extent(
    dates.map((date) => new Date(date))
  );

  // Margin to left of line chart - different on mobile & desktop
  const marginLeft = useMemo(
    () => (isSkinny ? MOBILE.MARGIN.left : MARGIN.left),
    [isSkinny, MARGIN.left, MOBILE.MARGIN.left]
  );

  // Margin to right of line chart - different on mobile & desktop
  const marginRight = useMemo(
    () => (isSkinny ? MOBILE.MARGIN.right : MARGIN.right),
    [isSkinny, MARGIN.right, MOBILE.MARGIN.right]
  );

  // X-Scale
  const xScale = scaleTime(xExtent as [Date, Date], [
    marginLeft,
    (width as number) - marginRight,
  ]);

  const { groupLabel } = props.axisConfig || {};

  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const unknownCircleLegendText = `Legend: unknown ${groupLabel.toLowerCase()}`;

  return (
    <figure className={styles.TrendsChart} ref={containerRef}>
      <g
        tabIndex={0}
        role="list"
        aria-label={unknownCircleLegendText + " per month"}
        transform={`translate(0, ${
          HEIGHT - MARGIN.bottom_with_unknowns + 4 * MAX_RADIUS
        })`}
      >
        <CircleChart
          data={filterUnknownsByTimePeriod(props.unknown, dates)}
          xScale={xScale}
          width={width}
          isSkinny={isSkinny}
          groupLabel={groupLabel}
          selectedDate={hoveredDate}
          circleId={`${props.axisConfig.type}-${
            props.isCompareCard ? "b" : "a"
          }`}
        />
      </g>
    </figure>
  );
}
