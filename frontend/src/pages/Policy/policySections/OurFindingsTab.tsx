import { Helmet } from 'react-helmet-async'
import {
  youthFatalitiesFacts,
  homicideFacts,
  suicideFacts,
  urbanicityFacts,
} from '../policyContent/OurFindingsContent'
import HetTextArrowLink from '../../../styles/HetComponents/HetTextArrowLink'
import { HetOverline } from '../../../styles/HetComponents/HetOverline'
import LazyLoad from 'react-lazyload'

export default function OurFindingsTab() {
  return (
    <>
      <Helmet>
        <title>Addressing Inequities - Health Equity Tracker</title>
      </Helmet>
      <h2 className='sr-only'>Addressing Inequities</h2>
      <section id='ga-youth-fatalities'>
        <div className='mb-0'>
          <HetOverline text='Our Findings' />
          <h3 className='my-0 font-medium text-altGreen text-title'>
            Georgia's Youth Fatality Rates
          </h3>

          {youthFatalitiesFacts.map((youthFatalitiesFact) => (
            <div
              key={youthFatalitiesFact.report}
              className='my-8 list-none rounded-md bg-exploreBgColor pb-8 shadow-raised'
            >
              <p className='px-8 pt-8 pb-0 text-center text-altDark text-text smMd:text-smallestHeader'>
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
          <h3 className='my-0 font-medium text-altGreen text-title'>
            Georgia's Homicide Rates
          </h3>
          {homicideFacts.map((homicideFact) => (
            <div
              key={homicideFact.report}
              className='my-8 list-none rounded-md bg-exploreBgColor pb-8 shadow-raised'
            >
              <p className='px-8 pt-8 pb-0 text-center text-altDark text-text smMd:text-smallestHeader'>
                {homicideFact.content}
              </p>
              <LazyLoad>{homicideFact.customCard}</LazyLoad>
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
          <h3 className='my-0 font-medium text-altGreen text-title'>
            Georgia's Suicide Rates
          </h3>

          {suicideFacts.map((suicideFact) => (
            <div
              key={suicideFact.report}
              className='my-8 list-none rounded-md bg-exploreBgColor pb-8 shadow-raised'
            >
              <p className='px-8 pt-8 pb-0 text-center text-altDark text-text smMd:text-smallestHeader'>
                {suicideFact.content}
              </p>
              <LazyLoad> {suicideFact.customCard}</LazyLoad>
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
          <h3 className='my-0 font-medium text-altGreen text-title'>
            Georgia's Homicide Rates Among Black Men
          </h3>

          {urbanicityFacts.map((urbanicityFact) => (
            <div
              key={urbanicityFact.report}
              className='my-8 list-none rounded-md bg-exploreBgColor pb-8 shadow-raised'
            >
              <p className='px-8 pt-8 pb-0 text-center text-altDark text-text smMd:text-smallestHeader'>
                {urbanicityFact.content}
              </p>
              <LazyLoad>{urbanicityFact.customCard}</LazyLoad>
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
