import HetPagination from '../../../styles/HetComponents/HetPagination'
import { routeConfigs as methodologyRouteConfigs } from '../methodologyContent/routeConfigs'

export default function MethodologyPagination() {
  return (
    <HetPagination routeConfigs={methodologyRouteConfigs} />
  )
}