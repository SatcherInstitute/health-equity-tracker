/**
 * A Filter component styled as a legend which allows user to filter data
 * @param {object[]} data array of timeseries data objects
 * @param {string[]} selectedGroups array of strings which correspond to groups that have been selected by user
 * @param {boolean} isSkinny a flag to determine whether user is viewing app below the mobile breakpoint or with resulting card column in compare mode below mobile breakpoint
 * @param {*} handleClick function that handles user button click
 * @param {*} handleMinMaxClick function that handles user click of MinMax button
 * returns jsx of a div of divs
 */

/* External Imports */

/* Constants */
import { type TrendsData } from './types'
import { COLORS as C } from './constants'
import { type DemographicType } from '../../data/query/Breakdowns'
import { getMinMaxGroups } from '../../data/utils/DatasetTimeUtils'
import {
  AGE,
  ALL,
  type DemographicGroup,
  UNKNOWN_W,
} from '../../data/utils/Constants'
import { het } from '../../styles/DesignTokens'

/* Define type interface */
interface FilterLegendProps {
  data: TrendsData
  selectedGroups: string[]
  handleClick: (group: DemographicGroup | null) => void
  handleMinMaxClick: (arg: any) => void
  groupLabel: string
  isSkinny: boolean
  chartWidth: number
  demographicType: DemographicType
  legendId: string
}

/* Render component */
export function FilterLegend({
  data,
  selectedGroups,
  handleClick,
  handleMinMaxClick,
  demographicType,
  legendId,
}: FilterLegendProps) {
  const isComparing = window.location.href.includes('compare')

  const groupsAreMinMax =
    JSON.stringify(selectedGroups) === JSON.stringify(getMinMaxGroups(data))

  const noGroupsAreFiltered = selectedGroups.length === 0

  return (
    // Legend Wrapper
    <div className='mt-4 font-sansText text-small font-normal'>
      {/* Legend Title & Clear Button */}
      <div className='mb-5 flex	items-center text-left font-sansText font-medium'>
        <p id={legendId}>Select groups:</p>
        {/* Reset to Highest Lowest Averages */}
        <div className='mx-4 flex items-center justify-center rounded-sm border-none border-altGreen '>
          <button
            type='button'
            aria-disabled={groupsAreMinMax}
            className={`rounded-l-sm border p-4 text-altBlack ${
              groupsAreMinMax
                ? 'cursor-default border-altGreen bg-methodologyGreen font-bold'
                : 'cursor-pointer  bg-white hover:bg-methodologyGreen hover:bg-opacity-[0.08]'
            }`}
            aria-label={`Highlight groups with lowest and highest average values over time`}
            onClick={() => {
              handleMinMaxClick(null)
            }} // clear selected groups on click
          >
            {groupsAreMinMax
              ? 'Showing highest / lowest averages'
              : 'Show highest / lowest averages'}
          </button>

          {/* Remove Filters / Show All Button */}
          <button
            type='button'
            aria-label={`Clear demographic filters`}
            aria-disabled={noGroupsAreFiltered}
            className={`rounded-r-sm border p-4 text-altBlack ${
              noGroupsAreFiltered
                ? 'cursor-default border-altGreen bg-methodologyGreen font-bold'
                : 'cursor-pointer bg-white hover:bg-methodologyGreen hover:bg-opacity-[0.08]'
            }`}
            onClick={() => {
              handleClick(null)
            }} // clear selected groups on click
          >
            {noGroupsAreFiltered ? 'Showing all groups' : 'Show all groups'}
          </button>
        </div>
        {/* Options for the "Close" x-character:  ✕×⨯✖× */}
      </div>
      {/* Legend Items Wrapper */}
      <menu
        aria-labelledby={legendId}
        className={`grid auto-cols-auto grid-cols-1 sm:grid-cols-2 ${
          isComparing ? 'md:grid-cols-1 lg:grid-cols-2' : 'lg:grid-cols-3'
        } `}
      >
        {/* Map over groups and create Legend Item for each */}
        {data?.map(([group]) => {
          const groupEnabled = selectedGroups.includes(group)

          const isUnknown = group === UNKNOWN_W
          const gradient = `linear-gradient(30deg, ${het.unknownMapMost}, ${het.unknownMapMid},${het.unknownMapMost})`

          // Legend Item Filter Button
          return (
            <button
              type='button'
              key={`legendItem-${group}`}
              aria-label={`Include ${group}`}
              aria-pressed={groupEnabled}
              className='mb-1.5 mr-5 flex cursor-pointer items-center border-0 bg-transparent p-0 text-start text-altBlack transition-opacity	duration-300 ease-in-out'
              onClick={() => {
                handleClick(group)
              }} // send group name to parent on click
              // If there are selected groups, and the group is not selected, fade out, otherwise full opacity
              style={{
                opacity: !selectedGroups?.length || groupEnabled ? 1 : 0.5, // failing a11y; need minimum opacity .55 ?
              }}
            >
              {/* Legend Item color swatch */}
              <div
                className='mr-1.5	h-4	w-4 shrink-0 rounded-xs border-2 border-dashed border-transparent text-start'
                aria-hidden={true}
                style={{
                  backgroundImage: isUnknown ? gradient : undefined,
                  backgroundColor: isUnknown ? undefined : C(group),
                }}
              />
              {/* Legend Item Label */}
              <div>
                {demographicType === AGE && group !== ALL && 'Ages '}
                {group}
              </div>
            </button>
          )
        })}
      </menu>
    </div>
  )
}
