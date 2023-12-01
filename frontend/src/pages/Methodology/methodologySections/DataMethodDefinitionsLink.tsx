import { Helmet } from 'react-helmet-async'

const DataMethodDefinitionsLink = () => {
  return (
    <section id='#data-methods'>
      <article>
        <Helmet>
          <title>Data Methods - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Data Methods</h2>

        <h3 className='font-sansTitle text-title'>Visualizations</h3>
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
