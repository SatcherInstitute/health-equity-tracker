import React from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import styles from "./AboutUsPage.module.scss";
import {
  COPD_US_SETTING,
  COVID_HOSP_NY_COUNTY_SETTING,
  COVID_VAX_US_SETTING,
  DATA_CATALOG_PAGE_LINK,
  DIABETES_US_SETTING,
  EXPLORE_DATA_PAGE_LINK,
  OPIOID_US_SETTING,
  POVERTY_US_SETTING,
  UNINSURANCE_US_SETTING,
} from "../../utils/internalRoutes";
import { usePrefersReducedMotion } from "../../utils/hooks/usePrefersReducedMotion";
import { Helmet } from "react-helmet-async";
import LazyLoad from "react-lazyload";
import { DataSourceMetadataMap } from "../../data/config/MetadataMap";
import { DropdownVarId, METRIC_CONFIG } from "../../data/config/MetricConfig";
import { DEMOGRAPHIC_BREAKDOWNS } from "../../data/query/Breakdowns";
import { LinkWithStickyParams } from "../../utils/urlutils";

function GoalListItem(props: {
  src?: string;
  alt?: string;
  title: string;
  text: string;
}) {
  return (
    <Grid
      container
      direction="column"
      justifyContent="flex-start"
      item
      sm={12}
      md={4}
      className={styles.GoalListItem}
      component="li"
    >
      {props.src && (
        <LazyLoad offset={300} height={255} once>
          <img className={styles.ImgAimToGo} src={props.src} alt={props.alt} />
        </LazyLoad>
      )}
      <Typography
        className={styles.SubheaderL2Text}
        variant="h3"
        paragraph={true}
        component="h4"
      >
        {props.title}
      </Typography>
      <Typography className={styles.HeaderSubtextL2} variant="body2" paragraph>
        {props.text}
      </Typography>
    </Grid>
  );
}

function TheProjectTab() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const numDataSources = Object.keys(DataSourceMetadataMap).length;
  // tally number of conditions (including sub-conditions like COVID) x # demographic options
  const numVariables =
    Object.keys(METRIC_CONFIG).reduce(
      (tally, conditionKey) =>
        (tally += METRIC_CONFIG[conditionKey as DropdownVarId].length),
      0
    ) * DEMOGRAPHIC_BREAKDOWNS.length;

  return (
    <>
      <Helmet>
        <title>The Project - About Us - Health Equity Tracker</title>
      </Helmet>
      <h2 className={styles.ScreenreaderTitleHeader}>The Project</h2>
      <Grid container className={styles.Grid} component="section">
        <Grid
          container
          className={styles.GridOutlinedImgRow}
          direction="row"
          justifyContent="center"
          alignItems="center"
          component="header"
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
              className={styles.HeaderText}
              variant="h2"
              paragraph={true}
              component="h3"
            >
              We're focused on equitable data.
            </Typography>
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
          <Grid item xs={12} sm={12} md={7} className={styles.HeaderImgItem}>
            <img
              width="754"
              height="644"
              src="/img/stock/woman-kids.png"
              className={styles.HeaderImg}
              alt=""
            />
          </Grid>
        </Grid>

        <Grid
          container
          className={styles.GridOutlinedRow}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid
            container
            className={styles.GridSubRow}
            direction="row"
            justifyContent="space-around"
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
                component="h3"
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
                outcomes by race, ethnicity, sex, and other critical factors.
                Our hope is that it will help policymakers understand what
                resources and support affected communities need to be able to
                improve their outcomes.
              </Typography>
            </Grid>

            <Grid item xs={12} sm={12} md={6}>
              <Grid
                container
                direction="row"
                justifyContent="space-around"
                alignItems="flex-start"
                spacing={3}
              >
                <Grid item xs={12} sm={12} md={5}>
                  <Typography
                    className={styles.UnderlinedHeaderL2}
                    variant="h3"
                    paragraph={true}
                    component="h4"
                  >
                    {`${numDataSources} data sources`}
                  </Typography>
                  <Typography
                    className={styles.HeaderSubtextL3}
                    variant="body2"
                    paragraph={true}
                  >
                    HET currently aggregates data from{" "}
                    <LinkWithStickyParams to={DATA_CATALOG_PAGE_LINK}>
                      {`${numDataSources}`} key data sources
                    </LinkWithStickyParams>
                    , including the CDC and the U.S. Census Bureau. We’ll
                    continue adding to these initial sources as data access and
                    quality improves.
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={5}>
                  <Typography
                    className={styles.UnderlinedHeaderL2}
                    variant="h3"
                    paragraph={true}
                    component="h4"
                  >
                    {numVariables} variables
                  </Typography>
                  <Typography
                    className={styles.HeaderSubtextL3}
                    variant="body2"
                    paragraph={true}
                  >
                    In addition to COVID-19{" "}
                    <LinkWithStickyParams
                      to={EXPLORE_DATA_PAGE_LINK + COVID_VAX_US_SETTING}
                    >
                      vaccinations,
                    </LinkWithStickyParams>{" "}
                    cases, deaths, and{" "}
                    <LinkWithStickyParams
                      to={EXPLORE_DATA_PAGE_LINK + COVID_HOSP_NY_COUNTY_SETTING}
                    >
                      hospitalizations by race to the county level
                    </LinkWithStickyParams>
                    , the tracker also covers chronic disease conditions like{" "}
                    <LinkWithStickyParams
                      to={EXPLORE_DATA_PAGE_LINK + COPD_US_SETTING}
                    >
                      COPD
                    </LinkWithStickyParams>{" "}
                    and{" "}
                    <LinkWithStickyParams
                      to={EXPLORE_DATA_PAGE_LINK + DIABETES_US_SETTING}
                    >
                      diabetes
                    </LinkWithStickyParams>
                    , behavioral health indicators such as{" "}
                    <LinkWithStickyParams
                      to={EXPLORE_DATA_PAGE_LINK + OPIOID_US_SETTING}
                    >
                      opioid and other substance misuse
                    </LinkWithStickyParams>
                    , and social and political determinants of health including{" "}
                    <LinkWithStickyParams
                      to={EXPLORE_DATA_PAGE_LINK + UNINSURANCE_US_SETTING}
                    >
                      uninsurance
                    </LinkWithStickyParams>{" "}
                    and{" "}
                    <LinkWithStickyParams
                      to={EXPLORE_DATA_PAGE_LINK + POVERTY_US_SETTING}
                    >
                      poverty
                    </LinkWithStickyParams>
                    <span aria-hidden={true}>.</span>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-around"
                    alignItems="flex-start"
                  >
                    <Grid item xs={12} sm={12} md={8} lg={5}>
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
            justifyContent="space-around"
          >
            <Grid item xs={12}>
              <Typography
                className={styles.SubheaderL1Text}
                variant="h2"
                component="h3"
              >
                Where we aim to go
              </Typography>
            </Grid>
            <Grid container component="ul" className={styles.GoalList}>
              <GoalListItem
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
              <GoalListItem
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
              <GoalListItem
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
        </Grid>

        <Grid
          container
          className={styles.GridOutlinedRow}
          direction="row"
          justifyContent="space-around"
        >
          <Grid
            container
            item
            className={styles.GridSubRow}
            justifyContent="space-around"
            alignItems="flex-start"
          >
            <Typography
              className={styles.HeaderText}
              variant="h2"
              component="h3"
            >
              <i>We are committed to the following ethics</i>
            </Typography>
            <Grid container component="ul" className={styles.GoalList}>
              <GoalListItem
                title="Transparency & Accountability"
                text="We partner closely with diverse communities and are clear
                about who interprets the data and how that shapes the overall
                health narrative."
              />
              <GoalListItem
                title="Community First"
                text="People and communities drive our work. By making sure we
                collect data from underserved populations, we can help
                highlight what policy changes are needed to boost these
                communities."
              />
              <GoalListItem
                title="Open Access"
                text="We ensure community leaders partner with us and play an active
                role in determining what data to use in making policy
                recommendations."
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default TheProjectTab;
