import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { BLACK_NH, RACE } from '../../../data/utils/Constants'
import { Fips } from '../../../data/utils/Fips'
import Custom100kBarChart from '../../../reports/Custom100kBarChart'
import CustomDisparityBarChart from '../../../reports/CustomDisparityBarChart'
import CustomRateTrendsLineChart from '../../../reports/CustomRateTrendsLineChart'
import CustomShareTrendsLineChart from '../../../reports/CustomShareTrendsLineChart'
import HetTermUnderline from '../../../styles/HetComponents/HetTermUnderline'

export const youthFatalitiesFacts = [
	{
		content: (
			<>
				From 2018 to 2021, the rate of {''}
				<HetTermUnderline>gun deaths among Black youth increased by
				approximately 75.44% in Georgia</HetTermUnderline>, while nationally, the rate doubled from 6.0 to 12 per 100k
				, indicating a more substantial increase across the US compared to
				Georgia alone.
			</>
		),
		customCard: ( <CustomRateTrendsLineChart
			fips={new Fips('13')}
			dataTypeConfig={METRIC_CONFIG['gun_violence_youth'][0]}
			demographicType={RACE}
			reportTitle='Rates of gun deaths among children over time in Georgia'
	className='shadow-[none] py-0 my-0'
		  />),
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
		), customCard: ( <CustomDisparityBarChart
			fips={new Fips('13')}
			dataTypeConfig={METRIC_CONFIG['gun_violence_youth'][0]}
			demographicType={RACE}
			reportTitle='Population vs. distribution of total gun deaths among children in Georgia'
			className='shadow-[none]'
		  />),
	},
]

export const homicideFacts = [
	{
		content: (
			<>
				Despite a decrease in firearm homicide rates for some groups in 2022,{' '}
				<HetTermUnderline>overall rates remained disturbingly high</HetTermUnderline>  compared to
				2019, with persistent elevations particularly among Black individuals.
			</>
		), customCard: (<CustomShareTrendsLineChart
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_violence'][0]}
        demographicType={RACE}
        reportTitle='Historical relative inequity of gun homicides in Georgia'
        isCompareCard={false}
		className='shadow-[none]'
      />),
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
		), customCard: (
			<Custom100kBarChart
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_violence'][0]}
        demographicType={RACE}
        reportTitle='Rates of gun homicides in Georgia'
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
		), customCard: ( <CustomRateTrendsLineChart
			fips={new Fips('13')}
			dataTypeConfig={METRIC_CONFIG['gun_violence_suicide'][0]}
			demographicType={RACE}
			reportTitle='Rates of gun suicides over time in Georgia'
	className='shadow-[none] py-0 my-0'
	selectedTableGroups={BLACK_NH}
	
		  />),
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
		), customCard: '',
	},
]

export const economicResources = [
	{
		title: 'Atlanta Community Food Bank',
		description: (
			<>
				This organization helps address food insecurity, which is a critical
				aspect of economic hardship. By providing access to basic needs, they
				indirectly help in reducing stressors that can lead to violence.
			</>
		),
		
	},
	{
		title: 'WorkSource Atlanta',
		description: (
			<>
				Offers job training and employment assistance, helping to bridge the gap
				in economic opportunities and reduce unemployment, a key factor in
				economic disparities.
			</>
		),
		
	},
]

export const educationalResources = [
	{
		title: 'Communities In Schools of Atlanta',
		description: (
			<>
				This group works within local schools to provide resources and support,
				ensuring that children stay in school and have access to quality
				education and after-school programs.
			</>
		),
		link: 'https://www.cisatlanta.org/',
	},
	{
		title: 'The Atlanta Educational Telecommunications Collaborative',
		description: (
			<>
				Focuses on educational programming and initiatives, aiming to enrich
				educational experiences in the community.
			</>
		),
		link: 'https://www.wabe.org/',
	},
]

export const justiceResources = [
	{
		title: 'The King Center',
		description: (
			<>
				Educates on the philosophy and methods of nonviolence and social change,
				addressing racial injustice as a core element of reducing violence.
			</>
		),
		link: 'https://thekingcenter.org/',
	},
	{
		title: 'Southern Center for Human Rights',
		description: (
			<>
				Works for equality, dignity, and justice for people impacted by the
				criminal legal system in the South, including addressing issues that
				lead to violence.
			</>
		),
		link: 'https://www.schr.org/',
	},
]

export const mentalHealthResources = [
	{
		title: 'NAMI Atlanta/Auburn',
		description: (
			<>
				Offers resources, support, and education on mental health, helping to
				destigmatize and provide critical mental health services in the
				community.
			</>
		),
		link: 'https://namiatlantaauburn.org/',
	},
	{
		title: 'CHRIS 180',
		description: (
			<>
				This organization focuses on healing and recovery from trauma, which is
				particularly important in communities affected by gun violence.
			</>
		),
		link: 'https://chris180.org/',
	},
]

export const communityResources = [
	{
		title: 'Cure Violence Atlanta',
		description: (
			<>
				Works to stop the spread of violence in communities by using methods and
				strategies associated with disease control – detecting and interrupting
				conflicts, identifying and treating high-risk individuals, and changing
				social norms.
			</>
		),
		link: 'https://chris180.org/program/violence-prevention/',
	},
	{
		title: 'Atlanta Police Foundation',
		description: (
			<>
				While it's a law enforcement-related entity, they often engage in
				community-based programs and partnerships to promote safety and prevent
				violence.
			</>
		),
		link: 'https://atlantapolicefoundation.org/',
	},
]
  
