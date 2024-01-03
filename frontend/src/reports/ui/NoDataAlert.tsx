import HetNotice from '../../styles/HetComponents/HetNotice'
import { type DropdownVarId } from '../../data/config/MetricConfig'

interface NoDataAlertProps {
  dropdownVarId: DropdownVarId
  className?: string
}

function NoDataAlert(props: NoDataAlertProps) {
  return (
    <div className='w-5/12'>
      <HetNotice kind='health-crisis'>
        This data is not currently available in the Health Equity Tracker, but
        will be coming soon.
      </HetNotice>
      <HetNotice>
        Do you have information on {props.dropdownVarId} at the state or local
        level?
        <a
          style={{
            padding: '0',
            paddingLeft: '5px',
            paddingRight: '5px',
            background: 'none',
            textDecoration: 'underline',
          }}
          href='mailto:info@healthequitytracker.org'
        >
          We would love to hear from you.
        </a>
      </HetNotice>
    </div>
  )
}

export default NoDataAlert
