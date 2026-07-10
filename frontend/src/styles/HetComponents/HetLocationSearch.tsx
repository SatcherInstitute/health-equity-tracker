import CloseIcon from '@mui/icons-material/Close'
import { Autocomplete, TextField } from '@mui/material'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { USA_DISPLAY_NAME, USA_FIPS } from '../../data/utils/ConstantsGeography'
import { Fips } from '../../data/utils/Fips'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import type { PopoverElements } from '../../utils/hooks/usePopover'
import {
  buildFipsSearchIndex,
  filterAndRankFips,
} from '../../utils/locationSearch'
import {
  type LocationOption,
  loadPlaceIndex,
  locationOptionKey,
  locationOptionLabel,
  type PlaceSearchIndex,
  searchPlaces,
} from '../../utils/placeSearch'
import VirtualizedListbox, {
  createListboxSyncStore,
  ListboxSyncContext,
} from './VirtualizedListbox'

interface HetLocationSearchProps {
  clearRecentLocations: () => void
  options: Fips[]
  onOptionUpdate: (option: string) => void
  popover: PopoverElements
  recentLocations: string[]
  value: string
}

export default function HetLocationSearch(props: HetLocationSearchProps) {
  const visibleRecent = props.recentLocations.filter(
    (code) => code !== props.value,
  )

  const isUsa = props.value === USA_FIPS
  const showUsaShortcut =
    !isUsa && !props.recentLocations.some((code) => code === USA_FIPS)

  const [autoCompleteOpen, setAutoCompleteOpen] = useState(false)
  const isSmAndUp = useIsBreakpointAndUp('sm')

  // City results come from a place index fetched when the search popover
  // mounts (never on page load); until it arrives (or if the fetch fails)
  // the search still works over states and counties.
  const [placeIndex, setPlaceIndex] = useState<PlaceSearchIndex | null>(null)
  useEffect(() => {
    loadPlaceIndex().then(setPlaceIndex, () => {})
  }, [])

  const searchIndex = useMemo(
    () => buildFipsSearchIndex(props.options),
    [props.options],
  )

  // The virtualized listbox needs the highlighted option and current query to
  // keep the highlighted row mounted and reset scroll when results change.
  const [listboxSync] = useState(createListboxSyncStore)

  return (
    <div className='min-w-72 p-5'>
      <h3 className='my-1 font-semibold text-small md:text-title'>
        Search for location
      </h3>
      <ListboxSyncContext.Provider value={listboxSync}>
        <Autocomplete<LocationOption, false, true, false>
          disableClearable={true}
          autoHighlight={true}
          options={props.options}
          filterOptions={(options, { inputValue }) => {
            const fipsResults = filterAndRankFips(
              options as Fips[],
              searchIndex,
              inputValue,
            )
            const cityResults = placeIndex
              ? searchPlaces(placeIndex, inputValue)
              : []
            return [...fipsResults, ...cityResults]
          }}
          groupBy={(option) =>
            option instanceof Fips
              ? option.getFipsCategory()
              : 'Cities (shows containing county)'
          }
          clearOnEscape={true}
          getOptionLabel={locationOptionLabel}
          // The listbox slot receives these raw [props, option] tuples and
          // group params and renders only the visible rows itself.
          renderOption={(optionProps, option) =>
            [optionProps, option] as unknown as ReactNode
          }
          renderGroup={(params) => params as unknown as ReactNode}
          onInputChange={(_e, value) => {
            listboxSync.update({ inputValue: value, highlighted: null })
          }}
          onHighlightChange={(_e, option, reason) =>
            listboxSync.update({
              highlighted: option
                ? {
                    code: locationOptionKey(option),
                    keyboard: reason === 'keyboard',
                  }
                : null,
            })
          }
          open={autoCompleteOpen}
          onOpen={() => setAutoCompleteOpen(true)}
          onClose={() => setAutoCompleteOpen(false)}
          slots={{ listbox: VirtualizedListbox }}
          slotProps={{
            // With the on-screen keyboard open, Popper's flip renders the list
            // above the input and covers it. Always drop down, and on phones
            // keep the list short enough to scroll in the remaining space.
            popper: { modifiers: [{ name: 'flip', enabled: false }] },
            listbox: isSmAndUp ? undefined : { style: { maxHeight: '30vh' } },
          }}
          renderInput={(params) => (
            <TextField
              placeholder='County, state, or territory...'
              /* eslint-disable-next-line */
              autoFocus
              margin='dense'
              variant='outlined'
              {...params}
              slotProps={{
                ...params.slotProps,
                input: {
                  ...params.slotProps?.input,
                  sx: {
                    '& .MuiAutocomplete-endAdornment': {
                      top: '50%',
                      transform: 'translateY(-50%)',
                      position: 'absolute',
                      right: '9px',
                    },
                  },
                },
              }}
            />
          )}
          onChange={(_e, option) => {
            props.onOptionUpdate(
              option instanceof Fips ? option.code : option.countyFips,
            )
            props.popover.close()
          }}
        />
      </ListboxSyncContext.Provider>
      {visibleRecent.length > 0 && (
        <div className='mt-3 border-divider-gray border-t pt-3'>
          <div className='mb-1 flex items-center justify-between'>
            <span className='font-semibold text-alt-dark text-xs uppercase tracking-wide'>
              Recent
            </span>
            <button
              type='button'
              aria-label='Clear recent locations'
              title='Clear recent locations'
              className='cursor-pointer border-0 bg-transparent p-0 text-alt-dark opacity-50 hover:opacity-100'
              onClick={props.clearRecentLocations}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </button>
          </div>
          <ul className='flex flex-col gap-1'>
            {visibleRecent.map((code) => (
              <li key={code}>
                <button
                  type='button'
                  className='cursor-pointer border-0 bg-transparent p-0 text-left text-alt-green text-small hover:underline'
                  onClick={() => {
                    props.onOptionUpdate(code)
                    props.popover.close()
                  }}
                >
                  {new Fips(code).getFullDisplayName()}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {showUsaShortcut && (
        <div className='mt-3 border-divider-gray border-t pt-3'>
          <div className='mb-1 font-semibold text-alt-dark text-xs uppercase tracking-wide'>
            National
          </div>
          <button
            type='button'
            className='cursor-pointer border-0 bg-transparent p-0 text-left text-alt-green text-small hover:underline'
            onClick={() => {
              props.onOptionUpdate(USA_FIPS)
              props.popover.close()
            }}
          >
            {USA_DISPLAY_NAME}
          </button>
        </div>
      )}
    </div>
  )
}
