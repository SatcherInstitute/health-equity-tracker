import {
  AGE_ADJUSTMENT_LINK,
  BEHAVIORAL_HEALTH_LINK,
  CHRONIC_DISEASE_LINK,
  CONDITION_VARIABLES_LINK,
  COVID_19_LINK,
  DATA_METHOD_DEFINITIONS_LINK,
  HIV_LINK,
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
import Covid19Link from '../methodologySections/Covid19Link'
import DataMethodDefinitionsLink from '../methodologySections/DataMethodDefinitionsLink'
import HivLink from '../methodologySections/HivLink'
import MetricsLink from '../methodologySections/MetricsLink'
import PdohLink from '../methodologySections/PdohLink'
import RacesAndEthnicitiesLink from '../methodologySections/RacesAndEthnicitiesLink'
import RecommendedCitationLink from '../methodologySections/RecommendedCitationLink'
import SdohLink from '../methodologySections/SdohLink'
import SourcesLink from '../methodologySections/SourcesLink'
import TopicsLink from '../methodologySections/TopicsLink'

export const routeConfigs = [
  {
    path: AGE_ADJUSTMENT_LINK,
    component: AgeAdjustmentLink,
<<<<<<< HEAD
    subLinks: [
      { label: 'Age-Adjusted Ratios', path: '#age-adjusted-ratios' },
      { label: 'Data Sourcing', path: '#data-sourcing' },
      { label: 'Algorithm', path: '#algorithm' },
      { label: 'Age-Adjustment Examples', path: '#age-adjustment-examples' },
    ],
  },
  {
    path: SOURCES_LINK,
    component: SourcesLink,
=======
>>>>>>> 25282a78 (fixing branch conflicts)
    subLinks: [],
  },
  {
    path: BEHAVIORAL_HEALTH_LINK,
    component: BehavioralHealthLink,
    subLinks: [],
  },
  {
    path: CHRONIC_DISEASE_LINK,
    component: ChronicDiseaseLink,
    subLinks: [],
  },
  {
<<<<<<< HEAD
=======
    path: CONDITION_VARIABLES_LINK,
    component: ConditionVariablesLink,
    subLinks: [],
  },

  {
>>>>>>> 25282a78 (fixing branch conflicts)
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
<<<<<<< HEAD
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
        path: '#vaccination-data-limitations',
      },
      {
        label: 'Missing COVID-19 vaccination data',
        path: '#missing-covid-vaccination-data',
      },
    ],
  },
  {
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
    path: SDOH_LINK,
    component: SdohLink,
    subLinks: [],
  },
  {
    path: TOPICS_LINK,
    component: TopicsLink,
    subLinks: [],
  },
  {
    path: METRICS_LINK,
    component: MetricsLink,
    subLinks: [],
  },
  {
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
    path: RACES_AND_ETHNICITIES_LINK,
    component: RacesAndEthnicitiesLink,
    subLinks: [],
  },
  {
=======
    ],
  },
  {
>>>>>>> 25282a78 (fixing branch conflicts)
    path: DATA_METHOD_DEFINITIONS_LINK,
    component: DataMethodDefinitionsLink,
    subLinks: [],
  },
<<<<<<< HEAD
=======

  {
    path: HIV_LINK,
    component: HivLink,
    subLinks: [],
  },

  {
    path: METRICS_LINK,
    component: MetricsLink,
    subLinks: [],
  },

  {
    path: PDOH_LINK,
    component: PdohLink,
    subLinks: [],
  },
  {
    path: RACES_AND_ETHNICITIES_LINK,
    component: RacesAndEthnicitiesLink,
    subLinks: [],
  },

>>>>>>> 25282a78 (fixing branch conflicts)
  {
    path: RECOMMENDED_CITATION_LINK,
    component: RecommendedCitationLink,
    subLinks: [],
  },
<<<<<<< HEAD
=======

  {
    path: SDOH_LINK,
    component: SdohLink,
    subLinks: [],
  },

  {
    path: SOURCES_LINK,
    component: SourcesLink,
    subLinks: [],
  },

  {
    path: TOPICS_LINK,
    component: TopicsLink,
    subLinks: [],
  },
>>>>>>> 25282a78 (fixing branch conflicts)
]
