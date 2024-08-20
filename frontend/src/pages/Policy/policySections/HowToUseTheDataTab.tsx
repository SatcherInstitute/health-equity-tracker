import { Helmet } from 'react-helmet-async'
import { dataVisuals } from '../policyContent/HowToUseTheDataContent';

export default function HowToUseTheDataTab() {
	return (
		<>
			<Helmet>
				<title>How To Use The Data - Health Equity Tracker</title>
			</Helmet>
			<h2 className="sr-only">How To Use The Data</h2>
			<section id='#introduction'>
			<p className='mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>HOW TO USE THE DATA</p>
			<h3 className='my-0 text-title font-medium text-altGreen'>HET Data Visualization Maps and Charts</h3>
					<p>In Atlanta, as in many cities, gun violence remains a pressing issue, disproportionately affecting marginalized communities. The open-source Health Equity Tracker provides vital data that can empower residents to advocate for meaningful policy changes. By understanding and utilizing this tool, community members can create compelling visualizations to highlight the need for reform. This guide offers straightforward instructions on how to use various data visualizations effectively.</p></section>
			<section>
	{dataVisuals.map((dataVisual, index) => (
		<div key={index} className="map-profile-div">
			<div className="wrap-v-x-small">
				<div className="cta-header-info">
					<div className="title-wrapper-large">
					<p className='mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>OUR DATA VISUALS</p>
						<div className="heading-wrap">
						<h3 className='my-0 text-title font-medium text-altGreen'>{dataVisual.title}</h3>
							<a href="#" className="help" data-tippy-content={dataVisual.tooltip || ''}>
								{/* Omitted SVG */}
							</a>
						</div>
						<a href={dataVisual.imageLink} className="map-example rate-map">
							{/* Omitted image JSON */}
							{/* Omitted Lightbox HTML */}
						</a>
						<div className="m-template-info-wrapper map">
							<div className="m-cta-info-icon">
								{/* Omitted SVG */}
							</div>
							<p>Click on the image to expand</p>
						</div>
						<p className="cta-header-text">{dataVisual.description}</p>
					</div>
				</div>
				<div className="map-statistics">
	<ul className="list-none grid gap-4 grid-cols-2 p-0 text-smallest">
		<li className="flex flex-col">
			<p className="my-0 text-altGreen font-semibold">Demographic Granularity</p>
			<p className="my-0">{dataVisual.details.demographicGranularities.join(', ')}</p>
		</li>
		<li className="flex flex-col">
			<p className="my-0 text-altGreen font-semibold">Geographic Levels</p>
			<p className="my-0">{dataVisual.details.geographicLevels.join(', ')}</p>
		</li>
		{dataVisual.details.alternateBreakdowns !== 'N/A' && (
			<li className="flex flex-col">
				<p className="my-0 text-altGreen font-semibold">Alternate Disparities Breakdowns</p>
				<p className="my-0">{dataVisual.details.alternateBreakdowns.join(', ')}</p>
			</li>
		)}
	</ul>
</div>
			</div>
			<p className="div__data-details">
			<h3 className='my-0 text-title font-medium text-altGreen'>How to Use</h3>
				<div>
					{dataVisual.details.howToUse.map((step, i) => (
						<p className='py-0 my-0' key={i}>
							<strong>{step.step}:</strong> {step.description}
						</p>
					))}
				</div>
			</p>
			<div className='border border-b-1 border-t-0 border-x-0 border-solid border-altBlack'></div>
		</div>
	))}
</section>
		</>
	);
}