
import { defaultHigherIsWorseMapConfig, menHigherIsWorseMapConfig, youthHigherIsWorseMapConfig } from '../../charts/mapGlobals'
import { SHOW_GUN_VIOLENCE } from '../providers/GunViolenceProvider'
import { DataTypeConfig } from './MetricConfig'
import { populationPctShortLabel, populationPctTitle } from './MetricConfigUtils'


SHOW_GUN_VIOLENCE && console.log('Gun violence preview enabled')
export const COMMUNITY_SAFETY_DROPDOWNIDS = ['gun_violence', 'gun_violence_youth', 'gun_deaths_black_men'] as const

export type CommunitySafetyDataTypeId =
    | 'gun_violence_homicide'
    | 'gun_violence_suicide'
    | 'gun_deaths_black_men'
    | 'gun_deaths_youth'
    | 'gun_deaths_young_adults'

export type CommunitySafetyMetricId =
    | 'gun_deaths_youth_estimated_total'
    | 'gun_deaths_youth_per_100k'
    | 'gun_deaths_youth_pct_share'
    | 'gun_deaths_youth_pct_relative_inequity'
    | 'gun_deaths_youth_population'
    | 'gun_deaths_youth_population_pct'
    | 'gun_deaths_young_adults_estimated_total'
    | 'gun_deaths_young_adults_per_100k'
    | 'gun_deaths_young_adults_pct_share'
    | 'gun_deaths_young_adults_pct_relative_inequity'
    | 'gun_deaths_young_adults_population'
    | 'gun_deaths_young_adults_population_pct'
    | 'gun_violence_homicide_estimated_total'
    | 'gun_violence_homicide_per_100k'
    | 'gun_violence_homicide_pct_relative_inequity'
    | 'gun_violence_homicide_pct_share'
    | 'gun_violence_legal_intervention_estimated_total'
    | 'gun_violence_suicide_estimated_total'
    | 'gun_violence_suicide_per_100k'
    | 'gun_violence_suicide_pct_relative_inequity'
    | 'gun_violence_suicide_pct_share'
    | 'fatal_population'
    | 'fatal_population_pct'
    | 'gun_homicides_black_men_estimated_total'
    | 'gun_homicides_black_men_pct_relative_inequity'
    | 'gun_homicides_black_men_pct_share'
    | 'gun_homicides_black_men_per_100k'
    | 'gun_homicides_black_men_population_estimated_total'
    | 'gun_homicides_black_men_population_pct'

export const GUN_VIOLENCE_METRICS: DataTypeConfig[] = [
    {
        categoryId: 'community-safety',
        dataTableTitle: 'Breakdown summary of gun homicides',
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

            pct_relative_inequity: {
                chartTitle:
                    'Historical relative inequity of gun homicides',
                metricId: 'gun_violence_homicide_pct_relative_inequity',
                shortLabel: '% relative inequity',
                type: 'pct_relative_inequity',
            },
            pct_share: {
                chartTitle: 'Share of total gun homicides',
                columnTitleHeader: 'Share of total gun homicides',
                metricId: 'gun_violence_homicide_pct_share',
                populationComparisonMetric: {
                    chartTitle:
                        'Population vs. distribution of total gun homicides',
                    columnTitleHeader: populationPctTitle,
                    metricId: 'fatal_population_pct',
                    shortLabel: populationPctShortLabel,
                    type: 'pct_share',
                },
                shortLabel: '% of homicides',
                type: 'pct_share',
            },
            per100k: {
                chartTitle: 'Rates of gun homicides',
                columnTitleHeader: 'Gun homicides per 100k people',
                metricId: 'gun_violence_homicide_per_100k',
                shortLabel: 'homicides per 100k',
                trendsCardTitleName: 'Rates of gun homicides over time',
                type: 'per100k',
                rateNumeratorMetric: {
                    chartTitle: '',
                    metricId: 'gun_violence_homicide_estimated_total',
                    shortLabel: 'Gun homicides',
                    type: 'count',
                },
                rateDenominatorMetric: {
                    chartTitle: '',
                    metricId: 'fatal_population',
                    shortLabel: 'Total Population',
                    type: 'count',
                }
            },

        },
    },
    {
        categoryId: 'community-safety',
        dataTableTitle: 'Breakdown summary for gun suicides',
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

            pct_relative_inequity: {
                chartTitle:
                    'Historical relative inequity of gun suicides',
                metricId: 'gun_violence_suicide_pct_relative_inequity',
                shortLabel: '% relative inequity',
                type: 'pct_relative_inequity',
            },
            pct_share: {
                chartTitle: 'Share of total gun suicides',
                columnTitleHeader: 'Share of total gun suicides',
                metricId: 'gun_violence_suicide_pct_share',
                populationComparisonMetric: {
                    chartTitle:
                        'Population vs. distribution of gun suicides',
                    columnTitleHeader: populationPctTitle,
                    metricId: 'fatal_population_pct',
                    shortLabel: populationPctShortLabel,
                    type: 'pct_share',
                },
                shortLabel: '% of suicides',
                type: 'pct_share',
            },
            per100k: {
                chartTitle: 'Rates of gun suicides',
                columnTitleHeader: 'Gun suicides per 100k people',
                metricId: 'gun_violence_suicide_per_100k',
                shortLabel: 'suicides per 100k',
                trendsCardTitleName: 'Rates of gun suicides over time',
                type: 'per100k',
                rateNumeratorMetric: {
                    chartTitle: '',
                    metricId: 'gun_violence_suicide_estimated_total',
                    shortLabel: 'Gun suicides',
                    type: 'count',
                },
                rateDenominatorMetric: {
                    chartTitle: '',
                    metricId: 'fatal_population',
                    shortLabel: 'Total Population',
                    type: 'count',
                }
            },
        },
    },
]


export const GUN_VIOLENCE_YOUTH_METRICS: DataTypeConfig[] = [
    {
        categoryId: 'community-safety',
        dataTableTitle: 'Breakdown summary of gun deaths among children',
        dataTypeId: 'gun_deaths_youth',
        dataTypeShortLabel: 'Children',
        definition: {
            text: 'Deaths of individuals under the age of 18 caused by firearms.'
        },
        description: {
            text: 'Measuring gun deaths among children is crucial because it helps us understand the impact of firearm violence on younger populations, guiding the development of targeted interventions and policies to protect our most vulnerable citizens and prevent future tragedies.'
        },
        fullDisplayName: 'Gun deaths (children)',
        fullDisplayNameInline: 'gun deaths (children)',
        mapConfig: youthHigherIsWorseMapConfig,
        ageSubPopulationLabel: 'Ages 0-17',

        metrics: {

            pct_relative_inequity: {
                chartTitle: 'Historical relative inequity of gun deaths among children',
                metricId: 'gun_deaths_youth_pct_relative_inequity',
                shortLabel: '% relative inequity',
                type: 'pct_relative_inequity',
            },
            pct_share: {
                chartTitle: 'Share of total gun deaths among children',
                columnTitleHeader: 'Share of total gun deaths among children',
                metricId: 'gun_deaths_youth_pct_share',
                populationComparisonMetric: {
                    chartTitle: 'Population vs. distribution of total gun deaths among children',
                    columnTitleHeader: `${populationPctTitle} (ages 0-17)`,
                    metricId: 'population_pct',
                    shortLabel: populationPctShortLabel,
                    type: 'pct_share'
                },
                shortLabel: '% of gun deaths',
                type: 'pct_share',
            },
            per100k: {
                chartTitle: 'Rates of gun deaths among children',
                columnTitleHeader: 'Gun deaths among children per 100k people',
                metricId: 'gun_deaths_youth_per_100k',
                shortLabel: 'deaths per 100k',
                trendsCardTitleName: 'Rates of gun deaths among children over time',
                type: 'per100k',
                rateNumeratorMetric: {
                    chartTitle: '',
                    metricId: 'gun_deaths_youth_estimated_total',
                    shortLabel: 'Gun deaths (children)',
                    type: 'count',
                },
                rateDenominatorMetric: {
                    chartTitle: '',
                    metricId: 'gun_deaths_youth_population',
                    shortLabel: 'Total Population',
                    type: 'count',
                }
            },
        }
    },
    {
        categoryId: 'community-safety',
        dataTableTitle: 'Breakdown summary of gun deaths among young adults',
        dataTypeId: 'gun_deaths_young_adults',
        dataTypeShortLabel: 'Young Adults',
        definition: {
            text: 'Deaths of individuals between the ages of 18-25 caused by firearms.'
        },
        description: {
            text: 'Measuring gun deaths among young adults is crucial because it helps us understand the impact of firearm violence on younger populations, guiding the development of targeted interventions and policies to protect our most vulnerable citizens and prevent future tragedies.'
        },
        fullDisplayName: 'Gun deaths (young adults)',
        fullDisplayNameInline: 'gun deaths (young adults)',
        mapConfig: youthHigherIsWorseMapConfig,
        ageSubPopulationLabel: 'Ages 18-25',
        metrics: {
            pct_relative_inequity: {
                chartTitle: 'Historical relative inequity of gun deaths among young adults',
                metricId: 'gun_deaths_young_adults_pct_relative_inequity',
                shortLabel: '% relative inequity',
                type: 'pct_relative_inequity',
            },
            pct_share: {
                chartTitle: 'Share of total gun deaths among young adults',
                columnTitleHeader: 'Share of total gun deaths among young adults',
                metricId: 'gun_deaths_young_adults_pct_share',
                populationComparisonMetric: {
                    chartTitle: 'Population vs. distribution of total gun deaths among young adults',
                    columnTitleHeader: `${populationPctTitle} (ages 18-25)`,
                    metricId: 'population_pct',
                    shortLabel: populationPctShortLabel,
                    type: 'pct_share'
                },
                shortLabel: '% of gun deaths',
                type: 'pct_share',
            },
            per100k: {
                chartTitle: 'Rates of gun deaths among young adults',
                columnTitleHeader: 'Gun deaths among young adults per 100k people',
                metricId: 'gun_deaths_young_adults_per_100k',
                shortLabel: 'deaths per 100k',
                trendsCardTitleName: 'Rates of gun deaths among young adults over time',
                type: 'per100k',
                rateNumeratorMetric: {
                    chartTitle: '',
                    metricId: 'gun_deaths_young_adults_estimated_total',
                    shortLabel: 'Gun deaths (young adults)',
                    type: 'count',
                },
                rateDenominatorMetric: {
                    chartTitle: '',
                    metricId: 'gun_deaths_young_adults_population',
                    shortLabel: 'Total Population',
                    type: 'count',
                }
            },
        }
    }
]


export const GUN_DEATHS_BLACK_MEN_METRICS: DataTypeConfig[] = [
    {
        categoryId: 'community-safety',
        dataTableTitle: 'Breakdown summary of gun homicides among Black (NH) men',
        dataTypeId: 'gun_deaths_black_men',
        dataTypeShortLabel: 'Gun Homicides (Black Men)',
        definition: {
            text: 'Deaths of Black or African-American (NH) males, caused by gun homicides.'
        },
        fullDisplayName: 'Gun homicides (Black Men)',
        fullDisplayNameInline: 'gun homicides (Black Men)',
        mapConfig: menHigherIsWorseMapConfig,
        metrics: {
            pct_relative_inequity: {
                chartTitle: 'Historical relative inequity of gun homicides among Black (NH) men',
                metricId: 'gun_homicides_black_men_pct_relative_inequity',
                shortLabel: '% relative inequity',
                type: 'pct_relative_inequity',
            },
            pct_share: {
                chartTitle: 'Share of total gun homicides among Black (NH) men',
                columnTitleHeader: 'Share of total gun homicides among Black (NH) men',
                metricId: 'gun_homicides_black_men_pct_share',
                populationComparisonMetric: {
                    chartTitle: 'Population vs. distribution of total gun homicides among Black (NH) men',
                    columnTitleHeader: `${populationPctTitle} (Black NH, Male)`,
                    metricId: 'gun_homicides_black_men_population_pct',
                    shortLabel: populationPctShortLabel,
                    type: 'pct_share'
                },
                shortLabel: '% of gun deaths',
                type: 'pct_share',
            },
            per100k: {
                chartTitle: 'Rates of gun homicides among Black (NH) men',
                columnTitleHeader: 'Gun homicides per 100k Black (NH) men',
                metricId: 'gun_homicides_black_men_per_100k',
                shortLabel: 'homicides per 100k',
                trendsCardTitleName: 'Rates of gun homicides among Black (NH) men over time',
                type: 'per100k',
                rateNumeratorMetric: {
                    chartTitle: '',
                    metricId: 'gun_homicides_black_men_estimated_total',
                    shortLabel: 'Gun homicides (Black Men)',
                    type: 'count',
                },
                rateDenominatorMetric: {
                    chartTitle: '',
                    metricId: 'gun_homicides_black_men_population_estimated_total',
                    shortLabel: 'Total Population (Black Men)',
                    type: 'count',
                }
            },
        },
        otherSubPopulationLabel: 'Black Men',
    }
]

