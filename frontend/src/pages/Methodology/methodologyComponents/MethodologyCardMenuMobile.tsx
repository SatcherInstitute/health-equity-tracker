import HetCardMenuMobile from '../../../styles/HetComponents/HetCardMenuMobile'
import { methodologyRouteConfigs } from '../methodologyContent/methodologyRouteConfigs'

export default function MethodologyCardMenuMobile() {
  return (
    <HetCardMenuMobile
      className='smplus:hidden mx-auto my-0 flex w-screen max-w-screen min-w-full justify-center px-0'
      routeConfigs={methodologyRouteConfigs}
      label='Methodology Pages'
    />
  )
}
