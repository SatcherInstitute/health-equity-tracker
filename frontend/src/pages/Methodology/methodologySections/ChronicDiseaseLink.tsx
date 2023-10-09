import styles from '../MethodologyPage.module.scss'

const ChronicDiseaseLink = () => {
  return (
    <section>
      <article>
        <h1 className={styles.MethodologyQuestion}>Chronic Disease</h1>
        <h3 className={styles.MethodologySubsubheaderText}>
          America’s Health Rankings
        </h3>
        <p>
          Multiple chronic disease, behavioral health, and social determinants
          of health in the tracker are sourced from{' '}
          <a href={'urlMap.amr'}>America’s Health Rankings (AHR)</a>, who in
          turn source the majority of their data from the{' '}
          <a href={'urlMap.cdcBrfss'}>
            Behavioral Risk Factor Surveillance System (BRFSS)
          </a>
          , a survey run by the CDC, along with supplemental data from{' '}
          <a href={'urlMap.cdcWonder'}>CDC WONDER</a> and the{' '}
          <a href={'urlMap.censusVoting'}>US Census</a>.
        </p>
        <ul>
          <li>
            Because BRFSS is a survey, there are not always enough respondents
            to provide a statistically meaningful estimate of disease
            prevalence, especially for smaller and typically marginalized racial
            groups. Please see the{' '}
            <a href={'urlMap.amrMethodology'}>methodology page</a> of America’s
            Health Rankings for details on data suppression.
          </li>
          <li>
            BRFSS data broken down by race and ethnicity is not available at the
            county level, so the tracker does not display these conditions at
            the county level either.
          </li>
          <li>
            All metrics sourced from America’s Health Rankings are calculated
            based on the rates provided from their downloadable data files:
            <ul>
              <li>
                For most conditions, AHR provides these rates as a percentage,
                though in some cases they use cases per 100,000. If we present
                the condition using the same units, we simply pass the data
                along directly. If we need to convert a rate they present as a{' '}
                <b>percent</b> into a <b>per 100k</b>, we multiply their percent
                amount by 1,000 to obtain the new per 100k rate.
                <code>5% (of 100) === 5,000 per 100,000</code>.
              </li>
              <li>
                For COPD, diabetes, frequent mental distress, depression,
                excessive drinking, asthma, avoided care, and suicide, we source
                the <b>percent share</b> metrics directly from AHR.
              </li>
            </ul>
          </li>
        </ul>
      </article>
    </section>
  )
}

export default ChronicDiseaseLink
