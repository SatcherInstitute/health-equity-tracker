import { Link } from 'react-router'
import HetNotice from '../../styles/HetComponents/HetNotice'
import HetTerm from '../../styles/HetComponents/HetTerm'
import { urlMap } from '../../utils/externalUrls'
import { PDOH_LINK } from '../../utils/internalRoutes'

function IncarceratedChildrenLongAlert() {
  return (
    <div>
      <HetNotice
        title='Children in Adult Jails and Prisons'
        kind='health-crisis'
        className='m-2 border border-report-alert text-left'
      >
        <p>
          Despite criminal justice distinctions between adults and children,
          some states have laws that remove children from these protections and{' '}
          <a target='_blank' rel='noreferrer' href={urlMap.prisonPolicy}>
            enable the incarceration of children in adult institutions
          </a>
          . These children are more exposed to physical and sexual abuse, fewer
          age-appropriate services, and worse health outcomes. Below, we
          highlight the <HetTerm>total number of confined children</HetTerm> in
          adult facilities; read more in{' '}
          <Link to={PDOH_LINK}>our methodology</Link>.
        </p>
      </HetNotice>
    </div>
  )
}

export default IncarceratedChildrenLongAlert
