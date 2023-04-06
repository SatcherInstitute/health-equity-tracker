import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import { useState } from 'react'
import { type MadLibId } from '../../utils/MadLibs'

interface ModeSelectProps {
  trackerMode: MadLibId
  setTrackerMode: React.Dispatch<React.SetStateAction<MadLibId>>
}

const trackerModes: MadLibId[] = ['disparity', 'comparegeos', 'comparevars']

export default function ModeSelect(props: ModeSelectProps) {
  const incomingModeIndex: number = trackerModes.indexOf(props.trackerMode)

  const [modeIndex, setModeIndex] = useState(incomingModeIndex)

  const handleChange = (event: SelectChangeEvent) => {
    setModeIndex(+event.target.value)
    const newMode = trackerModes[+event.target.value]
    props.setTrackerMode(newMode)
  }

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <InputLabel id="demo-select-small">Compare</InputLabel>
      <Select
        labelId="demo-select-small"
        id="demo-select-small"
        value={modeIndex as unknown as string}
        label="Compare"
        onChange={handleChange}
      >
        <MenuItem value={0}>Off</MenuItem>
        <MenuItem value={1}>Places</MenuItem>
        <MenuItem value={2}>Topics</MenuItem>
      </Select>
    </FormControl>
  )
}
