import { Autocomplete, TextField } from '@mui/material'
import { useState } from 'react'
import { USA_DISPLAY_NAME, USA_FIPS } from '../../data/utils/ConstantsGeography'
import type { Fips } from '../../data/utils/Fips'
import type { PopoverElements } from '../../utils/hooks/usePopover'

interface HetLocationSearchProps {
  options: Fips[]
  onOptionUpdate: (option: string) => void
  popover: PopoverElements
  value: string
}

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

  return (
    <div className='p-5'>
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
      />
      <span className='font-light text-grey-dark text-small italic'>
        County, state, territory, or{' '}
        {isUsa ? (
          USA_DISPLAY_NAME
        ) : (
          <button
            type='button'
            className='cursor-pointer border-0 bg-transparent p-0 text-alt-green italic underline'
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
