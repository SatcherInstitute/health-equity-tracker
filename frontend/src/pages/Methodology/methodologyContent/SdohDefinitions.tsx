import { methodologyTableDefinitions } from './MethodologyTopicDefinitions'
import { conditionVariableDefinitions } from './ConditionVariableDefinitions'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'

export const sdohDefinitionsArray = [
  {
    topic: 'Care Avoidance Due to Cost',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[5].definitions[0].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[5].definitions[0].description,
      },
    ],
  },
  {
    topic: 'Poverty',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[5].definitions[1].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[5].definitions[1].description,
      },
    ],
  },
  {
    topic: 'Uninsured Individuals',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[5].definitions[2].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[5].definitions[2].description,
      },
    ],
  },
  {
    topic: 'Preventable Hospitalization',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[5].definitions[3].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[5].definitions[3].description,
      },
    ],
  },
]

export const sdohDataSources = [
  dataSourceMetadataMap.acs,
  dataSourceMetadataMap.ahr,
  dataSourceMetadataMap.cdc_svi_county,
]
