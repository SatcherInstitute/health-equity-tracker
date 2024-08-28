import { Helmet } from 'react-helmet-async'
import ResourceItem from '../policyComponents/ResourceItem'
import { effortsAndInitiatives, legislativeActions } from '../policyContent/ReformOpportunitiesContent'
import HetTextArrowLink from '../../../styles/HetComponents/HetTextArrowLink'
import ResourceItemCard from '../policyComponents/ResourceItemCard'

export default function ReformOpportunitiesTab() {
	return (
  <>
    <Helmet>
      <title>Reform Opportunities - Health Equity Tracker</title>
    </Helmet>
    <h2 className='sr-only'>Reform Opportunities</h2>
    <p>
      Our data points to several reform opportunities, particularly in enhancing
      community-based interventions, improving data collection on race and
      ethnicity for non-fatal injuries, and addressing the root causes of
      violence through equity-focused policies.
    </p>
    <section id='#city-and-county-level-reform-opportunities'>
      <h3 className='my-0 text-title font-medium text-altGreen'>
        Reform Opportunities at the County and City Levels
      </h3>
      <ul className='grid grid-cols-3 list-none pl-0 py-4 gap-8'>
        {effortsAndInitiatives.map((effortsAndInitiative, index) => (
          <li
            key={index}
            className={`fade-in-up-blur`}
            style={{ animationDelay: `${index * 0.3}s` }}
          >
            <ResourceItemCard
              key={index}
              icon={effortsAndInitiative.icon}
              title={effortsAndInitiative.title}
              description={effortsAndInitiative.description}
            />
          </li>
        ))}
      </ul>
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

      <HetTextArrowLink
        link={'https://www.usa.gov/elected-officials'}
        linkText='Find and contact your elected officials'
        containerClassName='flex items-center justify-center mt-16 mx-auto '
        linkClassName='font-sansTitle text-smallestHeader'
      />
    </section>
  </>
)
}