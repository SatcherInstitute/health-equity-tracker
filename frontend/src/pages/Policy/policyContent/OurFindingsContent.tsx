import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { AGE, BLACK_NH, RACE, SEX, WHITE_NH } from '../../../data/utils/Constants'
import { Fips } from '../../../data/utils/Fips'
import Custom100kBarChart from '../../../reports/Custom100kBarChart'
import CustomAltTable from '../../../reports/CustomAltTable'
import CustomBreakdownSummary from '../../../reports/CustomBreakdownSummary'
import CustomChoroplethMap from '../../../reports/CustomChoroplethMap'
import CustomDisparityBarChart from '../../../reports/CustomDisparityBarChart'
import CustomRateTrendsLineChart from '../../../reports/CustomRateTrendsLineChart'
import CustomShareTrendsLineChart from '../../../reports/CustomShareTrendsLineChart'
import HetTermUnderline from '../../../styles/HetComponents/HetTermUnderline'

export const youthFatalitiesFacts = [
  {
    content: (
      <>
        From 2018 to 2021, the rate of {''}
        <HetTermUnderline>
          gun deaths among Black youth increased by approximately 75.44% in
          Georgia
        </HetTermUnderline>
        , while nationally, the rate doubled from 6.0 to 12 per 100k ,
        indicating a more substantial increase across the US compared to Georgia
        alone.
      </>
    ),
    customCard: (
      <CustomRateTrendsLineChart
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_violence_youth'][0]}
        demographicType={RACE}
        reportTitle='Rates of gun deaths among children over time in Georgia'
        className='shadow-none py-0 mt-0 mb-4'
      />
    ),
  },
  {
    content: (
      <>
        As of 2022, Black Non-Hispanic youth were disproportionately affected by
        gun violence, accounting for{' '}
        <HetTermUnderline>
          68.0% of gun fatalities while making up only 31.1% of the population
        </HetTermUnderline>
        .
      </>
    ),
    customCard: (
      <CustomDisparityBarChart
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_violence_youth'][0]}
        demographicType={RACE}
        reportTitle='Population vs. distribution of total gun deaths among children in Georgia'
        className='shadow-none'
      />
    ),
  },
]

export const homicideFacts = [
  {
    content: (
      <>
        Despite a decrease in firearm homicide rates for some groups in 2022,{' '}
        <HetTermUnderline>
          overall rates remained disturbingly high
        </HetTermUnderline>{' '}
         compared to 2019, with persistent elevations particularly among Black
        individuals.
      </>
    ),
    customCard: (
      <CustomShareTrendsLineChart
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_violence'][0]}
        demographicType={RACE}
        reportTitle='Historical relative inequity of gun homicides in Georgia'
        isCompareCard={false}
        className='shadow-none'
      />
    ),
  },
  {
    content: (
      <>
        As of 2021,{' '}
        <HetTermUnderline>
          Black individuals experience a gun homicide rate of 27 per 100,000
          people
        </HetTermUnderline>
        .
      </>
    ),
    customCard: (
      <Custom100kBarChart
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_violence'][0]}
        demographicType={RACE}
        reportTitle='Rates of gun homicides in Georgia'
		className='shadow-none'
      />
    ),
  },
]

export const suicideFacts = [
  {
    content: (
      <>
        From 2018 to 2021,{' '}
        <HetTermUnderline>
          gun-related suicide rates among Black individuals rose significantly
          from 7.9 to 11 per 100k
        </HetTermUnderline>
        , while rates among White individuals slightly decreased from 22 to 21
        per 100k, highlighting a concerning upward trend in the Black community.
      </>
    ),
    customCard: (
      <CustomAltTable
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_violence'][1]}
        demographicType={RACE}
        reportTitle='Rates of gun suicides over time in Georgia'
        selectedTableGroups={[BLACK_NH, WHITE_NH]}
        className='shadow-none py-0 mt-0 mb-4'
      />
    ),
  },
  {
    content: (
      <>
        From 2001 to 2021, the rate of gun-related suicides among females
        remained below 3.3 per 100,000, while{' '}
        <HetTermUnderline>
          the rate for males consistently exceeded 11 per 100,000
        </HetTermUnderline>
        .
      </>
    ),
    customCard: (
      <CustomBreakdownSummary
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_violence'][1]}
        demographicType={SEX}
        reportTitle='Summary for gun suicides in Georgia by sex'
        className='shadow-none py-0 mt-0 mb-4'
      />
    ),
  },
]

export const urbanicityFacts = [
	{
	  content: (
		<><HetTermUnderline>Black (NH) men in Georgia had higher gun homicide rates in urban areas</HetTermUnderline>{' '}compared to rural areas from 2018 to 2021, reinforcing the perception of urban areas as more dangerous, while rural areas saw much lower or even negative rates.
		</>
	  ),
	  customCard: (
		<CustomRateTrendsLineChart
		  fips={new Fips('13')}
		  dataTypeConfig={METRIC_CONFIG['gun_deaths_black_men'][0]}
		  demographicType='urbanicity'
		  reportTitle='Rates of gun homicides among Black (NH) men in Georgia'
		  className='shadow-none py-0 mt-0 mb-4'
		/>

	  ),
	},
	{
	  content: (
		<>
		  From 2018 to 2021,{' '}<HetTermUnderline>young Black (NH) men aged 15-29 in Georgia faced the highest homicide rates</HetTermUnderline>, with the 20-24 age group peaking at 108 per 100,000 in 2020, while rates were very low for children and older adults.
		</>
	  ),
	  customCard: (
		<CustomChoroplethMap
		  fips={new Fips('13')}
		  dataTypeConfig={METRIC_CONFIG['gun_deaths_black_men'][0]}
		  demographicType={AGE}
		  reportTitle='Rates of gun homicides among Black (NH) men in Georgia'
		  className='shadow-none py-0 mt-0 mb-4'
		/>

	  ),
	},
]
