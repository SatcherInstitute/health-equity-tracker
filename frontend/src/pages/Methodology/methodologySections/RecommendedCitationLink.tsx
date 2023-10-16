import Card from '@mui/material/Card'
import styles from '../MethodologyPage.module.scss'
import { CITATION_APA } from '../MethodologyPage'

const RecommendedCitationLink = () => {
  return (
    <section>
      <article id="main">
        <h1 className={styles.MethodologyQuestion} id={'recommended-citation'}>
          Recommended citation (APA) for the Health Equity Tracker:
        </h1>
        <div className={styles.MethodologyAnswer}>
          <Card elevation={3}>
            <p className={styles.CitationAPA}>{CITATION_APA}</p>
          </Card>
        </div>
      </article>
    </section>
  )
}

export default RecommendedCitationLink
