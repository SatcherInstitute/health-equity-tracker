import { Helmet } from 'react-helmet-async'
import { youthFatalitiesFacts, homicideFacts, suicideFacts, urbanicityFacts,  } from '../policyContent/OurFindingsContent'

export default function OurFindingsTab() {
  return (
    <>
      <Helmet>
        <title>Addressing Inequities - Health Equity Tracker</title>
      </Helmet>
      <h2 className='sr-only'>Addressing Inequities</h2>
      <section id='#ga-youth-fatalities'>
        <div className='mb-0'>
          <p className='mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
            OUR FINDINGS
          </p>
          <h3 className='my-0 text-title font-medium text-altGreen'>
            Georgia's Youth Fatality Rates
          </h3>
            {youthFatalitiesFacts.map((youthFatalitiesFact, index) => (
          <div key={index} className='list-none rounded-md shadow-raised my-8 pb-8 bg-exploreBgColor'>
              <p className='text-text smMd:text-smallestHeader px-8 pt-8 pb-0 text-center text-altDark'>
              {youthFatalitiesFact.content} 
              </p>
            {youthFatalitiesFact.customCard}
          </div>
            ))}
        </div>
      </section>
      <section id='#ga-homicides'>
        <div className='mb-0'>
          <p className='mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
            OUR FINDINGS
          </p>
          <h3 className='my-0 text-title font-medium text-altGreen'>
            Georgia's Homicide Rates
          </h3>
          {homicideFacts.map((homicideFact, index) => (
          <div key={index} className='list-none rounded-md shadow-raised my-8 pb-8 bg-exploreBgColor'>
              <p className='text-text smMd:text-smallestHeader px-8 pt-8 pb-0 text-center text-altDark'>
              {homicideFact.content} 
              </p>
            {homicideFact.customCard}
          </div>
            ))}
         
        </div>
      </section>
          
      <section id='#ga-suicides'>
        <div className='mb-0'>
          <p className='mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
            OUR FINDINGS
          </p>
          <h3 className='my-0 text-title font-medium text-altGreen'>
            Georgia's Suicide Rates
          </h3>
          {suicideFacts.map((suicideFact, index) => (
          <div key={index} className='list-none rounded-md shadow-raised my-8 pb-8 bg-exploreBgColor'>
              <p className='text-text smMd:text-smallestHeader px-8 pt-8 pb-0 text-center text-altDark'>
              {suicideFact.content} 
              </p>
            {suicideFact.customCard}
          </div>
            ))}
          
        </div>
      </section>
      <section id='#ga-homicides-urbanicity'>
        <div className='mb-0'>
          <p className='mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
            OUR FINDINGS
          </p>
          <h3 className='my-0 text-title font-medium text-altGreen'>
          Georgia's Homicide Rates Among Black Men
          </h3>
          {urbanicityFacts.map((urbanicityFact, index) => (
          <div key={index} className='list-none rounded-md shadow-raised my-8 pb-8 bg-exploreBgColor'>
              <p className='text-text smMd:text-smallestHeader px-8 pt-8 pb-0 text-center text-altDark'>
              {urbanicityFact.content} 
              </p>
            {urbanicityFact.customCard}
          </div>
            ))}
          
        </div>
      </section>
    </>
  )
}
