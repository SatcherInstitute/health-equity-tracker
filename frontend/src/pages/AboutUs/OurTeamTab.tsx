import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./AboutUsPage.module.scss";

/* TODO - Align with mocks, Clean up CSS */
function OurTeamTab() {
  return (
    <Grid container className={styles.Grid}>
      <span style={{ fontSize: "32px", textAlign: "center", margin: "20px" }}>
        We strongly support breaking down systemic barriers in order to achieve
        a more healthy, equitable, and inclusive society.
      </span>
      <span className={styles.UnderlinedHeader}>Leadership Team</span>
      <img src="img/MSM.png" alt="Images of leadership team" />
      <span className={styles.UnderlinedHeader}>Product Team</span>
      <Grid container>
        {Array.from(Array(20)).map((i) => (
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
        {Array.from(Array(20)).map((i) => (
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
        <img src="img/PartnerSatcher.png" alt="alt" />
        <img src="img/PartnerGilead.png" alt="alt" />
        <img src="img/PartnerCdc.png " alt="alt" />
        <img src="img/PartnerGoogle.png" alt="alt" />
      </Grid>
    </Grid>
  );
}
export default OurTeamTab;
