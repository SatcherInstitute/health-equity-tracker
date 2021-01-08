import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import styles from "../AboutUsPage.module.scss";
import Button from "@material-ui/core/Button";

function AboutUsOurTeamTab() {
  return (
    <>
      <h3>
        We strongly support breaking down systemic barriers in order to achieve
        a more healthy, equitable, and inclusive society.
      </h3>
      <span className={styles.UnderlinedHeader}>Leadership Team</span>
      <img src="img/MSM.png" />
      <span className={styles.UnderlinedHeader}>Product Team</span>
      <Grid container>
        <Grid item xs={3}>
          <h6>Person</h6>
          <p>Name of role</p>
        </Grid>
      </Grid>
      <span className={styles.UnderlinedHeader}>
        Health Equity Task Force Members
      </span>
      <Grid container>
        <Grid item xs={3}>
          <h6>Person</h6>
          <p>Name of role</p>
        </Grid>
      </Grid>
      <span className={styles.UnderlinedHeader}>Partners</span>
      <img src="img/PartnerSatcher.png" />
      <img src="img/PartnerGilead.png" />
      <img src="img/PartnerCdc.png" />
      <img src="img/PartnerGoogle.png" />
    </>
  );
}
export default AboutUsOurTeamTab;
