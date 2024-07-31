import { ReactNode } from "react";
import { POLICY_PAGE_LINK } from "../../../utils/internalRoutes";
import PolicyPage from "../policyComponents/PolicyPage";

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
		label: 'Policy Context Overview',
		path: POLICY_PAGE_LINK,
		component: PolicyPage,
		subLinks: [],
	},
];
