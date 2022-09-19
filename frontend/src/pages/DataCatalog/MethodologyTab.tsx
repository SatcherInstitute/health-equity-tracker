import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./DataCatalogPage.module.scss";
import { LinkWithStickyParams } from "../../utils/urlutils";
import {
  CONTACT_TAB_LINK,
  EXPLORE_DATA_PAGE_WHAT_DATA_ARE_MISSING_LINK,
  HET_URL,
  DATA_TAB_LINK,
} from "../../utils/internalRoutes";
import { Helmet } from "react-helmet-async";
import { getHtml } from "../../utils/urlutils";
import { selectFaqs } from "../WhatIsHealthEquity/FaqTab";
import { METRIC_CONFIG } from "../../data/config/MetricConfig";
import { Link } from "react-router-dom";
import { Card } from "@material-ui/core";
import { urlMap } from "../../utils/externalUrls";
import DefinitionsList from "../../reports/ui/DefinitionsList";
import { currentYear } from "../../Footer";
import {
  ALASKA_PRIVATE_JAIL_CAVEAT,
  CombinedIncarcerationStateMessage,
} from "../../data/variables/IncarcerationProvider";

export const CITATION_APA = `Health Equity Tracker. (${currentYear()}). Satcher Health Leadership Institute. Morehouse School of Medicine. ${HET_URL}.`;

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
              <h3 id="main" className={styles.MethodologyQuestion}>
                Recommended Citation (APA) for the Health Equity Tracker:
              </h3>

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
              <h3 className={styles.MethodologyQuestion}>{selectFaqs[4].q}</h3>
              <div className={styles.MethodologyAnswer}>
                {<>{getHtml(selectFaqs[4].a)}</>}
              </div>
            </Grid>

            <Grid
              item
              className={styles.MethodologyQuestionAndAnswer}
              component="article"
            >
              <h3 className={styles.MethodologyQuestion}>
                What are the limitations of the tracker, and why were these
                health equity topics chosen?
              </h3>
              <div className={styles.MethodologyAnswer}>
                <h4 className={styles.MethodologySubsubheaderText}>COVID-19</h4>
                <p>
                  For a description of some of the gaps in COVID-19 data, please
                  see the{" "}
                  <Link to={EXPLORE_DATA_PAGE_WHAT_DATA_ARE_MISSING_LINK}>
                    What Data Are Missing
                  </Link>{" "}
                  section. Here, we provide further details:
                </p>
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
                    population for each respective measure. See the 'What data
                    are missing' section for further details.
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
                    dataset vs other sources, such as the New York Times. Data
                    for a state are suppressed if the aggregate counts for that
                    state are &lt; 5% of the source being used for comparison.
                    These analyses are available for{" "}
                    <a href={urlMap.shliGitHubSuppressCovidCases}>cases</a> and{" "}
                    <a href={urlMap.shliGitHubSuppressCovidDeaths}>deaths</a>.
                  </li>
                  <li>
                    The underlying data is reported at the case-level, so we
                    cannot determine whether a state/county lacking cases for a
                    particular demographic group truly has zero cases for that
                    group or whether that that locale fails to report
                    demographics correctly.
                  </li>
                </ul>

                <h4 className={styles.MethodologySubsubheaderText}>
                  COVID-19 Vaccinations
                </h4>
                <p>
                  Because there is currently no national vaccine demographic
                  dataset, we combine the best datasets we could find for each
                  geographic level.
                </p>
                <ul>
                  <li>
                    For the national level numbers, we use the{" "}
                    <a href={urlMap.cdcVaxTrends}>
                      CDC vaccine demographic dataset,
                    </a>{" "}
                    which provides data on the race/ethnicity, sex, and age
                    range of vaccine recipients, as well whether they have taken
                    one or two shots.{" "}
                  </li>

                  <li>
                    For the state level we use{" "}
                    <a href={urlMap.kffCovid}>
                      the Kaiser Family Foundation COVID-19 Indicators dataset,
                    </a>{" "}
                    which is a hand-curated dataset based on analysis from state
                    health department websites. It is the only state level
                    demographic vaccine dataset that publishes this data in a
                    usable format. The dataset only provides data on the race
                    and ethnicity of vaccine recipients, and for the majority of
                    states counts individuals who have received at least one
                    shot as vaccinated. It does not include any data for US
                    territories.{" "}
                  </li>
                  <li>
                    For the county level, we could not identify a dataset that
                    provides vaccine demographics, so to show some context we
                    use the{" "}
                    <a href={urlMap.cdcVaxCounty}>
                      COVID-19 Vaccinations in the United States, County dataset
                    </a>{" "}
                    which provides the total number of vaccinations per county.
                  </li>
                </ul>
                <h4 className={styles.MethodologySubsubheaderText}>
                  {" "}
                  Vaccination Population Sources{" "}
                </h4>
                <ul>
                  <li>
                    For the national numbers we use the population numbers
                    provided by the CDC, we chose to do this because they
                    include population estimates from <b>Palau</b>,{" "}
                    <b>Micronesia</b>, and the <b>U.S. Marshall Islands,</b>{" "}
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
                    population estimates for <b>Asian</b>, <b>Black</b>,{" "}
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
                <h4 className={styles.MethodologySubsubheaderText}>
                  {" "}
                  Vaccination Data Limitations{" "}
                </h4>
                <ul>
                  <li>
                    <b>Texas</b> does not report demographic-specific dose
                    number information to CDC, so data for Texas are not
                    represented in the figures and calculations on the national
                    vaccine demographic page.
                  </li>
                  <li>
                    <b>Idaho</b> provides vaccine data only for vaccine
                    recipients who are 18 years and older in line with state
                    laws. COVID vaccination administration data is unavailable
                    for the Vaccinations in the US, and Vaccinations by County
                    pages for the population aged less than 18 years. This only
                    affects the national numbers.
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
                    for <b>Asian</b>, <b>Black</b>, <b>White</b>, and{" "}
                    <b>Hispanic</b> demographics, limiting their per 100k
                    metrics and what demographic breakdowns we are able to show
                    at the state level.
                  </li>
                  <li>
                    As there is no standardized definition for “vaccinated”, we
                    display vaccination data as “at least one dose” which is
                    used by most states. However, some states including{" "}
                    <b>Arkansas</b>, <b>Illinois</b>, <b>Maine</b>,{" "}
                    <b>New Jersey</b>, and <b>Tennessee</b> report “Total
                    vaccine doses administered”, in which case those numbers are
                    reported.
                  </li>
                </ul>

                <h4 className={styles.MethodologySubsubheaderText}>
                  America's Health Rankings
                </h4>
                <p>
                  Multiple chronic disease, behavioral health, and social
                  determinants of health in the tracker are sourced from{" "}
                  <a href={urlMap.amr}>America's Health Rankings</a>, who in
                  turn source the majority of their data from the{" "}
                  <a href={urlMap.cdcBrfss}>
                    Behavioral Risk Factor Surveillance System (BRFSS)
                  </a>
                  , a survey run by the CDC, along with supplemental data from{" "}
                  <a href={urlMap.cdcWonder}>CDC WONDER</a> and the{" "}
                  <a href={urlMap.censusVoting}>US Census</a>.
                </p>
                <ul>
                  <li>
                    Because BRFSS is a survey, there are not always enough
                    respondents to provide a statistically meaningful estimate
                    of disease prevalence, especially for smaller and typically
                    marginalized racial groups. Please see the{" "}
                    <a href={urlMap.amrMethodology}>methodology page</a> of
                    America's Health Rankings for details on data suppression.
                  </li>
                  <li>
                    BRFSS data broken down by race and ethnicity is not
                    available at the county level, so the tracker does not
                    display these conditions at the county level either.
                  </li>
                  <li>
                    All metrics sourced from America's Health Rankings are
                    calculated based on prevalance rates provided from their
                    data API:
                    <ul>
                      <li>
                        To calculate the <b>per 100k</b> metrics seen on the
                        tracker, we either multiply the rate by 1000 if it is
                        presented as a percentage, or simply display the exact
                        metric if it is presented as a per 100k in the data API.
                      </li>
                      <li>
                        We have chosen to not show any <b>percent share</b>{" "}
                        metrics for these conditions because the source only
                        provides the metrics as rates.
                      </li>
                    </ul>
                  </li>
                </ul>

                <h4 className={styles.MethodologySubsubheaderText}>
                  Women in Legislative Office
                </h4>

                <p>
                  <a href={urlMap.doi1}>A link has been established</a> between
                  having women in government and improvements in population
                  health. <a href={urlMap.doi2}>Women in legislative office</a>{" "}
                  have been shown to{" "}
                  <a href={urlMap.doi3}>advocate for policies</a> that pertain
                  to some of the crucial social and political determinants of
                  health that impact the overall health of our nation such as
                  education, poverty, social welfare, reproductive and maternal
                  health, children, and family life. These policies in turn play
                  a significant role in the advancement of health equity for
                  all. By combining data from the{" "}
                  <a href={urlMap.cawp}>
                    Center for American Women in Politics (CAWP)
                  </a>{" "}
                  with data from <a href={urlMap.propublica}>ProPublica</a>, we
                  are able to present two distinct metrics on these reports:
                </p>
                <ul>
                  <li>
                    The race/ethnicity distribution or “percent share” of women
                    (e.g. "What percent of women in the Georgia State
                    Legislature are black?"){" "}
                  </li>

                  <li>
                    The intersectional representation (e.g. "What percent of all
                    Georgia state legislators are black women?").{" "}
                  </li>
                </ul>

                <p>
                  These metrics are calculated for two distinct data types:
                  <b>Women in State Legislature</b>, and{" "}
                  <b>Women in U.S. Congress</b>, and both of these data types
                  are currently available at the state, territory, and national
                  levels. Our percentage calculations at the national level
                  specifically include legislators from the U.S. territories,
                  which can result in slightly different results than those
                  presented on the CAWP website. Additionally, our "total
                  legislator" count for U.S. Congress only includes actively
                  seated legislators, as opposed to the total number of seats
                  which are not always filled. All gender and race/ethnicity
                  categorizations are self-reported, and a legislator may be
                  represented in multiple race groupings if that is how they
                  identify.
                </p>

                <h4 className={styles.MethodologySubsubheaderText} id="svi">
                  Social Vulnerability Index
                </h4>
                <p>
                  The measurement of social vulnerability grants policymakers,
                  public health officials, and local planners the ability to
                  effectively decide how to best protect their most vulnerable
                  communities in case of a natural disaster or public health
                  crisis. This advances health equity by ensuring that the
                  communities that need resources the most, in times of
                  devastation, receive them.
                </p>
                <p>
                  Percentile ranking values range from 0 to 1. The scores are
                  given a ranking of low, medium, or high.
                </p>
                <ul>
                  <li>
                    Scores ranging from 0-0.33 are given a{" "}
                    <b>low level of vulnerability.</b>
                  </li>
                  <li>
                    Scores ranging from 0.34-0.66 are given a{" "}
                    <b>medium level of vulnerability.</b>
                  </li>
                  <li>
                    Scores ranging from 0.67-1 are given a{" "}
                    <b>high level of vulnerability.</b>
                  </li>
                </ul>
                <p>
                  Tracts in the top 10%, i.e., at the 90th percentile of values,
                  are given a value of 1 to indicate high vulnerability. Tracts
                  below the 90th percentile are given a value of 0.
                </p>

                <h4 className={styles.MethodologySubsubheaderText}>
                  Incarceration
                </h4>

                <p>
                  Incarceration is influenced by a blend of political forces,
                  laws, and public opinion. Laws that govern sentencing policies
                  and disenfranchisement of convicted felons are some of the
                  political forces that determine voter participation in the
                  justice-involved population.
                </p>
                <p>
                  The ability to vote has been described as{" "}
                  <a href={urlMap.repJohnLewisTweet}>
                    the singular most powerful, non-violent tool in American
                    democracy
                  </a>
                  . As of 2020, an estimated 5.17 million people were
                  disenfranchised because of a prior felony conviction with
                  minority populations of voting age being disproportionately
                  represented.{" "}
                  <a href={urlMap.deniedVoting}>(Sentencing Project)</a>
                </p>
                <p>
                  <a href={urlMap.aafp}>Studies have also shown</a> that
                  incarceration increases the prevalence of chronic health
                  conditions, infectious diseases such as HIV/ AIDS, mental
                  illnesses and substance use disorders. Incarceration has also
                  been{" "}
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
                  opportunities for upward advancement etc. further exacerbates
                  the health inequities experienced by this group.
                </p>

                <p>
                  <b>Data Sources</b>
                </p>

                <p>
                  The Bureau of Justice Statistic (BJS) releases a variety of
                  reports on people under correctional control; by combining
                  tables from two of these reports (
                  <a href={urlMap.bjsPrisoners}>“Prisoners in 2020”</a> and{" "}
                  <a href={urlMap.bjsCensusOfJails}>
                    “Census of Jails 2005-2019”
                  </a>
                  ), we are able to generate reports on individuals (including
                  children) incarcerated in <b>Prison</b> and <b>Jail</b> in the
                  United States at a national, state, and territory level.
                  Additionally, the{" "}
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
                  the <b>sentenced</b> jurisdictional population.{" "}
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
                    under the jurisdiction of that state's adult prison
                    facilities. This data is disaggregated by race/ethnicity and
                    sex, however the BJS Prisoners report does not provide age
                    disaggregation to the state level.
                  </li>
                  <li>
                    Territory reports: All individuals under the jurisdiction of
                    that territory's adult prison facilities. Because{" "}
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
                  ACS population source, however we do combine the BJS's{" "}
                  <b>Did not report</b> race values into our <b>Unknown</b> race
                  group.{" "}
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
                    jail facility. Because of this, any rate calculations for{" "}
                    <b>0-17</b> are comparing the{" "}
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
                    the other prison reports which present the{" "}
                    <b>jurisdictional</b> population (under the control of a
                    facility but potentially confined elsewhere).
                  </li>
                </ul>

                <p>
                  <b>Combined Systems</b>
                </p>

                <p>
                  {CombinedIncarcerationStateMessage()}{" "}
                  {ALASKA_PRIVATE_JAIL_CAVEAT}
                </p>

                <h4 className={styles.MethodologySubsubheaderText}>
                  Visualizations
                </h4>
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
              <h3 className={styles.MethodologyQuestion} id="metrics">
                What do the metrics on the tracker mean?
              </h3>
              <div className={styles.MethodologyAnswer}>
                <p>
                  In the definitions below, we use COVID-19 Cases as the
                  variable, and Race and Ethnicity as the demographic breakdown
                  for simplicity; the definitions apply to all variables and
                  demographic breakdowns.
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
                    for Georgia means that 20% of Georgia's reported cases had
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
                    <b>Inequitable burden of COVID-19 cases over time</b>: To
                    demonstrate the often inequitable distribution of a
                    condition or disease, we calculate each demographic group's
                    disproportionate percent share of that condition and present
                    it as a proportion to that demographic group's share of the
                    entire population. This calculation is done for every point
                    in time for which we have data, and displayed over time to
                    show trends in inequity.
                    <p>
                      {" "}
                      As an example, if in a certain month White (Non-Hispanic)
                      people in Georgia had 65.7% share of COVID-19 deaths but
                      only 52.7% share of the population, their disproportionate
                      percent share would be <b>+13%</b>:{" "}
                      <code>65.7% - 52.7% = +13%</code>. This value is then
                      divided by the population percent share to give a
                      proportional inequitable burden of <b>+24.7%</b>:{" "}
                      <code>+13% / 52.7% = +24.7%</code>. In plain language,
                      this would be interpretted as “White deaths in Georgia
                      from COVID-19 were almost 25% higher than expected, based
                      on their share of Georgia's overall population.”
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
              <h3 className={styles.MethodologyQuestion}>
                What do the condition variables on the tracker mean?
              </h3>
              <div className={styles.MethodologyAnswer}>
                <DefinitionsList
                  variablesToDefine={Object.entries(METRIC_CONFIG)}
                />
                <p>
                  Links to the original sources of data and their definitions
                  can be found on our{" "}
                  <Link to={DATA_TAB_LINK}>Data Downloads</Link> page.
                </p>
              </div>
            </Grid>
            <Grid
              item
              className={styles.MethodologyQuestionAndAnswer}
              component="article"
            >
              <h3 className={styles.MethodologyQuestion}>
                What do the race/ethnicity groups mean?
              </h3>
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
                  a dataset changes who might be classified as "Asian" vs
                  "Other").
                </p>
                <ul>
                  <li>
                    <b>All</b>: Any race or ethnicity, including unknown
                    race/ethnicity.
                  </li>
                  <li>
                    <b>American Indian and Alaska Native (Non-Hispanic)</b>: A
                    person having origins in any of the original peoples of
                    North and South America (including Central America), who
                    maintains tribal affiliation or community attachment, and
                    who is not Hispanic/Latino.
                  </li>
                  <li>
                    <b>Asian (Non-Hispanic)</b>: A person having origins in any
                    of the original peoples of the Far East, Southeast Asia, or
                    the Indian subcontinent including, for example, Cambodia,
                    China, India, Japan, Korea, Malaysia, Pakistan, the
                    Philippine Islands, Thailand, and Vietnam, and who is not
                    Hispanic/Latino.
                  </li>
                  <li>
                    <b>Black or African American (Non-Hispanic)</b>: A person
                    having origins in any of the Black racial groups of Africa,
                    and who is not Hispanic/Latino.
                  </li>
                  <li>
                    <b>Hispanic/Latino</b>: Any race(s), Hispanic/Latino.
                  </li>
                  <li>
                    <b>
                      Native Hawaiian or Other Pacific Islander (Non-Hispanic)
                    </b>
                    : A person having origins in any of the original peoples of
                    Hawaii, Guam, Samoa, or other Pacific Islands and who is not
                    Hispanic/Latino.
                  </li>
                  <li>
                    <b>Unrepresented race (Non-Hispanic)</b>: A single race not
                    tabulated by the CDC, not of Hispanic/Latino ethnicity.
                    Individuals not identifying as one of the distinct races
                    listed in the source data, or multiracial individuals, are
                    grouped together as “Some other race”. This is a problem as
                    it obscures racial identity for many individuals. In our
                    effort to take transformative action towards achieving
                    health equity the Satcher Health Leadership Institute has
                    decided to rename this category to highlight it as a health
                    equity issue.
                  </li>
                  <li>
                    <b>Two or more races (Non-Hispanic)</b>: Combinations of two
                    or more of the following race categories: "White," "Black or
                    African American," American Indian or Alaska Native,"
                    "Asian," Native Hawaiian or Other Pacific Islander," or
                    "Some Other Race", and who are not Hispanic/Latino.
                  </li>
                  <li>
                    <b>Two or more races & Unrepresented race (Non-Hispanic)</b>
                    : People who are either multiple races or a single race not
                    represented by the data source's categorization, and who are
                    not Hispanic/Latino.
                  </li>
                  <li>
                    <b>White (Non-Hispanic)</b>: A person having origins in any
                    of the original peoples of Europe, the Middle East, or North
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
              <h3 className={styles.MethodologyQuestion}>
                What data is missing?
              </h3>
              <div className={styles.MethodologyAnswer}>
                <p>
                  Our tracker will expand to include additional health
                  variables, social and political determinants of health.
                </p>
              </div>
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
  );
}

export default MethodologyTab;
