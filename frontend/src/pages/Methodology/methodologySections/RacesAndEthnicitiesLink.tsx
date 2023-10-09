import styles from '../MethodologyPage.module.scss'

const RacesAndEthnicitiesLink = () => {
  return (
    <section>
      <article>
<<<<<<< HEAD
        <h1 className={styles.MethodologyQuestion}>Races and Ethnicities</h1>
=======
        <h1>Races and Ethnicities </h1>
>>>>>>> 25282a78 (fixing branch conflicts)
        <h2 className={styles.MethodologyQuestion}>
          What do the race/ethnicity groups mean?
        </h2>
        <div className={styles.MethodologyAnswer}>
          <p>
            The combined race/ethnicity groups shown on the tracker can be hard
            to understand, partially due to non-standard race/ethnicity
            breakdowns across data sources. Generally, all race/ethnicities on
            the tracker include Hispanic/Latino unless otherwise specified.
          </p>
          <p>
            We include a few example groups and definitions below. Note that the
            complete definition of a race/ethnicity can only be understood in
            the context of a particular dataset and how it classifies
            race/ethnicity (e.g. the presence of "Other" within a dataset
            changes who might be classified as "Asian" vs. "Other").
          </p>
          <ul>
            <li>
              <b>All</b>: Any race or ethnicity, including unknown
              race/ethnicity.
            </li>
            <li>
              <b>American Indian and Alaska Native (NH)</b>: A person having
              origins in any of the original peoples of North and South America
              (including Central America), who maintains tribal affiliation or
              community attachment, and who is not Hispanic/Latino.
            </li>
            <li>
              <b>Asian (NH)</b>: A person having origins in any of the original
              peoples of the Far East, Southeast Asia, or the Indian
              subcontinent including, for example, Cambodia, China, India,
              Japan, Korea, Malaysia, Pakistan, the Philippine Islands,
              Thailand, and Vietnam, and who is not Hispanic/Latino.
            </li>
            <li>
              <b>Black or African American (NH)</b>: A person having origins in
              any of the Black racial groups of Africa, and who is not
              Hispanic/Latino.
            </li>
            <li>
              <b>Hispanic/Latino</b>: Any race(s), Hispanic/Latino.
            </li>
            <li>
              <b>Middle Eastern / North African (MENA)</b>: Race/ethnicity
              grouping collected by CAWP but not currently collected by the U.S.
              Census.
            </li>
            <li>
              <b>Native Hawaiian or Other Pacific Islander (NH)</b>: A person
              having origins in any of the original peoples of Hawaii, Guam,
              Samoa, or other Pacific Islands and who is not Hispanic/Latino.
            </li>
            <li>
              <b>Unrepresented race (NH)</b>: A single race not tabulated by the
              CDC, not of Hispanic/Latino ethnicity. Individuals not identifying
              as one of the distinct races listed in the source data, or
              multiracial individuals, are grouped together as “Some other
              race”. This is a problem as it obscures racial identity for many
              individuals. In our effort to take transformative action towards
              achieving health equity the Satcher Health Leadership Institute
              has decided to rename this category to highlight it as a health
              equity issue. For PrEP coverage, Unrepresented race (NH) is used
              to recognize individuals who do not identify as part of the Black,
              White, or Hispanic ethnic or racial groups.
            </li>
            <li>
              <b>Two or more races (NH)</b>: Combinations of two or more of the
              following race categories: "White," "Black or African American,"
              American Indian or Alaska Native," "Asian," Native Hawaiian or
              Other Pacific Islander," or "Some Other Race", and who are not
              Hispanic/Latino.
            </li>
            <li>
              <b>Two or more races & Unrepresented race (NH)</b>: People who are
              either multiple races or a single race not represented by the data
              source’s categorization, and who are not Hispanic/Latino.
            </li>
            <li>
              <b>White (NH)</b>: A person having origins in any of the original
              peoples of Europe, the Middle East, or North Africa, and who is
              not Hispanic/Latino.
            </li>
          </ul>
        </div>
      </article>
    </section>
  )
}

export default RacesAndEthnicitiesLink
