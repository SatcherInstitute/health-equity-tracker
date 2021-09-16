import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./WhatIsHealthEquityPage.module.scss";
import { Typography } from "@material-ui/core";
import { CONTACT_TAB_LINK } from "../../utils/urlutils";
import { Helmet } from "react-helmet";
import { CITATION_CHICAGO } from "../DataCatalog/MethodologyTab";
import parse from "html-react-parser";

export const selectFaqs: any[] = [
  {
    q: "What is health equity? Why is it important?",
    a: `
  <p>The World Health Organization defines health equity “as the
  absence of unfair and avoidable or remediable differences in
  health among population groups defined socially, economically,
  demographically or geographically”.</p>

<p>Health Equity exists when all people, regardless of race, sex,
  socio-economic status, geographic location, or other societal
  constructs have the same access, opportunity, and resources to
  achieve their highest potential for health (Health Equity
  Leadership and Exchange Network).</p>

  <p>Health equity is important because everyone, regardless of race,
  ethnicity, sex, or socioeconomic status, should have the
  opportunity to reach their full potential and achieve optimal
  health.</p>
  `,
  },
  {
    q: "What are health disparities?",
    a: `Health disparities are preventable differences in the burden
of disease, injury, violence, or in opportunities to achieve
optimal health experienced by socially disadvantaged racial,
ethnic, and other population groups, and communities (CDC).`,
  },
  {
    q: "What data sources did you use? Why?",
    a: `
<p>
In this tracker, we are using many sources, including <a href="https://www.census.gov/data/developers/data-sets/acs-5year.html">American Community Survey 5-year estimates (2015-2019)</a>, <a href="https://www.cdc.gov/brfss/index.html">CDC’s BRFSS data set</a>, and <a href="https://covidtracking.com/race">COVID Tracking Project’s Racial Data Tracker</a>. Some sources are “real-time”, like case data, but other important data, such as information around social determinants of health can lag from weeks to years. For the moment, this is our best representation of how the country is doing based on publicly available information.
</p>
`,
  },
  {
    q: `What are the limitations in the data?`,
    a: `
  <p>
  Unfortunately, with these publicly available data sets, there
  are crucial gaps, including but not limited to:
</p>
<ul>
  <li>
    comprehensive city-, census tract-, and county-level data
  </li>
  <li>comprehensive race and ethnicity breakdowns</li>
  <li>comprehensive sex and age breakdowns</li>
</ul>
<span className={styles.FaqSubheaderText}>
  Known limitations in the data
</span>
<ul>
  <li>
    To protect the privacy of affected individuals, COVID-19 data
    may be hidden in counties with smaller numbers of COVID-19
    cases, hospitalizations and deaths.
  </li>
  <li>
    Specific racial and ethnic categories (e.g. “Native Hawaiian,”
    “Alaska Native”) differ by source and can be inappropriately
    obscured by broader categories (e.g. “Other,” “Asian”).
  </li>
  <li>
    National statistics are aggregations of state-wide data. If
    state data is not available, these aggregations may be
    incomplete and potentially skewed.
  </li>
  <li>
    We typically refresh our data sources with newly available
    data within a few days. Seeking the latest information? Please
    navigate to the data sources directly.
  </li>
</ul>
  `,
  },
  {
    q: `How did you acquire and standardize the data?`,
    a: `
  <ul>
              <li>
              In an effort to be fully transparent, all data is retrieved from publicly sourced APIs and manual downloads 
              </li>
              <li>
                Once acquired, this data is converted to tables in Google BigQuery
              </li>
              <li>
                During this process, values are standardized and normalized to
                facilitate reporting, comparison and visualization
              </li>
              <li>
                Sources are refreshed when update notifications are received
              </li>
            </ul>
  `,
  },
];

function FaqTab() {
  return (
    <>
      <Helmet>
        <title>FAQ - What Is Health Equity - Health Equity Tracker</title>
      </Helmet>
      <h1 className={styles.ScreenreaderTitleHeader}>
        Frequently Asked Questions
      </h1>
      <Grid container className={styles.Grid}>
        <Grid container className={styles.FaqSection}>
          <Grid item xs={12} sm={12} md={3}>
            <Typography
              id="main"
              tabIndex={-1}
              className={styles.FaqHeaderText}
              variant="h2"
            >
              Data
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={9}>
            <Grid container>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>{selectFaqs[4].q}</h3>
                <div className={styles.FaqAnswer}>{parse(selectFaqs[4].a)}</div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>{selectFaqs[2].q}</h3>
                <div className={styles.FaqAnswer}>{parse(selectFaqs[2].a)}</div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>{selectFaqs[3].q}</h3>
                <div className={styles.FaqAnswer}>{parse(selectFaqs[3].a)}</div>
                <a href="/datacatalog" className={styles.MajorLink}>
                  See Data Sources
                </a>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  What are the inequities in the data?
                </h3>
                <div className={styles.FaqAnswer}>
                  <ul>
                    <li>
                      We’ve seen that many agencies do not reliably collect race
                      and ethnicity data
                    </li>
                    <li>Others that do collect it, fail to report it</li>
                    <li>
                      Racial and ethnic categories are often left up to a
                      person’s interpretation and may not be accurate
                    </li>
                  </ul>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  What principles guide you?
                </h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    It is essential that this work and its resulting products
                    are done consistently in an ethical manner. One of the core
                    values of the Health Equity Task Force charged with
                    developing the Health Equity Tracker is the importance of
                    working in a way that garners public trust.{" "}
                  </p>
                  <h4 className={styles.FaqSubheaderText}>
                    These guiding questions help ensure the right standards are
                    in place:
                  </h4>
                  <ul>
                    <li>Do we have open access and input in place?</li>
                    <li>Is there transparency among stakeholders?</li>
                    <li>
                      Are we using valid and current data that is reflective of
                      the realities?
                    </li>
                    <li>
                      Is the community a part of the ownership and authorship of
                      this work?
                    </li>
                    <li>
                      Have we created a tool that has real value for all
                      stakeholders including the communities?
                    </li>
                    <li>Are we holding our partners accountable?</li>
                  </ul>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={styles.FaqSection}>
          <Grid item xs={12} sm={12} md={3}>
            <Typography className={styles.FaqHeaderText} variant="h2">
              Definitions
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={9}>
            <Grid container>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>What is equity?</h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    Equity refers to everyone having a fair opportunity to reach
                    their full potential and no one being disadvantaged from
                    achieving this potential (Dawes D.E., 2020).
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  What is the difference between equality and equity?
                </h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    By definition, equality means “the state of being equal,
                    especially in status, rights, and opportunities.” Equity, in
                    comparison, “the quality of being fair and just.” Equity
                    occurs when everyone has access to the necessary tools to
                    achieve their full potential. Equality occurs when everyone
                    has the same level and quality of access, which may not
                    yield fair results.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>{parse(selectFaqs[0].q)}</h3>
                <div className={styles.FaqAnswer}>{parse(selectFaqs[0].a)}</div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>{parse(selectFaqs[1].q)}</h3>
                <div className={styles.FaqAnswer}>{parse(selectFaqs[1].a)}</div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  What are political determinants of health?
                </h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    The political determinants of health create the structural
                    conditions and the social drivers – including poor
                    environmental conditions, inadequate transportation, unsafe
                    neighborhoods, and lack of healthy food options – that
                    affect all other dynamics of health. (Dawes, D.E. 2020) What
                    is important to note, is that the political determinants of
                    health are more than merely separate and distinct from the
                    social determinants of health, they actually serve as the
                    instigators of the social determinants that many people are
                    already well acquainted with.
                  </p>
                  <p>
                    By understanding these political determinants, their
                    origins, and their impact on the equitable distribution of
                    opportunities and resources, we can be better equipped to
                    develop and implement actionable solutions to close the
                    health gap.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  What are social determinants of health?
                </h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    Social determinants of health are conditions in the
                    environments in which people are born, live, learn, work,
                    play, worship, and age that affect a wide range of health,
                    functioning, and quality-of-life outcomes and risks.
                    (Healthy People 2020, CDC)
                  </p>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={styles.FaqSection}>
          <Grid item xs={12} sm={12} md={3}>
            <Typography className={styles.FaqHeaderText} variant="h2">
              Take Action
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={9}>
            <Grid container>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>How can I get involved?</h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    To advance health equity, we need smart, talented,
                    passionate folks like you on board.
                  </p>
                  <ul>
                    <li>
                      Sign up for our newsletter to stay up to date with the
                      latest news
                    </li>
                    <li>
                      Share our site and graphs with your community on social
                      media
                    </li>
                    <li>
                      Share your health equity story.{" "}
                      <a href={`${CONTACT_TAB_LINK}`}>
                        Click here to contact us
                      </a>
                    </li>
                  </ul>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  How do I share the graphs?
                </h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    Next to each graph, there is a circle-shaped button with
                    three dots in it. Click on that button to see a menu where
                    you can save each graph as a PNG or SVG.{" "}
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion} id="citation">
                  What is the recommended citation for the Health Equity
                  Tracker?
                </h3>
                <div className={styles.FaqAnswer}>
                  <p>{CITATION_CHICAGO}</p>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default FaqTab;
