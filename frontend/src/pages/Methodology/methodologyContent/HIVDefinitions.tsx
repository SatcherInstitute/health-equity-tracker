import { methodologyTableDefinitions } from './MethodologyTopicDefinitions'
import { conditionVariableDefinitions } from './ConditionVariableDefinitions'
import { dataSourceMetadataList } from '../../../data/config/MetadataMap'

export const hivDefinitionsArray = [
  {
    topic: 'HIV prevalence',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[3].definitions[0].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[3].definitions[0].description,
      },
    ],
  },
  {
    topic: 'HIV prevalence for Black women',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[3].definitions[1].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[3].definitions[3].description,
      },
    ],
  },
  {
    topic: 'New HIV diagnoses',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[3].definitions[0].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[3].definitions[1].description,
      },
    ],
  },
  {
    topic: 'New HIV diagnoses for Black women',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[3].definitions[1].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[3].definitions[4].description,
      },
    ],
  },
  {
    topic: 'HIV deaths',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[3].definitions[2].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[3].definitions[2].description,
      },
    ],
  },
  {
    topic: 'HIV deaths for Black women',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[3].definitions[1].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[3].definitions[5].description,
      },
    ],
  },
  {
    topic: 'Linkage to HIV Care',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[3].definitions[2].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[3].definitions[7].description,
      },
    ],
  },
  {
    topic: 'PrEP Coverage',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[3].definitions[3].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[3].definitions[6].description,
      },
    ],
  },
  {
    topic: 'HIV Stigma',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[3].definitions[4].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[3].definitions[8].description,
      },
    ],
  },
]

export const hivDataSources = [
  dataSourceMetadataList[8],
  dataSourceMetadataList[1],
]
