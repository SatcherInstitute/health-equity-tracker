export interface AgeAdjustmentConfig {
  topic: string
  subList?: Array<{ subDescription: JSX.Element | string }>
  description?: JSX.Element | string
  snippet?: string
}

export const TableOperationsTypes = {
  divide: '/',
  multiply: '*',
  add: '+',
} as const

export type TableOperationsKeys = keyof typeof TableOperationsTypes

export interface TableCalculation {
  operation: TableOperationsKeys
  operands: number[]
  resultOptions?: {
    minDigit: number
    maxDigit: number
  }
  appendSymbol?: string
}

export interface AgeInfo {
  age: string
  value: number
}

export type TableData = string | TableCalculation | AgeInfo

export interface AgeAdjustTableConfig {
  head: string[]
  body: TableData[][]
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

export const exampleTableConfig = {
  head: ['Race Group', 'Age Group', 'HIV Deaths', 'Population'],
  body: [
    ['Race A', '0-29', '50', '600,000'],
    ['Race A', '30-59', '500', '800,000'],
    ['Race A', '60+', '5,000', '200,000'],
    ['Race B', '0-29', '20', '200,000'],
    ['Race B', '30-59', '200', '300,000'],
    ['Race B', '60', '800', '60,000'],
  ],
}

export const ageSpecificTableConfig: AgeAdjustTableConfig = {
  head: [
    'Race Group',
    'Age Group',
    'HIV Deaths',
    'Population',
    'Age-Specific HIV Death Rate',
  ],
  body: [
    [
      'Race A',
      '0-29',
      '50',
      '600,000',
      { operation: 'divide', operands: [50, 600_000] },
    ],
    [
      'Race A',
      '30-59',
      '500',
      '800,000',
      { operation: 'divide', operands: [500, 800_000] },
    ],
    [
      'Race A',
      '60+',
      '5,000',
      '200,000',
      { operation: 'divide', operands: [5000, 200_000] },
    ],
    [
      'Race B',
      '0-29',
      '20',
      '200,000',
      { operation: 'divide', operands: [20, 200_000] },
    ],
    [
      'Race B',
      '30-59',
      '200',
      '300,000',
      { operation: 'divide', operands: [200, 300_000] },
    ],
    [
      'Race B',
      '60+',
      '800',
      '60,000',
      { operation: 'divide', operands: [800, 60_000] },
    ],
  ],
}

export const standardPopulationTableConfig: AgeAdjustTableConfig = {
  head: ['Race Group', 'Age Group', 'Standard Population'],
  body: [
    ['Total (A & B)', '0-29', { operation: 'add', operands: [600000, 200000] }],
    [
      'Total (A & B)',
      '30-59',
      { operation: 'add', operands: [800000, 300000] },
    ],
    ['Total (A & B)', '60+', { operation: 'add', operands: [200000, 60000] }],
  ],
}

export const expectedProductTableConfig: AgeAdjustTableConfig = {
  head: [
    'Race Group',
    'Age Group',
    'Age-Specific HIV Death Rate',
    'Standard Population',
    'Expected HIV Deaths',
  ],
  body: [
    [
      'Race A',
      '0-29',
      '0.00008333',
      { age: 'for Ages 0-29:', value: 800000 },
      { operation: 'multiply', operands: [0.00008333, 800000] },
    ],
    [
      'Race A',
      '30-59',
      '0.000625',
      { age: 'for Ages 30-59:', value: 1100000 },
      { operation: 'multiply', operands: [0.000625, 1100000] },
    ],
    [
      'Race A',
      '60+',
      '0.025',
      { age: 'for Ages 60+:', value: 260000 },
      { operation: 'multiply', operands: [0.025, 260000] },
    ],
    [
      'Race B',
      '0-29',
      '0.0001',
      { age: 'for Ages 0-29:', value: 800000 },
      { operation: 'multiply', operands: [0.0001, 800000] },
    ],
    [
      'Race B',
      '30-59',
      '0.00066667',
      { age: 'for Ages 30-59:', value: 1100000 },
      {
        operation: 'multiply',
        operands: [0.00066667, 1100000],
      },
    ],
    [
      'Race B',
      '60+',
      '0.01333333',
      { age: 'for Ages 60+:', value: 260000 },
      { operation: 'multiply', operands: [0.01333333, 260000] },
    ],
  ],
}

export const expectedSumTableConfig: AgeAdjustTableConfig = {
  head: ['Race Group', 'TotalExpected HIV Deaths'],
  body: [
    ['Race A', { operation: 'add', operands: [66.67, 687.5, 6500] }],
    [
      'Race B',
      {
        operation: 'add',
        operands: [80, 733.33, 3466.67],
      },
    ],
  ],
}

export const deathRatioTableConfig: AgeAdjustTableConfig = {
  head: ['Race Group', 'TotalExpected HIV Deaths', 'Age-Adjusted Death Ratio'],
  body: [
    [
      'Race A',
      '7,254.17',
      {
        operation: 'divide',
        operands: [7254.17, 7254.17],
        resultOptions: { minDigit: 1, maxDigit: 1 },
        appendSymbol: 'x',
      },
    ],
    [
      'Race B',
      '4,280',
      {
        operation: 'divide',
        operands: [4280, 7254.17],
        resultOptions: { minDigit: 1, maxDigit: 1 },
        appendSymbol: 'x',
      },
    ],
  ],
}
