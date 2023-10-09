import { Link } from 'react-router-dom'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import DefinitionsList from '../../../reports/ui/DefinitionsList'
import styles from '../MethodologyPage.module.scss'

const ConditionVariablesLink = () => {
  return (
    <section>
      <article>
        <h1 className={styles.MethodologySubsubheaderText}>
          Condition Variables
        </h1>
        <h2 className={styles.MethodologyQuestion}>
          What do the condition variables on the tracker mean?
        </h2>
        <div className={styles.MethodologyAnswer}>
          <DefinitionsList dataTypesToDefine={Object.entries(METRIC_CONFIG)} />
          <p>
            Links to the original sources of data and their definitions can be
            found on our <Link to={'DATA_TAB_LINK'}>Data Downloads</Link> page.
          </p>
        </div>
      </article>
    </section>
  )
}

export default ConditionVariablesLink
