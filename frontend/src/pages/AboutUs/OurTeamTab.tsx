import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import styles from "./AboutUsPage.module.scss";
import { Helmet } from "react-helmet-async";
import LazyLoad from "react-lazyload";
import {
  GOOGLE_FELLOWS,
  HE_TASKFORCE,
  LEADERSHIP_TEAM,
  PARTNERS,
} from "./OurTeamData";

function OurTeamTab() {
  return (
    <>
      <Helmet>
        <title>Our Team - About Us - Health Equity Tracker</title>
      </Helmet>
      <h2 className={styles.ScreenreaderTitleHeader}>Our Team</h2>
      <Grid container className={styles.Grid}>
        <Grid container className={styles.GridRowHeaderText}>
          <Grid item xs={12} sm={8} md={6} lg={10} xl={8}>
            <Typography
              id="main"
              className={styles.OurTeamHeaderText}
              align="left"
              variant="h2"
              component="h3"
            >
              We're working towards a better tomorrow.
            </Typography>
            <Typography
              className={styles.HeaderSubtext}
              variant="subtitle1"
              component="p"
            >
              We strongly support breaking down systemic barriers in order to
              achieve a more healthy, equitable, and inclusive society.
            </Typography>
          </Grid>
        </Grid>

        <Grid container className={styles.GridRow} component={"section"}>
          <Grid item xs={12}>
            <Typography variant="h3" align="left" className={styles.TeamHeader}>
              Leadership Team
            </Typography>
          </Grid>
          <Grid item>
            <Grid
              container
              justifyContent="space-around"
              className={styles.GridSubRow}
              component="ul"
            >
              {LEADERSHIP_TEAM.map((leader) => {
                return (
                  <Grid
                    key={leader.name}
                    item
                    xs={12}
                    sm={6}
                    md={3}
                    className={styles.TextProfile}
                    component="li"
                  >
                    <LazyLoad offset={300} height={181} once>
                      <img
                        src={leader.imageUrl}
                        alt=""
                        className={styles.ProfileImg}
                      />
                    </LazyLoad>

                    <div className={styles.MemberName}>{leader.name}</div>
                    <div className={styles.MemberRole}>{leader.role}</div>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={styles.GridRow} component={"section"}>
          <Grid item xs={12}>
            <Typography variant="h3" align="left" className={styles.TeamHeader}>
              Google.org Fellows
            </Typography>
          </Grid>
          <Grid item>
            <Grid
              container
              justifyContent="space-around"
              className={styles.GridSubRow}
              component="ul"
            >
              {GOOGLE_FELLOWS.map((fellow) => {
                return (
                  <Grid
                    item
                    className={styles.TextProfile}
                    key={fellow.name}
                    component="li"
                  >
                    {fellow.link && (
                      <a
                        className={styles.MemberName}
                        href={fellow.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {fellow.text}
                      </a>
                    )}

                    <div className={styles.MemberName}>{fellow.name}</div>

                    <div className={styles.MemberRole}>{fellow.role}</div>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={styles.GridRow} component={"section"}>
          <Grid item xs={12}>
            <Typography variant="h3" align="left" className={styles.TeamHeader}>
              Health Equity Task Force
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Grid
              container
              justifyContent="space-around"
              className={styles.GridSubRow}
              component="ul"
            >
              {HE_TASKFORCE.map((taskforceName) => (
                <Grid
                  item
                  className={styles.TextProfile}
                  key={taskforceName}
                  component="li"
                >
                  <span className={styles.MemberName}>{taskforceName}</span>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={styles.GridRow} component={"section"}>
          <Grid item xs={12}>
            <Typography variant="h3" align="left" className={styles.TeamHeader}>
              Partners
            </Typography>
          </Grid>
          <LazyLoad offset={300} height={200} once>
            <Grid
              item
              container
              xs={12}
              className={styles.GridSubRow}
              component="ul"
            >
              {PARTNERS.map((partner) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  xl={2}
                  container
                  justifyContent="space-around"
                  key={partner.url}
                  component="li"
                >
                  <a href={partner.url}>
                    <img
                      src={partner.imageUrl}
                      alt={partner.alt}
                      className={styles.PartnerImg}
                    />
                  </a>
                </Grid>
              ))}
            </Grid>
          </LazyLoad>
        </Grid>
      </Grid>
    </>
  );
}
export default OurTeamTab;
