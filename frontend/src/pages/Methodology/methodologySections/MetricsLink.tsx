import { Alert, Card } from '@mui/material'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { metricDefinitionsArray } from '../methodologyContent/MetricsDefinitions'
import ConditionVariable from '../methodologyContent/ConditionVariable'
import { CodeBlock } from '../methodologyComponents/CodeBlock'
import { proportionalInequitableBurdenTooltip } from '../methodologyContent/TooltipLibrary'
import DefinitionTooltip from '../methodologyComponents/DefinitionTooltip'
import { definitionsGlossary } from '../methodologyContent/DefinitionGlossary'
import { Helmet } from 'react-helmet-async'

const MetricsLink = () => {
  return (
    <section id="#metrics">
      <article>
        <Helmet>
          <title>Metrics - Health Equity Tracker</title>
        </Helmet>
        <h2 className={styles.ScreenreaderTitleHeader}>Metrics</h2>
        <ConditionVariable definitionsArray={metricDefinitionsArray} />

        <h3 id="#percent-share-example">
          Percent Share Example: COVID-19 Cases
        </h3>
        <Alert severity="info" role="note">
          In the example below, we use <strong>COVID-19 cases</strong> as the
          variable, and <strong>race and ethnicity</strong> as the demographic
          breakdown for simplicity; the definitions apply to all variables and
          demographic breakdowns.
        </Alert>
        <div className={styles.ExampleDiv}>
          <p>
            As an example, if in a certain month,{' '}
            <strong>White (Non-Hispanic) people</strong> in Georgia had 65.7%
            <DefinitionTooltip
              topic="share"
              definitionItem={definitionsGlossary[41]}
            />{' '}
            of <strong>COVID-19 deaths</strong> but only 52.7%
            <DefinitionTooltip
              topic="share of the
    population"
              definitionItem={definitionsGlossary[29]}
            />
            , their disproportionate percent share would be{' '}
            <strong>+13%</strong>:
            <br />
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
            {proportionalInequitableBurdenTooltip} of
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
            <Card elevation={3} className={styles.WhyBox}>
              <em>
                “<strong>Deaths</strong> of individuals identifying as White
                (Non Hispanic) in Georgia{' '}
                <strong>
                  from COVID-19 were almost 25% higher than expected
                </strong>
                , based on their share of Georgia’s overall population.”
              </em>
            </Card>
          </p>
        </div>
      </article>
    </section>
  )
}

export default MetricsLink
