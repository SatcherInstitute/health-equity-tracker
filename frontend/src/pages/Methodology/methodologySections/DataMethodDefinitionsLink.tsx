import DataTable from '../methodologyComponents/DataTable'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { dataCatalog } from '../methodologyContent/DatasetTable'

const DataMethodDefinitionsLink = () => {
  return (
    <section>
      <article>
        <DataTable
          headers={{
            topic: 'Source of Data',
            definition: 'Definition',
          }}
          methodologyTableDefinitions={dataCatalog}
        />
      </article>
    </section>
  )
}

export default DataMethodDefinitionsLink
