import { AttachMoney, CampaignRounded, Diversity3Rounded, HistoryEduRounded, LocalPoliceRounded, PanToolRounded, PsychologyRounded, QueryStatsOutlined, SchoolRounded, VolunteerActivismRounded } from '@mui/icons-material'

export const effortsAndInitiatives = [
	{
		icon: (<PsychologyRounded className='text-title mt-1'/>),
		title: 'Mental Health and Social Support Expansion',
		description: (
			<>
				Enhance mental health services and broaden social support systems to address the roots of violence, focusing on both prevention and post-trauma care.
			</>
		),
	},
	{
		icon: (<SchoolRounded className='text-title mt-1'/>),
		title: 'Educational and Economic Empowerment',
		description: (
			<>
				Implement education and job training programs to tackle economic disparities that often intertwine with violence, offering pathways to stability and prosperity.
			</>
		),
	},
	{
		icon: (<PanToolRounded className='text-title mt-1'/>),
		title: 'Community-Led Violence Prevention',
		description: (
			<>
				Adopt programs like the Cure Violence model, involving local residents in preventing violence through initiatives grounded in understanding and addressing community-specific needs.
			</>
		),
	},
	{
		icon: (<LocalPoliceRounded className='text-title mt-1'/>),
		title: 'Progressive Policing Reforms',
		description: (
			<>
				Introduce changes in police practices, emphasizing de-escalation techniques and community-oriented policing, to foster trust and diffuse potential conflicts.
			</>
		),
	},
	{
		icon: (<CampaignRounded className='text-title mt-1'/>),
		title: 'Comprehensive Gun Control',
		description: (
			<>
				Advocate for and enact stricter gun legislation to limit the accessibility of firearms, thereby directly impacting gun violence rates.
			</>
		),
	},
	{
		icon: (<QueryStatsOutlined className='text-title mt-1'/>),
		title: 'Informed Research and Data Analysis',
		description: (
			<>
				Leverage data, perhaps using tools like the Health Equity Tracker, to identify and understand gun violence trends, enabling targeted, effective intervention strategies.
			</>
		),
	},
	{
		icon: (<VolunteerActivismRounded className='text-title mt-1'/>),
		title: 'Social Services Enhancement',
		description: (
			<>
				Invest in services that tackle root causes like poverty, unemployment, and educational gaps, thereby diminishing key factors contributing to violence.
			</>
		),
	},
	{
		icon: (<HistoryEduRounded className='text-title mt-1'/>),
		title: 'Policy Advocacy for Change',
		description: (
			<>
				Push for stronger enforcement of existing laws and advocate for new policies that address both the symptoms and sources of gun violence.
			</>
		),
	},
]

export const legislativeActions = [
	{
		title: 'S.3407 — Gun Violence Prevention and Community Safety Act of 2023',
		description: (
			<>
				This legislation is designed to address gun violence through a comprehensive approach. It likely includes provisions for stricter background checks, restrictions on certain types of firearms and ammunition, and measures to close loopholes in existing gun laws.
			</>
		), 
		liRaised: true
	},
	{
		title: 'H.R.4283 — Gun Violence Prevention and Safe Communities Act of 2023',
		description: (
			<>
				This bill probably focuses on similar goals as S.3407 but might differ in specific approaches or legal mechanisms. The aim is to reduce gun violence and ensure safer communities through legislative action.
			</>
		), 
		liRaised: false
	},
	{
		title: 'Legislation Similar to H.R.850',
		description: (
			<>
				This refers to a proposal to direct the Attorney General to conduct a study on the effectiveness of extreme risk protection orders (ERPOs). ERPOs, also known as 'red flag laws,' allow for the temporary removal of firearms from individuals deemed to be a risk to themselves or others. This study would assess how effective these orders are in reducing gun violence.
			</>
		), 
		liRaised: true
	},
	{
		title: 'Support for Research Grants Aimed at Informing Firearm-Related Violence and Injury Prevention Strategies',
		description: (
			<>
				This involves funding research initiatives that explore the causes, effects, and prevention strategies related to gun violence and injuries. Such research could provide critical data for shaping effective public policies.
			</>
		), 
		liRaised: false
	},
	{
		title: 'Legislation for a 7-Day Waiting Period',
		description: (
			<>
				This proposal suggests a mandatory waiting period of seven days before the transfer of certain firearms and related items, such as semiautomatic firearms, silencers, armor-piercing ammunition, or large capacity ammunition magazines. The waiting period could serve as a cooling-off time to prevent impulsive acts of violence and ensure thorough background checks.
			</>
		), 
		liRaised: true
	},
]

export const advocacyCommunityInsights = [
	{
	  title: "Geographic Disparities in Trauma Care",
	  description: "Advocates emphasized the need for improved access to Level 1 trauma centers in under-resourced areas, such as Wards 7 and 8 in Washington, D.C. This is critical for reducing mortality rates in gun violence cases, especially in neighborhoods with high rates of multiple gunshot wounds."
	},
	{
	  title: "Hospital Violence Intervention Programs",
	  description: "Data shows that individuals who have been previously injured are at a higher risk of mortality if re-injured. Advocates suggest strengthening hospital-based intervention programs to address this issue and reduce repeat incidents."
	},
	{
	  title: "Emergency Services Response Times",
	  description: "There are concerns about the distance between where victims are picked up by emergency services and the hospitals they are transferred to, especially in underserved areas. Shortening response times could save lives."
	},
	{
	  title: "Weapon Accessibility",
	  description: "Advocates raised concerns about the types of weapons most commonly used in violent incidents. They emphasize the need for better data collection on which weapons are more accessible in different communities."
	},
	{
	  title: "Root Causes of Violence",
	  description: "Efforts should focus on addressing the root causes of violence, such as economic inequality and lack of resources, which are prevalent in gentrified and under-resourced zip codes. The CDC’s work on social determinants of health is highlighted as a key reference for tackling these issues."
	},
	{
	  title: "Data on Violence Disparities",
	  description: "There is a need for aggregated data that highlights disparities in gun violence across different zip codes. Advocates stress that data should focus on resources and social determinants of health to identify and address disparities."
	}
  ];