import { Helmet } from 'react-helmet-async'
import {
  legislativeActions,
  effortsAndInsights,
} from '../policyContent/ReformOpportunitiesContent'
import HetTextArrowLink from '../../../styles/HetComponents/HetTextArrowLink'
import CardLeftIcon from '../policyComponents/CardLeftIcon'
import HetAccordion from '../../../styles/HetComponents/HetAccordion'
import { useIsBreakpointAndUp } from '../../../utils/hooks/useIsBreakpointAndUp'
import { HetOverline } from '../../../styles/HetComponents/HetOverline'
import HetQuoteLink from '../../../styles/HetComponents/HetQuoteLink'
import { urlMap } from '../../../utils/externalUrls'

export default function ReformOpportunitiesTab() {
  const isMdAndUp = useIsBreakpointAndUp('md')
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

      <section id='#where-to-start'>
        <HetOverline text='Where to Start' />
        <h3 className='my-0 text-title font-medium text-altGreen'>
          Insights from the Advocacy Community
        </h3>
        <ul className='mt-4 mb-8 grid grid-cols-1 md:grid-cols-2 list-none ml-0 pl-0 gap-2'>
          {effortsAndInsights.map((effortsAndInsight, index) => {
            const isMobileShadow = !isMdAndUp && index % 2 === 0
            const isDesktopShadow =
              isMdAndUp &&
              ((Math.floor(index / 2) % 2 === 0 && index % 2 === 0) ||
                (Math.floor(index / 2) % 2 !== 0 && index % 2 !== 0))

            return (
              <div
                key={index}
                className={`fade-in-up-blur rounded-md p-8 ${
                  isMobileShadow || isDesktopShadow ? 'shadow-raised' : ''
                }`}
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <CardLeftIcon
                  key={index}
                  icon={effortsAndInsight.icon}
                  title={effortsAndInsight.title}
                  description={effortsAndInsight.description}
                  advice={effortsAndInsight.advice}
                />
              </div>
            )
          })}
        </ul>
      </section>

      <section id='#legislative-items'>
        <HetOverline
          text='

          Call to Action
'
        />

        <h3 className='my-0 text-title font-medium text-altGreen'>
          Legislative Items to Consider for Policy Changes
        </h3>
        <HetOverline text={`SOURCE: RAND Foundation`} className='inline' />
        <HetQuoteLink href={urlMap.randGunPolicy} label='RAND Foundation'/>

        <HetAccordion
          accordionData={legislativeActions}
          divClassName='py-0 my-0'
          accordionClassName='my-4'
          summaryClassName='text-text leading-lhsomeSpace font-medium'
          detailsClassName='py-0 my-0'
        />
        <HetTextArrowLink
          link={urlMap.findElectedOfficials}
          linkText='Find and contact your elected officials'
          containerClassName='flex items-center justify-center mt-8 mx-auto'
          linkClassName='font-sansTitle text-smallestHeader'
        />
      </section>
    </>
  )
}
