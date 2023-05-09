import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import { type VariableId } from '../../data/config/MetricConfig'

const MIN_TOP_LABEL_WIDTH = 110

interface SimpleSelectProps<ListItemType> {
  label: string
  optionsMap: Partial<Record<string, ListItemType>>
  selected: ListItemType
  setSelected: (selected: ListItemType) => void
  variableId?: VariableId
}

export default function SimpleSelect<ListItemType>(
  props: SimpleSelectProps<ListItemType>
) {
  function handleChange(event: SelectChangeEvent) {
    props.setSelected(event.target.value as ListItemType)
  }

  function handleMenuItemDisablement(label: string): boolean {
    const hasBlackWomenVarId = props.variableId?.includes('black_women')

    if (hasBlackWomenVarId && label !== 'Age') {
      return true
    }

    return false
  }

  return (
    <FormControl sx={{ m: 1, minWidth: MIN_TOP_LABEL_WIDTH }} size="small">
      <InputLabel id={`${props.label}-select-label`}>{props.label}</InputLabel>
      <Select
        autoWidth
        labelId={`${props.label}-select-label`}
        id={`${props.label}-select`}
        value={props.selected as string}
        label={props.label}
        onChange={handleChange}
      >
        {Object.entries(props.optionsMap).map(([label, id]) => {
          return (
            <MenuItem
              key={label}
              value={id as string}
              disabled={handleMenuItemDisablement(label)}
            >
              {label}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}
