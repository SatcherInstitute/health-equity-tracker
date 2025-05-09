/**
 * A Line Chart that visualizes data trends over time
 * Uses d3.js to apply data transformations and draw the lines on an SVG
 * @param {object[]} data array of timeseries data objects
 * @param {*} xScale a d3 time series scale function
 * @param {*} yScale a d3 linear scale function
 * returns jsx of an svg group containing paths
 **/

/* External Imports */
import { curveMonotoneX, line } from 'd3'

/* Local Imports */

import { UNKNOWN_W } from '../../data/utils/Constants'
import { getPrettyDate } from '../../data/utils/DatasetTimeUtils'
import { COLORS as C } from './constants'
/* Constants */
import type { GroupData, TrendsData, XScale, YScale } from './types'

/* Define type interface */
interface LineChartProps {
  data: TrendsData
  xScale: XScale
  yScale: YScale
  valuesArePct: boolean
}

/* Render component */
export function LineChart({
  data,
  xScale,
  yScale,
  valuesArePct,
}: LineChartProps) {
  // Generate line path
  const lineGen = line()
    // should prevent interpolation when date or delta is undefined
    .defined(
      ([date, amount]) =>
        date !== null &&
        date !== undefined &&
        amount !== undefined &&
        amount !== null,
    )
    // assigns x-value
    .x(([date]) => xScale(new Date(date)) ?? 0)
    // assigns y-value
    .y(([_, amount]) => yScale(amount) ?? 0)
    // applies curve generator
    .curve(curveMonotoneX)

  // Helper function to split data into consecutive segments
  const splitIntoConsecutiveSegments = (points: [string, number][]) => {
    const validPoints = points.filter(
      ([date, amount]) => date != null && amount != null,
    )

    if (validPoints.length <= 1) return [validPoints]

    // Sort points by date
    const sortedPoints = [...validPoints].sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime(),
    )

    const segments: [string, number][][] = []
    let currentSegment: [string, number][] = [sortedPoints[0]]

    for (let i = 1; i < sortedPoints.length; i++) {
      const prevDate = new Date(sortedPoints[i - 1][0])
      const currDate = new Date(sortedPoints[i][0])
      const yearDiff = currDate.getFullYear() - prevDate.getFullYear()

      if (yearDiff <= 1) {
        // Points are consecutive, add to current segment
        currentSegment.push(sortedPoints[i])
      } else {
        // Points are not consecutive, start new segment
        segments.push(currentSegment)
        currentSegment = [sortedPoints[i]]
      }
    }

    // Add the last segment
    if (currentSegment.length > 0) {
      segments.push(currentSegment)
    }

    return segments
  }

  return (
    <g tabIndex={0} aria-label='Demographic group trendlines'>
      {data?.map(([group, d]: GroupData) => {
        // Filter out null/undefined values
        const validData = d.filter(
          ([date, amount]) => date != null && amount != null,
        )

        const dCopy = [...validData]
        const sortedDataForGroup = dCopy.sort((a, b) => a[1] - b[1])
        const minValueForGroup = sortedDataForGroup[0]?.[1]
        const maxValueForGroup =
          sortedDataForGroup[sortedDataForGroup.length - 1]?.[1]

        const lowestDatesForGroup = sortedDataForGroup
          .filter((row) => row[1] === minValueForGroup)
          .map((row) => getPrettyDate(row[0]))
        const highestDatesForGroup = sortedDataForGroup
          .filter((row) => row[1] === maxValueForGroup)
          .map((row) => getPrettyDate(row[0]))

        const optionalPct = valuesArePct ? '%' : ''

        const groupA11yDescription = `${group}: lowest value ${minValueForGroup}${optionalPct} in ${lowestDatesForGroup.join(
          ', ',
        )} and highest value ${maxValueForGroup}${optionalPct} in ${highestDatesForGroup.join(
          ', ',
        )}`

        const isUnknownLine = group === UNKNOWN_W
        const segments = splitIntoConsecutiveSegments(validData)

        return (
          <g key={`group-${group}`} aria-label={groupA11yDescription}>
            <title>{groupA11yDescription}</title>
            {/* Render all segments as a single continuous line */}
            {segments.map((segment, index) => {
              // For single points, create a short horizontal line
              if (segment.length === 1) {
                const [date, amount] = segment[0]
                const x = xScale(new Date(date))
                const y = yScale(amount)
                if (x === undefined || y === undefined) return null

                const lineLength = 20 // Length of the horizontal line segment
                return (
                  <line
                    key={`segment-${index}`}
                    x1={x - lineLength / 2}
                    y1={y}
                    x2={x + lineLength / 2}
                    y2={y}
                    stroke={C(group)}
                    strokeWidth={isUnknownLine ? 5.5 : 2.5}
                    style={
                      isUnknownLine
                        ? { strokeLinecap: 'butt', stroke: 'url(#gradient)' }
                        : { strokeLinecap: 'round' }
                    }
                  />
                )
              }

              // For multiple points, render a line
              return (
                <path
                  key={`segment-${index}`}
                  className={`fill-none ${
                    isUnknownLine ? 'stroke-5.5' : 'stroke-2.5'
                  }`}
                  d={lineGen(segment as any) ?? ''}
                  stroke={C(group)}
                  strokeDasharray='none'
                  style={
                    isUnknownLine
                      ? { strokeLinecap: 'butt', stroke: 'url(#gradient)' }
                      : { strokeLinecap: 'round' }
                  }
                />
              )
            })}
            {/* Connect segments with dashed lines if there are gaps */}
            {segments.length > 1 &&
              segments.map((segment, index) => {
                if (index === segments.length - 1) return null // Skip last segment

                const nextSegment = segments[index + 1]
                const lastPoint = segment[segment.length - 1]
                const firstPoint = nextSegment[0]

                // Check if there's a gap
                const yearDiff =
                  new Date(firstPoint[0]).getFullYear() -
                  new Date(lastPoint[0]).getFullYear()
                if (yearDiff <= 1) return null // No gap, skip

                // Create a line connecting the segments
                return (
                  <path
                    key={`gap-${index}`}
                    className={`fill-none ${
                      isUnknownLine ? 'stroke-5.5' : 'stroke-2.5'
                    }`}
                    d={lineGen([lastPoint, firstPoint] as any) ?? ''}
                    stroke={C(group)}
                    strokeDasharray='4,4'
                    style={
                      isUnknownLine
                        ? { strokeLinecap: 'butt', stroke: 'url(#gradient)' }
                        : { strokeLinecap: 'round' }
                    }
                  />
                )
              })}
          </g>
        )
      })}
    </g>
  )
}
