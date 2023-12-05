import FlagIcon from '@mui/icons-material/Flag'
import { OLD_METHODOLOGY_PAGE_LINK } from '../../utils/internalRoutes'
import { urlMap } from '../../utils/externalUrls'
import { Link } from 'react-router-dom'
import HetAlert from '../../styles/HetComponents/HetAlert'

function IncarceratedChildrenLongAlert() {
  return (
    <div>
      <HetAlert
        title='Children in Adult Jails and Prisons'
        severity='error'
        className='m-2 border border-report-alert text-left'
        icon={<FlagIcon />}
      >
        <p>
          Although the criminal justice system makes distinctions between adults
          and children, individual states have laws that remove children from
          the protective cover of these distinctions and{' '}
          <a target='_blank' rel='noreferrer' href={urlMap.prisonPolicy}>
            enable the incarceration of children in adult institutions
          </a>
          . Such children are more exposed to physical and sexual abuse, fewer
          age-appropriate services, and worse health outcomes. When reporting on
          incarceration, we highlight the{' '}
          <b>total number of confined children</b> in adult facilities. Read
          more in <Link to={OLD_METHODOLOGY_PAGE_LINK}>our methodology</Link>.
        </p>
      </HetAlert>
    </div>
  )
}

export default IncarceratedChildrenLongAlert
