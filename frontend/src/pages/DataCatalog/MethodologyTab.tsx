import Grid from '@mui/material/Grid'
import styles from './DataCatalogPage.module.scss'
import {
  CONTACT_TAB_LINK,
  HET_URL,
  DATA_TAB_LINK,
} from '../../utils/internalRoutes'
import { Helmet } from 'react-helmet-async'
import { getHtml, LinkWithStickyParams } from '../../utils/urlutils'
import { selectFaqs } from '../WhatIsHealthEquity/FaqTab'
import { METRIC_CONFIG } from '../../data/config/MetricConfig'
import { Card } from '@mui/material'
import { urlMap } from '../../utils/externalUrls'
import DefinitionsList from '../../reports/ui/DefinitionsList'
import { currentYear } from '../../Footer'
import {
  ALASKA_PRIVATE_JAIL_CAVEAT,
  CombinedIncarcerationStateMessage,
} from '../../data/variables/IncarcerationProvider'
import { Link } from 'react-router-dom'
import {
  MissingCAWPData,
  MissingCovidData,
  MissingCovidVaccinationData,
  MissingHIVData,
  MissingPrepData,
  MissingAHRData,
} from './methodologyContent/missingDataBlurbs'

export const CITATION_APA = `Health Equity Tracker. (${currentYear()}). Satcher Health Leadership Institute. Morehouse School of Medicine. ${HET_URL}.`

function MethodologyTab() {
  return (
    <>
      <Helmet>
        <title>Methodology - Health Equity Tracker</title>
      </Helmet>
      <h2 className={styles.ScreenreaderTitleHeader}>Methodology</h2>
      <Grid
        container
        direction="column"
        justifyContent="space-around"
        alignItems="center"
      >
        <Grid item>
          <Grid container className={styles.MethodologySection}>
            <Grid
              item
              className={styles.MethodologyQuestionAndAnswer}
              component="article"
            >
              <h2 id="main" className={styles.MethodologyQuestion}>
                Recommended citation (APA) for the Health Equity Tracker:
              </h2>

              <div className={styles.MethodologyAnswer}>
                <Card elevation={3}>
                  <p className={styles.CitationAPA}>{CITATION_APA}</p>
                </Card>
              </div>
            </Grid>
            <Grid
              item
              className={styles.MethodologyQuestionAndAnswer}
              component="article"
            >
              <h2 className={styles.MethodologyQuestion}>{selectFaqs[4].q}</h2>
              <div className={styles.MethodologyAnswer}>
                {<>{getHtml(selectFaqs[4].a)}</>}
              </div>
            </Grid>

            <Grid
              item
              className={styles.MethodologyQuestionAndAnswer}
              component="article"
            >
              <h2 className={styles.MethodologyQuestion}>
                What are the limitations of the tracker, and why were these
                health equity topics chosen?
              </h2>
              <div className={styles.MethodologyAnswer}>
                <h3 className={styles.MethodologySubsubheaderText}>COVID-19</h3>

                <ul>
                  <li>
                    National statistics are aggregations of state-wide data. If
                    state data is not available, these aggregations may be
                    incomplete and potentially skewed.
                  </li>
                  <li>
                    When calculating national-level per100k COVID-19 rates for
                    cases, deaths, and hospitalizations, we only include the
                    population of states that do not have a suppressed case,
                    hospitalization, or death count as part of the total
                    population for each respective measure. See the{' '}
                    <b>What data are missing</b> section for further details.
                  </li>
                  <li>
                    To protect the privacy of affected individuals, COVID-19
                    data may be hidden in counties with low numbers of COVID-19
                    cases, hospitalizations and deaths.
                  </li>
                  <li>
                    Decisions to suppress COVID-19 data for particular states in
                    the tracker are evaluated by comparing the aggregate case,
                    death, and hospitalization counts in the CDC surveillance
                    dataset vs. other sources, such as the New York Times COVID
                    Dataset, which in turn sources their data directly from
                    state and territory health departments. Data for a state are
                    suppressed if the aggregate counts for that state are &lt;
                    5% of the source being used for comparison. These analyses
                    are available for{' '}
                    <a href={urlMap.shliGitHubSuppressCovidCases}>cases</a> and{' '}
                    <a href={urlMap.shliGitHubSuppressCovidDeaths}>deaths</a>.
                  </li>
                  <li>
                    The underlying data is reported by the CDC at the
                    case-level, so we cannot determine whether a state/county
                    lacking cases for a particular demographic group truly has
                    zero cases for that group or whether that that locale fails
                    to report demographics correctly.
                  </li>
                </ul>

                <h4>COVID-19 time-series data</h4>
                <ul>
                  <li>
                    The CDC Restricted dataset includes a field called{' '}
                    <b>cdc_case_earliest_dt</b>, which represents the earliest
                    of either the date of first symptoms onset, a positive COVID
                    test, or the date the case was first reported to the CDC. We
                    use the month and year of this field to categorize the month
                    and year that each COVID case, death, and hospitalization
                    occurred. It is important to note here, that, for deaths and
                    hospitalizations, we plot the month the case was first
                    reported, and not when the death or hospitalization itself
                    occurred.
                  </li>
                  <li>
                    We chose to use this field because it is filled out for the
                    vast majority of cases, and because it provides the best
                    estimate we can get on when the COVID case in question
                    occurred.
                  </li>
                  <li>
                    We only count confirmed deaths and hospitalizations in the{' '}
                    <b>per100k</b> and <b>inequitable distribution</b> metrics,
                    so when we show “zero” deaths or hospitalizations for a
                    demographic group in any month, it is possible that there
                    are unconfirmed deaths or hospitalizations for that group in
                    that month, but they have not been reported to the CDC.
                  </li>
                  <li>
                    If a geographic jurisdiction reports zero cases, deaths, or
                    hospitalizations for a demographic for the entire pandemic,
                    we leave that demographic off of our charts all together, as
                    we assume they are not collecting data on that population.
                  </li>
                  <li>
                    Each chart represents the “incidence rate” – the amount of
                    new cases that were reported in each month.
                  </li>
                </ul>

                <Card elevation={3} className={styles.MissingDataBox}>
                  <MissingCovidData />
                </Card>

                <h3 className={styles.MethodologySubsubheaderText}>
                  COVID-19 vaccinations
                </h3>

                <p>
                  Because there is currently no national vaccine demographic
                  dataset, we combine the best datasets we could find for each
                  geographic level.
                </p>
                <ul>
                  <li>
                    For the national level numbers, we use the{' '}
                    <a href={urlMap.cdcVaxTrends}>
                      CDC vaccine demographic dataset,
                    </a>{' '}
                    which provides data on the race/ethnicity, sex, and age
                    range of vaccine recipients, as well whether they have taken
                    one or two shots.{' '}
                  </li>

                  <li>
                    For the state level we use{' '}
                    <a href={urlMap.kffCovid}>
                      the Kaiser Family Foundation COVID-19 Indicators dataset,
                    </a>{' '}
                    which is a hand-curated dataset based on analysis from state
                    health department websites. It is the only state level
                    demographic vaccine dataset that publishes this data in a
                    usable format. The dataset only provides data on the race
                    and ethnicity of vaccine recipients, and for the majority of
                    states counts individuals who have received at least one
                    shot as vaccinated. It does not include any data for US
                    territories.{' '}
                  </li>
                  <li>
                    For the county level, we could not identify a dataset that
                    provides vaccine demographics, so to show some context we
                    use the{' '}
                    <a href={urlMap.cdcVaxCounty}>
                      COVID-19 Vaccinations in the United States, County dataset
                    </a>{' '}
                    which provides the total number of vaccinations per county.
                  </li>
                </ul>
                <h4> Vaccination population sources </h4>
                <ul>
                  <li>
                    For the national numbers we use the population numbers
                    provided by the CDC, we chose to do this because they
                    include population estimates from <b>Palau</b>,{' '}
                    <b>Micronesia</b>, and the <b>U.S. Marshall Islands,</b>{' '}
                    which are difficult to find estimations for. Furthermore the
                    CDC has estimations for age ranges that the ACS numbers do
                    not readily provide, as they use a per year population
                    estimate from the ACS that we do not use anywhere else and
                    have not added to our system.
                  </li>
                  <li>
                    For the state level, to calculate the total number of
                    vaccinations we use the ACS 2019 estimates of each state’s
                    population. The population counts for each demographic group
                    at the state level are provided by the Kaiser Family
                    Foundation, who researched exactly what the definition of
                    each demographic group in every state is. They provide
                    population estimates for <b>Asian</b>, <b>Black</b>,{' '}
                    <b>White</b>, and <b>Hispanic</b>, so we fill in the ACS
                    2019 estimation for <b>American Indian and Alaska Native</b>
                    , and <b>Native Hawaiian and Pacific Islander</b>. These
                    alternate population comparisons metrics shown with a
                    different color on the disparities bar chart. We are unable
                    to show a population comparison metric for “Unrepresented
                    Race” because we are unsure of the definition in each state.
                  </li>
                  <li>
                    For the county level we use the ACS 2019 population
                    estimations.
                  </li>
                </ul>
                <h4>Vaccination data limitations</h4>
                <ul>
                  <li>
                    <b>New Hampshire</b> lifted its national COVID-19 emergency
                    response declaration in May 2021, which allows vaccine
                    recipients to opt out of having their COVID-19 vaccinations
                    included in the state’s IIS. As such, data submitted by New
                    Hampshire since May 2021 may not be representative of all
                    COVID-19 vaccinations occurring in the state.
                  </li>
                  <li>
                    Some states report race and ethnicity separately, in which
                    case they report unknown percentages separately. In this
                    case, we show the higher of the two metrics on the national
                    map of unknown cases, and display both numbers on the state
                    page.
                  </li>
                  <li>
                    The Kaiser Family Foundation only collects population data
                    for <b>Asian</b>, <b>Black</b>, <b>White</b>, and{' '}
                    <b>Hispanic</b> demographics, limiting their per 100k
                    metrics and what demographic breakdowns we are able to show
                    at the state level.
                  </li>
                  <li>
                    As there is no standardized definition for “vaccinated”, we
                    display vaccination data as “at least one dose” which is
                    used by most states. However, some states including{' '}
                    <b>Arkansas</b>, <b>Illinois</b>, <b>Maine</b>,{' '}
                    <b>New Jersey</b>, and <b>Tennessee</b> report “Total
                    vaccine doses administered”, in which case those numbers are
                    reported.
                  </li>
                </ul>

                <Card elevation={3} className={styles.MissingDataBox}>
                  <MissingCovidVaccinationData />
                </Card>

                <h3 className={styles.MethodologySubsubheaderText}>
                  America’s Health Rankings
                </h3>
                <p>
                  Multiple chronic disease, behavioral health, and social
                  determinants of health in the tracker are sourced from{' '}
                  <a href={urlMap.amr}>America’s Health Rankings (AHR)</a>, who
                  in turn source the majority of their data from the{' '}
                  <a href={urlMap.cdcBrfss}>
                    Behavioral Risk Factor Surveillance System (BRFSS)
                  </a>
                  , a survey run by the CDC, along with supplemental data from{' '}
                  <a href={urlMap.cdcWonder}>CDC WONDER</a> and the{' '}
                  <a href={urlMap.censusVoting}>US Census</a>.
                </p>
                <ul>
                  <li>
                    Because BRFSS is a survey, there are not always enough
                    respondents to provide a statistically meaningful estimate
                    of disease prevalence, especially for smaller and typically
                    marginalized racial groups. Please see the{' '}
                    <a href={urlMap.amrMethodology}>methodology page</a> of
                    America’s Health Rankings for details on data suppression.
                  </li>
                  <li>
                    BRFSS data broken down by race and ethnicity is not
                    available at the county level, so the tracker does not
                    display these conditions at the county level either.
                  </li>
                  <li>
                    All metrics sourced from America’s Health Rankings are
                    calculated based on the rates provided from their
                    downloadable data files:
                    <ul>
                      <li>
                        For most conditions, AHR provides these rates as a
                        percentage, though in some cases they use cases per
                        100,000. If we present the condition using the same
                        units, we simply pass the data along directly. If we
                        need to convert a rate they present as a <b>percent</b>{' '}
                        into a <b>per 100k</b>, we multiply their percent amount
                        by 1,000 to obtain the new per 100k rate.
                        <code>5% (of 100) === 5,000 per 100,000</code>.
                      </li>
                      <li>
                        For COPD, diabetes, frequent mental distress,
                        depression, excessive drinking, asthma, avoided care,
                        and suicide, we source the <b>percent share</b> metrics
                        directly from AHR.
                      </li>
                    </ul>
                  </li>
                </ul>

                <Card elevation={3} className={styles.MissingDataBox}>
                  <MissingAHRData />
                </Card>

                <h3 className={styles.MethodologySubsubheaderText}>
                  Women in legislative office
                </h3>

                <Card elevation={3} className={styles.WhyBox}>
                  <a href={urlMap.doi1}>A link has been established</a> between
                  having women in government and improvements in population
                  health. <a href={urlMap.doi2}>Women in legislative office</a>{' '}
                  have been shown to{' '}
                  <a href={urlMap.doi3}>advocate for policies</a> that pertain
                  to some of the crucial social and political determinants of
                  health that impact the overall health of our nation such as
                  education, poverty, social welfare, reproductive and maternal
                  health, children, and family life. These policies in turn play
                  a significant role in the advancement of health equity for
                  all.
                </Card>

                <p>
                  By leveraging data from the{' '}
                  <a href={urlMap.cawp}>
                    Center for American Women in Politics (CAWP)
                  </a>{' '}
                  we are able to present two primary metrics on these reports:
                </p>
                <ul>
                  <li>
                    The intersectional representation (e.g.{' '}
                    <i>
                      “What percent of all Georgia state legislators are black
                      women?”
                    </i>
                    ).{' '}
                  </li>
                  <li>
                    The race/ethnicity distribution amongst women legislators
                    (e.g.{' '}
                    <i>
                      “What percent of the women in the Georgia State
                      Legislature are black?“
                    </i>
                    ){' '}
                  </li>
                </ul>

                <p>
                  These metrics are calculated for two distinct data types:{' '}
                  <b>Women in State Legislature</b> and{' '}
                  <b>Women in U.S. Congress</b>, and both of these data types
                  are available at the state, territory, and national levels.
                  Our percentage calculations at the national level specifically
                  include legislators from the U.S. territories, which can
                  result in slightly different results than those presented on
                  the CAWP website. All gender and race/ethnicity
                  categorizations are self-reported, and a legislator may be
                  represented in multiple race groupings if that is how they
                  identify.
                </p>

                <p>
                  We are also able to track these rates over time as outlined
                  below. A member is counted towards the numerator any year in
                  which they served even a single day, and similarly counted
                  towards the denominator for U.S. Congress total counts. This
                  results in the "bumpiness" observed as the proportions change
                  incrementally with more persons serving per year than there
                  are available seats. For state legislators, the denominators
                  total counts simply represent the number of seats available,
                  and do not fluctuate with election turnover. While we can
                  track U.S. Congress back to just before the first woman was
                  elected to the U.S. Congress in 1917, we can only track
                  representation in state legislators back to 1983, as that is
                  the furthest back that our data sources reliably provide the
                  denominator used of total state legislators count, per year,
                  per state.
                </p>
                <ul>
                  <li>
                    Historical, intersectional representation (e.g.{' '}
                    <i>
                      “In each year since 1915, what percent of all U.S.
                      Congress members identified as black women?”
                    </i>
                    ). We obtain the historical counts of U.S. Congress members,
                    by year and by state/territory, from the open-source{' '}
                    <a href={urlMap.unitedStatesIo}>@unitedstates project</a>.
                  </li>
                  <li>
                    Historical relative inequity (e.g.{' '}
                    <i>
                      “In each year since 2019, what percent over- or
                      under-represented were black women when compared to their
                      share of represention amongst all women Congress members?”
                    </i>
                    ) Note: we currently track this measure back only to 2019,
                    as we are utilizing the 2019 ACS 5-year estimates for the
                    population comparison metric.{' '}
                  </li>
                </ul>

                <p>
                  Unfortunately CAWP and the U.S. Census use some different
                  race/ethnicity groupings, making direct comparisons and
                  calculations difficult or impossible in some cases. For
                  specific methodology on the race groups collected by CAWP,
                  please <a href={urlMap.cawp}>visit their database directly</a>{' '}
                  . We have made several adjustments to our methods to
                  incorporate these non-standard race groupings when possible:
                </p>

                <ul>
                  <li>
                    Women who identify as multiple specific races are listed
                    multiple times in each corresponding race visualization.
                    Therefore, these race/ethnicity groupings are non-exclusive,
                    and cannot be summed. Additionally, a small number of women
                    identify as the specific race label <b>Multiracial Alone</b>
                    , without specifying the multiple races with which they
                    identify. Both of these multiple-race groups are combined
                    into our <b>Women of two or more races</b> group.
                  </li>
                  <li>
                    The composite race group{' '}
                    <b>
                      American Indian, Alaska Native, Asian & Pacific Islander
                    </b>{' '}
                    is our best attempt to visualize the impact to these
                    under-represented groups; to accurately compare against
                    available population data from the U.S. Census we must
                    further combine these distinct racial identities.
                  </li>
                  <li>
                    There is currently no population data collected by the U.S.
                    Census for <b>Middle Eastern & North African</b>, although
                    this data equity issue has seen{' '}
                    <a
                      href={urlMap.senateMENA}
                      rel="noreferrer"
                      target="_blank"
                    >
                      some progress
                    </a>{' '}
                    in recent decades. Currently, <b>MENA</b> individuals are
                    counted by the ACS as <b>White</b>.
                  </li>
                </ul>
                <Card elevation={3} className={styles.MissingDataBox}>
                  <MissingCAWPData />
                </Card>

                <h3 className={styles.MethodologySubsubheaderText}>HIV</h3>

                <p>
                  The CDC collects and studies information on the number of
                  people diagnosed with HIV in the United States. This
                  information is gathered from state and local HIV surveillance
                  programs and is used to better understand the impact of HIV
                  across the country. To protect people’s privacy, the CDC and
                  these programs have agreed to limit the amount of data
                  released at the state and county levels. It takes 12 months
                  for the data to become official, so the numbers reported
                  before this time are not final and should be interpreted with
                  caution. Additionally, some of the data is adjusted to account
                  for missing information on how people became infected with
                  HIV. This means that the data may change as more information
                  becomes available.
                </p>
                <p>
                  Data for the years 2020, 2021, and 2022 are preliminary. For
                  this reason, we have chosen 2019 as our source year when
                  presenting single-year figures.
                </p>

                <p>
                  <b>HIV Deaths, Diagnosis, & Prevalence</b>
                </p>
                <p>
                  Death data include deaths of persons aged 13 years and older
                  with diagnosed HIV infection or AIDS classification,
                  regardless of the cause of death. Death data are based on a
                  12-month reporting delay to allow data to be reported to CDC.
                  For death data, age is based on the person’s age at the time
                  of death.
                </p>
                <p>
                  HIV diagnoses refer to the number of HIV infections confirmed
                  by laboratory or clinical evidence during a specific calendar
                  year. Diagnoses of HIV infection are counted for individuals
                  who are 13 years of age or older and have received a confirmed
                  diagnosis of HIV during the specified year. For incidence
                  estimates, age is based on the person’s age at infection.
                </p>
                <p>
                  HIV prevalence refers to the estimated number of individuals
                  aged 13 and older living with HIV at the end of the specified
                  year, regardless of when they were infected or whether they
                  received a diagnosis.This measure estimates the burden of HIV
                  in a population.
                </p>
                <ul>
                  <li>
                    All metrics sourced from the CDC for HIV deaths and
                    diagnoses are calculated directly from the raw count of
                    those cases. In contrast, HIV prevalence is determined by
                    estimating the total number of individuals who have ever
                    been infected with HIV (diagnosed and undiagnosed cases) and
                    then adjusting for the reported total number of people
                    diagnosed with HIV and subsequently died provided by the
                    CDC’s Atlas database.
                    <ul>
                      <li>
                        <b>Percent share</b>: To calculate the percent share of
                        HIVdeaths, diagnoses, or prevalence, we divide the
                        number of HIV deaths, diagnoses, or prevalence in a
                        specific demographic group by the total number of HIV
                        deaths, diagnoses, or prevalence and multiply the result
                        by 100.
                      </li>
                      <li>
                        <b>Population percent</b>: The population data is
                        obtained directly from the CDC. To calculate the
                        population percent share, we divide the number of
                        individuals in a specific population by the total number
                        of individuals in the larger population and multiply the
                        result by 100.
                      </li>
                      <li>
                        <b>Rate Per 100k</b>: The rate per 100k for HIV deaths,
                        diagnoses, and prevalence is obtained directly from the
                        CDC. Calculating the rate per 100k of HIV deaths,
                        diagnoses, or prevalence involves dividing the number of
                        deaths, diagnoses, or prevalence within a specific
                        population by the total population of that group,
                        multiplying the result by 100,000, and then expressing
                        it as a rate per 100,000 people.
                      </li>
                    </ul>
                  </li>
                </ul>

                <Card elevation={3} className={styles.MissingDataBox}>
                  <MissingHIVData />
                </Card>

                <p>
                  <b>PrEP Coverage</b>
                </p>
                <p>
                  PrEP coverage, reported as a percentage, is defined as the
                  number of persons aged 16 years and older classified as having
                  been prescribed PrEP during the specified year divided by the
                  estimated annual number of persons aged 16 years and older
                  with indications for PrEP during the specified year.
                </p>
                <p>
                  The percentage of PrEP coverage is an important measure for
                  evaluating the success of PrEP implementation and uptake
                  efforts, as well as for identifying disparities in PrEP access
                  and use among different demographic groups or geographic
                  regions. It can also be used to monitor changes in PrEP
                  coverage over time and to inform targeted interventions to
                  increase PrEP uptake and reduce HIV incidence among high-risk
                  populations. Using PrEP coverage as a percentage helps to
                  convey the actual proportion of individuals who are covered by
                  PrEP relative to the total population of interest. Creating a
                  clear picture of the proportion of individuals who are
                  eligible for PrEP and have access to it.
                </p>
                <p>
                  PrEP coverage is often considered a necessary precursor to
                  PrEP usage. Without adequate PrEP coverage, individuals who
                  are at high risk for HIV may not have access to PrEP or may
                  not be aware of its availability. As a result, PrEP usage may
                  be lower in populations with low PrEP coverage.
                </p>
                <ul>
                  <li>
                    All metrics sourced from the CDC are calculated based on the
                    number of PrEP prescriptions provided by the CDC’s Atlas
                    database.
                    <ul>
                      <li>
                        <b>Percent share</b>: Calculating the percent share of
                        PrEP prescriptions involves dividing the number of PrEP
                        prescriptions filled by a specific population or
                        demographic group by the total number of PrEP
                        prescriptions filled and multiplying the result by 100.
                      </li>
                      <li>
                        <b>PrEP-eligible population percent</b>: Calculating the
                        percent share of the PrEP-eligible population involves
                        dividing the number of individuals within a specific
                        population or demographic group eligible for PrEP by the
                        total number of individuals eligible for PrEP and
                        multiplying the result by 100.
                      </li>
                      <li>
                        <b>PrEP coverage</b>: This percentage is obtained
                        directly from the CDC. It involves dividing the number
                        of individuals within a specific population or
                        demographic group using PrEP at a given time by the
                        total number of individuals in the same population or
                        demographic group eligible for PrEP based on their HIV
                        risk and multiplying the result by 100.
                      </li>
                      <li>
                        <b>Relative Inequity</b>: Calculating the percentage of
                        relative inequity involves subtracting the proportion of
                        all PrEP prescriptions filled by a specific population
                        or group from the proportion of a specific population or
                        group in the PrEP-eligible population. The value is
                        divided by the proportion of a specific population or
                        group in the PrEP-eligible population multiplied by 100
                        to express it as a percentage.
                      </li>
                    </ul>
                  </li>
                </ul>

                <Card elevation={3} className={styles.MissingDataBox}>
                  <MissingPrepData />
                </Card>

                <p>
                  <b>Linkage to Care</b>
                </p>
                <p>
                  Linkage to HIV care, reported as a percentage, refers to the
                  number of persons aged 13 years and older newly diagnosed with
                  HIV, having at least one CD4 or viral load test performed
                  within one month of diagnosis during the specified year and
                  divided by the number of persons aged 13 years and older newly
                  diagnosed with HIV during the specified year.
                </p>
                <p>
                  Linkage to HIV care is a critical step in the HIV care
                  continuum and can improve health outcomes for individuals with
                  HIV. When a person living with HIV is linked to care soon
                  after their diagnosis, they can receive the medical treatment
                  and support they need to manage their HIV, reduce the amount
                  of virus in their body, improve their health, and lower the
                  risk of transmitting HIV to others. Delayed linkage to care
                  can result in poorer health outcomes for individuals living
                  with HIV and can increase the risk of transmitting HIV to
                  others.
                </p>

                <ul>
                  <li>
                    All metrics sourced from the CDC are calculated based on the
                    number of cases of HIV diagnosis where individuals have
                    received at least 1 CD4 or viral load test performed less
                    than one month after diagnosis.
                    <ul>
                      <li>
                        <b>Percent share</b>: Calculating the percent share of
                        individuals who received testing or treatment within a
                        month involves dividing the number of people with access
                        to HIV care by a specific population or demographic
                        group by the total number of people with access to HIV
                        care and multiplying the result by 100.
                      </li>
                      <li>
                        <b>Diagnosed population percent</b>: Calculating the
                        percent share of the population involves dividing the
                        number of individuals within a specific population or
                        demographic group with HIV diagnoses by the total number
                        of individuals with HIV diagnoses and multiplying the
                        result by 100.
                      </li>
                      <li>
                        <b>Linkage to Care</b>: This percentage is obtained
                        directly from the CDC. It involves dividing the number
                        of individuals within a specific population or
                        demographic group with access to care at a given time by
                        the total number of individuals living with HIV in the
                        same population or demographic group and multiplying the
                        result by 100.
                      </li>
                      <li>
                        <b>Relative Inequity</b>: Calculating the percentage of
                        relative inequity involves subtracting the proportion of
                        all individuals with access to care by a specific
                        population or group from the proportion of a specific
                        population or group in the diagnosed population. The
                        value is divided by the proportion of a specific
                        population or group in the diagnosed population
                        multiplied by 100 to express it as a percentage.
                      </li>
                    </ul>
                  </li>
                </ul>

                <h3 className={styles.MethodologySubsubheaderText} id="svi">
                  Social Vulnerability Index (SVI)
                </h3>

                <Card elevation={3} className={styles.WhyBox}>
                  The measurement of social vulnerability grants policymakers,
                  public health officials, and local planners the ability to
                  effectively decide how to best protect their most vulnerable
                  communities in case of a natural disaster or public health
                  crisis. This advances health equity by ensuring that the
                  communities that need resources the most, in times of
                  devastation, receive them.
                </Card>

                <p>
                  Percentile ranking values range from 0 to 1. The scores are
                  given a ranking of low, medium, or high.
                </p>
                <ul>
                  <li>
                    Scores ranging from 0-0.33 are given a{' '}
                    <b>low level of vulnerability.</b>
                  </li>
                  <li>
                    Scores ranging from 0.34-0.66 are given a{' '}
                    <b>medium level of vulnerability.</b>
                  </li>
                  <li>
                    Scores ranging from 0.67-1 are given a{' '}
                    <b>high level of vulnerability.</b>
                  </li>
                </ul>
                <p>
                  Tracts in the top 10%, i.e., at the 90th percentile of values,
                  are given a value of 1 to indicate high vulnerability. Tracts
                  below the 90th percentile are given a value of 0.
                </p>

                <h3 className={styles.MethodologySubsubheaderText}>
                  Incarceration
                </h3>

                <Card elevation={3} className={styles.WhyBox}>
                  <p>
                    Incarceration is influenced by a blend of political forces,
                    laws, and public opinion. Laws that govern sentencing
                    policies and disenfranchisement of convicted felons are some
                    of the political forces that determine voter participation
                    in the justice-involved population.
                  </p>
                  <p>
                    The ability to vote has been described as{' '}
                    <a href={urlMap.repJohnLewisTweet}>
                      the singular most powerful, non-violent tool in American
                      democracy
                    </a>
                    . As of 2020, an estimated 5.17 million people were
                    disenfranchised because of a prior felony conviction with
                    minority populations of voting age being disproportionately
                    represented.{' '}
                    <a href={urlMap.deniedVoting}>(Sentencing Project)</a>
                  </p>
                  <p>
                    <a href={urlMap.aafp}>Studies have also shown</a> that
                    incarceration increases the prevalence of chronic health
                    conditions, infectious diseases such as HIV/ AIDS, mental
                    illnesses and substance use disorders. Incarceration has
                    also been{' '}
                    <a href={urlMap.rwjf}>
                      shown to cause a reduction in life expectancy
                    </a>
                    , with each year spent in prison corresponding to 2 years of
                    reduced life expectancy.
                  </p>
                  <p>
                    The impact of incarceration on the health of the justice
                    involved lingers long after the period of incarceration is
                    over. Upon reentry into society, the lack of adequate access
                    to healthcare and the resources that engender health such as
                    health insurance coverage, housing, employment, the lack of
                    opportunities for upward advancement etc. further
                    exacerbates the health inequities experienced by this group.
                  </p>
                </Card>

                <p>
                  <b>Data Sources</b>
                </p>

                <p>
                  The Bureau of Justice Statistic (BJS) releases a variety of
                  reports on people under correctional control; by combining
                  tables from two of these reports (
                  <a href={urlMap.bjsPrisoners}>“Prisoners in 2020”</a> and{' '}
                  <a href={urlMap.bjsCensusOfJails}>
                    “Census of Jails 2005-2019”
                  </a>
                  ), we are able to generate reports on individuals (including
                  children) incarcerated in <b>Prison</b> and <b>Jail</b> in the
                  United States at a national, state, and territory level.
                  Additionally, the{' '}
                  <a href={urlMap.veraGithub}>Vera Institute for Justice</a> has
                  done extensive research and analysis of the BJS and other data
                  sources to provide county level jail and prison incarceration
                  rates.
                </p>

                <ul>
                  <li>
                    <b>National by Age:</b> Prisoners Table 10
                  </li>

                  <li>
                    <b>State by Age:</b> Prisoners Table 2 (totals only)
                  </li>

                  <li>
                    <b>National by Race:</b> Prisoners Appendix Table 2
                  </li>

                  <li>
                    <b>State by Race:</b> Prisoners Appendix Table 2
                  </li>

                  <li>
                    <b>National by Sex:</b> Prisoners Table 2
                  </li>

                  <li>
                    <b>State by Sex:</b> Prisoners Table 2
                  </li>
                  <li>
                    <b>All State and National Reports:</b> Prisoners Table 13
                    (children in prison alert)
                  </li>
                  <li>
                    <b>All Territories:</b> Prisoners Table 23 (totals only)
                  </li>
                  <li>
                    <b>All County Reports:</b> Vera Incarceration Trends
                  </li>
                </ul>

                <p>
                  <b>Jail</b>
                </p>

                <p>
                  Jail includes all individuals currently confined by a local,
                  adult jail facility, but does not include individuals who are
                  supervised outside of jail or who report only on weekends. In
                  general, jail facilities incarcerate individuals who are
                  awaiting trial or sentencing, or who are sentenced to less
                  than 1 year.
                </p>

                <ul>
                  <li>
                    County reports: Vera data, which we use for our county level
                    reports, restricts both the measured jail population and the
                    relevant total population to individuals aged <b>15-64</b>.
                  </li>
                </ul>

                <p>
                  <b>Prison</b>
                </p>

                <p>
                  In general, prisons incarcerate individuals who have been
                  sentenced to more than 1 year, though in many cases prison can
                  have jurisdictional control of an individual who is confined
                  in a jail facility. Due to this overlap, we are currently
                  unable to present accurate rates of combined incarceration.
                </p>

                <p>
                  Jurisdiction refers to the legal authority of state or federal
                  correctional officials over a incarcerated person, regardless
                  of where they are held. Our ‘Sex’ and ‘Race’ reports present
                  this jurisdictional population, while our ‘Age’ reports (due
                  to the limitations in the data provided by BJS) only display
                  the <b>sentenced</b> jurisdictional population.{' '}
                </p>

                <p>
                  Data presented for prison differs slightly by geographic level
                  and by data type:
                </p>

                <ul>
                  <li>
                    National report: Prison includes all individuals under the
                    jurisdiction of a state or federal adult prison facility in
                    the United States, but not inclusive of territorial,
                    military, or Indian Country facilities. This data is
                    disaggregated by race/ethnicity, age, and sex.
                  </li>

                  <li>
                    State reports: Prison includes all individuals including
                    under the jurisdiction of that state’s adult prison
                    facilities. This data is disaggregated by race/ethnicity and
                    sex, however the BJS Prisoners report does not provide age
                    disaggregation to the state level.
                  </li>
                  <li>
                    Territory reports: All individuals under the jurisdiction of
                    that territory’s adult prison facilities. Because{' '}
                    <b>American Samoa</b> did not report a value for
                    jurisdictional population, we have used their value for
                    custodial population instead. This data is not disaggregated
                    by any demographic breakdown. All incarcerated people in the
                    U.S. territories are counted under <b>Prison</b>.
                  </li>
                  <li>
                    County reports: All individuals under the under the
                    jurisdiction of a state prison system on charges arising
                    from a criminal case in a specific county.
                  </li>
                </ul>

                <p>
                  The race/ethnicity breakdowns provided match those used in the
                  ACS population source, however we do combine the BJS’s{' '}
                  <b>Did not report</b> race values into our <b>Unknown</b> race
                  group.{' '}
                </p>

                <p>
                  <b>Children in Adult Facilities</b>
                </p>
                <p>
                  When presenting incarceration reports, we have chosen to
                  highlight the total number of confined children (in adult
                  facilities), rather than only including this information as
                  our standard “per 100k” rate. This decision was based on
                  several factors:
                </p>

                <ul>
                  <li>
                    The lack of federal law regarding the maximum age of
                    juvenile court jurisdiction and transfer to adult courts
                    coupled with the variance in state-specific laws makes it
                    unfeasible to derive an accurate population base for
                    individuals that may be incarcerated in an adult prison or
                    jail facility. Because of this, any rate calculations for{' '}
                    <b>0-17</b> are comparing the{' '}
                    <b>number of prisoners under 18</b> proportional to the
                    entire population of children down to newborns, resulting in
                    a diluted incidence rate. This can be seen on national and
                    state-level jail reports, as BJS provides these figures
                    directly. In other reports, we have chosen not to calculate
                    the incidence rate and instead rely on the total number of
                    confined children to highlight this health inequity.
                  </li>
                  <li>
                    The prison numbers presented in the BJS Prisoners 2020
                    report for juveniles include <b>confined</b> population
                    (literally held within a specific facility), as opposed to
                    the other prison reports which present the{' '}
                    <b>jurisdictional</b> population (under the control of a
                    facility but potentially confined elsewhere).
                  </li>
                </ul>

                <p>
                  <b>Combined Systems</b>
                </p>

                <p>
                  {CombinedIncarcerationStateMessage()}{' '}
                  {ALASKA_PRIVATE_JAIL_CAVEAT}
                </p>

                <h3 className={styles.MethodologySubsubheaderText}>
                  Visualizations
                </h3>
                <p>
                  Please consider the impact of under-reporting and data gaps
                  when exploring the visualizations. These issues may lead to
                  incorrect conclusions, e.g. low rates in a given location may
                  be due to under-reporting rather than absence of impact.
                </p>
              </div>
            </Grid>

            <Grid
              item
              className={styles.MethodologyQuestionAndAnswer}
              component="article"
            >
              <h2 className={styles.MethodologyQuestion} id="metrics">
                What do the metrics on the tracker mean?
              </h2>
              <div className={styles.MethodologyAnswer}>
                <p>
                  In the definitions below, we use <b>COVID-19 cases</b> as the
                  variable, and <b>race and ethnicity</b> as the demographic
                  breakdown for simplicity; the definitions apply to all
                  variables and demographic breakdowns.
                </p>
                <ul>
                  <li>
                    <b>Total COVID-19 cases per 100k people</b>: The total rate
                    of occurrence of COVID-19 cases expressed per 100,000 people
                    (i.e. 10,000 per 100k implies a 10% occurrence rate). This
                    metric normalizes for population size, allowing for
                    comparisons across demographic groups. This metric is
                    rounded to the nearest integer in the tracker.
                  </li>
                  <li>
                    <b>
                      Share of total COVID-19 cases with unknown race and
                      ethnicity
                    </b>
                    : Within a locale, the percentage of COVID-19 cases that
                    reported unknown race/ethnicity. For example, a value of 20%
                    for Georgia means that 20% of Georgia’s reported cases had
                    unknown race/ethnicity. This metric is rounded to one
                    decimal place. In instances where this would round to 0%,
                    two decimal places are used.
                  </li>
                  <li>
                    <b>Share of total COVID-19 cases</b>: The percentage of all
                    COVID-19 cases that reported a particular race/ethnicity,
                    excluding cases with unknown race/ethnicity. This metric is
                    rounded to one decimal place. In instances where this would
                    round to 0%, two decimal places are used.
                  </li>
                  <li>
                    <b>Population share</b>: The percentage of the total
                    population that identified as a particular race/ethnicity in
                    the ACS survey. This metric is rounded to one decimal place.
                    In instances where this would round to 0%, two decimal
                    places are used.
                  </li>
                  <li>
                    <b>Relative inequity for COVID-19 cases</b>: To demonstrate
                    the often inequitable distribution of a condition or
                    disease, we calculate each demographic group’s relative
                    inequity using the{' '}
                    <code>(OBSERVED - EXPECTED) / EXPECTED</code>. In this case,{' '}
                    <code>OBSERVED</code> is each group's percent share of the
                    condition, and <code>EXPECTED</code> is that group's share
                    of the total population. This calculation is done for every
                    point in time for which we have data, allowing visualization
                    of inequity relative to population, over time.
                    <p>
                      {' '}
                      As an example, if in a certain month White (Non-Hispanic)
                      people in Georgia had 65.7% share of COVID-19 deaths but
                      only 52.7% share of the population, their disproportionate
                      percent share would be <b>+13%</b>:{' '}
                      <code>65.7% - 52.7% = +13%</code>. This value is then
                      divided by the population percent share to give a
                      proportional inequitable burden of <b>+24.7%</b>:{' '}
                      <code>+13% / 52.7% = +24.7%</code>. In plain language,
                      this would be interpreted as{' '}
                      <i>
                        “Deaths of individuals identifying as White, Non
                        Hispanic in Georgia from COVID-19 were almost 25% higher
                        than expected, based on their share of Georgia’s overall
                        population.”
                      </i>
                    </p>
                  </li>
                </ul>
              </div>
            </Grid>
            <Grid
              item
              className={styles.MethodologyQuestionAndAnswer}
              component="article"
            >
              <h2 className={styles.MethodologyQuestion}>
                What do the condition variables on the tracker mean?
              </h2>
              <div className={styles.MethodologyAnswer}>
                <DefinitionsList
                  variablesToDefine={Object.entries(METRIC_CONFIG)}
                />
                <p>
                  Links to the original sources of data and their definitions
                  can be found on our{' '}
                  <Link to={DATA_TAB_LINK}>Data Downloads</Link> page.
                </p>
              </div>
            </Grid>
            <Grid
              item
              className={styles.MethodologyQuestionAndAnswer}
              component="article"
            >
              <h2 className={styles.MethodologyQuestion}>
                What do the race/ethnicity groups mean?
              </h2>
              <div className={styles.MethodologyAnswer}>
                <p>
                  The combined race/ethnicity groups shown on the tracker can be
                  hard to understand, partially due to non-standard
                  race/ethnicity breakdowns across data sources. Generally, all
                  race/ethnicities on the tracker include Hispanic/Latino unless
                  otherwise specified.
                </p>
                <p>
                  We include a few example groups and definitions below. Note
                  that the complete definition of a race/ethnicity can only be
                  understood in the context of a particular dataset and how it
                  classifies race/ethnicity (e.g. the presence of "Other" within
                  a dataset changes who might be classified as "Asian" vs.
                  "Other").
                </p>
                <ul>
                  <li>
                    <b>All</b>: Any race or ethnicity, including unknown
                    race/ethnicity.
                  </li>
                  <li>
                    <b>American Indian and Alaska Native (NH)</b>: A person
                    having origins in any of the original peoples of North and
                    South America (including Central America), who maintains
                    tribal affiliation or community attachment, and who is not
                    Hispanic/Latino.
                  </li>
                  <li>
                    <b>Asian (NH)</b>: A person having origins in any of the
                    original peoples of the Far East, Southeast Asia, or the
                    Indian subcontinent including, for example, Cambodia, China,
                    India, Japan, Korea, Malaysia, Pakistan, the Philippine
                    Islands, Thailand, and Vietnam, and who is not
                    Hispanic/Latino.
                  </li>
                  <li>
                    <b>Black or African American (NH)</b>: A person having
                    origins in any of the Black racial groups of Africa, and who
                    is not Hispanic/Latino.
                  </li>
                  <li>
                    <b>Hispanic/Latino</b>: Any race(s), Hispanic/Latino.
                  </li>
                  <li>
                    <b>Middle Eastern / North African (MENA)</b>: Race/ethnicity
                    grouping collected by CAWP but not currently collected by
                    the U.S. Census.
                  </li>
                  <li>
                    <b>Native Hawaiian or Other Pacific Islander (NH)</b>: A
                    person having origins in any of the original peoples of
                    Hawaii, Guam, Samoa, or other Pacific Islands and who is not
                    Hispanic/Latino.
                  </li>
                  <li>
                    <b>Unrepresented race (NH)</b>: A single race not tabulated
                    by the CDC, not of Hispanic/Latino ethnicity. Individuals
                    not identifying as one of the distinct races listed in the
                    source data, or multiracial individuals, are grouped
                    together as “Some other race”. This is a problem as it
                    obscures racial identity for many individuals. In our effort
                    to take transformative action towards achieving health
                    equity the Satcher Health Leadership Institute has decided
                    to rename this category to highlight it as a health equity
                    issue. For PrEP coverage, Unrepresented race (NH) is used to
                    recognize individuals who do not identify as part of the
                    Black, White, or Hispanic ethnic or racial groups.
                  </li>
                  <li>
                    <b>Two or more races (NH)</b>: Combinations of two or more
                    of the following race categories: "White," "Black or African
                    American," American Indian or Alaska Native," "Asian,"
                    Native Hawaiian or Other Pacific Islander," or "Some Other
                    Race", and who are not Hispanic/Latino.
                  </li>
                  <li>
                    <b>Two or more races & Unrepresented race (NH)</b>: People
                    who are either multiple races or a single race not
                    represented by the data source’s categorization, and who are
                    not Hispanic/Latino.
                  </li>
                  <li>
                    <b>White (NH)</b>: A person having origins in any of the
                    original peoples of Europe, the Middle East, or North
                    Africa, and who is not Hispanic/Latino.
                  </li>
                </ul>
              </div>
            </Grid>

            <Grid
              item
              className={styles.MethodologyQuestionAndAnswer}
              component="article"
            >
              <div className={styles.MethodologyInfoBar}>
                <p>
                  Do you have information on health outcomes at the state and
                  local level that belong in the Health Equity Tracker?
                  <br />
                  <LinkWithStickyParams to={CONTACT_TAB_LINK}>
                    We would love to hear from you!
                  </LinkWithStickyParams>
                </p>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default MethodologyTab
