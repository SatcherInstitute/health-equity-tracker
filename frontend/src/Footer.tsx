import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./Footer.module.scss";

function Footer() {
  return (
    <div className={styles.Footer}>
      <Grid container justify="space-around" className={styles.FooterGrid}>
        <Grid item xs={5} className={styles.FooterColumn}>
          <p>
            <b>Health Equity Tracker</b>
            <br />
            (c) 2020
            <br />
            Policy & Terms
          </p>
        </Grid>
        <Grid item xs={2} className={styles.FooterColumn}>
          <p>
            <b>About HET</b>
            <br />
            Contact Us
            <br />
            FAQ
            <br />
            Resource
            <br />
          </p>
        </Grid>
        <Grid item xs={2} className={styles.FooterColumn}>
          <p>
            <b>Sources</b>
            <br />
            Dashboard
            <br />
            Features
            <br />
            Contributors
          </p>
        </Grid>
        <Grid item xs={2} className={styles.FooterColumn}>
          <p>
            <b>SHLI</b>
          </p>
        </Grid>
      </Grid>
    </div>
  );
}

export default Footer;
