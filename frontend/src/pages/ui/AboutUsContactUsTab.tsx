import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import styles from "../AboutUsPage.module.scss";
import Button from "@material-ui/core/Button";
import ArrowForward from "@material-ui/icons/ArrowForward";
import Divider from "@material-ui/core/Divider";

function AboutUsContactUsTab() {
  return (
    <Grid container>
      <Grid item className={styles.GreyGridItem}>
        <h1>Thank you for interest in the Health Equity Tracker</h1>
      </Grid>
      <p>
        <b>For general requests, contact:</b> info@healthequitytracker.org
      </p>
      <p>
        <b>All media and interview requests</b>, please contact Mahia Valle, at
        Morehouse School of Medicine: mvalle@msm.edu
      </p>
      <p>
        <b>Mailing Address:</b>
        <br />
        Satcher Health Leadership Institute
        <br />
        720 Westview Drive, SW
        <br />
        Atlanta, GA 30310
      </p>
      <p>(404) 752-8654</p>
    </Grid>
  );
}

export default AboutUsContactUsTab;
