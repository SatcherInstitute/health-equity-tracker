import { metricDefinitionsArray } from '../methodologyContent/MetricsDefinitions'
import ConditionVariable from '../methodologyContent/ConditionVariable'
import { CodeBlock } from '../methodologyComponents/CodeBlock'
import DefinitionTooltip from '../methodologyComponents/DefinitionTooltip'
import { definitionsGlossary } from '../methodologyContent/DefinitionGlossary'
import { Helmet } from 'react-helmet-async'
import HetNotice from '../../../styles/HetComponents/HetNotice'
import HetTerm from '../../../styles/HetComponents/HetTerm'

const MetricsLink = () => {
  return (
    <section id='#metrics'>
      <article>
        <Helmet>
          <title>Metrics - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Metrics</h2>
        <ConditionVariable definitionsArray={metricDefinitionsArray} />

        <h3
          className='mt-12 text-title font-medium'
          id='#percent-share-example'
        >
          Percent Share Example: COVID-19 Cases
        </h3>
        <HetNotice>
          In the example below, we use <strong>COVID-19 cases</strong> as the
          variable, and <strong>race and ethnicity</strong> as the demographic
          breakdown for simplicity; the definitions apply to all variables and
          demographic breakdowns.
        </HetNotice>
        <div className='pl-10'>
          <p>
            As an example, if in a certain month,{' '}
            <strong>White (Non-Hispanic) people</strong> in Georgia had 65.7%
            <DefinitionTooltip
              topic='share'
              definitionItem={definitionsGlossary[41]}
            />{' '}
            of <strong>COVID-19 deaths</strong> but only 52.7%
            <DefinitionTooltip
              topic='share of the
    population'
              definitionItem={definitionsGlossary[29]}
            />
            , their disproportionate percent share would be{' '}
            <strong>+13%</strong>:
            <CodeBlock
              rowData={[
                {
                  content: '65.7%',
                },
                {
                  content: '-',
                },
                {
                  content: '52.7%',
                },
                {
                  content: '=',
                },
                {
                  content: (
                    <>
                      <b>+13.0%</b>
                    </>
                  ),
                },
              ]}
            />
            This value is then divided by the population percent share to give a
            <HetTerm>percent relative inequity</HetTerm> of
            <strong>+24.7%</strong>:
            <CodeBlock
              rowData={[
                {
                  content: '+13%',
                },
                {
                  content: '/',
                },
                {
                  content: '52.7%',
                },
                {
                  content: '=',
                },
                {
                  content: (
                    <>
                      <b>+24.7%</b>
                    </>
                  ),
                },
              ]}
            />
            In plain language, this would be interpreted as,{' '}
            <div className='bg-standardInfo px-8 py-4 shadow-raised-tighter'>
              <em>
                “<strong>Deaths</strong> of individuals identifying as White
                (Non Hispanic) in Georgia{' '}
                <strong>
                  from COVID-19 were almost 25% higher than expected
                </strong>
                , based on their share of Georgia’s overall population.”
              </em>
            </div>
          </p>
        </div>
      </article>
    </section>
  )
}

export default MetricsLink
