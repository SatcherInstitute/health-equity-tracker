import type { GlossaryTermItem } from '../methodologyComponents/GlossaryTerm'

export const metricDefinitions: Record<string, GlossaryTermItem> = {
  'Age-adjusted ratios': {
    path: '',
    id: 'age-adjusted-ratios-metrics',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Adjusting for age allows for fairer comparison between populations, where age might be a confounding risk factor and the studied groups have different distributions of individuals per age group. By normalizing for age, we can paint a more accurate picture of undue burden of disease and death between populations.',
      },
      {
        key: 'Measurement Definition',
        description:
          "A statistical process applied to rates of disease, death, or other health outcomes that correlate with an individual's age.",
      },
    ],
  },
  'Percent rate': {
    path: '',
    id: 'percent-rate-metrics',
    definitions: [
      {
        key: 'Measurement Definition',
        description:
          'A percent rate, in health equity data visualization, is a measure that expresses a particular metric as a percentage of a given population.',
      },
    ],
  },
  'Percent share': {
    path: '',
    id: 'percent-share-metrics',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Measuring percent share helps identify disproportionate impacts on different demographic groups by comparing their share of a health outcome to their share of the total population.',
      },
      {
        key: 'Measurement Definition',
        description:
          "Percent share represents the proportion of a specific subgroup's contribution to a total metric, often expressed as a percentage. When compared to population share, it reveals whether certain groups are experiencing outcomes at rates higher or lower than expected.",
      },
    ],
  },
  'Population share': {
    path: '',
    id: 'population-share-metrics',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Measuring population share helps policymakers and healthcare organizations allocate resources more equitably. When certain demographic groups are underrepresented in healthcare access or have worse health outcomes, it may indicate a need to invest in programs and services that address these disparities.',
      },
      {
        key: 'Measurement Definition',
        description:
          'The percentage of the total population that identified as a particular race/ethnicity in the ACS (American Community Survey). This metric is rounded to one decimal place. In instances where this would round to 0%, two decimal places are used.',
      },
    ],
  },
  'Relative inequity': {
    path: '',
    id: 'relative-inequity-metrics',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Highlighting the relative disadvantage experienced by specific communities or individuals helps identify and address disparities to achieve greater equity in health.',
      },
      {
        key: 'Measurement Definition',
        description:
          "Relative inequity refers to disparities in health outcomes, access to healthcare, or resource allocation between different demographic groups within a population. It measures the extent to which one group's health status or healthcare access deviates from the overall population's.",
      },
    ],
  },
  'Share of total cases': {
    path: '',
    id: 'total-share-metrics',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'This calculation is done for every point in time for which we have data, allowing visualization of inequity relative to population, over time.',
      },
      {
        key: 'Measurement Definition',
        description:
          "To demonstrate the often inequitable distribution of a condition or disease, we calculate each demographic group's relative inequity using the formula: (OBSERVED - EXPECTED) / EXPECTED. OBSERVED is each group's percent share of the condition, and EXPECTED is that group's share of the total population.",
      },
    ],
  },
  'Share of total cases with unknown races': {
    path: '',
    id: 'unknown-cases-metrics',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Measuring the share of total cases with unknown race and ethnicity is significant for health equity because it signals potential underreporting or lack of data collection in specific demographic groups, making it challenging to address health inequities effectively. Addressing these gaps is crucial to ensure that healthcare resources and interventions are targeted to the most vulnerable populations, promoting equitable health outcomes.',
      },
      {
        key: 'Measurement Definition',
        description:
          'Within a locale, the percentage of cases that reported unknown race/ethnicity.',
      },
    ],
  },
  'Social Vulnerability Index': {
    path: 'svi',
    id: 'svi',
    definitions: [
      {
        key: 'Measurement Definition',
        description:
          'A Social Vulnerability Index (SVI) score provides a single numerical value that reflects the overall status or level of equity in a given context, facilitating easy comparisons and policy assessments.',
      },
    ],
  },
  'Time-series': {
    path: '',
    id: 'time-series-metrics',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Time-series data allows for the visualization of health inequities over time, enabling researchers and policymakers to track the evolution of disparities and assess the effectiveness of interventions. By examining trends across different demographic groups, we can identify persistent patterns of inequity and understand how external factors may disproportionately impact certain populations.',
      },
      {
        key: 'Measurement Definition',
        description:
          'Time-series data represents health outcomes tracked chronologically, typically using the earliest available date for each case (such as symptom onset, positive test date, or initial report date). Each data point represents the incidence rate - the number of new cases reported within a specific time period, usually monthly intervals.',
      },
      {
        key: 'Data Collection Notes',
        description:
          'Time-series analysis uses the earliest reliable date field available for each case to categorize when health events occurred. This approach provides the most accurate temporal distribution possible while acknowledging that for complex outcomes like deaths or hospitalizations, the plotted date may represent when the case was first identified rather than when the specific outcome occurred.',
      },
      {
        key: 'Methodology',
        description:
          'Only confirmed cases are included in rate calculations and inequitable distribution metrics. When data shows zero cases for a demographic group in a time period, unconfirmed cases may still exist but have not been officially reported. Geographic jurisdictions that report zero cases for an entire demographic group across all time periods are excluded from visualizations, as this typically indicates lack of data collection for that population.',
      },
    ],
  },
  'Total cases per 100k people': {
    path: '',
    id: 'per-100k-metrics',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Measuring total cases per 100,000 people allows for the standardized comparison of disease burden across different populations. This metric accounts for differences in population size and provides a clearer understanding of the prevalence and impact of a health condition on communities, making it valuable for identifying disparities.',
      },
      {
        key: 'Measurement Definition',
        description:
          'This metric normalizes for population size, allowing for comparisons across demographic groups. This metric is rounded to the nearest integer in the tracker. The total rate of occurrence of cases expressed per 100,000 people (i.e. 10,000 per 100k implies a 10% occurrence rate).',
      },
    ],
  },
}