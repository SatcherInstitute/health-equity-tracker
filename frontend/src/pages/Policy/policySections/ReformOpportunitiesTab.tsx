import { Helmet } from 'react-helmet-async'
import ResourceItem from '../policyComponents/ResourceItem'
import {
  effortsAndInsights,
  legislativeActions,
} from '../policyContent/ReformOpportunitiesContent'
import HetTextArrowLink from '../../../styles/HetComponents/HetTextArrowLink'
import { HetOverline } from '../../../styles/HetComponents/HetOverline'

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

        <ul className='list-none my-4'>
          {effortsAndInsights.map((effortsAndInsight) => (
            <ResourceItem
              key={effortsAndInsight.title}
              title={effortsAndInsight.title}
              description={effortsAndInsight.description}
            />
          ))}
        </ul>
      </section>

      <section id='#legislative-items'>
        <HetOverline text='Call to Action' />
        <h3 className='my-0 text-title font-medium text-altGreen'>
          Call to Action for Policy Changes
        </h3>

        <ul className='list-none my-4'>
          {legislativeActions.map((legislativeAction) => (
            <ResourceItem
              key={legislativeAction.question}
              title={legislativeAction.question}
              description={legislativeAction.answer}
            />
          ))}
        </ul>

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
