import React from "react";
import styles from "./FaqSection.module.scss";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Accordion, AccordionSummary } from "@material-ui/core";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  LinkWithStickyParams,
  TAB_PARAM,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
} from "../../utils/urlutils";
import { WIHE_FAQ_TAB_INDEX } from "../WhatIsHealthEquity/WhatIsHealthEquityPage";

function Question(props: {
  questionText: string;
  ariaControls: string;
  id: string;
  answer: JSX.Element;
}) {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={props.ariaControls}
        id={props.id}
      >
        <Typography className={styles.FaqQuestion} variant="h2">
          {props.questionText}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <div className={styles.FaqAnswer}>{props.answer}</div>
      </AccordionDetails>
    </Accordion>
  );
}

function FaqSection() {
  return (
    <Grid container className={styles.FaqRow}>
      <Grid item xs={12}>
        <Typography className={styles.FaqHeader} variant="h1">
          Frequently asked questions
        </Typography>
      </Grid>
      <Grid item xs={12} className={styles.FaqQAItem}>
        <Question
          questionText="What is health equity? Why is it important?"
          ariaControls="panel1-content"
          id="panel1-header"
          answer={
            <>
              <p>
                The World Health Organization defines health equity “as the
                absence of unfair and avoidable or remediable differences in
                health among population groups defined socially, economically,
                demographically or geographically”.
              </p>
              <p>
                Health Equity exists when all people, regardless of race,
                gender, socio-economic status, geographic location, or other
                societal constructs have the same access, opportunity, and
                resources to achieve their highest potential for health (Health
                Equity Leadership and Exchange Network).
              </p>
              <p>
                Health equity is important because everyone, regardless of race,
                ethnicity, gender, or socioeconomic status, should have the
                opportunity to reach their full potential and achieve optimal
                health.
              </p>
            </>
          }
        />
        <Question
          questionText="What are disparities?"
          ariaControls="panel2-content"
          id="panel2-header"
          answer={
            <p>
              Health disparities are preventable differences in the burden of
              disease, injury, violence, or in opportunities to achieve optimal
              health experienced by socially disadvantaged racial, ethnic, and
              other population groups, and communities. (CDC)
            </p>
          }
        />
        <Question
          questionText="What data sources did you use? Why?"
          ariaControls="panel3-content"
          id="panel3-header"
          answer={
            <p>
              In this tracker, we are using many sources, including{" "}
              <a href="https://www.census.gov/data/developers/data-sets/acs-5year.html">
                American Community Survey 5-year estimates (2015-2019)
              </a>
              ,{" "}
              <a href="https://www.cdc.gov/brfss/index.html">
                CDC’s BRFSS data set
              </a>
              , and{" "}
              <a href="https://covidtracking.com/race">
                COVID Tracking Project’s Racial Data Tracker
              </a>
              . Some sources are “real-time”, like case data, but other
              important data, such as information around social determinants of
              health can lag from weeks to years. For the moment, this is our
              best representation of how the country is doing based on publicly
              available information.
            </p>
          }
        />
        <Question
          questionText="What are the limitations in the data?"
          ariaControls="panel4-content"
          id="panel4-header"
          answer={
            <>
              <p>
                Unfortunately, with these publicly available data sets, there
                are crucial gaps, including but not limited to:{" "}
              </p>
              <ul>
                <li>
                  comprehensive city-, census tract-, and county-level data
                </li>
                <li>comprehensive race and ethnicity breakdowns</li>
                <li>comprehensive gender and age breakdowns</li>
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
            </>
          }
        />
        <Question
          questionText="What was your methodology in ingesting the data?"
          ariaControls="panel5-content"
          id="panel5-header"
          answer={
            <ul>
              <li>
                Our data is retrieved via a mix of APIs and manual downloads
              </li>
              <li>
                Once acquired, this data is converted to tables in Google
                BigQuery
              </li>
              <li>
                During this process, values are standardized and normalized to
                facilitate reporting, comparison and visualization
              </li>
              <li>
                Sources are refreshed when update notifications are received
              </li>
            </ul>
          }
        />
      </Grid>
      <Grid item>
        <LinkWithStickyParams
          class={styles.FaqLink}
          to={`${WHAT_IS_HEALTH_EQUITY_PAGE_LINK}?${TAB_PARAM}=${WIHE_FAQ_TAB_INDEX}`}
        >
          See our full FAQ page
        </LinkWithStickyParams>
      </Grid>
    </Grid>
  );
}

export default FaqSection;
