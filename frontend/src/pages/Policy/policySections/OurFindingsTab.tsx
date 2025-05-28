import HetLazyLoader from '../../../styles/HetComponents/HetLazyLoader'
import { HetOverline } from '../../../styles/HetComponents/HetOverline'
import HetTextArrowLink from '../../../styles/HetComponents/HetTextArrowLink'
import {
  homicideFacts,
  suicideFacts,
  urbanicityFacts,
  youthFatalitiesFacts,
} from '../policyContent/OurFindingsContent'

export default function OurFindingsTab() {
  return (
    <>
      <title>Addressing Inequities - Health Equity Tracker</title>
      <section id='ga-youth-fatalities'>
        <div className='mb-0'>
          <h1 className='sr-only'>Our Findings</h1>
          <HetOverline text='Our Findings' />
          <h2 className='my-0 font-medium text-alt-green text-title'>
            Georgia's Youth Fatality Rates
          </h2>

          {youthFatalitiesFacts.map((youthFatalitiesFact) => (
            <div
              key={youthFatalitiesFact.report}
              className='my-8 list-none rounded-md bg-explore-bg-color pb-8 shadow-raised'
            >
              <p className='px-8 pt-8 pb-0 text-center text-alt-dark text-text smMd:text-smallest-header'>
                {youthFatalitiesFact.content}
              </p>
              {youthFatalitiesFact.customCard}
              <HetTextArrowLink
                containerClassName='mx-8 mt-8 flex justify-end'
                link={youthFatalitiesFact.report}
                linkText={'Learn more'}
              ></HetTextArrowLink>
            </div>
          ))}
        </div>
      </section>
      <section id='ga-homicides'>
        <div className='mb-0'>
          <HetOverline text='Our Findings' />
          <h2 className='my-0 font-medium text-alt-green text-title'>
            Georgia's Homicide Rates
          </h2>
          {homicideFacts.map((homicideFact) => (
            <div
              key={homicideFact.report}
              className='my-8 list-none rounded-md bg-explore-bg-color pb-8 shadow-raised'
            >
              <p className='px-8 pt-8 pb-0 text-center text-alt-dark text-text smMd:text-smallest-header'>
                {homicideFact.content}
              </p>
              <HetLazyLoader>{homicideFact.customCard}</HetLazyLoader>
              <HetTextArrowLink
                containerClassName='mx-8 mt-8 flex justify-end'
                link={homicideFact.report}
                linkText={'Learn more'}
              ></HetTextArrowLink>
            </div>
          ))}
        </div>
      </section>

      <section id='ga-suicides'>
        <div className='mb-0'>
          <HetOverline text='Our Findings' />
          <h2 className='my-0 font-medium text-alt-green text-title'>
            Georgia's Suicide Rates
          </h2>

          {suicideFacts.map((suicideFact) => (
            <div
              key={suicideFact.report}
              className='my-8 list-none rounded-md bg-explore-bg-color pb-8 shadow-raised'
            >
              <p className='px-8 pt-8 pb-0 text-center text-alt-dark text-text smMd:text-smallest-header'>
                {suicideFact.content}
              </p>
              <HetLazyLoader> {suicideFact.customCard}</HetLazyLoader>
              <HetTextArrowLink
                containerClassName='mx-8 mt-8 flex justify-end'
                link={suicideFact.report}
                linkText={'Learn more'}
              ></HetTextArrowLink>
            </div>
          ))}
        </div>
      </section>
      <section id='ga-homicides-city-size'>
        <div className='mb-0'>
          <HetOverline text='Our Findings' />
          <h2 className='my-0 font-medium text-alt-green text-title'>
            Georgia's Homicide Rates Among Black Men
          </h2>

          {urbanicityFacts.map((urbanicityFact) => (
            <div
              key={urbanicityFact.report}
              className='my-8 list-none rounded-md bg-explore-bg-color pb-8 shadow-raised'
            >
              <p className='px-8 pt-8 pb-0 text-center text-alt-dark text-text smMd:text-smallest-header'>
                {urbanicityFact.content}
              </p>
              <HetLazyLoader>{urbanicityFact.customCard}</HetLazyLoader>
              <HetTextArrowLink
                containerClassName='mx-8 mt-8 flex justify-end'
                link={urbanicityFact.report}
                linkText={'Learn more'}
              ></HetTextArrowLink>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
