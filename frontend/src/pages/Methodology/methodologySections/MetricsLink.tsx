import { Alert, CardContent } from '@mui/material'
import DataTable from '../methodologyComponents/DataTable'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { covidDefinitions } from '../methodologyContent/CovidDefinitions'

const MetricsLink = () => {
  return (
    <section>
      <article>
        <Alert severity="info" role="note">
          In the definitions below, we use <strong>COVID-19 cases</strong> as
          the variable, and <strong>race and ethnicity</strong> as the
          demographic breakdown for simplicity; the definitions apply to all
          variables and demographic breakdowns.
        </Alert>
        <p>
          As an example, if in a certain month,{' '}
          <strong>White (Non-Hispanic) people</strong> in Georgia had 65.7%
          share of <strong>COVID-19 deaths</strong> but only 52.7% share of the
          population, their disproportionate percent share would be{' '}
          <strong>+13%</strong>:<br />
          <figure>
            <code className={styles.Calculation}>65.7% - 52.7% = +13%</code>
          </figure>
          This value is then divided by the population percent share to give a
          proportional inequitable burden of
          <strong>+24.7%</strong>:
          <figure>
            <code className={styles.Calculation}>+13% / 52.7% = +24.7%</code>
          </figure>
          In plain language, this would be interpreted as{' '}
          <em>
            “<strong>Deaths</strong> of individuals identifying as{' '}
            <strong>White (Non Hispanic)</strong> in Georgia{' '}
            <strong>from COVID-19</strong> were almost 25% higher than expected,
            based on their share of Georgia’s overall population.”
          </em>
        </p>
        <DataTable
          headers={{
            topic: '',
            definition: '',
          }}
          methodologyTableDefinitions={[covidDefinitions[1]]}
        />
      </article>
    </section>
  )
}

export default MetricsLink
