import { Helmet } from 'react-helmet-async'

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
			<h2>
				Understanding the Crisis of Gun Violence in Atlanta
			</h2>
				<section className='my-2' id='#introduction'>
					<h3 className='text-title font-medium'>Introduction</h3>
					<p>
						The Health Equity Tracker (HET) in partnership with The Annie E. Casey
						Foundation expanded its topics to track and integrate gun violence
						data and community engagement in an initiative to promote community
						safety and advance health equity within the Fulton and DeKalb counties
						of Atlanta, Georgia. This research aims to highlight the experiences
						of these young individuals by providing youth-focused reports to
						contextualize the impact of the lived experiences and challenges the
						affected youth have unfortunately faced in their adolescence.
					</p>
				</section>
				<section className='my-2' id='#background'>
					<div className='mb-2'>
					<p className='my-0 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
						BY THE NUMBERS
					</p>
					<p className='my-0 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
						SOURCE: GUN VIOLENCE ARCHIVE
					</p>
					</div>
					<h3 className='my-0 text-title font-medium text-altGreen'>Background</h3>
					<p></p>
					<ul className='list-disc pl-4'>
						<li>
							Only four months into 2024, Georgia has already witnessed a
							staggering toll of over 92 lives lost to firearm-related incidents.
						</li>
						<li>
							In 2023, Atlanta experienced no fewer than six mass shootings, with
							each event tragically claiming six lives and injuring 22 others,
							marking a series of deliberate, targeted attacks that shook the
							community.
						</li>
						<li>
							As of April 2024, firearms have injured four children in Atlanta,
							raising the total to 53 children injured since 2021, underscoring an
							urgent need for protective measures.
						</li>
						<li>
							Since 2015, firearms have tragically claimed the lives of 22
							children in Atlanta.
						</li>
					</ul>
					<p>
						By expanding the Health Equity Tracker to include gun violence data,
						the project aims to offer informed insights and actionable
						information, underpinned by the realities of the crisis in Atlanta.
						The data aims to foster dialogue, ensuring that stakeholders and the
						broader community are both informed and involved.
						<br /><br />
						We hope this report will equip fellow researchers, policymakers, and
						other gun violence-prevention organizations with the data necessary to
						advocate for policy reform that support the work to end the public
						health crisis of youth-involved gun violence. This collaboration with
						the Annie E. Casey Foundation not only broadens the scope of the HET
						but also serves as a stepping-stone for capacity-building, promoting
						lasting change, and community resilience.
					</p>
				</section>
			</div>
		</>
	)
}