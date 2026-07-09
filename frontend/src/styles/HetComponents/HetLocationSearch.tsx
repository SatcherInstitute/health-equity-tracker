import CloseIcon from '@mui/icons-material/Close'
import { Autocomplete, TextField } from '@mui/material'
import { useMemo, useState } from 'react'
import { USA_DISPLAY_NAME, USA_FIPS } from '../../data/utils/ConstantsGeography'
import { Fips } from '../../data/utils/Fips'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import type { PopoverElements } from '../../utils/hooks/usePopover'
import {
  buildFipsSearchIndex,
  filterAndRankFips,
} from '../../utils/locationSearch'

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

  const searchIndex = useMemo(
    () => buildFipsSearchIndex(props.options),
    [props.options],
  )

  return (
    <div className='min-w-72 p-5'>
      <h3 className='my-1 font-semibold text-small md:text-title'>
        Search for location
      </h3>
      <Autocomplete
        disableClearable={true}
        autoHighlight={true}
        options={props.options}
        filterOptions={(options, { inputValue }) =>
          filterAndRankFips(options, searchIndex, inputValue)
        }
        groupBy={(option) => option.getFipsCategory()}
        clearOnEscape={true}
        getOptionLabel={(fips) => fips.getFullDisplayName()}
        renderOption={(optionProps, fips: Fips) => (
          <li {...optionProps} key={optionProps.key}>
            {fips.getFullDisplayName()}
          </li>
        )}
        open={autoCompleteOpen}
        onOpen={() => setAutoCompleteOpen(true)}
        onClose={() => setAutoCompleteOpen(false)}
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
        onChange={(_e, fips) => {
          props.onOptionUpdate(fips.code)
          props.popover.close()
        }}
      />
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
