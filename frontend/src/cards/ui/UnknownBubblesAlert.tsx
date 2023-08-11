import styles from './UnknownBubblesAlert.module.scss'
import {
  type DemographicType,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
} from '../../data/query/Breakdowns'
import { Alert } from '@mui/material'

interface UnknownBubblesAlertProps {
  demographicType: DemographicType
  fullDisplayName: string
  expanded: boolean
  setExpanded: (expanded: boolean) => void
}

export default function UnknownBubblesAlert(props: UnknownBubblesAlertProps) {
  const changeUnknownState = (event: any) => {
    event.preventDefault()
    props.setExpanded(!props.expanded)
  }

  const groupTerm = DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]

  return (
    <Alert severity="info" role="note" id="unknown-bubbles-alert">
      Missing and unknown data impacts Health Equity. Please consider the impact
      of {props.fullDisplayName} with an unknown {groupTerm}.{' '}
      {props.expanded && (
        <>
          The <b>unknown percentage</b> along the bottom of this chart expresses
          the share of total {props.fullDisplayName} per month that did not
          include {groupTerm} information.
        </>
      )}{' '}
      <button
        onClick={changeUnknownState}
        className={styles.UnknownBubblesLink}
        aria-label={
          'View the share of ' +
          props.fullDisplayName +
          ' with an unknown ' +
          groupTerm
        }
      >
        {!props.expanded ? 'Show unknowns' : 'Hide unknowns'}
      </button>
    </Alert>
  )
}
