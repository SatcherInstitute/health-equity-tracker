import { Helmet } from 'react-helmet-async'
import {
  youthFatalitiesFacts,
  homicideFacts,
  suicideFacts,
  urbanicityFacts,
} from '../policyContent/OurFindingsContent'
import HetTextArrowLink from '../../../styles/HetComponents/HetTextArrowLink'
import { HetOverline } from '../../../styles/HetComponents/HetOverline'

export default function OurFindingsTab() {
  return (
    <>
      <Helmet>
        <title>Addressing Inequities - Health Equity Tracker</title>
      </Helmet>
      <h2 className='sr-only'>Addressing Inequities</h2>
      <section id='#ga-youth-fatalities'>
        <div className='mb-0'>
          <HetOverline text='Our Findings' />
          <h3 className='my-0 text-title font-medium text-altGreen'>
            Georgia's Youth Fatality Rates
          </h3>

          {youthFatalitiesFacts.map((youthFatalitiesFact) => (
            <div
              key={youthFatalitiesFact.content?.toString()}
              className='list-none rounded-md shadow-raised my-8 pb-8 bg-exploreBgColor'
            >
              <p className='text-text smMd:text-smallestHeader px-8 pt-8 pb-0 text-center text-altDark'>
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
      <section id='#ga-homicides'>
        <div className='mb-0'>
          <HetOverline text='Our Findings' />
          <h3 className='my-0 text-title font-medium text-altGreen'>
            Georgia's Homicide Rates
          </h3>
          {homicideFacts.map((homicideFact) => (
            <div
              key={homicideFact.content?.toString()}
              className='list-none rounded-md shadow-raised my-8 pb-8 bg-exploreBgColor'
            >
              <p className='text-text smMd:text-smallestHeader px-8 pt-8 pb-0 text-center text-altDark'>
                {homicideFact.content}
              </p>
              {homicideFact.customCard}
              <HetTextArrowLink
                containerClassName='mx-8 mt-8 flex justify-end'
                link={homicideFact.report}
                linkText={'Learn more'}
              ></HetTextArrowLink>
            </div>
          ))}
        </div>
      </section>

      <section id='#ga-suicides'>
        <div className='mb-0'>
          <HetOverline text='Our Findings' />
          <h3 className='my-0 text-title font-medium text-altGreen'>
            Georgia's Suicide Rates
          </h3>

          {suicideFacts.map((suicideFact) => (
            <div
              key={suicideFact.content?.toString()}
              className='list-none rounded-md shadow-raised my-8 pb-8 bg-exploreBgColor'
            >
              <p className='text-text smMd:text-smallestHeader px-8 pt-8 pb-0 text-center text-altDark'>
                {suicideFact.content}
              </p>
              {suicideFact.customCard}
              <HetTextArrowLink
                containerClassName='mx-8 mt-8 flex justify-end'
                link={suicideFact.report}
                linkText={'Learn more'}
              ></HetTextArrowLink>
            </div>
          ))}
        </div>
      </section>
      <section id='#ga-homicides-urbanicity'>
        <div className='mb-0'>
          <HetOverline text='Our Findings' />
          <h3 className='my-0 text-title font-medium text-altGreen'>
            Georgia's Homicide Rates Among Black Men
          </h3>

          {urbanicityFacts.map((urbanicityFact) => (
            <div
              key={urbanicityFact.content?.toString()}
              className='list-none rounded-md shadow-raised my-8 pb-8 bg-exploreBgColor'
            >
              <p className='text-text smMd:text-smallestHeader px-8 pt-8 pb-0 text-center text-altDark'>
                {urbanicityFact.content}
              </p>
              {urbanicityFact.customCard}
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
