import { Link } from 'react-router-dom';
import {
    SOURCES_LINK,
    TOPIC_CATEGORIES_LINK,
    BEHAVIORAL_HEALTH_LINK,
    CHRONIC_DISEASE_LINK,
    COVID_19_LINK,
    HIV_LINK,
    PDOH_LINK,
    SDOH_LINK,
    DATA_METHOD_DEFINITIONS_LINK,
    METRICS_LINK,
    TOPIC_DEFINITIONS_LINK,
    RACES_AND_ETHNICITIES_LINK,
    RECOMMENDED_CITATION_LINK,
    NEW_AGE_ADJUSTMENT_LINK,
    NEW_METHODOLOGY_PAGE_LINK,
    GLOSSARY_LINK,
    MEDICATION_UTILIZATION_LINK,
} from '../../../utils/internalRoutes';
import HetListItemButton from '../../../styles/HetComponents/HetListItemButton';
import HetDivider from '../../../styles/HetComponents/HetDivider';
import { ReactNode } from 'react';
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
                    selected={
                        window.location.pathname === props.routeConfig.path
                    }
                    aria-label={props.routeConfig.label}
                    option={
                        props.routeConfig.isTopLevel
                            ? 'boldGreen'
                            : 'normalBlack'
                    }
                >
                    {props.routeConfig.label}
                </HetListItemButton>
            </Link>
        </>
    );
}
