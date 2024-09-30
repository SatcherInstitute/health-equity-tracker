import HetCardMenuMobile from '../../../styles/HetComponents/HetCardMenuMobile'
import { methodologyRouteConfigs } from '../methodologyContent/methodologyRouteConfigs'

export default function MethodologyCardMenuMobile() {
  return (
    <HetCardMenuMobile
      className='smMd:hidden max-w-screen min-w-full w-screen mx-auto my-0 px-0 flex justify-center'
      routeConfigs={methodologyRouteConfigs}
      label='Methodology Pages'
    />
  )
}
