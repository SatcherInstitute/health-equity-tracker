import Card from '@mui/material/Card'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { CITATION_APA } from '../methodologyComponents/MethodologyPage'

const RecommendedCitationLink = () => {
  return (
    <section>
      <article>
        <h1 className={styles.MethodologyQuestion}>
          Recommended citation (APA) for the Health Equity Tracker:
        </h1>
        <div className={styles.MethodologyAnswer}>
          <Card elevation={3}>
            <p className={styles.CitationAPA}>{CITATION_APA}</p>
          </Card>
        </div>
        <h1>RecommendedCitationLink</h1>
      </article>
    </section>
  )
}

export default RecommendedCitationLink
