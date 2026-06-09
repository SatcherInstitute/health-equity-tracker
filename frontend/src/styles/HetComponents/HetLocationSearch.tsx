import { Autocomplete, TextField } from '@mui/material'
import { useState } from 'react'
import { USA_DISPLAY_NAME, USA_FIPS } from '../../data/utils/ConstantsGeography'
import type { Fips } from '../../data/utils/Fips'
import type { PopoverElements } from '../../utils/hooks/usePopover'
import { useRecentLocations } from '../../utils/hooks/useRecentLocations'

interface HetLocationSearchProps {
  options: Fips[]
  onOptionUpdate: (option: string) => void
  popover: PopoverElements
  value: string
}

export default function HetLocationSearch(props: HetLocationSearchProps) {
  const { recentLocations, addRecentLocation } = useRecentLocations()
  const visibleRecent = recentLocations.filter(
    (loc) => loc.code !== props.value,
  )

  function handleUsaButton() {
    addRecentLocation(USA_FIPS, USA_DISPLAY_NAME)
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
  const showUsaShortcut =
    !isUsa && !recentLocations.some((loc) => loc.code === USA_FIPS)

  return (
    <div className='min-w-72 p-5'>
      <h3 className='my-1 font-semibold text-small md:text-title'>
        Search for location
      </h3>
      <Autocomplete
        disableClearable={true}
        autoHighlight={true}
        options={props.options}
        groupBy={(option) => option.getFipsCategory()}
        clearOnEscape={true}
        getOptionLabel={(fips) => fips.getFullDisplayName()}
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
            placeholder='County, state, or territory...'
            /* eslint-disable-next-line */
            autoFocus
            margin='dense'
            variant='outlined'
            onChange={updateTextBox}
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
          addRecentLocation(fips.code, fips.getFullDisplayName())
          props.onOptionUpdate(fips.code)
          setTextBoxValue('')
          props.popover.close()
        }}
      />
      {visibleRecent.length > 0 && (
        <div className='mt-3 border-divider-gray border-t pt-3'>
          <p className='mb-1 font-semibold text-alt-dark text-xs uppercase tracking-wide'>
            Recent
          </p>
          <ul className='flex flex-col gap-1'>
            {visibleRecent.map((loc) => (
              <li key={loc.code}>
                <button
                  type='button'
                  className='cursor-pointer border-0 bg-transparent p-0 text-left text-alt-green text-small underline hover:no-underline'
                  onClick={() => {
                    props.onOptionUpdate(loc.code)
                    props.popover.close()
                  }}
                >
                  {loc.displayName}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {showUsaShortcut && (
        <div className='mt-3 border-divider-gray border-t pt-3'>
          <p className='mb-1 font-semibold text-alt-dark text-xs uppercase tracking-wide'>
            National
          </p>
          <button
            type='button'
            className='cursor-pointer border-0 bg-transparent p-0 text-left text-alt-green text-small underline hover:no-underline'
            onClick={handleUsaButton}
          >
            the United States
          </button>
        </div>
      )}
    </div>
  )
}
