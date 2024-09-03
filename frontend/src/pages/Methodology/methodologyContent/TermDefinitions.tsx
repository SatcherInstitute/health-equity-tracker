import type { GlossaryTermItem } from '../methodologyComponents/GlossaryTerm'

export const termDefinitions: Record<string, GlossaryTermItem> = {
  'Direct standardization method': {
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
  'Internal standard population': {
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
          'A population with known age-specific rates and serves as the basis for calculating age-adjusted rates.',
      },
    ],
  },
  'Condition counts broken down by both age and race': {
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
  'Population counts broken down by both age and race': {
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
  'Age-specific rate': {
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
  'Standard population': {
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
  'Expected condition counts': {
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
  'Edge cases': {
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

  'Time-series': {
    topic: 'Time-series',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Identifies long-term trends and fluctuations in health disparities or access to healthcare services.',
      },
      {
        key: 'Measurement Definition',
        description:
          'A collection of data points or observations recorded over a series of distinct and equally spaced time intervals. These data are used to track changes in health-related metrics, outcomes, or disparities over time, allowing for the analysis of trends, patterns, and the impact of interventions or policies.',
      },
    ],
  },

  'Crude rates': {
    topic: 'Crude rates',
    path: '',
    definitions: [
      {
        key: 'Measurement Definition',
        description:
          'These rates represent the number of cases or events per unit of population without accounting for age differences. ',
      },
    ],
  },

  'Inequitable Burden': {
    topic: 'Inequitable burden',
    path: '',
    definitions: [
      {
        key: 'Measurement Definition',
        description:
          'The relative disproportionality of a specific health outcome experienced by a demographic group, normalized to their representation in the general population. It quantifies the extent to which a specific group is unfairly affected by a health issue compared to what would be expected based on their share of the overall population.',
      },
    ],
  },
}
