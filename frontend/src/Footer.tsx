import React from "react";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import styles from "./Footer.module.scss";
import TwitterIcon from "@material-ui/icons/Twitter";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import YouTubeIcon from "@material-ui/icons/YouTube";
import ArrowUpwardRoundedIcon from "@material-ui/icons/ArrowUpwardRounded";
import { Button } from "@material-ui/core";
import {
  TAB_PARAM,
  ABOUT_US_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
  DATA_CATALOG_PAGE_LINK,
  TERMS_OF_SERVICE_PAGE_LINK,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
  ReactRouterLinkButton,
} from "./utils/urlutils";
import { ABOUT_US_CONTACT_TAB_INDEX } from "./pages/AboutUs/AboutUsPage";
import { WIHE_FAQ_TAB_INDEX } from "./pages/WhatIsHealthEquity/WhatIsHealthEquityPage";

function Footer() {
  return (
    <div className={styles.Footer}>
      <Grid container justify="space-between" alignItems="flex-start">
        <Grid item xs={12} sm={12} md={4} className={styles.FooterGrid}>
          <Logos />
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
            justify="space-between"
            alignItems="center"
            spacing={0}
            container
          >
            {[
              ["Explore Data", EXPLORE_DATA_PAGE_LINK],
              ["Downloads and Methods", DATA_CATALOG_PAGE_LINK],
              [
                "FAQs",
                `${WHAT_IS_HEALTH_EQUITY_PAGE_LINK}?${TAB_PARAM}=${WIHE_FAQ_TAB_INDEX}`,
                "Frequently Asked Questions",
              ],
              [
                "Contact Us",
                `${ABOUT_US_PAGE_LINK}?${TAB_PARAM}=${ABOUT_US_CONTACT_TAB_INDEX}`,
              ],
              ["Terms of Use", `${TERMS_OF_SERVICE_PAGE_LINK}`],
            ].map(([label, link, ariaLabel]) => (
              <LinkGridItem
                key={link}
                text={label}
                link={link}
                ariaLabel={ariaLabel}
              />
            ))}
            <Hidden smDown>
              <Grid item sm={12}>
                <span className={styles.CopyrightSpanLargerWindow}>
                  Copyright 2021
                </span>
              </Grid>
            </Hidden>
          </Grid>
        </Grid>

        <Grid
          container
          item
          direction="column"
          md={12}
          lg={1}
          alignItems="center"
          justify="center"
        >
          <Hidden mdUp>
            <Grid item>
              <span className={styles.CopyrightSpanSmallerWindow}>
                Copyright 2021
              </span>
            </Grid>
          </Hidden>
          <ReturnToTop />
        </Grid>
        <Grid item xs={12}>
          <img
            width="216"
            height="60"
            src="img/PartnerSatcher.png"
            alt="Satcher Health Leadership Institute Logo"
          />
        </Grid>
      </Grid>
    </div>
  );
}

function Logos() {
  return (
    <Grid container className={styles.Logos}>
      <Grid item className={styles.LogosLeft}>
        <ReactRouterLinkButton url="/" className={styles.ImageButton}>
          <img
            src="img/appbar/AppbarLogo.png"
            className={styles.FooterLogo}
            alt="Health Equity Tracker logo"
            role="link"
          />
        </ReactRouterLinkButton>
      </Grid>
      <Grid item className={styles.LogosRight}>
        <Grid container justify="flex-start" alignItems="flex-start">
          <Grid item>
            <span className={styles.FooterTitleSpan} aria-hidden="true">
              Health Equity Tracker
            </span>
            <Grid container justify="center">
              <Grid item className={styles.SocialsIcon}>
                <a
                  href="https://www.linkedin.com/in/satcherhealth"
                  aria-label="Satcher Health on LinkedIn"
                >
                  <LinkedInIcon />
                </a>
              </Grid>
              <Grid item className={styles.SocialsIcon}>
                <a
                  href="https://twitter.com/SatcherHealth"
                  aria-label="Satcher Health on Twitter"
                >
                  <TwitterIcon />
                </a>
              </Grid>
              <Grid item className={styles.SocialsIcon}>
                <a
                  href="https://www.youtube.com/channel/UC2sNXCD2KGLdyjqe6FGzMiA"
                  aria-label="Satcher Health on YouTube"
                >
                  <YouTubeIcon />
                </a>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

function LinkGridItem(props: {
  text: string;
  link: string;
  ariaLabel: string;
}) {
  return (
    <>
      <Hidden xsDown>
        <Grid item>
          <ReactRouterLinkButton
            url={props.link}
            className={styles.FooterLink}
            displayName={props.text}
            ariaLabel={props.ariaLabel}
          />
        </Grid>
      </Hidden>
      <Hidden smUp>
        <Grid item xs={12}>
          <ReactRouterLinkButton
            url={props.link}
            className={styles.FooterLink}
            displayName={props.text}
          />
        </Grid>
      </Hidden>
    </>
  );
}

function ReturnToTop() {
  return (
    <Grid item>
      <Button
        aria-label="Scroll to Top"
        onClick={() => window.scrollTo(0, 0)}
        className={styles.ScrollToTopButton}
      >
        <ArrowUpwardRoundedIcon />
      </Button>
    </Grid>
  );
}

export default Footer;
