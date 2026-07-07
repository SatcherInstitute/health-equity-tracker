import { Fragment } from 'react'
import { raceNameToCodeMap } from '../../data/utils/Constants'
import { COLORS as C, FORMATTERS as F, TYPES } from './constants'
import {
  getAmountsByDate,
  getWidthHundredK,
  getWidthPctShare,
  sortDataDescending,
  translateXPctShare,
} from './helpers'
import type { AxisConfig, GroupData, TrendsData } from './types'

interface TrendsTooltipProps {
  data: TrendsData
  selectedDate: string | null
  axisConfig: AxisConfig
  isSkinny: boolean
}

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
    <>
      <div className='border-0 border-alt-gray border-b border-solid pb-3 text-center'>
        <div>{displayDate}</div>
        {isSkinny && type === TYPES.HUNDRED_K && (
          <div className='mt-1 font-normal font-sans-text text-smallest'>
            {F.capitalize(yAxisLabel)}
          </div>
        )}
      </div>
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
                  <div>{raceNameToCodeMap[group] ?? group}</div>
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
                  <div className='justify-end whitespace-nowrap'>
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
    </>
  )
}
