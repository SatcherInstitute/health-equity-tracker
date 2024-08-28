import HetCardMenu from '../../../styles/HetComponents/HetCardMenu';
import { routeConfigs as policyRouteConfigs } from '../policyContent/routeConfigs'

export default function PolicyCardMenu() {
	return (
		<HetCardMenu
			className='sticky top-24 z-almostTop hidden h-min max-w-menu smMd:block'
			routeConfigs={policyRouteConfigs}
			ariaLabel='policy context sections'
		/>
	);
}