import FlagIcon from '@mui/icons-material/Flag'
import { OLD_METHODOLOGY_PAGE_LINK } from '../../utils/internalRoutes'
import { HashLink } from 'react-router-hash-link'
import HetAlert from '../../styles/HetComponents/HetAlert'

function DisclaimerAlert() {
  return (
    <div>
      <HetAlert
        severity='warning'
        className='m-1 mt-2 border border-solid border-report-alert text-left text-smallest sm:mx-3 sm:mt-4 sm:text-small'
        icon={<FlagIcon className='hidden sm:inline-block' />}
        title='Major gaps in the data'
      >
        Structural racism and oppression create health inequities, and lead to
        missing data. Our reports reflect the best data we can source, but we're
        working to close these known gaps which, in turn, will help create more
        effective health policies in the United States. Read more about missing
        and misidentified people on our{' '}
        <HashLink to={`${OLD_METHODOLOGY_PAGE_LINK}`}>methodology</HashLink>.
      </HetAlert>
    </div>
  )
}

export default DisclaimerAlert
