import { Helmet } from 'react-helmet-async'

const MethodologyHomeLink = () => {
  return (
    <section>
      <article>
        <Helmet>
          <title>Methodology - Health Equity Tracker</title>
        </Helmet>
        {/* <h1 className='sr-only'>Methodology</h2> */}

        <div>
          <p>
            We are committed to principles of{' '}
            <em>Transparency & Accountability,</em> <em>Community First</em>,
            and <em>Open Access</em>, engaging closely with diverse, medically
            underserved communities to shape the overall health narrative and
            drive actionable policies. As we continue to expand our data sources
            and refine our analyses, our goal remains to inform and empower
            policymakers, while highlighting disparities and continually
            measuring progress towards health equity.
          </p>
        </div>
      </article>
    </section>
  )
}

export default MethodologyHomeLink
