import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./DataCatalogPage.module.scss";
import {
  LinkWithStickyParams,
  CONTACT_TAB_LINK,
  EXPLORE_DATA_PAGE_WHAT_DATA_ARE_MISSING_LINK,
} from "../../utils/urlutils";
import { Helmet } from "react-helmet";
import parse from "html-react-parser";
import { selectFaqs } from "../WhatIsHealthEquity/FaqTab";

export const CITATION_CHICAGO =
  "Health Equity Tracker. (2021). Satcher Health Leadership Institute. Morehouse School of Medicine. https://healthequitytracker.org.";

function MethodologyTab() {
  return (
    <>
      <Helmet>
        <title>Methodology - Health Equity Tracker</title>
      </Helmet>
      <h1 className={styles.ScreenreaderTitleHeader}>Methodology</h1>
      <Grid
        container
        className={styles.Grid}
        direction="column"
        justify="space-around"
        alignItems="center"
      >
        <Grid item xs={12} sm={12} md={9}>
          <Grid container className={styles.MethodologySection}>
            <Grid item xs={12} className={styles.MethodologyQuestionAndAnswer}>
              <h2
                id="main"
                tabIndex={-1}
                className={styles.MethodologyQuestion}
              >
                Recommended Citation for the Health Equity Tracker:
              </h2>
              <div className={styles.MethodologyAnswer}>
                <p>{CITATION_CHICAGO}</p>
              </div>
            </Grid>
            <Grid item xs={12} className={styles.MethodologyQuestionAndAnswer}>
              <h2 tabIndex={-1} className={styles.MethodologyQuestion}>
                {selectFaqs[4].q}
              </h2>
              <div className={styles.MethodologyAnswer}>
                {<>{parse(selectFaqs[4].a)}</>}
              </div>
            </Grid>

            <Grid item xs={12} className={styles.MethodologyQuestionAndAnswer}>
              <h2 className={styles.MethodologyQuestion}>
                What are the limitations of the tracker?
              </h2>
              <div className={styles.MethodologyAnswer}>
                <h3 className={styles.MethodologySubsubheaderText}>COVID-19</h3>
                <p>
                  For a description of some of the gaps in COVID-19 data, please
                  see the{" "}
                  <a href={EXPLORE_DATA_PAGE_WHAT_DATA_ARE_MISSING_LINK}>
                    "What Data Are Missing" section.
                  </a>{" "}
                  Here, we provide further details:
                </p>
                <ul>
                  <li>
                    National statistics are aggregations of state-wide data. If
                    state data is not available, these aggregations may be
                    incomplete and potentially skewed.
                  </li>
                  <li>
                    When calculating national-level per100K COVID-19 rates, we
                    do not include the population of states whose data are
                    suppressed as part of the total population. See the 'What
                    data are missing' section for further details.
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
                    <a href="https://satcherinstitute.github.io/analysis/cdc_case_data">
                      cases
                    </a>{" "}
                    and{" "}
                    <a href="https://satcherinstitute.github.io/analysis/cdc_death_data">
                      deaths
                    </a>
                    .
                  </li>
                  <li>
                    The underlying data is reported at the case-level, so we
                    cannot determine whether a state/county lacking cases for a
                    particular demographic group truly has zero cases for that
                    group or whether that that locale fails to report
                    demographics correctly.
                  </li>
                </ul>

                <h3 className={styles.MethodologySubsubheaderText}>
                  COVID-19 Vaccinations
                </h3>
                <p>
                  Because there is no national vaccine demographic dataset, we
                  made the decision to combine the best datasets we could find
                  for each geographic level. For the national level numbers, we
                  use the{" "}
                  <a href="https://covid.cdc.gov/covid-data-tracker/#vaccination-demographics-trends">
                    CDC vaccine demographic dataset,
                  </a>{" "}
                  which provides data on the race/ethnicity, sex, and age range
                  of vaccine recipients, as well whether they have taken one or
                  two shots. For state level we decided to use{" "}
                  <a href="https://www.kff.org/state-category/covid-19/">
                    the Kaiser Family Foundation COVID-19 Indicators dataset,
                  </a>{" "}
                  which is a hand curated dataset based on analysis from state
                  health department websites. We decided to use this because it
                  is the only state level demographic vaccine dataset that
                  publishes the data in a usable format. This dataset only
                  provides data on the race and ethnicity of vaccine recipients,
                  and only has data on at least one shot. It does not include
                  any demographic data for US territories. Finally, we could not
                  identify a dataset that provides vaccine demographics at the
                  county level, so we decided to use the{" "}
                  <a href="https://data.cdc.gov/Vaccinations/COVID-19-Vaccinations-in-the-United-States-County/8xkx-amqh">
                    COVID-19 Vaccinations in the United States, County dataset
                  </a>{" "}
                  which only provides the total number of vaccinations per
                  county to show context.
                </p>
                <h4> Vaccination Population Sources </h4>
                <ul>
                  <li>
                    For the county level we use the ACS 2019 population
                    estimations.
                  </li>
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
                    To calculate the total number of vaccinations at the state
                    level, we use the ACS 2019 estimates of each state’s
                    population. The population counts for each demographic group
                    at the state level are provided by the Kaiser Family
                    Foundation, who researched exactly what the definition of
                    each demographic group in every state is. They provided
                    population estimates for Asian, Black, White, and Hisapnic,
                    so we fill in the ACS 2019 estimation for American Indian
                    and Alaska Native and Native Hawaiian and Pacific Islander.
                    which are shown with a lighter green color on the
                    disparities bar chart. We are unable to show a population
                    comparison metric for “Some Other Race” because we are
                    unsure of the definition in each state.
                  </li>
                </ul>
                <h4> Vaccination Data Limitations </h4>
                <ul>
                  <li>
                    <b>Texas</b> does not report demographic-specific dose
                    number information to CDC, so data for Texas are not
                    represented in the figures and calculations on the national
                    vaccine demographic page.
                  </li>
                  <li>
                    Idaho provides vaccine data only for vaccine recipients who
                    are 18 years and older in line with state laws. COVID
                    vaccination administration data is unavailable for the
                    Vaccinations in the US, and Vaccinations by County pages for
                    the population aged less than 18 years. This only affects
                    the national numbers.
                  </li>
                  <li>
                    Some states report race and ethnicity separately, in which
                    case they report unknown percentages separately. In this
                    case, we show the higher of the two metrics on the national
                    map of unknown cases, and display both numbers on the state
                    page.
                  </li>
                  <li>
                    Because the Kaiser Family Foundation only collects
                    population data for Asian, Black, White, and Hispanic
                    demographics, they only provide the per 100k metric for
                    those four races, which is all we are able to show at the
                    state level.
                  </li>
                  <li>
                    All vaccination data is shown as “at least one dose”, except
                    for some states which only provide numbers of fully
                    vaccinated individuals, in which case those numbers are
                    shown.
                  </li>
                </ul>

                <h3 className={styles.MethodologySubsubheaderText}>
                  Diabetes & COPD
                </h3>
                <p>
                  Diabetes & COPD data in the tracker is sourced from{" "}
                  <a href="https://www.americashealthrankings.org/explore/annual/measure/Overall_a/state/ALL">
                    America's Health Rankings
                  </a>
                  , who in turn source their diabetes & COPD data from the{" "}
                  <a href="https://www.cdc.gov/brfss/index.html">
                    Behavioral Risk Factor Surveillance System (BRFSS)
                  </a>
                  , a survey run by the CDC.
                </p>
                <ul>
                  <li>
                    Because BRFSS is a survey, there are not always enough
                    respondents to provide a statistically meaningful estimate
                    of disease prevalence, especially for smaller and typically
                    marginalized racial groups. Please see the{" "}
                    <a href="https://www.americashealthrankings.org/about/methodology/data-sources-and-measures">
                      methodology page
                    </a>{" "}
                    of America's Health Rankings for details on data
                    suppression.
                  </li>
                  <li>
                    BRFSS data broken down by race and ethnicity is not
                    available at the county level, so the tracker does not
                    display diabetes or COPD data at the county level either.
                  </li>
                </ul>

                <h3 className={styles.MethodologySubheaderText}>
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
            <Grid item xs={12} className={styles.MethodologyQuestionAndAnswer}>
              <h2 className={styles.MethodologyQuestion}>
                What data is missing?
              </h2>
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
                  <LinkWithStickyParams
                    className={styles.MethodologyContactUsLink}
                    to={`${CONTACT_TAB_LINK}`}
                  >
                    We would love to hear from you!
                  </LinkWithStickyParams>
                </p>
              </div>
            </Grid>
            <Grid item xs={12} className={styles.MethodologyQuestionAndAnswer}>
              <h2 className={styles.MethodologyQuestion}>
                What do the metrics on the tracker mean?
              </h2>
              <div className={styles.MethodologyAnswer}>
                <p>
                  None of the metrics/data shown on the tracker are
                  age-adjusted. Showing non-adjusted data can mask disparities
                  and are we working to use age-adjusted data instead.
                </p>
                <p>
                  In the definitions below, we use COVID-19 Cases as the
                  variable, and Race and Ethnicity as the demographic breakdown
                  for simplicity; the definitions apply to all variables and
                  demographic breakdowns.
                </p>
                <ul>
                  <li>
                    <b>Total COVID-19 cases per 100K people</b>: The total rate
                    of occurrence of COVID-19 cases expressed per 100,000 people
                    (i.e. 10,000 per 100K implies a 10% occurrence rate). This
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
            <Grid item xs={12} className={styles.MethodologyQuestionAndAnswer}>
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
                    <b>Some other race (Non-Hispanic)</b>: A single race (some
                    other race), not Hispanic/Latino. The definition of "some
                    other race" is dependent on what other race categories exist
                    in the dataset.
                  </li>
                  <li>
                    <b>Two or more races & Some other race (Non-Hispanic)</b>:
                    People who are either multiple races or some other race, and
                    not Hispanic/Latino.
                  </li>
                  <li>
                    <b>Black or African American</b>: A single race (African
                    American), including those who identify as African American
                    and Hispanic/Latino.
                  </li>
                </ul>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default MethodologyTab;
