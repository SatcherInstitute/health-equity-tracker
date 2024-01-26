import { methodologyTableDefinitions } from './MethodologyTopicDefinitions'
import { conditionVariableDefinitions } from './ConditionVariableDefinitions'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { ageAdjustmentDefinitionsArray } from './AgeAdjustmentDefinitions'

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
        description: `For COVID-19, we use the [CDC Case Surveillance Restricted Access Detailed Data]
          (https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Restricted-Access-Detai/mbd7-r32t) for this. It can break down by race and age to ten-year buckets. The age buckets are: <code>0-9</code>, <code>10-19</code>, <code>20-29</code>, <code>30-39</code>, <code>40-49</code>,  <code>50-59</code>, <code>60-69</code>, <code>70-79</code>, <code>80+</code>`,
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
        description: `For COVID-19, the most reliable population source we could find with these particular age and race groupings were the [County Population by Characteristics](https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-detail.html) numbers provided by the census.`,
      },
    ],
  },
]

export const covidDataSources = [
  dataSourceMetadataMap.cdc_restricted,
  dataSourceMetadataMap.acs,
  dataSourceMetadataMap.decia_2010_territory_population,
  dataSourceMetadataMap.decia_2020_territory_population,
  dataSourceMetadataMap.cdc_vaccination_county,
  dataSourceMetadataMap.cdc_vaccination_national,
  dataSourceMetadataMap.kff_vaccination,
  dataSourceMetadataMap.covid_tracking_project,
]
