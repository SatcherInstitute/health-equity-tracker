import React from "react";
import styles from "./LandingPage.module.scss";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import Typography from "@material-ui/core/Typography";
import { ReactRouterLinkButton } from "../../utils/urlutils";
import {
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
  WIHE_JOIN_THE_EFFORT_SECTION_ID,
} from "../../utils/internalRoutes";
import FaqSection from "../ui/FaqSection";
import { Box } from "@material-ui/core";
import { usePrefersReducedMotion } from "../../utils/usePrefersReducedMotion";
import { Helmet } from "react-helmet-async";
import LazyLoad from "react-lazyload";

function TakeALookAroundItem(props: {
  src: string;
  alt: string;
  text: string;
}) {
  return (
    <Grid item xs={12} sm={4} md={4} className={styles.TakeALookAroundItem}>
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
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
          <Typography
            className={styles.TakeALookAroundText}
            variant="h3"
            component="p"
          >
            {props.text}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}

function LandingPage() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <main>
      <Helmet>
        <title>Home - Health Equity Tracker</title>
        <link rel="preload" as="image" href="/img/stock/family-laughing.png" />
      </Helmet>
      <h2 className={styles.ScreenreaderTitleHeader}>Home Page</h2>
      <Grid container className={styles.Grid}>
        <Grid
          container
          className={styles.HeaderRow}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item className={styles.HeaderTextItem} xs={12} sm={12} md={6}>
            <Typography
              id="main"
              className={styles.HeaderText}
              variant="h2"
              paragraph={true}
              component="h3"
            >
              One Year of Advancing Health Equity
            </Typography>
            <Typography
              className={styles.HeaderSubtext}
              variant="body1"
              paragraph={true}
            >
              We know that the data we collect can be imperfect and at times
              even worsen health inequities many people face if not reported or
              analyzed correctly. We work to change that narrative by leveraging
              the power of data and technology to identify, understand, and
              respond to health inequities in our communities in a way that will
              allow every person to achieve an optimum level of health.
            </Typography>

            <Typography
              className={styles.HeaderSubtext}
              variant="body1"
              paragraph={true}
            >
              After one year of working on our award-winning Health Equity
              Tracker, we are expanding on what we have learned and growing our
              open-source framework to support the advancement of health equity
              for all.
            </Typography>

            <Typography
              className={styles.HeaderSubtext}
              variant="body1"
              paragraph={true}
            >
              Please read more from our Executive Director Daniel E. Dawes, JD,
              celebrating “
              <a href="https://healthequitytracker.org/news/one-year-of-advancing-health-equity">
                One Year of Advancing Health Equity
              </a>
              ”.
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
          justifyContent="flex-start"
          align-items="center"
        >
          <Grid item xs={12}>
            <Typography
              className={styles.TakeALookAroundHeaderText}
              variant="h2"
              component="h3"
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
              We’re working toward health equity, but can’t do it alone. Please
              join our effort to move the needle forward.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid
              container
              className={styles.TakeALookAroundItemRow}
              direction="row"
              justifyContent="space-around"
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

          <Grid container direction="row" justifyContent="center">
            <Grid item xs={12} sm={12}>
              <Button
                variant="contained"
                color="primary"
                className={styles.PrimaryButton}
                href={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}
              >
                What is Health Equity?
              </Button>
            </Grid>
          </Grid>
        </Grid>

        <Grid
          container
          className={styles.PrioritizeHealthEquityRow}
          direction="row"
          justifyContent="center"
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
                component="h3"
              >
                It's time to prioritize health equity
              </Typography>
            </Box>

            <Typography
              className={styles.PrioritizeHealthEquityHeaderSubtext}
              variant="body1"
              paragraph={true}
            >
              We’re living through a historic moment. COVID-19 has taken a toll
              on everyone. But the pandemic is hitting the most marginalized,
              vulnerable communities the hardest.
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

        <Grid
          container
          className={styles.HowToRow}
          component="article"
          justifyContent="center"
        >
          <Grid item xs={12}>
            <Typography
              className={styles.HowToHeaderText}
              variant="h2"
              component="h3"
            >
              How do I use the Data Tracker?
            </Typography>
          </Grid>

          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
            component="ul"
          >
            <Grid
              container
              className={styles.HowToStepContainer}
              direction="row"
              justifyContent="space-around"
              alignItems="center"
              component="li"
            >
              <Grid item xs={12} sm={12} md={3}>
                <h4 className={styles.HowToStepTextHeader}>
                  Search by completing the sentence
                </h4>
                <p className={styles.HowToStepTextSubheader}>
                  Select variables you’re interested in to complete the sentence
                  and explore the data
                </p>
              </Grid>
              <Grid item xs={12} sm={12} md={8}>
                <LazyLoad offset={300} once>
                  <img
                    className={styles.HowToStepImg}
                    src="/img/screenshots/het-investigate-rates.png"
                    alt="Search Example Screenshot: Investigate Rates of option Covid-19 in location United States"
                  />
                </LazyLoad>
              </Grid>
            </Grid>

            <Grid
              container
              className={styles.HowToStepContainer}
              direction="row"
              justifyContent="space-around"
              alignItems="center"
              component="li"
            >
              <Grid item xs={12} sm={12} md={3}>
                <div>
                  <h4 className={styles.HowToStepTextHeader}>
                    Use filters to go deeper
                  </h4>
                  <p className={styles.HowToStepTextSubheader}>
                    Where available, the tracker offers breakdowns by race and
                    ethnicity, sex, and age.
                  </p>
                </div>
              </Grid>

              <Grid item xs={12} sm={12} md={8}>
                <LazyLoad offset={300} once>
                  <img
                    className={styles.HowToStepImg}
                    src="/img/screenshots/het-compare-rates.png"
                    alt="Search Example Screenshot: Compare Rates of option Covid-19 between two locations"
                  />
                </LazyLoad>
              </Grid>
            </Grid>

            <Grid
              container
              className={styles.HowToStepContainer}
              direction="row"
              justifyContent="space-around"
              alignItems="center"
              component="li"
            >
              <Grid item xs={12} sm={12} md={3}>
                <div>
                  <h4 className={styles.HowToStepTextHeader}>
                    Explore maps and graphs
                  </h4>
                  <p className={styles.HowToStepTextSubheader}>
                    The interactive maps and graphs are a great way to
                    investigate the data more closely, currently reporting
                    COVID-19 cases by race at the state and county level.
                  </p>
                </div>
              </Grid>

              <Grid item xs={12} sm={12} md={8}>
                <LazyLoad offset={300} once>
                  <img
                    className={styles.HowToStepImg}
                    src="/img/screenshots/het-map.png"
                    alt="Map Example Screenshot, Data Tracker map of option Covid-19 rates of all racial groups"
                  />
                </LazyLoad>
              </Grid>
            </Grid>
          </Grid>
          <Box mt={7}>
            <Button
              variant="contained"
              color="primary"
              className={styles.PrimaryButton}
              href={EXPLORE_DATA_PAGE_LINK}
            >
              Explore the Tracker
            </Button>
          </Box>
        </Grid>

        <div className={styles.FaqRow}>
          <LazyLoad offset={300} height={700} once>
            <FaqSection />
          </LazyLoad>
        </div>

        <Grid
          container
          className={styles.NewsletterSignUpRow}
          justifyContent="center"
        >
          <Grid
            container
            item
            xs={12}
            sm={12}
            direction="column"
            justifyContent="center"
            alignItems="center"
            className={styles.EmailAddressBackgroundImgContainer}
          >
            <div className={styles.EmailAddressContentDiv}>
              <Grid item>
                <Typography className={styles.NewsletterRowHeader} variant="h2">
                  <span>
                    Join Our
                    <br aria-hidden="true" />
                    Movement
                  </span>
                </Typography>
              </Grid>
              <Grid item>
                <Button
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
    </main>
  );
}

export default LandingPage;
