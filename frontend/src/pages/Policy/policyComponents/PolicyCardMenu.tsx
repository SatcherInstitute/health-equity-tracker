import HetCardMenu from '../../../styles/HetComponents/HetCardMenu'
import { policyRouteConfigs } from '../policyContent/policyRouteConfigs'

export default function PolicyCardMenu() {
  return (
    <HetCardMenu
      className='sticky top-24 z-almost-top hidden h-min max-w-menu smMd:block'
      routeConfigs={policyRouteConfigs}
      ariaLabel='policy context sections'
    />
  )
}
