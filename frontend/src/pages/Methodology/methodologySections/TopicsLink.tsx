import styles from '../methodologyComponents/MethodologyPage.module.scss'
import DataTable from '../methodologyComponents/DataTable'
import { methodologyTableDefinitions } from '../methodologyContent/MethodologyTopicDefinitions'

const TopicsLink: React.FC = () => {
  return (
    <section>
      <article>
        <DataTable
          headers={{
            topic: 'Topic',
            definition: 'Significance for Health Equity',
          }}
          methodologyTableDefinitions={methodologyTableDefinitions}
        />
      </article>
    </section>
  )
}

export default TopicsLink
