interface DataItem {
  topic: string
  definitions: Array<{
    key: string
    description: string
  }>
  path: string
}

export const covidDefinitions: DataItem[] = [
  {
    topic: 'Health Equity Significance',
    path: '',
    definitions: [
      {
        key: 'covid',
        description:
          'COVID-19 has had a disproportionate impact on certain populations, including people of color, people with disabilities, and people living in poverty. Studying COVID-19 in regard to health equity can help us to understand why these disparities exist and how to address them.',
      },
      {
        key: 'covid_vaccinations',
        description:
          'COVID-19 vaccinations are an important tool for preventing the spread of the virus and protecting people from serious illness. However, vaccination rates vary significantly across different populations. Studying COVID-19 vaccinations in regard to health equity can help us to understand why these disparities exist and how to increase vaccination rates among all populations.',
      },
    ],
  },
  {
    topic: 'Metrics',
    path: '',
    definitions: [
      {
        key: 'Total COVID-19 cases per 100k people',
        description:
          'The total rate of occurrence of COVID-19 cases expressed per 100,000 people (i.e. 10,000 per 100k implies a 10% occurrence rate). This metric normalizes for population size, allowing for comparisons across demographic groups. This metric is rounded to the nearest integer in the tracker.',
      },
      {
        key: 'Share of total COVID-19 cases with unknown race and ethnicity',
        description:
          'Within a locale, the percentage of COVID-19 cases that reported unknown race/ethnicity. For example, a value of 20% for Georgia means that 20% of Georgia’s reported cases had unknown race/ethnicity. This metric is rounded to one decimal place. In instances where this would round to 0%, two decimal places are used.',
      },
      {
        key: 'Share of total COVID-19 cases',
        description: `To demonstrate the often inequitable distribution of a condition or disease, we calculate each demographic group’s relative inequity using the ${'<code>'}(OBSERVED - EXPECTED) / EXPECTED${'</code>'}. In this case, ${'<code>'}OBSERVED${'</code>'} is each group's percent share of the condition, and ${'<code>'}EXPECTED${'</code>'} is that group's share of the total population. This calculation is done for every point in time for which we have data, allowing visualization of inequity relative to population, over time.`,
      },
      {
        key: 'Population share',
        description:
          'The percentage of the total population that identified as a particular race/ethnicity in the ACS survey. This metric is rounded to one decimal place. In instances where this would round to 0%, two decimal places are used.',
      },
      {
        key: 'Relative inequity for COVID-19 cases',
        description:
          'COVID-19 vaccinations are an important tool for preventing the spread of the virus and protecting people from serious illness. However, vaccination rates vary significantly across different populations. Studying COVID-19 vaccinations in regard to health equity can help us to understand why these disparities exist and how to increase vaccination rates among all populations.',
      },
    ],
  },
  {
    topic: 'Condition Variables',
    path: '',
    definitions: [
      {
        key: 'COVID-19 cases',
        description:
          'A COVID-19 case is an individual who has been determined to have COVID-19 using a set of criteria known as a “case definition”. Cases can be classified as suspect, probable, or confirmed. CDC counts include probable and confirmed cases and deaths. Suspect cases and deaths are excluded.',
      },
      {
        key: 'COVID-19 deaths',
        description: 'The number of people who died due to COVID-19.',
      },
      {
        key: 'COVID-19 hospitalizations',
        description:
          'The number of people hospitalized at any point while ill with COVID-19.',
      },
      {
        key: 'COVID-19 vaccinations',
        description:
          'For the national level and most states this indicates people who have received at least one dose of a COVID-19 vaccine.',
      },
    ],
  },
]
