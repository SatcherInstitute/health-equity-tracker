import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { AGE, RACE } from '../../../data/utils/Constants'
import { Fips } from '../../../data/utils/Fips'
import CustomBreakdownSummary from '../../../reports/CustomBreakdownSummary'
import CustomChoroplethMap from '../../../reports/CustomChoroplethMap'
import CustomRateBarChart from '../../../reports/CustomRateBarChart'
import CustomRateTrendsLineChart from '../../../reports/CustomRateTrendsLineChart'
import CustomShareTrendsLineChart from '../../../reports/CustomShareTrendsLineChart'
import CustomStackedSharesBarChart from '../../../reports/CustomStackedSharesBarChart'
import CustomUnknownMap from '../../../reports/CustomUnknownMap'

const gunViolenceGeographicLevels = ['National', 'states']
const gunViolenceDemographicGranularities = [
  'Race/ethnicity',
  'Sex',
  'Age',
  'City Size (Metro/Non-Metro)',
]

export const dataVisuals = [
  {
    title: 'Rate Choropleth Map',
    description: `The rate map shows the geographic disparity of gun violence across the United States. Choropleth maps indicate each area's rate compared to the other areas using a color spectrum. Our maps default to showing the "All" group, but in most cases users can highlight a specific demographic group.`,
    sectionId: '#rate-choropleth-map',
    details: {
      demographicGranularities: gunViolenceDemographicGranularities,
      geographicLevels: gunViolenceGeographicLevels,
      alternateBreakdowns: [
        'Multi-maps',
        'State/territory rate extremes (lowest, highest)',
      ],
      howToUse: [
        {
          step: 'Navigate',
          description: 'Access the rate map on the Health Equity Tracker.',
        },
        {
          step: 'Interpret',
          description:
            'Areas with worse rates are typically highlighted with darker shades. Identify these hotspots.',
        },
        {
          step: 'Advocate',
          description:
            'Present this map to local officials to show where interventions are most needed.',
        },
      ],
    },
    customCard: (
      <CustomChoroplethMap
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_deaths_black_men'][0]}
        demographicType={AGE}
        reportTitle='Rates of gun homicides among Black (NH) men in Georgia'
        className='mt-0 mb-4 py-0'
      />
    ),
  },
  {
    title: 'Rates Over Time Chart',
    description:
      'This visualization tracks the changes in gun violence rates over specified periods.',
    sectionId: '#rates-over-time-chart',
    details: {
      demographicGranularities: gunViolenceDemographicGranularities,
      geographicLevels: gunViolenceGeographicLevels,
      alternateBreakdowns: ['Table view'],
      howToUse: [
        {
          step: 'Select Demographics',
          description:
            'Choose the demographic groups for which you want to see data.',
        },
        {
          step: 'Analyze',
          description:
            'Note whether the rates are rising, falling, or remaining steady.',
        },
        {
          step: 'Advocate',
          description:
            'Use this data to argue for the effectiveness of past policies or the need for new strategies.',
        },
      ],
    },
    customCard: (
      <CustomRateTrendsLineChart
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_violence_youth'][0]}
        demographicType={RACE}
        reportTitle='Rates of gun deaths among young adults over time in Georgia'
      />
    ),
  },
  {
    title: 'Rate Bar Chart',
    description:
      'Compares gun violence rates across different demographic groups.',
    sectionId: '#rate-bar-chart',
    details: {
      demographicGranularities: gunViolenceDemographicGranularities,
      geographicLevels: [
        ...gunViolenceGeographicLevels,
        'counties',
        'territories',
      ],
      alternateBreakdowns: 'N/A',
      howToUse: [
        {
          step: 'Navigate',
          description: 'Access the rate map on the Health Equity Tracker.',
        },
        {
          step: 'Interpret',
          description:
            'Areas with higher rates are typically highlighted with darker shades. Identify these hotspots.',
        },
        {
          step: 'Advocate',
          description:
            'Present this map to local officials to show where interventions are most needed.',
        },
      ],
    },
    customCard: (
      <CustomRateBarChart
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_violence'][0]}
        demographicType='race_and_ethnicity'
        reportTitle='Rates of gun homicides in Georgia'
      />
    ),
  },
  {
    title: 'Unknown Demographic Choropleth Map',
    description:
      'Highlights areas where data on gun violence is incomplete or missing.',
    sectionId: '#unknown-demographic-choropleth-map',
    details: {
      demographicGranularities: gunViolenceDemographicGranularities,
      geographicLevels: [
        ...gunViolenceGeographicLevels,
        'counties',
        'territories',
      ],
      alternateBreakdowns: 'N/A',
      howToUse: [
        {
          step: 'Identify Gaps',
          description: 'Find regions on the map lacking full demographic data.',
        },
        {
          step: 'Understand Impact',
          description: 'Recognize how these gaps can affect policy-making.',
        },
        {
          step: 'Advocate',
          description:
            'Demand better data collection in these areas to ensure informed decision-making.',
        },
      ],
    },
    customCard: <CustomUnknownMap />,
  },
  {
    title: 'Relative Inequity Chart',
    description:
      'Shows how disparities in gun violence exposure have evolved among different demographic groups.',
    sectionId: '#relative-inequity-chart',
    details: {
      demographicGranularities: gunViolenceDemographicGranularities,
      geographicLevels: [
        ...gunViolenceGeographicLevels,
        'counties',
        'territories',
      ],
      alternateBreakdowns: ['Table view'],
      howToUse: [
        {
          step: 'Choose Demographics',
          description:
            'Select which disparities to visualize, such as by race or age.',
        },
        {
          step: 'Track Changes',
          description:
            'Identify if these inequities are worsening or improving.',
        },
        {
          step: 'Advocate',
          description:
            'Use these trends to lobby for policies that address growing inequalities.',
        },
      ],
    },
    customCard: (
      <CustomShareTrendsLineChart
        fips={new Fips('00')}
        dataTypeConfig={METRIC_CONFIG['gun_deaths_black_men'][0]}
        demographicType='age'
        reportTitle='Historical relative inequity of gun homicides among Black (NH) men in the United States'
        isCompareCard={false}
      />
    ),
  },
  {
    title: 'Population vs. Distribution Stacked Bar Chart',
    description:
      'Illustrates how the shares of gun violence in certain demographic groups compare to their respective population sizes.',
    sectionId: '#population-vs-distribution-stacked-bar-chart',
    details: {
      demographicGranularities: gunViolenceDemographicGranularities,
      geographicLevels: [
        ...gunViolenceGeographicLevels,
        'counties',
        'territories',
      ],
      alternateBreakdowns: 'N/A',
      howToUse: [
        {
          step: 'View Data',
          description:
            'Look at the proportion of each demographic in the overall population versus their share of gun violence victims.',
        },
        {
          step: 'Highlight Disproportionality',
          description: 'Point out any significant disparities.',
        },
        {
          step: 'Advocate',
          description:
            'Argue for interventions that help disproportionately affected groups.',
        },
      ],
    },
    customCard: (
      <CustomStackedSharesBarChart
        fips={new Fips('00')}
        dataTypeConfig={METRIC_CONFIG['gun_deaths_black_men'][0]}
        demographicType='urbanicity'
        reportTitle='Population vs. distribution of total gun homicides among Black (NH) men in the United States'
      />
    ),
  },
  {
    title: 'Summary Data Table',
    description: `'Rates' show how often something happens within a specific group, either per 100,000 people or per 100 people (as a percent). 'Share' tells you what percentage of all cases come from a particular group, while 'Population share' shows the percentage of the total population that the group makes up.`,
    sectionId: '#breakdown-summary-data-table',
    details: {
      demographicGranularities: gunViolenceDemographicGranularities,
      geographicLevels: [
        ...gunViolenceGeographicLevels,
        'counties',
        'territories',
      ],
      alternateBreakdowns: 'N/A',
      howToUse: [
        {
          step: 'View Table',
          description:
            'Look at the rates, share, and population share data you are interested in exploring more deeply.',
        },
        {
          step: 'Extract Information',
          description:
            'Focus on specific figures or trends relevant to your advocacy.',
        },
        {
          step: 'Advocate',
          description:
            'Present these findings to stakeholders to support your advocacy efforts.',
        },
      ],
    },
    customCard: <CustomBreakdownSummary />,
  },
]
