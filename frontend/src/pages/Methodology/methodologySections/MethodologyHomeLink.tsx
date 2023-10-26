import { Grid, Typography } from '@mui/material'
import styles from '../../AboutUs/AboutUsPage.module.scss'
import { Helmet } from 'react-helmet-async'

const MethodologyHomeLink = () => {
  return (
    <section>
      <article>
        <Helmet>
          <title>Methodology - Health Equity Tracker</title>
        </Helmet>
        <h2 className={styles.ScreenreaderTitleHeader}>Methodology</h2>
        <br />

        <br />
        <div>
          We are committed to principles of Transparency & Accountability,
          Community First, and Open Access, engaging closely with diverse
          communities to shape the overall health narrative and drive actionable
          policies. As we continue to expand our data sources and refine our
          analyses, our goal remains to inform and empower policymakers, while
          highlighting disparities and continually measuring progress towards
          health equity.
        </div>
      </article>
    </section>
  )
}

export default MethodologyHomeLink
