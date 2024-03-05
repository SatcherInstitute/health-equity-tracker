import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import HetDivider from '../../../styles/HetComponents/HetDivider';
import HetListItemButton from '../../../styles/HetComponents/HetListItemButton';
import {
	BEHAVIORAL_HEALTH_LINK,
	CHRONIC_DISEASE_LINK,
	COVID_19_LINK,
	DATA_METHOD_DEFINITIONS_LINK,
	GLOSSARY_LINK,
	HIV_LINK,
	MEDICATION_UTILIZATION_LINK,
	METRICS_LINK,
	NEW_AGE_ADJUSTMENT_LINK,
	NEW_METHODOLOGY_PAGE_LINK,
	PDOH_LINK,
	RACES_AND_ETHNICITIES_LINK,
	RECOMMENDED_CITATION_LINK,
	SDOH_LINK,
	SOURCES_LINK,
	TOPIC_CATEGORIES_LINK,
	TOPIC_DEFINITIONS_LINK,
} from '../../../utils/internalRoutes';
import { RouteConfig, routeConfigs } from '../methodologyContent/routeConfigs';

interface MethodologyCardMenuProps {
	className?: string;
}

export default function MethodologyCardMenu(props: MethodologyCardMenuProps) {
	return (
		<nav
			aria-label='methodology sections'
			className={`flex flex-col rounded-sm py-0 tracking-normal shadow-raised-tighter ${
				props.className ?? ''
			} `}
		>
			{routeConfigs.map((config) => (
				<HetDesktopMenuItem key={config.path} routeConfig={config} />
			))}
		</nav>
	);
}

interface HetDesktopMenuItemProps {
	routeConfig: RouteConfig;
}

function HetDesktopMenuItem(props: HetDesktopMenuItemProps) {
	return (
		<>
			{props.routeConfig.isTopLevel && <HetDivider />}
			<Link className='no-underline' to={props.routeConfig.path}>
				<HetListItemButton
					className='mx-2 pl-2 font-roboto'
					selected={window.location.pathname === props.routeConfig.path}
					aria-label={props.routeConfig.label}
					option={props.routeConfig.isTopLevel ? 'boldGreen' : 'normalBlack'}
				>
					{props.routeConfig.label}
				</HetListItemButton>
			</Link>
		</>
	);
}
