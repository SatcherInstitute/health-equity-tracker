import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import styles from "./AboutUsPage.module.scss";
import Button from "@material-ui/core/Button";

function OurTeamTab() {
  return (
    <Grid container className={styles.Grid}>
      <span style={{ fontSize: "32px", textAlign: "center", margin: "20px" }}>
        We strongly support breaking down systemic barriers in order to achieve
        a more healthy, equitable, and inclusive society.
      </span>
      <span className={styles.UnderlinedHeader}>Leadership Team</span>
      <img src="img/MSM.png" />
      <span className={styles.UnderlinedHeader}>Product Team</span>
      <Grid container>
        {[
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
        ].map((i) => (
          <Grid item xs={3}>
            <span style={{ fontSize: "16px", fontWeight: 500 }}>
              Person {i}
            </span>
            <p>Name of role</p>
          </Grid>
        ))}
      </Grid>
      <span className={styles.UnderlinedHeader}>
        Health Equity Task Force Members
      </span>
      <Grid container>
        {[
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
        ].map((i) => (
          <Grid item xs={3}>
            <span style={{ fontSize: "16px", fontWeight: 500 }}>
              Person {i}
            </span>
            <p>Name of role</p>
          </Grid>
        ))}
      </Grid>
      <span className={styles.UnderlinedHeader}>Partners</span>
      <Grid container>
        <img src="img/PartnerSatcher.png" />
        <img src="img/PartnerGilead.png" />
        <img src="img/PartnerCdc.png" />
        <img src="img/PartnerGoogle.png" />
      </Grid>
    </Grid>
  );
}
export default OurTeamTab;
