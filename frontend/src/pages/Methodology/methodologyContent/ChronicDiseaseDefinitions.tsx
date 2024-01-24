import { methodologyTableDefinitions } from './MethodologyTopicDefinitions'
import { conditionVariableDefinitions } from './ConditionVariableDefinitions'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'

export const chronicDiseaseDefinitionsArray = [
  {
    topic: 'Asthma',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[1].definitions[0].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[1].definitions[0].description,
      },
    ],
  },
  {
    topic: 'Cardiovascular Disease',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[1].definitions[1].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[1].definitions[1].description,
      },
    ],
  },
  {
    topic: 'Chronic Kidney Disease',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[1].definitions[2].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[1].definitions[2].description,
      },
    ],
  },
  {
    topic: 'COPD (Chronic obstructive pulmonary disease)',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[1].definitions[3].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[1].definitions[3].description,
      },
    ],
  },
  {
    topic: 'Diabetes',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[1].definitions[4].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[1].definitions[4].description,
      },
    ],
  },
]

export const chronicDiseaseDataSources = [
  dataSourceMetadataMap.acs,
  dataSourceMetadataMap.ahr,
]
