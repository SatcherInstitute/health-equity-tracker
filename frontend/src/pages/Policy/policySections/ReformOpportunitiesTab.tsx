import { Helmet } from 'react-helmet-async'
import ResourceItem from '../policyComponents/ResourceItem'
import { effortsAndInitiatives, legislativeActions } from '../policyContent/ReformOpportunitiesContent'
import { OpenInNew } from '@mui/icons-material'
<<<<<<< HEAD
<<<<<<< HEAD
import HetTextArrowLink from '../../../styles/HetComponents/HetTextArrowLink'
=======
>>>>>>> 92902909 (current efforts tab and reform opprotunities tab content)
=======
import HetTextArrowLink from '../../../styles/HetComponents/HetTextArrowLink'
>>>>>>> 994de894 (faqs tab)

export default function ReformOpportunitiesTab() {
	return (
		<>
			<Helmet>
				<title>Reform Opportunities - Health Equity Tracker</title>
			</Helmet>
			<h2 className='sr-only'>Reform Opportunities</h2>
			<p>
				Our data points to several reform opportunities, particularly in
				enhancing community-based interventions, improving data collection on
				race and ethnicity for non-fatal injuries, and addressing the root
				causes of violence through equity-focused policies.
			</p>
			<section id='#city-and-county-level-reform-opportunities'>
				<h3 className='my-0 text-title font-medium text-altGreen'>
					Reform Opportunities at the County and City Levels
				</h3>
				<p>
					<ul className='list-none'>
						{effortsAndInitiatives.map((effortsAndInitiative, index) => (
							<ResourceItem
								key={index}
								title={effortsAndInitiative.title}
								description={effortsAndInitiative.description}
								link={effortsAndInitiative.link}
							/>
						))}
					</ul>
				</p>
			</section>
			<section id='#call-to-action-for-policy-changes'>
				<h3 className='my-0 text-title font-medium text-altGreen'>
					Call to Action for Policy Changes
				</h3>
				<p>
					<ul className='list-none'>
						{legislativeActions.map((legislativeAction, index) => (
							<ResourceItem
								key={index}
								title={legislativeAction.title}
								description={legislativeAction.description}
								link={legislativeAction.link}
							/>
						))}
					</ul>
				</p>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 994de894 (faqs tab)
				
				<HetTextArrowLink
                link={'https://www.usa.gov/elected-officials'}
                linkText='Find and contact your elected officials'
                containerClassName='flex items-center justify-center mt-16 mx-auto '
                linkClassName='font-sansTitle text-smallestHeader'
              />
<<<<<<< HEAD
=======
				<div className='rounded-md border border-solid border-methodologyGreen md:mx-2 m-2 duration-300 ease-in-out hover:shadow-raised shadow-raised-tighter group bg-hoverAltGreen hover:bg-whiteSmoke80 flex flex-col align-center text-exploreButton p-4 group no-underline hover:scale-105 hover:transition-transform hover:duration-30'>
					<p className='text-smallest font-semibold tracking-normal'>
						Find and contact your elected officials
						<OpenInNew className='text-text' />
					</p>
				</div>
>>>>>>> 92902909 (current efforts tab and reform opprotunities tab content)
=======
>>>>>>> 994de894 (faqs tab)
			</section>
		</>
	)
}