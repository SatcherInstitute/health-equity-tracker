import Card from '@mui/material/Card'
import FlagIcon from '@mui/icons-material/Flag'
import styles from '../methodologyComponents/MethodologyPage.module.scss'

import KeyTerms from '../methodologyComponents/KeyTerms'
import {
  hivDataSources,
  hivDefinitionsArray,
} from '../methodologyContent/HIVDefinitions'
import DataTable from '../methodologyComponents/DataTable'
import {
  RESOURCES,
  PDOH_RESOURCES,
  EQUITY_INDEX_RESOURCES,
  AIAN_RESOURCES,
  API_RESOURCES,
  HISP_RESOURCES,
  MENTAL_HEALTH_RESOURCES,
  COVID_RESOURCES,
  COVID_VACCINATION_RESOURCES,
  ECONOMIC_EQUITY_RESOURCES,
  HIV_RESOURCES,
} from '../../WhatIsHealthEquity/ResourcesData'
import ConditionVariable from '../methodologyContent/ConditionVariable'
import Resources from '../methodologyComponents/Resources'
import { Helmet } from 'react-helmet-async'
import AgeAdjustmentExampleTable from '../methodologyComponents/AgeAdjustmentExampleTable'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import DataAlertError from '../methodologyContent/DataAlertError'
import {
  missingHivDataArray,
  missingPrepDataArray,
} from '../methodologyContent/missingDataBlurbs'
import { Alert, AlertTitle, CardContent, Typography } from '@mui/material'
import { Percent } from '@mui/icons-material'
import FormulaFormat from '../methodologyComponents/FormulaFormat'

const HivLink = () => {
  return (
    <section id="#hiv">
      <article>
        <Helmet>
          <title>HIV - Health Equity Tracker</title>
        </Helmet>
        <h2 className={styles.ScreenreaderTitleHeader}>HIV</h2>
        <br />

        <AgeAdjustmentExampleTable
          id="#categories-table"
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics', accessor: 'topic' },
            { header: 'Variables', accessor: 'variable' },
          ]}
          rows={[
            {
              category: 'HIV',
              topic:
                'HIV, HIV (Black Women), Linkage to HIV Care, PrEP Coverage, HIV Stigma',
              variable:
                'Prevalence, New diagnoses, Deaths, Race/ethnicity, Sex, Age',
            },
          ]}
        />

        <Alert severity={'warning'} role="note" icon={<FlagIcon />}>
          The groups above refer to <b>sex assigned at birth</b>, as opposed to{' '}
          <b>gender identity</b>. Due to lack of reliable population data for
          gender-expansive people, we are unable to present{' '}
          <b>rates per 100k</b>, however our data sources do provide the
          following 2019 case counts for{' '}
          {/* <b>
          people {hivPhraseMap?.[props?.dataTypeId]} in{' '}
          {props.fips.getSentenceDisplayName()}
        </b>
        :
        <ul>
          <li>
            <b>
              {transMenCount.toLocaleString()} individuals identified as
              transgender men
            </b>
          </li>

          <li>
            <b>
              {transWomenCount.toLocaleString()} individuals identified as
              transgender women
            </b>
          </li>
          <li>
            <b>
              {agiCount.toLocaleString()} individuals with additional gender
              identities (AGI)
            </b>
          </li>
        </ul>
        Visit the{' '}
        <a href={urlMap.cdcTrans}> */}
          CDC's HIV Prevention and Care for Transgender People
          {/* </a>{' '} */}
          to learn more.
        </Alert>
        <h3 id="#hiv-data-sourcing">Data Sourcing</h3>
        <p id="#hiv">
          The CDC's National Center for HIV, Viral Hepatitis, STD, and TB
          Prevention (NCHHSTP) collects and studies information on the number of
          people diagnosed with HIV in the United States. This information is
          gathered from state and local HIV surveillance programs and is used to
          better understand the impact of HIV across the country.
        </p>
        <p>
          <Alert severity="info" role="note">
            <AlertTitle>A note about CDC NCHHSTP AtlasPlus</AlertTitle>
            <p>
              The CDC's NCHHSTP and other HIV surveillance programs have agreed
              to limit the amount of data released at the state and county
              levels in order to protect the privacy of those affected. It takes
              12 months for the data to become official, so the numbers reported
              before this time are not final and should be interpreted with
              caution.
            </p>
          </Alert>
        </p>
        <p>
          To protect people’s privacy, the CDC and these programs have agreed to
          limit the amount of data released at the state and county levels.
          Additionally, some of the data is adjusted to account for missing
          information on how people became infected with HIV. This means that
          the data may change as more information becomes available.
        </p>
        <Alert severity={'warning'} role="note" icon={<FlagIcon />}>
          <AlertTitle>2020 Data Disruption Due to COVID-19</AlertTitle>
          <p>
            The COVID-19 pandemic significantly disrupted data for the year
            2020. This impact could lead to distortions in the reported numbers.
            Please exercise caution when analyzing this year's data.
          </p>
        </Alert>
        <p>
          The data for 2022 and 2023 is still in its initial stages of
          collection and has not been finalized, making it "preliminary."
          Single-year figures refer to data that represents just one specific
          year, rather than an average or cumulative total over multiple years.
          Given the preliminary status of the 2022 and 2023 data, we've opted to
          use 2021 as our reference year when showcasing data from a single
          year.
        </p>

        <h3
          id="#deaths-diagnosis-prevalence"
          className={styles.MethodologySubsubheaderText}
        >
          Variable Data Compilation and Analysis
        </h3>

        <h4>HIV Diagnosis</h4>
        <p>
          Refers to confirmed HIV infections via laboratory or clinical evidence
          within a specific calendar year. Counts are for individuals aged 13 or
          older diagnosed with HIV during the year. Age is determined by the
          person's age at the time of infection. All metrics sourced from the
          CDC for HIV deaths are calculated directly from the raw count of those
          cases.
        </p>
        <h4>HIV Prevalence</h4>
        <p>
          Represents estimated individuals aged 13 and older living with HIV by
          the year's end. Accounts for both diagnosed and undiagnosed cases.
          Adjusted using the total number of diagnosed cases and subsequent
          deaths from CDC’s Atlas database. The Asian category includes cases
          classified as "Asian/Pacific Islander" using the pre-1997 OMB
          race/ethnicity system when querying HIV prevalence. HIV prevalence
          metrics are determined by estimating the total number of individuals
          who have ever been infected with HIV (diagnosed and undiagnosed cases)
          and then adjusting for the reported total number of people diagnosed
          with HIV and subsequently died provided by the CDC’s Atlas database.
        </p>
        <h4>HIV Deaths</h4>
        <p>
          Counts deaths of persons aged 13 and older with diagnosed HIV or AIDS,
          irrespective of death cause. Data has a 12-month reporting delay for
          CDC reporting. Age is determined by the person's age at the time of
          death. All metrics sourced from the CDC for HIV deaths are calculated
          directly from the raw count of those cases.
        </p>
        <h5>Percent share</h5>
        <p>
          To calculate the percent share of HIV diagnoses, prevalence, or
          deaths, we divide the number of HIV deaths, diagnoses, or prevalence
          in a specific demographic group by the total number of HIV deaths,
          diagnoses, or prevalence and multiply the result by 100.
        </p>
        <FormulaFormat
          leftSide="Percent Share"
          rightSide={[
            {
              numerator: 'Number of cases in demographic group',
              denominator: 'Total number of cases',
            },
            ' * ',
            ' 100 ',
          ]}
        />
        <h5>Population percent</h5>
        <p>
          The population data is obtained directly from the CDC. To calculate
          the population percent share, we divide the number of individuals in a
          specific population by the total number of individuals in the larger
          population and multiply the result by 100.
        </p>
        <FormulaFormat
          leftSide="Population Percent"
          rightSide={[
            {
              numerator: 'Number of individuals in specific population',
              denominator: 'Total population',
            },
            ' * ',
            ' 100 ',
          ]}
        />
        <h5>Rate Per 100,000 People (also referred to as 'Rate Per 100k')</h5>
        <p>
          The rate per 100k for HIV diagnoses, prevalence, and deaths, is
          obtained directly from the CDC. Calculating the rate per 100k of HIV
          deaths, diagnoses, or prevalence involves dividing the number of
          deaths, diagnoses, or prevalence within a specific population by the
          total population of that group, multiplying the result by 100,000, and
          then expressing it as a rate per 100,000 people.
        </p>
        <FormulaFormat
          leftSide="Rate per 100,000 people"
          rightSide={[
            {
              numerator: 'Number of cases within specific population',
              denominator: 'Total population of that group',
            },
            ' * ',
            ' 100,000 ',
          ]}
        />
        {/* <Card
          id={'#hiv-missing-and-suppressed-data'}
          elevation={3}
          className={styles.MissingDataBox}
        >
          <Card elevation={3} className={styles.MissingDataBox}></Card>

          <p id="hiv_prep">
            <b>PrEP Coverage</b>
          </p>

        <</Card> */}
        <h3>Addressing Missing and Suppressed Data</h3>
        <Alert severity={'warning'} role="note" icon={<FlagIcon />}>
          <AlertTitle>
            Upholding the Confidentiality of People Living with HIV/AIDS (PLWHA)
          </AlertTitle>
          <p>
            To protect personal privacy, prevent revealing information that
            might identify specific individuals, and ensure the reliability of
            statistical estimates, small data values may not be available in
            some circumstances.
          </p>
        </Alert>
        <p>
          County-level data is suppressed when the population denominator is:
          <ul>
            <li>less than 100,</li>
            <li>the total case count is between 1–4 cases, or </li>
            <li>when querying HIV or AIDS deaths.</li>
          </ul>
        </p>

        <p>
          For the Census Island Areas (US territories other than Puerto Rico),
          there isn't enough data to accurately calculate subpopulation rates by
          <ul>
            <li>age,</li>
            <li>sex, and</li>
            <li>race/ethnicity.</li>
          </ul>
          As a result, the analysis or report will not provide detailed
          information about these specific groups in those regions. The Asian
          category includes cases previously classified as "Asian/Pacific
          Islander" under the pre-1997 Office of Management and Budget (OMB)
          race/ethnicity classification system when querying HIV prevalence.
        </p>

        <DataAlertError alertsArray={missingHivDataArray} />

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

        {/* <Card elevation={3} className={styles.MissingDataBox}>
          <MissingPrepData />
        </Card> */}
        <DataAlertError alertsArray={missingPrepDataArray} />

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

        <h3 id="#hiv-data-sources">Data Sources</h3>
        <AgeAdjustmentExampleTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Geographic Level', accessor: 'geo' },
            { header: 'Granularity', accessor: 'granularity' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={hivDataSources.map((source, index) => ({
            source: (
              <a
                key={index}
                href={`${DATA_CATALOG_PAGE_LINK}?${DATA_SOURCE_PRE_FILTERS}=${source.id}`}
              >
                {source.data_source_name}
              </a>
            ),
            geo: source.geographic_level,
            granularity: source.demographic_granularity,
            updates: source.update_frequency,
          }))}
        />
        <KeyTerms id="#hiv-key-terms" definitionsArray={hivDefinitionsArray} />
        <Resources id="#hiv-resources" resourceGroups={[HIV_RESOURCES]} />
      </article>
    </section>
  )
}

export default HivLink
