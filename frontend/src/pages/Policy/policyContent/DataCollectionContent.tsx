interface DatasetItem {
  label: string
  included: boolean
}

interface Dataset {
  datasetName: string
  datasetNameDetails?: string
  items: DatasetItem[]
}

export const gunViolenceDatasets: Dataset[] = [
  {
    datasetName: 'Gun Deaths',
    datasetNameDetails: '(Youth-specific)',
    items: [
      { label: 'Breakdowns by race/ethnicity', included: true },
      { label: 'Breakdowns by age', included: false },
      { label: 'Breakdowns by sex', included: false },
      { label: 'Breakdowns by city size', included: false },
    ],
  },

  {
    datasetName: 'Gun Homicides',
    datasetNameDetails: '(Black Men-specific)',
    items: [
      { label: 'Breakdowns by race/ethnicity', included: false },
      { label: 'Breakdowns by age', included: true },
      { label: 'Breakdowns by sex', included: false },
      { label: 'Breakdowns by city size', included: true },
    ],
  },
  {
    datasetName: 'Gun Homicides and Suicides',
    datasetNameDetails: '',
    items: [
      { label: 'Breakdowns by race/ethnicity', included: true },
      { label: 'Breakdowns by age', included: true },
      { label: 'Breakdowns by sex', included: true },
      { label: 'Breakdowns by city size', included: false },
    ],
  },
]

export const gvDefinitions = [
  {
    topic: 'Gun deaths (children)',
    measurementDefinition:
      'Deaths of individuals under the age of 18 caused by firearms.',
  },
  {
    topic: 'Gun deaths (young adults)',
    measurementDefinition:
      'Deaths of individuals between the ages of 18-25 caused by firearms.',
  },
  {
    topic: 'Gun homicides (Black Men)',
    measurementDefinition:
      'Deaths of Black or African-American (NH) males, caused by gun homicides.',
  },
  {
    topic: 'Gun homicides',
    measurementDefinition:
      'Deaths caused by firearms used with the intent to harm others.',
  },
  {
    topic: 'Gun suicides',
    measurementDefinition:
      'Deaths resulting from individuals using firearms to inflict self-harm.',
  },
]
