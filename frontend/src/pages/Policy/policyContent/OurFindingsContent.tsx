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
import { HET_URL } from '../../../utils/internalRoutes'
<<<<<<< HEAD
=======

const gunDeathsBlackMenConfig = {
  fips: new Fips('13'),
  dataTypeConfig: METRIC_CONFIG['gun_deaths_black_men'][0],
  className: 'shadow-[none] py-0 mt-0 mb-4',
}

const gunViolenceYouthConfig = {
  fips: new Fips('13'),
  dataTypeConfig: METRIC_CONFIG['gun_violence_youth'][0],
  className: 'shadow-[none] py-0 mt-0 mb-4',
}

const gunViolenceHomicideConfig = {
  fips: new Fips('13'),
  dataTypeConfig: METRIC_CONFIG['gun_violence'][0],
  className: 'shadow-[none] py-0 mt-0 mb-4',
}

const gunViolenceSuicideConfig = {
  fips: new Fips('13'),
  dataTypeConfig: METRIC_CONFIG['gun_violence'][1],
  className: 'shadow-[none] py-0 mt-0 mb-4',
}
>>>>>>> 8c0462e4 (Data collection tab and Our Findings tab refinements (#3638))

export const youthFatalitiesFacts = [
  {
    report: `${HET_URL}/exploredata?mls=1.gun_violence_youth-3.13&group1=All#rates-over-time`,
    content: (
      <>
<<<<<<< HEAD
        From 2018 to 2021, the rate of {''}
        <HetTermUnderline>
          gun deaths among Black youth increased by approximately 75.44% in
          Georgia
        </HetTermUnderline>
        , while nationally, the rate doubled from 6.0 to 12 per 100k ,
        indicating a more substantial increase across the US compared to Georgia
        alone.
=======
        From 2018 to 2021, the rate of 
        <HetTermUnderline>
          gun deaths among Black youth increased by approximately 75.44% in Georgia
        </HetTermUnderline>
        , while nationally, the rate doubled from 6.0 to 12 per 100k, indicating a more substantial increase across the US compared to Georgia alone.
>>>>>>> 8c0462e4 (Data collection tab and Our Findings tab refinements (#3638))
      </>
    ),
    customCard: (
      <CustomRateTrendsLineChart
<<<<<<< HEAD
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_violence_youth'][0]}
        demographicType={RACE}
        reportTitle='Rates of gun deaths among children over time in Georgia'
        className='max-w-svw shadow-[none] py-0 mt-0 mb-4'
=======
        fips={gunViolenceYouthConfig.fips}
        dataTypeConfig={gunViolenceYouthConfig.dataTypeConfig}
        demographicType={RACE}
        reportTitle="Rates of gun deaths among children over time in Georgia"
        className={gunViolenceYouthConfig.className}
>>>>>>> 8c0462e4 (Data collection tab and Our Findings tab refinements (#3638))
      />
    ),
  },
  {
    report: `${HET_URL}/exploredata?mls=1.gun_violence_youth-3.13&group1=All#population-vs-distribution`,
    content: (
      <>
<<<<<<< HEAD
        As of 2022, Black Non-Hispanic youth were disproportionately affected by
        gun violence, accounting for{' '}
        <HetTermUnderline>
          68.0% of gun fatalities while making up only 31.1% of the population
        </HetTermUnderline>
        .
=======
        As of 2022, Black Non-Hispanic youth were disproportionately affected by gun violence, accounting for 
        <HetTermUnderline>
          68.0% of gun fatalities while making up only 31.1% of the population
        </HetTermUnderline>.
>>>>>>> 8c0462e4 (Data collection tab and Our Findings tab refinements (#3638))
      </>
    ),
    customCard: (
      <CustomDisparityBarChart
<<<<<<< HEAD
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_violence_youth'][0]}
        demographicType={RACE}
        reportTitle='Population vs. distribution of total gun deaths among children in Georgia'
        className='max-w-svw shadow-[none]'
=======
        fips={gunViolenceYouthConfig.fips}
        dataTypeConfig={gunViolenceYouthConfig.dataTypeConfig}
        demographicType={RACE}
        reportTitle="Population vs. distribution of total gun deaths among children in Georgia"
        className={gunViolenceYouthConfig.className}
>>>>>>> 8c0462e4 (Data collection tab and Our Findings tab refinements (#3638))
      />
    ),
  },
]

export const homicideFacts = [
  {
    report: `${HET_URL}/exploredata?mls=1.gun_violence-3.13&group1=All#inequities-over-time`,
    content: (
      <>
<<<<<<< HEAD
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
        className='max-w-svw shadow-[none]'
      />
    ),
  },
  {
    report: `${HET_URL}/exploredata?mls=1.gun_violence-3.13&group1=All#rate-chart`,
    content: (
      <>
        As of 2021,{' '}
        <HetTermUnderline>
          Black individuals experience a gun homicide rate of 27 per 100,000
          people
        </HetTermUnderline>
        .
      </>
=======
        Despite a decrease in firearm homicide rates for some groups in 2022, <HetTermUnderline>overall rates remained disturbingly high</HetTermUnderline> compared to 2019, with persistent elevations particularly among Black individuals.
      </>
    ),
    customCard: (
      <CustomShareTrendsLineChart
        fips={gunViolenceHomicideConfig.fips}
        dataTypeConfig={gunViolenceHomicideConfig.dataTypeConfig}
        demographicType={RACE}
        reportTitle="Historical relative inequity of gun homicides in Georgia"
        className={gunViolenceHomicideConfig.className}
      />
    ),
  },
  {
    report: `${HET_URL}/exploredata?mls=1.gun_violence-3.13&group1=All#rate-chart`,
    content: (
      <>
        As of 2021, <HetTermUnderline>Black individuals experience a gun homicide rate of 27 per 100,000 people</HetTermUnderline>.
      </>
    ),
    customCard: (
      <Custom100kBarChart
        fips={gunViolenceHomicideConfig.fips}
        dataTypeConfig={gunViolenceHomicideConfig.dataTypeConfig}
        demographicType={RACE}
        reportTitle="Rates of gun homicides in Georgia"
        className={gunViolenceHomicideConfig.className}
      />
>>>>>>> 8c0462e4 (Data collection tab and Our Findings tab refinements (#3638))
    ),
    customCard: (
      <Custom100kBarChart
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_violence'][0]}
        demographicType={RACE}
        reportTitle='Rates of gun homicides in Georgia'
		className='max-w-svw shadow-[none]'
      />
    ),
  },
]

export const suicideFacts = [
  {
    report: `${HET_URL}/exploredata?mls=1.gun_violence-3.13&group1=All&dt1=gun_violence_suicide#rates-over-time`,
    content: (
      <>
<<<<<<< HEAD
        From 2018 to 2021,{' '}
        <HetTermUnderline>
          gun-related suicide rates among Black individuals rose significantly
          from 7.9 to 11 per 100k
        </HetTermUnderline>
        , while rates among White individuals slightly decreased from 22 to 21
        per 100k, highlighting a concerning upward trend in the Black community.
=======
        From 2018 to 2021, <HetTermUnderline>gun-related suicide rates among Black individuals rose significantly from 7.9 to 11 per 100k</HetTermUnderline>, while rates among White individuals slightly decreased from 22 to 21 per 100k, highlighting a concerning upward trend in the Black community.
>>>>>>> 8c0462e4 (Data collection tab and Our Findings tab refinements (#3638))
      </>
    ),
    customCard: (
      <CustomAltTable
<<<<<<< HEAD
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_violence'][1]}
        demographicType={RACE}
        reportTitle='Rates of gun suicides over time in Georgia'
        selectedTableGroups={[BLACK_NH, WHITE_NH]}
        className='max-w-svw shadow-[none] py-0 mt-0 mb-4'
=======
        fips={gunViolenceSuicideConfig.fips}
        dataTypeConfig={gunViolenceSuicideConfig.dataTypeConfig}
        demographicType={RACE}
        reportTitle="Rates of gun suicides over time in Georgia"
        selectedTableGroups={[BLACK_NH, WHITE_NH]}
        className={gunViolenceSuicideConfig.className}
>>>>>>> 8c0462e4 (Data collection tab and Our Findings tab refinements (#3638))
      />
    ),
  },
  {
    report: `${HET_URL}/exploredata?mls=1.gun_violence-3.13&group1=All&dt1=gun_violence_suicide&demo=sex#data-table`,
    content: (
      <>
<<<<<<< HEAD
        From 2001 to 2021, the rate of gun-related suicides among females
        remained below 3.3 per 100,000, while{' '}
        <HetTermUnderline>
          the rate for males consistently exceeded 11 per 100,000
        </HetTermUnderline>
        .
=======
        From 2001 to 2021, the rate of gun-related suicides among females remained below 3.3 per 100,000, while <HetTermUnderline>the rate for males consistently exceeded 11 per 100,000</HetTermUnderline>.
>>>>>>> 8c0462e4 (Data collection tab and Our Findings tab refinements (#3638))
      </>
    ),
    customCard: (
      <CustomBreakdownSummary
<<<<<<< HEAD
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_violence'][1]}
        demographicType={SEX}
        reportTitle='Summary for gun suicides in Georgia by sex'
        className='max-w-svw shadow-[none] py-0 mt-0 mb-4'
=======
        fips={gunViolenceSuicideConfig.fips}
        dataTypeConfig={gunViolenceSuicideConfig.dataTypeConfig}
        demographicType={SEX}
        reportTitle="Summary for gun suicides in Georgia by sex"
        className={gunViolenceSuicideConfig.className}
>>>>>>> 8c0462e4 (Data collection tab and Our Findings tab refinements (#3638))
      />
    ),
  },
]

export const urbanicityFacts = [
<<<<<<< HEAD
	{
	  report: `${HET_URL}/exploredata?mls=1.gun_deaths_black_men-3.13&group1=All&demo=urbanicity#rates-over-time`,
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
		  className='max-w-svw shadow-[none] py-0 mt-0 mb-4'
		/>

	  ),
	},
	{
	  report: `${HET_URL}/exploredata?mls=1.gun_deaths_black_men-3.13&group1=All&demo=urbanicity#rate-map`,
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
		  className='max-w-svw shadow-[none] py-0 mt-0 mb-4'
		/>

	  ),
	},
=======
  {
    report: `${HET_URL}/exploredata?mls=1.gun_deaths_black_men-3.13&group1=All&demo=urbanicity#rates-over-time`,
    content: (
      <>
        <HetTermUnderline>Black (NH) men in Georgia had higher gun homicide rates in urban areas</HetTermUnderline> compared to rural areas from 2018 to 2021, reinforcing the perception of urban areas as more dangerous, while rural areas saw much lower or even negative rates.
      </>
    ),
    customCard: (
      <CustomRateTrendsLineChart
        fips={gunDeathsBlackMenConfig.fips}
        dataTypeConfig={gunDeathsBlackMenConfig.dataTypeConfig}
        demographicType="urbanicity"
        reportTitle="Rates of gun homicides among Black (NH) men in Georgia"
        className={gunDeathsBlackMenConfig.className}
      />
    ),
  },
  {
    report: `${HET_URL}/exploredata?mls=1.gun_deaths_black_men-3.13&group1=All&demo=urbanicity#rate-map`,
    content: (
      <>
        From 2018 to 2021, <HetTermUnderline>young Black (NH) men aged 15-29 in Georgia faced the highest homicide rates</HetTermUnderline>, with the 20-24 age group peaking at 108 per 100,000 in 2020, while rates were very low for children and older adults.
      </>
    ),
    customCard: (
      <CustomChoroplethMap
        fips={gunDeathsBlackMenConfig.fips}
        dataTypeConfig={gunDeathsBlackMenConfig.dataTypeConfig}
        demographicType={AGE}
        reportTitle="Rates of gun homicides among Black (NH) men in Georgia"
        className={gunDeathsBlackMenConfig.className}
      />
    ),
  },
>>>>>>> 8c0462e4 (Data collection tab and Our Findings tab refinements (#3638))
]