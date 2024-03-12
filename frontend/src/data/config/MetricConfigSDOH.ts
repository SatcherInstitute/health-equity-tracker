import {
  medicareHigherIsWorseMapConfig,
  defaultHigherIsWorseMapConfig,
} from '../../charts/mapGlobals'
import { type DataTypeConfig } from './MetricConfig'
import {
  populationPctShortLabel,
  populationPctTitle,
} from './MetricConfigUtils'
import { SHOW_GUN_VIOLENCE } from '../providers/GunViolenceProvider'

console.log('Gun violence preview enabled')

export const SDOH_CATEGORY_DROPDOWNIDS = [
  'avoided_care',
  'health_insurance',
  ...(SHOW_GUN_VIOLENCE ? ['gun_violence'] : []),
  'poverty',
  'preventable_hospitalizations',
] as const

export type SDOHDataTypeId =
  | 'gun_violence_homicide'
  | 'gun_violence_injuries'
  | 'gun_violence_suicide'
  | 'gun_violence_legal_intervention'
  | 'poverty'
  | 'health_insurance'
  | 'preventable_hospitalizations'
  | 'avoided_care'

export type SDOHMetricId =
  | 'ahr_population_pct'
  | 'avoided_care_pct_rate'
  | 'avoided_care_pct_share'
  | 'fatal_population_pct'
  | 'gun_violence_homicide_estimated_total'
  | 'gun_violence_injuries_estimated_total'
  | 'gun_violence_legal_intervention_estimated_total'
  | 'gun_violence_suicide_estimated_total'
  | 'gun_violence_homicide_per_100k'
  | 'gun_violence_injuries_per_100k'
  | 'gun_violence_legal_intervention_per_100k'
  | 'gun_violence_suicide_per_100k'
  | 'gun_violence_homicide_pct_relative_inequity'
  | 'gun_violence_injuries_pct_relative_inequity'
  | 'gun_violence_legal_intervention_pct_relative_inequity'
  | 'gun_violence_suicide_pct_relative_inequity'
  | 'gun_violence_homicide_pct_share'
  | 'gun_violence_injuries_pct_share'
  | 'gun_violence_legal_intervention_pct_share'
  | 'gun_violence_suicide_pct_share'
  | 'poverty_count'
  | 'poverty_pct_share'
  | 'poverty_pct_rate'
  | 'poverty_population_pct'
  | 'poverty_pct_relative_inequity'
  | 'poverty_estimated_total'
  | 'poverty_pop_estimated_total'
  | 'preventable_hospitalizations_pct_share'
  | 'preventable_hospitalizations_per_100k'
  | 'non_fatal_population_pct'
  | 'uninsured_pct_share'
  | 'uninsured_pct_rate'
  | 'uninsured_population_pct'
  | 'uninsured_pct_relative_inequity'
  | 'uninsured_estimated_total'
  | 'uninsured_pop_estimated_total'

export const UNINSURANCE_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'sdoh',
    dataTypeId: 'health_insurance',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Uninsured people',
    fullDisplayName: 'Uninsured people',
    fullDisplayNameInline: 'uninsured people',
    definition: {
      text: `Health insurance coverage in the ACS and other Census Bureau surveys define coverage to
      include plans and programs that provide comprehensive health coverage. Plans that provide
      insurance only for specific conditions or situations such as cancer and long-term care policies
      are not considered comprehensive health coverage. Likewise, other types of insurance like
      dental, vision, life, and disability insurance are not considered comprehensive health
      insurance coverage.`,
    },
    description: {
      text: 'Health insurance is important for ensuring that people have access to quality healthcare. People of color and people with low incomes are less likely to have health insurance. Studying health insurance can help us understand why these disparities exist and how to address them.',
    },
    dataTableTitle: 'Breakdown summary for uninsured people',
    metrics: {
      sub_population_count: {
        chartTitle: '',
        metricId: 'uninsured_pop_estimated_total',
        shortLabel: 'Total Population for Insurance Rate',
        type: 'count',
      },
      pct_rate: {
        metricId: 'uninsured_pct_rate',
        chartTitle: 'Uninsured people',
        trendsCardTitleName: 'Rates of uninsurance over time',
        columnTitleHeader: 'Uninsured people',
        shortLabel: '% uninsured',
        type: 'pct_rate',
        rateNumeratorMetric: {
          metricId: 'uninsured_estimated_total',
          shortLabel: 'Without insurance',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'uninsured_pop_estimated_total',
          shortLabel: 'Total population',
          chartTitle: '',
          type: 'count',
        },
      },
      pct_share: {
        chartTitle: 'Share of uninsured people',
        metricId: 'uninsured_pct_share',
        columnTitleHeader: 'Share of uninsured people',
        shortLabel: '% of uninsured',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle: 'Population vs. distribution of total uninsured people',
          metricId: 'uninsured_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      pct_relative_inequity: {
        chartTitle: 'Relative inequity for uninsurance',
        metricId: 'uninsured_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
    },
  },
]

export const POVERTY_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'sdoh',
    dataTypeId: 'poverty',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Poverty',
    fullDisplayName: 'People below the poverty line',
    fullDisplayNameInline: 'people below the poverty line',
    definition: {
      text: `Following the Office of Management and Budget's (OMB) Statistical Policy Directive 14, the Census Bureau uses a set of money income thresholds that vary by family size and composition to determine who is in poverty. If a family's total income is less than the family's threshold, then that family and every individual in it is considered in poverty. The official poverty thresholds do not vary geographically, but they are updated for inflation using the Consumer Price Index (CPI-U). The official poverty definition uses money income before taxes and does not include capital gains or noncash benefits (such as public housing, Medicaid, and food stamps).`,
    },
    description: {
      text: 'Poverty is a major determinant of health. People who are poor are more likely to experience a number of health problems, including chronic diseases, mental illness, and substance use disorders. Studying poverty can help us understand why these disparities exist and how to address them.',
    },
    dataTableTitle: 'Breakdown summary for people below the poverty line',
    metrics: {
      sub_population_count: {
        chartTitle: '',
        metricId: 'poverty_pop_estimated_total',
        shortLabel: 'Total Population for Poverty Rate',
        type: 'count',
      },
      pct_rate: {
        metricId: 'poverty_pct_rate',
        chartTitle: 'People below the poverty line',
        trendsCardTitleName: 'Rates of poverty over time',
        columnTitleHeader: 'People below the poverty line',
        shortLabel: '% in poverty',
        type: 'pct_rate',
        rateNumeratorMetric: {
          metricId: 'poverty_estimated_total',
          shortLabel: 'In poverty',
          chartTitle: '',
          type: 'count',
        },
        rateDenominatorMetric: {
          metricId: 'poverty_pop_estimated_total',
          shortLabel: 'Total population',
          chartTitle: '',
          type: 'count',
        },
      },
      pct_share: {
        chartTitle: 'Share of poverty',
        metricId: 'poverty_pct_share',
        columnTitleHeader: 'Share of poverty',
        shortLabel: '% of impoverished',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total people below the poverty line',
          metricId: 'poverty_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
      pct_relative_inequity: {
        chartTitle: 'Relative inequity for poverty',
        metricId: 'poverty_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
    },
  },
]

export const CARE_AVOIDANCE_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'sdoh',
    dataTypeId: 'avoided_care',
    mapConfig: defaultHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Avoided Care',
    fullDisplayName: 'Care avoidance due to cost',
    fullDisplayNameInline: 'care avoidance due to cost',
    definition: {
      text: `Adults who reported a time in the past 12 months when they needed to see a doctor but could not because of cost.`,
    },
    description: {
      text: 'Avoiding care can lead to worse health outcomes. Studying avoided care in regard to health equity can help us to understand why people avoid care and how to reduce these barriers.',
    },
    surveyCollectedData: true,
    dataTableTitle: 'Breakdown summary for care avoidance due to cost',
    metrics: {
      pct_rate: {
        metricId: 'avoided_care_pct_rate',
        chartTitle: 'Care avoidance due to cost',
        columnTitleHeader: 'Care avoidance due to cost',
        shortLabel: '% avoided care',
        type: 'pct_rate',
      },
      pct_share: {
        chartTitle: 'Share of all care avoidance due to cost',
        metricId: 'avoided_care_pct_share',
        columnTitleHeader: 'Share of all care avoidance due to cost for adults',
        shortLabel: '% of avoidances',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total care avoidance due to cost',
          metricId: 'ahr_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
    },
  },
]

export const PREVENTABLE_HOSP_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'sdoh',
    dataTypeId: 'preventable_hospitalizations',
    mapConfig: medicareHigherIsWorseMapConfig,
    dataTypeShortLabel: 'Preventable hospitalizations',
    fullDisplayName: 'Preventable hospitalizations',
    fullDisplayNameInline: 'preventable hospitalizations',
    definition: {
      text: `Discharges following hospitalization for diabetes with short- or long-term complications, uncontrolled diabetes without complications, diabetes with lower-extremity amputation, chronic obstructive pulmonary disease, angina without a procedure, asthma, hypertension, heart failure, dehydration, bacterial pneumonia or urinary tract infection per 100,000 Medicare beneficiaries ages 18 and older continuously enrolled in Medicare fee-for-service Part A.`,
    },
    description: {
      text: 'Studying preventable hospitalizations can help us understand why these disparities exist and how to address them.',
    },
    dataTableTitle: 'Breakdown summary for preventable hospitalizations',
    metrics: {
      per100k: {
        metricId: 'preventable_hospitalizations_per_100k',
        chartTitle: 'Preventable hospitalizations',
        columnTitleHeader:
          'Preventable hospitalizations per 100k adult Medicare enrollees',
        shortLabel: 'cases per 100k',
        type: 'per100k',
      },
      pct_share: {
        chartTitle: 'Share of all preventable hospitalizations',
        metricId: 'preventable_hospitalizations_pct_share',
        columnTitleHeader: 'Share of all preventable hospitalizations',
        shortLabel: '% of hospitalizations',
        type: 'pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total preventable hospitalizations',
          metricId: 'ahr_population_pct',
          columnTitleHeader: populationPctTitle,
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
      },
    },
  },
]

export const GUN_VIOLENCE_METRICS: DataTypeConfig[] = [
  {
    categoryId: 'sdoh',
    dataTableTitle: 'Breakdown summary of gun homicides amongst adults',
    dataTypeId: 'gun_violence_homicide',
    dataTypeShortLabel: 'Homicides',
    definition: {
      text: 'Deaths caused by firearms used with the intent to harm others.',
    },
    description: {
      text: 'Homicide fatalities by guns are a critical public health issue, as they often occur in contexts of other societal issues like poverty, inequality, and limited access to mental health services. Focusing on reducing gun-related homicides is essential for advancing health equity, especially in vulnerable populations.',
    },
    fullDisplayName: 'Gun homicides',
    fullDisplayNameInline: 'gun homicides',
    mapConfig: defaultHigherIsWorseMapConfig,
    metrics: {
      sub_population_count: {
        chartTitle: 'Estimated total of gun homicides amongst adults',
        metricId: 'gun_violence_homicide_estimated_total',
        shortLabel: 'estimated total',
        type: 'count',
      },
      pct_relative_inequity: {
        chartTitle:
          'Historical relative inequity of gun homicides amongst adults',
        metricId: 'gun_violence_homicide_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
      pct_share: {
        chartTitle: 'Share of total gun homicides amongst adults',
        columnTitleHeader: 'Share of total gun homicides amongst adults',
        metricId: 'gun_violence_homicide_pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total gun homicides amongst adults',
          columnTitleHeader: populationPctTitle,
          metricId: 'fatal_population_pct',
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
        shortLabel: '% of homicides',
        type: 'pct_share',
      },
      per100k: {
        chartTitle: 'Rates of gun homicides amongst adults',
        columnTitleHeader: 'Gun homicides per 100k people',
        metricId: 'gun_violence_homicide_per_100k',
        shortLabel: 'homicides per 100k',
        trendsCardTitleName: 'Rates of gun homicides amongst adults over time',
        type: 'per100k',
      },
    },
  },
  {
    categoryId: 'sdoh',
    dataTableTitle:
      'Breakdown summary of non-fatal gun injuries amongst adults',
    dataTypeId: 'gun_violence_injuries',
    dataTypeShortLabel: 'Non-Fatal Injuries',
    definition: {
      text: 'These injuries refer to physical harm caused by firearms that do not result in death. They can range from minor to severe, potentially leading to long-term disabilities.',
    },
    description: {
      text: 'Non-fatal gun injuries are significant in health equity as they disproportionately affect certain demographics, particularly in communities with higher poverty rates. Addressing these injuries is crucial for reducing healthcare disparities and improving community health.',
    },
    fullDisplayName: 'Non-fatal gun injuries',
    fullDisplayNameInline: 'Non-fatal gun injuries',
    mapConfig: defaultHigherIsWorseMapConfig,
    metrics: {
      sub_population_count: {
        chartTitle: 'Estimated total of non-fatal gun injuries amongst adults',
        metricId: 'gun_violence_injuries_estimated_total',
        shortLabel: 'estimated total',
        type: 'count',
      },
      pct_relative_inequity: {
        chartTitle:
          'Historical relative inequity of non-fatal gun injuries amongst adults',
        metricId: 'gun_violence_injuries_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
      pct_share: {
        chartTitle: 'Share of total non-fatal gun injuries amongst adults',
        columnTitleHeader: 'Share of total non-fatal gun injuries',
        metricId: 'gun_violence_injuries_pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of total non-fatal gun injuries amongst adults',
          columnTitleHeader: populationPctTitle,
          metricId: 'fatal_population_pct',
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
        shortLabel: '% of non-fatal gun injuries',
        type: 'pct_share',
      },
      per100k: {
        chartTitle: 'Rates of non-fatal gun injuries amongst adults',
        columnTitleHeader: 'Non-fatal gun injuries per 100k people',
        metricId: 'gun_violence_injuries_per_100k',
        shortLabel: 'non-fatal injuries per 100k',
        trendsCardTitleName:
          'Rates of non-fatal gun injuries amongst adults over time',
        type: 'per100k',
      },
    },
  },
  {
    categoryId: 'sdoh',
    dataTableTitle:
      'Breakdown summary of gun-related deaths by legal intervention',
    dataTypeId: 'gun_violence_legal_intervention',
    dataTypeShortLabel: 'Legal Interventions',
    definition: {
      text: 'Deaths caused by firearms during legal interventions, such as law enforcement activities.',
    },
    description: {
      text: 'Understanding and addressing these fatalities are important for health equity, as they often reflect broader issues of social justice, community trust in law enforcement, and the need for equitable legal practices.',
    },
    fullDisplayName: 'Gun-related legal interventions',
    fullDisplayNameInline: 'gun-related legal interventions',
    mapConfig: defaultHigherIsWorseMapConfig,
    metrics: {
      sub_population_count: {
        chartTitle:
          'Estimated total of gun-related deaths by legal intervention amongst adults',
        metricId: 'gun_violence_legal_intervention_estimated_total',
        shortLabel: 'estimated total',
        type: 'count',
      },
      pct_relative_inequity: {
        chartTitle:
          'Historical relative inequity of gun-related deaths by legal intervention amongst adults',
        metricId: 'gun_violence_legal_intervention_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
      pct_share: {
        chartTitle:
          'Share of total gun-related deaths by legal intervention amongst adults',
        columnTitleHeader:
          'Share of total gun-related deaths by legal intervention',
        metricId: 'gun_violence_legal_intervention_pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of gun-related deaths by legal intervention amongst adults',
          columnTitleHeader: populationPctTitle,
          metricId: 'fatal_population_pct',
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
        shortLabel: '% of legal interventions',
        type: 'pct_share',
      },
      per100k: {
        chartTitle:
          'Rates of gun-related deaths by legal intervention amongst adults',
        columnTitleHeader:
          'Gun-related deaths by legal intervention per 100k people',
        metricId: 'gun_violence_legal_intervention_per_100k',
        shortLabel: 'legal interventions per 100k',
        trendsCardTitleName:
          'Rates of gun-related deaths by legal intervention amongst adults over time',
        type: 'per100k',
      },
    },
  },
  {
    categoryId: 'sdoh',
    dataTableTitle: 'Breakdown summary for gun suicides amongst adults',
    dataTypeId: 'gun_violence_suicide',
    dataTypeShortLabel: 'Suicides',
    definition: {
      text: 'Deaths resulting from individuals using firearms to inflict self-harm.',
    },
    description: {
      text: 'Gun suicides represent a significant portion of firearm deaths. Addressing this issue is vital for health equity as it involves improving mental health services, access to care, and community support systems, particularly in areas with limited resources.',
    },
    fullDisplayName: 'Gun suicides',
    fullDisplayNameInline: 'gun suicides',
    mapConfig: defaultHigherIsWorseMapConfig,
    metrics: {
      sub_population_count: {
        chartTitle: 'Estimated total of gun suicides amongst adults',
        metricId: 'gun_violence_suicide_estimated_total',
        shortLabel: 'estimated total',
        type: 'count',
      },
      pct_relative_inequity: {
        chartTitle:
          'Historical relative inequity of gun suicides amongst adults',
        metricId: 'gun_violence_suicide_pct_relative_inequity',
        shortLabel: '% relative inequity',
        type: 'pct_relative_inequity',
      },
      pct_share: {
        chartTitle: 'Share of total gun suicides amongst adults',
        columnTitleHeader: 'Share of total gun suicides',
        metricId: 'gun_violence_suicide_pct_share',
        populationComparisonMetric: {
          chartTitle:
            'Population vs. distribution of gun suicides amongst adults',
          columnTitleHeader: populationPctTitle,
          metricId: 'fatal_population_pct',
          shortLabel: populationPctShortLabel,
          type: 'pct_share',
        },
        shortLabel: '% of suicides',
        type: 'pct_share',
      },
      per100k: {
        chartTitle: 'Rates of gun suicides amongst adults',
        columnTitleHeader: 'Gun suicides per 100k people',
        metricId: 'gun_violence_suicide_per_100k',
        shortLabel: 'suicides per 100k',
        trendsCardTitleName: 'Rates of gun suicides amongst adults over time',
        type: 'per100k',
      },
    },
  },
]
