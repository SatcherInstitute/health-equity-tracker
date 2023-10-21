import { methodologyTableDefinitions } from './MethodologyTopicDefinitions'
import { conditionVariableDefinitions } from './ConditionVariableDefinitions'
import { dataSourceMetadataList } from '../../../data/config/MetadataMap'

export const covidDefinitionsArray = [
  {
    topic: 'COVID-19 cases',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[2].definitions[0].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[2].definitions[0].description,
      },
    ],
  },
  {
    topic: 'COVID-19 deaths',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[2].definitions[0].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[2].definitions[1].description,
      },
    ],
  },
  {
    topic: 'COVID-19 hospitalizations',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[2].definitions[0].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[2].definitions[2].description,
      },
    ],
  },
  {
    topic: 'COVID-19 vaccinations',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[2].definitions[1].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[2].definitions[3].description,
      },
    ],
  },
]

interface DataItem {
  topic: string
  definitions: Array<{
    key: string
    description: string
  }>
  path: string
}

export const covidDataSources = [
  dataSourceMetadataList[0],
  dataSourceMetadataList[1],
  dataSourceMetadataList[2],
  dataSourceMetadataList[3],
  dataSourceMetadataList[6],
  dataSourceMetadataList[7],
  dataSourceMetadataList[9],
  dataSourceMetadataList[17],
]
