import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./DataCatalogPage.module.scss";
import {
  LinkWithStickyParams,
  TAB_PARAM,
  ABOUT_US_PAGE_LINK,
} from "../../utils/urlutils";
import { ABOUT_US_CONTACT_TAB_INDEX } from "../AboutUs/AboutUsPage";

function MethodologyTab() {
  return (
    <>
      <title>Methodology - Health Equity Tracker</title>
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
                How did you ingest and standardize the data?
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
                  {/* TODO - this should really be a button... */}
                  For a description of some of the gaps in COVID-19 data, please
                  see the "What Data Are Missing" section on the "Explore the
                  Data" page. Here, we provide further details:
                </p>
                <ul>
                  <li>
                    National statistics are aggregations of state-wide data. If
                    state data is not available, these aggregations may be
                    incomplete and potentially skewed.
                  </li>
                  <li>
                    As the underlying dataset is at the case-level, we are
                    unable to distinguish between a given state/county not
                    reporting data for a particular demographic group vs. the
                    state/county legitimately having zero cases for that group.
                  </li>
                  <li>
                    To protect the privacy of affected individuals, COVID-19
                    data may be hidden in counties with smaller numbers of
                    COVID-19 cases, hospitalizations and deaths.
                  </li>
                  <li>
                    Decisions to suppress COVID-19 data for particular states in
                    the tracker are evaluated by comparing the aggregate case,
                    death, and hospitalization counts in the CDC surveillance
                    dataset vs other sources, such as the New York Times. These
                    analyses are available for{" "}
                    <a href="https://satcherinstitute.github.io/analysis/cdc_case_data">
                      cases
                    </a>{" "}
                    and{" "}
                    <a href="https://satcherinstitute.github.io/analysis/cdc_death_data">
                      deaths
                    </a>
                    .
                  </li>
                </ul>

                <h4 className={styles.MethodologySubsubheaderText}>
                  Diabetes/COPD
                </h4>
                <p>
                  Diabetes/COPD data in the tracker is sourced from{" "}
                  <a href="https://www.americashealthrankings.org/explore/annual/measure/Overall_a/state/ALL">
                    America's Health Rankings
                  </a>
                  , who in turn source their diabetes/COPD data from the{" "}
                  <a href="https://www.cdc.gov/brfss/index.html">
                    Behavioral Risk Factor Surveillance System (BRFSS)
                  </a>
                  , a sampled survey run by the CDC.
                </p>
                <ul>
                  <li>
                    As BRFSS is a sampled survey, the use of statistical
                    software is required to propertly integrate it. Please see
                    the{" "}
                    <a href="https://www.americashealthrankings.org/about/methodology/data-sources-and-measures">
                      methodology page
                    </a>{" "}
                    of America's Health Rankings for further details.
                  </li>
                  <li>
                    Another consequence of BRFSS being a survey is that often,
                    especially for smaller and typically marginalized racial
                    groups, there are not enough respondents to provide a
                    statistically meaningful estimate of disease prevalence. In
                    the tracker, states are colored grey to indicate that the
                    sample size was too small to produce an estimate of
                    diabetes/COPD prevalence for the given demographic group.
                  </li>
                  <li>
                    BRFSS data is not usable/available at the county level, so
                    the tracker does not have diabetes/COPD data at the county
                    level either.
                  </li>
                </ul>

                <h3 className={styles.MethodologySubsubheaderText}>
                  Visualizations
                </h3>
                <ul>
                  <li>
                    Unfortunately, the national-level map projection and
                    rendering software used in the tracker (
                    <a href="https://vega.github.io/vega-lite/docs/projection.html">
                      Vega, with the albersUsa projection
                    </a>
                    ) is currently unable to display territories such as Puerto
                    Rico on the national-level USA map. Searching directly for
                    territories does bring up the correct projection, however.
                  </li>
                  <li>
                    Please consider the impact of under-reporting and data gaps
                    when exploring the visualizations. These issues may lead to
                    incorrect conclusions, e.g. low per100k rates in a given
                    geography may be due to under-reporting.
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
                  Our tracker is iterating and expanding to include additional
                  health variables, social and political determinants of health,
                  and increasing coverage at the state, county, and census-tract
                  levels
                </p>
              </div>
              <div className={styles.MethodologyInfoBar}>
                <p>
                  Do you have information on health outcomes at the state and
                  local level?
                  <br />
                  <LinkWithStickyParams
                    class={styles.MethodologyContactUsLink}
                    to={`${ABOUT_US_PAGE_LINK}?${TAB_PARAM}=${ABOUT_US_CONTACT_TAB_INDEX}`}
                  >
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
