import { metricDefinitionsArray } from './MetricsDefinitions'

export const ageAdjustmentDefinitionsArray = [
  {
    topic: metricDefinitionsArray[0].topic,
    path: '',
    definitions: [
      {
        key: metricDefinitionsArray[0].definitions[0].key,
        description: metricDefinitionsArray[0].definitions[0].description,
      },
      {
        key: metricDefinitionsArray[0].definitions[1].key,
        description: metricDefinitionsArray[0].definitions[1].description,
      },
      {
        key: metricDefinitionsArray[0].definitions[2].key,
        description: metricDefinitionsArray[0].definitions[2].description,
      },
    ],
  },
  {
    topic: 'Direct standardization method',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'It is significant for comparing health outcomes while removing the influence of differences in age distribution.',
      },
      {
        key: 'Measurement Definition',
        description:
          'This method in health equity data visualization involves recalculating age-specific rates for each subgroup using the same standard population.',
      },
    ],
  },
  {
    topic: 'Internal standard population',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'An internal standard population is a reference population used in age-adjusted ratios to facilitate comparisons between different subgroups.',
      },
      {
        key: 'Measurement Definition',
        description:
          'It is defined as a population with known age-specific rates and serves as the basis for calculating age-adjusted rates.',
      },
    ],
  },
  {
    topic: 'Condition counts broken down by both age and race',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Such data is essential for understanding how health conditions affect different demographic groups, allowing for targeted interventions.',
      },
      {
        key: 'Measurement Definition',
        description:
          'This refers to data that provides a detailed breakdown of health condition counts, considering both age and race. ',
      },
    ],
  },
  {
    topic: 'Population counts broken down by both age and race',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'This helps identify disparities in population distribution and informing policies aimed at addressing health inequities.',
      },
      {
        key: 'Measurement Definition',
        description:
          'These counts provide a demographic profile that considers both age and race.',
      },
    ],
  },
  {
    topic: 'Age-specific rate',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'This rate is significant for examining health disparities within these groups while accounting for age-related variations in health outcomes',
      },
      {
        key: 'Measurement Definition',
        description:
          'Age-specific rates are calculated for specific age groups.',
      },
    ],
  },
  {
    topic: 'Standard population',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'It is typically chosen to represent a population with a known age distribution, allowing for comparisons of health outcomes across different populations or time periods.',
      },
      {
        key: 'Measurement Definition',
        description:
          'A standard population serves as a reference for age-adjusted ratios.',
      },
    ],
  },
  {
    topic: 'Expected condition counts',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'These counts help assess whether observed counts deviate from what would be expected based on age distribution.',
      },
      {
        key: 'Measurement Definition',
        description:
          'Expected condition counts represent the number of cases that would be expected in a population if it had the same age-specific rates as a standard population. ',
      },
    ],
  },
  {
    topic: 'Edge cases',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Handling these cases is significant to avoid misinterpretations of health disparities.',
      },
      {
        key: 'Measurement Definition',
        description:
          'In the context of health equity data visualization, "edge cases" may refer to outliers or unique situations where traditional methods of age-adjustment may not apply as effectively.',
      },
    ],
  },
]
