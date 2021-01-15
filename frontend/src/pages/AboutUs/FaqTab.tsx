import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./AboutUsPage.module.scss";
import Button from "@material-ui/core/Button";
import ArrowForward from "@material-ui/icons/ArrowForward";
import Divider from "@material-ui/core/Divider";
import { DATA_CATALOG_PAGE_LINK } from "../../utils/urlutils";

/* TODO - Align with mocks, Clean up CSS */
function FaqTab() {
  return (
    <Grid container justify="space-around" className={styles.Grid}>
      <Grid item xs={3}>
        <span className={styles.UnderlinedHeader}>Data</span>
      </Grid>
      <Grid item xs={9}>
        <h1>How was the data collected?</h1>
        All data collected was publicly sourced in an effort to be fully
        transparent.
        <h1>What sources were used?</h1>
        In this tracker, we are using many sources, including
        <a href="/">American Community Survey 5-year estimates (2015-2019)</a>,
        <a href="/">CDC’s BRFSS data set</a>, and
        <a href="/">COVID Tracking Project’s Racial Data Tracker</a>. Some
        sources are “real-time”, like case data, but other important data, such
        as information around social determinants of health can lag from weeks
        to years. For the moment, this is our best representation of how the
        country is doing based on publicly available information.
        <h1>What are the limitations of the data?</h1>
        Unfortunately, with these publically available data sets, there are
        crucial pieces missing, including but not limited to:
        <ul>
          <li>comprehensive city-, census tract-, and county-level data</li>
          <li>comprehensive race and ethnicity breakdowns</li>
          <li>comprehensive gender and age breakdowns</li>
        </ul>
        <b>Known limitations in the data</b>
        <ul>
          <li>
            Data may be hidden in counties with smaller numbers of COVID-19
            cases, hospitalizations and deaths in order to protect the privacy
            of affected individuals.
          </li>
          <li>
            Racial and ethnic categorization is often at the discretion of
            healthcare professionals and may not be accurate.
          </li>
          <li>
            Racial and ethnic categories differ by source and can obscure severe
            inequity by inappropriately aggregating different communities with
            distinct experiences into a single overly large category (e.g.
            “Other,” “Asian”).
          </li>
          <li>
            US-wide statistics are aggregations of state-wide data. Where data
            has been withheld to protect privacy, and where data is missing
            (such as in states that do not report race/ethnicity breakdowns of
            COVID-19 statistics), US-wide aggregations may be incomplete and
            potentially skewed, if excluded populations differ significantly
            from the country as a whole.
          </li>
          <li>
            While we attempt to update our data sources with newly available
            data within a short time frame (typically a few days), please
            navigate to our data sources directly if you are seeking the newest
            data as soon as it is made available.
          </li>
        </ul>
        <a href={DATA_CATALOG_PAGE_LINK}>
          <Button color="primary" endIcon={<ArrowForward />}>
            See Data Sources
          </Button>
        </a>
        <h1>What principles guide you?</h1>
        It is essential that this work and its resulting products are done
        consistently in an ethical manner. One of the core values of the Health
        Equity Task Force charged with developing the Health Equity Tracker is
        the importance of working in a way that garners public trust.
        <b>
          These guiding questions help ensure the right standards are in place:
        </b>
        <ul>
          <li>Do we have open access and input in place?</li>
          <li>Is there transparency among stakeholders?</li>
          <li>
            Are we using valid and current data that is reflective of the
            realities?
          </li>
          <li>
            Is the community a part of the ownership and authorship of this
            work?
          </li>
          <li>
            Have we created a tool that has real value for all stakeholders
            including the communities?
          </li>
          <li>Are we holding our partners accountable?</li>
        </ul>
      </Grid>
      <Divider />
      <Grid container>
        <Grid item xs={3}>
          <span className={styles.UnderlinedHeader}>Definitions</span>
        </Grid>
        <Grid item xs={9}>
          <h1>What is equity? And why is this important?</h1>
          <p>
            Equity refers to everyone having a fair opportunity to reach their
            full potential and no one being disadvantaged from achieving this
            potential (Dawes D.E., 2020).
          </p>
          <p>
            Equity is important because everyone, regardless of race, ethnicity,
            gender, or socioeconomic status, should have the opportunity to
            reach their full potential and achieve optimal health.
          </p>
          <h1>What are political determinants of health?</h1>
          The political determinants of health create the structural conditions
          and the social drivers – including poor environmental conditions,
          inadequate transportation, unsafe neighborhoods, and lack of healthy
          food options – that affect all other dynamics of health. (Dawes, D.E.
          2020) What is important to note, is that the political determinants of
          health are more than merely separate and distinct from the social
          determinants of health, they actually serve as the instigators of the
          social determinants that many people are already well acquainted with.
          <h1>What are social determinants of health?</h1>
          The social determinants of health, as defined by the Centers for
          Disease Control and Prevention, are the conditions in places where
          people live, learn, work, and play that affect a wide range of health
          and quality-of-life risks and outcomes. (CDC, 2020)
        </Grid>
      </Grid>
    </Grid>
  );
}

export default FaqTab;
