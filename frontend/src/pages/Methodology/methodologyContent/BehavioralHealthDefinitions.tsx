interface DataItem {
  topic: string
  definitions: Array<{
    key: string
    description: string
  }>
  path: string
}

export const behavioralHealthDefinitions: DataItem[] = [
  {
    topic: 'Depression',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Depression is a mental illness that can cause a number of problems, including sadness, fatigue, and difficulty concentrating. It is more common in people of color and people with low incomes. Studying depression can help us understand why these disparities exist and how to address them.',
      },
      {
        key: 'Measurement Definition',
        description:
          'Adults who reported being told by a health professional that they have a depressive disorder including depression, major depression, minor depression or dysthymia.',
      },
      {
        key: 'Clinical Importance',
        description: '',
      },
      {
        key: 'Missing Data',
        description: '',
      },
      {
        key: 'Data Source(s)',
        description: '[]()',
      },
    ],
  },
  {
    topic: 'Excessive Drinking',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Excessive drinking is a major public health problem. It can lead to a number of health problems, including liver disease, heart disease, and cancer. It is more common in people of color and people with low incomes. Studying excessive drinking can help us understand why these disparities exist and how to address them.',
      },
      {
        key: 'Measurement Definition',
        description:
          'Adults who reported binge drinking— four or more [females] or five or more [males] drinks on one occasion in the past 30 days— or heavy drinking— eight or more [females] or 15 or more [males] drinks per week.',
      },
      {
        key: 'Clinical Importance',
        description: '',
      },
      {
        key: 'Missing Data',
        description: '',
      },
      {
        key: 'Data Source(s)',
        description: '[]()',
      },
    ],
  },
  {
    topic: 'Frequent Mental Distress',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Frequent mental distress is a common experience that can have a negative impact on physical and mental health. It is more common in people of color and people with low incomes. Studying frequent mental distress can help us understand why these disparities exist and how to address them.',
      },
      {
        key: 'Measurement Definition',
        description: '',
      },
      {
        key: 'Clinical Importance',
        description: '',
      },
      {
        key: 'Missing Data',
        description: '',
      },
      {
        key: 'Data Source(s)',
        description: '[]()',
      },
    ],
  },
  {
    topic: 'Suicide',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Suicide is a leading cause of death in the United States. People of color and people with low incomes are more likely to die by suicide. Studying suicide can help us understand why these disparities exist and how to address them.',
      },
      {
        key: 'Measurement Definition',
        description: 'Deaths due to intentional self-harm.',
      },
      {
        key: 'Clinical Importance',
        description: '',
      },
      {
        key: 'Missing Data',
        description: '',
      },
      {
        key: 'Data Source(s)',
        description: '[]()',
      },
    ],
  },
  {
    topic: 'Opioid and Other Substance Misuse',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'Non-medical drug use is a serious public health problem. People who use drugs are more likely to experience a variety of health problems, including HIV, hepatitis C, and overdose. People of color and people with low incomes are more likely to use substances. They are also more likely to die prematurely. Studying non-medical drug use in regard to health equity can help us to understand why certain populations are more likely to use drugs and how to address this problem.',
      },
      {
        key: 'Measurement Definition',
        description:
          'Adults who reported using prescription drugs non-medically (including pain relievers, stimulants, sedatives) or illicit drugs (excluding cannabis) in the last 12 months.',
      },
      {
        key: 'Clinical Importance',
        description: '',
      },
      {
        key: 'Missing Data',
        description: '',
      },
      {
        key: 'Data Source(s)',
        description: '[]()',
      },
    ],
  },
]
