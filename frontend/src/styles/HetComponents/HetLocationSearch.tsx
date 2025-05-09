import { Autocomplete, ListSubheader, TextField } from '@mui/material'
import { useMemo, useState } from 'react'
import { USA_DISPLAY_NAME, USA_FIPS } from '../../data/utils/ConstantsGeography'
import type { Fips } from '../../data/utils/Fips'
import type { PopoverElements } from '../../utils/hooks/usePopover'
import { clearRecentLocations } from '../../utils/recentLocations'

interface HetLocationSearchProps {
  options: Fips[]
  onOptionUpdate: (option: string) => void
  popover: PopoverElements
  value: string
  recentLocations: Fips[]
}

type GroupKey = 'recent_locations' | 'National' | 'States' | 'Territories'

export default function HetLocationSearch(props: HetLocationSearchProps) {
  function handleUsaButton() {
    props.onOptionUpdate(USA_FIPS)
    props.popover.close()
  }

  const [, setTextBoxValue] = useState('')
  const updateTextBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextBoxValue(event.target.value)
  }

  const [autoCompleteOpen, setAutoCompleteOpen] = useState(false)
  const openAutoComplete = () => {
    setAutoCompleteOpen(true)
  }

  const closeAutoComplete = () => {
    setAutoCompleteOpen(false)
  }

  const isUsa = props.value === '00'

  // Sort options to ensure consistent grouping
  const sortedOptions = useMemo(() => {
    const getGroup = (option: Fips): string => {
      if (props.recentLocations.some((recent) => recent.code === option.code)) {
        return 'recent_locations'
      }
      return option.getFipsCategory()
    }

    // Define the order of groups
    const groupOrder: Record<GroupKey, number> = {
      recent_locations: 0,
      National: 1,
      States: 2,
      Territories: 3,
    }

    return [...props.options].sort((a, b) => {
      const groupA = getGroup(a)
      const groupB = getGroup(b)

      // If both groups are in our predefined order, use that
      if (groupA in groupOrder && groupB in groupOrder) {
        return groupOrder[groupA as GroupKey] - groupOrder[groupB as GroupKey]
      }

      // If only one is in our predefined order, it comes first
      if (groupA in groupOrder) return -1
      if (groupB in groupOrder) return 1

      // For county groups, sort by state/territory name
      return groupA.localeCompare(groupB)
    })
  }, [props.options, props.recentLocations])

  const handleClearRecent = () => {
    clearRecentLocations()
    props.popover.close()
  }

  return (
    <div className='p-5'>
      <h3 className='my-1 font-semibold text-small md:text-title'>
        Search for location
      </h3>

      <Autocomplete
        disableClearable={true}
        autoHighlight={true}
        options={sortedOptions}
        groupBy={(option) => {
          // If it's a recent location, group it under "Recent Locations"
          if (
            props.recentLocations.some((recent) => recent.code === option.code)
          ) {
            return 'recent_locations' // Use a unique key for recent locations
          }
          return option.getFipsCategory()
        }}
        clearOnEscape={true}
        getOptionLabel={(fips) => fips.getFullDisplayName()}
        isOptionEqualToValue={(fips) => fips.code === props.value}
        renderOption={(props, fips: Fips) => {
          return (
            <li {...props} key={props.key}>
              {fips.getFullDisplayName()}
            </li>
          )
        }}
        open={autoCompleteOpen}
        onOpen={openAutoComplete}
        onClose={closeAutoComplete}
        renderInput={(params) => (
          <TextField
            placeholder=''
            /* eslint-disable-next-line */
            autoFocus
            margin='dense'
            variant='outlined'
            onChange={updateTextBox}
            {...params}
          />
        )}
        onChange={(_e, fips) => {
          props.onOptionUpdate(fips.code)
          setTextBoxValue('')
          props.popover.close()
        }}
        renderGroup={(params) => (
          <div key={params.group}>
            <ListSubheader className='flex items-center justify-between'>
              <span>
                {params.group === 'recent_locations'
                  ? 'Recent Locations'
                  : params.group}
              </span>
              {params.group === 'recent_locations' &&
                props.recentLocations.length > 0 && (
                  <button
                    type='button'
                    onClick={handleClearRecent}
                    className='cursor-pointer border-0 bg-transparent text-altDark text-smallest hover:underline'
                  >
                    Clear
                  </button>
                )}
            </ListSubheader>
            {params.children}
          </div>
        )}
      />
      <span className='font-light text-greyDark text-small italic'>
        County, state, territory, or{' '}
        {isUsa ? (
          USA_DISPLAY_NAME
        ) : (
          <button
            type='button'
            className='cursor-pointer border-0 bg-transparent p-0 text-altGreen italic underline'
            onClick={handleUsaButton}
          >
            United States
          </button>
        )}
        . Some source data is unavailable at county and territory levels.
      </span>
    </div>
  )
}
