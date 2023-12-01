import { methodologyTableDefinitions } from './MethodologyTopicDefinitions'
import { conditionVariableDefinitions } from './ConditionVariableDefinitions'
import { dataSourceMetadataList } from '../../../data/config/MetadataMap'

export const pdohDefinitionsArray = [
  {
    topic: 'Voter participation',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[4].definitions[1].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[4].definitions[0].description,
      },
    ],
  },
  {
    topic: 'Women in US Congress',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[4].definitions[2].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[4].definitions[1].description,
      },
    ],
  },
  {
    topic: 'Women in state legislatures',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[4].definitions[2].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[4].definitions[2].description,
      },
    ],
  },
  {
    topic: 'People in prison',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[4].definitions[0].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[4].definitions[3].description,
      },
    ],
  },
  {
    topic: 'People in jail',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[4].definitions[0].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[4].definitions[0].description,
      },
    ],
  },
]

export const pdohDataSources = [
  dataSourceMetadataList[11],
  dataSourceMetadataList[1],
  dataSourceMetadataList[3],
  dataSourceMetadataList[10],
  dataSourceMetadataList[12],
  dataSourceMetadataList[13],
  dataSourceMetadataList[14],
]
