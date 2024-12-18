import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../../data/query/Breakdowns'
import HetNotice from '../../styles/HetComponents/HetNotice'
import HetTerm from '../../styles/HetComponents/HetTerm'

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
    <HetNotice id='unknown-bubbles-alert'>
      Missing and unknown data impacts Health Equity. Please consider the impact
      of {props.fullDisplayName} with an unknown {groupTerm}.{' '}
      {props.expanded && (
        <>
          The <HetTerm>unknown percentage</HetTerm> along the bottom of this
          chart expresses the share of total {props.fullDisplayName} per month
          that did not include {groupTerm} information.
        </>
      )}{' '}
      <button
        type='button'
        onClick={changeUnknownState}
        className='cursor-pointer border-0 bg-transparent p-0 text-altGreen underline'
        aria-label={
          'View the share of ' +
          props.fullDisplayName +
          ' with an unknown ' +
          groupTerm
        }
      >
        {!props.expanded ? 'Show unknowns' : 'Hide unknowns'}
      </button>
    </HetNotice>
  )
}
