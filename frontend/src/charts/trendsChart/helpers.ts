import { ascending, descending, max, min } from 'd3'
import { CONFIG } from './constants'
import type { GroupData, TimeSeries, TrendsData, UnknownData } from './types'

const { BAR_WIDTH } = CONFIG

/* Filters out data for groups that are not selected */
function filterDataByGroup(data: TrendsData, groups: string[]) {
  const filteredData = data?.filter(([group]) => groups.includes(group))
  return filteredData
}

/* Filters unknown data by time extent ( x extent ) of current filter */
function filterUnknownsByTimePeriod(data: UnknownData, dates: string[]) {
  return data?.filter(([date]: [string, number]) => dates.includes(date))
}

/* Returns the amount (y value) for a specific date (x value) & group */
function getAmountsByDate(d: TimeSeries, selectedDate: string | null) {
  const [, amount] = d.find(([date]) => date === selectedDate) ?? [0, 0]

  return amount
}

/* Filter and sort data descending for specific date - used in tooltip */
function sortDataDescending(d: TrendsData, selectedDate: string) {
  return (
    // copy array because sort is destructive
    [...d]
      // filter out falsy values other than 0 for this date
      .filter(
        ([, data]) =>
          getAmountsByDate(data, selectedDate) ||
          getAmountsByDate(data, selectedDate) === 0,
      )
      // sort remaining data by number for this date, highest number first
      .sort(([, aData]: GroupData, [group, bData]: GroupData) =>
        descending(
          getAmountsByDate(aData, selectedDate),
          getAmountsByDate(bData, selectedDate),
        ),
      ) || d
  )
}

/* Returns the highest absolute value amount (y value) at a given date (x value) */
function getMaxNumberForDate(data: TrendsData, selectedDate: string | null) {
  const numbers = data.flatMap(([group, d]) =>
    // filter out data points for selected date
    d
      .filter(([date]) => date === selectedDate)
      // return the absolute value of the numbers for this date
      .map(([, number]) => Math.abs(number)),
  )
  // return the max number
  return max(numbers)
}

/* Returns the minimum amount (y value) found in all the data */
function getMinNumber(data: TrendsData) {
  return min(getAmounts(data))
}

/* Returns the maximum amount (y value) found in all the data */
function getMaxNumber(data: TrendsData) {
  return max(getAmounts(data))
}

/* Returns an array of unique date strings in ascending order */
function getDates(data: TrendsData) {
  // if there is data and data is an array with elements
  // create a new array of unique dates
  // and sort by time ascending
  return data?.length
    ? Array.from(
        new Set(
          data.flatMap(([_, d]) => d.map(([date]: [string, number]) => date)),
        ),
      ).sort((a, b) => ascending(new Date(a), new Date(b)))
    : []
}

/* Returns an array of all amounts (y values) */
function getAmounts(data: TrendsData) {
  return data?.length
    ? data.flatMap(([_, d]) =>
        d ? d.map(([_, amount]: [string, number]) => amount || 0) : [0],
      )
    : [0]
}

/* Returns the width of the tooltip bar for the percent share chart for a specific group and date */
function getWidthPctShare(
  d: TimeSeries,
  selectedDate: string | null,
  data: TrendsData,
): number {
  const amount = getAmountsByDate(d, selectedDate) ?? 0
  const maxNumber = getMaxNumberForDate(data, selectedDate) ?? 1 // Ensure non-zero denominator

  if (maxNumber === 0) return 0 // Prevent division by zero

  const width = (Math.abs(amount) / maxNumber) * (BAR_WIDTH / 4)
  return Number.isFinite(width) ? width : 0 // Return 0 if width is NaN or Infinity
}

/* Returns the width of the tooltip bar for the hundred k chart for a specific group and date */
function getWidthHundredK(
  d: TimeSeries,
  selectedDate: string | null,
  data: TrendsData,
): number {
  const amount = getAmountsByDate(d, selectedDate) ?? 0
  const maxNumber = getMaxNumberForDate(data, selectedDate) ?? 1 // Ensure non-zero denominator

  if (maxNumber === 0) return 0 // Prevent division by zero

  const width = (amount / maxNumber) * (BAR_WIDTH / 2)
  return Number.isFinite(width) ? width : 0 // Return 0 if width is NaN or Infinity
}

/* Returns the number of pixels to translate tooltip bar for the percent share chart for a specific group and date */
function translateXPctShare(
  d: TimeSeries,
  selectedDate: string | null,
  data: TrendsData,
) {
  const translateX =
    getAmountsByDate(d, selectedDate) > 0
      ? BAR_WIDTH / 4
      : BAR_WIDTH / 4 +
        (getAmountsByDate(d, selectedDate) /
          (getMaxNumberForDate(data, selectedDate) ?? 1)) *
          (BAR_WIDTH / 4)

  return translateX
}

/* Detect if at least one row in the time series data contains an unknown_pct value greater than 0 */
function hasNonZeroUnknowns(data: TimeSeries | undefined) {
  return data?.some(([, percent]) => percent > 0) ?? false
}

export {
  hasNonZeroUnknowns,
  filterDataByGroup,
  getAmountsByDate,
  sortDataDescending,
  getDates,
  getAmounts,
  getWidthPctShare,
  getWidthHundredK,
  translateXPctShare,
  getMinNumber,
  getMaxNumber,
  filterUnknownsByTimePeriod,
}
