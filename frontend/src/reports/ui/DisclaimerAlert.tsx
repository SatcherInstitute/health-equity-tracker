import FlagIcon from '@mui/icons-material/Flag'
import { HashLink } from 'react-router-hash-link'
import HetNotice from '../../styles/HetComponents/HetNotice'
import { METHODOLOGY_PAGE_LINK } from '../../utils/internalRoutes'

interface DisclaimerAlertProps {
  className?: string
}

export default function DisclaimerAlert(props: DisclaimerAlertProps) {
  return (
    <div className={props.className ?? ''}>
      <HetNotice
        kind='data-integrity'
        className='m-1 mt-2 border border-reportAlert border-solid text-left text-smallest sm:mx-3 sm:mt-4 sm:text-small'
        icon={<FlagIcon className='hidden sm:inline-block' />}
        title='Major gaps in the data'
      >
        Structural racism and oppression create health inequities, and lead to
        missing data. Our reports reflect the best data we can source, but we're
        working to close these known gaps which, in turn, will help create more
        effective health policies in the United States. Read more about missing
        and misidentified people on our{' '}
        <HashLink to={`${METHODOLOGY_PAGE_LINK}`}>methodology</HashLink>.
      </HetNotice>
    </div>
  )
}
