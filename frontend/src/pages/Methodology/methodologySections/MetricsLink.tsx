import styles from '../MethodologyPage.module.scss'

const MetricsLink = () => {
  return (
    <section>
      <article>
        <h1>Metrics</h1>

        <h1 className={styles.MethodologyQuestion}>Metrics</h1>

        <h2 className={styles.MethodologyQuestion} id="metrics">
          What do the metrics on the tracker mean?
        </h2>
        <div className={styles.MethodologyAnswer}>
          <p>
            In the definitions below, we use <b>COVID-19 cases</b> as the
            variable, and <b>race and ethnicity</b> as the demographic breakdown
            for simplicity; the definitions apply to all variables and
            demographic breakdowns.
          </p>
          <ul>
            <li>
              <b>Total COVID-19 cases per 100k people</b>: The total rate of
              occurrence of COVID-19 cases expressed per 100,000 people (i.e.
              10,000 per 100k implies a 10% occurrence rate). This metric
              normalizes for population size, allowing for comparisons across
              demographic groups. This metric is rounded to the nearest integer
              in the tracker.
            </li>
            <li>
              <b>
                Share of total COVID-19 cases with unknown race and ethnicity
              </b>
              : Within a locale, the percentage of COVID-19 cases that reported
              unknown race/ethnicity. For example, a value of 20% for Georgia
              means that 20% of Georgia’s reported cases had unknown
              race/ethnicity. This metric is rounded to one decimal place. In
              instances where this would round to 0%, two decimal places are
              used.
            </li>
            <li>
              <b>Share of total COVID-19 cases</b>: The percentage of all
              COVID-19 cases that reported a particular race/ethnicity,
              excluding cases with unknown race/ethnicity. This metric is
              rounded to one decimal place. In instances where this would round
              to 0%, two decimal places are used.
            </li>
            <li>
              <b>Population share</b>: The percentage of the total population
              that identified as a particular race/ethnicity in the ACS survey.
              This metric is rounded to one decimal place. In instances where
              this would round to 0%, two decimal places are used.
            </li>
            <li>
              <b>Relative inequity for COVID-19 cases</b>: To demonstrate the
              often inequitable distribution of a condition or disease, we
              calculate each demographic group’s relative inequity using the{' '}
              <code>(OBSERVED - EXPECTED) / EXPECTED</code>. In this case,{' '}
              <code>OBSERVED</code> is each group's percent share of the
              condition, and <code>EXPECTED</code> is that group's share of the
              total population. This calculation is done for every point in time
              for which we have data, allowing visualization of inequity
              relative to population, over time.
              <p>
                {' '}
                As an example, if in a certain month White (Non-Hispanic) people
                in Georgia had 65.7% share of COVID-19 deaths but only 52.7%
                share of the population, their disproportionate percent share
                would be <b>+13%</b>: <code>65.7% - 52.7% = +13%</code>. This
                value is then divided by the population percent share to give a
                proportional inequitable burden of <b>+24.7%</b>:{' '}
                <code>+13% / 52.7% = +24.7%</code>. In plain language, this
                would be interpreted as{' '}
                <i>
                  “Deaths of individuals identifying as White, Non Hispanic in
                  Georgia from COVID-19 were almost 25% higher than expected,
                  based on their share of Georgia’s overall population.”
                </i>
              </p>
            </li>
          </ul>
        </div>
      </article>
    </section>
  )
}

export default MetricsLink
