import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { reportProviderSteps } from '../../reports/ReportProviderSteps'
import styles from './JumpToSelect.module.scss'
// import { useMediaQuery, useTheme, type Breakpoint } from '@mui/material'

export default function JumpToSelect() {
  // const theme = useTheme()
  // const pageIsTiny = useMediaQuery(theme.breakpoints.down(props.firstBreakpoint))
  // const pageIsWide = useMediaQuery(theme.breakpoints.up(props.secondBreakpoint))

  // const raceLabel = pageIsWide || pageIsTiny ? 'Race/ethnicity' : 'Race'

  return (
    <FormControl sx={{ m: 1, minWidth: 110 }} size="small">
      <InputLabel id={`jump-to-select-label`}>Jump to</InputLabel>
      <Select
        autoWidth
        labelId={`jump-to-select-label`}
        id={`jump-to-select`}
        value={'top'}
        label={'Jump to'}
      >
        <MenuItem value={'top'}>
          <a className={styles.JumpToLink} href="#top">
            {'Top'}
          </a>
        </MenuItem>
        {Object.entries(reportProviderSteps).map(([stepId, stepInfo]) => {
          return (
            <MenuItem key={stepId} value={stepId}>
              <a className={styles.JumpToLink} href={`#${stepId}`}>
                {stepInfo.label}
              </a>
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}
