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

function LinkGridItem(props: { text: string; link: string }) {
  return (
    <Grid item>
      <Button onClick={() => (window.location.href = props.link)}>
        {props.text}
      </Button>
    </Grid>
  );
}

function Footer() {
  return (
    <div className={styles.Footer}>
      <div className={styles.FooterContent}>
        <Grid container justify="space-between" alignItems="flex-start">
          <Grid item xs={12} sm={12} md={4} className={styles.FooterGrid}>
            <Grid container className={styles.Logos}>
              <Grid item className={styles.LogosLeft}>
                <ImageButton
                  link="https://healthequitytracker.org/"
                  src="/img/logos/HET_logo.png"
                  alt="Health Equity Tracker"
                />
              </Grid>
              <Grid item className={styles.LogosRight}>
                <Grid container justify="flex-start" alignItems="flex-start">
                  <Grid item>
                    <img
                      src="/img/logos/HET_text.png"
                      alt="Health Equity Tracker"
                    />
                    <Grid container justify="flex-start">
                      <Grid item>
                        {/* TODO: Add YouTube URL*/}
                        <ImageButton
                          link="http://www.youtube.com"
                          src="/img/logos/youtube_green.png"
                          alt="YouTube"
                        />
                      </Grid>
                      <Grid item>
                        {/* TODO: Add LinkedIn URL*/}
                        <ImageButton
                          link="http://www.linkedin.com"
                          src="/img/logos/linkedIn_green.png"
                          alt="LinkedIn"
                        />
                      </Grid>
                      <Grid item>
                        {/* TODO: Add Twitter URL*/}
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
              <LinkGridItem text="Explore Data" link={EXPLORE_DATA_PAGE_LINK} />
              <LinkGridItem
                text="Downloads and Methods"
                link={DATA_CATALOG_PAGE_LINK}
              />
              <LinkGridItem text="FAQs" link="" />
              <LinkGridItem text="Contact Us" link="" />
              <LinkGridItem text="Terms of Use" link="" />
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default Footer;
