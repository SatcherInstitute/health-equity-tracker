import { methodologyTableDefinitions } from './MethodologyTopicDefinitions'
import { conditionVariableDefinitions } from './ConditionVariableDefinitions'
import { ageAdjustmentDefinitionsArray } from './AgeAdjustmentDefinitions'

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
  {
    topic: ageAdjustmentDefinitionsArray[3].topic,
    path: '',
    definitions: [
      {
        key: ageAdjustmentDefinitionsArray[3].definitions[0].key,
        description:
          ageAdjustmentDefinitionsArray[3].definitions[0].description,
      },
      {
        key: ageAdjustmentDefinitionsArray[3].definitions[1].key,
        description:
          ageAdjustmentDefinitionsArray[3].definitions[1].description,
      },
      {
        key: 'Age-Adjusted Ratio Data Sourcing',
        description: `For HIV, we use the [CDC Atlas data tables](https://gis.cdc.gov/grasp/nchhstpatlas/tables.html).`,
      },
    ],
  },
  {
    topic: ageAdjustmentDefinitionsArray[4].topic,
    path: '',
    definitions: [
      {
        key: ageAdjustmentDefinitionsArray[4].definitions[0].key,
        description:
          ageAdjustmentDefinitionsArray[4].definitions[0].description,
      },
      {
        key: ageAdjustmentDefinitionsArray[4].definitions[1].key,
        description:
          ageAdjustmentDefinitionsArray[4].definitions[1].description,
      },
      {
        key: 'Age-Adjusted Ratio Data Sourcing',
        description: `For HIV, the CDC Atlas provides population counts in the
        [same tables](https://gis.cdc.gov/grasp/nchhstpatlas/tables.html) as the condition counts.`,
      },
    ],
  },
]
