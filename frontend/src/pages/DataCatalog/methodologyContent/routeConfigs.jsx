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
    path: CONDITION_VARIABLES_LINK,
    component: ConditionVariablesLink,
    subLinks: [],
  },

  {
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
    ],
  },
  {
    path: DATA_METHOD_DEFINITIONS_LINK,
    component: DataMethodDefinitionsLink,
    subLinks: [],
  },

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

  {
    path: RECOMMENDED_CITATION_LINK,
    component: RecommendedCitationLink,
    subLinks: [],
  },

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
]
