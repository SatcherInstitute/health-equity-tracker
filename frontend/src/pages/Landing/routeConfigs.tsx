import { ReactNode } from "react";
import { OVERVIEW_TAB } from "../../utils/internalRoutes";
import OverviewTab from "./OverviewTab";


export type RouteConfig = {
	isTopLevel?: boolean;
	label: string;
	path: string;
	component?: () => ReactNode;
	subLinks?: RouteConfig[];
};

export const routeConfigs: RouteConfig[] = [
	{
		isTopLevel: true,
		label: 'Crisis Overview',
		path: OVERVIEW_TAB,
		component: OverviewTab,
		subLinks: [],
	},
];
