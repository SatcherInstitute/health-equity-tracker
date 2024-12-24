import { Helmet } from 'react-helmet-async'
import HetNotice from '../../../styles/HetComponents/HetNotice'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import FormulaFormat from '../methodologyComponents/FormulaFormat'
import ConditionVariable from '../methodologyContent/ConditionVariable'
import { metricDefinitions } from '../methodologyContent/MetricsDefinitions'

export default function MetricsLink() {
  return (
    <section id='metrics'>
      <article>
        <Helmet>
          <title>Metrics - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Metrics</h2>
        <ConditionVariable definitions={metricDefinitions} />

        <h3 className='mt-12 font-medium text-title' id='percent-share-example'>
          Percent Share Example: COVID-19 Cases
        </h3>
        <HetNotice>
          In the example below, we use <HetTerm>COVID-19 cases</HetTerm> as the
          variable, and <HetTerm>race and ethnicity</HetTerm> as the demographic
          breakdown for simplicity; the definitions apply to all topics and
          demographic breakdowns.
        </HetNotice>
        <div className='pl-10'>
          <p>
            As an example, if in a certain month,{' '}
            <strong>White (Non-Hispanic) people</strong> in Georgia had 65.7%
            share of all <strong>COVID-19 deaths</strong>, but only 52.7% share
            of their population, their disproportionate percent share would be{' '}
            <strong>+13%</strong>:
          </p>
          <FormulaFormat leftSide='65.7% - 52.7%' rightSide={['+13.0%']} />
          This value is then divided by the population percent share to give a
          <HetTerm>percent relative inequity</HetTerm> of
          <strong>+24.7%</strong>:
          <FormulaFormat
            leftSide={{
              numerator: '+13%',
              denominator: '52.7%​',
            }}
            rightSide={['+24.7%']}
          />
          In plain language, this would be interpreted as,{' '}
          <div className='bg-standardInfo px-8 py-4'>
            <em>
              “<strong>Deaths</strong> of individuals identifying as White (Non
              Hispanic) in Georgia{' '}
              <strong>
                from COVID-19 were almost 25% higher than expected
              </strong>
              , based on their share of Georgia’s overall population.”
            </em>
          </div>
        </div>
      </article>
    </section>
  )
}
