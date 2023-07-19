import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { reportProviderSteps } from '../../reports/ReportProviderSteps'
import styles from './JumpToSelect.module.scss'

interface JumpToSelectProps {
  offerJumpToAgeAdjustment: boolean
}

export default function JumpToSelect(props: JumpToSelectProps) {
  return (
    <FormControl sx={{ m: 1, minWidth: 110 }} size="small">
      <InputLabel id={`jump-to-select-label`}>Jump to</InputLabel>
      <Select
        autoWidth
        labelId={`jump-to-select-label`}
        id={`jump-to-select`}
        value={' '}
        label={'Jump to'}
      >
        <MenuItem value={' '}>
          <a className={styles.JumpToLink} href="#top">
            Select a card
          </a>
        </MenuItem>
        {Object.entries(reportProviderSteps).map(([stepId, stepInfo]) => {
          if (
            stepId === 'age-adjusted-ratios' &&
            !props.offerJumpToAgeAdjustment
          )
            return null

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
