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
import { Card } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { Link } from "react-router-dom";
import { urlMap } from "../../utils/externalUrls";
import DefinitionsList from "../../reports/ui/DefinitionsList";
import { currentYear } from "../../Footer";

export const CITATION_APA = `Health Equity Tracker. (${currentYear()}). Satcher Health Leadership Institute. Morehouse School of Medicine. ${HET_URL}.`;

function MethodologyTab() {
  const { enqueueSnackbar } = useSnackbar();

  function handleCopy() {
    enqueueSnackbar("Citation Copied.");
  }

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
                    population of states that do not have a suppressed case
                    count as part of the total population. See the 'What data
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
              <h3 className={styles.MethodologyQuestion}>
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
                    <b>Asian (Non-Hispanic)</b>: A single race (Asian), not
                    Hispanic/Latino.
                  </li>
                  <li>
                    <b>Hispanic/Latino</b>: Any race(s), Hispanic/Latino.
                  </li>
                  <li>
                    <b>Black or African American</b>: A single race (African
                    American), including those who identify as African American
                    and Hispanic/Latino.
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
                    <b>Two or more races (Non-Hispanic)</b>: Multiple races, not
                    Hispanic/Latino.
                  </li>
                  <li>
                    <b>Two or more races & Unrepresented race (Non-Hispanic)</b>
                    : People who are either multiple races or a single race not
                    represented by the data source's categorization, and who are
                    not Hispanic/Latino.
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
