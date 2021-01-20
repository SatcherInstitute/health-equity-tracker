import React from "react";
import styles from "./PreLaunchSiteContent.module.scss";
import MaterialTheme from "../../styles/MaterialTheme";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { ThemeProvider } from "@material-ui/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import AppBanner from "../../utils/AppBanner";

// TODO: merge this content into the LandingPage.tsx and delete this file.
function PreLaunchSiteContent() {
  return (
    <ThemeProvider theme={MaterialTheme}>
      <CssBaseline />
      <div className={styles.App}>
        <div className={styles.Content}>
          <AppBar position="static" style={{ background: "#FFFFFF" }}>
            <Toolbar>
              <img width="40px" alt="Logo" src="img/logo.svg" />
              <Typography variant="h6" className={styles.HomeLogo}>
                Health Equity Tracker
              </Typography>
            </Toolbar>
          </AppBar>
          <AppBanner
            text={"Stay tuned! The Health Equity Tracker is coming soon"}
          />
          <Grid container justify="space-around" className={styles.Grid}>
            <Grid item xs={6}>
              <div className={styles.PreLaunchSnippet}>
                <Typography
                  variant="h6"
                  align="left"
                  style={{ fontSize: "44px", textAlign: "left" }}
                >
                  Health Equity Tracker
                </Typography>
                <p className={styles.PreLaunchText}>
                  We aim to collect and centralize health inequity data from
                  across the United States relating to race, ethnicity, and
                  socio-economic status, including information on comorbidities,
                  COVID-19 deaths, hospital admissions, outcomes, and more.
                </p>
              </div>
            </Grid>
            <Grid item xs={6} className={styles.MapImage}>
              <img
                width="100%"
                alt="Placeholder map"
                src="img/LandingMapImage.svg"
              />
            </Grid>
          </Grid>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default PreLaunchSiteContent;
