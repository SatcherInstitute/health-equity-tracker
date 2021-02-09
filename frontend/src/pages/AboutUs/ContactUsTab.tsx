import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./AboutUsPage.module.scss";

/* TODO - Align with mocks, Clean up CSS */
function ContactUsTab() {
  return (
    <>
      <Grid item className={styles.GreyGridItem}>
        <div
          style={{
            width: "600px",
            margin: "auto",
            fontSize: "40px",
            textAlign: "center",
          }}
        >
          Thank you for interest in the Health Equity Tracker
        </div>
      </Grid>
      <Grid
        container
        justify="space-around"
        className={styles.Grid}
        style={{ textAlign: "left" }}
      >
        <p>
          <b>For general requests, contact:</b> info@healthequitytracker.org
        </p>
        <p>
          <b>All media and interview requests</b>, please contact Mahia Valle,
          at Morehouse School of Medicine: mvalle@msm.edu
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
    </>
  );
}

export default ContactUsTab;
