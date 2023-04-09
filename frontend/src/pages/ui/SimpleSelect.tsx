import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import { useState } from 'react'
// import { useMediaQuery, useTheme, type Breakpoint } from '@mui/material'

interface SimpleSelectProps<T> {
  label: string
  optionsMap: Partial<Record<string, T>>
  selected: T
  setSelected: (selected: T) => void
  // firstBreakpoint: Breakpoint // screen size that triggers from layout 1 to layout 2
  // secondBreakpoint: Breakpoint // screen size that triggers from layout 2 to back to layout 1
}

export default function SimpleSelect<T>(props: SimpleSelectProps<T>) {
  const [internalSelected, setInternalSelected] = useState(props.selected)

  const handleChange = (event: SelectChangeEvent) => {
    setInternalSelected(event.target.value as T)
    props.setSelected(event.target.value as T)
  }

  // const theme = useTheme()
  // const pageIsTiny = useMediaQuery(theme.breakpoints.down(props.firstBreakpoint))
  // const pageIsWide = useMediaQuery(theme.breakpoints.up(props.secondBreakpoint))

  // const raceLabel = pageIsWide || pageIsTiny ? 'Race/ethnicity' : 'Race'

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <InputLabel id={`${props.label}-select-label`}>Demographic</InputLabel>
      <Select
        autoWidth
        labelId={`${props.label}-select-label`}
        id={`${props.label}-select`}
        value={internalSelected as string}
        label={`${props.label}-select`}
        onChange={handleChange}
      >
        {Object.entries(props.optionsMap).map(([label, id]) => {
          console.log({ label }, { id })
          return (
            <MenuItem key={label} value={id as string}>
              {label}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}
