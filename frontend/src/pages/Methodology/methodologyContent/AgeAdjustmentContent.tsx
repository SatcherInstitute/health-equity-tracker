interface AgeAdjustmentSubListType {
  subDescription: JSX.Element | string
}

export interface AgeAdjustmentConfigType {
  topic: string
  subList?: AgeAdjustmentSubListType[]
  description?: JSX.Element | string
  snippet?: string
}

export const DataSourcingConfig = [
  {
    topic: 'Condition counts broken down by both age and race:',
    subList: [
      {
        subDescription: (
          <>
            For COVID-19, we use the{' '}
            <a href='https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Restricted-Access-Detai/mbd7-r32t'>
              CDC Case Surveillance Restricted Access Detailed Data
            </a>{' '}
            for this. It can break down by race and age to ten-year buckets. The
            age buckets are: <b>0-9</b>, <b>10-19</b>, <b>20-29</b>,{' '}
            <b>30-39</b>, <b>40-49</b>, <b>50-59</b>, <b>60-69</b>, <b>70-79</b>
            , <b>80+</b>
          </>
        ),
      },
      {
        subDescription: (
          <>
            For HIV, we use the{' '}
            <a href='https://gis.cdc.gov/grasp/nchhstpatlas/tables.html'>
              CDC Atlas data tables
            </a>
          </>
        ),
      },
    ],
  },
  {
    topic: 'Population counts broken down by both race and age:',
    subList: [
      {
        subDescription: (
          <>
            For COVID-19, the most reliable population source we could find with
            these particular age and race groupings were the{' '}
            <a href='https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-detail.html'>
              County Population by Characteristics
            </a>{' '}
            numbers provided by the census
          </>
        ),
      },
      {
        subDescription:
          'For HIV, the CDC Atlas provides population counts in the same tables as the condition counts',
      },
    ],
  },
]

export const AlgorithmConfig = [
  {
    topic: 'For each race/age combination, calculate the ‘age-specific rate’',
    snippet:
      'age_specific_rate = (Condition count for race A, age group 1) / (Population count of race A, age group 1)',
  },
  {
    topic: 'For each age group, calculate the ‘standard population’',
    snippet:
      'standard_population_age_group_1 = Population count Race A, Age group 1 + Population count Race B, Age group 1',
  },
  {
    topic: 'Calculate the expected count for each race/age combination:',
    description:
      "To do this we multiply the age-specific rate by the location's total population for that age group. The expected condition counts are the number of people of the race group who would have been expected to have this condition if the race group had the same age breakdown as the population as a whole.",
    snippet:
      'expected_condition_count = age_specific_rate * standard_population (for corresponding age group)',
  },
  {
    topic: 'Calculate the total expected condition count for each race group:',
    description:
      "For each race group, sum together the expected condition counts for each of that race's age groups.",
  },
  {
    topic: 'Calculate the age-adjusted condition ratios:',
    description:
      'For each non-White NH race, divide the total expected condition counts for that race by the expected White (NH) condition counts.',
  },
  {
    topic: 'Edge cases:',
    description: (
      <>
        If a ratio ends up being less than <b>0.1</b>, we report it on the
        tracker as <b>Insufficient Data</b> to prevent sharing potentially
        unreliable data.
      </>
    ),
  },
]
