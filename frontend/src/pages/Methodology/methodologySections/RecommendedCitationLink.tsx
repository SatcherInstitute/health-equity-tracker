import Card from '@mui/material/Card'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { CITATION_APA } from '../methodologyComponents/MethodologyPage'

const RecommendedCitationLink = () => {
  return (
    <section>
      <article>
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
