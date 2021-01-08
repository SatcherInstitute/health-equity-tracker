import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./AboutUsPage.module.scss";
import Button from "@material-ui/core/Button";
import ArrowForward from "@material-ui/icons/ArrowForward";
import Divider from "@material-ui/core/Divider";

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
        In this tracker, we are using <a href="/">
          COVID Tracking Project
        </a>, <a href="/">CDC Public Datasets</a>,{" "}
        <a href="/">CREW Data American</a>, and{" "}
        <a href="/">American Community Survey data</a>. Some soures are more
        “real-time” like case data, but other important data, such as
        information around social determinants of health can lag weeks to
        months. For the moment, this is our best representation of how the
        country is doing based on publically available information.
        <h1>What are the limitations of the data?</h1>
        Unfortunately, with these publically available data sets, there are
        crucial pieces missing, including but not limited to: comprehensive
        city-, census tract-, and county-level data; comprehensive race and
        ethnicity breakdowns; comprehensive gender and age breakdowns by county,
        etc.
        <b>Known limitations in the data</b>
        <ul>
          <li>
            Data may be hidden in counties with smaller numbers of COVID-19
            cases, hospitalizations and deaths in order to protect the privacy
            of affected individuals.
          </li>{" "}
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
        <Button color="primary">
          See Data Sources
          <ArrowForward />
        </Button>
        <h1>What principles guide you?</h1>
        It is essential that this work and all the products, as a result of it
        are done consistently in an ethical manner. One of the core values of
        the Health Equity Task Force charged with developing the Health Equity
        Tracker, is the importance of working in a way that garners public
        trust. Here are some of the principles that the EPTC is working to make
        sure are in place. We created these standards for the work now and
        moving forward.
        <b>Guiding questions:</b>
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
          <span className={styles.UnderlinedHeader}>Data</span>
        </Grid>
        <Grid item xs={9}>
          <h1>What is equity? And why is this important?</h1>
          Equity refers to everyone having a fair opportunity to reach their
          full potential and no one being disadvantaged from achieving this
          potential (Dawes D.E., 2020). Achieving Equity is important because...
          there are people and communities that are economically or socially
          worse-off, due to existing social and political constructs. by giving
          these individuals what they need, when they need it and in the amount
          they need in an equitable manner they can have the opportunity to
          reach their optimal health.
          <h1>What are political determinants of health?</h1>
          Political determinants of health are factors like poor environmental
          conditions, inadequate transportation, unsafe neighborhoods, and lack
          of healthy food options that affect all other dynamics of health.
          (Dawes, D.E. 2020)
          <h1>What are social determinants of health?</h1>
          Social determinants of health are the conditions in which people are
          born, grow, live, work and age. These circumstances are shaped by the
          distribution of money, power and resources at global, national and
          local levels. (WHO, 2020)
        </Grid>
      </Grid>
    </Grid>
  );
}

export default FaqTab;
