import HetCardMenu from '../../../styles/HetComponents/HetCardMenu'
import { policyRouteConfigs } from '../policyContent/policyRouteConfigs'

export default function PolicyCardMenu() {
  return (
    <HetCardMenu
      className='z-almost-top max-w-menu smplus:block sticky top-24 hidden h-min'
      routeConfigs={policyRouteConfigs}
      ariaLabel='policy context sections'
    />
  )
}
