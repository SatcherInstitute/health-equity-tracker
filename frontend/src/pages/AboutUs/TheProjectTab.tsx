import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import styles from "./AboutUsPage.module.scss";
import { EXPLORE_DATA_PAGE_LINK } from "../../utils/urlutils";

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
          <Grid item xs={5} className={styles.GridVerticallyAlignedItem}>
            <Typography className={styles.HeaderText}>
              We're focused on equitable data.
            </Typography>
            <br />
            <Typography className={styles.HeaderSubtext}>
              <p>
                Health equity can't exist without equitable data. That's why
                we're aiming to collect health equity data from across the
                United States and centralize it all in one place.
              </p>
            </Typography>
          </Grid>
          <Grid item xs={7} className={styles.GridAlignRightItem}>
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
            <Grid item xs={5} className={styles.GridVerticallyAlignedItem}>
              <Typography className={styles.SubheaderL1Text}>
                Where we started
              </Typography>
              <Typography>
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

            <Grid item xs={7} className={styles.GridCenteredItem}>
              <Grid
                container
                direction="row"
                justify="space-around"
                alignItems="flex-start"
                xs={12}
              >
                <Grid item xs={5}>
                  <Typography className={styles.UnderlinedHeaderL2}>
                    5 data sources
                  </Typography>
                  <Typography className={styles.HeaderSubtextL3}>
                    <p>
                      HET currently aggregates data from 5 key data sources.
                      We’ll continue adding to these initial sources.
                    </p>
                  </Typography>
                </Grid>
                <Grid item xs={5}>
                  <Typography className={styles.UnderlinedHeaderL2}>
                    15 variables
                  </Typography>
                  <Typography className={styles.HeaderSubtextL3}>
                    <p>
                      Along with COVID-19 cases, hospitalizations and deaths,
                      the tracker also covers conditions like COPD, asthma,
                      diabetes, hypertension, obesity, SDOH, and more
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
                    <Grid item xs={5}>
                      <a
                        href={EXPLORE_DATA_PAGE_LINK}
                        className={styles.PrimaryButton}
                      >
                        Explore the data
                      </a>
                    </Grid>
                    <Grid item xs={5}></Grid>
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
              <Typography className={styles.SubheaderL1Text}>
                Where we aim to go
              </Typography>
            </Grid>
            <Grid item xs={4} className={styles.AimToGoItem}>
              <Grid
                container
                direction="column"
                alignItems="flex-start"
                justify="flex-start"
              >
                <Grid item>
                  <img
                    className={styles.ImgAimToGo}
                    src="img/LINES-2@2x 4.png"
                    alt="Decorative lines"
                  />
                </Grid>
                <Grid item>
                  <Typography className={styles.SubheaderL2Text}>
                    Expand data
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography className={styles.HeaderSubtextL2}>
                    <p>
                      As we continue to expand our data sources and analyze the
                      data, we will have more information to share on
                      disparities and the equity impact of COVID-19.
                    </p>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4} className={styles.AimToGoItem}>
              <Grid
                container
                direction="column"
                alignItems="flex-start"
                justify="flex-start"
              >
                <Grid item>
                  <img
                    className={styles.ImgAimToGo}
                    src="img/Asset 3@2x 4.png"
                    alt="Decorative thick lines"
                  />
                </Grid>
                <Grid item>
                  <Typography className={styles.SubheaderL2Text}>
                    Empower policy makers
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography className={styles.HeaderSubtextL2}>
                    <p>
                      We plan to develop policy templates for local, state, and
                      federal policy makers, and help create actionable policies
                      with diverse communities
                    </p>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4} className={styles.AimToGoItem}>
              <Grid
                container
                direction="column"
                alignItems="flex-start"
                justify="flex-start"
              >
                <Grid item>
                  <img
                    className={styles.ImgAimToGo}
                    src="img/Dots_1@2x 5.png"
                    alt="Decorative dots"
                  />
                </Grid>
                <Grid item>
                  <Typography className={styles.SubheaderL2Text}>
                    Measure progress
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography className={styles.HeaderSubtextL2}>
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
            <Typography className={styles.HeaderText}>
              <i>We are committed to the following ethics</i>
            </Typography>
          </Grid>
          <Grid
            container
            className={styles.GridSubRow}
            direction="row"
            justify="space-around"
          >
            <Grid item xs={3} className={styles.GridAlignLeftItem}>
              <Typography className={styles.SubheaderL2Text}>
                Transparency & Accountability
              </Typography>
            </Grid>
            <Grid item xs={3} className={styles.GridAlignLeftItem}>
              <Typography className={styles.SubheaderL2Text}>
                Community first
              </Typography>
            </Grid>
            <Grid item xs={3} className={styles.GridAlignLeftItem}>
              <Typography className={styles.SubheaderL2Text}>
                Open Access
              </Typography>
            </Grid>
          </Grid>
          <Grid
            container
            className={styles.GridSubRow}
            direction="row"
            justify="space-around"
          >
            <Grid item xs={3}>
              <Typography className={styles.HeaderSubtext}>
                We partner closely with diverse communities and are clear about
                who interprets the data and how that shapes the overall health
                narrative
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography className={styles.HeaderSubtext}>
                People and communities drive our work. By making sure we collect
                data from underserved populations, we can help highlight what
                policy changes are needed to boost these communities.
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography className={styles.HeaderSubtext}>
                We ensure community leaders partner with us and play an active
                role in determining what data to use in making policy
                recommendations
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default TheProjectTab;
