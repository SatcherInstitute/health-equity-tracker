import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./DataCatalogPage.module.scss";
import {
  LinkWithStickyParams,
  TAB_PARAM,
  ABOUT_US_PAGE_LINK,
  EXPLORE_DATA_PAGE_WHAT_DATA_ARE_MISSING_LINK,
} from "../../utils/urlutils";
import { ABOUT_US_CONTACT_TAB_INDEX } from "../AboutUs/AboutUsPage";
import { Helmet } from "react-helmet";

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
                How did you acquire and standardize the data?
              </h2>
              <div className={styles.MethodologyAnswer}>
                <ul>
                  <li>
                    Our data is retrieved via a mix of APIs and manual downloads
                  </li>
                  <li>
                    Once acquired, this data is converted to tables in Google
                    BigQuery
                  </li>
                  <li>
                    During this process, values are standardized and normalized
                    to facilitate reporting, comparison and visualization
                  </li>
                  <li>
                    Sources are refreshed when update notifications are received
                  </li>
                </ul>
              </div>
            </Grid>
            <Grid item xs={12} className={styles.MethodologyQuestionAndAnswer}>
              <h2 className={styles.MethodologyQuestion}>
                What are the limitations of the tracker?
              </h2>
              <div className={styles.MethodologyAnswer}>
                <h3 className={styles.MethodologySubheaderText}>Data</h3>

                <h4 className={styles.MethodologySubsubheaderText}>COVID-19</h4>
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

                <h4 className={styles.MethodologySubsubheaderText}>
                  Diabetes & COPD
                </h4>
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
                <ul>
                  <li>
                    The national-level map projection and rendering software
                    used in the tracker (
                    <a href="https://vega.github.io/vega-lite/docs/projection.html">
                      Vega, with the albersUsa projection
                    </a>
                    ) currently cannot display territories such as Puerto Rico
                    on the national-level USA map. Searching directly for each
                    territory displays a map for the territory itself.
                  </li>
                  <li>
                    Please consider the impact of under-reporting and data gaps
                    when exploring the visualizations. These issues may lead to
                    incorrect conclusions, e.g. low rates in a given location
                    may be due to under-reporting rather than absence of impact.
                  </li>
                </ul>
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
                    to={`${ABOUT_US_PAGE_LINK}?${TAB_PARAM}=${ABOUT_US_CONTACT_TAB_INDEX}`}
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
