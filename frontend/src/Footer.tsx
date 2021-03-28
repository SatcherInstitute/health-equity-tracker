import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./Footer.module.scss";
import TwitterIcon from '@material-ui/icons/Twitter';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import YouTubeIcon from '@material-ui/icons/YouTube';
import ArrowUpwardRoundedIcon from '@material-ui/icons/ArrowUpwardRounded';
import {Button} from '@material-ui/core';

function Footer() {
  return (
    <div className={styles.Footer}>

      <Grid container direction="row" className={styles.FooterGrid}>

        <Grid container item direction="column" xs={1}
        alignItems="center"
        justify="center">
          <Grid item>
                <img src="img/updated mark 1.png"
                     className={styles.FooterLogo}
                     alt="Health Equity Tracker decorative logo"/>
          </Grid>
        </Grid>

        <Grid container item direction="column" xs={5}
              alignItems="flex-start"
              justify="center">
          <Grid item>
            <span className={styles.FooterTitleSpan}>Health Equity Tracker</span>
          </Grid>
          <Grid item>
            <div className={styles.SocialsDiv}>
              <a href="https://www.linkedin.com/in/satcherhealth">
                <LinkedInIcon className={styles.SocialsIcon}/>
              </a>
              <a href="https://twitter.com/SatcherHealth">
                <TwitterIcon className={styles.SocialsIcon}/>
              </a>
              <a href="https://www.youtube.com/channel/UC2sNXCD2KGLdyjqe6FGzMiA">
                <YouTubeIcon className={styles.SocialsIcon}/>
              </a>
            </div>
          </Grid>
        </Grid>

        <Grid container item direction="column" xs={5}
              alignItems="flex-end"
              justify="center">
          <Grid item>
            <div className={styles.NavLinkDiv}>
              <a href="/exploredata" className={styles.FooterNavLink}>Explore Data</a>
              <a href="/datadownloads" className={styles.FooterNavLink}>Downloads and Methods</a>
              <a href="/aboutus" className={styles.FooterNavLink}>FAQ</a>
              <a href="/aboutus" className={styles.FooterNavLink}>Contact Us</a>
              <a href="/termsofuse" className={styles.FooterNavLink}>Terms of Use</a>
            </div>
          </Grid>
          <Grid item>
            <span className={styles.CopyrightSpan}>Copyright 2020</span>
          </Grid>
        </Grid>

        <Grid container item direction="column" xs={1}
              alignItems="center"
              justify="center">
          <Button onClick={() => window.scrollTo(0, 0)}
          className={styles.ScrollToTopButton}>
            <ArrowUpwardRoundedIcon />
          </Button>
        </Grid>

      </Grid>
    </div>
  );
}

export default Footer;
