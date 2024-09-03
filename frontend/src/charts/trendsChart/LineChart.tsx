/**
 * A Line Chart that visualizes data trends over time
 * Uses d3.js to apply data transformations and draw the lines on an SVG
 * @param {object[]} data array of timeseries data objects
 * @param {*} xScale a d3 time series scale function
 * @param {*} yScale a d3 linear scale function
 * returns jsx of an svg group containing paths
 **/

/* External Imports */
import { line, curveMonotoneX } from 'd3'

/* Local Imports */

/* Constants */
import type { GroupData, TrendsData, XScale, YScale } from './types'
import { COLORS as C } from './constants'
import { getPrettyDate } from '../../data/utils/DatasetTimeUtils'
import { UNKNOWN_W } from '../../data/utils/Constants'

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

  return (
    <g tabIndex={0} aria-label='Demographic group trendlines'>
      {data?.map(([group, d]: GroupData) => {
        const dCopy = [...d]

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
        return (
          <path
            aria-label={groupA11yDescription}
            className={`fill-none ${
              isUnknownLine ? 'stroke-5.5' : 'stroke-2.5'
            }`}
            key={`group-${group}`}
            d={lineGen(d as any) ?? ''}
            stroke={C(group)}
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
}
