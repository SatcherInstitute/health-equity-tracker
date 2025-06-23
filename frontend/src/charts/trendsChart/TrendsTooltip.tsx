/**
 * Tooltip for the charts that track trends over time
 * @param {object[]} data array of timeseries data objects
 * @param {string} selectedDate the date that is currently hovered
 * @param {object} axisConfig an object containing the configuration for axes - type and labels
 * @param {boolean} isSkinny a flag to determine whether user is viewing app below the mobile breakpoint or with resulting card column in compare mode below mobile breakpoint
 * returns jsx of a div with a grid of names, bar chart viz, and amounts

/* External Imports */
import { Fragment } from 'react'

/* Local Imports */
import { raceNameToCodeMap } from '../../data/utils/Constants'

import { COLORS as C, FORMATTERS as F, TYPES } from './constants'
/* Helpers */
import {
  getAmountsByDate,
  getWidthHundredK,
  getWidthPctShare,
  sortDataDescending,
  translateXPctShare,
} from './helpers'
/* Constants */
import type { AxisConfig, GroupData, TrendsData } from './types'

/* Define type interface */
interface TrendsTooltipProps {
  data: TrendsData
  selectedDate: string | null
  axisConfig: AxisConfig
  isSkinny: boolean
}

/* Render component */
export function TrendsTooltip({
  data,
  selectedDate,
  axisConfig,
  isSkinny,
}: TrendsTooltipProps) {
  const { type, yAxisLabel = '' } = axisConfig || {}

  const zeroTranslate = () => 0

  const TYPE_CONFIG = {
    [TYPES.HUNDRED_K]: {
      UNIT: isSkinny ? '' : ' per 100k',
      width: getWidthHundredK,
      translate_x: zeroTranslate,
      formatter: F.num100k,
    },
    [TYPES.PCT_RATE]: {
      UNIT: '',
      width: getWidthPctShare,
      translate_x: zeroTranslate,
      formatter: F.pct,
    },
    [TYPES.PERCENT_SHARE]: {
      UNIT: '',
      width: getWidthPctShare,
      translate_x: zeroTranslate,
      formatter: F.pct,
    },
    [TYPES.PERCENT_RELATIVE_INEQUITY]: {
      UNIT: ' %',
      width: getWidthPctShare,
      translate_x: translateXPctShare,
      formatter: F.plusNum,
    },
    [TYPES.INDEX]: {
      UNIT: '',
      width: getWidthHundredK,
      translate_x: zeroTranslate,
      formatter: F.num100k,
    },
  }

  const isMonthly = (selectedDate?.length ?? 0) > 4
  const displayDate = isMonthly
    ? F.dateFromString_MM_YYYY(selectedDate ?? '')
    : F.dateFromString_YYYY(selectedDate ?? '')

  return (
    <figure className='h-full w-min whitespace-nowrap rounded-sm border border-alt-grey border-solid bg-white p-3 font-medium font-sans-text text-small'>
      {/* Date title */}
      <figcaption className='border-0 border-alt-grey border-b border-solid pb-3 text-center'>
        <div>{displayDate}</div>
        {/* if per 100k chart and on mobile, add subtitle with units */}
        {isSkinny && type === TYPES.HUNDRED_K && (
          <div className='mt-1 font-normal font-sans-text text-smallest'>
            {F.capitalize(yAxisLabel)}
          </div>
        )}
      </figcaption>
      <div
        className='grid items-center justify-items-start gap-x-2 gap-y-1 pt-3 text-smallest'
        style={{ gridTemplateColumns: '1fr 50px 1fr' }}
      >
        {data &&
          sortDataDescending(data, selectedDate ?? '').map(
            ([group, d]: GroupData) => {
              // get value or "<.1" to prevent potentially misleading "0 per 100k" on rates
              const value = TYPE_CONFIG[type]?.formatter(
                getAmountsByDate(d, selectedDate),
              )

              return (
                <Fragment key={`tooltipRow-${group}`}>
                  {/* group label - get from dictionary, if it doesn't exist, append group as label */}
                  <div>{raceNameToCodeMap[group] ?? group}</div>
                  {/* rectangle indicator */}
                  <div
                    style={{
                      backgroundColor: C(group),
                      width: TYPE_CONFIG[type]?.width(d, selectedDate, data),
                      transform: `translateX(${TYPE_CONFIG[type]?.translate_x(
                        d,
                        selectedDate,
                        data,
                      )}px)`,
                    }}
                    className='h-2.5 transition duration-200 ease-linear'
                  />
                  {/* amount */}
                  <div className='justify-end whitespace-nowrap'>
                    {/* // TODO: update way rounding number */}
                    <span className='font-normal font-sans-text'>{value}</span>
                    <span className='font-normal font-sans-text'>
                      {TYPE_CONFIG[type]?.UNIT}
                    </span>
                  </div>
                </Fragment>
              )
            },
          )}
      </div>
    </figure>
  )
}
