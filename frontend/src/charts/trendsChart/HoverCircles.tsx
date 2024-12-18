/**
 * A group of circles that appear on hover
 * Uses d3.js to apply data transformations and draw circles on an SVG
 * @param {object[]} data array of timeseries data objects
 * @param {*} yScale a d3 linear scale function
 * @param {string[]} selectedGroups array of strings which correspond to groups that have been selected by user
 * returns jsx of an svg group parent of many circle children distributed along an y-axis
 */

/* External Imports */

/* Constants */
import { getAmountsByDate } from './helpers'
import type { TrendsData, YScale } from './types'

import type { DemographicGroup } from '../../data/utils/Constants'
import { het } from '../../styles/DesignTokens'
/* Helpers */
import { COLORS as C } from './constants'

/* Define type interface */
interface HoverCirclesProps {
  data: TrendsData
  yScale: YScale
  selectedDate: string | null
}

/* Render component */
export function HoverCircles({
  data,
  yScale,
  selectedDate,
}: HoverCirclesProps) {
  return (
    <g>
      {/* iterate over data and draw circle for each group */}
      {data?.map(
        ([group, d]: [DemographicGroup, Array<[string, number]>], i) => {
          return (
            <g key={`hoverCircleGroup-${i}`}>
              {/* only append circle if data exists for this group & date */}
              {(getAmountsByDate(d, selectedDate) ||
                getAmountsByDate(d, selectedDate) === 0) && (
                <>
                  <circle
                    // tabIndex={0}
                    className='transition-opacity delay-300 duration-200 ease-linear'
                    r={4}
                    // use transform instead of cy to apply css transitions
                    // note - x positioning is handled by parent
                    transform={`translate(0,${
                      yScale(getAmountsByDate(d, selectedDate)) ?? 0
                    })`}
                    fill={C(group)}
                    stroke={het.white}
                  />
                </>
              )}
            </g>
          )
        },
      )}
    </g>
  )
}
