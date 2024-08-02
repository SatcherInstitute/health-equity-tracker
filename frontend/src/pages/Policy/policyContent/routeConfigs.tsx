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
	{
		isTopLevel: true,
		label: 'Crisis Overview',
		path: ,
		component: ,
		subLinks: [
			{
				label: 'Understanding the Crisis of Gun Violence in Atlanta',
				path: '#introduction',
			},
			{
				label: 'Background',
				path: '#background',
			},
		],
	},
	{
		isTopLevel: true,
		label: 'Data Collection',
		path: ,
		component: ,
		subLinks: [
			{
				label: `CDC's WISQARS™`,
				path: '#source-profile',
			},
			{
				label: 'Key Metrics',
				path: '#key-metrics',
			},
			{
				label: 'Data Limitations',
				path: '#data-limitations',
			},
			{
				label: 'Available Data',
				path: '#available-data',
			},
			{
				label: 'Fatality Definitions',
				path: '#fatality-definitions',
			},
		],
	},
	{
		isTopLevel: true,
		label: 'Addressing Inequities',
		path: ,
		component: ,
		subLinks: [
			{
				label: 'Health Inequities Defined',
				path: '#health-inequities-definition',
			},
			{
				label: `Georgia's Youth Fatality Rates`,
				path: '#ga-youth-fatalities',
			},
			{
				label: `Georgia's Homicide Rates`,
				path: '#ga-homicides',
			},
			{
				label: 'Economic Inequality',
				path: '#economic-inequality',
			},
			{
				label: 'Educational Opportunities',
				path: '#educational-opportunities',
			},
			{
				label: 'Racial and Social Justice',
				path: '#racial-and-social-justice',
			},
			{
				label: `Georgia's Suicide Rates`,
				path: '#ga-suicides',
			},
			{
				label: 'Mental Health Services',
				path: '#mental-health-services',
			},
			{
				label: 'Community Engagement',
				path: '#community-engagement',
			},
		],
	},
	{
		isTopLevel: true,
		label: 'Current Efforts',
		path: ,
		component: ,
		subLinks: [
			{
				label: 'Intervention Efforts at the City Level',
				path: '#city-level-interventions',
			},
			{
				label: 'Intervention Efforts at the County Level',
				path: '#county-level-interventions',
			},
		],
	},
	{
		isTopLevel: true,
		label: 'Reform Opportunities',
		path: ,
		component: ,
		subLinks: [
			{
				label: 'Reform Opportunities at the County and City Levels',
				path: '#city-and-county-level-reform-opportunities',
			},
			{
				label: 'Call to Action for Policy Changes',
				path: '#call-to-action-for-policy-changes',
			},
		],
	},
	{
		isTopLevel: true,
		label: 'How to Use the Data',
		path: ,
		component: ,
		subLinks: [
			{
				label: 'HET Data Visualization Maps and Charts',
				path: '#het-data-visualizations',
			},
			{
				label: 'Rate Choropleth Map',
				path: '#rate-choropleth-map',
			},
			{
				label: 'Rates Over Time Chart',
				path: '#rates-over-time-chart',
			},
			{
				label: 'Rate Bar Chart',
				path: '#rate-bar-chart',
			},
			{
				label: 'Unknown Demographic Choropleth Map',
				path: '#unknown-demographic-choropleth-map',
			},
			{
				label: 'Relative Inequity Chart',
				path: '#relative-inequity-chart',
			},
			{
				label: 'Population vs. Distribution Stacked Bar Chart',
				path: '#population-vs-distribution-stacked-bar-chart',
			},
			{
				label: 'Breakdown Summary Data Table',
				path: '#breakdown-summary-data-table',
			},
		],
	},
	{
		isTopLevel: true,
		label: 'FAQs',
		path: ,
		component: ,
		subLinks: [],
	},
];
