import { conditionVariableDefinitions } from '../methodologyContent/ConditionVariableDefinitions'
import { Helmet } from 'react-helmet-async'
import ConditionVariable from '../methodologyContent/ConditionVariable'

const ConditionVariablesLink = () => {
  return (
    <section id='condition-variables'>
      <article>
        <Helmet>
          <title>Condition Variables - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Condition Variables</h2>
        <ConditionVariable definitionsArray={conditionVariableDefinitions} />
      </article>
    </section>
  )
}

export default ConditionVariablesLink
