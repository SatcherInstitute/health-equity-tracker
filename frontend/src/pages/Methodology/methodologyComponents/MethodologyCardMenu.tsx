import HetCardMenu from '../../../styles/HetComponents/HetCardMenu'
import { methodologyRouteConfigs } from '../methodologyContent/methodologyRouteConfigs'

export default function MethodologyCardMenu() {
  return (
    <HetCardMenu
      className='sticky top-24 z-almost-top hidden h-min max-w-menu smplus:block'
      routeConfigs={methodologyRouteConfigs}
      ariaLabel='methodology sections'
    />
  )
}
