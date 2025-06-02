import HetCardMenuMobile from '../../../styles/HetComponents/HetCardMenuMobile'
import { policyRouteConfigs } from '../policyContent/policyRouteConfigs'

export default function PolicyCardMenuMobile() {
  return (
    <HetCardMenuMobile
      className='mx-auto my-0 flex w-screen min-w-full max-w-screen justify-center px-0 smplus:hidden'
      routeConfigs={policyRouteConfigs}
      label='Policy Context Pages'
    />
  )
}
