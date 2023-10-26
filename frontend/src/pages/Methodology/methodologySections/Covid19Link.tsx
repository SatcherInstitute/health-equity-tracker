import { Card, Link } from '@mui/material'
import { urlMap } from '../../../utils/externalUrls'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import {
  MissingCovidData,
  MissingCovidVaccinationData,
} from '../methodologyContent/missingDataBlurbs'

import {
  covidDataSources,
  covidDefinitionsArray,
} from '../methodologyContent/CovidDefinitions'
import KeyTerms from '../methodologyComponents/KeyTerms'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import DataTable from '../methodologyComponents/DataTable'

const Covid19Link = () => {
  return (
    <section>
      <article>
        {covidDataSources.map((source, index) => {
          return (
            <a
              key={index}
              href={`${DATA_CATALOG_PAGE_LINK}?${DATA_SOURCE_PRE_FILTERS}=${source.id}`}
            >
              {source.data_source_name}
            </a>
          )
        })}
        {/* <KeyTerms definitionsArray={covidDefinitionsArray} /> */}
        <DataTable
          headers={{
            topic: '',
            definition: 'COVID-19 Key Terms',
          }}
          methodologyTableDefinitions={covidDefinitionsArray}
        />
        <h3 className={styles.MethodologySubsubheaderText} id="#covid19">
          COVID-19
        </h3>
        <h3>Age-Adjusted Data Sourcing</h3>
        <p>
          For COVID-19, we use the CDC Case Surveillance Restricted Access
          Detailed Data for this. It can break down by race and age to ten-year
          buckets. The age buckets are: 0-9, 10-19, 20-29, 30-39, 40-49, 50-59,
          60-69, 70-79, 80+
        </p>
        <ul>
          <li>
            National statistics are aggregations of state-wide data. If state
            data is not available, these aggregations may be incomplete and
            potentially skewed.
          </li>
          <li>
            When calculating national-level per100k COVID-19 rates for cases,
            deaths, and hospitalizations, we only include the population of
            states that do not have a suppressed case, hospitalization, or death
            count as part of the total population for each respective measure.
            See the <b>What data are missing</b> section for further details.
          </li>
          <li>
            To protect the privacy of affected individuals, COVID-19 data may be
            hidden in counties with low numbers of COVID-19 cases,
            hospitalizations and deaths.
          </li>
          <li>
            Decisions to suppress COVID-19 data for particular states in the
            tracker are evaluated by comparing the aggregate case, death, and
            hospitalization counts in the CDC surveillance dataset vs. other
            sources, such as the New York Times COVID Dataset, which in turn
            sources their data directly from state and territory health
            departments. Data for a state are suppressed if the aggregate counts
            for that state are &lt; 5% of the source being used for comparison.
            These analyses are available for{' '}
            <a href={urlMap.shliGitHubSuppressCovidCases}>cases</a> and{' '}
            <a href={urlMap.shliGitHubSuppressCovidDeaths}>deaths</a>.
          </li>
          <li>
            The underlying data is reported by the CDC at the case-level, so we
            cannot determine whether a state/county lacking cases for a
            particular demographic group truly has zero cases for that group or
            whether that that locale fails to report demographics correctly.
          </li>
        </ul>

        <div id="#covid19-time-series-data" style={{ height: '10px' }}></div>
        <h3
          className={styles.MethodologySubsubheaderText}
          id="#covid19-time-series-data"
        >
          COVID-19 time-series data
        </h3>

        <h4 id="#covid19-time-series-data">COVID-19 time-series data</h4>

        <h3
          className={styles.MethodologySubsubheaderText}
          id="#covid19-time-series-data"
        >
          COVID-19 time-series data
        </h3>

        <ul>
          <li>
            The CDC Restricted dataset includes a field called{' '}
            <b>cdc_case_earliest_dt</b>, which represents the earliest of either
            the date of first symptoms onset, a positive COVID test, or the date
            the case was first reported to the CDC. We use the month and year of
            this field to categorize the month and year that each COVID case,
            death, and hospitalization occurred. It is important to note here,
            that, for deaths and hospitalizations, we plot the month the case
            was first reported, and not when the death or hospitalization itself
            occurred.
          </li>
          <li>
            We chose to use this field because it is filled out for the vast
            majority of cases, and because it provides the best estimate we can
            get on when the COVID case in question occurred.
          </li>
          <li>
            We only count confirmed deaths and hospitalizations in the{' '}
            <b>per100k</b> and <b>inequitable distribution</b> metrics, so when
            we show “zero” deaths or hospitalizations for a demographic group in
            any month, it is possible that there are unconfirmed deaths or
            hospitalizations for that group in that month, but they have not
            been reported to the CDC.
          </li>
          <li>
            If a geographic jurisdiction reports zero cases, deaths, or
            hospitalizations for a demographic for the entire pandemic, we leave
            that demographic off of our charts all together, as we assume they
            are not collecting data on that population.
          </li>
          <li>
            Each chart represents the “incidence rate” – the amount of new cases
            that were reported in each month.
          </li>
        </ul>

        {/* 
        <Card
          id="#covid19-missing-and-suppressed-data"

        <div
          id="#covid19-missing-and-suppressed-data"
          style={{ height: '30px' }}
        ></div> */}
        <Card
          // id="#covid19-missing-and-suppressed-data"

          elevation={3}
          className={styles.MissingDataBox}
        >
          <MissingCovidData />
        </Card>

        <h3
          className={styles.MethodologySubsubheaderText}
          id="#covid-19-vaccinations"
        >
          <div id="#covid-19-vaccinations" style={{ height: '10px' }}></div>
          {/* <h3 className={styles.MethodologySubsubheaderText}>

          COVID-19 vaccinations */}
        </h3>

        <p>
          Because there is currently no national vaccine demographic dataset, we
          combine the best datasets we could find for each geographic level.
        </p>
        <ul>
          <li>
            For the national level numbers, we use the{' '}
            <a href={urlMap.cdcVaxTrends}>CDC vaccine demographic dataset,</a>{' '}
            which provides data on the race/ethnicity, sex, and age range of
            vaccine recipients, as well whether they have taken one or two
            shots.{' '}
          </li>

          <li>
            For the state level we use{' '}
            <a href={urlMap.kffCovid}>
              the Kaiser Family Foundation COVID-19 Indicators dataset,
            </a>{' '}
            which is a hand-curated dataset based on analysis from state health
            department websites. It is the only state level demographic vaccine
            dataset that publishes this data in a usable format. The dataset
            only provides data on the race and ethnicity of vaccine recipients,
            and for the majority of states counts individuals who have received
            at least one shot as vaccinated. It does not include any data for US
            territories.{' '}
          </li>
          <li>
            For the county level, we could not identify a dataset that provides
            vaccine demographics, so to show some context we use the{' '}
            <a href={urlMap.cdcVaxCounty}>
              COVID-19 Vaccinations in the United States, County dataset
            </a>{' '}
            which provides the total number of vaccinations per county.
          </li>
        </ul>

        <h4> Vaccination population sources </h4>

        {/* <h3
          className={styles.MethodologySubsubheaderText} */}

        <div
          id="#vaccination-population-sources"
          style={{ height: '10px' }}
        ></div>
        <h3 className={styles.MethodologySubsubheaderText}>
          Vaccination population sources
        </h3>

        <ul>
          <li>
            For the national numbers we use the population numbers provided by
            the CDC, we chose to do this because they include population
            estimates from <b>Palau</b>, <b>Micronesia</b>, and the{' '}
            <b>U.S. Marshall Islands,</b> which are difficult to find
            estimations for. Furthermore the CDC has estimations for age ranges
            that the ACS numbers do not readily provide, as they use a per year
            population estimate from the ACS that we do not use anywhere else
            and have not added to our system.
          </li>
          <li>
            For the state level, to calculate the total number of vaccinations
            we use the ACS 2019 estimates of each state’s population. The
            population counts for each demographic group at the state level are
            provided by the Kaiser Family Foundation, who researched exactly
            what the definition of each demographic group in every state is.
            They provide population estimates for <b>Asian</b>, <b>Black</b>,{' '}
            <b>White</b>, and <b>Hispanic</b>, so we fill in the ACS 2019
            estimation for <b>American Indian and Alaska Native</b>, and{' '}
            <b>Native Hawaiian and Pacific Islander</b>. These alternate
            population comparisons metrics shown with a different color on the
            disparities bar chart. We are unable to show a population comparison
            metric for “Unrepresented Race” because we are unsure of the
            definition in each state.
          </li>
          <li>
            For the county level we use the ACS 2019 population estimations.
          </li>
        </ul>

        <h4>Vaccination data limitations</h4>

        {/* <h3
          className={styles.MethodologySubsubheaderText} */}

        <div
          id="#vaccination-data-limitations"
          style={{ height: '10px' }}
        ></div>
        <h3 className={styles.MethodologySubsubheaderText}>
          Vaccination data limitations
        </h3>

        <ul>
          <li>
            <b>New Hampshire</b> lifted its national COVID-19 emergency response
            declaration in May 2021, which allows vaccine recipients to opt out
            of having their COVID-19 vaccinations included in the state’s IIS.
            As such, data submitted by New Hampshire since May 2021 may not be
            representative of all COVID-19 vaccinations occurring in the state.
          </li>
          <li>
            Some states report race and ethnicity separately, in which case they
            report unknown percentages separately. In this case, we show the
            higher of the two metrics on the national map of unknown cases, and
            display both numbers on the state page.
          </li>
          <li>
            The Kaiser Family Foundation only collects population data for{' '}
            <b>Asian</b>, <b>Black</b>, <b>White</b>, and <b>Hispanic</b>{' '}
            demographics, limiting their per 100k metrics and what demographic
            breakdowns we are able to show at the state level.
          </li>
          <li>
            As there is no standardized definition for “vaccinated”, we display
            vaccination data as “at least one dose” which is used by most
            states. However, some states including <b>Arkansas</b>,{' '}
            <b>Illinois</b>, <b>Maine</b>, <b>New Jersey</b>, and{' '}
            <b>Tennessee</b> report “Total vaccine doses administered”, in which
            case those numbers are reported.
          </li>
        </ul>

        <Card
          id="#missing-covid-vaccination-data"
          elevation={3}
          className={styles.MissingDataBox}
        >
          {/* <Card elevation={3} className={styles.MissingDataBox}> */}

          <MissingCovidVaccinationData />
        </Card>
      </article>
    </section>
  )
}

export default Covid19Link
