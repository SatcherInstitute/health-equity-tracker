import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import type React from 'react'

type Option = {
  value: string
  label: string
}

interface CheckboxDropdownProps {
  options: Option[]
  label: string
  selectedOptions: string[]
  onSelectionChange: (selected: string[]) => void
}

const CheckboxDropdown: React.FC<CheckboxDropdownProps> = ({
  options,
  label,
  selectedOptions,
  onSelectionChange,
}) => {
  const allOptionValues = options.map((option) => option.value)
  const isAllSelected = selectedOptions.length === allOptionValues.length

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event

    if (value[value.length - 1] === 'all') {
      if (isAllSelected) {
        onSelectionChange([])
      } else {
        onSelectionChange(allOptionValues)
      }
      return
    }

    if (value[value.length - 1] === 'clear') {
      onSelectionChange([])
      return
    }

    const updatedSelection =
      typeof value === 'string' ? value.split(',') : value
    onSelectionChange(updatedSelection)
  }

  return (
    <FormControl fullWidth>
      <InputLabel id={`${label}-dropdown-label`} className='bg-white px-2'>
        {label}
      </InputLabel>
      <Select
        labelId={`${label}-dropdown-label`}
        id={`${label}-dropdown`}
        multiple
        value={selectedOptions}
        onChange={handleChange}
        renderValue={(selected) =>
          selected.length === allOptionValues.length
            ? 'All Selected'
            : (selected as string[]).join(', ')
        }
      >
        <MenuItem value='all'>
          <Checkbox
            checked={isAllSelected}
            indeterminate={selectedOptions.length > 0 && !isAllSelected}
          />
          <ListItemText primary='Select All' />
        </MenuItem>
        <MenuItem value='clear'>
          <Checkbox checked={selectedOptions.length === 0} />
          <ListItemText primary='Clear Selections' />
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Checkbox checked={selectedOptions.includes(option.value)} />
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default CheckboxDropdown
