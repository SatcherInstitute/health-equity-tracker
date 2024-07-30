/**
 * Axes for the charts that track trends over time
 * Uses d3.js to apply generate and draw axes on an SVG
 * @param {object[]} data array of timeseries data objects
 * @param {*} xScale a d3 time series scale function
 * @param {*} yScale a d3 linear scale function
 * @param {number} width the width of the svg
 * @param {number} marginBottom the margin below the line chart (dynamic for mobile & desktop)
 * @param {number} marginLeft the margin to the left of the line chart
 * @param {number} marginRight the margin to the right of the line chart
 * @param {object} axisConfig an object containing the configuration for axes - type and labels
 * @param {boolean} isSkinny a flag to determine whether user is viewing app below the mobile breakpoint or with resulting card column in compare mode below mobile breakpoint
 * returns jsx of an svg group containing groups of axes and axis labels
 **/

/* External Imports */
import { useRef, useEffect } from 'react'
import { axisLeft, axisBottom, select } from 'd3'

/* Local Imports */

/* Constants */
import { CONFIG, TYPES, FORMATTERS as F } from './constants'
import type { TrendsData, XScale, YScale, AxisConfig } from './types'

/* Helpers */
import { getMinNumber, getMaxNumber, getDates } from './helpers'
import { getPrettyDate } from '../../data/utils/DatasetTimeUtils'
import { het } from '../../styles/DesignTokens'

/* Define type interface */
export interface AxesProps {
  data: TrendsData
  xScale: XScale
  yScale: YScale
  width: number
  marginBottom: number
  marginLeft: number
  marginRight: number
  axisConfig: AxisConfig
  isSkinny: boolean
  yMin: number
}

/* Render component */
export function Axes({
  data,
  xScale,
  yScale,
  width,
  marginBottom,
  marginLeft,
  marginRight,
  axisConfig,
  isSkinny,
  yMin,
}: AxesProps) {
  /* Config */
  const { HEIGHT, TICK_PADDING, Y_AXIS_LABEL_PADDING, MOBILE } = CONFIG
  const { type, yAxisLabel = '' } = axisConfig || {}
  const yAxisLabelPadding = isSkinny
    ? MOBILE.Y_AXIS_LABEL_PADDING
    : Y_AXIS_LABEL_PADDING
  // handles difference between per100k and percent_share charts
  const Y_AXIS_CONFIG = {
    [TYPES.HUNDRED_K]: {
      topLabel: yAxisLabel + ' →', // reference to shortLabel from metricConfig
      bottomLabel: '',
      formatter: (d: string | number) => d, // per 100k could be interpolated here
      yScaleMin: yMin,
    },
    [TYPES.PCT_RATE]: {
      topLabel: yAxisLabel + ' →', // reference to shortLabel from metricConfig
      bottomLabel: '',
      formatter: (d: number) => F.pct(d),
      yScaleMin: yMin,
    },
    [TYPES.PERCENT_SHARE]: {
      topLabel: yAxisLabel + ' →', // reference to shortLabel from metricConfig
      bottomLabel: '',
      formatter: (d: number) => F.pct(d),
      yScaleMin: yMin,
    },
    [TYPES.PERCENT_RELATIVE_INEQUITY]: {
      topLabel:
        (getMaxNumber(data) ?? 0) <= 0 ? '' : 'disproportionately high  →', // if there are positive numbers, append positive direction label
      bottomLabel:
        (getMinNumber(data) ?? 0) >= 0 ? '' : '← disproportionately low', // if there are negative numbers, append negative direction label
      formatter: (d: number) => (d === 0 ? '' : F.pct(d)), // if tick is 0, hide it, otherwise format as percent
      yScaleMin: 0,
    },
    [TYPES.INDEX]: {
      topLabel: yAxisLabel + ' →', // reference to shortLabel from metricConfig
      bottomLabel: '',
      formatter: (d: string | number) => d, // per 100k could be interpolated here
      yScaleMin: yMin,
    },
  }

  /* Refs */
  const xAxisRef = useRef(null)
  const yAxisRef = useRef(null)

  /* Axes */
  const numTicksIfSkinny = 5

  const xAxis = axisBottom(xScale)
    .tickSize(0)
    .ticks(isSkinny ? numTicksIfSkinny : axisConfig.xAxisMaxTicks) // limits number of ticks on mobile
    // @ts-expect-error
    .tickFormat(axisConfig.xAxisIsMonthly ? F.dateShort : F.dateYear)
    .tickPadding(TICK_PADDING)

  const yAxis = axisLeft(yScale)
    .tickSizeOuter(0)
    .tickSizeInner(-width + marginRight + marginLeft) // creates grid lines
    // @ts-expect-error
    .tickFormat(Y_AXIS_CONFIG[type]?.formatter)
    .tickPadding(TICK_PADDING / 2)

  /* Effects */

  /* Inject axes using d3 */
  useEffect(() => {
    if (xAxisRef.current && yAxisRef.current) {
      select(xAxisRef.current)
        .transition()
        // @ts-expect-error
        .call(xAxis)

      select(yAxisRef.current)
        .transition()
        // @ts-expect-error
        .call(yAxis)
        // styles the y grid lines after render (we think)
        .call((g) =>
          g
            .selectAll('.tick line')
            .attr('opacity', 0.2)
            .attr('stroke-dasharray', 5),
        )
    }
  }, [data, xScale, yScale, xAxis, yAxis])

  const dates = getDates(data)
  const startDate = getPrettyDate(dates[0])
  const endDate = getPrettyDate(dates[dates.length - 1])

  const optionalPct = !yAxisLabel ? '%' : ''

  return (
    <g>
      {/* Axes */}
      <g>
        {/* X-Axis */}
        <g
          className='xAxisGroup font-sansText	text-smallest font-normal'
          ref={xAxisRef}
          transform={`translate(0, ${HEIGHT - marginBottom})`}
          aria-label={`x axis as months ranging from ${startDate} through ${endDate}`}
          tabIndex={0}
        />
        {/* Y-Axis */}
        <g
          className='yAxisGroup font-sansText text-smallest font-normal '
          ref={yAxisRef}
          transform={`translate(${marginLeft}, 0)`}
          aria-label={`y axis as ${
            yAxisLabel || ' percent disproportionately high or low'
          } ranging from ${getMinNumber(data) ?? 'lowest'}${optionalPct} to ${
            getMaxNumber(data) ?? 'highest'
          }${optionalPct}`}
          tabIndex={0}
        />
      </g>
      {/* Zero Line Indicator */}
      <g>
        <line
          x1={marginLeft}
          y1={yScale(Y_AXIS_CONFIG[type]?.yScaleMin ?? 0)}
          x2={width - marginRight}
          y2={yScale(Y_AXIS_CONFIG[type]?.yScaleMin ?? 0)}
          stroke={het.altGrey}
        />
      </g>
      {/* Axis Labels */}
      <g className='font-sansText text-smallest font-medium'>
        {/* X-Axis Label */}
        <g
          transform={`translate(${width}, ${
            HEIGHT - marginBottom + TICK_PADDING
          })`}
        >
          {/* only display x-axis label on desktop */}
          <text textAnchor='end' dy='8px'>
            {isSkinny ? '' : 'time →'}
          </text>
        </g>
        {/* Top Y-Axis Label */}
        <g transform={`translate(${yAxisLabelPadding}, 0)rotate(-90)`}>
          <text textAnchor='end'>{Y_AXIS_CONFIG[type]?.topLabel}</text>
        </g>
        {/* Bottom Y-Axis Label */}
        <g
          transform={`translate(${yAxisLabelPadding}, ${
            HEIGHT - marginBottom
          })rotate(-90)`}
        >
          <text textAnchor='start'>{Y_AXIS_CONFIG[type]?.bottomLabel}</text>
        </g>
      </g>
    </g>
  )
}
