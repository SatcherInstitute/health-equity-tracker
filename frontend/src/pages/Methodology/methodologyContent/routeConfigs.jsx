import {
  AGE_ADJUSTMENT_LINK,
  BEHAVIORAL_HEALTH_LINK,
  CHRONIC_DISEASE_LINK,
  CONDITION_VARIABLES_LINK,
  COVID_19_LINK,
  DATA_METHOD_DEFINITIONS_LINK,
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
      { label: 'Age-Adjustment Examples', path: '#age-adjustment-examples' },
    ],
  },
  {
    label: 'Source Acquisition',
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
      {
        label: 'Useful Links',
        path: '#sources-links',
      },
    ],
  },
  {
    label: 'Behavioral Health',
    path: BEHAVIORAL_HEALTH_LINK,
    component: BehavioralHealthLink,
    subLinks: [],
  },
  {
    label: 'Chronic Diseases',
    path: CHRONIC_DISEASE_LINK,
    component: ChronicDiseaseLink,
    subLinks: [],
  },
  {
    label: 'COVID-19',
    path: COVID_19_LINK,
    component: Covid19Link,
    subLinks: [
      { label: 'COVID-19', path: '#covid19' },
      {
        label: 'COVID-19 Time-Series Data',
        path: '#covid19-time-series-data',
      },
      {
        label: 'COVID-19 Missing and Suppressed Data',
        path: '#covid19-missing-and-suppressed-data',
      },

      {
        label: 'COVID-19 vaccinations',
        path: '#covid-19-vaccinations',
      },
      {
        label: 'Vaccination population sources',
        path: '#vaccination-population-sources',
      },
      {
        label: 'Vaccination data limitations',

        path: '#vaccination-data-limiations',
      },
      {
        label: 'Missing COVID-19 vaccination data',
        path: '#missing-covid-vaccination-data',
      },
    ],
  },

  {
    label: 'HIV',
    path: HIV_LINK,
    component: HivLink,
    subLinks: [
      { label: 'HIV', path: '#hiv' },
      {
        label: 'HIV Missing and Suppressed Data',
        path: '#hiv-missing-and-suppressed-data',
      },
      { label: 'PrEP Coverage', path: '#prep-coverage' },
      { label: 'Linkage to Care', path: '#linkage-to-care' },
      { label: 'HIV Stigma', path: '#stigma' },
    ],
  },
  {
    label: 'Political Determinants of Health (PDOH)',
    path: PDOH_LINK,
    component: PdohLink,
    subLinks: [
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
    ],
  },
  {
    label: 'Social Determinants of Health (SDOH)',
    path: SDOH_LINK,
    component: SdohLink,
    subLinks: [],
  },
  {
    label: 'Metrics',
    path: METRICS_LINK,
    component: MetricsLink,
    subLinks: [],
  },
  {
    label: 'Condition Variables',
    path: CONDITION_VARIABLES_LINK,
    component: ConditionVariablesLink,
    subLinks: [
      { label: 'HIV', path: '#hiv' },
      { label: 'COVID-19', path: '#covid-19' },
      { label: 'Behavioral Health', path: '#behavioral-health' },
      { label: 'Chronic Disease', path: '#chronic-disease' },
      {
        label: 'Social Determinants of Health',
        path: '#social-determinants-of-health',
      },
      {
        label: 'Political Determinants of Health',
        path: '#political-determinants-of-health',
      },
    ],
  },
  {
    label: 'Topic Definitions and Limitations',
    path: TOPICS_LINK,
    component: TopicsLink,
    subLinks: [],
  },
  {
    label: 'Races and Ethnicities',
    path: RACES_AND_ETHNICITIES_LINK,
    component: RacesAndEthnicitiesLink,
    subLinks: [],
  },
  {
    label: 'Data Method Definitions',
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
]
