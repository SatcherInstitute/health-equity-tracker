import { Helmet } from 'react-helmet-async'
import {
  RESOURCES,
  PDOH_RESOURCES,
  EQUITY_INDEX_RESOURCES,
  AIAN_RESOURCES,
  API_RESOURCES,
  HISP_RESOURCES,
  MENTAL_HEALTH_RESOURCES,
  COVID_RESOURCES,
  COVID_VACCINATION_RESOURCES,
  ECONOMIC_EQUITY_RESOURCES,
  HIV_RESOURCES,
} from './ResourcesData'

export default function ResourcesTab() {
  return (
    <>
      <Helmet>
        <title>
          Health Equity Resources - What Is Health Equity? - Health Equity
          Tracker
        </title>
      </Helmet>
      <h2 className='sr-only'>Health Equity Resources</h2>
      <section className='flex flex-col px-5 py-12'>
        {[
          RESOURCES,
          PDOH_RESOURCES,
          ECONOMIC_EQUITY_RESOURCES,
          EQUITY_INDEX_RESOURCES,
          AIAN_RESOURCES,
          API_RESOURCES,
          HISP_RESOURCES,
          MENTAL_HEALTH_RESOURCES,
          COVID_RESOURCES,
          COVID_VACCINATION_RESOURCES,
          HIV_RESOURCES,
        ].map(({ heading, resources }) => {
          // first heading should get a "main" id for Playwright testing and our a11y setups
          const id = heading === 'Health Equity' ? 'main' : heading
          return (
            <article className='mt-12 flex' key={heading}>
              <h3
                id={id}
                className='w-full px-8 py-0 text-center font-serif text-smallestHeader font-light text-altBlack md:w-3/12 md:pb-5'
              >
                {heading}
              </h3>

              <ul className='w-full pt-0 text-left md:w-9/12 md:pt-10'>
                {resources.map((resource) => (
                  <li className='px-0 py-2' key={resource.name}>
                    <a className='no-underline' href={resource.url}>
                      {resource.name}
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          )
        })}
      </section>
    </>
  )
}
