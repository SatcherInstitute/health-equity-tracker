import HetCardMenu from '../../../styles/HetComponents/HetCardMenu'
import { methodologyRouteConfigs } from '../methodologyContent/methodologyRouteConfigs'

export default function MethodologyCardMenu() {
  return (
    <HetCardMenu
      className='z-almost-top max-w-menu smplus:block sticky top-24 hidden h-min'
      routeConfigs={methodologyRouteConfigs}
      ariaLabel='methodology sections'
    />
  )
}
