import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import { Tooltip } from '@mui/material'

const MIN_TOP_LABEL_WIDTH = 110

interface SimpleSelectProps<ListItemType> {
  label: string
  optionsMap: Partial<Record<string, ListItemType>>
  disabledOptions?: string[][]
  selected: ListItemType
  setSelected: (selected: ListItemType) => void
}

export default function SimpleSelect<ListItemType>(
  props: SimpleSelectProps<ListItemType>,
) {
  function handleChange(event: SelectChangeEvent) {
    props.setSelected(event.target.value as ListItemType)
  }

  const value = Object.values(props.optionsMap).includes(props.selected)
    ? props.selected
    : ''

  const safeLabel = props.label.replace(' ', '-')
  const labelId = `${safeLabel}-select-label`
  const id = `${safeLabel}-select`

  return (
    <FormControl sx={{ m: 1, minWidth: MIN_TOP_LABEL_WIDTH }} size='small'>
      <InputLabel id={labelId}>{props.label}</InputLabel>
      <Select
        autoWidth
        labelId={labelId}
        id={id}
        value={value as string}
        label={props.label}
        onChange={handleChange}
        defaultValue=''
      >
        {Object.entries(props.optionsMap).map(([label, id]) => {
          return (
            <MenuItem key={label} value={id as string}>
              {label}
            </MenuItem>
          )
        })}
        {props?.disabledOptions?.map(([disabledOption, disabledReason]) => {
          return (
            <Tooltip
              key={disabledOption}
              title={`${disabledOption} ${disabledReason}`}
              placement={'right-end'}
            >
              <span>
                <MenuItem disabled value=''>
                  {disabledOption}
                </MenuItem>
              </span>
            </Tooltip>
          )
        })}
      </Select>
    </FormControl>
  )
}
