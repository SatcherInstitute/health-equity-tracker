import { Helmet } from 'react-helmet-async'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import HetTextArrowLink from '../../../styles/HetComponents/HetTextArrowLink'
import { ArrowDownwardRounded, AttachMoneyRounded, Diversity3Rounded, GavelRounded, PsychologyRounded, SchoolRounded } from '@mui/icons-material'

export default function AddressingInequitiesTab() {
	return (
		<>
			<Helmet>
				<title>Addressing Inequities - Health Equity Tracker</title>
			</Helmet>
			<h2 className="sr-only">Addressing Inequities</h2>
			<section id="#health-inequities-definition">
				<p>
					{" "}
					<HetTerm>Health inequities</HetTerm> <em>(noun)</em>: Unfair and
					avoidable differences in health status across various groups,
					influenced by social, economic, and environmental factors.
					<br />
					<br />
					Addressing the root causes of gun violence involves a comprehensive
					approach that includes:
				</p>
				<div className="mb-8 grid md:grid-cols-5 gap-4 grid-cols-3">
					<a
						href="#economic-inequality"
						className="rounded-md shadow-raised p-8 group no-underline hover:scale-105 hover:transition-transform hover:duration-30 "
					>
						<div className="bg-hoverAltGreen p-2 w-fit rounded-sm text-altGreen group-hover:scale-110 ">
							<AttachMoneyRounded />
						</div>
						<p className="text-text font-semibold leading-lhNormal text-black">
							Economic Inequality
						</p>
						<p className="text-smallest font-semibold tracking-normal">
							Jump to section <ArrowDownwardRounded className="text-text" />
						</p>
					</a>
					<a
						href="#educational-opportunities"
						className="rounded-md shadow-raised p-8 group no-underline hover:scale-105 hover:transition-transform hover:duration-30 "
					>
						<div className="bg-hoverAltGreen p-2 w-fit rounded-sm text-altGreen group-hover:scale-110 ">
							<SchoolRounded />
						</div>
						<p className="text-text font-semibold leading-lhNormal text-black">
							Educational Opportunities
						</p>
						<p className="text-smallest font-semibold tracking-normal">
							Jump to section <ArrowDownwardRounded className="text-text" />
						</p>
					</a>
					<a
						href="#racial-and-social-justice"
						className="rounded-md shadow-raised p-8 group no-underline hover:scale-105 hover:transition-transform hover:duration-30 "
					>
						<div className="bg-hoverAltGreen p-2 w-fit rounded-sm text-altGreen group-hover:scale-110 ">
							<GavelRounded />
						</div>
						<p className="text-text font-semibold leading-lhNormal text-black">
							Racial and Social Justice
						</p>
						<p className="text-smallest font-semibold tracking-normal">
							Jump to section <ArrowDownwardRounded className="text-text" />
						</p>
					</a>
					<a
						href="#mental-health-services"
						className="rounded-md shadow-raised p-8 group no-underline hover:scale-105 hover:transition-transform hover:duration-30 "
					>
						<div className="bg-hoverAltGreen p-2 w-fit rounded-sm text-altGreen group-hover:scale-110 ">
							<PsychologyRounded />
						</div>
						<p className="text-text font-semibold leading-lhNormal text-black">
							Mental Health Services
						</p>
						<p className="text-smallest font-semibold tracking-normal">
							Jump to section <ArrowDownwardRounded className="text-text" />
						</p>
					</a>
					<a
						href="#community-engagement"
						className="rounded-md shadow-raised p-8 group no-underline hover:scale-105 hover:transition-transform hover:duration-30 "
					>
						<div className="bg-hoverAltGreen p-2 w-fit rounded-sm text-altGreen group-hover:scale-110 ">
							<Diversity3Rounded />
						</div>
						<p className="text-text font-semibold leading-lhNormal text-black">
							Community Engagement
						</p>
						<p className="text-smallest font-semibold tracking-normal">
							Jump to section <ArrowDownwardRounded className="text-text" />
						</p>
					</a>
				</div>

				<p>
					By recognizing these interconnections, the Health Equity Tracker not
					only provides data but also underscores the multi-faceted nature of
					gun violence.
					<br />
					<br />
					This approach advocates for holistic solutions that address the root
					causes of gun violence, which are often found in the systemic
					inequities plaguing these communities.The patterns observed in Atlanta
					reflect a broader narrative of health inequity, where the determinants
					of health unfairly disadvantage certain groups, leading to disparities
					in violence exposure.
				</p>
			</section>
			<section id="#ga-youth-fatalities">
				<div className="mb-0">
					<p className="mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest">
						OUR FINDINGS
					</p>
					<h3 className="my-0 text-title font-medium text-altGreen">
						Georgia's Youth Fatality Rates
					</h3>
					<ul className="list-none px-4 grid gap-8 md:grid-cols-2 grid-cols-1 py-4 my-0">
						<li className="rounded-xl border border-solid border-altGreen md:mx-2 m-2 p-8 duration-300 ease-in-out hover:shadow-raised group bg-hoverAltGreen hover:bg-whiteSmoke80 flex flex-row align-center text-exploreButton">
							<p className="group-hover:duration-100 ease-in-out text-center content-center">
								From 2018 to 2021, the rate of gun deaths among Black youth
								increased by approximately 75.44% in Georgia, while {" "}
								<HetTerm>
									nationally, the rate doubled from 6.0 to 12 per 100k
								</HetTerm>{" "}
								, indicating a more substantial increase across the US compared
								to Georgia alone.
							</p>
						</li>
						<li className="rounded-xl border border-solid border-altGreen md:mx-2 m-2 p-8 duration-300 ease-in-out hover:shadow-raised group bg-hoverAltGreen hover:bg-whiteSmoke80 flex flex-row align-center text-exploreButton">
							<p className="group-hover:duration-100 ease-in-out text-center content-center">
								As of 2022, Black Non-Hispanic youth were disproportionately
								affected by gun violence, accounting for{" "}
								<HetTerm>
									68.0% of gun fatalities while making up only 31.1% of the
									population
								</HetTerm>
								.
							</p>
						</li>
					</ul>
				</div>
			</section>
			<section id="#ga-homicides">
				<div className="mb-0">
					<p className="mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest">
						OUR FINDINGS
					</p>
					<h3 className="my-0 text-title font-medium text-altGreen">
						Georgia's Homicide Rates
					</h3>

					<ul className="list-none px-4 grid gap-8 md:grid-cols-3 grid-cols-1 py-4 my-0">
						<li className="rounded-xl border border-solid border-altGreen md:mx-2 m-2 p-8 duration-300 ease-in-out hover:shadow-raised group bg-hoverAltGreen hover:bg-whiteSmoke80 flex flex-row align-center text-exploreButton">
							<p className="group-hover:duration-100 ease-in-out text-center content-center">
								Despite a decrease in firearm homicide rates for some groups in
								2022,{" "}
								<HetTerm>overall rates remained disturbingly high</HetTerm>{" "}
								 compared to 2019, with persistent elevations particularly among
								Black individuals.
							</p>
						</li>
						<li className="rounded-xl border border-solid border-altGreen md:mx-2 m-2 p-8 duration-300 ease-in-out hover:shadow-raised group bg-hoverAltGreen hover:bg-whiteSmoke80 flex flex-row align-center text-exploreButton">
							<p className="group-hover:duration-100 ease-in-out text-center content-center">
								As of 2021,{" "}
								<HetTerm>
									Black individuals experience a gun homicide rate of 27 per
									100,000 people
								</HetTerm>
								.
							</p>
						</li>
						<li className="rounded-xl border border-solid border-altGreen md:mx-2 m-2 p-8 duration-300 ease-in-out hover:shadow-raised group bg-hoverAltGreen hover:bg-whiteSmoke80 flex flex-row align-center text-exploreButton">
							<p className="group-hover:duration-100 ease-in-out text-center content-center">
								Over the past six years,{" "}
								<HetTerm>
									Black individuals have experienced a disproportionately high
									rate of gun violence homicides
								</HetTerm>
								, representing at least 120% of the inequities observed over
								this period.
							</p>
						</li>
					</ul>
				</div>
			</section>
			<section id="#economic-inequality">
				<p className="mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest">
					INTERCONNECTIONS
				</p>
				<h3 className="my-0 text-title font-medium text-altGreen">
					Economic Inequality
				</h3>
				<p>
					Organizations focusing on reducing economic inequality are crucial in
					the fight against gun violence, as poverty and lack of opportunities
					can contribute to crime.
				</p>
				<ul className="list-none">
					<li className="flex flex-row align-center">
						<p className="p-0 mt-0 mb-4">
							<a className="font-semibold no-underline text-black" href="">
								Atlanta Community Food Bank
							</a>
							: This organization helps address food insecurity, which is a
							critical aspect of economic hardship. By providing access to basic
							needs, they indirectly help in reducing stressors that can lead to
							violence.
						</p>
					</li>
					<li className="flex flex-row align-center">
						<p className="p-0 mt-0 mb-4">
							<a className="font-semibold no-underline text-black" href="">
							WorkSource Atlanta
							</a>
							: Offers job training and employment assistance, helping to bridge the gap in economic opportunities and reduce unemployment, a key factor in economic disparities.
						</p>
					</li>
				</ul>
			</section>
			<section id="#educational-opportunities">
				<p className="mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest">
					INTERCONNECTIONS
				</p>
				<h3 className="my-0 text-title font-medium text-altGreen">
					Educational Opportunities
				</h3>
				<p>
				Improving access to education is a vital step in preventing gun violence.
				</p>
				<ul className="list-none">
					<li className="flex flex-row align-center">
						<p className="p-0 mt-0 mb-4">
							<a className="font-semibold no-underline text-black" href="">
							Communities In Schools of Atlanta
							</a>
							: This group works within local schools to provide resources and support, ensuring that children stay in school and have access to quality education and after-school programs.
						</p>
					</li>
					<li className="flex flex-row align-center">
						<p className="p-0 mt-0 mb-4">
							<a className="font-semibold no-underline text-black" href="">
							The Atlanta Educational Telecommunications Collaborative (AETC)
							</a>
							: Focuses on educational programming and initiatives, aiming to enrich educational experiences in the community.
						</p>
					</li>
				</ul>
			</section>
			<section id="#racial-and-social-justice">
				<p className="mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest">
					INTERCONNECTIONS
				</p>
				<h3 className="my-0 text-title font-medium text-altGreen">
					Racial and Social Justice
				</h3>
				<p>
				Tackling systemic racial and social injustice is a fundamental aspect of addressing the root causes of gun violence.
				</p>
				<ul className='list-none'>
					<li className='flex flex-row align-center'>
						<p className='p-0 mt-0 mb-4'>
							<a className='font-semibold no-underline text-black' href=''>
							The King Center
							</a>: Educates on the philosophy and methods of nonviolence and social change, addressing racial injustice as a core element of reducing violence.						
						</p>
						
					</li>
					<li className='flex flex-row align-center'>
						<p className='p-0 mt-0 mb-4'>
							<a className='font-semibold no-underline text-black' href=''>
							Southern Center for Human Rights
							</a>: Works for equality, dignity, and justice for people impacted by the criminal legal system in the South, including addressing issues that lead to violence.
						</p>
						
					</li>
				</ul>
			</section>
			<section id="#ga-suicides">
				<div className="mb-0">
					<p className="mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest">
						OUR FINDINGS
					</p>
					<h3 className="my-0 text-title font-medium text-altGreen">
						Georgia's Suicide Rates
					</h3>
					<ul className="list-none px-4 grid gap-8 md:grid-cols-2 grid-cols-1 py-4 my-0">
						<li className="rounded-xl border border-solid border-altGreen md:mx-2 m-2 p-8 duration-300 ease-in-out hover:shadow-raised group bg-hoverAltGreen hover:bg-whiteSmoke80 flex flex-row align-center text-exploreButton">
							<p className="group-hover:duration-100 ease-in-out text-center content-center">
								From 2018 to 2021,{" "}
								<HetTerm>
									gun-related suicide rates among Black individuals rose
									significantly from 7.9 to 11 per 100k
								</HetTerm>
								, while rates among White individuals slightly decreased from 22
								to 21 per 100k, highlighting a concerning upward trend in the
								Black community.
							</p>
						</li>
						<li className="rounded-xl border border-solid border-altGreen md:mx-2 m-2 p-8 duration-300 ease-in-out hover:shadow-raised group bg-hoverAltGreen hover:bg-whiteSmoke80 flex flex-row align-center text-exploreButton">
							<p className="group-hover:duration-100 ease-in-out text-center content-center">
								From 2001 to 2021, the rate of gun-related suicides among
								females remained below 3.3 per 100,000, while{" "}
								<HetTerm>
									the rate for males consistently exceeded 11 per 100,000
								</HetTerm>
								.
							</p>
						</li>
					</ul>
				</div>
			</section>
			<section id="#mental-health-services">
				<p className="mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest">
					INTERCONNECTIONS
				</p>
				<h3 className="my-0 text-title font-medium text-altGreen">
					Mental Health Services
				</h3>
				<p>
				Expanded access to mental health services is essential in addressing the trauma and stress that can lead to violence.
				</p>
				<ul className='list-none'>
					<li className='flex flex-row align-center'>
						<p className='p-0 mt-0 mb-4'>
							<a className='font-semibold no-underline text-black' href=''>
							NAMI Atlanta/Auburn
							</a>: Offers resources, support, and education on mental health, helping to destigmatize and provide critical mental health services in the community.						
						</p>
						
					</li>
					<li className='flex flex-row align-center'>
						<p className='p-0 mt-0 mb-4'>
							<a className='font-semibold no-underline text-black' href=''>
							CHRIS 180
							</a>: This organization focuses on healing and recovery from trauma, which is particularly important in communities affected by gun violence.
						</p>
						
					</li>
				</ul>
			</section>
			<section id="#community-engagement">
				<p className="mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest">
					INTERCONNECTIONS
				</p>
				<h3 className="my-0 text-title font-medium text-altGreen">
					Community Engagement
				</h3>
				<p>
					Organizations that encourage community involvement in safety and
					prevention initiatives are key players.
				</p>
				<ul className="list-none">
					<li className="flex flex-row align-center">
						<p className="p-0 mt-0 mb-4">
							<a className="font-semibold no-underline text-black" href="">
								Cure Violence Atlanta
							</a>
							: Works to stop the spread of violence in communities by using
							methods and strategies associated with disease control – detecting
							and interrupting conflicts, identifying and treating high-risk
							individuals, and changing social norms.
						</p>
					</li>
					<li className="flex flex-row align-center">
						<p className="p-0 mt-0 mb-4">
							<a className="font-semibold no-underline text-black" href="">
								Atlanta Police Foundation
							</a>
							: While it's a law enforcement-related entity, they often engage
							in community-based programs and partnerships to promote safety and
							prevent violence.
						</p>
					</li>
				</ul>
			</section>
		</>
	);
}