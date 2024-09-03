import HetCardMenu from '../../../styles/HetComponents/HetCardMenu'
import { routeConfigs as methodologyRouteConfigs } from '../methodologyContent/routeConfigs'

export default function MethodologyCardMenu() {
  return (
    <HetCardMenu
      className='sticky top-24 z-almostTop hidden h-min max-w-menu smMd:block'
      routeConfigs={methodologyRouteConfigs}
      ariaLabel='methodology sections'
    />
  )
}
