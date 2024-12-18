import { lazy } from 'react'
import {
  AGE_ADJUSTMENT_LINK,
  BEHAVIORAL_HEALTH_LINK,
  CHRONIC_DISEASE_LINK,
  COMMUNITY_SAFETY_LINK,
  COVID_19_LINK,
  DATA_METHOD_DEFINITIONS_LINK,
  GLOSSARY_LINK,
  HIV_LINK,
  LIMITATIONS_LINK,
  MEDICATION_UTILIZATION_LINK,
  METHODOLOGY_PAGE_LINK,
  METRICS_LINK,
  PDOH_LINK,
  RACES_AND_ETHNICITIES_LINK,
  RECOMMENDED_CITATION_LINK,
  SDOH_LINK,
  SOURCES_LINK,
  TOPIC_CATEGORIES_LINK,
  TOPIC_DEFINITIONS_LINK,
} from '../../../utils/internalRoutes'
import type { RouteConfig } from '../../sharedTypes'
import { raceAndEthnicitySublinks } from './RacesAndEthnicitiesDefinitions'

const AgeAdjustmentLink = lazy(
  () => import('../methodologySections/AgeAdjustmentLink'),
)
const BehavioralHealthLink = lazy(
  () => import('../methodologySections/BehavioralHealthLink'),
)
const ChronicDiseaseLink = lazy(
  () => import('../methodologySections/ChronicDiseaseLink'),
)
const TopicDefinitionsLink = lazy(
  () => import('../methodologySections/TopicDefinitionsLink'),
)
const DataMethodDefinitionsLink = lazy(
  () => import('../methodologySections/DataMethodDefinitionsLink'),
)
const Covid19Link = lazy(() => import('../methodologySections/Covid19Link'))
const HivLink = lazy(() => import('../methodologySections/HivLink'))
const MetricsLink = lazy(() => import('../methodologySections/MetricsLink'))
const PdohLink = lazy(() => import('../methodologySections/PdohLink'))
const MedicationUtilizationLink = lazy(
  () => import('../methodologySections/MedicationUtilizationLink'),
)
const RacesAndEthnicitiesLink = lazy(
  () => import('../methodologySections/RacesAndEthnicitiesLink'),
)
const RecommendedCitationLink = lazy(
  () => import('../methodologySections/RecommendedCitationLink'),
)
const SdohLink = lazy(() => import('../methodologySections/SdohLink'))
const DataSourcesLink = lazy(
  () => import('../methodologySections/DataSourcesLink'),
)
const TopicCategoriesLink = lazy(
  () => import('../methodologySections/TopicCategoriesLink'),
)
const LimitationsLink = lazy(
  () => import('../methodologySections/LimitationsLink'),
)
const MethodologyHomeLink = lazy(
  () => import('../methodologySections/MethodologyHomeLink'),
)
const GlossaryLink = lazy(() => import('../methodologySections/GlossaryLink'))
const CommunitySafetyLink = lazy(
  () => import('../methodologySections/CommunitySafetyLink'),
)

export const methodologyRouteConfigs: RouteConfig[] = [
  {
    isTopLevel: true,
    label: 'Methodology Introduction',
    path: METHODOLOGY_PAGE_LINK,
    component: <MethodologyHomeLink />,
    subLinks: [],
    visible: false,
  },

  {
    isTopLevel: true,
    label: 'Data Sources',
    path: SOURCES_LINK,
    component: <DataSourcesLink />,
    subLinks: [
      {
        label: 'Data Sources',
        path: 'data-sources',
      },
      {
        label: 'Data Collection',
        path: 'data-collection',
      },
      {
        label: 'Data Processing',
        path: 'data-processing',
      },
      {
        label: 'Visualization Techniques',
        path: 'visualization-techniques',
      },
      {
        label: 'Dataset Limitations',
        path: 'dataset-limitations',
      },
      {
        label: 'Updates and Revisions',
        path: 'updates-and-revisions',
      },
      {
        label: 'Stakeholder Engagement',
        path: 'stakeholder-engagement',
      },
      {
        label: 'References and Citations',
        path: 'references-and-citations',
      },
      {
        label: 'Contact Information',
        path: 'contact-information',
      },
    ],
    visible: true,
  },
  {
    isTopLevel: true,
    label: 'Topic Categories',
    path: TOPIC_CATEGORIES_LINK,
    component: <TopicCategoriesLink />,
    subLinks: [],
    visible: true,
  },

  {
    label: 'Behavioral Health',
    path: BEHAVIORAL_HEALTH_LINK,
    component: <BehavioralHealthLink />,
    subLinks: [
      {
        label: 'Data Sourcing',
        path: 'behavioral-health-data-sourcing',
      },
      {
        label: 'Data Sources',
        path: 'behavioral-health-data-sources',
      },
      {
        label: 'Key Terms',
        path: 'behavioral-health-key-terms',
      },
      {
        label: 'Behavioral and Mental Health Resources',
        path: 'behavioral-health-resources',
      },
    ],
    visible: true,
  },
  {
    label: 'Chronic Diseases',
    path: CHRONIC_DISEASE_LINK,
    component: <ChronicDiseaseLink />,
    subLinks: [
      { label: 'Data Sourcing', path: 'chronic-diseases-data-sourcing' },
      { label: 'Data Sources', path: 'chronic-diseases-data-sources' },
      { label: 'Key Terms', path: 'chronic-diseases-key-terms' },
    ],
    visible: true,
  },
  {
    label: 'Community Safety',
    path: COMMUNITY_SAFETY_LINK,
    component: <CommunitySafetyLink />,
    subLinks: [
      { label: 'Data Sourcing', path: 'community-safety-data-sourcing' },
      { label: 'Data Sources', path: 'community-safety-data-sources' },
      { label: 'Key Terms', path: 'community-safety-key-terms' },
    ],
    visible: true,
  },
  {
    label: 'COVID-19',
    path: COVID_19_LINK,
    component: <Covid19Link />,
    subLinks: [
      { label: 'COVID-19', path: 'covid-19' },
      { label: 'Data Sourcing', path: 'covid-data-sourcing' },
      {
        label: 'Age and Demographic Data Analysis',
        path: 'covid-age-and-demographic-data-analysis',
      },
      {
        label: 'Geographical Distribution and Reporting',
        path: 'covid-geographical-reporting',
      },
      {
        label: 'Time-Series and Temporal Analysis',
        path: 'covid-time-series',
      },
      {
        label: 'Addressing Missing and Suppressed Data',
        path: 'covid-missing-and-suppressed-data',
      },
      {
        label: 'Vaccination Data Compilation and Analysis',
        path: 'covid-vaccination-data-analysis',
      },
      {
        label: 'Demographic Population Estimates for Vaccination Data',
        path: 'covid-vaccination-demographic-estimates',
      },
      {
        label: 'Data Limitations and Specific Considerations',
        path: 'covid-data-limitations',
      },
      { label: 'Data Sources', path: 'covid-data-sources' },
      {
        label: 'Key Terms',
        path: 'covid-key-terms',
      },
      {
        label: 'Resources',
        path: 'covid-resources',
      },
    ],
    visible: true,
  },

  {
    label: 'HIV',
    path: HIV_LINK,
    component: <HivLink />,
    subLinks: [
      { label: 'HIV', path: 'hiv' },
      { label: 'Data Sourcing', path: 'hiv-data-sourcing' },
      {
        label: ' Variable Data Compilation and Analysis',
        path: 'hiv-variable-data-compilation',
      },
      {
        label: 'Addressing Missing and Suppressed Data',
        path: 'hiv-missing-and-suppressed-data',
      },
      { label: 'PrEP Coverage', path: 'prep-coverage' },
      {
        label: 'Missing PrEP Data',
        path: 'prep-missing-and-suppressed-data',
      },
      { label: 'Linkage to Care', path: 'linkage-to-care' },
      { label: 'Stigma', path: 'stigma' },
      { label: 'Data Sources', path: 'hiv-data-sources' },
      { label: 'Key Terms', path: 'hiv-key-terms' },
      { label: 'Resources', path: 'hiv-resources' },
    ],
    visible: true,
  },
  {
    label: 'Political Determinants of Health',
    path: PDOH_LINK,
    component: <PdohLink />,
    subLinks: [
      { label: 'Political Determinants of Health', path: 'pdoh' },
      { label: 'Data Sourcing', path: 'pdoh-data-sourcing' },
      { label: 'Jails vs. Prisons', path: 'jails-vs-prisons' },
      {
        label: 'Children in Adult Facilities',
        path: 'children-in-adult-facilities',
      },
      { label: 'Combined Systems', path: 'combined-systems' },
      {
        label: 'Political Forces and Incarceration',
        path: 'political-forces',
      },
      {
        label: 'Health Impact of Incarceration',
        path: 'health-impact-of-incarceration',
      },

      {
        label: 'Women in Legislative Office and Health Impacts',
        path: 'women-in-gov',
      },
      {
        label: 'Data Metrics and Methodology',
        path: 'pdoh-data-metrics',
      },
      {
        label: 'Historical Tracking',
        path: 'historical-tracking',
      },

      {
        label: 'Race/Ethnicity Groupings and Challenges',
        path: 'race-ethnicity-groupings-and-challenges',
      },
      {
        label: 'Missing Data',
        path: 'pdoh-missing-data',
      },
      {
        label: 'Data Sources',
        path: 'pdoh-data-resources',
      },
      {
        label: 'Key Terms',
        path: 'pdoh-key-terms',
      },
      {
        label: 'Resources',
        path: 'pdoh-resources',
      },
    ],
    visible: true,
  },
  {
    label: 'Social Determinants of Health',
    path: SDOH_LINK,
    component: <SdohLink />,
    subLinks: [
      { label: 'Data Sourcing', path: 'sdoh-data-sourcing' },
      { label: 'Data Sources', path: 'sdoh-data-sources' },
      { label: 'Key Terms', path: 'sdoh-key-terms' },
      { label: 'Resources', path: 'sdoh-resources' },
    ],
    visible: true,
  },
  {
    label: 'Medication Utilization',
    path: MEDICATION_UTILIZATION_LINK,
    component: <MedicationUtilizationLink />,
    subLinks: [
      {
        label: 'Data Sourcing',
        path: 'medication-utilization-data-sourcing',
      },
      {
        label: 'Data Sources',
        path: 'medication-utilization-data-sources',
      },
      { label: 'Key Terms', path: 'medication-utilization-key-terms' },
      { label: 'Resources', path: 'medication-utilization-resources' },
    ],
    visible: true,
  },
  {
    isTopLevel: true,
    label: 'Data Methods',
    path: DATA_METHOD_DEFINITIONS_LINK,
    component: <DataMethodDefinitionsLink />,
    subLinks: [],
    visible: true,
  },
  {
    label: 'Limitations and Missing Data',
    path: LIMITATIONS_LINK,
    component: <LimitationsLink />,
    subLinks: [
      {
        label: 'Limitations',
        path: 'limitations',
      },
      {
        label: 'Missing Data',
        path: 'missing-data',
      },
    ],
    visible: true,
  },
  {
    label: 'Metrics',
    path: METRICS_LINK,
    component: <MetricsLink />,
    subLinks: [
      {
        label: 'Age-adjusted ratios',
        path: 'age-adjusted-ratios-metrics',
      },
      { label: 'Total cases per 100k people', path: 'per-100k-metrics' },
      {
        label: 'Share of total cases with unknown races',
        path: 'unknown-cases-metrics',
      },
      { label: 'Share of total cases', path: 'total-share-metrics' },
      { label: 'Population share', path: 'population-share-metrics' },
      { label: 'Relative inequity', path: 'relative-inequity-metrics' },
      { label: 'Time-series', path: 'time-series-metrics' },
      { label: 'Social Vulnerability Index', path: 'svi' },
      {
        label: 'Percent Share Example: COVID-19 Cases',
        path: 'percent-share-example',
      },
    ],
    visible: true,
  },
  {
    label: 'Topic Definitions',
    path: TOPIC_DEFINITIONS_LINK,
    component: <TopicDefinitionsLink />,
    subLinks: [
      { label: 'HIV Topics', path: 'hiv' },
      {
        label: 'Chronic Disease Topics',
        path: 'chronic-disease',
      },
      {
        label: 'Behavioral Health Topics',
        path: 'behavioral-health',
      },
      {
        label: 'Political Determinants of Health Topics',
        path: 'political-determinants-of-health',
      },
      {
        label: 'Social Determinants of Health Topics',
        path: 'social-determinants-of-health',
      },
      {
        label: 'Medication Utilization',
        path: 'medication-utilization-in-the-medicare-population',
      },
      { label: 'COVID-19 Topics', path: 'covid-19' },
    ],
    visible: true,
  },

  {
    label: 'Races and Ethnicities',
    path: RACES_AND_ETHNICITIES_LINK,
    component: <RacesAndEthnicitiesLink />,
    subLinks: [
      { label: 'Races and Ethnicities', path: 'races-and-ethnicities' },
      { label: 'Addressing Data Gaps', path: 'data-gaps' },
      ...raceAndEthnicitySublinks,
    ],
    visible: true,
  },
  {
    isTopLevel: true,
    label: 'Age-Adjustment',
    path: AGE_ADJUSTMENT_LINK,
    component: <AgeAdjustmentLink />,
    subLinks: [
      { label: 'Age-Adjusted Ratios', path: 'age-adjusted-ratios' },
      { label: 'Data Sourcing', path: 'data-sourcing' },
      { label: 'Algorithm', path: 'algorithm' },
      {
        label: 'Example: HIV Deaths',
        path: 'age-adjustment-examples',
      },
      { label: 'Explore Examples', path: 'age-adjustment-explore' },

      { label: 'Key Terms', path: 'age-adjustment-key-terms' },
      { label: 'Resources', path: 'age-adjustment-resources' },
    ],
    visible: true,
  },
  {
    isTopLevel: true,
    label: 'Recommended Citation',
    path: RECOMMENDED_CITATION_LINK,
    component: <RecommendedCitationLink />,
    subLinks: [],
    visible: true,
  },
  {
    isTopLevel: true,
    label: 'Glossary',
    path: GLOSSARY_LINK,
    component: <GlossaryLink />,
    subLinks: [
      {
        label: 'Health Equity A-Z',
        path: 'health-equity-terms',
      },
      {
        label: 'Health Equity Resources',
        path: 'health-equity-resources',
      },
      {
        label: 'Equity Indices Resources',
        path: 'equity-index-resources',
      },
      {
        label: 'Economics of Health Equity Resources',
        path: 'economic-equity-resources',
      },
      {
        label: 'Mental and Behavioral Health Resources',
        path: 'mental-health-resources',
      },
      {
        label: 'COVID-19 Resources',
        path: 'covid-resources',
      },
      {
        label: 'COVID-19 Vaccination Resources',
        path: 'covid-vaccination-resources',
      },
      {
        label: 'HIV Resources',
        path: 'hiv-resources',
      },
      {
        label: 'Indigenous Resources',
        path: 'aian-resources',
      },
      {
        label: 'Asian, Native Hawaiian, and Pacific Islander Resources',
        path: 'api-resources',
      },
      {
        label: 'Latino and Hispanic Resources',
        path: 'hisp-resources',
      },
      {
        label: 'Social and Political Determinants of Health Resources',
        path: 'pdoh-resources',
      },
    ],
    visible: true,
  },
]

export default methodologyRouteConfigs
