import React from "react";
import styles from "./App.module.scss";
import MaterialTheme from "./styles/MaterialTheme";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { ThemeProvider } from "@material-ui/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

function PreLaunchSiteContent() {
  return (
    <ThemeProvider theme={MaterialTheme}>
      <CssBaseline />
      <div className={styles.App}>
        <div className={styles.Content}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" className={styles.HomeLogo}>
                Health Equity Tracker
              </Typography>
            </Toolbar>
          </AppBar>
          <Typography variant="h6">Coming soon!</Typography>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default PreLaunchSiteContent;
