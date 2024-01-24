import {
  COPD_US_SETTING,
  COVID_HOSP_NY_COUNTY_SETTING,
  COVID_VAX_US_SETTING,
  DATA_CATALOG_PAGE_LINK,
  DIABETES_US_SETTING,
  EXPLORE_DATA_PAGE_LINK,
  OPIOID_US_SETTING,
  POVERTY_US_SETTING,
  UNINSURANCE_US_SETTING,
} from '../../utils/internalRoutes'
import { usePrefersReducedMotion } from '../../utils/hooks/usePrefersReducedMotion'
import { Helmet } from 'react-helmet-async'
import { dataSourceMetadataMap } from '../../data/config/MetadataMap'
import { METRIC_CONFIG } from '../../data/config/MetricConfig'
import { DEMOGRAPHIC_TYPES } from '../../data/query/Breakdowns'
import { LinkWithStickyParams } from '../../utils/urlutils'
import GoalListItem from './GoalListItem'
import HetBigCTA from '../../styles/HetComponents/HetBigCTA'

function TheProjectTab() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const numDataSources = Object.keys(dataSourceMetadataMap).length
  // tally number of conditions (including sub-conditions like COVID) x # demographic options
  const numVariables =
    Object.keys(METRIC_CONFIG).reduce(
      (tally, conditionKey) => (tally += METRIC_CONFIG[conditionKey].length),
      0
    ) * DEMOGRAPHIC_TYPES.length

  return (
    <>
      <Helmet>
        <title>The Project - About Us - Health Equity Tracker</title>
      </Helmet>
      <h2 className='sr-only'>The Project</h2>
      <header className='flex border-0 border-b border-solid border-borderColor'>
        <div className='grid w-full place-content-center p-6 md:w-5/12'>
          <h3
            id='main'
            className='text-left font-serif text-biggerHeader  font-light leading-lhSomeSpace text-altGreen'
          >
            We're focused on equitable data.
          </h3>
          <p className='text-left font-sansText text-title font-light'>
            Health equity can't exist without equitable data. That's why we're
            aiming to collect health equity data from across the United States
            and centralize it all in one place.
          </p>
        </div>
        <div className='hidden w-full border-0 border-solid border-borderColor p-2 md:block md:w-7/12 md:border-l'>
          <img
            width='754'
            height='644'
            src='/img/stock/woman-kids.png'
            className='m-3 h-auto max-h-sm w-full max-w-sm rounded-md'
            alt=''
          />
        </div>
      </header>

      <section className='grid place-content-center gap-24 p-24'>
        <div className='flex w-full flex-col justify-around  md:flex-row'>
          <div className='flex w-full flex-col flex-wrap justify-center md:w-5/12'>
            <h3 className='my-0 w-full p-0 font-serif text-header font-extralight'>
              Where we started
            </h3>
            <p className='text-left text-text '>
              Prompted by the COVID-19 pandemic, the Health Equity Tracker was
              created in 2020 to aggregate up-to-date demographic data from the
              hardest-hit communities.
            </p>
            <p className='text-left text-text '>
              The Health Equity Tracker aims to give a detailed view of health
              outcomes by race, ethnicity, sex, and other critical factors. Our
              hope is that it will help policymakers understand what resources
              and support affected communities need to be able to improve their
              outcomes.
            </p>
          </div>

          <div className='w-full md:w-6/12'>
            <div className='flex flex-col justify-around gap-3 md:flex-row'>
              <div className='w-full md:w-5/12'>
                <h4 className='border-0 border-b border-solid border-altGreen text-left font-serif text-smallHeader font-light leading-lhSomeSpace'>
                  {`${numDataSources} data sources`}
                </h4>
                <p className='text-left font-sansText text-small'>
                  HET currently aggregates data from{' '}
                  <LinkWithStickyParams to={DATA_CATALOG_PAGE_LINK}>
                    {`${numDataSources}`} key data sources
                  </LinkWithStickyParams>
                  , including the CDC and the U.S. Census Bureau. We’ll continue
                  adding to these initial sources as data access and quality
                  improves.
                </p>
              </div>
              <div className='w-full md:w-5/12'>
                <h4 className=' border-0 border-b border-solid border-altGreen text-left font-serif text-smallHeader font-light leading-lhSomeSpace'>
                  {numVariables} variables
                </h4>
                <p className='text-left font-sansText text-small'>
                  In addition to COVID-19{' '}
                  <LinkWithStickyParams
                    to={EXPLORE_DATA_PAGE_LINK + COVID_VAX_US_SETTING}
                  >
                    vaccinations,
                  </LinkWithStickyParams>{' '}
                  cases, deaths, and{' '}
                  <LinkWithStickyParams
                    to={EXPLORE_DATA_PAGE_LINK + COVID_HOSP_NY_COUNTY_SETTING}
                  >
                    hospitalizations by race to the county level
                  </LinkWithStickyParams>
                  , the tracker also covers chronic disease conditions like{' '}
                  <LinkWithStickyParams
                    to={EXPLORE_DATA_PAGE_LINK + COPD_US_SETTING}
                  >
                    COPD
                  </LinkWithStickyParams>{' '}
                  and{' '}
                  <LinkWithStickyParams
                    to={EXPLORE_DATA_PAGE_LINK + DIABETES_US_SETTING}
                  >
                    diabetes
                  </LinkWithStickyParams>
                  , behavioral health indicators such as{' '}
                  <LinkWithStickyParams
                    to={EXPLORE_DATA_PAGE_LINK + OPIOID_US_SETTING}
                  >
                    opioid and other substance misuse
                  </LinkWithStickyParams>
                  , and social and political determinants of health including{' '}
                  <LinkWithStickyParams
                    to={EXPLORE_DATA_PAGE_LINK + UNINSURANCE_US_SETTING}
                  >
                    uninsurance
                  </LinkWithStickyParams>{' '}
                  and{' '}
                  <LinkWithStickyParams
                    to={EXPLORE_DATA_PAGE_LINK + POVERTY_US_SETTING}
                  >
                    poverty
                  </LinkWithStickyParams>
                  <span aria-hidden={true}>.</span>
                </p>
              </div>
            </div>

            <HetBigCTA href={EXPLORE_DATA_PAGE_LINK}>
              Explore the data
            </HetBigCTA>
          </div>
        </div>

        <div>
          <h3 className='my-0 p-0  font-serif text-header font-extralight'>
            Where we aim to go
          </h3>
          <ul className='m-0 flex flex-wrap pl-0'>
            <GoalListItem
              src={
                prefersReducedMotion
                  ? '/img/animations/HET-lines-no-motion.gif'
                  : '/img/animations/HET-lines.gif'
              }
              alt=''
              title='Expand data'
              text='As we continue to expand our data sources and analyze the
            data, we will have more information to share on
            disparities and the equity impact of COVID-19.'
            />
            <GoalListItem
              src={
                prefersReducedMotion
                  ? '/img/animations/HET-fields-no-motion.gif'
                  : '/img/animations/HET-fields.gif'
              }
              alt=''
              title='Empower policy makers'
              text='We plan to develop policy templates for local, state, and
            federal policy makers, and help create actionable policies
            with diverse communities.'
            />
            <GoalListItem
              src={
                prefersReducedMotion
                  ? '/img/animations/HET-dots-no-motion.gif'
                  : '/img/animations/HET-dots.gif'
              }
              alt=''
              title='Measure progress'
              text='It’s important to track progress, so we plan to develop
            and publish more health equity reports and analyses.'
            />
          </ul>
        </div>
      </section>

      <section className='border-0 border-t border-solid border-borderColor p-24'>
        <h3 className='text-center font-serif text-biggerHeader font-light italic leading-lhSomeSpace text-altGreen'>
          We are committed to the following ethics
        </h3>
        <ul className='flex list-none flex-wrap'>
          <GoalListItem
            title='Transparency & Accountability'
            text='We partner closely with diverse communities and are clear
                about who interprets the data and how that shapes the overall
                health narrative.'
          />
          <GoalListItem
            title='Community First'
            text='People and communities drive our work. By making sure we
                collect data from underserved populations, we can help
                highlight what policy changes are needed to boost these
                communities.'
          />
          <GoalListItem
            title='Open Access'
            text='We ensure community leaders partner with us and play an active
                role in determining what data to use in making policy
                recommendations.'
          />
        </ul>
      </section>
    </>
  )
}

export default TheProjectTab
