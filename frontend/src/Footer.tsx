import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./Footer.module.scss";
import Button from "@material-ui/core/Button";
import {
  EXPLORE_DATA_PAGE_LINK,
  DATA_CATALOG_PAGE_LINK,
} from "./utils/urlutils";

function ImageButton(props: { src: string; alt: string; link: string }) {
  return (
    <Button
      className={styles.ImageButton}
      onClick={() => (window.location.href = props.link)}
    >
      <img src={props.src} alt={props.alt} />
    </Button>
  );
}

function Footer() {
  return (
    <div className={styles.Footer}>
      <div className={styles.FooterContent}>
        <Grid container justify="space-between" alignItems="flex-start">
          <Grid item xs={12} sm={12} md={4} className={styles.FooterGrid}>
            <Grid container className={styles.Logos}>
              <Grid item>
                <ImageButton
                  link="http://www.healthequitytracker.org"
                  src="/img/logos/HET_logo.png"
                  alt="Health Equity Tracker"
                />
              </Grid>
              <Grid item>
                <Grid container justify="flex-start" alignItems="flex-start">
                  <Grid item>
                    <img
                      src="/img/logos/HET_text.png"
                      alt="Health Equity Tracker"
                    />
                    <Grid container justify="flex-start">
                      <Grid item>
                        <ImageButton
                          link="http://www.youtube.com"
                          src="/img/logos/youtube_green.png"
                          alt="YouTube"
                        />
                      </Grid>
                      <Grid item>
                        <ImageButton
                          link="http://www.linkedin.com"
                          src="/img/logos/linkedIn_green.png"
                          alt="LinkedIn"
                        />
                      </Grid>
                      <Grid item>
                        <ImageButton
                          link="http://www.twitter.com"
                          src="/img/logos/twitter_green.png"
                          alt="Twitter"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            xs={8}
            sm={12}
            md={8}
            lg={6}
            xl={4}
            className={styles.LinksContainer}
          >
            <Grid
              className={styles.Links}
              justify="space-around"
              alignItems="center"
              container
            >
              <Grid item>
                <Button
                  onClick={() =>
                    (window.location.href = EXPLORE_DATA_PAGE_LINK)
                  }
                >
                  Explore Data
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={() =>
                    (window.location.href = DATA_CATALOG_PAGE_LINK)
                  }
                >
                  Downloads and Methods
                </Button>
              </Grid>
              <Grid item>
                <Button onClick={() => (window.location.href = "")}>
                  FAQs
                </Button>
              </Grid>
              <Grid item>
                <Button onClick={() => (window.location.href = "")}>
                  Contact Us
                </Button>
              </Grid>
              <Grid item>
                <Button onClick={() => (window.location.href = "")}>
                  Terms of Use
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default Footer;
