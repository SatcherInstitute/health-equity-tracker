import { Helmet } from 'react-helmet-async'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import { FormatQuote } from '@mui/icons-material'

export default function CrisisOverviewTab() {
	return (
		<>
			<Helmet>
				<title>Crisis Overview - Health Equity Tracker</title>
			</Helmet>
			<h2 className='sr-only'>
				Understanding the Crisis of Gun Violence in Atlanta
			</h2>
			<div className='flex flex-col gap-2'>
				<h2>Understanding the Crisis of Gun Violence in Atlanta</h2>
				<section id='#introduction'>
					<h3 className='text-title font-medium'>Introduction</h3>
					<p>
						The Health Equity Tracker (HET) in partnership with The Annie E.
						Casey Foundation expanded its topics to track and integrate gun
						violence data and community engagement in an initiative to promote
						community safety and advance health equity within the Fulton and
						DeKalb counties of Atlanta, Georgia. This research aims to highlight
						the experiences of these young individuals by providing
						youth-focused reports to contextualize the impact of the lived
						experiences and challenges the affected youth have unfortunately
						faced in their adolescence.
					</p>
				</section>
				<section id='#background'>
					<div className='mb-0'>
						<p className='my-0 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
							BY THE NUMBERS
						</p>
						<p className='my-0 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
							SOURCE: GUN VIOLENCE ARCHIVE{' '}
							<a href='https://www.gunviolencearchive.org/'>
								<span>
									[<FormatQuote className='text-text'></FormatQuote>]
								</span>
							</a>
						</p>
					</div>
					<h3 className='my-0 text-title font-medium text-altGreen'>
						Background
					</h3>

					<ul className='list-none px-4 grid gap-8 md:grid-cols-2 grid-cols-1 py-4 my-0'>
						<li className='rounded-xl border border-solid border-altGreen md:mx-2 m-2 p-8 duration-300 ease-in-out hover:shadow-raised group bg-hoverAltGreen hover:bg-whiteSmoke80 flex flex-row align-center'>
							<p className='group-hover:text-exploreButton duration-100 ease-in-out text-center content-center'>
								Only four months into 2024, Georgia has already witnessed a
								staggering toll of over{' '}
								<HetTerm>92 lives lost to firearm-related incidents</HetTerm>.
							</p>
						</li>
						<li className='rounded-xl border border-solid border-altGreen md:mx-2 m-2 p-8 duration-300 ease-in-out hover:shadow-raised group bg-hoverAltGreen hover:bg-whiteSmoke80 flex flex-row align-center'>
							<p className='group-hover:text-exploreButton duration-100 ease-in-out text-center content-center'>
								In 2023, Atlanta experienced no fewer than six mass shootings,
								with each event tragically{' '}
								<HetTerm>claiming six lives and injuring 22 others</HetTerm>,
								marking a series of deliberate, targeted attacks that shook the
								community.
							</p>
						</li>
						<li className='rounded-xl border border-solid border-altGreen md:mx-2 m-2 p-8 duration-300 ease-in-out hover:shadow-raised group bg-hoverAltGreen hover:bg-whiteSmoke80 flex flex-row align-center'>
							<p className='group-hover:text-exploreButton duration-100 ease-in-out text-center content-center'>
								As of April 2024, firearms have injured four children in
								Atlanta, raising the total to{' '}
								<HetTerm>53 children injured</HetTerm> since 2021, underscoring
								an urgent need for protective measures.
							</p>
						</li>
						<li className='rounded-xl border border-solid border-altGreen md:mx-2 m-2 p-8 duration-300 ease-in-out hover:shadow-raised group bg-hoverAltGreen hover:bg-whiteSmoke80 flex flex-row align-center'>
							<p className='group-hover:text-exploreButton duration-100 ease-in-out text-center content-center'>
								Since 2015, firearms have tragically{' '}
								<HetTerm>claimed the lives of 22 children</HetTerm> in Atlanta.
							</p>
						</li>
					</ul>
					<p>
						By expanding the Health Equity Tracker to include gun violence data,
						the project aims to offer informed insights and actionable
						information, underpinned by the realities of the crisis in Atlanta.
						The data aims to foster dialogue, ensuring that stakeholders and the
						broader community are both informed and involved.
						<br />
						<br />
						We hope this report will equip fellow researchers, policymakers, and
						other gun violence-prevention organizations with the data necessary
						to advocate for policy reform that support the work to end the
						public health crisis of youth-involved gun violence. This
						collaboration with the Annie E. Casey Foundation not only broadens
						the scope of the HET but also serves as a stepping-stone for
						capacity-building, promoting lasting change, and community
						resilience.
					</p>
				</section>
			</div>
		</>
	)
}