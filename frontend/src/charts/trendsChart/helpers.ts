import { ascending, curveMonotoneX, descending, line, max, min } from 'd3'
import { getPrettyDate } from '../../data/utils/DatasetTimeUtils'
import { CONFIG } from './constants'
import type {
  GroupData,
  TimeSeries,
  TrendsData,
  UnknownData,
  XScale,
  YScale,
} from './types'

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
      .sort(([, aData]: GroupData, [_group, bData]: GroupData) =>
        descending(
          getAmountsByDate(aData, selectedDate),
          getAmountsByDate(bData, selectedDate),
        ),
      ) || d
  )
}

/* Returns the highest absolute value amount (y value) at a given date (x value) */
function getMaxNumberForDate(data: TrendsData, selectedDate: string | null) {
  const numbers = data.flatMap(([_group, d]) =>
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
  if (maxNumber === 0) return 0

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

function hasNonZeroUnknowns(data: TimeSeries | undefined) {
  return data?.some(([, percent]) => percent > 0) ?? false
}

const createLineGenerator = (xScale: XScale, yScale: YScale) => {
  return line<[string, number]>()
    .defined(
      ([date, amount]) =>
        date !== null &&
        date !== undefined &&
        amount !== undefined &&
        amount !== null,
    )
    .x(([date]) => xScale(new Date(date)) ?? 0)
    .y(([_, amount]) => yScale(amount) ?? 0)
    .curve(curveMonotoneX)
}

const splitIntoConsecutiveSegments = (
  points: [string, number][],
  keepOnlyElectionYears?: boolean,
) => {
  const maxYearGap = keepOnlyElectionYears ? 4 : 1 // TODO: might need to handle more than just 4 or 1 yearly data based on the metrics timeSeriesCadence

  const sortedPoints = [...points].sort(
    (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime(),
  )

  const validPoints = sortedPoints.filter(
    ([date, amount]) => date != null && amount != null,
  )

  if (validPoints.length <= 1) return [validPoints]

  const segments: [string, number][][] = []
  let currentSegment: [string, number][] = [validPoints[0]]

  for (let i = 1; i < validPoints.length; i++) {
    const prevDate = new Date(validPoints[i - 1][0])
    const currDate = new Date(validPoints[i][0])
    const yearDiff = currDate.getFullYear() - prevDate.getFullYear()

    if (yearDiff <= maxYearGap) {
      currentSegment.push(validPoints[i])
    } else {
      segments.push(currentSegment)
      currentSegment = [validPoints[i]]
    }
  }

  if (currentSegment.length > 0) {
    segments.push(currentSegment)
  }

  return segments
}

const hasDataGaps = (segments: [string, number][][]) => {
  return segments.length > 1 || segments.some((segment) => segment.length === 1)
}

const getGroupAccessibilityDescription = (
  group: string,
  sortedData: [string, number][],
  valuesArePct: boolean,
) => {
  const minValueForGroup = sortedData[0]?.[1]
  const maxValueForGroup = sortedData[sortedData.length - 1]?.[1]

  const lowestDates = sortedData
    .filter((row) => row[1] === minValueForGroup)
    .map((row) => getPrettyDate(row[0]))

  const highestDates = sortedData
    .filter((row) => row[1] === maxValueForGroup)
    .map((row) => getPrettyDate(row[0]))

  const optionalPct = valuesArePct ? '%' : ''

  return `${group}: lowest value ${minValueForGroup}${optionalPct} in ${lowestDates.join(
    ', ',
  )} and highest value ${maxValueForGroup}${optionalPct} in ${highestDates.join(
    ', ',
  )}`
}

export {
  createLineGenerator,
  filterDataByGroup,
  filterUnknownsByTimePeriod,
  getAmounts,
  getAmountsByDate,
  getDates,
  getGroupAccessibilityDescription,
  getMaxNumber,
  getMinNumber,
  getWidthHundredK,
  getWidthPctShare,
  hasDataGaps,
  hasNonZeroUnknowns,
  sortDataDescending,
  splitIntoConsecutiveSegments,
  translateXPctShare,
}
