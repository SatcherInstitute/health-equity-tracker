import { methodologyTableDefinitions } from './MethodologyTopicDefinitions'
import { conditionVariableDefinitions } from './ConditionVariableDefinitions'

interface DataItem {
  topic: string
  definitions: Array<{
    key: string
    description: string
  }>
  path: string
}

export const behavioralHealthDefinitionsArray: DataItem[] = [
  {
    topic: 'Depression',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[0].definitions[0].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[0].definitions[0].description,
      },
    ],
  },
  {
    topic: 'Excessive Drinking',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[0].definitions[1].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[0].definitions[1].description,
      },
    ],
  },
  {
    topic: 'Frequent Mental Distress',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[0].definitions[2].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[0].definitions[2].description,
      },
    ],
  },
  {
    topic: 'Suicide',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[0].definitions[4].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[0].definitions[4].description,
      },
    ],
  },
  {
    topic: 'Opioid and Other Substance Misuse',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: methodologyTableDefinitions[0].definitions[3].description,
      },
      {
        key: 'Measurement Definition',
        description: conditionVariableDefinitions[0].definitions[3].description,
      },
    ],
  },
]
