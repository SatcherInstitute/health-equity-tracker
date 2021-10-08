import React from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import styles from "./AboutUsPage.module.scss";
import { EXPLORE_DATA_PAGE_LINK } from "../../utils/urlutils";
import Hidden from "@material-ui/core/Hidden";
import { usePrefersReducedMotion } from "../../utils/usePrefersReducedMotion";
import { Helmet } from "react-helmet";
import LazyLoad from "react-lazyload";
import { DataSourceMetadataMap } from "../../data/config/MetadataMap";

function AimToGoItem(props: {
  src: string;
  alt: string;
  title: string;
  text: string;
}) {
  return (
    <Grid item xs={12} sm={12} md={4} className={styles.AimToGoItem}>
      <Grid
        container
        direction="column"
        alignItems="flex-start"
        justify="flex-start"
      >
        <Hidden smDown>
          <Grid item>
            <LazyLoad offset={300} height={255} once>
              <img
                className={styles.ImgAimToGo}
                src={props.src}
                alt={props.alt}
              />
            </LazyLoad>
          </Grid>
        </Hidden>
        <Grid item>
          <Typography
            className={styles.SubheaderL2Text}
            variant="h3"
            paragraph={true}
          >
            {props.title}
          </Typography>
        </Grid>
        <Grid item>
          <Typography
            className={styles.HeaderSubtextL2}
            variant="body2"
            paragraph
          >
            {props.text}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}

function TheProjectTab() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const numDataSources = Object.keys(DataSourceMetadataMap).length;

  return (
    <>
      <Helmet>
        <title>The Project - About Us - Health Equity Tracker</title>
      </Helmet>
      <h1 className={styles.ScreenreaderTitleHeader}>The Project</h1>
      <Grid container className={styles.Grid}>
        <Grid
          container
          className={styles.GridOutlinedImgRow}
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid
            item
            xs={12}
            sm={12}
            md={5}
            className={styles.GridVerticallyAlignedItem}
          >
            <Typography
              id="main"
              tabIndex={-1}
              className={styles.HeaderText}
              variant="h2"
              paragraph={true}
            >
              We're focused on equitable data.
            </Typography>
            <br />
            <Typography
              className={styles.HeaderSubtext}
              variant="body1"
              paragraph={true}
            >
              Health equity can't exist without equitable data. That's why we're
              aiming to collect health equity data from across the United States
              and centralize it all in one place.
            </Typography>
          </Grid>
          <Hidden smDown>
            <Grid item xs={12} sm={12} md={7} className={styles.HeaderImgItem}>
              <LazyLoad offset={300} height={644} once>
                <img
                  width="754"
                  height="644"
                  src="/img/stock/woman-kids.png"
                  className={styles.HeaderImg}
                  alt=""
                />
              </LazyLoad>
            </Grid>
          </Hidden>
        </Grid>

        <Grid
          container
          className={styles.GridOutlinedRow}
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid
            container
            className={styles.GridSubRow}
            direction="row"
            justify="space-around"
            alignItems="center"
          >
            <Grid
              item
              xs={12}
              sm={12}
              md={5}
              className={styles.GridVerticallyAlignedItem}
            >
              <Typography
                className={styles.SubheaderL1Text}
                variant="h2"
                paragraph={true}
              >
                Where we started
              </Typography>
              <Typography variant="body1" paragraph={true}>
                Prompted by the COVID-19 pandemic, the Health Equity Tracker was
                created in 2020 to aggregate up-to-date demographic data from
                the hardest-hit communities.
              </Typography>
              <Typography variant="body1" paragraph={true}>
                The Health Equity Tracker aims to give a detailed view of health
                outcomes by race, ethnicity, sex, socioeconomic status, and
                other critical factors. Our hope is that it will help
                policymakers understand what resources and support affected
                communities need to be able to improve their outcomes.
              </Typography>
            </Grid>

            <Grid item xs={12} sm={12} md={6}>
              <Grid
                container
                direction="row"
                justify="space-around"
                alignItems="flex-start"
                spacing={3}
              >
                <Grid item xs={12} sm={12} md={5}>
                  <Typography
                    className={styles.UnderlinedHeaderL2}
                    variant="h3"
                    paragraph={true}
                  >
                    {`${numDataSources} data sources`}
                  </Typography>
                  <Typography
                    className={styles.HeaderSubtextL3}
                    variant="body2"
                    paragraph={true}
                  >
                    HET currently aggregates data from{" "}
                    {`${numDataSources} data sources`} key data sources. We’ll
                    continue adding to these initial sources.
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={5}>
                  <Typography
                    className={styles.UnderlinedHeaderL2}
                    variant="h3"
                    paragraph={true}
                  >
                    15 variables
                  </Typography>
                  <Typography
                    className={styles.HeaderSubtextL3}
                    variant="body2"
                    paragraph={true}
                  >
                    Along with COVID-19 cases, hospitalizations and deaths, the
                    tracker also covers conditions like COPD, diabetes, SDOH,
                    and more.
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid
                    container
                    direction="row"
                    justify="space-around"
                    alignItems="flex-start"
                  >
                    <Grid item xs={12} sm={12} md={5}>
                      <Button
                        variant="contained"
                        color="primary"
                        className={styles.PrimaryButton}
                        href={EXPLORE_DATA_PAGE_LINK}
                      >
                        Explore the data
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid
            container
            className={styles.GridSubRow}
            direction="row"
            justify="space-around"
          >
            <Grid item xs={12}>
              <Typography className={styles.SubheaderL1Text} variant="h2">
                Where we aim to go
              </Typography>
            </Grid>
            <AimToGoItem
              src={
                prefersReducedMotion
                  ? "/img/animations/HET-lines-no-motion.gif"
                  : "/img/animations/HET-lines.gif"
              }
              alt=""
              title="Expand data"
              text="As we continue to expand our data sources and analyze the
            data, we will have more information to share on
            disparities and the equity impact of COVID-19."
            />
            <AimToGoItem
              src={
                prefersReducedMotion
                  ? "/img/animations/HET-fields-no-motion.gif"
                  : "/img/animations/HET-fields.gif"
              }
              alt=""
              title="Empower policy makers"
              text="We plan to develop policy templates for local, state, and
            federal policy makers, and help create actionable policies
            with diverse communities."
            />
            <AimToGoItem
              src={
                prefersReducedMotion
                  ? "/img/animations/HET-dots-no-motion.gif"
                  : "/img/animations/HET-dots.gif"
              }
              alt=""
              title="Measure progress"
              text="It’s important to track progress, so we plan to develop
            and publish more health equity reports and analyses."
            />
          </Grid>
        </Grid>

        <Grid
          container
          className={styles.GridOutlinedRow}
          direction="row"
          justify="space-around"
        >
          <Grid item xs={12}>
            <Typography className={styles.HeaderText} variant="h2">
              <i>We are committed to the following ethics</i>
            </Typography>
          </Grid>

          <Grid
            container
            item
            className={styles.GridSubRow}
            justify="space-around"
            alignItems="flex-start"
          >
            <Grid
              container
              item
              xs={12}
              sm={12}
              md={3}
              direction="column"
              justify="space-around"
            >
              <Grid item className={styles.CommittedToEthicsSubheaderItem}>
                <Typography
                  className={styles.SubheaderL2Text}
                  variant="h3"
                  align="left"
                >
                  Transparency & Accountability
                </Typography>
              </Grid>
              <Grid item>
                <Typography className={styles.HeaderSubtext} variant="body2">
                  We partner closely with diverse communities and are clear
                  about who interprets the data and how that shapes the overall
                  health narrative
                </Typography>
              </Grid>
            </Grid>

            <Grid
              container
              item
              xs={12}
              sm={12}
              md={3}
              direction="column"
              justify="space-around"
            >
              <Grid item className={styles.CommittedToEthicsSubheaderItem}>
                <Typography
                  className={styles.SubheaderL2Text}
                  variant="h3"
                  align="left"
                >
                  Community First
                </Typography>
              </Grid>
              <Grid item>
                <Typography className={styles.HeaderSubtext} variant="body2">
                  People and communities drive our work. By making sure we
                  collect data from underserved populations, we can help
                  highlight what policy changes are needed to boost these
                  communities.
                </Typography>
              </Grid>
            </Grid>

            <Grid
              container
              item
              xs={12}
              sm={12}
              md={3}
              direction="column"
              justify="space-around"
            >
              <Grid item className={styles.CommittedToEthicsSubheaderItem}>
                <Typography
                  className={styles.SubheaderL2Text}
                  variant="h3"
                  align="left"
                >
                  Open Access
                </Typography>
              </Grid>
              <Grid item>
                <Typography className={styles.HeaderSubtext} variant="body2">
                  We ensure community leaders partner with us and play an active
                  role in determining what data to use in making policy
                  recommendations
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default TheProjectTab;
