import React from "react";
import styles from "./LandingPage.module.scss";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import {
  ARTICLES_KEY_4,
  fetchLandingPageNewsData,
  ReactRouterLinkButton,
  REACT_QUERY_OPTIONS,
} from "../../utils/urlutils";
import {
  EXPLORE_DATA_PAGE_LINK,
  NEWS_TAB_LINK,
} from "../../utils/internalRoutes";
import { Box, TextField, useMediaQuery, useTheme } from "@material-ui/core";
import { Helmet } from "react-helmet-async";
import LazyLoad from "react-lazyload";
import NewsPreviewCard from "../WhatIsHealthEquity/News/NewsPreviewCard";
import { useQuery } from "react-query";
import { Article } from "../WhatIsHealthEquity/NewsTab";
import { ArticlesSkeleton } from "../WhatIsHealthEquity/News/AllPosts";
import { usePrefersReducedMotion } from "../../utils/hooks/usePrefersReducedMotion";
import { urlMap } from "../../utils/externalUrls";
import { Link } from "react-router-dom";

function LandingPage() {
  const { isLoading, error, data }: any = useQuery(
    ARTICLES_KEY_4,
    fetchLandingPageNewsData,
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
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <>
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
          <Grid
            item
            className={styles.HeaderTextItem}
            xs={12}
            sm={12}
            md={6}
            lg={7}
          >
            <Typography
              id="main"
              className={styles.HeaderText}
              variant="h2"
              paragraph={true}
              component="h3"
            >
              Better Data for Equity
            </Typography>
            <Typography
              className={styles.HeaderSubtext}
              variant="body1"
              paragraph={true}
            >
              Our tracker puts Health Equity first. Envisioned by the Satcher
              Health Leadership Institute, the Health Equity Tracker is designed
              to boost inclusivity, highlight at-risk populations, alert users
              to existing inequities in health data, and so much more.
            </Typography>

            <Typography
              className={styles.HeaderSubtext}
              variant="body1"
              paragraph={true}
            >
              Our goal for this tool is to support the work being done by
              policymakers, community leaders, researchers, and ultimately all
              champions for health equity.{" "}
              <Link to={EXPLORE_DATA_PAGE_LINK}>Explore our tracker today</Link>{" "}
              and find data to help your community reach their best level of
              health.
            </Typography>

            <Box mt={5}>
              <Button
                id="landingPageCTA"
                variant="contained"
                color="primary"
                className={styles.ExploreDataButton}
                href={EXPLORE_DATA_PAGE_LINK}
              >
                Explore the data
              </Button>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={6}
            lg={5}
            className={styles.HeaderImgItem}
          >
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
              beyond
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
              How do I use the Health Equity Tracker?
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
                  Take a Tour of the Data
                </h4>
                <p className={styles.HowToStepTextSubheader}>
                  New to the Health Equity Tracker? Watch a short video demo
                  that highlights major features of the platform.
                </p>
              </Grid>
              <Grid item xs={12} sm={12} md={8}>
                <LazyLoad offset={300} once>
                  <iframe
                    className={styles.ResourceVideoEmbed}
                    width="100%"
                    height="420px"
                    src="https://www.youtube.com/embed/XBoqT9Jjc8w"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write;
                encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
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
                <h4 className={styles.HowToStepTextHeader}>
                  Search by completing the sentence
                </h4>
                <p className={styles.HowToStepTextSubheader}>
                  Select variables you’re interested in to complete the sentence
                  and explore the data.
                </p>
              </Grid>
              <Grid item xs={12} sm={12} md={8}>
                <LazyLoad offset={300} once>
                  <video
                    autoPlay={!prefersReducedMotion}
                    loop
                    muted
                    playsInline
                    className={styles.HowToStepImg}
                  >
                    <source src="videos/search-by.mp4" type="video/mp4" />
                  </video>
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
                  <video
                    autoPlay={!prefersReducedMotion}
                    loop
                    muted
                    playsInline
                    className={styles.HowToStepImg}
                  >
                    <source src="videos/filters.mp4" />
                  </video>
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
                    investigate the data more closely. If a state or county is
                    gray, that means there’s no data currently available.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} sm={12} md={8}>
                <LazyLoad offset={300} once>
                  <video
                    autoPlay={!prefersReducedMotion}
                    loop
                    muted
                    playsInline
                    className={styles.HowToStepImg}
                  >
                    <source src="videos/explore-map.mp4" />
                  </video>
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

        <Grid
          container
          className={styles.NewsletterSignUpRow}
          justifyContent="center"
          component={"aside"}
        >
          <section className={styles.NewsletterSignUpBox}>
            <h4 className={styles.NewsletterSignUpHeader}>
              Sign up for our newsletter:
            </h4>

            <form
              action={urlMap.newsletterSignup}
              method="post"
              target="_blank"
            >
              <Grid container justifyContent="center" alignContent="center">
                <Grid item>
                  <TextField
                    id="Enter email address to sign up" // Accessibility label (is it tho?)
                    name="MERGE0"
                    variant="outlined"
                    className={styles.EmailTextField}
                    type="email"
                    aria-label="Enter Email Address for Newsletter signup"
                    placeholder="Enter email address"
                  />
                </Grid>
                <Grid item>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    className={styles.EmailAddressFormSubmit}
                    aria-label="Sign Up for Newsletter in a new window"
                  >
                    Sign up
                  </Button>
                </Grid>
              </Grid>
            </form>
          </section>
        </Grid>
      </Grid>
    </>
  );
}

export default LandingPage;
