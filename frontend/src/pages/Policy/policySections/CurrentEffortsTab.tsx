import { Helmet } from 'react-helmet-async'
import ResourceItem from '../policyComponents/ResourceItem'
import { cityEfforts, dekalbCountyEfforts, fultonCountyEfforts } from '../policyContent/CurrentEffortsContent'

export default function CurrentEffortsTab() {
	return (
		<>
			<Helmet>
				<title>Current Efforts - Health Equity Tracker</title>
			</Helmet>
			<h2 className='sr-only'>Current Efforts</h2>
			<p>
				We identify and analyze current intervention policies in Atlanta,
				examining their effectiveness and areas for improvement. This includes
				legislation, community programs, and law enforcement strategies aimed at
				reducing gun violence.
			</p>
			<section id='#city-level-interventions'>
				<p className='mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
					Intervention Efforts at the City Level
				</p>
				<h3 className='my-0 text-title font-medium text-altGreen'>
					City of Atlanta
				</h3>
				<p>
					<ul className='list-none'>
						{cityEfforts.map((cityEffort, index) => (
							<ResourceItem
								key={index}
								title={cityEffort.title}
								description={cityEffort.description}
								link={cityEffort.link}
							/>
						))}
					</ul>
				</p>
			</section>
			<section id='#county-level-interventions'>
				<p className='mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
					Intervention Efforts at the County Level
				</p>
				<h3 className='my-0 text-title font-medium text-altGreen'>
					Fulton County
				</h3>
				<p>
					<ul className='list-none'>
						{fultonCountyEfforts.map((fultonCountyEffort, index) => (
							<ResourceItem
								key={index}
								title={fultonCountyEffort.title}
								description={fultonCountyEffort.description}
								link={fultonCountyEffort.link}
							/>
						))}
					</ul>
				</p>
				<h3 className='my-0 text-title font-medium text-altGreen'>
					DeKalb County
				</h3>
<<<<<<< HEAD
				<p>
					<ul className='list-none'>
						{dekalbCountyEfforts.map((dekalbCountyEffort, index) => (
							<ResourceItem
								key={index}
								title={dekalbCountyEffort.title}
								description={dekalbCountyEffort.description}
								link={dekalbCountyEffort.link}
							/>
						))}
					</ul>
				</p>
=======

				<ul className='list-none'>
					{dekalbCountyEfforts.map((dekalbCountyEffort, index) => (
						<ResourceItem
							key={index}
							title={dekalbCountyEffort.title}
							description={dekalbCountyEffort.description}
							link={dekalbCountyEffort.link}
						/>
					))}
				</ul>
>>>>>>> 72d2bc72 (current efforts tab and reform opprotunities tab content)
			</section>
		</>
	)
}