import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./AboutUsPage.module.scss";
import Typography from "@material-ui/core/Typography";
import Hidden from "@material-ui/core/Hidden";

function ContactUsTab() {
  return (
    <>
      <title>Contact Us - About Us - Health Equity Tracker</title>
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
                variant="h1"
              >
                Let's move
                <br />
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
                alt="A group of female friends hug"
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
            <Typography className={styles.ContactUsSubheaderText} variant="h2">
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
              Leadership Institute at shli@msm.edu
            </p>
            <p>
              <b>Mailing Address:</b>
              <br />
              Satcher Health Leadership Institute
              <br />
              720 Westview Drive, SW
              <br />
              Atlanta, GA 30310
              <br />
              <br />
              (404) 752-8654
            </p>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default ContactUsTab;
