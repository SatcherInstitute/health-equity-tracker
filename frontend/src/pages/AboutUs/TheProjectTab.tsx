import React from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import styles from "./AboutUsPage.module.scss";
import {
  LinkWithStickyParams,
  EXPLORE_DATA_PAGE_LINK,
} from "../../utils/urlutils";

function TheProjectTab() {
  return (
    <>
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
              variant="h1"
            >
              We're focused on equitable data.
            </Typography>
            <br />
            <Typography className={styles.HeaderSubtext} variant="body1">
              <p>
                Health equity can't exist without equitable data. That's why
                we're aiming to collect health equity data from across the
                United States and centralize it all in one place.
              </p>
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={7}
            className={styles.GridAlignRightItem}
          >
            <img
              src="img/pexels-ketut-subiyanto-4473871 1.png"
              className={styles.ImgHeaderGridItem}
              alt="A woman laying with her two children"
            />
          </Grid>
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
              <Typography className={styles.SubheaderL1Text} variant="h1">
                Where we started
              </Typography>
              <Typography variant="body1">
                <p>
                  Prompted by the COVID-19 pandemic, the Health Equity Tracker
                  was created in 2020 to aggregate up-to-date demographic data
                  from the hardest-hit communities.
                </p>
                <p>
                  The Health Equity Tracker aims to give a detailed view of
                  health outcomes by race, ethnicity, gender, socioeconomic
                  status, and other critical factors. Our hope is that it will
                  help policymakers understand what resources and support
                  affected communities need to be able to improve their
                  outcomes.
                </p>
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={12}
              md={7}
              className={styles.GridCenteredItem}
            >
              <Grid
                container
                direction="row"
                justify="space-around"
                alignItems="flex-start"
                xs={12}
              >
                <Grid item xs={12} sm={12} md={5}>
                  <Typography
                    className={styles.UnderlinedHeaderL2}
                    variant="h2"
                  >
                    5 data sources
                  </Typography>
                  <Typography
                    className={styles.HeaderSubtextL3}
                    variant="body2"
                  >
                    <p>
                      HET currently aggregates data from 5 key data sources.
                      We’ll continue adding to these initial sources.
                    </p>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={5}>
                  <Typography
                    className={styles.UnderlinedHeaderL2}
                    variant="h2"
                  >
                    15 variables
                  </Typography>
                  <Typography
                    className={styles.HeaderSubtextL3}
                    variant="body2"
                  >
                    <p>
                      Along with COVID-19 cases, hospitalizations and deaths,
                      the tracker also covers conditions like COPD, diabetes,
                      SDOH, and more
                    </p>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid
                    container
                    direction="row"
                    justify="space-around"
                    alignItems="flex-start"
                    xs={12}
                  >
                    <Grid item xs={12} sm={12} md={5}>
                      <LinkWithStickyParams
                        to={EXPLORE_DATA_PAGE_LINK}
                        class={styles.NoUnderline}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          className={styles.PrimaryButton}
                        >
                          Explore the data
                        </Button>
                      </LinkWithStickyParams>
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
              <Typography className={styles.SubheaderL1Text} variant="h1">
                Where we aim to go
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={4} className={styles.AimToGoItem}>
              <Grid
                container
                direction="column"
                alignItems="flex-start"
                justify="flex-start"
              >
                <Grid item>
                  <img
                    className={styles.ImgAimToGo}
                    src="img/HET_Overlapping_Lines_v4_1000px.gif"
                    alt="Decorative lines"
                  />
                </Grid>
                <Grid item>
                  <Typography className={styles.SubheaderL2Text} variant="h2">
                    Expand data
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    className={styles.HeaderSubtextL2}
                    variant="body2"
                  >
                    <p>
                      As we continue to expand our data sources and analyze the
                      data, we will have more information to share on
                      disparities and the equity impact of COVID-19.
                    </p>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={12} md={4} className={styles.AimToGoItem}>
              <Grid
                container
                direction="column"
                alignItems="flex-start"
                justify="flex-start"
              >
                <Grid item>
                  <img
                    className={styles.ImgAimToGo}
                    src="img/HET_Fields_1_v2_1000px.gif"
                    alt="Decorative thick lines"
                  />
                </Grid>
                <Grid item>
                  <Typography className={styles.SubheaderL2Text} variant="h2">
                    Empower policy makers
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    className={styles.HeaderSubtextL2}
                    variant="body2"
                  >
                    <p>
                      We plan to develop policy templates for local, state, and
                      federal policy makers, and help create actionable policies
                      with diverse communities
                    </p>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={12} md={4} className={styles.AimToGoItem}>
              <Grid
                container
                direction="column"
                alignItems="flex-start"
                justify="flex-start"
              >
                <Grid item>
                  <img
                    className={styles.ImgAimToGo}
                    src="img/HET_Dots_1_v3_1000px.gif"
                    alt="Decorative dots"
                  />
                </Grid>
                <Grid item>
                  <Typography className={styles.SubheaderL2Text} variant="h2">
                    Measure progress
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    className={styles.HeaderSubtextL2}
                    variant="body2"
                  >
                    <p>
                      It’s important to track progress, so we plan to develop
                      and publish more health equity reports and analyses.
                    </p>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid
          container
          className={styles.GridOutlinedRow}
          direction="row"
          justify="space-around"
        >
          <Grid item xs={12}>
            <Typography className={styles.HeaderText} variant="h1">
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
                <Typography className={styles.SubheaderL2Text} variant="h2">
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
                <Typography className={styles.SubheaderL2Text} variant="h2">
                  Community first
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
                <Typography className={styles.SubheaderL2Text} variant="h2">
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
