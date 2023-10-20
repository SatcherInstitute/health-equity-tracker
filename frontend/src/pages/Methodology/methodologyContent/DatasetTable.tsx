interface DataItem {
  topic: string
  definitions: Array<{
    key: string
    description: string
  }>
  path: string
}

export const dataCatalog: DataItem[] = [
  {
    topic: 'CDC Case Surveillance Restricted Access Detailed Data',
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description:
          'This dataset provides comprehensive information on confirmed COVID-19 deaths, cases, and hospitalizations at national, state, and county levels.',
      },
      {
        key: 'Origin',
        description:
          'Centers for Disease Control and Prevention, COVID-19 Response.',
      },
      {
        key: 'Time Series Range',
        description: 'January 2020 - Current',
      },
      {
        key: 'Geographic Level',
        description: 'National, State, County',
      },
      {
        key: 'Demographic Granularity',
        description: 'Race/ethnicity, age, sex',
      },
      {
        key: 'Update Frequency',
        description: 'Monthly',
      },
      {
        key: 'Source Website',
        description:
          '[data.cdc.gov](https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Restricted-Access-Detai/mbd7-r32t)',
      },
      {
        key: 'Notes',
        description:
          'The numbers of confirmed COVID-19 deaths, cases, and hospitalizations nationally and at the state and county levels. The data source is Centers for Disease Control and Prevention, COVID-19 Response. COVID-19 Case Surveillance Data Access, Summary, and Limitations. The last case data included is two (2) weeks before they most recent release from the CDC. The CDC does not take responsibility for the scientific validity or accuracy of methodology, results, statistical analyses, or conclusions presented. We only present the data as rates that are calculated with the American Community Survey (ACS) 2019 5-year estimates, to view the raw data you must apply for access on the CDC website linked above.',
      },
      {
        key: 'Limitations',
        description:
          'The CDC does not take responsibility for the scientific validity or accuracy of methodology, results, statistical analyses, or conclusions presented.',
      },
    ],
  },
  {
    topic: 'American Community Survey (ACS) 5-year estimates',
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description:
          'Yearly data on population percentages, health insurance rates, and poverty rates at different geographic levels.',
      },
      {
        key: 'Origin',
        description: 'U.S Census Bureau',
      },
      {
        key: 'Time Series Range',
        description: 'Annual',
      },
      {
        key: 'Geographic Level',
        description: 'National, State, County',
      },
      {
        key: 'Demographic Granularity',
        description: 'Race/ethnicity, age, sex',
      },
      {
        key: 'Update Frequency',
        description: 'Annual',
      },
      {
        key: 'Source Website',
        description: '[]()',
      },
      {
        key: 'Notes',
        description: '',
      },
    ],
  },
  {
    topic: 'Census 2010 & 2020 Decennial Island Areas',
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description: 'Population data for U.S territories in 2010 and 2020.',
      },
      {
        key: 'Origin',
        description: 'U.S Census Bureau',
      },
      {
        key: 'Time Series Range',
        description: '2010 and 2020',
      },
      {
        key: 'Geographic Level',
        description: 'Territory (2010), Territory/County-Equivalent (2020)',
      },
      {
        key: 'Demographic Granularity',
        description: 'Race/ethnicity, age, sex',
      },
      {
        key: 'Update Frequency',
        description: 'None',
      },
      {
        key: 'Source Website',
        description: '[]()',
      },
      {
        key: 'Notes',
        description:
          'These datasets provide population information not available in the ACS 5-year estimates.',
      },
    ],
  },
  {
    topic: 'County Population by Characteristics: 2010-2019',
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description:
          'Population data by race, age, and sex at the county level.',
      },
      {
        key: 'Origin',
        description: 'U.S Census Bureau',
      },
      {
        key: 'Time Series Range',
        description: '2010-2019',
      },
      {
        key: 'Geographic Level',
        description: 'State, County',
      },
      {
        key: 'Demographic Granularity',
        description: 'Race/ethnicity, age, sex',
      },
      {
        key: 'Update Frequency',
        description: 'None',
      },
      {
        key: 'Source Website',
        description: '[]()',
      },
      {
        key: 'Notes',
        description: 'Utilizes single-year estimates from 2019.',
      },
    ],
  },
  {
    topic: 'CDC SVI County Rankings',
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description:
          'Data capturing the social vulnerability of communities in the event of hazardous occurrences.',
      },
      {
        key: 'Origin',
        description: 'CDC',
      },
      {
        key: 'Time Series Range',
        description: '',
      },
      {
        key: 'Geographic Level',
        description: 'County',
      },
      {
        key: 'Demographic Granularity',
        description: '',
      },
      {
        key: 'Update Frequency',
        description: 'Biannual',
      },
      {
        key: 'Source Website',
        description: '[]()',
      },
      {
        key: 'Notes',
        description: '',
      },
    ],
  },
  {
    topic: 'CDC COVID-19 Vaccinations in the United States',
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description:
          'Data on US COVID-19 vaccine administration and equity at the county level.',
      },
      {
        key: 'Origin',
        description: 'CDC',
      },
      {
        key: 'Time Series Range',
        description: '',
      },
      {
        key: 'Geographic Level',
        description: 'County',
      },
      {
        key: 'Demographic Granularity',
        description: 'Race/ethnicity, age, sex',
      },
      {
        key: 'Update Frequency',
        description: 'Daily',
      },
      {
        key: 'Source Website',
        description: '[]()',
      },
      {
        key: 'Notes',
        description: '',
      },
    ],
  },
  {
    topic: 'CDC NCHHSTP AtlasPlus',
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description:
          'Primary source of HIV data in the US, detailing HIV diagnoses, deaths, and more.',
      },
      {
        key: 'Origin',
        description: 'CDC',
      },
      {
        key: 'Time Series Range',
        description: 'Yearly',
      },
      {
        key: 'Geographic Level',
        description: 'National, State, County',
      },
      {
        key: 'Demographic Granularity',
        description: 'Race/ethnicity, age, sex',
      },
      {
        key: 'Update Frequency',
        description: 'Yearly',
      },
      {
        key: 'Source Website',
        description: '[]()',
      },
      {
        key: 'Notes',
        description: '',
      },
    ],
  },
  {
    topic: 'Kaiser Family Foundation COVID-19 Indicators',
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description:
          'State-level vaccination data based on analysis of public state website data.',
      },
      {
        key: 'Origin',
        description: 'Kaiser Family Foundation',
      },
      {
        key: 'Time Series Range',
        description: '',
      },
      {
        key: 'Geographic Level',
        description: 'State',
      },
      {
        key: 'Demographic Granularity',
        description: 'Race/ethnicity',
      },
      {
        key: 'Update Frequency',
        description: 'Biweekly',
      },
      {
        key: 'Source Website',
        description: '[]()',
      },
      {
        key: 'Notes',
        description: '',
      },
    ],
  },
  {
    topic: `America's Health Rankings`,
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description:
          'Data on multiple health conditions and indicators at state level.',
      },
      {
        key: 'Origin',
        description: `America's Health Rankings`,
      },
      {
        key: 'Time Series Range',
        description: 'Annual',
      },
      {
        key: 'Geographic Level',
        description: 'National, State',
      },
      {
        key: 'Demographic Granularity',
        description: 'Race/ethnicity, age, sex',
      },
      {
        key: 'Update Frequency',
        description: 'Annual',
      },
      {
        key: 'Source Website',
        description: '[]()',
      },
      {
        key: 'Notes',
        description: '',
      },
    ],
  },
  {
    topic: 'Bureau of Justice Statistics (BJS) & Vera Institute of Justice',
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description: 'Rates of individuals confined in various facilities.',
      },
      {
        key: 'Origin',
        description: 'BJS & Vera Institute of Justice',
      },
      {
        key: 'Time Series Range',
        description: '',
      },
      {
        key: 'Geographic Level',
        description: 'National, State (BJS) | County (Vera)',
      },
      {
        key: 'Demographic Granularity',
        description:
          'Race/ethnicity, age, sex (BJS) | Race/ethnicity, sex (Vera)',
      },
      {
        key: 'Update Frequency',
        description: 'Annually (BJS) | None (Vera)',
      },
      {
        key: 'Source Website',
        description: '[]()',
      },
      {
        key: 'Notes',
        description: '',
      },
    ],
  },
  {
    topic:
      'Center for American Women in Politics (CAWP) & The @unitedstates Project',
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description: 'Information on legislators by gender and race/ethnicity.',
      },
      {
        key: 'Origin',
        description: 'CAWP & The @unitedstates Project',
      },
      {
        key: 'Time Series Range',
        description:
          'U.S. Congress: 1915 - Current, State Legislatures: 1983 - Current (CAWP)',
      },
      {
        key: 'Geographic Level',
        description: 'National, State',
      },
      {
        key: 'Demographic Granularity',
        description: 'Race/ethnicity',
      },
      {
        key: 'Update Frequency',
        description: 'Monthly (CAWP) | At least monthly (@unitedstates)',
      },
      {
        key: 'Source Website',
        description: '[]()',
      },
      {
        key: 'Notes',
        description: '',
      },
    ],
  },
  {
    topic: 'Geographic Context - Composite Dataset',
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description:
          'A composite dataset created for faster loading, including data from ACS and CDC.',
      },
      {
        key: 'Origin',
        description: 'Satcher Institute',
      },
      {
        key: 'Time Series Range',
        description: 'Yearly',
      },
      {
        key: 'Geographic Level',
        description: 'National, State, County',
      },
      {
        key: 'Demographic Granularity',
        description: '',
      },
      {
        key: 'Update Frequency',
        description: 'Yearly',
      },
      {
        key: 'Source Website',
        description: '[]()',
      },
      {
        key: 'Notes',
        description: '',
      },
    ],
  },
  {
    topic: '',
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description: '',
      },
      {
        key: 'Origin',
        description: '',
      },
      {
        key: 'Time Series Range',
        description: '',
      },
      {
        key: 'Geographic Level',
        description: 'National, State, County',
      },
      {
        key: 'Demographic Granularity',
        description: 'Race/ethnicity, age, sex',
      },
      {
        key: 'Update Frequency',
        description: 'Monthly',
      },
      {
        key: 'Source Website',
        description: '[]()',
      },
      {
        key: 'Notes',
        description: '',
      },
      {
        key: 'Limitations',
        description: '',
      },
    ],
  },
  {
    topic: '',
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description: '',
      },
      {
        key: 'Origin',
        description: '',
      },
      {
        key: 'Time Series Range',
        description: '',
      },
      {
        key: 'Geographic Level',
        description: 'National, State, County',
      },
      {
        key: 'Demographic Granularity',
        description: 'Race/ethnicity, age, sex',
      },
      {
        key: 'Update Frequency',
        description: 'Monthly',
      },
      {
        key: 'Source Website',
        description: '[]()',
      },
      {
        key: 'Notes',
        description: '',
      },
    ],
  },
  {
    topic: '',
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description: '',
      },
      {
        key: 'Origin',
        description: '',
      },
      {
        key: 'Time Series Range',
        description: '',
      },
      {
        key: 'Geographic Level',
        description: 'National, State, County',
      },
      {
        key: 'Demographic Granularity',
        description: 'Race/ethnicity, age, sex',
      },
      {
        key: 'Update Frequency',
        description: 'Monthly',
      },
      {
        key: 'Source Website',
        description: '[]()',
      },
      {
        key: 'Notes',
        description: '',
      },
    ],
  },
  {
    topic: '',
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description: '',
      },
      {
        key: 'Origin',
        description: '',
      },
      {
        key: 'Time Series Range',
        description: '',
      },
      {
        key: 'Geographic Level',
        description: 'National, State, County',
      },
      {
        key: 'Demographic Granularity',
        description: 'Race/ethnicity, age, sex',
      },
      {
        key: 'Update Frequency',
        description: 'Monthly',
      },
      {
        key: 'Source Website',
        description: '[]()',
      },
      {
        key: 'Notes',
        description: '',
      },
    ],
  },
  {
    topic: `Covid Tracking Project's Racial Data Tracker`,
    path: '',
    definitions: [
      {
        key: 'Introduction',
        description:
          'The numbers of confirmed COVID-19 deaths, cases, hospitalizations, and tests at the state level.',
      },
      {
        key: 'Origin',
        description: '',
      },
      {
        key: 'Time Series Range',
        description: '',
      },
      {
        key: 'Geographic Level',
        description: 'National, State, County',
      },
      {
        key: 'Demographic Granularity',
        description: 'Race/ethnicity, age, sex',
      },
      {
        key: 'Update Frequency',
        description: 'Monthly',
      },
      {
        key: 'Source Website',
        description: '[]()',
      },
      {
        key: 'Notes',
        description:
          'Please note that Covid Tracking Project data is not used for any visualizations on the tracker, it is only available for download.',
      },
    ],
  },
]
