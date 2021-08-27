import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./AboutUsPage.module.scss";
import Typography from "@material-ui/core/Typography";
import Hidden from "@material-ui/core/Hidden";
import { Helmet } from "react-helmet";

function ContactUsTab() {
  return (
    <>
      <Helmet>
        <title>Contact Us - About Us - Health Equity Tracker</title>
      </Helmet>
      <h1 className={styles.ScreenreaderTitleHeader}>Contact Us</h1>
      <Grid container className={styles.Grid}>
        <Grid
          container
          className={styles.GridOutlinedImgRow}
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Hidden smDown>
            <Grid
              item
              xs={12}
              sm={12}
              md={4}
              className={styles.GridVerticallyAlignedItem}
            >
              <Typography
                id="main"
                tabIndex={-1}
                className={styles.ContactUsHeaderText}
                variant="h2"
              >
                Let's move
                <br aria-hidden="true" />
                equity <b style={{ fontWeight: 400 }}>forward</b>
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              md={8}
              className={styles.GridAlignRightItem}
            >
              <img
                src="img/pexels-mentatdgt-1206059 2.png"
                className={styles.ImgContactUsHeader}
                alt=""
              />
            </Grid>
          </Hidden>
        </Grid>

        <Grid
          container
          className={styles.GridOutlinedRow}
          justify="center"
          alignItems="center"
        >
          <Grid item xs={12} sm={12} md={8}>
            <Typography className={styles.ContactUsSubheaderText} variant="h3">
              Thank you for your interest in the Health Equity Tracker
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={5}
            className={styles.ContactUsCenteredTextItem}
          >
            <p>
              <b>For general requests:</b> please contact the Satcher Health
              Leadership Institute at{" "}
              <a href="mailto:shli@msm.edu">shli@msm.edu</a>
            </p>
            <p>
              <b>Mailing Address:</b>
              <br />
              Morehouse School of Medicine
              <br />
              Satcher Health Leadership Institute
              <br />
              720 Westview Drive SW
              <br />
              Atlanta, <span aria-label="Georgia">GA</span>{" "}
              <span aria-label="Zip Code 3 0 3 1 0">30310</span>
            </p>
            <p>
              <a href="tel:4047528654">(404) 752-8654</a>
            </p>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default ContactUsTab;
