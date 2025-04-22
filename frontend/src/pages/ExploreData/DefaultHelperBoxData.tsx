import FiberNewIcon from '@mui/icons-material/FiberNew'
import { lazy } from 'react'
import {
  GUN_DEATHS_YOUNG_ADULTS_USA_SETTING,
  HIV_PREVALENCE_RACE_USA_SETTING,
  PRISON_VS_POVERTY_RACE_GA_SETTING,
  UNINSURANCE_SEX_FL_VS_CA_SETTING,
} from '../../utils/internalRoutes'

const CustomChoroplethMap = lazy(
  () => import('../../reports/CustomChoroplethMap'),
)
const CustomRateBarChartCompare = lazy(
  () => import('../../reports/CustomRateBarChartCompare'),
)
const CustomStackedSharesBarChartCompare = lazy(
  () => import('../../reports/CustomStackedSharesBarChartCompare'),
)
const CustomRateTrendsLineChart = lazy(
  () => import('../../reports/CustomRateTrendsLineChart'),
)

type ReportMapping = {
  setting: string
  title: string
  preview: string
  description: string
  categories: string[]
  icon?: JSX.Element
  previewImg: string
  customCard: JSX.Element | null
}

export const reportMappings: ReportMapping[] = [
  {
    setting: GUN_DEATHS_YOUNG_ADULTS_USA_SETTING,
    title: 'Map of Young Adult Gun Death Victims by State',
    preview: 'Gun Deaths of Young Adults',
    description:
      'Visualize state-to-state rates of gun deaths among young adults ages 18-25. Explore further by highlighting race/ethnicity groups ',
    categories: [
      'Gun Violence',
      'Community Safety',
      'Youth',
      'State-Level',
      'Choropleth Map',
    ],
    icon: <FiberNewIcon />,
    previewImg: '/img/screenshots/sample-report_young_adult_gun_deaths.png',
    customCard: <CustomChoroplethMap />,
  },
  {
    setting: HIV_PREVALENCE_RACE_USA_SETTING,
    title: 'HIV by Race/Ethnicity',
    preview: 'HIV Cases',
    description:
      'Uncover disparities in HIV prevalence across different racial and ethnic groups in the U.S. Understanding these patterns is vital for targeted interventions and improved health equity.',
    categories: ['HIV', 'Prevalence', 'Race/Ethnicity', 'National-Level'],
    previewImg: '/img/screenshots/sample-report_hiv.png',
    customCard: <CustomRateTrendsLineChart />,
  },

  {
    setting: PRISON_VS_POVERTY_RACE_GA_SETTING,
    title: 'Prison & Poverty in Georgia by Race',
    preview: 'Prison + Poverty',
    description:
      'Explore the intersection of incarceration, poverty, and race in Georgia. Addressing these disparities is key to improving health outcomes and social justice.',
    categories: [
      'Social Determinants of Health',
      'Political Determinants of Health',
      'Race/Ethnicity',
      'State-Level',
      'Compare Topics',
    ],
    previewImg: '/img/screenshots/sample-report_ga.png',
    customCard: <CustomRateBarChartCompare />,
  },
  {
    setting: UNINSURANCE_SEX_FL_VS_CA_SETTING,
    title: 'Uninsurance in FL & CA by Sex',
    preview: 'Uninsured',
    description:
      'Examine uninsurance rates by sex in Florida and California. Identifying these gaps is crucial for advancing equitable healthcare access.',
    categories: [
      'Social Determinants of Health',
      'State-Level',
      'Sex',
      'Compare Places',
    ],
    previewImg: '/img/screenshots/sample-report_uninsured.png',
    customCard: <CustomStackedSharesBarChartCompare />,
  },
]
