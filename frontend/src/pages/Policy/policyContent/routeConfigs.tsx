import {
  CRISIS_OVERVIEW_TAB,
  CURRENT_EFFORTS_TAB,
  DATA_COLLECTION_TAB,
  FAQS_TAB,
  GUN_VIOLENCE_POLICY,
  HOW_TO_USE_THE_DATA_TAB,
  OUR_FINDINGS_TAB,
  REFORM_OPPORTUNITIES_TAB,
} from '../../../utils/internalRoutes'
import CrisisOverviewTab from '../policySections/CrisisOverviewTab'
import CurrentEffortsTab from '../policySections/CurrentEffortsTab'
import DataCollectionTab from '../policySections/DataCollectionTab'
import FaqsTab from '../policySections/FaqsTab'
import HowToUseTheDataTab from '../policySections/HowToUseTheDataTab'
import ReformOpportunitiesTab from '../policySections/ReformOpportunitiesTab'
import GunViolencePolicyHomeLink from '../policySections/GunViolencePolicyHomeLink'
import OurFindingsTab from '../policySections/OurFindingsTab'
import type { RouteConfig } from '../../sharedTypes'

export const routeConfigs: RouteConfig[] = [
  {
    isTopLevel: true,
    label: 'Policy Context Introduction',
    path: GUN_VIOLENCE_POLICY,
    component: <GunViolencePolicyHomeLink />,
    subLinks: [],
    visible: false,
  },
  {
    isTopLevel: true,
    label: 'Crisis Overview',
    path: CRISIS_OVERVIEW_TAB,
    component: <CrisisOverviewTab />,
    subLinks: [
      {
        label: 'Understanding the Crisis of Gun Violence in Atlanta',
        path: '#introduction',
      },
    ],
    visible: true,
  },
  {
    isTopLevel: true,
    label: 'Data Collection',
    path: DATA_COLLECTION_TAB,
    component: <DataCollectionTab />,
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
        label: 'Fatality Definitions',
        path: '#fatality-definitions',
      },
      {
        label: 'Available Data',
        path: '#available-data',
      },
    ],
    visible: true,
  },
  {
    isTopLevel: true,
    label: 'Our Findings',
    path: OUR_FINDINGS_TAB,
    component: <OurFindingsTab />,
    subLinks: [
      {
        label: `Georgia's Youth Fatality Rates`,
        path: '#ga-youth-fatalities',
      },
      {
        label: `Georgia's Homicide Rates`,
        path: '#ga-homicides',
      },
      {
        label: `Georgia's Suicide Rates`,
        path: '#ga-suicides',
      },
      {
        label: `Georgia's Homicide Rates Among Black Men`,
        path: '#ga-homicides-city-size',
      },
    ],
    visible: true,
  },
  {
    isTopLevel: true,
    label: 'Current Efforts',
    path: CURRENT_EFFORTS_TAB,
    component: <CurrentEffortsTab />,
    subLinks: [
      {
        label: 'Health Inequities Defined',
        path: '#health-inequities-definition',
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
        label: 'Mental Health Services',
        path: '#mental-health-services',
      },
      {
        label: 'Community Engagement',
        path: '#community-engagement',
      },
    ],
    visible: true,
  },
  {
    isTopLevel: true,
    label: 'Reform Opportunities',
    path: REFORM_OPPORTUNITIES_TAB,
    component: <ReformOpportunitiesTab />,
    subLinks: [
      {
        label: 'Insights from the Advocacy Community',
        path: '#where-to-start',
      },
      {
        label: 'Legislative Items to Consider for Policy Changes',
        path: '#legislative-items',
      },
    ],
    visible: true,
  },
  {
    isTopLevel: true,
    label: 'How to Use the Data',
    path: HOW_TO_USE_THE_DATA_TAB,
    component: <HowToUseTheDataTab />,
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
    visible: true,
  },
  {
    isTopLevel: true,
    label: 'Community Safety FAQs',
    path: FAQS_TAB,
    component: <FaqsTab />,
    subLinks: [],
    visible: true,
  },
]
