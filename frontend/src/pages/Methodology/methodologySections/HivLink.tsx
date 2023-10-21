import Card from '@mui/material/Card'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import {
  MissingHIVData,
  MissingPrepData,
} from '../methodologyContent/missingDataBlurbs'
import KeyTerms from '../methodologyComponents/KeyTerms'
import { hivDefinitionsArray } from '../methodologyContent/HIVDefinitions'

const HivLink = () => {
  return (
    <section>
      <article>
        <KeyTerms definitionsArray={hivDefinitionsArray} />
        {/* <p id="hiv_black_women"> */}

        <p id="#hiv">
          The CDC collects and studies information on the number of people
          diagnosed with HIV in the United States. This information is gathered
          from state and local HIV surveillance programs and is used to better
          understand the impact of HIV across the country. To protect people’s
          privacy, the CDC and these programs have agreed to limit the amount of
          data released at the state and county levels. It takes 12 months for
          the data to become official, so the numbers reported before this time
          are not final and should be interpreted with caution. Additionally,
          some of the data is adjusted to account for missing information on how
          people became infected with HIV. This means that the data may change
          as more information becomes available.
        </p>
        <p>
          The COVID-19 pandemic significantly disrupted data for the year 2020.
          This impact could lead to distortions in the reported numbers. Please
          exercise caution when analyzing this year's data.
        </p>
        <p>
          Data for the years 2022 and 2023 are preliminary. For this reason, we
          have chosen 2021 as our source year when presenting single-year
          figures.
        </p>

        <h3
          id="#deaths-diagnosis-prevalence"
          className={styles.MethodologySubsubheaderText}
        >
          HIV Deaths, Diagnosis, & Prevalence
        </h3>
        <p>
          <b>HIV Deaths, Diagnosis, & Prevalence</b>
        </p>

        <p>
          Death data include deaths of persons aged 13 years and older with
          diagnosed HIV infection or AIDS classification, regardless of the
          cause of death. Death data are based on a 12-month reporting delay to
          allow data to be reported to CDC. For death data, age is based on the
          person’s age at the time of death.
        </p>
        <p>
          HIV diagnoses refer to the number of HIV infections confirmed by
          laboratory or clinical evidence during a specific calendar year.
          Diagnoses of HIV infection are counted for individuals who are 13
          years of age or older and have received a confirmed diagnosis of HIV
          during the specified year. For incidence estimates, age is based on
          the person’s age at infection.
        </p>
        <p>
          HIV prevalence refers to the estimated number of individuals aged 13
          and older living with HIV at the end of the specified year, regardless
          of when they were infected or whether they received a diagnosis.This
          measure estimates the burden of HIV in a population.
        </p>
        <ul>
          <li>
            All metrics sourced from the CDC for HIV deaths and diagnoses are
            calculated directly from the raw count of those cases. In contrast,
            HIV prevalence is determined by estimating the total number of
            individuals who have ever been infected with HIV (diagnosed and
            undiagnosed cases) and then adjusting for the reported total number
            of people diagnosed with HIV and subsequently died provided by the
            CDC’s Atlas database.
            <ul>
              <li>
                <b>Percent share</b>: To calculate the percent share of
                HIVdeaths, diagnoses, or prevalence, we divide the number of HIV
                deaths, diagnoses, or prevalence in a specific demographic group
                by the total number of HIV deaths, diagnoses, or prevalence and
                multiply the result by 100.
              </li>
              <li>
                <b>Population percent</b>: The population data is obtained
                directly from the CDC. To calculate the population percent
                share, we divide the number of individuals in a specific
                population by the total number of individuals in the larger
                population and multiply the result by 100.
              </li>
              <li>
                <b>Rate Per 100k</b>: The rate per 100k for HIV deaths,
                diagnoses, and prevalence is obtained directly from the CDC.
                Calculating the rate per 100k of HIV deaths, diagnoses, or
                prevalence involves dividing the number of deaths, diagnoses, or
                prevalence within a specific population by the total population
                of that group, multiplying the result by 100,000, and then
                expressing it as a rate per 100,000 people.
              </li>
            </ul>
          </li>
        </ul>

        <Card
          id={'#hiv-missing-and-suppressed-data'}
          elevation={3}
          className={styles.MissingDataBox}
        >
          <Card elevation={3} className={styles.MissingDataBox}>
            <MissingHIVData />
          </Card>

          <p id="hiv_prep">
            <b>PrEP Coverage</b>
          </p>

          <MissingHIVData />
        </Card>

        <h3 id="#prep-coverage" className={styles.MethodologySubsubheaderText}>
          PrEP Coverage
        </h3>

        <p>
          PrEP coverage, reported as a percentage, is defined as the number of
          persons aged 16 years and older classified as having been prescribed
          PrEP during the specified year divided by the estimated annual number
          of persons aged 16 years and older with indications for PrEP during
          the specified year.
        </p>
        <p>
          The percentage of PrEP coverage is an important measure for evaluating
          the success of PrEP implementation and uptake efforts, as well as for
          identifying disparities in PrEP access and use among different
          demographic groups or geographic regions. It can also be used to
          monitor changes in PrEP coverage over time and to inform targeted
          interventions to increase PrEP uptake and reduce HIV incidence among
          high-risk populations. Using PrEP coverage as a percentage helps to
          convey the actual proportion of individuals who are covered by PrEP
          relative to the total population of interest. Creating a clear picture
          of the proportion of individuals who are eligible for PrEP and have
          access to it.
        </p>
        <p>
          PrEP coverage is often considered a necessary precursor to PrEP usage.
          Without adequate PrEP coverage, individuals who are at high risk for
          HIV may not have access to PrEP or may not be aware of its
          availability. As a result, PrEP usage may be lower in populations with
          low PrEP coverage.
        </p>
        <ul>
          <li>
            All metrics sourced from the CDC are calculated based on the number
            of PrEP prescriptions provided by the CDC’s Atlas database.
            <ul>
              <li>
                <b>Percent share</b>: Calculating the percent share of PrEP
                prescriptions involves dividing the number of PrEP prescriptions
                filled by a specific population or demographic group by the
                total number of PrEP prescriptions filled and multiplying the
                result by 100.
              </li>
              <li>
                <b>PrEP-eligible population percent</b>: Calculating the percent
                share of the PrEP-eligible population involves dividing the
                number of individuals within a specific population or
                demographic group eligible for PrEP by the total number of
                individuals eligible for PrEP and multiplying the result by 100.
              </li>
              <li>
                <b>PrEP coverage</b>: This percentage is obtained directly from
                the CDC. It involves dividing the number of individuals within a
                specific population or demographic group using PrEP at a given
                time by the total number of individuals in the same population
                or demographic group eligible for PrEP based on their HIV risk
                and multiplying the result by 100.
              </li>
              <li>
                <b>Relative Inequity</b>: Calculating the percentage of relative
                inequity involves subtracting the proportion of all PrEP
                prescriptions filled by a specific population or group from the
                proportion of a specific population or group in the
                PrEP-eligible population. The value is divided by the proportion
                of a specific population or group in the PrEP-eligible
                population multiplied by 100 to express it as a percentage.
              </li>
            </ul>
          </li>
        </ul>

        <Card elevation={3} className={styles.MissingDataBox}>
          <MissingPrepData />
        </Card>

        <h3
          id="#linkage-to-care"
          className={styles.MethodologySubsubheaderText}
        >
          Linkage to Care
        </h3>
        <p id="hiv_care">
          <b>Linkage to Care</b>
        </p>

        <p>
          Linkage to HIV care, reported as a percentage, refers to the number of
          persons aged 13 years and older newly diagnosed with HIV, having at
          least one CD4 or viral load test performed within one month of
          diagnosis during the specified year and divided by the number of
          persons aged 13 years and older newly diagnosed with HIV during the
          specified year.
        </p>
        <p>
          Linkage to HIV care is a critical step in the HIV care continuum and
          can improve health outcomes for individuals with HIV. When a person
          living with HIV is linked to care soon after their diagnosis, they can
          receive the medical treatment and support they need to manage their
          HIV, reduce the amount of virus in their body, improve their health,
          and lower the risk of transmitting HIV to others. Delayed linkage to
          care can result in poorer health outcomes for individuals living with
          HIV and can increase the risk of transmitting HIV to others.
        </p>

        <ul>
          <li>
            All metrics sourced from the CDC are calculated based on the number
            of cases of HIV diagnosis where individuals have received at least 1
            CD4 or viral load test performed less than one month after
            diagnosis.
            <ul>
              <li>
                <b>Percent share</b>: Calculating the percent share of
                individuals who received testing or treatment within a month
                involves dividing the number of people with access to HIV care
                by a specific population or demographic group by the total
                number of people with access to HIV care and multiplying the
                result by 100.
              </li>
              <li>
                <b>Diagnosed population percent</b>: Calculating the percent
                share of the population involves dividing the number of
                individuals within a specific population or demographic group
                with HIV diagnoses by the total number of individuals with HIV
                diagnoses and multiplying the result by 100.
              </li>
              <li>
                <b>Linkage to Care</b>: This percentage is obtained directly
                from the CDC. It involves dividing the number of individuals
                within a specific population or demographic group with access to
                care at a given time by the total number of individuals living
                with HIV in the same population or demographic group and
                multiplying the result by 100.
              </li>
              <li>
                <b>Relative Inequity</b>: Calculating the percentage of relative
                inequity involves subtracting the proportion of all individuals
                with access to care by a specific population or group from the
                proportion of a specific population or group in the diagnosed
                population. The value is divided by the proportion of a specific
                population or group in the diagnosed population multiplied by
                100 to express it as a percentage.
              </li>
            </ul>
          </li>
        </ul>

        <p id="hiv_stigma">
          <b>HIV Stigma</b>
        </p>

        <h3 id="#stigma" className={styles.MethodologySubsubheaderText}>
          HIV Stigma
        </h3>

        <p>
          HIV stigma, reported as a score, refers to the weighted median score
          on a 10-item scale ranging from 0 (no stigma) to 100 (high stigma)
          among the number of persons aged 18 years and older diagnosed with
          HIV. This measurement captures four dimensions of HIV stigma:
          personalized stigma experienced during the past 12 months, current
          concerns about disclosure, negative self-image, and perceived public
          attitudes towards people living with HIV.
        </p>
        <p>
          HIV stigma is crucial in understanding and addressing the challenges
          faced by individuals living with HIV. By examining stigma, we gain
          insights into the experiences of people with HIV about personalized
          stigma, concerns about disclosure, self-image, and societal attitudes.
          This information helps inform strategies and interventions to reduce
          stigma, promote social support, and improve the well-being of
          individuals living with HIV.
        </p>

        <ul>
          <li>
            All metrics related to HIV stigma, sourced from the CDC, are
            calculated based on a national probability sample of individuals
            diagnosed with HIV.
            <ul>
              <li>
                <b>Stigma score</b>: Calculating HIV stigma involves determining
                the weighted median score on a 10-item scale among a national
                probability sample of people with diagnosed HIV. The scores
                obtained from self-reported data are then analyzed to assess the
                prevalence and impact of HIV stigma. This method allows for the
                quantification and comparison of stigma levels across different
                populations and geographic areas, providing insights into the
                experiences of individuals living with HIV.
              </li>
            </ul>
          </li>
        </ul>
      </article>
    </section>
  )
}

export default HivLink
