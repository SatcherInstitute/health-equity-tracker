export const metricDefinitionsArray = [
  {
    topic: 'Age-adjusted ratios',
    path: '',
    id: '#age-adjusted-ratios-metrics',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Adjusting for age allows for fairer comparison between populations, where age might be a confounding risk factor and the studied groups have different distributions of individuals per age group. By normalizing for age, we can paint a more accurate picture of undue burden of disease and death between populations.',
      },
      {
        key: 'Measurement Definition',
        description: `A statistical process applied to rates of disease, death, or other health outcomes that correlate with an individual's age.`,
      },
      {
        key: 'Examples to Explore',
        description: `As of October 2023, we are able to calculate these age-adjusted ratios for [HIV deaths](https://healthequitytracker.org/exploredata?mls=1.hiv-3.00&group1=All&dt1=hiv_deaths#age-adjusted-ratios), [COVID-19 deaths](https://healthequitytracker.org/exploredata?mls=1.covid-3.00&group1=All&dt1=covid_deaths#age-adjusted-ratios) and [COVID-19 hospitalizations](https://healthequitytracker.org/exploredata?mls=1.covid-3.00&group1=All&dt1=covid_hospitalizations#age-adjusted-ratios), and we present the findings in a distinct, age-adjusted table.`,
      },
    ],
  },
  {
    topic: 'Total cases per 100k people',
    path: '',
    id: '#per-100k-metrics',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Measuring total cases per 100,000 people allows for the standardized comparison of disease burden across different populations. This metric accounts for differences in population size and provides a clearer understanding of the prevalence and impact of a health condition on communities, making it valuable for identifying disparities.',
      },
      {
        key: 'Measurement Definition',
        description:
          'This metric normalizes for population size, allowing for comparisons across demographic groups. This metric is rounded to the nearest integer in the tracker. The total rate of occurrence of COVID-19 cases expressed per 100,000 people (i.e. 10,000 per 100k implies a 10% occurrence rate).',
      },
    ],
  },
  {
    topic: 'Share of total cases with unknown race and ethnicity',
    path: '',
    id: '#unknown-cases-metrics',
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
      {
        key: 'Example',
        description: `In this example, we use COVID-19 cases as the variable, and race and ethnicity as the demographic breakdown for simplicity. For example, a value of 20% for Georgia means that 20% of Georgia's reported cases had unknown race/ethnicity. This metric is rounded to one decimal place. In instances where this would round to 0%, two decimal places are used.`,
      },
    ],
  },
  {
    topic: 'Share of total cases',
    path: '',
    id: '#total-share-metrics',
    definitions: [
      {
        key: 'Health Equity Significance',
        description: `This calculation is done for every point in time for which we have data, allowing visualization of inequity relative to population, over time.`,
      },
      {
        key: 'Measurement Definition',
        description: `To demonstrate the often inequitable distribution of a condition or disease, we calculate each demographic group's relative inequity using the ${'<code>'}(OBSERVED - EXPECTED) / EXPECTED${'</code>'}. In this case, ${'<code>'}OBSERVED${'</code>'} is each group's percent share of the condition, and ${'<code>'}EXPECTED${'</code>'} is that group's share of the total population.`,
      },
    ],
  },
  {
    topic: 'Population share',
    path: '',
    id: '#population-share-metrics',
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
  {
    topic: 'Relative inequity',
    path: '',
    id: '#relative-inequity-metrics',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Highlighting the relative disadvantage experienced by specific communities or individuals helps identify and address disparities to achieve greater equity in health.',
      },
      {
        key: 'Measurement Definition',
        description: `Relative inequity refers to disparities in health outcomes, access to healthcare, or resource allocation between different demographic groups within a population. It measures the extent to which one group's health status or healthcare access deviates from the overall population's.`,
      },
      {
        key: 'Example',
        description: `In this example, we use COVID-19 cases as the variable, and race and ethnicity as the demographic breakdown for simplicity. COVID-19 vaccinations are an important tool for preventing the spread of the virus and protecting people from serious illness. However, vaccination rates vary significantly across different populations.`,
      },
    ],
  },
  {
    topic: 'Time-series',
    path: '',
    id: '#time-series-metrics',
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
]
