import { Helmet } from 'react-helmet-async'
import { dataVisuals } from '../policyContent/HowToUseTheDataContent'
import { HetOverline } from '../../../styles/HetComponents/HetOverline'

export default function HowToUseTheDataTab() {
	return (
		<div >
			<Helmet>
				<title>How To Use The Data - Health Equity Tracker</title>
			</Helmet>
			<h2 className='sr-only'>How To Use The Data</h2>
			<section id='#het-data-visualizations'>
				<HetOverline text='How to Use the Data'/>
				<h3 className='my-0 text-title font-medium text-altGreen'>
					HET Data Visualization Maps and Charts
				</h3>
				<p>
					In Atlanta, as in many cities, gun violence remains a pressing issue,
					disproportionately affecting marginalized communities. The open-source
					Health Equity Tracker provides vital data that can empower residents
					to advocate for meaningful policy changes. By understanding and
					utilizing this tool, community members can create compelling
					visualizations to highlight the need for reform. This guide offers
					straightforward instructions on how to use various data visualizations
					effectively.
				</p>
			</section>
			{dataVisuals.map((dataVisual, index) => (
				<section key={index} id={dataVisual.sectionId}>
					<div>
						<div>
							<div>
								<div>
									<HetOverline text='Our Data Visuals'/>
									<div>
										<h3 className='my-0 text-title font-medium text-altGreen'>
											{dataVisual.title}
										</h3>
									</div>
									<div className='xs:py-4 p-0 m-0 w-full'>
										{dataVisual.customCard}
									</div>
									<p>{dataVisual.description}</p>
								</div>
							</div>
							<div>
								<ul className='list-none grid gap-4 grid-cols-2 p-0 text-smallest'>
									<li className='flex flex-col'>
										<p className='my-0 text-altGreen font-semibold'>
											Demographic Granularity
										</p>
										<p className='my-0'>
											{Array.isArray(
												dataVisual.details.demographicGranularities,
											)
												? dataVisual.details.demographicGranularities.join(', ')
												: dataVisual.details.demographicGranularities}
										</p>
									</li>
									<li className='flex flex-col'>
										<p className='my-0 text-altGreen font-semibold'>
											Geographic Levels
										</p>
										<p className='my-0'>
											{Array.isArray(dataVisual.details.geographicLevels)
												? dataVisual.details.geographicLevels.join(', ')
												: dataVisual.details.geographicLevels}
										</p>
									</li>
									{dataVisual.details.alternateBreakdowns !== 'N/A' && (
										<li className='flex flex-col'>
											<p className='my-0 text-altGreen font-semibold'>
												Alternate Disparities Breakdowns
											</p>
											<p className='my-0'>
												{Array.isArray(dataVisual.details.alternateBreakdowns)
													? dataVisual.details.alternateBreakdowns.join(', ')
													: dataVisual.details.alternateBreakdowns}
											</p>
										</li>
									)}
								</ul>
							</div>
						</div>
						<p>
							<h3 className='my-0 text-title font-medium text-altGreen'>
								How to Use
							</h3>
							<div>
								{dataVisual.details.howToUse.map((step, i) => (
									<p className='py-0 my-0' key={i}>
										<strong>{step.step}:</strong> {step.description}
									</p>
								))}
							</div>
						</p>
						<div className='mt-8 border border-b-1 border-t-0 border-x-0 border-solid border-methodologyGreen'></div>
					</div>
				</section>
			))}
		</div>
	)
}