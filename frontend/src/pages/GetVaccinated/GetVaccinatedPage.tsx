import React from "react";
import styles from "./GetVaccinatedPage.module.scss";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import Typography from "@material-ui/core/Typography";
import {
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
  // TAB_PARAM,
  ReactRouterLinkButton,
} from "../../utils/urlutils";
import // WIHE_HEALTH_EQUITY_TAB_INDEX,
// WIHE_JOIN_THE_EFFORT_SECTION_ID,
"../WhatIsHealthEquity/WhatIsHealthEquityPage";
import { Box } from "@material-ui/core";
import { Helmet } from "react-helmet";
import LazyLoad from "react-lazyload";

function VaccineSchedulingPage() {
  return (
    <>
      <Helmet>
        <title>Vaccine Scheduling - Health Equity Tracker</title>
      </Helmet>
      <h1 className={styles.ScreenreaderTitleHeader}>Vaccine Scheduling</h1>
      <div className={styles.VaccineSchedulingPage}>
        <Grid container className={styles.Grid}>
          <Grid
            container
            className={styles.HeaderRow}
            direction="row"
            justify="center"
            alignItems="center"
          >
            <Grid item className={styles.HeaderTextItem} xs={12} sm={12} md={6}>
              <Typography
                id="main"
                tabIndex={-1}
                className={styles.HeaderText}
                variant="h2"
                paragraph={true}
              >
                Vaccination Scheduling
              </Typography>
              <Typography
                className={styles.HeaderSubtext}
                variant="body1"
                paragraph={true}
              >
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit,
                ullam. Unde dicta eius animi? Beatae deserunt voluptas quo
                maxime. Necessitatibus nihil dicta ipsum quia culpa rerum.
                Beatae temporibus laborum repellendus?.
              </Typography>

              <Typography
                className={styles.HeaderSubtext}
                variant="body1"
                paragraph={true}
              >
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                Pariatur accusamus expedita, exercitationem ullam et porro. Quas
                laborum a amet quo asperiores assumenda repudiandae sapiente sed
                quasi? Pariatur odio nisi voluptates..
              </Typography>

              <Typography
                className={styles.HeaderSubtext}
                variant="body1"
                paragraph={true}
              >
                Join us in powering transformational action!
              </Typography>
              <Box mt={5}>
                <Button
                  variant="contained"
                  color="primary"
                  className={styles.PrimaryButton}
                  href={EXPLORE_DATA_PAGE_LINK}
                >
                  Get Vaccinated
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={12} md={6} className={styles.HeaderImgItem}>
              <LazyLoad height={700} once>
                <img
                  height="719"
                  width="866"
                  src="img/getvaccinated/vaxx-best-things.png"
                  className={styles.HeaderImg}
                  alt=""
                />
              </LazyLoad>
            </Grid>
          </Grid>

          <Grid
            container
            className={styles.PrioritizeHealthEquityRow}
            direction="row"
            justify="center"
            alignItems="center"
          >
            <Hidden smDown>
              <Grid
                item
                xs={12}
                sm={12}
                md={5}
                className={styles.PrioritizeHealthEquityImgItem}
              >
                <LazyLoad once>
                  <img
                    src="img/getvaccinated/girls-studying.jpg"
                    className={styles.PrioritizeHealthEquityImg}
                    alt=""
                  />
                </LazyLoad>
              </Grid>
            </Hidden>
            <Grid
              item
              xs={12}
              sm={12}
              md={7}
              className={styles.PrioritizeHealthEquityTextItem}
            >
              <Box mb={4}>
                <Typography
                  className={styles.PrioritizeHealthEquityHeader}
                  variant="h2"
                  paragraph={true}
                >
                  It's time to prioritize health equity
                </Typography>
              </Box>

              <Typography
                className={styles.PrioritizeHealthEquityHeaderSubtext}
                variant="body1"
                paragraph={true}
              >
                We’re living through a historic moment. COVID-19 has taken a
                toll on everyone. But the pandemic is hitting the most
                marginalized, vulnerable communities the hardest.
              </Typography>

              <Typography
                className={styles.PrioritizeHealthEquityHeaderSubtext}
                variant="body1"
                paragraph={true}
              >
                <b>People need help, and they need it now.</b>
              </Typography>

              <Box mt={5}>
                <Typography
                  className={styles.PrioritizeHealthEquityHeaderSubtext}
                  variant="body1"
                  paragraph={true}
                >
                  <ReactRouterLinkButton
                    url={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}
                    className={styles.LearnMoreAboutHealthEquity}
                    displayName="Learn more about health equity"
                  />
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Grid container className={styles.HowToRow}>
            <Grid item xs={12}>
              <Typography className={styles.HowToHeaderText} variant="h2">
                How do I use the Data Tracker?
              </Typography>
            </Grid>

            <Grid
              container
              direction="column"
              justify="center"
              alignItems="center"
            >
              <Grid
                container
                className={styles.HowToStepContainer}
                direction="row"
                justify="space-around"
                alignItems="center"
              >
                <Grid item xs={12} sm={12} md={8}>
                  <LazyLoad once>
                    <img
                      className={styles.HowToStepImg}
                      src="img/screenshots/het-investigate-rates.png"
                      alt="Search Example Screenshot: Investigate Rates of option Covid-19 in location United States"
                    />
                  </LazyLoad>
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                  <div>
                    <h3 className={styles.HowToStepTextHeader}>
                      Search by completing the sentence
                    </h3>
                    <p className={styles.HowToStepTextSubheader}>
                      Select variables you’re interested in to complete the
                      sentence and explore the data
                    </p>
                  </div>
                </Grid>
              </Grid>

              <Grid
                container
                className={styles.HowToStepContainer}
                direction="row"
                justify="space-around"
                alignItems="center"
              >
                <Grid item xs={12} sm={12} md={8}>
                  <LazyLoad once>
                    <img
                      className={styles.HowToStepImg}
                      src="img/screenshots/het-compare-rates.png"
                      alt="Search Example Screenshot: Compare Rates of option Covid-19 between two locations"
                    />
                  </LazyLoad>
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                  <div>
                    <h3 className={styles.HowToStepTextHeader}>
                      Use filters to go deeper
                    </h3>
                    <p className={styles.HowToStepTextSubheader}>
                      Where available, the tracker offers breakdowns by race and
                      ethnicity, sex, and age.
                    </p>
                  </div>
                </Grid>
              </Grid>

              <Grid
                container
                className={styles.HowToStepContainer}
                direction="row"
                justify="space-around"
                alignItems="center"
              >
                <Grid item xs={12} sm={12} md={8}>
                  <LazyLoad once>
                    <img
                      className={styles.HowToStepImg}
                      src="img/screenshots/het-map.png"
                      alt="Map Example Screenshot, Data Tracker map of option Covid-19 rates of all racial groups"
                    />
                  </LazyLoad>
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                  <div>
                    <h3 className={styles.HowToStepTextHeader}>
                      Explore maps and graphs
                    </h3>
                    <p className={styles.HowToStepTextSubheader}>
                      The interactive maps and graphs are a great way to
                      investigate the data more closely. If a state or county is
                      gray, that means there’s no data currently available.
                    </p>
                  </div>
                </Grid>
              </Grid>
              <Grid item>
                <br />
                <br />
                <Button
                  variant="contained"
                  color="primary"
                  className={styles.PrimaryButton}
                  href={EXPLORE_DATA_PAGE_LINK}
                >
                  Explore the Tracker
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </>
  );
}

export default VaccineSchedulingPage;
