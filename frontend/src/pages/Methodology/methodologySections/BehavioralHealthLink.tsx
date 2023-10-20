import DataTable from '../methodologyComponents/DataTable'

import { behavioralHealthDefinitions } from '../methodologyContent/BehavioralHealthDefinitions'

const BehavioralHealthLink = () => {
  return (
    <section>
      <article>
        <DataTable
          headers={{
            topic: '',
            definition: '',
          }}
          methodologyTableDefinitions={behavioralHealthDefinitions}
        />
        \
      </article>
    </section>
  )
}

export default BehavioralHealthLink
