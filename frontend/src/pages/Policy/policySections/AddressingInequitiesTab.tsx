import { Helmet } from 'react-helmet-async'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import HetTextArrowLink from '../../../styles/HetComponents/HetTextArrowLink'

export default function AddressingInequitiesTab() {
	return (
		<>
			<Helmet>
				<title>Addressing Inequities - Health Equity Tracker</title>
			</Helmet>
			<h2 className="sr-only">Addressing Inequities</h2>
			<section id="#">
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
				<div>
					<HetTextArrowLink link={""} linkText={"Economic Inequality"} />
					<HetTextArrowLink link={""} linkText={"Educational Opportunities"} />
					<HetTextArrowLink link={""} linkText={"Racial and Social Justice"} />
					<HetTextArrowLink link={""} linkText={"Mental Health Services"} />
					<HetTextArrowLink link={""} linkText={"Community Engagement"} />
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
			<section id="#">
				<div className="mb-0">
					<p className="my-0 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest">
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
			<section id="#">
				<div className="mb-0">
					<p className="my-0 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest">
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
			<section id="#">
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
						<p>
							<a className="font-semibold" href="">
								Atlanta Community Food Bank
							</a>: This organization helps address food insecurity, which is a
							critical aspect of economic hardship. By providing access to basic
							needs, they indirectly help in reducing stressors that can lead to
							violence.
						</p>
					</li>
				</ul>
			</section>
			<section id="#">
				<div className="mb-0">
					<p className="my-0 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest">
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
			<section id="#">
				<h3 className="my-0 text-title font-medium text-altGreen">
					Educational Opportunities
				</h3>
			</section>
			<section id="#">
				<h3 className="my-0 text-title font-medium text-altGreen">
					Racial and Social Justice
				</h3>
			</section>
			<section id="#">
				<h3 className="my-0 text-title font-medium text-altGreen">
					Mental Health Services
				</h3>
			</section>
			<section id="#">
				<h3 className="my-0 text-title font-medium text-altGreen">
					Community Engagement
				</h3>
			</section>
		</>
	);
}