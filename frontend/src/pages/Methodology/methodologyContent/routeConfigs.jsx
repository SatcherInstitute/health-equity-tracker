import {
  AGE_ADJUSTMENT_LINK,
  BEHAVIORAL_HEALTH_LINK,
  CHRONIC_DISEASE_LINK,
  CONDITION_VARIABLES_LINK,
  COVID_19_LINK,
  DATA_METHOD_DEFINITIONS_LINK,
  GLOSSARY_LINK,
  HIV_LINK,
  METHODOLOGY_PAGE_LINK,
  METRICS_LINK,
  PDOH_LINK,
  RACES_AND_ETHNICITIES_LINK,
  RECOMMENDED_CITATION_LINK,
  SDOH_LINK,
  SOURCES_LINK,
  TOPICS_LINK,
} from '../../../utils/internalRoutes'
import AgeAdjustmentLink from '../methodologySections/AgeAdjustmentLink'
import BehavioralHealthLink from '../methodologySections/BehavioralHealthLink'
import ChronicDiseaseLink from '../methodologySections/ChronicDiseaseLink'
import ConditionVariablesLink from '../methodologySections/ConditionVariablesLink'
import DataMethodDefinitionsLink from '../methodologySections/DataMethodDefinitionsLink'
import Covid19Link from '../methodologySections/Covid19Link'
import HivLink from '../methodologySections/HivLink'
import MetricsLink from '../methodologySections/MetricsLink'
import PdohLink from '../methodologySections/PdohLink'
import RacesAndEthnicitiesLink from '../methodologySections/RacesAndEthnicitiesLink'
import RecommendedCitationLink from '../methodologySections/RecommendedCitationLink'
import SdohLink from '../methodologySections/SdohLink'
import SourcesLink from '../methodologySections/SourcesLink'
import TopicsLink from '../methodologySections/TopicsLink'
import MethodologyHomeLink from '../methodologySections/MethodologyHomeLink'
import GlossaryLink from '../methodologySections/GlossaryLink'

export const routeConfigs = [
  {
    label: 'Methodology',
    path: METHODOLOGY_PAGE_LINK,
    component: MethodologyHomeLink,
    subLinks: [],
  },
  {
    label: 'Age-Adjustment',
    path: AGE_ADJUSTMENT_LINK,
    component: AgeAdjustmentLink,
    subLinks: [
      { label: 'Age-Adjusted Ratios', path: '#age-adjusted-ratios' },
      { label: 'Data Sourcing', path: '#data-sourcing' },
      { label: 'Algorithm', path: '#algorithm' },
      {
        label: 'Age-Adjustment Example: HIV Deaths',
        path: '#age-adjustment-examples',
      },
      {
        label: 'Data Sources',
        path: '#age-adjustment-data-sources',
      },
      { label: 'Key Terms', path: '#age-adjustment-key-terms' },
      { label: 'Resources', path: '#age-adjustment-resources' },
      { label: 'Explore Examples', path: '#age-adjustment-explore' },
    ],
  },
  {
    label: 'Data Sources',
    path: SOURCES_LINK,
    component: SourcesLink,
    subLinks: [
      {
        label: 'Data Sources',
        path: '#data-sources',
      },
      {
        label: 'Data Collection',
        path: '#data-collection',
      },
      {
        label: 'Data Processing',
        path: '#data-processing',
      },

      {
        label: 'Data Analysis',
        path: '#data-analysis',
      },
      {
        label: 'Visualization Techniques',
        path: '#visualization-techniques',
      },
      {
        label: 'Dataset Limitations',
        path: '#dataset-limitations',
      },
      {
        label: 'Updates and Revisions',
        path: '#updates-and-revisions',
      },
      {
        label: 'Stakeholder Engagement',
        path: '#stakeholder-engagement',
      },
      {
        label: 'References and Citations',
        path: '#references-and-citations',
      },
      {
        label: 'Contact Information',
        path: '#contact-information',
      },
    ],
  },
  {
    label: 'Behavioral Health',
    path: BEHAVIORAL_HEALTH_LINK,
    component: BehavioralHealthLink,
    subLinks: [
      {
        label: 'Data Sourcing',
        path: '#behavioral-health-data-sourcing',
      },
      {
        label: 'Data Sources',
        path: '#behavioral-health-data-sources',
      },
      {
        label: 'Key Terms',
        path: '#behavioral-health-key-terms',
      },
      {
        label: 'Behavioral and Mental Health Resources',
        path: '#behavioral-health-resources',
      },
    ],
  },
  {
    label: 'Chronic Diseases',
    path: CHRONIC_DISEASE_LINK,
    component: ChronicDiseaseLink,
    subLinks: [
      { label: 'Data Sourcing', path: '#chronic-diseases-data-sourcing' },
      { label: 'Data Sources', path: '#chronic-diseases-data-sources' },
      { label: 'Key Terms', path: '#chronic-diseases-key-terms' },
    ],
  },
  {
    label: 'COVID-19',
    path: COVID_19_LINK,
    component: Covid19Link,
    subLinks: [
      { label: 'COVID-19', path: '#covid-19' },
      { label: 'Data Sourcing', path: '#covid-data-sourcing' },
      {
        label: 'Age and Demographic Data Analysis',
        path: '#covid-age-and-demographic-data-analysis',
      },
      {
        label: 'Geographical Distribution and Reporting',
        path: '#covid-geographical-reporting',
      },
      {
        label: 'Time-Series and Temporal Analysis',
        path: '#covid-time-series',
      },
      {
        label: 'Addressing Missing and Suppressed Data',
        path: '#covid-missing-and-suppressed-data',
      },
      {
        label: 'Vaccination Data Compilation and Analysis',
        path: '#covid-vaccination-data-analysis',
      },
      {
        label: 'Demographic Population Estimates for Vaccination Data',
        path: '#covid-vaccination-demographic-estimates',
      },
      {
        label: 'Data Limitations and Specific Considerations',
        path: '#covid-data-limitations',
      },
      { label: 'Data Sources', path: '#covid-data-sources' },
      {
        label: 'Key Terms',
        path: '#covid-key-terms',
      },
      {
        label: 'Resources',
        path: '#covid-resources',
      },
    ],
  },

  {
    label: 'HIV',
    path: HIV_LINK,
    component: HivLink,
    subLinks: [
      { label: 'Data Sourcing', path: '#hiv-data-sourcing' },
      { label: 'HIV', path: '#hiv' },
      {
        label: 'HIV Missing and Suppressed Data',
        path: '#hiv-missing-and-suppressed-data',
      },
      { label: 'PrEP Coverage', path: '#prep-coverage' },
      { label: 'Linkage to Care', path: '#linkage-to-care' },
      { label: 'HIV Stigma', path: '#stigma' },
      { label: 'Data Sources', path: '#hiv-data-sources' },
      { label: 'Key Terms', path: '#hiv-key-terms' },
      { label: 'HIV Resources', path: '#hiv-resources' },
    ],
  },
  {
    label: 'Political Determinants of Health (PDOH)',
    path: PDOH_LINK,
    component: PdohLink,
    subLinks: [
      { label: 'Data Sourcing', path: '#pdoh-data-sourcing' },
      { label: 'Incarceration', path: '#incarceration' },
      { label: 'Jail', path: '#jail' },
      { label: 'Prison', path: '#prison' },
      {
        label: 'Children in Adult Facilities',
        path: '#children-in-adult-facilities',
      },
      { label: 'Combined Systems', path: '#combined-systems' },
      { label: 'Women in Legislative Office', path: '#women-in-gov' },
      {
        label: 'Women in Legislative Office Missing and Suppressed Data',
        path: '#women-in-gov-missing-and-suppressed-data',
      },
      {
        label: 'Data Sources',
        path: '#pdoh-data-resources',
      },
      {
        label: 'Key Terms',
        path: '#pdoh-key-terms',
      },
      {
        label: 'Resources',
        path: '#pdoh-resources',
      },
    ],
  },
  {
    label: 'Social Determinants of Health (SDOH)',
    path: SDOH_LINK,
    component: SdohLink,
    subLinks: [
      { label: 'Data Sourcing', path: '#sdoh-data-sourcing' },
      { label: 'Data Sources', path: '#sdoh-data-sources' },
      { label: 'Key Terms', path: '#sdoh-key-terms' },
      { label: 'Resources', path: '#sdoh-resources' },
    ],
  },
  {
    label: 'Metrics',
    path: METRICS_LINK,
    component: MetricsLink,
    subLinks: [
      { label: 'Metrics', path: '#metrics' },
      { label: 'Age-adjusted ratios', path: '#age-adjusted-ratios-metrics' },
      { label: 'Total cases per 100k people', path: '#per-100k-metrics' },
      {
        label: 'Share of total cases with unknown races',
        path: '#unknown-cases-metrics',
      },
      { label: 'Share of total cases', path: '#total-share-metrics' },
      { label: 'Population share', path: '#population-share-metrics' },
      { label: 'Relative inequity', path: '#relative-inequity-metrics' },
      { label: 'Time-series', path: '#time-series-metrics' },
      {
        label: 'Percent Share Example: COVID-19 Cases',
        path: '#percent-share-example',
      },
    ],
  },
  {
    label: 'Condition Variables',
    path: CONDITION_VARIABLES_LINK,
    component: ConditionVariablesLink,
    subLinks: [
      {
        label: 'Behavioral Health Variables',
        path: '#behavioral-health-variables',
      },
      {
        label: 'Chronic Diseases Variables',
        path: '#chronic-diseases-variables',
      },
      { label: 'COVID-19 Variables', path: '#covid-19-variables' },
      { label: 'HIV Variables', path: '#hiv-variables' },
      {
        label: 'Political Determinants of Health Variables',
        path: '#pdoh-variables',
      },
      {
        label: 'Social Determinants of Health Variables',
        path: '#sdoh-variables',
      },
    ],
  },
  {
    label: 'Categories and Limitations',
    path: TOPICS_LINK,
    component: TopicsLink,
    subLinks: [
      {
        label: 'Categories',
        path: '#categories',
      },
      {
        label: 'Limitations',
        path: '#limitations',
      },
      {
        label: 'Missing Data',
        path: '#missing-data',
      },
    ],
  },
  {
    label: 'Races and Ethnicities',
    path: RACES_AND_ETHNICITIES_LINK,
    component: RacesAndEthnicitiesLink,
    subLinks: [
      { label: 'Races and Ethnicities', path: '#races-and-ethnicities' },
      { label: 'Addressing Data Gaps', path: '#data-gaps' },
      {
        label: 'All',
        path: '#all',
      },

      {
        label: 'American Indian and Alaska Native (NH)',
        path: '#aian_nh',
      },

      {
        label: 'Asian (NH)',
        path: '#api_nh',
      },

      {
        label: 'Black or African American (NH)',
        path: '#black_nh',
      },
      {
        label: 'Hispanic/Latino',
        path: '#hispanic',
      },

      {
        label: 'Middle Eastern / North African (MENA)',
        path: '#mena',
      },
      {
        label: 'Native Hawaiian or Other Pacific Islander (NH)',
        path: '#nhpi_nh',
      },
      {
        label: 'NH',
        path: '#nh',
      },
      {
        label: 'Unrepresented race (NH)',
        path: '#other_nonstandard_nh',
      },
      {
        label: 'Two or more races (NH)',
        path: '#multi_or_other_standard',
      },
      {
        label: 'Two or more races & Unrepresented race (NH)',
        path: '#multi_or_other_standard_nh',
      },
      {
        label: 'White (NH)',
        path: '#white',
      },
    ],
  },
  {
    label: 'Data Methods',
    path: DATA_METHOD_DEFINITIONS_LINK,
    component: DataMethodDefinitionsLink,
    subLinks: [],
  },
  {
    label: 'Recommended Citation (APA)',
    path: RECOMMENDED_CITATION_LINK,
    component: RecommendedCitationLink,
    subLinks: [],
  },
  {
    label: 'Glossary',
    path: GLOSSARY_LINK,
    component: GlossaryLink,
    subLinks: [
      {
        label: 'Health Equity A-Z',
        path: '#health-equity-terms',
      },
      {
        label: 'Health Equity Resources',
        path: '#health-equity-resources',
      },
      {
        label: 'Equity Indices Resources',
        path: '#equity-index-resources',
      },
      {
        label: 'Economics of Health Equity Resources',
        path: '#economic-equity-resources',
      },
      {
        label: 'Mental and Behavioral Health Resources',
        path: '#mental-health-resources',
      },
      {
        label: 'COVID-19 Resources',
        path: '#covid-resources',
      },
      {
        label: 'COVID-19 Vaccination Resources',
        path: '#covid-vaccination-resources',
      },
      {
        label: 'HIV Resources',
        path: '#hiv-resources',
      },
      {
        label: 'American Indian and Alaska Native Resources',
        path: '#aian-resources',
      },
      {
        label: 'Asian, Native Hawaiian, and Pacific Islander Resources',
        path: '#api-resources',
      },
      {
        label: 'Latino and Hispanic Resources',
        path: '#hisp-resources',
      },
      {
        label: 'Social and Political Determinants of Health Resources',
        path: '#pdoh-resources',
      },
    ],
  },
]
