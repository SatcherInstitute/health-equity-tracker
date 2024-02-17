import { Helmet } from 'react-helmet-async'

const DataMethodDefinitionsLink = () => {
  return (
    <section id='#data-methods'>
      <article>
        <Helmet>
          <title>Data Methods - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Data Methods</h2>

        <h3 className='mt-12 text-title font-medium'>Population</h3>
        <p>
          Unless otherwise noted throughout this methodology, population counts
          and rates are obtained from the American Community Survey (ACS) 5-year
          estimates. Wherever possible, we utilize source data population
          counts, and when those are unavilable we match historical condition
          numerators with population denominators from the same years. For
          current, single-year reports, we utilize the 2019 ACS 5-year
          estimates.
        </p>

        <h3 className='mt-12 text-title font-medium'>
          Social Vulnerability Index (SVI)
        </h3>
        <p>
          To provide context when viewing county-level reports, SVI rankings are
          obtained from the CDC and incorporated into our alerting system where
          available.
        </p>
        <p>
          The Social Vulnerability Index uses percentile ranking values ranging
          from 0 to 1 to assess the resilience of communities when confronted by
          external stresses. Scores between 0-0.33 indicate a low level of
          vulnerability, 0.34-0.66 signify a medium level, and 0.67-1 designate
          a high level of vulnerability. Specifically, areas that fall in the
          top 10%, or at the 90th percentile of values, are marked as highly
          vulnerable, while those below this threshold have comparatively lower
          vulnerability. From a health equity perspective, understanding these
          vulnerability scores is crucial. It enables policymakers and health
          officials to allocate resources effectively, ensuring that the most
          vulnerable communities receive the necessary support during crises,
          thus promoting equitable health outcomes.Identifies long-term trends
          and fluctuations in health disparities or access to healthcare
          services.
        </p>

        <h3 className='mt-12 text-title font-medium'>Visualizations</h3>
        <p>
          Please consider the impact of under-reporting and data gaps when
          exploring the visualizations. These issues may lead to incorrect
          conclusions, e.g. low rates in a given location may be due to
          under-reporting rather than absence of impact.
        </p>
      </article>
    </section>
  )
}

export default DataMethodDefinitionsLink
