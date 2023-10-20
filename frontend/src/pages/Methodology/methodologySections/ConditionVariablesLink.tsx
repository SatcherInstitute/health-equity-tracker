import { Link } from 'react-router-dom'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import DefinitionsList from '../../../reports/ui/DefinitionsList'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import DataTable from '../methodologyComponents/DataTable'
import { conditionVariableDefinitions } from '../methodologyContent/ConditionVariableDefinitions'

const ConditionVariablesLink = () => {
  return (
    <section>
      <article>
        <p>
          Links to the original sources of data and their definitions can be
          found on our <Link to={'DATA_CATALOG_PAGE_LINK'}>Data Downloads</Link>{' '}
          page.
        </p>
        <DataTable
          headers={{
            topic: '',
            definition: 'Variables that Affect Health Conditions',
          }}
          methodologyTableDefinitions={conditionVariableDefinitions}
        />
      </article>
    </section>
  )
}

export default ConditionVariablesLink
