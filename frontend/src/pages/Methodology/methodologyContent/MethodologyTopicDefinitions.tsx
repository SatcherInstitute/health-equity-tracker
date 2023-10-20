import {
  BEHAVIORAL_HEALTH_LINK,
  CHRONIC_DISEASE_LINK,
  COVID_19_LINK,
  HIV_LINK,
  PDOH_LINK,
  SDOH_LINK,
} from '../../../utils/internalRoutes'

interface DataItem {
  topic: string
  definitions: Array<{
    key: string
    description: string
  }>
  path: string
}

export const methodologyTableDefinitions: DataItem[] = [
  {
    topic: 'Behavioral Health',
    path: BEHAVIORAL_HEALTH_LINK,
    definitions: [
      {
        key: 'depression',
        description:
          'Depression is a mental illness that can cause a number of problems, including sadness, fatigue, and difficulty concentrating. It is more common in people of color and people with low incomes. Studying depression can help us understand why these disparities exist and how to address them.',
      },
      {
        key: 'excessive_drinking',
        description:
          'Excessive drinking is a major public health problem. It can lead to a number of health problems, including liver disease, heart disease, and cancer. It is more common in people of color and people with low incomes. Studying excessive drinking can help us understand why these disparities exist and how to address them.',
      },
      {
        key: 'frequent_mental_distress',
        description:
          'Frequent mental distress is a common experience that can have a negative impact on physical and mental health. It is more common in people of color and people with low incomes. Studying frequent mental distress can help us understand why these disparities exist and how to address them.',
      },
      {
        key: 'non_medical_drug_use',
        description:
          'Non-medical drug use is a serious public health problem. People who use drugs are more likely to experience a variety of health problems, including HIV, hepatitis C, and overdose. They are also more likely to die prematurely. Studying non-medical drug use in regard to health equity can help us to understand why certain populations are more likely to use drugs and how to address this problem.',
      },
      {
        key: 'substance',
        description:
          'Substance use is a major public health problem. It can lead to a number of health problems, including addiction, overdose, and death. People of color and people with low incomes are more likely to use substances. Studying substance use can help us understand why these disparities exist and how to address them.',
      },
      {
        key: 'suicide',
        description:
          'Suicide is a leading cause of death in the United States. People of color and people with low incomes are more likely to die by suicide. Studying suicide can help us understand why these disparities exist and how to address them.',
      },
    ],
  },

  {
    topic: 'Chronic Diseases',
    path: CHRONIC_DISEASE_LINK,
    definitions: [
      {
        key: 'asthma',
        description:
          'Asthma is a chronic condition that affects the airways. It can cause wheezing, coughing, shortness of breath, and chest tightness. Asthma is more common in children and in people of color. Studying asthma in regard to health equity can help us to understand why these disparities exist and how to improve the health of people with asthma.',
      },
      {
        key: 'cardiovascular_diseases',
        description:
          'Cardiovascular diseases are a leading cause of death in the United States. They are more common in people of color and people with low incomes. Studying cardiovascular diseases can help us understand why these disparities exist and how to address them.',
      },
      {
        key: 'chronic_kidney_disease',
        description:
          'Chronic kidney disease is a serious condition that can lead to kidney failure. It is more common in people of color and people with low incomes. Studying chronic kidney disease can help us understand why these disparities exist and how to address them.',
      },
      {
        key: 'copd',
        description:
          'COPD is a lung disease that makes it difficult to breathe. It is more common in people of color and people with low incomes. Studying COPD can help us understand why these disparities exist and how to address them.',
      },
      {
        key: 'diabetes',
        description:
          'Diabetes is a chronic condition that affects the way the body uses sugar. It is more common in people of color and people with low incomes. Studying diabetes can help us understand why these disparities exist and how to address them.',
      },
    ],
  },

  {
    topic: 'COVID-19',
    path: COVID_19_LINK,
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
    topic: 'HIV',
    path: HIV_LINK,
    definitions: [
      {
        key: 'hiv',
        description:
          'HIV is a serious and chronic disease that can be fatal if not treated. However, HIV is now a manageable condition thanks to effective antiretroviral therapy. Studying HIV in regard to health equity can help us to understand why certain populations are more likely to be diagnosed with HIV and why they are less likely to receive effective treatment.',
      },
      {
        key: 'hiv_black_women',
        description:
          'Black women are disproportionately affected by HIV. In fact, Black women are six times more likely to be diagnosed with HIV than white women. Studying HIV among Black women in regard to health equity can help us to understand why this disparity exists and how to address it.',
      },
      {
        key: 'hiv_care',
        description:
          'Access to quality HIV care is essential for ensuring that people living with HIV can live long and healthy lives. However, not everyone with HIV has access to quality care. Studying HIV care in regard to health equity can help us to understand why these disparities exist and how to improve access to quality care for all people living with HIV.',
      },
      {
        key: 'hiv_prep',
        description:
          'HIV PrEP is a medication that can help to prevent HIV infection. PrEP is highly effective when taken as prescribed. Studying HIV PrEP in regard to health equity can help us to understand why certain populations are more likely to use PrEP and why others are less likely to use it.',
      },
    ],
  },

  {
    topic: 'Political Determinants of Health (PDOH)',
    path: PDOH_LINK,
    definitions: [
      {
        key: 'incarceration',
        description:
          'Incarceration has a negative impact on health. People who are incarcerated are more likely to experience chronic diseases, mental illness, and substance use disorders. They are also less likely to have access to quality healthcare. Studying incarceration in regard to health equity can help us to understand how to improve the health of people who are incarcerated and to prevent people from being incarcerated in the first place.',
      },
      {
        key: 'voter_participation',
        description:
          'Voter participation is important for ensuring that all voices are heard in the political process. People of color and people with low incomes are less likely to vote. Studying voter participation can help us understand why these disparities exist and how to address them.',
      },
      {
        key: 'women_in_gov',
        description:
          'The number of women in government has increased in recent years. However, women are still underrepresented in government, especially at the highest levels. Studying women in government in regard to health equity can help us to understand how to improve the health of women and to ensure that all voices are heard in the policymaking process.',
      },
    ],
  },
  {
    topic: 'Social Determinants of Health (SDOH)',
    path: SDOH_LINK,
    definitions: [
      {
        key: 'avoided_care',
        description:
          'Avoided care is when people do not get the healthcare they need because of cost, transportation, or other barriers. Avoided care can lead to worse health outcomes. Studying avoided care in regard to health equity can help us to understand why people avoid care and how to reduce these barriers.',
      },
      {
        key: 'health_insurance',
        description:
          'Health insurance is important for ensuring that people have access to quality healthcare. People of color and people with low incomes are less likely to have health insurance. Studying health insurance can help us understand why these disparities exist and how to address them.',
      },
      {
        key: 'poverty',
        description:
          'Poverty is a major determinant of health. People who are poor are more likely to experience a number of health problems, including chronic diseases, mental illness, and substance use disorders. Studying poverty can help us understand why these disparities exist and how to address them.',
      },
      {
        key: 'preventable_hospitalizations',
        description:
          'Preventable hospitalizations are hospitalizations that could have been avoided with preventive care. People of color and people with low incomes are more likely to have preventable hospitalizations. Studying preventable hospitalizations can help us understand why these disparities exist and how to address them.',
      },
    ],
  },
]

const bhTopicDefinitions: DataItem[] = [
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
        key: 'Age-Adjusted Ratios',
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
        key: 'Age-Adjusted Ratios',
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
        key: 'Age-Adjusted Ratios',
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
        key: 'Age-Adjusted Ratios',
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
        key: 'Age-Adjusted Ratios',
        description: '',
      },
      {
        key: 'Data Source(s)',
        description: '[]()',
      },
    ],
  },
]
