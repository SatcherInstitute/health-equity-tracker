import HetCardMenuMobile from '../../../styles/HetComponents/HetCardMenuMobile'
import { methodologyRouteConfigs } from '../methodologyContent/methodologyRouteConfigs'

export default function MethodologyCardMenuMobile() {
  return (
    <HetCardMenuMobile
      className='mx-auto my-0 flex w-screen min-w-full max-w-screen justify-center px-0 smplus:hidden'
      routeConfigs={methodologyRouteConfigs}
      label='Methodology Pages'
    />
  )
}
