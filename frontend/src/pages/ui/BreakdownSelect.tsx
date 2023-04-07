import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import { useState } from 'react'
import { type BreakdownVar } from '../../data/query/Breakdowns'
import { useMediaQuery, useTheme } from '@mui/material'

interface DemographicSelectProps {
  trackerDemographic: BreakdownVar
  setDemoWithParam: (demographic: BreakdownVar) => void
}

const trackerDemographics: BreakdownVar[] = ['race_and_ethnicity', 'sex', 'age']

export default function DemographicSelect(props: DemographicSelectProps) {
  const incomingModeIndex: number = trackerDemographics.indexOf(
    props.trackerDemographic
  )

  const [modeIndex, setModeIndex] = useState(incomingModeIndex)

  const handleChange = (event: SelectChangeEvent) => {
    setModeIndex(+event.target.value)
    const newMode = trackerDemographics[+event.target.value]
    props.setDemoWithParam(newMode)
  }

  const theme = useTheme()
  const pageIsWide = useMediaQuery(theme.breakpoints.up('lg'))
  const raceLabel = pageIsWide ? 'Race/ethnicity' : 'Race'

  return (
    <FormControl sx={{ m: 1, minWidth: 60 }} size="small">
      <InputLabel id="demographic-select-label">Demographic</InputLabel>
      <Select
        labelId="demographic-select-label"
        id="demographic-select"
        value={modeIndex as unknown as string}
        label="Demographic"
        onChange={handleChange}
      >
        <MenuItem value={0}>{raceLabel}</MenuItem>
        <MenuItem value={1}>Sex</MenuItem>
        <MenuItem value={2}>Age</MenuItem>
      </Select>
    </FormControl>
  )
}
