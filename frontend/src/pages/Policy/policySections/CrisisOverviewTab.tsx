import { Helmet } from 'react-helmet-async'
import { FormatQuote } from '@mui/icons-material'
import { gvaFacts, rocketFoundationFacts } from '../policyContent/CrisisOverviewContent'
import FactCard from '../policyComponents/FactCard'

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
				<section id='#introduction'>
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
							SOURCE: The Rocket Foundation{' '}
							<a href='https://www.rocket-foundation.org/'>
								<span>
									[<FormatQuote className='text-text'></FormatQuote>]
								</span>
							</a>
						</p>
					</div>
					<ul className='list-none pl-0 grid gap-4 sm:grid-cols-2 grid-cols-1 pt-2 pb-4 my-0'>
						{rocketFoundationFacts.map((rocketFoundationFact, index) => (
							<li key={index} className={`fade-in-up-blur`} style={{ animationDelay: `${index * 0.1}s` }}>
							<FactCard key={index} content={rocketFoundationFact.content} />
							</li>
						))}
					</ul>
					<p className='my-0 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
							SOURCE: Gun Violence Archive{' '}
							<a href='https://www.gunviolencearchive.org/'>
								<span>
									[<FormatQuote className='text-text'></FormatQuote>]
								</span>
							</a>
						</p>
					
					<ul className='list-none pl-0 grid gap-4 sm:grid-cols-2 grid-cols-1 pt-2 pb-4 my-0'>
						{gvaFacts.map((gvaFact, index) => (
							<li key={index} className={`fade-in-up-blur`} style={{ animationDelay: `${index * 0.1}s` }}>
							<FactCard key={index} content={gvaFact.content} />
							</li>
						))}
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