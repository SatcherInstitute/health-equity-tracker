import HetCardMenuMobile from '../../../styles/HetComponents/HetCardMenuMobile'
import { policyRouteConfigs } from '../policyContent/policyRouteConfigs'

export default function PolicyCardMenuMobile() {
  return (
    <HetCardMenuMobile
      className='smplus:hidden mx-auto my-0 flex w-screen max-w-screen min-w-full justify-center px-0'
      routeConfigs={policyRouteConfigs}
      label='Policy Context Pages'
    />
  )
}
