import React from "react";
import styles from "./LandingPage.module.scss";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import Typography from "@material-ui/core/Typography";
import {
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
  WIHE_JOIN_THE_EFFORT_SECTION_ID,
  ReactRouterLinkButton,
} from "../../utils/urlutils";
import FaqSection from "../ui/FaqSection";
import { Box } from "@material-ui/core";
import { usePrefersReducedMotion } from "../../utils/usePrefersReducedMotion";
import { Helmet } from "react-helmet";
import LazyLoad from "react-lazyload";

function TakeALookAroundItem(props: {
  src: string;
  alt: string;
  text: string;
}) {
  return (
    <Grid item xs={12} sm={4} md={4} className={styles.TakeALookAroundItem}>
      <Grid container direction="column" alignItems="center" justify="center">
        <Hidden xsDown>
          <Grid item>
            <LazyLoad height={200} offset={300} once>
              <img
                height="500"
                width="500"
                className={styles.TakeALookAroundImg}
                src={props.src}
                alt={props.alt}
              />
            </LazyLoad>
          </Grid>
        </Hidden>
        <Grid item>
          <Typography className={styles.TakeALookAroundText} variant="h3">
            <p>{props.text}</p>
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}

function LandingPage() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <>
      <Helmet>
        <title>Home - Health Equity Tracker</title>
        <link rel="preload" as="image" href="/img/stock/family-laughing.png" />
      </Helmet>
      <h1 className={styles.ScreenreaderTitleHeader}>Home Page</h1>
      <div className={styles.LandingPage}>
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
                Advancing
                <br aria-hidden="true" />
                Health
                <br aria-hidden="true" />
                Equity
              </Typography>
              <Typography
                className={styles.HeaderSubtext}
                variant="body1"
                paragraph={true}
              >
                We know that the data we collect can be imperfect and at times
                even worsen health inequities many people face if not reported
                or analyzed correctly.
              </Typography>

              <Typography
                className={styles.HeaderSubtext}
                variant="body1"
                paragraph={true}
              >
                We work to change that narrative by identifying, understanding,
                and responding to health inequities in our communities in a way
                that will allow every person to live well and long from
                generation to generation.
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
                  Explore the Health Equity Tracker
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={12} md={6} className={styles.HeaderImgItem}>
              <img
                height="601"
                width="700"
                src="/img/stock/family-laughing.png"
                className={styles.HeaderImg}
                alt=""
              />
            </Grid>
          </Grid>

          <Grid
            container
            className={styles.TakeALookAroundRow}
            justify="flex-start"
            align-items="center"
          >
            <Grid item xs={12}>
              <Typography
                className={styles.TakeALookAroundHeaderText}
                variant="h2"
              >
                Take a look around
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                className={styles.TakeALookAroundHeaderSubtext}
                variant="subtitle1"
                component="p"
              >
                We’re working toward health equity, but can’t do it alone.
                Please join our effort to move the needle forward.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Grid
                container
                className={styles.TakeALookAroundItemRow}
                direction="row"
                justify="space-around"
              >
                <TakeALookAroundItem
                  src={
                    prefersReducedMotion
                      ? "/img/animations/HET-fields-no-motion.gif"
                      : "/img/animations/HET-fields.gif"
                  }
                  alt=""
                  text="(1) Learn about health equity"
                />
                <TakeALookAroundItem
                  src={
                    prefersReducedMotion
                      ? "/img/animations/HET-dots-no-motion.gif"
                      : "/img/animations/HET-dots.gif"
                  }
                  alt=""
                  text="(2) Investigate the data"
                />
                <TakeALookAroundItem
                  src={
                    prefersReducedMotion
                      ? "/img/animations/HET-spiral-no-motion.gif"
                      : "/img/animations/HET-spiral-sm.gif"
                  }
                  alt=""
                  text="(3) Share our site and join our movement"
                />
              </Grid>
            </Grid>

            <Grid container direction="row" justify="center">
              <Grid item xs={12} sm={12}>
                <Button
                  variant="contained"
                  color="primary"
                  className={styles.PrimaryButton}
                  aria-label="Learn More About Health Equity"
                  href={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}
                >
                  What is Health Equity?
                  {/* Learn more */}
                </Button>
              </Grid>
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
                <LazyLoad once height="811" offset={300}>
                  <img
                    width="557"
                    height="811"
                    src="/img/stock/women-baby.png"
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
                  <LazyLoad offset={300} once>
                    <img
                      className={styles.HowToStepImg}
                      src="/img/screenshots/het-investigate-rates.png"
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
                  <LazyLoad offset={300} once>
                    <img
                      className={styles.HowToStepImg}
                      src="/img/screenshots/het-compare-rates.png"
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
                  <LazyLoad offset={300} once>
                    <img
                      className={styles.HowToStepImg}
                      src="/img/screenshots/het-map.png"
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

          <div className={styles.FaqRow}>
            <LazyLoad offset={300} height={700} once>
              <FaqSection />
            </LazyLoad>
          </div>

          <Grid
            container
            className={styles.NewsletterSignUpRow}
            justify="center"
          >
            <Grid
              container
              item
              xs={12}
              sm={12}
              direction="column"
              justify="center"
              alignItems="center"
              className={styles.EmailAddressBackgroundImgContainer}
            >
              <div className={styles.EmailAddressContentDiv}>
                <Grid item>
                  <Typography
                    className={styles.NewsletterRowHeader}
                    variant="h2"
                  >
                    <span aria-hidden="true">
                      Join Our
                      <br />
                      Movement
                    </span>
                  </Typography>
                </Grid>
                <Grid item>
                  <Button
                    aria-label="Join Our Movement: Learn How"
                    variant="contained"
                    color="default"
                    className={styles.JoinOurMovementButton}
                    href={`${WHAT_IS_HEALTH_EQUITY_PAGE_LINK}#${WIHE_JOIN_THE_EFFORT_SECTION_ID}`}
                  >
                    Learn How To Help
                  </Button>
                </Grid>
              </div>
            </Grid>{" "}
          </Grid>
        </Grid>
      </div>
    </>
  );
}

export default LandingPage;
