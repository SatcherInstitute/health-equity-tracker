import { Link } from 'react-router'
import HetNotice from '../../styles/HetComponents/HetNotice'
import HetTerm from '../../styles/HetComponents/HetTerm'
import { urlMap } from '../../utils/externalUrls'
import { METHODOLOGY_PAGE_LINK } from '../../utils/internalRoutes'

function IncarceratedChildrenLongAlert() {
  return (
    <div>
      <HetNotice
        title='Children in Adult Jails and Prisons'
        kind='health-crisis'
        className='m-2 border border-reportAlert text-left'
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
          <HetTerm>total number of confined children</HetTerm> in adult
          facilities. Read more in{' '}
          <Link to={METHODOLOGY_PAGE_LINK}>our methodology</Link>.
        </p>
      </HetNotice>
    </div>
  )
}

export default IncarceratedChildrenLongAlert
