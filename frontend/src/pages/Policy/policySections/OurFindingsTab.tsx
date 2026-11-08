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
          <h2 className='text-alt-green text-title my-0 font-medium'>
            Georgia's Youth Fatality Rates
          </h2>

          {youthFatalitiesFacts.map((youthFatalitiesFact) => (
            <div
              key={youthFatalitiesFact.report}
              className='bg-standard-info shadow-raised my-8 list-none rounded-md pb-8'
            >
              <p className='text-alt-dark text-text smplus:text-smallest-header px-8 pt-8 pb-0 text-center'>
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
          <h2 className='text-alt-green text-title my-0 font-medium'>
            Georgia's Homicide Rates
          </h2>
          {homicideFacts.map((homicideFact) => (
            <div
              key={homicideFact.report}
              className='bg-standard-info shadow-raised my-8 list-none rounded-md pb-8'
            >
              <p className='text-alt-dark text-text smplus:text-smallest-header px-8 pt-8 pb-0 text-center'>
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
          <h2 className='text-alt-green text-title my-0 font-medium'>
            Georgia's Suicide Rates
          </h2>

          {suicideFacts.map((suicideFact) => (
            <div
              key={suicideFact.report}
              className='bg-standard-info shadow-raised my-8 list-none rounded-md pb-8'
            >
              <p className='text-alt-dark text-text smplus:text-smallest-header px-8 pt-8 pb-0 text-center'>
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
          <h2 className='text-alt-green text-title my-0 font-medium'>
            Georgia's Homicide Rates Among Black Men
          </h2>

          {urbanicityFacts.map((urbanicityFact) => (
            <div
              key={urbanicityFact.report}
              className='bg-standard-info shadow-raised my-8 list-none rounded-md pb-8'
            >
              <p className='text-alt-dark text-text smplus:text-smallest-header px-8 pt-8 pb-0 text-center'>
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
