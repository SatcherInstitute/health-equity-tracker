import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./WhatIsHealthEquityPage.module.scss";
import { Typography } from "@material-ui/core";
import { Helmet } from "react-helmet-async";
import { RESOURCES } from "./ResourcesData";

function ResourcesTab() {
  return (
    <>
      <Helmet>
        <title>
          Health Equity Resources - What Is Health Equity? - Health Equity
          Tracker
        </title>
      </Helmet>
      <h2 className={styles.ScreenreaderTitleHeader}>
        Health Equity Resources
      </h2>
      <Grid container className={styles.Grid}>
        <Grid container className={styles.ResourcesTabSection}>
          <Grid item xs={12} sm={12} md={3}>
            <Typography
              id="main"
              tabIndex={-1}
              className={styles.ResourcesTabHeaderText}
              variant="h2"
            >
              Resources
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={9}>
            <Grid container>
              <Grid item>
                <ul className={styles.ResourcesTabList}>
                  {RESOURCES.map((resource) => (
                    <li
                      className={styles.ResourcesTabListItem}
                      key={resource.name}
                    >
                      <a href={resource.url}>{resource.name}</a>
                    </li>
                  ))}
                </ul>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default ResourcesTab;
