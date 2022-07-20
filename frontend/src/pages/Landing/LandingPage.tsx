import React from "react";
import styles from "./LandingPage.module.scss";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import {
  ARTICLES_KEY,
  fetchNewsData,
  ReactRouterLinkButton,
  REACT_QUERY_OPTIONS,
} from "../../utils/urlutils";
import {
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
  WIHE_JOIN_THE_EFFORT_SECTION_ID,
  NEWS_TAB_LINK,
} from "../../utils/internalRoutes";
import FaqSection from "../ui/FaqSection";
import { Box, useMediaQuery, useTheme } from "@material-ui/core";
import { Helmet } from "react-helmet-async";
import LazyLoad from "react-lazyload";
import NewsPreviewCard from "../WhatIsHealthEquity/News/NewsPreviewCard";
import { useQuery } from "react-query";
import { Article } from "../WhatIsHealthEquity/NewsTab";
import { ArticlesSkeleton } from "../WhatIsHealthEquity/News/AllPosts";

function LandingPage() {
  const { isLoading, error, data }: any = useQuery(
    ARTICLES_KEY,
    fetchNewsData,
    REACT_QUERY_OPTIONS
  );

  const theme = useTheme();
  const pageIsSmall = useMediaQuery(theme.breakpoints.only("sm"));
  const pageIsMedium = useMediaQuery(theme.breakpoints.only("md"));
  const pageIsWide = useMediaQuery(theme.breakpoints.up("lg"));

  let numberOfArticlePreviews = 1;
  if (pageIsSmall) numberOfArticlePreviews = 2;
  if (pageIsMedium) numberOfArticlePreviews = 3;
  if (pageIsWide) numberOfArticlePreviews = 4;

  const recentArticles = data?.data.slice(0, numberOfArticlePreviews);

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
              One Year of Advancing Health Equity - test timing
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
          className={styles.RecentNewsRow}
          justifyContent="flex-start"
          align-items="center"
        >
          <Grid item xs={12}>
            <Typography
              className={styles.RecentNewsHeaderText}
              variant="h2"
              component="h3"
            >
              Recent news
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography
              className={styles.RecentNewsHeaderSubtext}
              variant="subtitle1"
              component="p"
            >
              News and stories from the Satcher Health Leadership Institute and
              beyond, sharing insights into the Health Equity movement.{" "}
              <a href={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}>
                What is health equity?
              </a>
              {/* 
              We’re working toward health equity, but can’t do it alone. Please
              join our effort to move the needle forward. */}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid
              container
              className={styles.RecentNewsItem}
              direction="row"
              justifyContent="space-around"
            >
              {recentArticles && !isLoading ? (
                recentArticles.map((article: Article) => {
                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={article.id}>
                      <NewsPreviewCard article={article} />
                    </Grid>
                  );
                })
              ) : (
                <ArticlesSkeleton
                  doPulse={!error}
                  numberLoading={numberOfArticlePreviews}
                />
              )}
            </Grid>

            <Box mt={5}>
              <Typography
                className={styles.PrioritizeHealthEquityHeaderSubtext}
                variant="body1"
                paragraph={true}
              >
                <ReactRouterLinkButton
                  url={NEWS_TAB_LINK}
                  className={styles.LearnMoreAboutHealthEquity}
                  displayName="View all articles"
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
